import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Check for our custom session cookie first
  const sessionCookie = allCookies.find(c => c.name === 'sb-session')
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
      return NextResponse.json({
        session: {
          access_token: sessionData.access_token,
          expires_at: sessionData.expires_at,
          user: sessionData.user,
        },
        user: sessionData.user,
      })
    } catch {
      // Invalid session cookie, continue to normal session check
    }
  }

  // Normal Supabase session check
  const supabase = await createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return NextResponse.json({ session: null, user: null })
  }

  return NextResponse.json({ session, user: session.user })
}