'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.session) { router.push('/login'); return }
        fetch('/api/documents')
          .then((r) => r.json())
          .then((d) => { setDocuments(d.documents || []); setLoading(false) })
          .catch(() => setLoading(false))
      })
      .catch(() => { router.push('/login') })
  }, [router])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const data = await res.json()
    if (res.ok && data.document) {
      router.push(`/dashboard/documents/${data.document.id}`)
    } else {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">SignProz</h1>
        <nav className="flex gap-4 items-center">
          <Link href="/" className="text-sm text-gray-600">Home</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
          </form>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
        </div>

        {/* New document form */}
        <form onSubmit={handleCreate} className="mb-8 bg-white rounded-xl p-4 shadow flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            required
          />
          <button type="submit" disabled={creating}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
            {creating ? 'Creating...' : '+ New Document'}
          </button>
        </form>

        {documents.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow">
            <p className="text-lg mb-2">No documents yet</p>
            <p className="text-sm">Create your first document above to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      doc.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      doc.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                      doc.status === 'partially_signed' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{doc.status}</span>
                    <span className="text-xs text-gray-400">Created: {new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/dashboard/documents/${doc.id}`} className="text-blue-600 text-sm font-medium hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(doc.id)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}