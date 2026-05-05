export const metadata = {
  title: 'Privacy Policy - SignProz',
  description: 'SignProz privacy policy.',
}

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 22, 2026</p>
        <div className="text-slate-700 space-y-5 text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-slate-900">1. Information We Collect</h2>
          <p>SignProz collects information you provide directly, including your name, email address, and organization details when you create an account. We also collect document content you upload and metadata about your signing activities.</p>

          <h2 className="text-xl font-semibold text-slate-900">2. How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, process transactions, send you relevant notifications, and ensure platform security. We never sell your personal data to third parties.</p>

          <h2 className="text-xl font-semibold text-slate-900">3. Data Security</h2>
          <p>SignProz uses end-to-end encryption, role-based access controls, and audit logging to protect your data. Our infrastructure is designed to meet HIPAA requirements for healthcare-related use cases.</p>

          <h2 className="text-xl font-semibold text-slate-900">4. Cookies</h2>
          <p>We use cookies and similar technologies to maintain sessions, remember your preferences, and analyze platform usage. You can manage your cookie preferences in your account settings.</p>

          <h2 className="text-xl font-semibold text-slate-900">5. Third-Party Services</h2>
          <p>SignProz integrates with third-party services such as cloud storage providers, CRM platforms, and payment processors. Each third party has its own privacy policy governing their use of your data.</p>

          <h2 className="text-xl font-semibold text-slate-900">6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:privacy@signproz.com" className="text-blue-600 hover:underline">privacy@signproz.com</a> to exercise these rights.</p>

          <h2 className="text-xl font-semibold text-slate-900">7. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Any material changes will be communicated via email or a notice on the platform prior to their effective date.</p>

          <h2 className="text-xl font-semibold text-slate-900">8. Contact</h2>
          <p>For privacy-related questions, contact our Data Protection Officer at <a href="mailto:privacy@signproz.com" className="text-blue-600 hover:underline">privacy@signproz.com</a>.</p>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}
