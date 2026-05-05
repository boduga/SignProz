import type { Metadata } from 'next'
import Link from 'next/link'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing - SignProz',
  description: 'Choose the SignProz plan that fits your needs.',
}

export default function PricingPage() {
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

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Start free and scale as you grow. No hidden fees, no surprise charges.</p>
        </div>

        <PricingClient />

        <p className="text-center text-sm text-slate-500 mt-12">All plans include end-to-end encryption, audit trails, and 99.9% uptime SLA.</p>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}
