'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useParams } from 'next/navigation'

function SignPageContent() {
  const params = useParams()
  const documentId = params.documentId as string
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    setError('')

    const formData = new FormData(e.target as HTMLFormElement)
    const fields = [
      { fieldId: 'fullName', value: formData.get('fullName') },
      { fieldId: 'signature', value: formData.get('signature') },
    ]

    const res = await fetch(`/api/documents/${documentId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, fields }),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Signing failed')
    }
    setSubmitting(false)
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
        <p className="text-red-600">Missing signing token.</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
        <div className="text-5xl mb-4 text-green-500">&#10003;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Signed!</h1>
        <p className="text-gray-600">Thank you for signing.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <span className="text-lg font-semibold text-blue-600">SignProz</span>
      </header>
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign Document</h2>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSign} className="space-y-4">
            <div className="border rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input name="fullName" type="text" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
                placeholder="Your full legal name" />
            </div>
            <div className="border rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Signature *</label>
              <input name="signature" type="text" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 font-serif text-xl"
                placeholder="Sign by typing your name" />
              <p className="text-xs text-gray-400 mt-1">This constitutes your legal signature.</p>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Sign Document'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function SignPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SignPageContent />
    </Suspense>
  )
}
