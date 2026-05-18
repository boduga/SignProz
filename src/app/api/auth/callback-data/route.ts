import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const supabaseAdmin = createAdminClient()

  // Get token data
  const { data: tokenData, error: tokenError } = await supabase
    .from('auth_tokens')
    .select('email, user_id')
    .eq('token', token)
    .single()

  if (tokenError || !tokenData) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  // Find user by email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users.find(u => u.email === tokenData.email)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Return email for client to use with signInWithOtp
  return NextResponse.json({
    email: tokenData.email,
    user_id: user.id
  })
}