import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendMagicLinkEmail } from '@/lib/email'
import { generateMagicToken, getTokenExpiry, addAuditLog } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string; signerId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id, signerId } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()
  const supabaseAdmin = createAdminClient()

  // Verify document belongs to the user
  const { data: document } = await supabase
    .from('documents')
    .select('id, title, user_id, expiration_days')
    .eq('id', id)
    .eq('user_id', session.id)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Find the signer by ID and document ID
  const { data: signer, error: signerError } = await supabaseAdmin
    .from('signers')
    .select('*')
    .eq('id', signerId)
    .eq('document_id', id)
    .single()

  if (signerError || !signer) {
    return NextResponse.json({ error: 'Signer not found' }, { status: 404 })
  }

  // Generate new magic token and expiry
  const newToken = generateMagicToken()
  const expiresAt = getTokenExpiry(document.expiration_days || 7)

  // Update the signer record with new token
  const { error: updateError } = await supabaseAdmin
    .from('signers')
    .update({
      magic_token: newToken,
      token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', signerId)
    .eq('document_id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  // Send the magic link email to the signer
  await sendMagicLinkEmail(
    { ...signer, magic_token: newToken },
    { ...document, id },
    session.email || ''
  )

  // Log the action to audit_logs
  await addAuditLog(
    supabaseAdmin,
    id,
    'signer_resend_link',
    session.email || undefined,
    { signer_id: signerId, signer_email: signer.email }
  )

  return NextResponse.json({
    message: 'Magic link resent successfully',
    expires_at: expiresAt.toISOString(),
  })
}