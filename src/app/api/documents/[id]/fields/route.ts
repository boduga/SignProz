import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('signature_fields')
    .select('*')
    .eq('document_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ fields: data })
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()
  const supabaseAdmin = createAdminClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify document belongs to the user and is a draft
  const { data: document } = await supabase
    .from('documents')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (document.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft documents can have fields added' },
      { status: 400 }
    )
  }

  const { field_type, signer_id, position_x, position_y, width, height } =
    await request.json()

  const { data, error } = await supabaseAdmin
    .from('signature_fields')
    .insert({
      document_id: id,
      field_type: field_type || 'signature',
      signer_id,
      position_x: position_x ?? 0,
      position_y: position_y ?? 0,
      width: width ?? 200,
      height: height ?? 60,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ field: data })
}
