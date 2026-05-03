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
    .from('signers')
    .select('*')
    .eq('document_id', id)
    .order('order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ signers: data })
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createServerClient()
  const supabaseAdmin = createAdminClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify document belongs to the user
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
      { error: 'Only draft documents can have signers added' },
      { status: 400 }
    )
  }

  const { name, email, order } = await request.json()

  if (!email || !name) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('signers')
    .insert({ document_id: id, name, email, order: order ?? 0, status: 'pending' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ signer: data })
}
