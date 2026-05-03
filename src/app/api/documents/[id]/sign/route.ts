import { createAdminClient } from '@/lib/supabase/admin'
import { isTokenExpired, addAuditLog, isSequentialSigning } from '@/lib/utils'
import { sendMagicLinkEmail, sendCompletionEmail } from '@/lib/email'
import type { SignRequestBody } from '@/lib/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: documentId } = await params
    const supabaseAdmin = createAdminClient()

    // 1. Parse body
    const body: SignRequestBody = await request.json()
    const { token, fields } = body

    // 2. Validate token and fields are present
    if (!token || !fields || !Array.isArray(fields)) {
      return Response.json(
        { error: 'Invalid request: token and fields are required' },
        { status: 400 }
      )
    }

    // 3. Look up signer by magic_token AND document_id
    const { data: signer, error: signerError } = await supabaseAdmin
      .from('signers')
      .select('*')
      .eq('magic_token', token)
      .eq('document_id', documentId)
      .single()

    if (signerError || !signer) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // 4. Reject if already signed
    if (signer.signed_at) {
      return Response.json({ error: 'Document already signed' }, { status: 409 })
    }

    // 4. Reject if link expired
    if (isTokenExpired(signer.token_expires_at)) {
      return Response.json({ error: 'Signing link has expired' }, { status: 410 })
    }

    // 5. Reject if document status is not 'sent' or 'partially_signed'
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!['sent', 'partially_signed'].includes(document.status)) {
      return Response.json(
        { error: 'Document is not available for signing' },
        { status: 400 }
      )
    }

    // 6. Update signature fields with filled values
    for (const field of fields) {
      await supabaseAdmin
        .from('signature_fields')
        .update({ filled_value: field.value })
        .eq('id', field.fieldId)
        .eq('signer_id', signer.id)
    }

    // 7. Build signed_data object and update signer
    const signedData: Record<string, unknown> = {}
    for (const field of fields) {
      signedData[field.fieldId] = field.value
    }

    await supabaseAdmin
      .from('signers')
      .update({
        signed_at: new Date().toISOString(),
        signed_data: signedData,
      })
      .eq('id', signer.id)

    // 8. If signer has not viewed the document, set viewed_at
    if (!signer.viewed_at) {
      await supabaseAdmin
        .from('signers')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', signer.id)
    }

    // 9. Add audit log
    await addAuditLog(
      supabaseAdmin,
      documentId,
      'signer.signed',
      signer.email,
      { signerId: signer.id }
    )

    // 10. Check all signers status
    const { data: allSigners } = await supabaseAdmin
      .from('signers')
      .select('*')
      .eq('document_id', documentId)

    const allSigned = allSigners?.every((s) => s.signed_at !== null)

    if (allSigned) {
      // Mark document as completed
      await supabaseAdmin
        .from('documents')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      await addAuditLog(
        supabaseAdmin,
        documentId,
        'document.completed',
        signer.email
      )

      // Send completion email to owner
      const { data: owner } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', document.user_id)
        .single()

      if (owner) {
        await sendCompletionEmail({
          documentId,
          documentTitle: document.title,
          ownerEmail: owner.email,
          ownerName: owner.full_name || 'there',
          signerCount: allSigners?.length || 0,
          signedAt: new Date().toISOString(),
        })
      }
    } else {
      // Sequential mode: find next pending signer
      const sequential = isSequentialSigning(allSigners || [])

      if (sequential) {
        // Find next signer in order who hasn't signed
        const pendingSigners = (allSigners || [])
          .filter((s) => s.signed_at === null)
          .sort((a, b) => a.order - b.order)

        const nextSigner = pendingSigners[0]

        if (nextSigner) {
          // Fetch owner email for magic link email
          const { data: owner } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', document.user_id)
            .single()

          await sendMagicLinkEmail(
            {
              id: nextSigner.id,
              email: nextSigner.email,
              name: nextSigner.name || '',
              magic_token: nextSigner.magic_token,
            },
            {
              id: document.id,
              title: document.title,
              expiration_days: document.expiration_days,
            },
            owner?.email || ''
          )

          await addAuditLog(
            supabaseAdmin,
            documentId,
            'signer.next_emailed',
            signer.email,
            { nextSignerId: nextSigner.id }
          )
        }
      } else {
        // Parallel mode: just update status to partially_signed
        await supabaseAdmin
          .from('documents')
          .update({ status: 'partially_signed' })
          .eq('id', documentId)
      }
    }

    return Response.json({ success: true, message: 'Signature submitted' })
  } catch (error) {
    console.error('Sign error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
