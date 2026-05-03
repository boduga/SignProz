import { Resend } from 'resend'
import { CompletionEmail } from './templates/CompletionEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

interface CompletionPayload {
  documentId: string
  documentTitle: string
  ownerEmail: string
  ownerName: string
  signerCount: number
  signedAt: string
}

export async function sendCompletionEmail(payload: CompletionPayload) {
  const { error } = await resend.emails.send({
    from: 'SignProz <noreply@signproz.com>',
    to: payload.ownerEmail,
    subject: `Document signed: ${payload.documentTitle}`,
    react: CompletionEmail(payload),
  })

  if (error) {
    console.error('Failed to send completion email:', error)
    throw error
  }
}