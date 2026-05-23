'use client'

import { useState } from 'react'
import { Modal } from './Modal'

export interface AffiliateModalProps {
  isOpen: boolean
  onClose: () => void
  referralCode?: string
  totalReferrals?: number
  activePaid?: number
  expectedPayout?: number
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
}

const REVENUE_PROJECTION = {
  year1: { newReferrals: 36, totalReferrals: 36, earnings: 1190, avgMonthly: 99, endMonthly: 186 },
  year2: { newReferrals: 84, totalReferrals: 120, earnings: 8686, avgMonthly: 724, endMonthly: 1012 },
  year3: { newReferrals: 144, totalReferrals: 264, earnings: 30317, avgMonthly: 2526, endMonthly: 3294 },
  total: { referrals: 264, earnings: 40193 },
}

const TIERS = [
  { name: 'Bronze', range: '0-4 referrals', commission: '20%', color: 'tier-bronze', bg: 'bg-amber-50', border: 'border-amber-200' },
  { name: 'Silver', range: '5-14 referrals', commission: '22%', color: 'tier-silver', bg: 'bg-gray-50', border: 'border-gray-200' },
  { name: 'Gold', range: '15-49 referrals', commission: '25%', color: 'tier-gold', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { name: 'Platinum', range: '50+ referrals', commission: '30%', color: 'tier-platinum', bg: 'bg-gray-100', border: 'border-gray-300' },
]

export function AffiliateModal({
  isOpen,
  onClose,
  referralCode = 'SP-AFFILIATE',
  totalReferrals = 0,
  activePaid = 0,
  expectedPayout = 0,
  tier = 'Bronze',
}: AffiliateModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentTierInfo = TIERS.find((t) => t.name === tier) || TIERS[0]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Affiliate Dashboard" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Earn banner */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm text-gray-700">
            Earn <strong className="text-blue-700">20-30% recurring commission</strong> for every customer you refer who upgrades to a paid SignProz plan. No cap, lifetime earnings.
          </p>
        </div>

        {/* Referral code */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Your referral code</p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 font-mono text-lg font-bold text-slate-800">{referralCode}</code>
            <button
              onClick={handleCopy}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Current tier */}
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-600">Current tier:</p>
          <span className={`tier-badge ${currentTierInfo.color}`}>{tier}</span>
          <span className="text-sm text-green-600 font-medium">{currentTierInfo.commission} commission</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Referrals', value: totalReferrals },
            { label: 'Active Paid', value: activePaid },
            { label: 'Expected Payout', value: `$${expectedPayout.toFixed(2)}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tiers */}
        <div>
          <h4 className="font-bold text-base text-slate-800 mb-3">Affiliate Tiers</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIERS.map((t) => (
              <div key={t.name} className={`${t.bg} p-3 rounded-lg text-center border ${t.border}`}>
                <div className={`w-10 h-10 rounded-full tier-badge ${t.color} mx-auto flex items-center justify-center font-bold mb-1`}>
                  {t.name[0]}
                </div>
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-slate-500">{t.range}</p>
                <p className="text-xs text-green-600 font-medium">{t.commission} commission</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3-year projection */}
        <div>
          <h4 className="font-bold text-base text-slate-800 mb-3">3-Year Revenue Projection</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4 text-left text-xs text-slate-500 font-medium">Year</th>
                  <th className="py-2 pr-4 text-left text-xs text-slate-500 font-medium">New Referrals</th>
                  <th className="py-2 pr-4 text-left text-xs text-slate-500 font-medium">Total Referrals</th>
                  <th className="py-2 pr-4 text-left text-xs text-slate-500 font-medium">Avg Monthly</th>
                  <th className="py-2 pr-4 text-left text-xs text-slate-500 font-medium">End Monthly</th>
                  <th className="py-2 text-left text-xs text-slate-500 font-medium">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { year: 'Year 1', ...REVENUE_PROJECTION.year1 },
                  { year: 'Year 2', ...REVENUE_PROJECTION.year2 },
                  { year: 'Year 3', ...REVENUE_PROJECTION.year3 },
                ].map((row) => (
                  <tr key={row.year} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{row.year}</td>
                    <td className="py-2 pr-4">{row.newReferrals}</td>
                    <td className="py-2 pr-4">{row.totalReferrals}</td>
                    <td className="py-2 pr-4 text-green-700 font-medium">${row.avgMonthly}</td>
                    <td className="py-2 pr-4 text-green-700 font-medium">${row.endMonthly}</td>
                    <td className="py-2 text-green-700 font-semibold">${row.earnings.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="py-2 pr-4 font-bold text-slate-800" colSpan={2}>Total (3 Years)</td>
                  <td className="py-2 pr-4 font-bold text-slate-800">{REVENUE_PROJECTION.total.referrals}</td>
                  <td className="py-2 pr-4" />
                  <td className="py-2 pr-4" />
                  <td className="py-2 font-bold text-green-700">${REVENUE_PROJECTION.total.earnings.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout schedule */}
        <div>
          <h4 className="font-bold text-base text-slate-800 mb-2">Payout Schedule</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Payouts issued monthly on the 15th</li>
            <li>Minimum payout: $50 (accumulates until threshold met)</li>
            <li>Payment methods: PayPal, Stripe, or Bank Transfer</li>
            <li>Real-time tracking in your affiliate dashboard</li>
          </ul>
        </div>

        <a
          href="/affiliate"
          onClick={onClose}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-xl font-semibold text-sm hover:bg-blue-700"
        >
          Learn more
        </a>
      </div>
    </Modal>
  )
}
