'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'

function MagicLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const encodedEmail = searchParams.get('email')

  useEffect(() => {
    if (!encodedEmail) {
      router.push('/login')
      return
    }

    const email = Buffer.from(encodedEmail, 'base64url').toString()
    console.log('[magic-login] Email:', email)

    const handleLogin = async () => {
      const supabase = getBrowserClient()

      // Use signInWithOtp which creates a session directly
      // without sending an email (since we already verified via magic link)
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: undefined, // Don't redirect back
        },
      })

      console.log('[magic-login] signInWithOtp result:', { data, error })

      if (error) {
        console.error('[magic-login] Error:', error)
        setTimeout(() => router.push('/login?error=auth_error'), 2000)
        return
      }

      // Check if we got a session
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('[magic-login] Session after signInWithOtp:', sessionData)

      if (sessionData.session) {
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        // If no session, it means we need to check email for OTP
        console.log('[magic-login] No session - OTP may have been sent to email')
        setTimeout(() => router.push('/login?message=check_email'), 3000)
      }
    }

    handleLogin()
  }, [encodedEmail, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ fontSize: 18, color: '#333' }}>Signing you in securely...</p>
        <p style={{ fontSize: 14, color: '#666', marginTop: 10 }}>
          Please wait while we establish your session.
        </p>
      </div>
    </div>
  )
}

export default function MagicLoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}>
        <p>Loading...</p>
      </div>
    }>
      <MagicLoginContent />
    </Suspense>
  )
}