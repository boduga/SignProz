-- =============================================
-- SignProz Database Schema
-- Phase 1
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: profiles
-- Links to Supabase Auth users. Extra metadata.
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'premium', 'enterprise')),
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(id),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT ON TABLE public.profiles TO authenticated;
GRANT UPDATE ON TABLE public.profiles TO authenticated;

-- Trigger: auto-create profile row when new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan_tier, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'free',
    'SF-' || upper(substring(gen_random_uuid()::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Table: documents
-- A document a user creates and sends for signing.
-- =============================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partially_signed', 'completed', 'expired')),
  content TEXT,
  template_id TEXT,
  expiration_days INT NOT NULL DEFAULT 7,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT ON TABLE public.documents TO authenticated;
GRANT UPDATE, DELETE ON TABLE public.documents TO authenticated;

-- RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_owner_select" ON public.documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "documents_owner_insert" ON public.documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "documents_owner_update" ON public.documents FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "documents_owner_delete" ON public.documents FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- Table: signers
-- Recipients assigned to a document. Each gets a unique magic link.
-- =============================================
CREATE TABLE public.signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  magic_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signed_data JSONB,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT ON TABLE public.signers TO authenticated;
GRANT SELECT ON TABLE public.signers TO anon;
GRANT INSERT ON TABLE public.signers TO authenticated;
GRANT DELETE ON TABLE public.signers TO authenticated;

-- RLS
ALTER TABLE public.signers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signers_owner_all" ON public.signers FOR ALL
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "signers_anon_read_own" ON public.signers FOR SELECT
  TO anon
  USING (magic_token = current_setting('request.headers')::json->>'x-magic-token');

CREATE POLICY "signers_anon_update_own" ON public.signers FOR UPDATE
  TO anon
  USING (magic_token = current_setting('request.headers')::json->>'x-magic-token')
  WITH CHECK (magic_token = current_setting('request.headers')::json->>'x-magic-token');

CREATE POLICY "signers_owner_delete_draft" ON public.signers FOR DELETE
  USING (
    document_id IN (
      SELECT id FROM public.documents
      WHERE user_id = auth.uid() AND status = 'draft'
    )
  );

-- =============================================
-- Table: signature_fields
-- Placed signature fields on a document.
-- =============================================
CREATE TABLE public.signature_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  signer_id UUID REFERENCES public.signers(id) ON DELETE SET NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('signature', 'initials', 'date', 'text')),
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL DEFAULT 20,
  height FLOAT NOT NULL DEFAULT 5,
  is_required BOOLEAN NOT NULL DEFAULT true,
  filled_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT ON TABLE public.signature_fields TO authenticated;
GRANT SELECT ON TABLE public.signature_fields TO anon;
GRANT UPDATE ON TABLE public.signature_fields TO authenticated;
GRANT UPDATE ON TABLE public.signature_fields TO anon;
GRANT DELETE ON TABLE public.signature_fields TO authenticated;

-- RLS
ALTER TABLE public.signature_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signature_fields_owner_all" ON public.signature_fields FOR ALL
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "signature_fields_anon_read" ON public.signature_fields FOR SELECT
  TO anon USING (true);

CREATE POLICY "signature_fields_anon_update" ON public.signature_fields FOR UPDATE
  TO anon USING (true);

-- =============================================
-- Table: audit_logs
-- Append-only log. DELETE blocked at DB level.
-- =============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  actor_email TEXT,
  action TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT INSERT ON TABLE public.audit_logs TO authenticated;
GRANT INSERT ON TABLE public.audit_logs TO anon;
REVOKE DELETE ON TABLE public.audit_logs FROM authenticated;
REVOKE DELETE ON TABLE public.audit_logs FROM anon;

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_owner_select" ON public.audit_logs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "audit_logs_auth_insert" ON public.audit_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_logs_anon_insert" ON public.audit_logs FOR INSERT
  TO anon WITH CHECK (true);

-- Block DELETE at trigger level
CREATE OR REPLACE FUNCTION public.block_audit_log_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only; DELETE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_audit_log_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_log_delete();

-- =============================================
-- Table: affiliate_referrals
-- Tracks affiliate program referrals.
-- =============================================
CREATE TABLE public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'upgraded', 'churned')),
  commission_paid NUMERIC(10, 2) DEFAULT 0,
  commission_currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT ON TABLE public.affiliate_referrals TO authenticated;
GRANT INSERT ON TABLE public.affiliate_referrals TO authenticated;

-- RLS
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_referrals_owner_all" ON public.affiliate_referrals FOR ALL
  USING (referrer_id = auth.uid());

-- =============================================
-- Updated_at trigger helper
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();