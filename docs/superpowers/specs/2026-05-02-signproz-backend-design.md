# SignProz Backend — Design Specification
**Date:** 2026-05-02
**Status:** Revised — Pending User Approval

---

## 1. Overview

SignProz is a SaaS document signing platform (DocuSign alternative) with an existing static SPA frontend deployed at `sign-proz-bjdt.vercel.app`. This spec covers the backend architecture needed to power the document signing workflow end-to-end.

**What we're building:** A Next.js (App Router) backend that replaces the static frontend, adds real authentication, document management, signing flow, and email delivery. The existing `SignProz.html` SPA gets migrated into the Next.js project with minimal changes.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | TypeScript, deployed on Vercel |
| Database | Supabase (PostgreSQL) | Auth + DB + storage |
| Auth | Supabase Auth | Email/password + magic links for signers |
| Email | Resend | Transactional emails via Next.js API Routes |
| Payments | Mocked (Phase 1) | Stripe billing planned for Phase 2 |

### Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_key_here
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_key_here
RESEND_API_KEY=re_xxxxx
ANTHROPIC_API_KEY=sk-ant-...          # For /api/agreement-analyze
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **`sb_publishable`** — public, browser-safe, respects RLS
- **`sb_secret`** — server-only only, bypasses RLS. Never expose to frontend.
- **`ANTHROPIC_API_KEY`** — server-only only. Used for AI agreement analysis.

### Dynamic App URL

The magic link base URL is constructed from `NEXT_PUBLIC_APP_URL`. It must be set correctly per environment:

- **Local dev:** `http://localhost:3000`
- **Vercel preview:** auto-detected via `VERCEL_URL` (see `next.config.ts`)
- **Production:** set explicitly to `https://sign-proz.vercel.app` in Vercel dashboard

```ts
// next.config.ts
env: {
  NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}
```

---

## 3. Database Schema

All tables created in Supabase with Row Level Security (RLS) enabled. **Note:** As of May 2026, new tables are NOT exposed to the API by default — explicit `GRANT` statements are required after table creation. All migrations live in `supabase/migrations/00001_init.sql`.

---

### 3.1 `profiles`

Links to Supabase Auth users. Extra user metadata beyond auth.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | FK → `auth.users.id`, primary key |
| `full_name` | `text` | Display name |
| `plan_tier` | `text` | `'free'`, `'pro'`, `'premium'`, `'enterprise'` |
| `referral_code` | `text` | Unique, e.g. `SF-ABCD1234` |
| `referred_by` | `uuid` | FK → `profiles.id`, nullable |
| `stripe_customer_id` | `text` | nullable, Phase 2 |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | |

**GRANT:**
```sql
GRANT SELECT, INSERT ON TABLE profiles TO authenticated;
GRANT UPDATE ON TABLE profiles TO authenticated;
```

