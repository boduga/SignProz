import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - SignProz',
  description: 'SignProz terms of service.',
}

export default function TermsPage() {
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

      <main className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-block">← Back to home</Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 22, 2026</p>
        <div className="text-slate-700 space-y-8 text-base leading-relaxed">
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Acceptance of Terms</h2><p>By accessing or using SignProz, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Description of Service</h2><p>SignProz provides an electronic signature and document workflow platform. We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. User Accounts</h2><p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us promptly of any unauthorized use.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Acceptable Use</h2><p>You may not use SignProz to create, send, or store unlawful, defamatory, or infringing content. You are solely responsible for the content of documents you process through the platform and for obtaining all necessary consents from signatories.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Intellectual Property</h2><p>SignProz retains ownership of its platform, software, and trademarks. You retain ownership of your documents and the content within them. You grant SignProz a limited license to process your documents as necessary to provide the service.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Payment and Billing</h2><p>Subscription fees are billed according to the plan you selected. All fees are non-refundable except where required by law. We reserve the right to change pricing with 30 days&apos; prior notice.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Disclaimer of Warranties</h2><p>SignProz is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee that the platform will meet your specific requirements or be uninterrupted, secure, or error-free.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">8. Limitation of Liability</h2><p>To the fullest extent permitted by law, SignProz shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">9. Termination</h2><p>Either party may terminate this agreement at any time. Upon termination, your right to access the platform ceases. Data retention policies apply as described in our Privacy Policy.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">10. Governing Law</h2><p>These Terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the United States.</p></section>
          <section><h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">11. Contact</h2><p>Questions about these terms? Contact us at <a href="mailto:legal@signproz.com" className="text-blue-600 hover:underline">legal@signproz.com</a>.</p></section>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-gray-500 flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
          <div>© 2026 SignProz Inc. | Earn 20-30% recurring affiliate commissions</div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 items-center" aria-label="Footer">
            <Link href="/affiliate" className="text-blue-600 font-medium hover:text-blue-800">Affiliate program</Link>
            <Link href="/demo" className="text-blue-600 font-medium hover:text-blue-800">Demo</Link>
            <span className="hidden sm:inline text-gray-300" aria-hidden="true">|</span>
            <Link href="/about" className="hover:text-blue-600">About Us</Link>
            <Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600">Terms &amp; Conditions</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
