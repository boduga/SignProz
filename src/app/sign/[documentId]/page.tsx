'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPen, faFont, faPaintbrush, faClock, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { Caveat } from 'next/font/google'

const caveat = Caveat({ subsets: ['latin'] })

type SignatureMode = 'type' | 'draw'

interface SignatureField {
  id: string
  field_type: string
  signer_id: string
  position_x: number
  position_y: number
  width: number
  height: number
  filled_value?: string | null
  required?: boolean
  label?: string
}

interface Signer {
  id: string
  name: string
  email: string
  order: number
  signed_at?: string | null
  viewed_at?: string | null
}

interface Document {
  id: string
  title: string
  content: string
  status: string
  signature_fields: SignatureField[]
  signers: Signer[]
}

type SignState = 'loading' | 'ready' | 'already_signed' | 'completed' | 'sequential_wait' | 'error'

function SignPageContent() {
  const params = useParams()
  const documentId = params.documentId as string
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<SignState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [document, setDocument] = useState<Document | null>(null)
  const [signer, setSigner] = useState<Signer | null>(null)

  // Signature inputs
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('type')
  const [typedName, setTypedName] = useState('')
  const [drawnSignature, setDrawnSignature] = useState('')
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Field values map: fieldId -> value
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  // Fetch document data
  useEffect(() => {
    if (!token || !documentId) return

    async function fetchData() {
      try {
        const res = await fetch(`/api/sign/${documentId}?token=${encodeURIComponent(token!)}`)
        const data = await res.json()

        if (!res.ok) {
          if (res.status === 401) setState('error')
          else if (res.status === 410) setState('error')
          else setState('error')
          setErrorMsg(data.error || 'Failed to load document')
          return
        }

        setDocument(data.document)
        setSigner(data.signer)

        // Check already signed
        if (data.signer.signed_at) {
          setState('already_signed')
          return
        }

        // Check document completed
        if (data.document.status === 'completed') {
          setState('completed')
          return
        }

        // Check sequential signing order: find first unsigned signer in order
        const signers = data.document.signers || []
        const sortedSigners = [...signers].sort((a: Signer, b: Signer) => a.order - b.order)
        const currentSigner = signers.find((s: Signer) => s.id === data.signer.id) as Signer | undefined
        const firstUnsigned = sortedSigners.find((s: Signer) => !s.signed_at)

        if (firstUnsigned && firstUnsigned.id !== currentSigner?.id) {
          setState('sequential_wait')
          return
        }

        setState('ready')
      } catch {
        setState('error')
        setErrorMsg('Failed to load document')
      }
    }

    fetchData()
  }, [token, documentId])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#1e40af'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    isDrawing.current = true
    const pos = getCanvasPos(e)
    lastPos.current = pos
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const pos = getCanvasPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  function endDraw() {
    isDrawing.current = false
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function saveDrawing() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setDrawnSignature(dataUrl)
    // Apply to active field if any
    if (activeFieldId) {
      setFieldValues(prev => ({ ...prev, [activeFieldId]: dataUrl }))
    }
  }

  function handleTypedChange(value: string) {
    setTypedName(value)
    if (activeFieldId) {
      setFieldValues(prev => ({ ...prev, [activeFieldId]: value }))
    }
  }

  // Progress tracking
  const myFields = document?.signature_fields?.filter(f => f.signer_id === signer?.id) || []
  const completedFields = myFields.filter(f => fieldValues[f.id])
  const progress = myFields.length > 0 ? `${completedFields.length} of ${myFields.length} fields completed` : ''

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    // Build fields array from fieldValues
    const fields = Object.entries(fieldValues).map(([fieldId, value]) => ({
      fieldId,
      value,
    }))

    // If there's a signature field without a value, use typedName or drawnSignature
    const sigField = myFields.find(f => f.field_type === 'signature')
    if (sigField && !fieldValues[sigField.id]) {
      const val = signatureMode === 'draw' ? drawnSignature : typedName
      if (val) {
        fields.push({ fieldId: sigField.id, value: val })
      }
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, fields }),
      })

      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
      } else {
        setErrorMsg(data.error || 'Signing failed')
      }
    } catch {
      setErrorMsg('Signing failed. Please try again.')
    }
    setSubmitting(false)
  }

  async function handleResend() {
    if (!signer) return
    setResending(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/signers/${signer.id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setResendSuccess(true)
      }
    } catch { /* ignore */ }
    setResending(false)
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-10 text-center shadow-xl max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCheck} className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Signed!</h1>
          <p className="text-gray-600">
            Thank you for signing <strong>{document?.title}</strong>.
            {document?.status === 'completed' ? ' The document is now complete.' : ' You will receive a confirmation email.'}
          </p>
        </div>
      </div>
    )
  }

  // Token missing
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <div className="text-5xl mb-4 text-red-500">&#128274;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Missing Signing Link</h1>
          <p className="text-gray-600">This signing link is incomplete. Please use the link from your email.</p>
        </div>
      </div>
    )
  }

  // Loading
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
          </div>
          <p className="mt-4 text-gray-500">Loading document...</p>
        </div>
      </div>
    )
  }

  // Already signed
  if (state === 'already_signed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCheck} className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Signed</h1>
          <p className="text-gray-600">You have already signed this document. Thank you!</p>
        </div>
      </div>
    )
  }

  // Completed
  if (state === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCheck} className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Completed</h1>
          <p className="text-gray-600">This document has already been fully signed by all parties.</p>
        </div>
      </div>
    )
  }

  // Sequential wait
  if (state === 'sequential_wait') {
    const signers = document?.signers || []
    const sortedSigners = [...signers].sort((a: Signer, b: Signer) => a.order - b.order)
    const firstUnsigned = sortedSigners.find(s => !s.signed_at)

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faClock} className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Previous Signer</h1>
          <p className="text-gray-600 mb-4">
            This document requires sequential signing.{' '}
            {firstUnsigned ? <strong>{firstUnsigned.name || firstUnsigned.email}</strong> : 'The previous signer'}{' '}
            must sign before you can proceed.
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            {resending ? 'Sending...' : "Didn't receive the link? Send again"}
          </button>
          {resendSuccess && (
            <p className="text-green-600 text-sm mt-2">Link resent successfully!</p>
          )}
        </div>
      </div>
    )
  }

  // Error
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <div className="text-5xl mb-4 text-red-500">&#9888;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Document</h1>
          <p className="text-gray-600 mb-4">{errorMsg || 'This link may be invalid or expired.'}</p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            {resending ? 'Sending...' : "Didn't receive the link? Send again"}
          </button>
          {resendSuccess && (
            <p className="text-green-600 text-sm mt-2">Link resent successfully!</p>
          )}
        </div>
      </div>
    )
  }

  // Main signing form
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-600">SignProz</span>
          <div className="text-sm text-gray-500">
            {document?.title && <span className="font-medium text-gray-700">{document.title}</span>}
            <span className="mx-2">|</span>
            <span>Signing as <strong>{signer?.name || signer?.email}</strong></span>
          </div>
        </div>
        {/* Progress bar */}
        {progress && (
          <div className="max-w-5xl mx-auto mt-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${myFields.length > 0 ? (completedFields.length / myFields.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{progress}</span>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document preview with field overlays */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faPen} className="text-blue-600" />
                {document?.title || 'Document'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {signer?.name || signer?.email} &mdash; Review and sign below
              </p>
            </div>
            {/* Document content area */}
            <div className="relative bg-gray-50 overflow-auto max-h-[70vh]">
              <div
                className="p-8 text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: document?.content || '' }}
                style={{ minHeight: 400 }}
              />
              {/* Field overlays - positioned on top of document */}
              {myFields.map(field => {
                const isActive = activeFieldId === field.id
                const hasValue = !!fieldValues[field.id]
                return (
                  <div
                    key={field.id}
                    onClick={() => setActiveFieldId(field.id)}
                    className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-150 flex flex-col items-center justify-center text-xs font-medium select-none ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/80 shadow-md z-10'
                        : hasValue
                        ? 'border-green-400 bg-green-50/60'
                        : 'border-dashed border-amber-400 bg-amber-50/40'
                    }`}
                    style={{
                      left: `${field.position_x}px`,
                      top: `${field.position_y}px`,
                      width: `${field.width}px`,
                      height: `${field.height}px`,
                    }}
                  >
                    {hasValue ? (
                      fieldValues[field.id]?.startsWith('data:image') ? (
                        <img src={fieldValues[field.id]} alt="Signature" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className={`text-blue-800 text-center px-1 truncate ${caveat.className}`} style={{ fontSize: '1.1rem' }}>
                          {fieldValues[field.id]}
                        </span>
                      )
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={field.field_type === 'signature' ? faPen : faFont}
                          className={`text-xs mb-0.5 ${isActive ? 'text-blue-600' : 'text-amber-500'}`}
                        />
                        <span className={isActive ? 'text-blue-700' : 'text-amber-600'}>
                          {field.field_type}
                        </span>
                        <span className="text-amber-500 mt-0.5">Required</span>
                      </>
                    )}
                    {hasValue && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Signature panel */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h2 className="font-semibold text-gray-900">Your Signature</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Active field: <strong>{activeFieldId ? myFields.find(f => f.id === activeFieldId)?.field_type : 'None selected'}</strong>
                {activeFieldId ? ' — click on the document to change' : ' — click a field on the document'}
              </p>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSign} className="p-6 space-y-5">
              {/* Signature tabs */}
              <div>
                <div className="flex border-b mb-4">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('type')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      signatureMode === 'type'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={faFont} />
                    Type
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('draw')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      signatureMode === 'draw'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={faPaintbrush} />
                    Draw
                  </button>
                </div>

                {/* Type signature */}
                {signatureMode === 'type' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type your full legal name
                    </label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={e => handleTypedChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                      placeholder="John Smith"
                    />
                    {typedName && (
                      <div className={`mt-3 p-4 bg-slate-50 rounded-xl border border-gray-200 text-center ${caveat.className}`}>
                        <p className="text-blue-800 italic" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
                          {typedName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Preview of your signature</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Draw signature */}
                {signatureMode === 'draw' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Draw your signature
                    </label>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl cursor-crosshair bg-white touch-none"
                      style={{ maxWidth: '100%' }}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={saveDrawing}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Save Drawing
                      </button>
                    </div>
                    {drawnSignature && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                        <img src={drawnSignature} alt="Saved signature" className="max-h-16 mx-auto" />
                        <p className="text-xs text-gray-400 mt-1">Saved signature</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={e => setTypedName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  placeholder="Enter your full legal name"
                  required
                />
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  required
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="agree" className="text-sm text-gray-600">
                  I agree that my electronic signature is the legal equivalent of my manual signature on this document.
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || myFields.length === 0 ? false : completedFields.length < myFields.length}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Sign Document'
                )}
              </button>

              {/* Resend link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {resending ? 'Sending...' : "Didn't receive the link?"}
                </button>
                {resendSuccess && (
                  <p className="text-green-600 text-xs mt-1">Link sent successfully!</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
          </div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <SignPageContent />
    </Suspense>
  )
}