**Trigger — auto-create profile on sign-up:**
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan_tier, referral_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'free',
    'SF-' || upper(substring(gen_random_uuid()::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

The trigger runs inside Supabase's DB, so the profile row exists before any API call can reference it — no race condition. The `/api/auth/signup` route does not manually insert into profiles; it only calls `supabase.auth.signUp()` and the trigger handles the rest.

---

### 3.2 `documents`

A document that a user creates and sends for signing.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK → `profiles.id`, document owner |
| `title` | `text` | Document name |
| `status` | `text` | `'draft'` / `'sent'` / `'partially_signed'` / `'completed'` / `'expired'` |
| `content` | `text` | Document text/HTML content |
| `template_id` | `text` | nullable, e.g. `'t1'`, `'t2'` |
| `expiration_days` | `int` | Default 7 |
| `sent_at` | `timestamptz` | nullable |
| `completed_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**Status meanings:**
- `'draft'` — Created, not yet sent
- `'sent'` — Emailed to signers, awaiting responses
- `'partially_signed'` — At least one (but not all) signers have signed
- `'completed'` — All signers have signed
- `'expired'` — Passed expiration date without all signatures

**GRANT:**
```sql
GRANT SELECT, INSERT ON TABLE documents TO authenticated;
GRANT UPDATE, DELETE ON TABLE documents TO authenticated;
```

**RLS Policies:**
```sql
-- Users can only see their own documents
CREATE POLICY "documents_owner_select" ON documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "documents_owner_update" ON documents FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "documents_owner_delete" ON documents FOR DELETE
  USING (user_id = auth.uid());
```

---

### 3.3 `signers`

Recipients assigned to a document. Each signer gets a unique magic link.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `document_id` | `uuid` | FK → `documents.id` |
| `email` | `text` | Signer's email address |
| `name` | `text` | Signer's display name |
| `magic_token` | `text` | UUID, used in magic link URL. Unique per signer. |
| `token_expires_at` | `timestamptz` | Default now + 7 days |
| `viewed_at` | `timestamptz` | nullable |
| `signed_at` | `timestamptz` | nullable |
| `signed_data` | `jsonb` | Signature data (data URLs, typed names) |
| `order` | `int` | Signing sequence order. Set all to `0` for parallel signing. Set `1, 2, 3...` for sequential. |
| `created_at` | `timestamptz` | |

**GRANT:**
```sql
GRANT SELECT ON TABLE signers TO authenticated;
GRANT SELECT ON TABLE signers TO anon;  -- Magic link flow: signer accesses without login
GRANT INSERT ON TABLE signers TO authenticated;
GRANT DELETE ON TABLE signers TO authenticated;  -- Remove signers from draft documents only
```

**RLS Policies:**
```sql
-- Document owner can manage signers
CREATE POLICY "signers_owner_all" ON signers FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- Anon signers can read/update their own row only (matched by magic_token)
-- Route handler validates the token first; RLS policy is defence-in-depth.
CREATE POLICY "signers_anon_read_own" ON signers FOR SELECT
  TO anon
  USING (magic_token = current_setting('request.headers')::json->>'x-magic-token');

CREATE POLICY "signers_anon_update_own" ON signers FOR UPDATE
  TO anon
  USING (magic_token = current_setting('request.headers')::json->>'x-magic-token')
  WITH CHECK (magic_token = current_setting('request.headers')::json->>'x-magic-token');

-- Document owner can delete signers only from draft documents
CREATE POLICY "signers_owner_delete_draft" ON signers FOR DELETE
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE user_id = auth.uid() AND status = 'draft'
    )
  );
```

---

### 3.4 `signature_fields`

Placed fields on a document. Fields with no `signer_id` are "unassigned" — all must be assigned before a document can be sent.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `document_id` | `uuid` | FK → `documents.id` |
| `signer_id` | `uuid` | FK → `signers.id`, nullable (unassigned) |
| `field_type` | `text` | `'signature'` / `'initials'` / `'date'` / `'text'` |
| `position_x` | `float` | Percentage (0-100) |
| `position_y` | `float` | Percentage (0-100) |
| `width` | `float` | Percentage |
| `height` | `float` | Percentage |
| `is_required` | `boolean` | Default `true` |
| `filled_value` | `jsonb` | nullable, the submitted value |
| `created_at` | `timestamptz` | |

**GRANT:**
```sql
GRANT SELECT, INSERT ON TABLE signature_fields TO authenticated;
GRANT SELECT ON TABLE signature_fields TO anon;  -- Signing ceremony shows fields
GRANT UPDATE ON TABLE signature_fields TO anon;  -- Signer fills fields
GRANT DELETE ON TABLE signature_fields TO authenticated;
```

**RLS Policies:**
```sql
CREATE POLICY "signature_fields_owner_all" ON signature_fields FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "signature_fields_anon_read" ON signature_fields FOR SELECT TO anon
  USING (true);

CREATE POLICY "signature_fields_anon_update" ON signature_fields FOR UPDATE TO anon
  USING (true);
