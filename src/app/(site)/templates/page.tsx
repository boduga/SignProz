'use client'

import Link from 'next/link'

const templates = [
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Standard mutual NDA for business relationships. Protects confidential information shared between parties.',
    icon: (
      <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    href: '/dashboard/documents/new?template=nda',
  },
  {
    id: 'sales',
    name: 'Sales Contract',
    description: 'Formal sales agreement for goods or services. Includes payment terms, delivery schedule, and liability clauses.',
    icon: (
      <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/dashboard/documents/new?template=sales',
  },
  {
    id: 'service',
    name: 'Service Agreement',
    description: 'Professional services contract outlining scope, deliverables, timelines, and payment for freelance or consulting work.',
    icon: (
      <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    href: '/dashboard/documents/new?template=service',
  },
]

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-9 h-9 rounded-xl flex items-center justify-center shadow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight"><span className="text-blue-600">Sign</span><span className="text-indigo-600">Proz</span></span>
            </Link>
            <Link href="/affiliate" className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200 font-medium">Affiliate Program</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Home</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Pricing</Link>
            <Link href="/templates" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Templates</Link>
            <Link href="/login" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Sign In</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Start Free</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Document Templates</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Ready-to-use templates for common agreements. Start with a template and customize for your needs.</p>
        </div>

        {/* Template grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl w-fit">{t.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t.name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{t.description}</p>
              <Link
                href={t.href}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-full font-medium text-sm hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Use template
              </Link>
            </div>
          ))}
        </div>

        {/* More templates callout */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-8 py-6">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-600">
              Need more templates?{' '}
              <Link href="/signup" className="text-blue-600 font-medium hover:underline">Upgrade to Pro</Link>{' '}
              to access 100+ templates including employment contracts, lease agreements, and more.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}