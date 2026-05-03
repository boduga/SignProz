import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ signerId: string; id: string }>
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id, signerId } = await params
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
      { error: 'Only draft documents can have signers removed' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('signers')
    .delete()
    .eq('id', signerId)
    .eq('document_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Signer removed' })
}
