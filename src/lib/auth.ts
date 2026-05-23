import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Unified session helper that supports both Supabase auth and custom magic link session
export async function getSession() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Check for our custom session cookie first (magic link flow)
  const sessionCookie = allCookies.find(c => c.name === 'sb-session')
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
      // Verify it's not expired
      if (sessionData.expires_at && sessionData.expires_at > Date.now()) {
        return {
          id: sessionData.user.id,
          email: sessionData.user.email,
          user: sessionData.user,
          isCustomSession: true,
        }
      }
    } catch {
      // Fall through to Supabase session check
    }
  }

  // Normal Supabase session check
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  return {
    id: session.user.id,
    email: session.user.email,
    user: session.user,
    isCustomSession: false,
  }
}