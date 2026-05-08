import { Resend } from 'resend'
import { AuthMagicLinkEmail } from './templates/AuthMagicLinkEmail'
import { render } from '@react-email/render'

let resendClient: Resend | null = null

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

export async function sendAuthMagicLinkEmail(
  email: string,
  magicUrl: string,
  type: 'login' | 'signup'
) {
  const html = await render(
    AuthMagicLinkEmail({ email, magicUrl, type }),
    { pretty: true }
  )

  const resend = getResendClient()
  await resend.emails.send({
    from: 'SignProz <noreply@signproz.com>',
    to: email,
    subject: type === 'login' ? 'Your SignProz sign in link' : 'Your SignProz signup link',
    html,
  })
}
