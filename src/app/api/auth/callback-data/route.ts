import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = await createServerClient()

  const { data: tokenData, error } = await supabase
    .from('auth_tokens')
    .select('email, user_id')
    .eq('token', token)
    .single()

  if (error || !tokenData) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  return NextResponse.json({ email: tokenData.email, user_id: tokenData.user_id })
}