```

---

### 3.5 `audit_logs`

Append-only log of every action on a document. DELETE is blocked at the DB level.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `document_id` | `uuid` | FK → `documents.id` |
| `actor_email` | `text` | Who did the action |
| `action` | `text` | e.g. `'document.created'`, `'signer.signed'`, `'signer.link_resent'` |
| `metadata` | `jsonb` | Additional context |
| `ip_address` | `text` | nullable |
| `created_at` | `timestamptz` | |

**GRANT:**
```sql
GRANT SELECT ON TABLE audit_logs TO authenticated;
GRANT INSERT ON TABLE audit_logs TO authenticated;
GRANT INSERT ON TABLE audit_logs TO anon;  -- Signers add audit entries via magic link
REVOKE DELETE ON TABLE audit_logs FROM authenticated;
REVOKE DELETE ON TABLE audit_logs FROM anon;
```

**DELETE prevention trigger:**
```sql
CREATE OR REPLACE FUNCTION block_audit_log_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only; DELETE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_audit_log_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION block_audit_log_delete();
```

---

### 3.6 `affiliate_referrals`

Tracks affiliate program referrals.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `referrer_id` | `uuid` | FK → `profiles.id` |
| `referred_email` | `text` | Email of referred user |
| `status` | `text` | `'registered'` / `'upgraded'` / `'churned'` |
| `commission_paid` | `numeric` | Amount paid out |
| `commission_currency` | `text` | Default `'USD'` — ready for international expansion |
| `created_at` | `timestamptz` | |

**GRANT:**
```sql
GRANT SELECT ON TABLE affiliate_referrals TO authenticated;
GRANT INSERT ON TABLE affiliate_referrals TO authenticated;
```

---

## 4. API Routes

All routes live in `app/api/`. Auth sessions handled via `@supabase/ssr` cookies.

### 4.1 Auth Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/signup` | POST | Create account with email/password |
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/verify` | GET | Verify magic token, redirect to signing page |
| `/api/auth/session` | GET | Return current session info |

> **Note on `/api/auth/magic-link`:** Not a public API route. Magic link dispatch is handled internally by `lib/email/sendMagicLink.ts` — called directly from `POST /api/documents/[id]/send` and `POST /api/documents/[id]/signers/[signerId]/resend`. This keeps the signing email logic in one place and avoids exposing a dispatch endpoint publicly.

### 4.2 Document Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/documents` | GET | List user's documents (paginated) |
| `/api/documents` | POST | Create a new document |
| `/api/documents/[id]` | GET | Get single document |
| `/api/documents/[id]` | PUT | Update document (draft only) |
| `/api/documents/[id]` | DELETE | Delete document |
| `/api/documents/[id]/send` | POST | Lock document, email signers |
| `/api/documents/[id]/sign` | POST | Submit signatures as a signer (magic token auth) |
| `/api/documents/[id]/signers` | POST | Add a signer to a draft document |
| `/api/documents/[id]/signers` | GET | List signers on a document |
| `/api/documents/[id]/signers/[signerId]` | DELETE | Remove a signer (draft documents only) |
| `/api/documents/[id]/signers/[signerId]/resend` | POST | Regenerate magic token and resend signing email |
| `/api/documents/[id]/fields` | GET | List all fields for a document |
| `/api/documents/[id]/fields` | POST | Add a signature field |
| `/api/documents/[id]/fields/[fieldId]` | PATCH | Update a field (assign to signer, set position/type) |
| `/api/documents/[id]/fields/[fieldId]` | DELETE | Remove a field |

### 4.3 Utility Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/referrals` | GET | Return referral stats (existing frontend integration) |
| `/api/agreement-analyze` | POST | AI agreement analysis (see Section 4.4) |
| `/api/webhooks` | POST | Future: Stripe webhooks (Phase 2) |

### 4.4 AI Route — `/api/agreement-analyze`

Analyzes document text/HTML with Claude and returns key clauses, risk flags, and a plain-English summary. This is the server-side replacement for the browser-based analysis in the existing static SPA.

**Request:**
```ts
{ content: string }  // Raw document text or HTML
```

**Response:**
```ts
{
  summary: string,        // 2-3 sentence plain-English overview
  keyTerms: string[],      // Extracted obligations, deadlines, parties
  riskFlags: {
    level: 'low' | 'medium' | 'high',
    description: string
  }[],
  recommendedActions: string[]
}
```

**Implementation:** Calls the Anthropic API server-side using `ANTHROPIC_API_KEY`. The response shape matches the existing `window.SIGNPROZ_AI_AGREEMENT_API` integration in `SignProz.html` so the frontend requires no changes.

---

## 5. Signing Flow (End-to-End)

### Step 1 — Create document
```
User creates document → POST /api/documents
→ status: 'draft', saved to DB
→ audit_log: 'document.created'
```

### Step 2 — Add signers
```
User adds signers → POST /api/documents/[id]/signers
→ signers table entries, each with UUID magic_token
→ audit_log: 'signer.added'
```

### Step 2a — Place and assign signature fields
```
User places fields in document editor UI:
→ POST /api/documents/[id]/fields (create field at position)
→ PATCH /api/documents/[id]/fields/[fieldId] (assign signer_id)
→ All fields must have signer_id set before "Send" is enabled.
   Fields with signer_id = null block the send action.
→ audit_log: 'field.placed', 'field.assigned'
```

### Step 3 — Send document
```
User clicks "Send" → POST /api/documents/[id]/send

Pre-flight checks:
  → All signature_fields must have a signer_id assigned (no unassigned fields)
  → Document status must be 'draft'

On send:
  → status: 'sent', sent_at set
  → audit_log: 'document.sent'
  → lib/email/sendMagicLink.ts called for each signer
```

