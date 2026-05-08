import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const token = url.searchParams.get('token')

  if (token) {
    // Custom magic link flow (via Resend)
    const supabase = await createServerClient()

    // Look up token
    const { data: tokenData, error } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !tokenData) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/login?error=expired_token', request.url))
    }

    // Check if already used
    if (tokenData.used_at) {
      return NextResponse.redirect(new URL('/login?error=token_used', request.url))
    }

    // Mark token as used
    await supabase
      .from('auth_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    // Create user if doesn't exist
    let userId = tokenData.user_id
    if (!userId) {
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: tokenData.email,
        email_confirm: true,
      })

      if (signUpError) {
        console.error('User creation error:', signUpError)
        return NextResponse.redirect(new URL('/login?error=creation_failed', request.url))
      }

      userId = authData.user?.id

      // Update token with user_id
      if (userId) {
        await supabase
          .from('auth_tokens')
          .update({ user_id: userId })
          .eq('token', token)
      }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (code) {
    // Supabase native magic link flow
    const supabase = await createServerClient()
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // No code or token, redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}
