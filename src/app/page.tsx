'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AiFaqModal } from '@/components/modals'

const keyFeatures = [
  'Document Workspace',
  'Recurring Affiliate Rewards (20-30%)',
  'Custom Branding',
  'Signing Links',
  'HIPAA Compliance',
  '400+ Integrations',
  'AI-Assisted Agreements',
  'SMS Delivery',
  'Native PDF Editing',
  'Microsoft 365 Integration',
  'Mobile App',
  'Sales CRM Integration',
  'Interactive Pricing Tables',
  'Payments',
  'Bulk Sending',
  'Workflow Automation',
  'Affordable API',
]

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const RobotIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ScaleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
)

const LayerIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const ChatIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const CommentIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

export default function HomePage() {
  const [faqOpen, setFaqOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
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
            <Link href="/login" className="text-gray-700 text-sm font-medium">Sign In</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm shadow hover:bg-blue-700">Start Free</Link>
          </div>
        </nav>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Hero Section */}
          <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-[0.16em] text-indigo-200 font-semibold mb-3">Secure eSignature platform</p>
                <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ lineHeight: '48px', maxHeight: '96px', overflow: 'hidden' }}>Professional agreement workflows for modern teams</h1>
                <p className="text-indigo-100 text-sm sm:text-base mt-4 max-w-2xl">SignProz helps you prepare, send, sign, and track agreements at scale while offering partner rewards and API-ready automation.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/signup" className="bg-white text-indigo-800 px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:bg-indigo-50">Start free trial</Link>
                  <Link href="/pricing" className="border border-white/30 bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20">View pricing</Link>
                  <Link href="/templates" className="border border-white/30 bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20">Explore templates</Link>
                  <button type="button" onClick={() => setFaqOpen(true)} className="border border-cyan-200/60 bg-cyan-400/20 text-cyan-50 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-cyan-400/30">AI FAQ Chat</button>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-white/10 border border-white/15 p-5">
                  <h3 className="font-semibold text-white mb-4">At a glance</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-indigo-200 text-xs">Integrations</p>
                      <p className="font-bold text-lg">400+</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-indigo-200 text-xs">Affiliate reward</p>
                      <p className="font-bold text-lg">20-30%</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-indigo-200 text-xs">Sending modes</p>
                      <p className="font-bold text-lg">Bulk + SMS</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-indigo-200 text-xs">Security</p>
                      <p className="font-bold text-lg">HIPAA-ready</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-100 mt-4">Designed for sales, legal operations, HR, and customer onboarding teams.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3 Feature Cards */}
          <section className="mt-10 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileIcon />
              </div>
              <h3 className="font-bold text-slate-900 mt-3">Document Workspace</h3>
              <p className="text-sm text-slate-600 mt-1">Build, route, and manage agreement packets with reusable templates and signing links.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <RobotIcon />
              </div>
              <h3 className="font-bold text-slate-900 mt-3">AI-Assisted Agreements</h3>
              <p className="text-sm text-slate-600 mt-1">Speed up reviews and drafting with AI assistance for clauses, summaries, and templates.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <DollarIcon />
              </div>
              <h3 className="font-bold text-slate-900 mt-3">Recurring Affiliate Rewards</h3>
              <p className="text-sm text-slate-600 mt-1">Earn ongoing commissions with transparent tiering and built-in referral analytics.</p>
            </div>
          </section>

          {/* Feature Comparison Table */}
          <section className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                <span className="text-indigo-600 mr-2"><ScaleIcon /></span>
                SignProz vs Popular eSignature Platforms
              </h2>
              <span className="text-xs text-slate-500">Feature and pricing comparison (high-level)</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="p-3 text-left font-semibold">Platform</th>
                    <th className="p-3 text-left font-semibold">Entry pricing</th>
                    <th className="p-3 text-left font-semibold">AI assistance</th>
                    <th className="p-3 text-left font-semibold">Integrations</th>
                    <th className="p-3 text-left font-semibold">API access</th>
                    <th className="p-3 text-left font-semibold">Affiliate rewards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-blue-50/50">
                    <td className="p-3 font-semibold text-blue-800">SignProz</td>
                    <td className="p-3">$10/mo annual Pro ($20 monthly) · Premium $39.95/mo annual</td>
                    <td className="p-3">Built-in AI agreement review + AI template generation</td>
                    <td className="p-3">400+ + Microsoft 365 + CRM</td>
                    <td className="p-3">Affordable API tiers</td>
                    <td className="p-3 text-emerald-700 font-semibold">20-30% recurring</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">DocuSign</td>
                    <td className="p-3">Generally higher SMB entry plans</td>
                    <td className="p-3">Available in selected plans/add-ons</td>
                    <td className="p-3">Broad enterprise ecosystem</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">Not core positioning</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Dropbox Sign (HelloSign)</td>
                    <td className="p-3">Mid-market monthly tiers</td>
                    <td className="p-3">Limited AI-first positioning</td>
                    <td className="p-3">Strong SMB integrations</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">Not standard</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Adobe Acrobat Sign</td>
                    <td className="p-3">Enterprise-oriented pricing</td>
                    <td className="p-3">Adobe AI capabilities in broader suite</td>
                    <td className="p-3">Adobe + Microsoft ecosystem</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">Not standard</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">PandaDoc</td>
                    <td className="p-3">Document workflow focused tiers</td>
                    <td className="p-3">Template/content automation features</td>
                    <td className="p-3">Sales-focused integrations</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">Partner program varies</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">SignNow</td>
                    <td className="p-3">Competitive SMB pricing bands</td>
                    <td className="p-3">Automation-centric, lighter AI focus</td>
                    <td className="p-3">Business app connectors</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">Not core positioning</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Note: competitor details are directional and can vary by edition, region, and contract terms.</p>
          </section>

          {/* Key Features Grid */}
          <section className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                <span className="text-indigo-600 mr-2"><LayerIcon /></span>
                Key Features
              </h2>
              <span className="text-xs text-slate-500">Production-ready capabilities</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keyFeatures.map((f) => (
                <span key={f} className="feature-pill">
                  <CheckIcon />
                  {f}
                </span>
              ))}
            </div>
          </section>

          {/* AI FAQ Section */}
          <section className="mt-10 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  <span className="text-indigo-600 mr-2"><ChatIcon /></span>
                  AI Assisted Chatbot FAQ
                </h3>
                <p className="text-sm text-slate-600 max-w-2xl">Get quick, practical answers about integrations, compliance, API usage, pricing, and signing workflows.</p>
              </div>
              <button type="button" onClick={() => setFaqOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">Open AI FAQ</button>
            </div>
          </section>
        </div>

        {/* AI FAQ Floating Bubble */}
        <button type="button" onClick={() => setFaqOpen(true)} className="home-faq-bubble">
          <span className="mr-1"><CommentIcon /></span>
          AI FAQ
        </button>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p>© 2026 SignProz. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-2">
          <Link href="/privacy" className="hover:text-slate-700">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-700">Terms of Service</Link>
        </div>
      </footer>
      <AiFaqModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
    </div>
  )
}