import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()
  const { data: referrals, error } = await supabase
    .from('affiliate_referrals')
    .select('*')
    .eq('referrer_id', session.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const totalReferrals = referrals?.length ?? 0
  const activeAccounts = referrals?.filter((r: { status: string }) => r.status === 'active').length ?? 0

  // Tier thresholds
  let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  let commission: number

  if (totalReferrals >= 50) {
    tier = 'Platinum'
    commission = 30
  } else if (totalReferrals >= 15) {
    tier = 'Gold'
    commission = 25
  } else if (totalReferrals >= 5) {
    tier = 'Silver'
    commission = 22
  } else {
    tier = 'Bronze'
    commission = 20
  }

  const expectedPayout = activeAccounts * (commission / 100)

  return NextResponse.json({
    totalReferrals,
    activeAccounts,
    tier,
    commission,
    expectedPayout,
    referrals: referrals ?? [],
  })
}