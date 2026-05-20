import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const supabaseAdmin = createAdminClient()

    // Look up token
    const { data: tokenData, error } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Expired token' }, { status: 400 })
    }

    // Get user ID
    let userId = tokenData.user_id

    if (!userId) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find(u => u.email === tokenData.email)

      if (existingUser) {
        userId = existingUser.id
      } else {
        const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: tokenData.email,
          email_confirm: true,
        })

        if (signUpError) {
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }

        userId = authData.user?.id
      }

      if (userId) {
        await supabase
          .from('auth_tokens')
          .update({ user_id: userId })
          .eq('token', token)
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user details
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (!userData?.user) {
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
    }

    const user = userData.user

    // Mark token as used
    await supabase
      .from('auth_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    // Create access token JWT
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      iss: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      aal: 'aal1',
      authenticity: 'high',
    }

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const signature = await createHmacSignature(base64Payload, secret)

    const jwtHeader = { alg: 'HS256', typ: 'JWT' }
    const base64Header = Buffer.from(JSON.stringify(jwtHeader)).toString('base64url')
    const accessToken = `${base64Header}.${base64Payload}.${signature}`

    // Create refresh token
    const refreshToken = `${user.id}${Date.now()}${Math.random().toString(36).slice(2)}`
    const refreshTokenBase64 = Buffer.from(JSON.stringify({
      id: refreshToken,
      user_id: user.id,
      created_at: new Date().toISOString(),
    })).toString('base64url')

    const refreshSignature = await createHmacSignature(refreshTokenBase64, secret)
    const fullRefreshToken = `${refreshTokenBase64}.${refreshSignature}`

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: fullRefreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('Magic session error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function createHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return Buffer.from(signature).toString('base64url')
}