**Sequential vs. parallel signing:**
- If `signers.order` is `0` or not set for all signers → **parallel mode**. All signers receive magic link emails simultaneously.
- If signers have distinct order values (1, 2, 3...) → **sequential mode**. Only the signer with the lowest incomplete order value receives their magic link email. The next signer is emailed only after the current signer completes.

**Magic link URL:**
```
${process.env.NEXT_PUBLIC_APP_URL}/sign/${document_id}?token=${magic_token}
```

### Step 4 — Signer opens magic link
```
Signer clicks link → GET /api/auth/verify?token=XXX

Token validation:
  → Lookup signer by magic_token (anon auth, RLS ensures row scope)
  → If token not found: return 401 → /sign/invalid page
  → If token_expires_at passed: return 410 → /sign/expired page
     Signer sees message: "This signing link has expired.
     Please contact [owner email] to request a new link."
     Document owner receives notification email.
  → If signer already signed: return 409 → /sign/already-signed page
  → If valid: render signing page with document content + fields
→ audit_log: 'signer.viewed' (viewed_at set on signer row)
```

### Step 5 — Signer submits signatures
```
Signer fills all required fields → POST /api/documents/[id]/sign
Body: { token: string, fields: [{ fieldId, value }] }

Server-side validation:
  1. Validate magic_token matches a signer on this document
  2. Check token_expires_at not passed
  3. Check signer not already signed

On success:
  → signature_fields.filled_value updated
  → signers.signed_at set, signed_data stored
  → audit_log: 'signer.signed'
  → mark signer as complete

Post-sign check — sequential signing:
  → If sequential mode: find next pending signer (lowest incomplete order)
  → If one exists: call lib/email/sendMagicLink.ts to dispatch their magic link
  → If all signers done: update document status → 'completed'
    → completed_at set
    → lib/email/sendCompletionEmail.ts called (notification to document owner)
```

### Step 5a — Resending expired links
```
Document owner (or signer who got 410) triggers:
→ POST /api/documents/[id]/signers/[signerId]/resend
→ Generates new magic_token (UUID)
→ Resets token_expires_at to now + document.expiration_days
→ Sends new magic link email via lib/email/sendMagicLink.ts
→ audit_log: 'signer.link_resent'
```

---

## 6. Email Templates (Resend + React Email)

| Email | Trigger | Recipients |
|---|---|---|
| Magic Link | `lib/email/sendMagicLink.ts` called from send/resend | Signers |
| Link Expired Notification | Token expiry detected on verify | Document owner |
| Reminder | Cron job (optional, Phase 2) | Pending signers |
| Document Completed | All signers done | Document owner |

All emails use React Email templates for consistent branding.

---

## 7. Row Level Security (RLS) Summary

| Table | Authenticated users | Anon users |
|---|---|---|
| `profiles` | Select, Insert, Update own row | — |
| `documents` | Full CRUD own documents | — |
| `signers` | Full CRUD on own document's signers | Read/Update own row only (via magic_token header) |
| `signature_fields` | Full CRUD on own document's fields | Read/Update (signing ceremony) |
| `audit_logs` | Select, Insert | Insert only |
| `affiliate_referrals` | Select, Insert own referrals | — |

- **Audit logs** are append-only — `REVOKE DELETE` + `BEFORE DELETE` trigger enforced in schema
- **`sb_secret`** key (service role) bypasses RLS — used only in server-side routes for admin tasks (e.g., cross-document operations)
- **`sb_publishable`** key (anon key) respects RLS — used in browser and in anon-accessible API routes

---

## 8. Frontend Migration Plan

The existing `SignProz.html` SPA gets migrated into a Next.js App Router project. The hash-based routing (`#home`, `#dashboard`, etc.) becomes Next.js route groups.

```
app/
├── layout.tsx                    # Root layout with Supabase session providers
├── page.tsx                      # Home page (#home)
├── (site)/
│   ├── pricing/page.tsx          # Pricing (#pricing)
│   ├── about/page.tsx            # About
│   ├── privacy/page.tsx           # Privacy policy
│   └── terms/page.tsx            # Terms of service
├── (auth)/
│   ├── login/page.tsx            # Login (#login)
│   └── signup/page.tsx           # Signup (#signup)
├── dashboard/
│   ├── page.tsx                  # Main dashboard (#dashboard)
│   ├── documents/
│   │   └── [id]/
│   │       └── page.tsx          # Document editor
│   └── settings/
│       └── page.tsx              # Account settings
├── sign/
│   └── [documentId]/
│       ├── page.tsx              # Public signing page (magic token auth)
│       ├── expired/
│       │   └── page.tsx           # Token expired error page
│       ├── invalid/
│       │   └── page.tsx           # Invalid token error page
│       └── already-signed/
│           └── page.tsx           # Already signed page
├── api/                          # API routes (see Section 4)
├── components/                   # Shared UI components
└── lib/
    ├── supabase/
    │   ├── browser.ts             # createBrowserClient (sb_publishable)
    │   └── server.ts              # createServerClient (sb_publishable / sb_secret)
    ├── email/
    │   ├── sendMagicLink.ts       # Internal utility (not a route)
    │   ├── sendCompletionEmail.ts
    │   └── templates/             # React Email templates
    └── utils.ts
```

