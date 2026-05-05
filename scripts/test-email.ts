import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually
const envPath = '/home/babasola/Dev/signproz/.env.local'
const envContent = fs.readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex > -1) {
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim()
      process.env[key] = value
    }
  }
}

// @ts-ignore
process.env.NODE_ENV = 'production'

console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY,
  process.env.RESEND_API_KEY ? `(${process.env.RESEND_API_KEY.slice(0, 10)}...)` : '')
console.log('NODE_ENV:', process.env.NODE_ENV)

// @ts-ignore
import('/home/babasola/Dev/signproz/src/lib/email/sendMagicLink').then(async ({ sendMagicLinkEmail }) => {
  try {
    await sendMagicLinkEmail(
      {
        id: 'test-signer-1',
        email: 'boduga@gmail.com',
        name: 'Test User',
        magic_token: 'test-token-123',
      },
      {
        id: 'test-doc-1',
        title: 'Test Document',
        expiration_days: 7,
      },
      'test@signproz.com'
    )
    console.log('Email sent successfully!')
  } catch (error) {
    console.error('Failed to send email:', error)
  }
})