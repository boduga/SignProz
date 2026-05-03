export const metadata = {
  title: 'About - SignProz',
  description: 'Learn about SignProz, the modern eSignature platform.',
}

export default function AboutPage() {
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
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About SignProz</h1>
        <div className="text-slate-700 space-y-5 text-base leading-relaxed">
          <p>SignProz is a modern eSignature platform built for teams and individuals who need to prepare, send, sign, and track agreements at scale. We believe signing agreements should be fast, secure, and hassle-free.</p>
          <p>Our platform combines a powerful document workspace with AI-assisted drafting, real-time tracking, sequential and parallel signing workflows, and an affiliate program that rewards our partners for every customer they refer.</p>
          <p>Whether you are in sales, legal operations, HR, or customer onboarding, SignProz gives you the tools to move faster, stay compliant, and keep every stakeholder informed.</p>
          <h2 className="text-xl font-semibold text-slate-900 pt-4">Our values</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Simplicity</strong> — Getting started takes minutes, not days.</li>
            <li><strong>Security</strong> — Enterprise-grade encryption and HIPAA-ready infrastructure.</li>
            <li><strong>Transparency</strong> — Clear pricing, honest feature comparisons, and no surprise charges.</li>
            <li><strong>Partnership</strong> — We grow together with our affiliates and customers.</li>
          </ul>
          <h2 className="text-xl font-semibold text-slate-900 pt-4">Contact</h2>
          <p>Have questions? Reach out at <a href="mailto:support@signproz.com" className="text-blue-600 hover:underline">support@signproz.com</a> or visit our <a href="/help" className="text-blue-600 hover:underline">help center</a>.</p>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}
