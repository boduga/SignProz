import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Debug: log all cookies
  console.log('[session] All cookies received:', allCookies.map(c => c.name))

  // Check for our custom session cookie first
  const sessionCookie = allCookies.find(c => c.name === 'sb-session')
  const authSuccessCookie = allCookies.find(c => c.name === 'auth-success')

  console.log('[session] sb-session cookie found:', !!sessionCookie)
  console.log('[session] auth-success cookie found:', !!authSuccessCookie)

  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
      console.log('[session] Parsed session data:', sessionData)
      return NextResponse.json({
        session: {
          access_token: sessionData.access_token,
          expires_at: sessionData.expires_at,
          user: sessionData.user,
        },
        user: sessionData.user,
      })
    } catch (err) {
      console.error('[session] Failed to parse session cookie:', err)
    }
  }

  // Normal Supabase session check
  const supabase = await createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  console.log('[session] Supabase session:', session ? 'EXISTS' : 'NULL', error)

  if (error || !session) {
    return NextResponse.json({ session: null, user: null })
  }

  return NextResponse.json({ session, user: session.user })
}