-- =============================================
-- Table: auth_tokens
-- Stores magic link tokens for custom auth flow
-- =============================================
CREATE TABLE IF NOT EXISTS public.auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('login', 'signup')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE ON TABLE public.auth_tokens TO authenticated;
GRANT DELETE ON TABLE public.auth_tokens TO anon, authenticated;

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON public.auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires ON public.auth_tokens(expires_at);
