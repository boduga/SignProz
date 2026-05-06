import { createAdminClient } from '@/lib/supabase/admin'
import { isTokenExpired } from '@/lib/utils'

interface RouteParams {
  params: Promise<{ documentId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { documentId } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()

  // Look up signer by magic_token and document_id
  const { data: signer, error: signerError } = await supabaseAdmin
    .from('signers')
    .select('*')
    .eq('magic_token', token)
    .eq('document_id', documentId)
    .single()

  if (signerError || !signer) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Fetch the document with all related data
  const { data: document, error: docError } = await supabaseAdmin
    .from('documents')
    .select('*, signature_fields(*), signers(*)')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }

  // Check if token expired
  if (isTokenExpired(signer.token_expires_at)) {
    return Response.json({ error: 'Link expired' }, { status: 410 })
  }

  return Response.json({
    document,
    signer,
  })
}
