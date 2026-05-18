import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('auth'))

  console.log('[session debug] All cookies:', allCookies.map(c => c.name))
  console.log('[session debug] Auth cookies:', authCookies.map(c => c.name))

  const supabase = await createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  console.log('[session debug] getSession result:', { session: session ? 'EXISTS' : 'NULL', error })

  if (error || !session) {
    return NextResponse.json({ session: null, user: null })
  }

  return NextResponse.json({ session, user: session.user })
}