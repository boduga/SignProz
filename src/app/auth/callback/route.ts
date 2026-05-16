import { NextRequest, NextResponse } from 'next/server'
import { createBrowserClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const token = url.searchParams.get('token')

  if (token) {
    // Redirect to client component for token-based auth
    const redirectUrl = new URL('/auth/callback-client', request.url)
    redirectUrl.searchParams.set('token', token)
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    // Supabase native magic link flow
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Code exchange error:', error)
      return NextResponse.redirect(new URL('/login?error=code_failed', request.url))
    }

    if (data.session) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url))

      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: data.session.expires_in,
        path: '/',
      })

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.redirect(new URL('/login', request.url))
}