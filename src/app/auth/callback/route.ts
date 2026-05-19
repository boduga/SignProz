import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
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
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
  }

  // Check if expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/login?error=expired_token', request.url))
  }

  // Find or create user
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
        console.error('User creation error:', signUpError)
        return NextResponse.redirect(new URL('/login?error=creation_failed', request.url))
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
    return NextResponse.redirect(new URL('/login?error=user_not_found', request.url))
  }

  // Fetch user details
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (!userData?.user) {
    console.error('Could not fetch user:', userId)
    return NextResponse.redirect(new URL('/login?error=user_error', request.url))
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

  // Calculate cookie names from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const urlMatch = supabaseUrl.match(/:\/\/([^.]+)/)
  const projectRef = urlMatch ? urlMatch[1] : 'sign-proz-bay'
  const authTokenKey = `sb-${projectRef}-auth-token`
  const authTokenKeyV2 = `sb-${projectRef}-auth-token.v2`

  // Build dashboard URL with session data in query params
  const dashboardUrl = new URL('/dashboard', request.url)
  dashboardUrl.searchParams.set('access_token', accessToken)
  dashboardUrl.searchParams.set('refresh_token', fullRefreshToken)

  // Use 307 redirect with Set-Cookie headers
  const response = NextResponse.redirect(dashboardUrl, 307)

  // Set cookies with explicit headers (bypass Next.js cookie handling)
  response.headers.set('Set-Cookie',
    `${authTokenKey}=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`
  )
  response.headers.append('Set-Cookie',
    `${authTokenKeyV2}=${fullRefreshToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
  )

  return response
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