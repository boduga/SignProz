import nodemailer from 'nodemailer'
import { MagicLinkEmail } from './templates/MagicLinkEmail'
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
  const magicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${document.id}?token=${signer.magic_token}`

  const html = await render(
    MagicLinkEmail({
      signerName: signer.name || 'there',
      documentTitle: document.title,
      magicUrl,
      ownerEmail,
      expiresIn: document.expiration_days,
    }),
    { pretty: true }
  )

  await getTransporter().sendMail({
    from: 'SignProz <noreply@signproz.com>',
    to: signer.email,
    subject: `You've been asked to sign: ${document.title}`,
    html,
  })
}
