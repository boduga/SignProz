import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { token, email, otpCode } = await request.json()

    if (!token || !email || !otpCode) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verify the original token is valid and not expired
    const { data: tokenData, error } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single()

    if (error || !tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Expired token' }, { status: 400 })
    }

    // Mark token as used
    await supabase
      .from('auth_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    const supabaseAdmin = createAdminClient()

    // Verify OTP
    const { data, error: verifyError } = await supabaseAdmin.auth.admin.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    })

    if (verifyError) {
      console.error('OTP verification error:', verifyError)
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}