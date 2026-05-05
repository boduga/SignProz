export const metadata = {
  title: 'Terms of Service - SignProz',
  description: 'SignProz terms of service.',
}

export default function TermsPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-block">← Back to home</a>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 22, 2026</p>
        <div className="text-slate-700 space-y-5 text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
          <p>By accessing or using SignProz, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform.</p>

          <h2 className="text-xl font-semibold text-slate-900">2. Description of Service</h2>
          <p>SignProz provides an electronic signature and document workflow platform. We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice.</p>

          <h2 className="text-xl font-semibold text-slate-900">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us promptly of any unauthorized use.</p>

          <h2 className="text-xl font-semibold text-slate-900">4. Acceptable Use</h2>
          <p>You may not use SignProz to create, send, or store unlawful, defamatory, or infringing content. You are solely responsible for the content of documents you process through the platform and for obtaining all necessary consents from signatories.</p>

          <h2 className="text-xl font-semibold text-slate-900">5. Intellectual Property</h2>
          <p>SignProz retains ownership of its platform, software, and trademarks. You retain ownership of your documents and the content within them. You grant SignProz a limited license to process your documents as necessary to provide the service.</p>

          <h2 className="text-xl font-semibold text-slate-900">6. Payment and Billing</h2>
          <p>Subscription fees are billed according to the plan you selected. All fees are non-refundable except where required by law. We reserve the right to change pricing with 30 days' prior notice.</p>

          <h2 className="text-xl font-semibold text-slate-900">7. Disclaimer of Warranties</h2>
          <p>SignProz is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the platform will meet your specific requirements or be uninterrupted, secure, or error-free.</p>

          <h2 className="text-xl font-semibold text-slate-900">8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, SignProz shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>

          <h2 className="text-xl font-semibold text-slate-900">9. Termination</h2>
          <p>Either party may terminate this agreement at any time. Upon termination, your right to access the platform ceases. Data retention policies apply as described in our Privacy Policy.</p>

          <h2 className="text-xl font-semibold text-slate-900">10. Governing Law</h2>
          <p>These Terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the United States.</p>

          <h2 className="text-xl font-semibold text-slate-900">11. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:legal@signproz.com" className="text-blue-600 hover:underline">legal@signproz.com</a>.</p>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}
