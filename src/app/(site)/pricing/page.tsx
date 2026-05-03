export const metadata = {
  title: 'Pricing - SignProz',
  description: 'Choose the SignProz plan that fits your needs.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white border-b">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-blue-600">SignProz</a>
          <div className="flex gap-6 items-center">
            <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</a>
            <a href="/login" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign In</a>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Start free and scale as you grow. No hidden fees, no surprise charges.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Free</h2>
            <p className="text-sm text-slate-500 mt-1">For individuals just getting started</p>
            <div className="mt-6 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$0</span>
              <span className="text-slate-500">/month</span>
            </div>
            <a href="/signup" className="block text-center bg-slate-100 text-slate-900 font-semibold py-3 rounded-xl hover:bg-slate-200">Get started free</a>
            <ul className="mt-8 space-y-3">
              {['5 documents/month', '1 sender', 'Email notifications', 'Basic templates', 'Community support'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-blue-600 p-8 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
            <h2 className="text-xl font-bold text-slate-900">Pro</h2>
            <p className="text-sm text-slate-500 mt-1">For growing teams and professionals</p>
            <div className="mt-6 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$15</span>
              <span className="text-slate-500">/month</span>
              <p className="text-xs text-slate-400 mt-1">Billed annually · $20 monthly</p>
            </div>
            <a href="/signup" className="block text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700">Start free trial</a>
            <ul className="mt-8 space-y-3">
              {['Unlimited documents', '5 senders', 'Sequential & parallel signing', 'AI-assisted drafting', 'Bulk sending', 'Custom branding', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Premium</h2>
            <p className="text-sm text-slate-500 mt-1">For organizations that need it all</p>
            <div className="mt-6 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$40</span>
              <span className="text-slate-500">/month</span>
              <p className="text-xs text-slate-400 mt-1">Billed annually · $49.95 monthly</p>
            </div>
            <a href="/signup" className="block text-center bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-700">Contact sales</a>
            <ul className="mt-8 space-y-3">
              {['Everything in Pro', 'Unlimited senders', 'HIPAA compliance mode', '400+ integrations', 'Sales CRM integration', 'Microsoft 365 integration', 'Dedicated support', 'API access (affordable tiers)'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-12">All plans include end-to-end encryption, audit trails, and 99.9% uptime SLA.</p>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}
