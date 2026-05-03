'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Modal } from './Modal'

export type SignatureType = 'typed' | 'drawn'

export interface SignatureData {
  type: SignatureType
  value: string // for typed: the text; for drawn: base64 data URL
}

export interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SignatureData) => void
  signerName?: string
  signerEmail?: string
}

type Tab = 'type' | 'draw'

export function SignatureModal({ isOpen, onClose, onSave, signerName, signerEmail }: SignatureModalProps) {
  const [tab, setTab] = useState<Tab>('type')
  const [typedValue, setTypedValue] = useState('')

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  // Initialize canvas on mount / tab switch
  useEffect(() => {
    if (tab !== 'draw' || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Drawing style
    ctx.strokeStyle = '#1e3a8a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [tab])

  const getPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  useEffect(() => {
    if (tab !== 'draw') return
    const canvas = canvasRef.current
    if (!canvas) return

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      drawingRef.current = true
      lastPosRef.current = getPos(e)
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!drawingRef.current || !lastPosRef.current) return
      const ctx = canvas.getContext('2d')!
      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastPosRef.current = pos
    }
    const onEnd = () => { drawingRef.current = false; lastPosRef.current = null }

    canvas.addEventListener('mousedown', onStart)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onEnd)
    canvas.addEventListener('mouseleave', onEnd)
    canvas.addEventListener('touchstart', onStart, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })
    canvas.addEventListener('touchend', onEnd)

    return () => {
      canvas.removeEventListener('mousedown', onStart)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onEnd)
      canvas.removeEventListener('mouseleave', onEnd)
      canvas.removeEventListener('touchstart', onStart)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onEnd)
    }
  }, [tab])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  const clearTyped = () => setTypedValue('')

  const handleSave = () => {
    if (tab === 'typed') {
      if (!typedValue.trim()) return
      onSave({ type: 'typed', value: typedValue.trim() })
    } else {
      const canvas = canvasRef.current
      if (!canvas) return
      onSave({ type: 'drawn', value: canvas.toDataURL('image/png') })
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Field" maxWidth="max-w-md">
      {signerName && (
        <p className="text-sm text-slate-600 mb-4">
          Signer: <span className="font-semibold">{signerName}</span>
          {signerEmail && <span className="text-slate-400"> ({signerEmail})</span>}
        </p>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-4 gap-3">
        <button
          onClick={() => setTab('type')}
          className={`py-2 text-sm font-medium ${tab === 'type' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Type
        </button>
        <button
          onClick={() => setTab('draw')}
          className={`py-2 text-sm font-medium ${tab === 'draw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Draw
        </button>
      </div>

      {/* Type panel */}
      {tab === 'type' && (
        <div>
          <input
            type="text"
            value={typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            placeholder="Full name"
            className="w-full border border-slate-200 rounded-xl p-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            style={{ fontFamily: "'Caveat', cursive" }}
          />
          {typedValue && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-400 mb-1">Preview</p>
              <p className="text-3xl text-blue-800" style={{ fontFamily: "'Caveat', cursive" }}>
                {typedValue}
              </p>
            </div>
          )}
          <button onClick={clearTyped} className="mt-3 w-full bg-gray-100 text-slate-600 py-2 rounded-xl hover:bg-gray-200 text-sm">
            Clear
          </button>
        </div>
      )}

      {/* Draw panel */}
      {tab === 'draw' && (
        <div>
          <canvas
            ref={canvasRef}
            className="w-full h-40 border-2 border-slate-200 rounded-xl cursor-crosshair bg-white"
          />
          <div className="flex gap-2 mt-3">
            <button onClick={clearCanvas} className="bg-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-300">
              Clear Canvas
            </button>
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Save Drawing
            </button>
          </div>
        </div>
      )}

      {/* Save button for typed */}
      {tab === 'type' && (
        <button
          onClick={handleSave}
          disabled={!typedValue.trim()}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Signature
        </button>
      )}
    </Modal>
  )
}
