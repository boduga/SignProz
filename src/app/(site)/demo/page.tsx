export const metadata = {
  title: 'Features Demo - SignProz',
  description: 'Explore SignProz features: subscriber dashboard, admin backend, document signing, and notifications.',
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white border-b">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-blue-600">SignProz</a>
          <div className="flex gap-6 items-center">
            <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="/demo" className="text-sm text-gray-600 hover:text-gray-900">Demo</a>
            <a href="/login" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign In</a>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 pb-20">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-6 inline-block">← Back to home</Link>

        {/* Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-8 mb-12 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-2">Interactive product tour</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">SignProz feature demo</h1>
          <p className="text-indigo-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            Below is a <strong className="text-white">static walkthrough</strong> of what subscribers and admins see: dashboard &amp; affiliate earnings, a mock admin backend, document signing with audit trail, and send/receipt notifications.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:bg-indigo-50">Try live dashboard</Link>
            <Link href="/templates" className="bg-indigo-500/80 border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-500">Browse templates</Link>
            <Link href="/affiliate" className="bg-indigo-500/80 border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-500">Affiliate program</Link>
          </div>
        </div>

        {/* Subscriber Dashboard */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Subscriber dashboard
          </h2>
          <p className="text-sm text-slate-600 mb-6">Referral code, tier, expected payout, and 3-year projection—mirrors the signed-in experience.</p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-inner">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="font-semibold text-slate-900">demo.user@signproz.com</p>
                <p className="text-xs text-slate-500 mt-1">Plan: <span className="text-green-700 font-medium">Pro</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Your referral code</p>
                <p className="font-mono font-bold text-lg text-blue-700">SF-DEMO01</p>
                <button className="text-xs text-blue-600 mt-1" disabled title="Live on real dashboard">Copy link (live)</button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-800">12</div>
                <div className="text-xs text-slate-500">Total referrals</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-xs text-slate-500">Active (paid)</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-blue-600">$184.20</div>
                <div className="text-xs text-slate-500">Expected payout</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium tier-gold">Gold (25%)</span>
                <div className="text-xs text-slate-500 mt-2">Affiliate tier</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2">Recent referral activity</p>
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 text-sm">
              {[
                { email: 'alex@company.com', status: 'Pro · +$7.25/mo', color: 'text-green-600' },
                { email: 'sam@startup.io', status: 'Pending invite', color: 'text-amber-600' },
                { email: 'legal@enterprise.co', status: 'Enterprise · +$124.75/mo', color: 'text-green-600' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between p-3">
                  <span>{item.email}</span>
                  <span className={`font-medium ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Admin Backend */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            Backend &amp; admin (demo)
          </h2>
          <p className="text-sm text-slate-600 mb-6">Illustrative admin console: user directory, plan overrides, webhook delivery log, and system health.</p>
          <div className="grid lg:grid-cols-12 gap-4">
            {/* Sidebar */}
            <aside className="lg:col-span-3 rounded-xl bg-slate-900 text-slate-200 p-4 text-sm space-y-2">
              <div className="font-bold text-white mb-3">Admin</div>
              <div className="bg-white/10 rounded-lg px-3 py-2 text-white">Overview</div>
              <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">Users &amp; plans</div>
              <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">Documents</div>
              <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">Affiliate payouts</div>
              <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">Webhooks / API</div>
              <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">Audit export</div>
            </aside>
            <div className="lg:col-span-9 space-y-4">
              {/* Metric cards */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs text-emerald-700 font-semibold">API</p>
                  <p className="text-2xl font-bold text-emerald-800">99.98%</p>
                  <p className="text-xs text-emerald-600">30d uptime</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs text-amber-800 font-semibold">Queue</p>
                  <p className="text-2xl font-bold text-amber-900">0</p>
                  <p className="text-xs text-amber-700">Failed jobs</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-blue-800 font-semibold">Storage</p>
                  <p className="text-2xl font-bold text-blue-900">42%</p>
                  <p className="text-xs text-blue-700">Signed PDFs</p>
                </div>
              </div>
              {/* User table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b text-xs font-semibold text-slate-600">Users (sample)</div>
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="p-3">Email</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Docs / mo</th>
                      <th className="p-3">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { email: 'admin@signproz.com', plan: 'Enterprise', docs: 'Unlimited', role: 'Super admin', roleColor: 'text-purple-600' },
                      { email: 'demo.user@signproz.com', plan: 'Pro', docs: '142 / 200', role: 'Member', roleColor: 'text-slate-600' },
                      { email: 'api_integration@partner.com', plan: 'API', docs: '12k calls', role: 'Service', roleColor: 'text-slate-600' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="p-3 font-mono">{row.email}</td>
                        <td className="p-3">{row.plan}</td>
                        <td className="p-3">{row.docs}</td>
                        <td className="p-3"><span className={`font-medium ${row.roleColor}`}>{row.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Webhook log */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">Webhook delivery log</p>
                <ul className="text-xs font-mono space-y-1 text-slate-700">
                  <li><span className="text-green-600">200</span> document.completed → https://api.partner.com/hooks/spz <span className="text-slate-400">124ms</span></li>
                  <li><span className="text-green-600">200</span> signer.viewed → https://api.partner.com/hooks/spz <span className="text-slate-400">98ms</span></li>
                  <li><span className="text-amber-600">429</span> affiliate.payout.scheduled → https://api.partner.com/hooks/spz <span className="text-slate-400">retry 1/5</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Document Signing */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document signing &amp; audit trail
          </h2>
          <p className="text-sm text-slate-600 mb-6">Each field records who signed, when, and IP/device class. Completed packets export with immutable audit log.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Document preview */}
            <div className="rounded-xl border-2 border-dashed border-blue-200 bg-white p-6 min-h-[220px] relative" style={{ backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)', backgroundSize: '8px 8px' }}>
              <p className="text-center text-xs text-slate-400 mb-4">Sample agreement — Signer view</p>
              <div className="absolute left-[18%] top-[38%] -translate-x-1/2 -translate-y-1/2 bg-green-50 border-2 border-green-500 rounded-lg px-3 py-2 text-center text-xs shadow">
                <span className="text-green-700 font-semibold">✓ Signed</span><br />
                <span className="font-serif italic text-sm">Alex Rivera</span>
              </div>
              <div className="absolute right-[22%] top-[55%] translate-x-1/2 border-2 border-dashed border-blue-400 rounded-lg px-3 py-2 text-center text-xs bg-amber-50/90">
                <span className="text-amber-800 font-semibold">Pending</span><br />Legal counsel
              </div>
            </div>
            {/* Audit trail */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Audit trail (excerpt)
              </p>
              <ol className="text-xs space-y-3 border-l-2 border-blue-200 pl-4">
                {[
                  { time: '2026-04-20 09:12', event: 'Document created', detail: 'Owner: demo.user@signproz.com' },
                  { time: '2026-04-20 09:14', event: 'Invite sent to alex@company.com', detail: 'email', detailColor: 'text-blue-600' },
                  { time: '2026-04-20 14:02', event: 'Signer opened link', detail: 'Chrome · US-East', detailColor: 'text-slate-600' },
                  { time: '2026-04-20 14:08', event: 'Field "Employee signature" completed', detail: 'eIDAS-ready hash logged', detailColor: 'text-green-700' },
                  { time: '2026-04-20 14:09', event: 'Certificate of completion generated', detail: '' },
                ].map((entry, i) => (
                  <li key={i}>
                    <span className="text-slate-400">{entry.time}</span> — {entry.event} {entry.detail && <span className={entry.detailColor || 'text-slate-700'}>· {entry.detail}</span>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send &amp; receipt notifications
          </h2>
          <p className="text-sm text-slate-600 mb-6">Email and in-app alerts for every stage: invite, reminder before expiry, viewed, signed, and final PDF receipt to all parties.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Outbox */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Outbox (sent)</p>
              <ul className="text-sm space-y-3">
                {[
                  { icon: 'M5 13l4 4L19 7', iconColor: 'text-teal-600', title: 'Signature requested', detail: 'To: alex@company.com · Apr 20, 9:14 AM' },
                  { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', iconColor: 'text-amber-500', title: 'Reminder: sign before Apr 27', detail: 'To: legal@enterprise.co · Apr 23, 8:00 AM' },
                  { icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', iconColor: 'text-blue-600', title: 'Completed PDF + audit pack', detail: 'To: all signers · Apr 20, 2:10 PM' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <svg className={`w-4 h-4 mt-0.5 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Inbox */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Inbox (received)</p>
              <ul className="text-sm space-y-3">
                {[
                  { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', iconColor: 'text-slate-400', title: 'Receipt: document viewed', detail: 'You were notified when the signer opened the envelope.' },
                  { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', iconColor: 'text-green-600', title: 'Receipt: signature captured', detail: 'Field-level hash stored · SMS optional on Enterprise' },
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', iconColor: 'text-indigo-600', title: 'Security alert', detail: 'New device login · Arlington, VA (acknowledged)' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <svg className={`w-4 h-4 mt-0.5 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-6 text-center">
          <p className="text-slate-800 font-medium mb-4">Ready to use the real signing workspace, API stats, and templates?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-blue-700">Sign in to try</Link>
            <Link href="/dashboard" className="border border-blue-300 text-blue-800 bg-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-50">Open dashboard</Link>
          </div>
          <p className="text-xs text-slate-600 mt-3 max-w-md mx-auto">If you are not signed in, the dashboard will prompt you to log in. Use any email on the demo sign-in screen.</p>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}