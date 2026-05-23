import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { MagicLinkEmail } from './templates/MagicLinkEmail'
import { render } from '@react-email/components'

let transporter: nodemailer.Transporter | null = null
let resendClient: Resend | null = null

function getNodemailerTransporter() {
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

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

function isProduction() {
  return process.env.NODE_ENV === 'production' && !!process.env.RESEND_API_KEY
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

  if (isProduction()) {
    const resend = getResendClient()
    await resend.emails.send({
      from: 'SignProz <noreply@signproz.com>',
      to: signer.email,
      subject: `You've been asked to sign: ${document.title}`,
      html,
    })
  } else {
    await getNodemailerTransporter().sendMail({
      from: 'SignProz <noreply@signproz.com>',
      to: signer.email,
      subject: `You've been asked to sign: ${document.title}`,
      html,
    })
  }
}
