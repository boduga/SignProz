'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Signer {
  id: string
  email: string
  name: string
  order: number
  signed_at: string | null
  status: 'pending' | 'viewed' | 'signed'
}

interface Field {
  id: string
  field_type: string
  signer_id: string | null
  position_x: number
  position_y: number
  width: number
  height: number
  value: string | null
  signed_at: string | null
}

interface Document {
  id: string
  title: string
  status: string
  expiration_days: number | null
  signers: Signer[]
  signature_fields: Field[]
}

type ActiveTab = 'signers' | 'fields'
type SigningMode = 'sequential' | 'parallel'

export default function DocumentEditorPage() {
  const params = useParams()
  const id = params.id as string

  const [activeTab, setActiveTab] = useState<ActiveTab>('signers')
  const [document, setDocument] = useState<Document | null>(null)
  const [signers, setSigners] = useState<Signer[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [addingSigner, setAddingSigner] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signerOrder, setSignerOrder] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [placingFieldType, setPlacingFieldType] = useState<string | null>(null)
  const [activeSignerId, setActiveSignerId] = useState<string | null>(null)
  const [signingMode, setSigningMode] = useState<SigningMode>('sequential')
  const [expirationDays, setExpirationDays] = useState(30)
  const [toast, setToast] = useState<string | null>(null)
  const [apiNotice, setApiNotice] = useState<string | null>(null)

  // Load document, signers, and fields on mount
  useEffect(() => {
    loadDocument()
  }, [id])

  // When signers change, set active signer
  useEffect(() => {
    if (signers.length > 0 && !activeSignerId) {
      setActiveSignerId(signers[0].id)
    }
  }, [signers, activeSignerId])

  function showToast(msg: string, duration = 3000) {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }

  async function loadDocument() {
    setLoading(true)
    setApiNotice(null)

    // Load document
    const docRes = await fetch(`/api/documents/${id}`)
    const docData = await docRes.json()

    if (!docRes.ok || !docData.document) {
      showToast(docData.error || 'Failed to load document')
      setLoading(false)
      return
    }

    const doc = docData.document
    setDocument(doc)
    setNewTitle(doc.title)
    setExpirationDays(doc.expiration_days ?? 30)

    // Load signers via separate endpoint
    const signerRes = await fetch(`/api/documents/${id}/signers`)
    if (signerRes.ok) {
      const signerData = await signerRes.json()
      setSigners(signerData.signers || [])
    } else {
      setSigners(doc.signers || [])
      setApiNotice('Note: Signers API not yet wired — using document data')
    }

    // Load fields via separate endpoint
    const fieldRes = await fetch(`/api/documents/${id}/fields`)
    if (fieldRes.ok) {
      const fieldData = await fieldRes.json()
      setFields(fieldData.fields || [])
    } else {
      setFields(doc.signature_fields || [])
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
      body: JSON.stringify({ email: signerEmail, name: signerName, order: signerOrder }),
    })

    if (res.ok) {
      const data = await res.json()
      setSigners((prev) => [...prev, data.signer])
      setSignerEmail('')
      setSignerName('')
      setSignerOrder((o) => o + 1)
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to add signer')
    }

    setAddingSigner(false)
  }

  async function handleRemoveSigner(signerId: string) {
    if (!confirm('Remove this signer?')) return

    const res = await fetch(`/api/documents/${id}/signers/${signerId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setSigners((prev) => prev.filter((s) => s.id !== signerId))
      setFields((prev) =>
        prev.map((f) => (f.signer_id === signerId ? { ...f, signer_id: null } : f))
      )
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to remove signer')
    }
  }

  async function handleSaveDocument() {
    if (!document) return
    setSaving(true)

    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        expiration_days: expirationDays,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setDocument((prev) => (prev ? { ...prev, title: data.document.title, expiration_days: data.document.expiration_days } : prev))
      showToast('Document saved')
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to save')
    }

    setSaving(false)
  }

  async function handleSendDocument() {
    if (!document) return
    if (signers.length === 0) {
      showToast('Add at least one signer before sending')
      return
    }
    if (!confirm('Send this document to all signers?')) return
    setSending(true)

    const res = await fetch(`/api/documents/${id}/send`, { method: 'POST' })

    if (res.ok) {
      showToast('Document sent to signers')
      loadDocument()
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to send document')
    }

    setSending(false)
  }

  function handlePlaceField(e: React.MouseEvent<HTMLDivElement>) {
    if (!placingFieldType || !activeSignerId) return
    if (document?.status !== 'draft') return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)

    setFields((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        field_type: placingFieldType,
        signer_id: activeSignerId,
        position_x: x,
        position_y: y,
        width: 200,
        height: 60,
        value: null,
        signed_at: null,
      },
    ])

    setPlacingFieldType(null)
  }

  function handleDeleteSelectedField() {
    if (!selectedFieldId) return
    if (!selectedFieldId.startsWith('local-')) {
      // API call needed
      fetch(`/api/documents/${id}/fields/${selectedFieldId}`, { method: 'DELETE' })
        .then((res) => {
          if (res.ok) {
            setFields((prev) => prev.filter((f) => f.id !== selectedFieldId))
          } else {
            showToast('Failed to remove field')
          }
        })
    } else {
      setFields((prev) => prev.filter((f) => f.id !== selectedFieldId))
    }
    setSelectedFieldId(null)
  }

  // Keyboard shortcut for Delete
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFieldId) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        handleDeleteSelectedField()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedFieldId, id])

  const isDraft = document?.status === 'draft'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <span>Loading document...</span>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Document not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const statusBadgeClass =
    document.status === 'draft'
      ? 'bg-gray-100 text-gray-600'
      : document.status === 'sent'
      ? 'bg-blue-100 text-blue-700'
      : document.status === 'completed'
      ? 'bg-green-100 text-green-700'
      : 'bg-amber-100 text-amber-700'

  const signerStatusClass = (status: string) => {
    if (status === 'signed') return 'bg-green-100 text-green-700'
    if (status === 'viewed') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  const fieldTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      signature: 'fa-signature',
      initial: 'fa-font',
      text: 'fa-i-cursor',
      date: 'fa-calendar-alt',
      checkbox: 'fa-check-square',
      radio: 'fa-dot-circle',
      dropdown: 'fa-caret-square-down',
      attachment: 'fa-paperclip',
      name: 'fa-id-card',
      email: 'fa-envelope',
    }
    return icons[type] || 'fa-square'
  }

  const FIELD_COLORS: Record<string, string> = {
    signature: '#3b82f6',
    initial: '#8b5cf6',
    text: '#10b981',
    date: '#f59e0b',
    checkbox: '#06b6d4',
    radio: '#ec4899',
    dropdown: '#f97316',
    attachment: '#84cc16',
    name: '#6366f1',
    email: '#14b8a6',
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          <span aria-hidden="true">&larr;</span> Back
        </Link>

        <div className="w-px h-6 bg-gray-200" />

        {editingTitle && isDraft ? (
          <div className="flex items-center gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-base font-bold outline-none focus:border-blue-400 w-64"
              autoFocus
            />
            <button
              onClick={() => {
                setDocument((prev) => (prev ? { ...prev, title: newTitle } : prev))
                setEditingTitle(false)
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setNewTitle(document.title)
                setEditingTitle(false)
              }}
              className="text-gray-500 px-2 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{document.title}</h1>
            {isDraft && (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadgeClass}`}>
            {document.status}
          </span>
          <button
            onClick={handleSaveDocument}
            disabled={saving}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* API notice */}
      {apiNotice && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs text-amber-700">
          {apiNotice}
        </div>
      )}

      {/* Main editor grid */}
      <main className="editor-grid flex-1 overflow-hidden">
        {/* Left sidebar — Signers & Fields */}
        <aside className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('signers')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'signers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Signers
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'fields'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Fields
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* Signers tab */}
            {activeTab === 'signers' && (
              <div>
                {signers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No signers added yet.</p>
                ) : (
                  <ul className="space-y-1 mb-3">
                    {signers.map((signer) => (
                      <li key={signer.id} className="signer-row group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{signer.name}</p>
                          <p className="text-xs text-gray-400 truncate">{signer.email}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${signerStatusClass(signer.status)}`}>
                            {signer.status}
                          </span>
                        </div>
                        {isDraft && (
                          <button
                            onClick={() => handleRemoveSigner(signer.id)}
                            className="text-red-400 text-xs opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                          >
                            <i className="fas fa-times" aria-hidden="true" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {isDraft && (
                  <form onSubmit={handleAddSigner} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Order (optional)"
                      value={signerOrder}
                      onChange={(e) => setSignerOrder(Number(e.target.value))}
                      min={0}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      disabled={addingSigner}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {addingSigner ? 'Adding...' : 'Add Signer'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Fields tab */}
            {activeTab === 'fields' && (
              <div>
                {/* Field type palette */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Field Types
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['signature', 'initial', 'date', 'text'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          if (!activeSignerId) {
                            showToast('Select a signer first')
                            return
                          }
                          setPlacingFieldType(type)
                        }}
                        className={`field-chip capitalize ${placingFieldType === type ? 'bg-blue-50 border-blue-400 text-blue-700' : ''}`}
                      >
                        <i className={`fas ${fieldTypeIcon(type)} text-xs`} aria-hidden="true" />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active signer selector */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                    Assign to signer
                  </label>
                  <select
                    value={activeSignerId || ''}
                    onChange={(e) => setActiveSignerId(e.target.value || null)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">— Select signer —</option>
                    {signers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Placed fields list */}
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No fields placed yet.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {fields.map((field) => {
                      const signer = signers.find((s) => s.id === field.signer_id)
                      return (
                        <li
                          key={field.id}
                          onClick={() => setSelectedFieldId(field.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                            selectedFieldId === field.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: FIELD_COLORS[field.field_type] || '#6b7280' }}
                            aria-hidden="true"
                          />
                          <span className="flex-1 min-w-0">
                            <span className="capitalize font-medium text-gray-800">
                              {field.field_type.replace('_', ' ')}
                            </span>
                            <br />
                            <span className="text-xs text-gray-400 truncate">
                              {signer ? signer.name : 'Unassigned'}
                            </span>
                          </span>
                          {isDraft && selectedFieldId === field.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSelectedField()
                              }}
                              className="text-red-400 text-xs hover:text-red-600 flex-shrink-0"
                            >
                              <i className="fas fa-trash-alt" aria-hidden="true" />
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* Placing hint */}
                {placingFieldType && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                    Click on the document to place a <strong>{placingFieldType}</strong> field.
                    <button
                      onClick={() => setPlacingFieldType(null)}
                      className="ml-2 text-blue-600 underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Center — Document preview area */}
        <div className="flex flex-col bg-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
            {placingFieldType ? (
              <span className="text-sm text-blue-600 font-medium">
                Click on document to place <strong>{placingFieldType}</strong> field
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                Select a field type from the left panel, then click here to place it.
              </span>
            )}
            {selectedFieldId && isDraft && (
              <button
                onClick={handleDeleteSelectedField}
                className="ml-auto text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1"
              >
                <i className="fas fa-trash-alt mr-1" aria-hidden="true" />
                Delete selected
              </button>
            )}
          </div>

          {/* Document preview */}
          <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
            <div
              className={`relative bg-white shadow-xl rounded overflow-hidden select-none ${
                placingFieldType ? 'cursor-crosshair' : ''
              }`}
              style={{ width: 612, minHeight: 792 }}
              onClick={handlePlaceField}
            >
              {/* Placeholder document content */}
              <div className="p-12 text-gray-400 text-sm">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="mt-6 h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-4/5" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="mt-6 h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                </div>
              </div>

              {/* Rendered fields */}
              {fields.map((field) => {
                const color = FIELD_COLORS[field.field_type] || '#6b7280'
                const isSelected = selectedFieldId === field.id
                return (
                  <div
                    key={field.id}
                    className={`signature-field ${isSelected ? 'selected' : ''}`}
                    style={{
                      left: field.position_x,
                      top: field.position_y,
                      width: field.width,
                      height: field.height,
                      color,
                      borderColor: color,
                      borderStyle: field.value ? 'solid' : 'dashed',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFieldId(field.id)
                    }}
                    title={`${field.field_type} — ${signers.find((s) => s.id === field.signer_id)?.name || 'Unassigned'}`}
                  >
                    <span className="capitalize">{field.field_type.replace('_', ' ')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar — Document settings */}
        <aside className="bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Document Settings
              </h3>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadgeClass}`}>
                {document.status}
              </span>
            </div>

            {/* Expiration days */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Expires in
              </label>
              <select
                value={expirationDays}
                onChange={(e) => setExpirationDays(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                {[7, 14, 30, 60].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </div>

            {/* Signing mode */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Signing order
              </label>
              <div className="space-y-1.5">
                {(['sequential', 'parallel'] as SigningMode[]).map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm"
                    style={{
                      borderColor: signingMode === mode ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: signingMode === mode ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="signingMode"
                      value={mode}
                      checked={signingMode === mode}
                      onChange={() => setSigningMode(mode)}
                      className="accent-blue-600"
                    />
                    <span className="capitalize font-medium text-gray-700">
                      {mode}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {mode === 'sequential' ? 'One at a time' : 'All at once'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Send for signing */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleSendDocument}
                disabled={sending || signers.length === 0 || !isDraft}
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send for Signing'}
              </button>
              {signers.length === 0 && isDraft && (
                <p className="text-xs text-amber-600 mt-1.5 text-center">
                  Add at least one signer first.
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleSaveDocument}
          disabled={saving}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleSendDocument}
          disabled={sending || signers.length === 0 || !isDraft}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send / Preview'}
        </button>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
