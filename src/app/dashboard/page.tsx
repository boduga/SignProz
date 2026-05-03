'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'workspace' | 'referrals'

interface Doc {
  id: string
  title: string
  status: string
  created_at: string
}

interface Session {
  session: { user: { email: string; affiliateCode: string } } | null
}

const revenueProjection = {
  year1: { newReferrals: 36, totalReferrals: 36, earnings: 1190, avgMonthly: 99, endMonthly: 186 },
  year2: { newReferrals: 84, totalReferrals: 120, earnings: 8686, avgMonthly: 724, endMonthly: 1012 },
  year3: { newReferrals: 144, totalReferrals: 264, earnings: 30317, avgMonthly: 2526, endMonthly: 3294 },
  total: { referrals: 264, earnings: 40393 },
}

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-700 text-white',
  silver: 'bg-gray-400 text-white',
  gold: 'bg-yellow-400 text-yellow-900',
  platinum: 'bg-indigo-600 text-white',
}

const recentReferrals = [
  { email: 'alex@company.com', plan: 'Pro', earnings: 7.25, status: 'active' },
  { email: 'sam@startup.io', plan: 'Pending invite', earnings: 0, status: 'pending' },
  { email: 'legal@enterprise.co', plan: 'Enterprise', earnings: 124.75, status: 'active' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('workspace')
  const [documents, setDocuments] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ email: string; affiliateCode: string } | null>(null)

  // Workspace state
  const [showNewDocForm, setShowNewDocForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  // Affiliate state
  const [affiliateStats, setAffiliateStats] = useState({ totalReferrals: 0, activeAccounts: 0, expectedPayout: 0, paidOut: 0, tier: 'bronze' })
  const [tier, setTier] = useState('bronze')
  const [stripeConnected, setStripeConnected] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data: Session) => {
        if (!data.session) { router.push('/login'); return }
        setSession(data.session.user)
        fetch('/api/documents')
          .then((r) => r.json())
          .then((d) => { setDocuments(d.documents || []); setLoading(false) })
          .catch(() => setLoading(false))

        // Fetch affiliate stats if endpoint exists
        fetch('/api/affiliate/stats')
          .then((r) => r.ok ? r.json() : null)
          .then((stats) => {
            if (stats) {
              setAffiliateStats(stats)
              setTier(stats.tier || 'bronze')
            }
          })
          .catch(() => {/* use mock data */}
          )
      })
      .catch(() => { router.push('/login') })
  }, [router])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
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

  function copyReferralLink() {
    const link = `${window.location.origin}/?ref=${session?.affiliateCode || ''}`
    navigator.clipboard.writeText(link)
    alert('Referral link copied! Share it to earn 20-30% recurring commissions.')
  }

  const statusBadgeClass = (status: string) => {
    if (status === 'draft') return 'bg-gray-100 text-gray-600'
    if (status === 'sent') return 'bg-blue-100 text-blue-700'
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'partially_signed') return 'bg-amber-100 text-amber-700'
    if (status === 'expired') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center" style={{ height: 64 }}>
        <Link href="/" className="text-xl font-bold text-blue-600">SignProz</Link>
        <nav className="flex gap-4 items-center">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'workspace' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Dashboard
          </button>
          <Link href="/affiliate" className="text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg">
            Affiliate
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg">Sign out</button>
          </form>
        </nav>
      </header>

      {/* Subscriber portal header */}
      <div className="bg-white border-b border-slate-100 px-6 py-3">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Subscriber portal</h2>
              <p className="text-sm text-gray-500">
                Welcome, {session?.email} &middot; Your code:{' '}
                <strong className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">{session?.affiliateCode}</strong>
              </p>
            </div>
          </div>
          {/* Tabs */}
          <nav className="dashboard-tabs mt-3" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'workspace'}
              onClick={() => setActiveTab('workspace')}
              className={`dashboard-tab ${activeTab === 'workspace' ? 'active' : ''}`}
            >
              Document Workspace
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'referrals'}
              onClick={() => setActiveTab('referrals')}
              className={`dashboard-tab ${activeTab === 'referrals' ? 'active' : ''}`}
            >
              Referrals &amp; Rewards
            </button>
          </nav>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left sidebar */}
        <aside className="signproz-sidebar" aria-label="Document management">
          {activeTab === 'workspace' ? (
            <div className="flex flex-col h-full">
              {/* Upload actions */}
              <div className="px-3 pt-4 pb-2">
                <button className="upload-btn w-full mb-2">Upload Document</button>
                <div className="relative">
                  <button className="cloud-dropdown w-full">Get from Cloud</button>
                </div>
              </div>

              {/* Document list */}
              <div className="flex-1 overflow-y-auto px-3">
                <div className="flex justify-between items-center mb-2 mt-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">My Documents</h3>
                  <button
                    onClick={() => setShowNewDocForm(!showNewDocForm)}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium hover:bg-blue-100"
                  >
                    + New
                  </button>
                </div>

                {/* New document form */}
                {showNewDocForm && (
                  <form onSubmit={handleCreate} className="mb-3 bg-white rounded-lg p-2 border border-blue-200">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Document title..."
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-200 focus:border-blue-400 outline-none"
                      autoFocus
                      required
                    />
                    <div className="flex gap-1 mt-1">
                      <button type="submit" disabled={creating} className="flex-1 text-xs bg-blue-600 text-white rounded py-1 font-medium hover:bg-blue-700 disabled:opacity-50">
                        {creating ? 'Creating...' : 'Create'}
                      </button>
                      <button type="button" onClick={() => { setShowNewDocForm(false); setNewTitle('') }} className="text-xs text-gray-500 px-2 py-1">Cancel</button>
                    </div>
                  </form>
                )}

                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>No documents yet.</p>
                    <p className="mt-1 text-xs">Click + New to create one.</p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {documents.map((doc) => (
                      <li key={doc.id}>
                        <Link
                          href={`/dashboard/documents/${doc.id}`}
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <span className="text-gray-400 mt-0.5"><i className="fas fa-file-alt"></i></span>
                          <span className="flex-1 min-w-0">
                            <span className="block truncate font-medium text-gray-800">{doc.title}</span>
                            <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full ${statusBadgeClass(doc.status)}`}>{doc.status.replace('_', ' ')}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Nav items */}
              <div className="border-t border-slate-200 px-3 py-2 space-y-0.5">
                <Link href="/affiliate" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors">
                  <span>📑</span><span>Templates</span>
                </Link>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors w-full text-left">
                  <span>✉️</span><span>Bulk send</span>
                </button>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors w-full text-left">
                  <span>👥</span><span>Team</span>
                </button>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors w-full text-left">
                  <span>💬</span><span>AI Assistant</span><span className="badge-new">NEW</span>
                </button>
              </div>
            </div>
          ) : (
            /* Referrals tab sidebar */
            <div className="px-4 py-6">
              <h3 className="font-bold text-gray-800 text-sm mb-1">Referral Stats</h3>
              <p className="text-xs text-gray-400 mb-4">Updated live from your account</p>
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">{affiliateStats.totalReferrals || 0}</div>
                  <div className="text-xs text-gray-500">Total referrals</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{affiliateStats.activeAccounts || 0}</div>
                  <div className="text-xs text-gray-500">Active (paid)</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">${affiliateStats.expectedPayout?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-gray-500">Expected payout</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">${affiliateStats.paidOut?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-gray-500">Paid out</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between bg-white rounded-xl p-3">
                <span className="text-sm font-medium">Tier:</span>
                <span className={`tier-badge ${tierColors[tier] || tierColors.bronze}`}>{tier}</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 w-full">
          {activeTab === 'workspace' ? (
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="font-bold text-lg text-gray-900">Documents</h3>
                  <button
                    onClick={() => setShowNewDocForm(true)}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100"
                  >
                    <i className="fas fa-plus mr-1"></i> New Document
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📄</p>
                    <p className="text-lg font-medium">No documents yet</p>
                    <p className="text-sm mt-1">Click &ldquo;New Document&rdquo; above to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="dash-doc-row bg-white rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="text-xl text-gray-400" aria-hidden="true"><i className="fas fa-file-alt"></i></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{doc.title}</h4>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(doc.status)}`}>
                                {doc.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-400">Created: {new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <Link href={`/dashboard/documents/${doc.id}`} className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">Edit</Link>
                          <button onClick={() => handleDelete(doc.id)} className="text-sm text-red-500 hover:text-red-700 font-medium">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document actions — placeholder area */}
              <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold mb-3 text-gray-900"><i className="fas fa-file-signature text-blue-600 mr-2"></i>Prepare &amp; send</h3>
                <div className="flex gap-2 mb-4 flex-wrap items-center">
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"><i className="fas fa-plus"></i> Add Signature Field</button>
                  <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Clear Fields</button>
                  <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-700">Finalize Document</button>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl border text-center text-gray-400 text-sm" style={{ backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}>
                  <p>Select a document and click <strong>Edit</strong> to open the document editor.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Referrals panel */
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <p className="text-sm text-gray-600 max-w-xl">Track live referral stats, expected payouts, and a long-range earnings projection.</p>
                <div className="flex gap-2">
                  <button onClick={copyReferralLink} className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-200">
                    <i className="fas fa-link mr-1"></i> Copy Referral Link
                  </button>
                </div>
              </div>

              {/* Referrals grid */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <div className="referral-stats-card rounded-2xl p-6 shadow-sm bg-white border border-gray-100">
                    <h3 className="font-bold text-lg flex items-center gap-2"><i className="fas fa-gift text-purple-600"></i> Referrals &amp; Rewards</h3>
                    <Link href="/affiliate" className="text-blue-600 text-sm underline mb-4 inline-block">View program details →</Link>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-3xl font-bold text-gray-800">{affiliateStats.totalReferrals || 0}</div>
                        <div className="text-xs text-gray-500">Total referrals</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-3xl font-bold text-green-600">{affiliateStats.activeAccounts || 0}</div>
                        <div className="text-xs text-gray-500">Active (paid accounts)</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-3xl font-bold text-blue-600">${affiliateStats.expectedPayout?.toFixed(2) || '0.00'}</div>
                        <div className="text-xs text-gray-500">Expected payout</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-3xl font-bold text-gray-800">${affiliateStats.paidOut?.toFixed(2) || '0.00'}</div>
                        <div className="text-xs text-gray-500">Paid out</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <span className="text-sm font-medium">Tier:</span>
                      <span className={`tier-badge ${tierColors[tier] || tierColors.bronze}`}>{tier}</span>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 text-center">Next payout: 15th of next month · Min. $50</div>
                  </div>
                </div>

                {/* 3-year projection */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold mb-3"><i className="fas fa-chart-line text-blue-600"></i> 3-Year Earnings Projection</h3>
                  <p className="text-xs text-gray-500 mb-3">Based on realistic part-time effort (1-2 hours/week). Assumes 20% commission, upgrading to 30% over time.</p>
                  <table className="w-full text-sm projection-table">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">Year</th>
                        <th className="text-left p-2">New Referrals</th>
                        <th className="text-left p-2">Total</th>
                        <th className="text-left p-2">Earnings</th>
                        <th className="text-left p-2">Avg Monthly</th>
                        <th className="text-left p-2">End Monthly</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 font-medium">Year 1</td>
                        <td className="p-2">{revenueProjection.year1.newReferrals}</td>
                        <td className="p-2">{revenueProjection.year1.totalReferrals}</td>
                        <td className="p-2 text-green-700 font-semibold">${revenueProjection.year1.earnings.toLocaleString()}</td>
                        <td className="p-2">${revenueProjection.year1.avgMonthly}</td>
                        <td className="p-2">${revenueProjection.year1.endMonthly}</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Year 2</td>
                        <td className="p-2">{revenueProjection.year2.newReferrals}</td>
                        <td className="p-2">{revenueProjection.year2.totalReferrals}</td>
                        <td className="p-2 text-green-700 font-semibold">${revenueProjection.year2.earnings.toLocaleString()}</td>
                        <td className="p-2">${revenueProjection.year2.avgMonthly}</td>
                        <td className="p-2">${revenueProjection.year2.endMonthly}</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Year 3</td>
                        <td className="p-2">{revenueProjection.year3.newReferrals}</td>
                        <td className="p-2">{revenueProjection.year3.totalReferrals}</td>
                        <td className="p-2 text-green-700 font-semibold">${revenueProjection.year3.earnings.toLocaleString()}</td>
                        <td className="p-2">${revenueProjection.year3.avgMonthly}</td>
                        <td className="p-2">${revenueProjection.year3.endMonthly}</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="p-2 font-bold">TOTAL</td>
                        <td className="p-2">{revenueProjection.total.referrals}</td>
                        <td className="p-2"></td>
                        <td className="p-2 font-bold text-blue-700">${revenueProjection.total.earnings.toLocaleString()}</td>
                        <td className="p-2"></td>
                        <td className="p-2 font-bold">~${revenueProjection.year3.endMonthly}/mo</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-3 bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-800">
                      <i className="fas fa-info-circle"></i> <strong>Non-aggressive projection:</strong> Part-time effort (1-2 hours/week). Double these numbers with full-time effort (5-10 hours/week). Commissions increase as you tier up to 30%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent referral activity */}
              <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">Recent referral activity</h3>
                <div className="space-y-2">
                  {recentReferrals.map((r, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                      <div>
                        <span className="font-medium">{r.email}</span>
                        <span className="text-gray-400 ml-2">— {r.plan}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                        {r.earnings > 0 && (
                          <span className="text-green-600 font-semibold">+${r.earnings.toFixed(2)}/mo</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}