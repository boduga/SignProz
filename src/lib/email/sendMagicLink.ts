import { Resend } from 'resend'
import { MagicLinkEmail } from './templates/MagicLinkEmail'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
  return new Resend(process.env.RESEND_API_KEY)
}

interface Signer {
  id: string
  email: string
  name: string
  magic_token: string
}

interface Document {
  id: string
  title: string
  expiration_days: number
}

export async function sendMagicLinkEmail(
  signer: Signer,
  document: Document,
  ownerEmail: string
) {
  const resend = getResend()
  const magicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${document.id}?token=${signer.magic_token}`

  const { error } = await resend.emails.send({
    from: 'SignProz <noreply@signproz.com>',
    to: signer.email,
    subject: `You've been asked to sign: ${document.title}`,
    react: MagicLinkEmail({
      signerName: signer.name || 'there',
      documentTitle: document.title,
      magicUrl,
      ownerEmail,
      expiresIn: document.expiration_days,
    }),
  })

  if (error) {
    console.error('Failed to send magic link email:', error)
    throw error
  }
}