**Key integration point:** The existing `SignProz.html` sets `window.SIGNPROZ_REFERRALS_API` and `window.SIGNPROZ_AI_AGREEMENT_API` to control API calls. In the Next.js version, both are set to `'/'` (same-origin), making all API calls point to the local `/api/` routes. No changes to the frontend fetch calls are needed — only the configuration value changes.

---

## 9. Local Dev Environment Setup

### Prerequisites
- Node.js 20+ (`node --version`)
- Supabase CLI (`npm install -g supabase`)
- Supabase account with project created

### Steps

1. **Scaffold Next.js** inside the existing project folder:
   ```bash
   cd signproz
   npx create-next-app@latest . \
     --typescript --tailwind --app-router --src-dir --no-import-alias
   # When asked "Current directory is not empty" → Yes, continue
   # When asked about existing files → Yes, overwrite .gitignore etc.
   ```

2. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr resend react-email @react-email/components uuid
   npm install -D @types/uuid
   ```

3. **Copy `.env.local`** with real values (see Section 2).

4. **Add `next.config.ts`** with dynamic `NEXT_PUBLIC_APP_URL` (see Section 2).

5. **Run Supabase locally:**
   ```bash
   npx supabase init    # Creates supabase/config.toml and supabase/.env
   supabase start       # Starts local Postgres + Studio at localhost:54321
   ```
   The migration file `supabase/migrations/00001_init.sql` (containing all tables, grants, RLS policies, triggers, and the audit log delete-prevention trigger) is applied automatically by `supabase start` or by running `supabase db push`.

6. **Start dev server:**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:3000`
   - Supabase Studio: `http://localhost:54321` (password in `supabase/.env`)
   - API: `http://localhost:3000/api/*`

### Vercel Deployment

```bash
npm install -g vercel
vercel
# Follow prompts → deploys both frontend and API routes
```

Set environment variables in **Vercel Dashboard → Settings → Environment Variables** before deploying — all five variables from Section 2.

---

## 10. Phases

| Phase | What's Built | Status |
|---|---|---|
| 1 | Migration to Next.js, Supabase schema (all tables, RLS, triggers), auth, document CRUD, signing flow with sequential/parallel support, field assignment, magic link emails, token expiry handling, AI agreement analysis | This spec |
| 2 | Stripe billing, subscriptions, Stripe Connect for affiliates | Not in scope |
| 3 | Webhooks, integrations, compliance certs, reminder cron jobs | Not in scope |

---

## 11. Design Decisions

| Decision | Rationale |
|---|---|
| Next.js App Router over standalone API | Unifies frontend + backend, Vercel handles both, no CORS |
| Supabase Auth over Clerk/Auth0 | Already on Supabase, magic links are perfect for signer flow |
| Resend over Supabase Edge Functions | Simpler dev loop, works in standard Node.js, easy local testing |
| `sendMagicLink.ts` as internal utility (not a route) | Magic link dispatch is always triggered by business logic (send or resend), never a public-facing HTTP endpoint |
| Document status `partially_signed` over `signed` | Ambiguous when multiple signers exist; `partially_signed` clearly shows progress |
| Sequential/parallel via `signers.order` | Zero new tables; order values naturally encode both modes |
| RLS policy + route validation as dual-layer defence | Route handler validates token first; RLS policy provides defence-in-depth against header injection |
| Magic token per signer (not per document) | Granular security — one compromised link doesn't expose all signers |
| Profile creation via DB trigger on `auth.users` | Eliminates race condition; profile row exists before any FK-referencing insert |
| `commission_currency` column added now | International expansion is easier before Phase 2 schema changes |
| Audit log DELETE blocked at DB level | Convention alone isn't enough — enforced in schema protects the compliance use case |

---

*Please review and let me know if any changes are needed before we proceed to the implementation plan.*