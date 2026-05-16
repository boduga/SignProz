import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const token = url.searchParams.get('token')

  if (token) {
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

    // Check if already used
    if (tokenData.used_at) {
      return NextResponse.redirect(new URL('/login?error=token_used', request.url))
    }

    // Find or create user
    let userId = tokenData.user_id

    // Check if user already exists
    if (!userId) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find(u => u.email === tokenData.email)

      if (existingUser) {
        userId = existingUser.id
      }
    }

    // Create new user if doesn't exist
    if (!userId) {
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: tokenData.email,
        email_confirm: true,
      })

      if (signUpError) {
        // User might already exist
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find(u => u.email === tokenData.email)
        if (existingUser) {
          userId = existingUser.id
        } else {
          console.error('User creation error:', signUpError)
          return NextResponse.redirect(new URL('/login?error=creation_failed', request.url))
        }
      } else {
        userId = authData.user?.id
      }
    }

    // Update token with user_id and mark as used
    if (userId) {
      await supabase
        .from('auth_tokens')
        .update({ user_id: userId, used_at: new Date().toISOString() })
        .eq('token', token)
    }

    // Generate a magic link to create session
    if (userId && tokenData.email) {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: tokenData.email,
      })

      if (linkData?.properties?.hashed_token) {
        // Set the session cookies
        const response = NextResponse.redirect(new URL('/dashboard', request.url))
        response.cookies.set('sb-access-token', linkData.properties.hashed_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 3600,
          path: '/',
        })
        return response
      }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (code) {
    // Supabase native magic link flow
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Code exchange error:', error)
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.redirect(new URL('/login', request.url))
}