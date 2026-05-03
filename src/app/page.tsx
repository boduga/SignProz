'use client'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white border-b">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">SignProz</span>
          <div className="flex gap-6 items-center">
            <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</a>
            <a href="/login" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign In</a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white py-24">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.16em] text-indigo-200 font-semibold mb-3">Secure eSignature platform</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">Professional agreement workflows for modern teams</h1>
              <p className="text-indigo-100 text-base mt-4 max-w-2xl">SignProz helps you prepare, send, sign, and track agreements at scale while offering partner rewards and API-ready automation.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/signup" className="bg-white text-indigo-800 px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:bg-indigo-50">Start free trial</a>
                <a href="/pricing" className="border border-white/30 bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20">View pricing</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white/10 border border-white/15 p-5">
                <h3 className="font-semibold text-white mb-4">At a glance</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-indigo-200 text-xs">Integrations</p><p className="font-bold text-lg">400+</p></div>
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-indigo-200 text-xs">Affiliate reward</p><p className="font-bold text-lg">20-30%</p></div>
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-indigo-200 text-xs">Sending modes</p><p className="font-bold text-lg">Bulk + SMS</p></div>
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-indigo-200 text-xs">Security</p><p className="font-bold text-lg">HIPAA-ready</p></div>
                </div>
                <p className="text-[11px] text-indigo-100 mt-4">Designed for sales, legal ops, HR, and customer onboarding teams.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20 max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why SignProz?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Document Workspace</h3>
              <p className="text-sm text-slate-600 mt-2">Build, route, and manage agreement packets with reusable templates and signing links.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">AI-Assisted Agreements</h3>
              <p className="text-sm text-slate-600 mt-2">Speed up reviews and drafting with AI assistance for clauses, summaries, and templates.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Recurring Affiliate Rewards</h3>
              <p className="text-sm text-slate-600 mt-2">Earn ongoing commissions with transparent tiering and built-in referral analytics.</p>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: '⚡', title: 'Easy Setup', desc: 'Get started in minutes with intuitive onboarding and guided workflows.' },
                { icon: '🔒', title: 'Secure & Compliant', desc: 'HIPAA-ready infrastructure with end-to-end encryption and audit trails.' },
                { icon: '📊', title: 'Real-time Tracking', desc: 'Monitor document status, delivery confirmations, and signature events live.' },
                { icon: '🔀', title: 'Sequential & Parallel Signing', desc: 'Route documents through multiple signers in any order your process requires.' },
              ].map((f) => (
                <div key={f.title} className="text-center p-6">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              {[
                { step: 1, title: 'Create your document', desc: 'Upload a file or build from a template. Add text fields, signature blocks, and recipient assignments.' },
                { step: 2, title: 'Send for signature', desc: 'Send to one or many signers via email or a shareable signing link. Choose sequential or parallel routing.' },
                { step: 3, title: 'Signers complete their part', desc: 'Signers review and sign on any device. All actions are logged with timestamps and IP addresses.' },
                { step: 4, title: 'Track & manage', desc: 'Monitor real-time status, receive completion notifications, and download signed copies and audit reports.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{s.step}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{s.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-900 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-indigo-200 mb-8 max-w-md mx-auto">Join thousands of teams using SignProz to streamline their agreement workflows.</p>
          <a href="/signup" className="inline-block bg-white text-indigo-800 text-lg px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50">Create Free Account</a>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 text-center text-sm text-gray-500">
          <p>© 2026 SignProz. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-2">
            <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
