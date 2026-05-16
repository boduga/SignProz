'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/browser'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    const handleCallback = async () => {
      try {
        // Get email from token
        const res = await fetch(`/api/auth/callback-data?token=${token}`)
        const data = await res.json()

        if (data.error || !data.email) {
          setError('Invalid or expired link')
          setTimeout(() => router.push('/login?error=invalid_token'), 2000)
          return
        }

        // Use signInWithOtp to create session (this sets cookies automatically)
        const supabase = getBrowserClient()
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email: data.email,
        })

        if (signInError) {
          console.error('Sign in error:', signInError)
          setError('Failed to sign in')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        // Success - redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error('Callback error:', err)
        setError('Something went wrong')
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    handleCallback()
  }, [token, router])

  return (
    <div className="text-center">
      {error ? (
        <>
          <div className="text-red-500 mb-4">{error}</div>
          <p className="text-slate-500">Redirecting...</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Signing you in...</p>
        </>
      )}
    </div>
  )
}

export default function CallbackClientPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  )
}