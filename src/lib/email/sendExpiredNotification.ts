import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

interface ExpiredLinkPayload {
  documentId: string
  documentTitle: string
  signerEmail: string
  signerName: string
  ownerEmail: string
  ownerName: string
}

export async function sendExpiredLinkNotification(payload: ExpiredLinkPayload) {
  const resend = getResend()
  if (!resend) return
  const { error } = await resend.emails.send({
    from: 'SignProz <noreply@signproz.com>',
    to: payload.ownerEmail,
    subject: `Signing link expired: ${payload.documentTitle}`,
    html: `
      <p>Hi ${payload.ownerName},</p>
      <p>The signing link sent to <strong>${payload.signerName} (${payload.signerEmail})</strong>
      has expired for the document <strong>${payload.documentTitle}</strong>.</p>
      <p>You can resend the link from your SignProz dashboard.</p>
    `,
  })

  if (error) {
    console.error('Failed to send expired notification:', error)
    // Non-critical — don't throw
  }
}