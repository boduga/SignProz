import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { addAuditLog } from '@/lib/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*, signers(*), signature_fields(*), audit_logs(*)')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !data) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }

  return Response.json({ document: data })
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = createServerClient()
  const supabaseAdmin = createAdminClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('documents')
    .select('status')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!existing) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }

  if (existing.status !== 'draft') {
    return Response.json(
      { error: 'Only draft documents can be updated' },
      { status: 400 }
    )
  }

  const { title, content, expiration_days } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('documents')
    .update({ title, content, expiration_days })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  await addAuditLog(supabaseAdmin, id, 'document.updated', session.user.email)

  return Response.json({ document: data })
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = createServerClient()
  const supabaseAdmin = createAdminClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('documents')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!existing) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }

  await supabaseAdmin.from('documents').delete().eq('id', id)

  return Response.json({ message: 'Document deleted' })
}