'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!email || !token) {
      router.push('/login')
    }
  }, [email, token, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setVerifying(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, otpCode: otp }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setVerifying(false)
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Verification failed. Please try again.')
      setVerifying(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: 'white',
        padding: 40,
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: 400,
        width: '100%',
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Enter Verification Code</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoFocus
            style={{
              width: '100%',
              padding: '16px',
              fontSize: 24,
              textAlign: 'center',
              letterSpacing: '8px',
              border: '2px solid #ddd',
              borderRadius: 8,
              marginBottom: 20,
              outline: 'none',
            }}
          />

          {error && (
            <p style={{ color: 'red', marginBottom: 20 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={verifying}
            style={{
              width: '100%',
              padding: '14px',
              background: '#0066ff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: verifying ? 'not-allowed' : 'pointer',
              opacity: verifying ? 0.7 : 1,
            }}
          >
            {verifying ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
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
      <VerifyOtpContent />
    </Suspense>
  )
}