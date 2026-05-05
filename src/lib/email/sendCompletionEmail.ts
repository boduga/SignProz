import nodemailer from 'nodemailer'
import { CompletionEmail } from './templates/CompletionEmail'
import { render } from '@react-email/render'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || '127.0.0.1',
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      ignoreTLS: true,
    })
  }
  return transporter
}

interface CompletionPayload {
  documentId: string
  documentTitle: string
  ownerEmail: string
  ownerName: string
  signerCount: number
  signedAt: string
}

export async function sendCompletionEmail(payload: CompletionPayload) {
  const html = await render(CompletionEmail(payload), { pretty: true })

  await getTransporter().sendMail({
    from: 'SignProz <noreply@signproz.com>',
    to: payload.ownerEmail,
    subject: `Document signed: ${payload.documentTitle}`,
    html,
  })
}
