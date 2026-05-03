'use client'

import { useState } from 'react'
import { Modal } from './Modal'

export interface AiAgreementModalProps {
  isOpen: boolean
  onClose: () => void
}

interface AnalysisResult {
  summary: string
  riskLevel: 'low' | 'medium' | 'high'
  keyClauses: string[]
  recommendations: string[]
}

export function AiAgreementModal({ isOpen, onClose }: AiAgreementModalProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY)

  const analyzeAgreement = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/agreement-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`Analysis failed (${res.status})`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setText('')
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Agreement Analysis" maxWidth="max-w-4xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Agreement or clause text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste NDA, MSA, offer letter, or policy language here..."
            className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[140px] focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none resize-none"
          />
        </div>

        {!hasApiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm text-amber-800">
              AI analysis requires <code className="bg-amber-100 px-1 rounded text-xs">ANTHROPIC_API_KEY</code> to be configured. Built-in heuristic analysis is available above.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={analyzeAgreement}
            disabled={loading || !text.trim()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
          {loading && (
            <span className="text-sm text-slate-500 animate-pulse">Processing agreement text...</span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
            {/* Risk level */}
            {result.riskLevel && (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  result.riskLevel === 'low' ? 'ai-chip ai-chip-ok' :
                  result.riskLevel === 'medium' ? 'ai-chip ai-chip-warn' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            )}

            {result.summary && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Summary</h4>
                <p className="text-sm text-slate-600 mt-1">{result.summary}</p>
              </div>
            )}

            {result.keyClauses?.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Key Clauses</h4>
                <ul className="mt-1 ml-4 list-disc text-sm text-slate-600 space-y-1">
                  {result.keyClauses.map((clause, i) => (
                    <li key={i}>{clause}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations?.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Recommendations</h4>
                <ul className="mt-1 ml-4 list-disc text-sm text-slate-600 space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 min-h-[120px] flex items-center justify-center">
            <p className="text-sm text-slate-400">Results will appear here after you run analysis.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
