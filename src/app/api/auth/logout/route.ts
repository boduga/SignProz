import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()

  // Clear our custom session cookie
  const response = NextResponse.json({ message: 'Logged out successfully' })
  response.cookies.set('sb-session', '', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('auth-success', '', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}