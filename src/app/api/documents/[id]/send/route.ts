import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { addAuditLog, isSequentialSigning } from '@/lib/utils'
import { sendMagicLinkEmail } from '@/lib/email/sendMagicLink'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = createServerClient()
  const supabaseAdmin = createAdminClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch document with signers, signature_fields, and profile (owner)
  const { data: document, error: docError } = await supabaseAdmin
    .from('documents')
    .select('*, signers(*), signature_fields(*), profile:profiles(*)')
    .eq('id', id)
    .single()

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Verify document belongs to the authenticated user
  if (document.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Reject if status is not 'draft'
  if (document.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft documents can be sent' },
      { status: 400 }
    )
  }

  // Reject if any signature_field has no signer_id (unassigned fields)
  const unassignedFields = document.signature_fields?.filter(
    (field: { signer_id: string | null }) => !field.signer_id
  )
  if (unassignedFields && unassignedFields.length > 0) {
    return NextResponse.json(
      { error: 'All signature fields must be assigned to a signer before sending' },
      { status: 400 }
    )
  }

  // Reject if no signers exist
  const signers = document.signers || []
  if (signers.length === 0) {
    return NextResponse.json(
      { error: 'At least one signer is required to send the document' },
      { status: 400 }
    )
  }

  // Determine sequential vs parallel signing
  const sequential = isSequentialSigning(signers)

  // For sequential: email only the first signer (lowest order)
  // For parallel: email all signers
  const signersToEmail = sequential
    ? signers
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .slice(0, 1)
    : signers

  // Get owner email from profile or session
  const ownerEmail =
    (document.profile as { email?: string })?.email || session.user.email || ''

  // Send emails and track results
  const emailResults: { email: string; success: boolean; error?: string }[] = []
  for (const signer of signersToEmail) {
    try {
      await sendMagicLinkEmail(signer, document, ownerEmail)
      emailResults.push({ email: signer.email, success: true })
    } catch (err) {
      emailResults.push({
        email: signer.email,
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send email',
      })
    }
  }

  // If ALL emails fail, return 500 error
  const allFailed = emailResults.every((r) => !r.success)
  if (allFailed) {
    return NextResponse.json(
      { error: 'Failed to send emails to all signers. Please try again.' },
      { status: 500 }
    )
  }

  // Update document status to 'sent' and set sent_at
  const { data: updatedDocument, error: updateError } = await supabaseAdmin
    .from('documents')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 }
    )
  }

  // Add audit log with signer count, sequential flag, emails sent
  await addAuditLog(supabaseAdmin, id, 'document.sent', session.user.email, {
    signer_count: signers.length,
    sequential,
    emails_sent: emailResults.filter((r) => r.success).length,
    signer_emails: signers.map((s: { email: string }) => s.email),
  })

  // Build response
  const emailsSent = emailResults.filter((r) => r.success).map((r) => r.email)
  const partialErrors = emailResults.filter((r) => !r.success)

  return NextResponse.json({
    document: updatedDocument,
    emails_sent: emailsSent,
    sequential,
    ...(partialErrors.length > 0 && {
      partial_errors: partialErrors.map((e) => ({
        email: e.email,
        error: e.error,
      })),
    }),
  })
}
