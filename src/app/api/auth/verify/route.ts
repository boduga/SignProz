import { createAdminClient } from '@/lib/supabase/admin'
import { sendExpiredLinkNotification } from '@/lib/email/sendExpiredNotification'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()

  const { data: signer, error } = await supabaseAdmin
    .from('signers')
    .select('*, documents!inner(id, title, user_id, expiration_days, status)')
    .eq('magic_token', token)
    .single()

  if (error || !signer) {
    redirect(`/sign/invalid`)
  }

  if (signer.signed_at) {
    redirect(`/sign/already-signed`)
  }

  const expired = new Date(signer.token_expires_at) < new Date()
  if (expired) {
    const { data: owner } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', (signer as any).documents.user_id)
      .single()

    if (owner) {
      await sendExpiredLinkNotification({
        documentId: (signer as any).documents.id,
        documentTitle: (signer as any).documents.title,
        signerEmail: signer.email,
        signerName: signer.name || signer.email,
        ownerEmail: owner.email,
        ownerName: owner.full_name || owner.email,
      })
    }

    redirect(`/sign/expired`)
  }

  redirect(`/sign/${signer.document_id}?token=${token}`)
}