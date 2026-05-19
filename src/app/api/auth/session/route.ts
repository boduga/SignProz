import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('auth'))

  // Check all cookies and look for Supabase session data
  const accessCookie = allCookies.find(c => c.name.includes('auth-token') && !c.name.includes('.v2'))
  const refreshCookie = allCookies.find(c => c.name.includes('auth-token.v2'))

  const supabase = await createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  return NextResponse.json({
    session: session ? { user: session.user.email, expiresAt: session.expires_at } : null,
    error: error ? error.message : null,
    cookies: {
      total: allCookies.length,
      authNames: authCookies.map(c => c.name),
      hasAccessCookie: !!accessCookie,
      hasRefreshCookie: !!refreshCookie,
      allCookieNames: allCookies.map(c => c.name),
    }
  })
}