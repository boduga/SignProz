import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendAuthMagicLinkEmail } from '@/lib/email/sendAuthMagicLink'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Generate a magic token
    const magicToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

    // Store token in auth_tokens table
    const { error: tokenError } = await supabase
      .from('auth_tokens')
      .insert({
        token: magicToken,
        email,
        type: 'login',
        expires_at: expiresAt,
      })

    if (tokenError) {
      console.error('Token storage error:', tokenError)
      return Response.json({ error: 'Failed to create magic link' }, { status: 500 })
    }

    // Build magic URL pointing to our callback with the token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://sign-proz-bay.vercel.app'
    const magicUrl = `${appUrl}/auth/callback?token=${magicToken}`

    // Send magic link via Resend
    await sendAuthMagicLinkEmail(email, magicUrl, 'login')

    return NextResponse.json({
      message: 'Check your email for the sign in link.',
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
