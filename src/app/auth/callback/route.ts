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

  // Create HTML page that uses Supabase client-side setSession
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Signing in...</title>
</head>
<body style="font-family: sans-serif; padding: 40px; text-align: center; background: #f5f5f5;">
  <div id="status" style="padding: 20px;">
    <p>Signing you in securely...</p>
  </div>
  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

    const supabaseClient = createClient(
      '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
      '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}'
    );

    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    fetch('/api/auth/magic-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token })
    })
    .then(r => r.json())
    .then(data => {
      if (data.access_token) {
        supabaseClient.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        }).then(() => {
          document.getElementById('status').innerHTML = '<p style="color: green;">Success! Redirecting...</p>';
          setTimeout(() => window.location.href = '/dashboard', 500);
        });
      } else {
        document.getElementById('status').innerHTML = '<p style="color: red;">Error: ' + (data.error || 'Failed') + '</p>';
      }
    })
    .catch(err => {
      document.getElementById('status').innerHTML = '<p style="color: red;">Error: ' + err.message + '</p>';
    });
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}