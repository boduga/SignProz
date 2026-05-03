import Link from 'next/link'

export const metadata = {
  title: 'Affiliate Program - SignProz',
  description: 'Earn 20-30% recurring commission by referring customers to SignProz.',
}

const revenueProjection = {
  year1: { newReferrals: 36, totalReferrals: 36, earnings: 1728, avgMonthly: 144, endMonthly: 240 },
  year2: { newReferrals: 48, totalReferrals: 84, earnings: 3744, avgMonthly: 312, endMonthly: 420 },
  year3: { newReferrals: 60, totalReferrals: 144, earnings: 7200, avgMonthly: 600, endMonthly: 720 },
  total: { referrals: 144, earnings: 12672 },
}

const tiers = [
  { name: 'Bronze', commission: '20%', referrals: '0–4 referrals', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { name: 'Silver', commission: '22%', referrals: '5–14 referrals', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  { name: 'Gold', commission: '25%', referrals: '15–49 referrals', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  { name: 'Platinum', commission: '30%', referrals: '50+ referrals', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
]

export default function AffiliatePage() {
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
        {/* Back link */}
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-8 inline-block">← Back to home</Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">SignProz Affiliate Program</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Share SignProz. Earn recurring commissions when referrals upgrade.</p>
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl inline-block max-w-2xl">
            <p className="text-blue-800 font-medium">Earn <span className="font-bold text-blue-600">20–30% recurring commission</span> for every customer you refer. No cap, lifetime earnings.</p>
          </div>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h4l3 9 4-18 3 9h4" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', title: 'Share your unique referral link' },
              { step: 2, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', title: 'Friend signs up & upgrades to Pro/Enterprise' },
              { step: 3, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', title: 'You earn 20–30% monthly recurring commission' },
            ].map((item) => (
              <div key={item.step} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center relative pt-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{item.step}</div>
                <div className="mb-4 flex justify-center text-blue-500 text-3xl">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <p className="font-medium text-slate-700">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Affiliate Tiers */}
        <section className="mb-20">
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900">Affiliate Tiers</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div key={tier.name} className={`p-6 rounded-xl border-2 text-center transition-transform hover:scale-105 ${tier.bg} ${tier.text} ${tier.border}`}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Tier</div>
                <h3 className="text-2xl font-black mb-2">{tier.name}</h3>
                <p className="text-sm font-medium mb-1">{tier.referrals}</p>
                <p className="text-3xl font-bold">{tier.commission}</p>
                <p className="text-[10px] mt-2 opacity-80 uppercase tracking-tighter">Commission</p>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue Projection */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900">3-Year Revenue Projection</h2>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl mb-6 text-center lg:text-left">Illustrative earnings based on part-time effort (about 1–2 hours per week), with <strong className="text-slate-800">36 / 84 / 144</strong> new paid referrals in years 1–3, 20% base commission rising toward 30% as you tier up. Figures are modeled, not a guarantee—your results depend on audience and effort.</p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm projection-table min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3 font-semibold text-slate-700">Year</th>
                  <th className="p-3 font-semibold text-slate-700">New referrals</th>
                  <th className="p-3 font-semibold text-slate-700">Cumulative referrals</th>
                  <th className="p-3 font-semibold text-slate-700">Projected earnings</th>
                  <th className="p-3 font-semibold text-slate-700">Avg / month</th>
                  <th className="p-3 font-semibold text-slate-700">Run-rate (end of year)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Year 1', ...revenueProjection.year1 },
                  { label: 'Year 2', ...revenueProjection.year2 },
                  { label: 'Year 3', ...revenueProjection.year3 },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-slate-100">
                    <td className="p-3 font-medium">{row.label}</td>
                    <td className="p-3">{row.newReferrals}</td>
                    <td className="p-3">{row.totalReferrals}</td>
                    <td className="p-3 text-green-700 font-semibold">${row.earnings.toLocaleString()}</td>
                    <td className="p-3">${row.avgMonthly}</td>
                    <td className="p-3">${row.endMonthly}/mo</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 border-t border-blue-100">
                  <td className="p-3 font-bold text-slate-900">3-year total</td>
                  <td className="p-3">—</td>
                  <td className="p-3 font-bold">{revenueProjection.total.referrals}</td>
                  <td className="p-3 font-bold text-blue-800">${revenueProjection.total.earnings.toLocaleString()}</td>
                  <td className="p-3">—</td>
                  <td className="p-3 font-bold text-blue-800">~${revenueProjection.year3.endMonthly}/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-8">
          <Link href="/signup" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-blue-700">
            Get your referral link
          </Link>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2026 SignProz. All rights reserved.</p>
      </footer>
    </div>
  )
}