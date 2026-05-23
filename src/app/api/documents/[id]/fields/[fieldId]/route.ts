import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string; fieldId: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id, fieldId } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()
  const supabaseAdmin = createAdminClient()

  // Verify document belongs to the user and is a draft
  const { data: document } = await supabase
    .from('documents')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', session.id)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (document.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft documents can have fields updated' },
      { status: 400 }
    )
  }

  const { position_x, position_y, width, height, signer_id } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('signature_fields')
    .update({ position_x, position_y, width, height, signer_id })
    .eq('id', fieldId)
    .eq('document_id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ field: data })
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id, fieldId } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()
  const supabaseAdmin = createAdminClient()

  // Verify document belongs to the user and is a draft
  const { data: document } = await supabase
    .from('documents')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', session.id)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (document.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft documents can have fields removed' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('signature_fields')
    .delete()
    .eq('id', fieldId)
    .eq('document_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Field removed' })
}