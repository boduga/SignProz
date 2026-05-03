'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Signer {
  id: string
  email: string
  name: string
  signed_at: string | null
  status: string
}

interface Field {
  id: string
  field_type: string
  position_x: number
  position_y: number
  signer_id: string
  value: string | null
  signed_at: string | null
}

interface AuditLog {
  id: string
  action: string
  details: string
  created_at: string
}

interface Document {
  id: string
  title: string
  status: string
  signers: Signer[]
  fields: Field[]
  audit_logs: AuditLog[]
}

export default function DocumentEditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  // Add signer state
  const [signerEmail, setSignerEmail] = useState('')
  const [signerName, setSignerName] = useState('')
  const [addingSigner, setAddingSigner] = useState(false)

  // Add field state
  const [fieldType, setFieldType] = useState('signature')
  const [fieldSignerId, setFieldSignerId] = useState('')
  const [posX, setPosX] = useState(100)
  const [posY, setPosY] = useState(100)
  const [addingField, setAddingField] = useState(false)

  // Editing title
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.session) { router.push('/login'); return }
        loadDocument()
      })
      .catch(() => router.push('/login'))
  }, [router, id])

  async function loadDocument() {
    const res = await fetch(`/api/documents/${id}`)
    const data = await res.json()
    if (res.ok && data.document) {
      setDocument(data.document)
      setNewTitle(data.document.title)
    }
    setLoading(false)
  }

  async function handleAddSigner(e: React.FormEvent) {
    e.preventDefault()
    if (!signerEmail.trim() || !signerName.trim()) return
    setAddingSigner(true)
    const res = await fetch(`/api/documents/${id}/signers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signerEmail, name: signerName }),
    })
    if (res.ok) {
      setSignerEmail('')
      setSignerName('')
      loadDocument()
    }
    setAddingSigner(false)
  }

  async function handleDeleteSigner(signerId: string) {
    if (!confirm('Remove this signer?')) return
    await fetch(`/api/documents/${id}/signers/${signerId}`, { method: 'DELETE' })
    loadDocument()
  }

  async function handleAddField(e: React.FormEvent) {
    e.preventDefault()
    if (!fieldSignerId) return
    setAddingField(true)
    const res = await fetch(`/api/documents/${id}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field_type: fieldType, position_x: posX, position_y: posY, signer_id: fieldSignerId }),
    })
    if (res.ok) {
      setPosX(100)
      setPosY(100)
      loadDocument()
    }
    setAddingField(false)
  }

  async function handleDeleteField(fieldId: string) {
    if (!confirm('Remove this field?')) return
    await fetch(`/api/documents/${id}/fields/${fieldId}`, { method: 'DELETE' })
    loadDocument()
  }

  async function handleUpdateTitle() {
    if (!newTitle.trim() || !document) return
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    if (res.ok) {
      setDocument({ ...document, title: newTitle })
    }
    setEditingTitle(false)
  }

  async function handleSend() {
    if (!document || !confirm('Send this document to all signers?')) return
    const res = await fetch(`/api/documents/${id}/send`, { method: 'POST' })
    if (res.ok) loadDocument()
  }

  const isDraft = document?.status === 'draft'
  const canSend = isDraft && (document?.signers.length ?? 0) > 0 && (document?.fields.every(f => f.signer_id) ?? false)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  if (!document) return <div className="min-h-screen flex items-center justify-center text-red-500">Document not found</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">← Back</Link>
          {editingTitle && isDraft ? (
            <div className="flex gap-2">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-lg font-bold outline-none focus:border-blue-400" autoFocus />
              <button onClick={handleUpdateTitle} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
              <button onClick={() => { setEditingTitle(false); setNewTitle(document.title) }} className="text-gray-500 px-3 py-1 text-sm">Cancel</button>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-900">{document.title}</h1>
          )}
          {isDraft && !editingTitle && (
            <button onClick={() => setEditingTitle(true)} className="text-sm text-blue-600 hover:underline ml-2">Edit</button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            document.status === 'draft' ? 'bg-gray-100 text-gray-600' :
            document.status === 'sent' ? 'bg-blue-100 text-blue-700' :
            document.status === 'completed' ? 'bg-green-100 text-green-700' :
            'bg-amber-100 text-amber-700'
          }`}>{document.status}</span>
          {canSend && <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Send Document</button>}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signers Section */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Signers</h2>
          {document.signers.length === 0 ? (
            <p className="text-gray-400 text-sm mb-4">No signers added yet.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {document.signers.map((signer) => (
                <li key={signer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{signer.name}</p>
                    <p className="text-xs text-gray-500">{signer.email}</p>
                    <p className={`text-xs mt-1 ${signer.signed_at ? 'text-green-600' : 'text-gray-400'}`}>
                      {signer.signed_at ? 'Signed' : 'Pending'}
                    </p>
                  </div>
                  {isDraft && (
                    <button onClick={() => handleDeleteSigner(signer.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {isDraft && (
            <form onSubmit={handleAddSigner} className="flex flex-col gap-2">
              <input type="text" placeholder="Name" value={signerName} onChange={(e) => setSignerName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" required />
              <input type="email" placeholder="Email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" required />
              <button type="submit" disabled={addingSigner}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {addingSigner ? 'Adding...' : 'Add Signer'}
              </button>
            </form>
          )}
        </div>

        {/* Fields Section */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Signature Fields</h2>
          {document.fields.length === 0 ? (
            <p className="text-gray-400 text-sm mb-4">No fields added yet.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {document.fields.map((field) => {
                const signer = document.signers.find(s => s.id === field.signer_id)
                return (
                  <li key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{field.field_type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">For: {signer?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400">Pos: ({field.position_x}, {field.position_y})</p>
                    </div>
                    {isDraft && (
                      <button onClick={() => handleDeleteField(field.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          {isDraft && (
            <form onSubmit={handleAddField} className="flex flex-col gap-2">
              <select value={fieldType} onChange={(e) => setFieldType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                <option value="signature">Signature</option>
                <option value="initial">Initial</option>
                <option value="date">Date</option>
                <option value="name">Name</option>
              </select>
              <select value={fieldSignerId} onChange={(e) => setFieldSignerId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" required>
                <option value="">Select signer...</option>
                {document.signers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="number" placeholder="X" value={posX} onChange={(e) => setPosX(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-1/2 outline-none focus:border-blue-400" />
                <input type="number" placeholder="Y" value={posY} onChange={(e) => setPosY(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-1/2 outline-none focus:border-blue-400" />
              </div>
              <button type="submit" disabled={addingField}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {addingField ? 'Adding...' : 'Add Field'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Audit Log */}
      {document.audit_logs.length > 0 && (
        <div className="max-w-5xl mx-auto p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Audit Log</h2>
          <div className="bg-white rounded-xl p-5 shadow">
            <ul className="space-y-2">
              {document.audit_logs.map((log) => (
                <li key={log.id} className="text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-0">
                  <span className="font-medium">{log.action}</span> — {log.details}
                  <span className="text-gray-400 ml-2">{new Date(log.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}