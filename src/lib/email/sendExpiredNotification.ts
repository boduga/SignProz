import nodemailer from 'nodemailer'

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

interface ExpiredLinkPayload {
  documentId: string
  documentTitle: string
  signerEmail: string
  signerName: string
  ownerEmail: string
  ownerName: string
}

export async function sendExpiredLinkNotification(payload: ExpiredLinkPayload) {
  try {
    await getTransporter().sendMail({
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
  } catch {
    // Non-critical — don't throw
  }
}
