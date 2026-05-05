# SignProz Manual Test Script
**Project:** SignProz — Smart eSignature Platform
**Environment:** QA / Local (`http://localhost:3000`)
**Browser:** Chrome (Latest)
**Tested by:** Manual QA
**Last Updated:** 2026-05-04

> Moving from exploratory testing to structured scripting ensures no matter who runs the test, the result is consistent and documented.

---

## Test Suite: TS-AUTH | Authentication

### TS-AUTH-001 | User Registration (Signup)
**Objective:** Verify a new user can create an account.

**Prerequisites:**
- Application accessible at `http://localhost:3000`
- No existing account for the test email

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000/signup` | Signup form loads with Full Name, Email, Password fields | |
| 2 | Enter full name: `Test User` | Text accepted and displayed | |
| 3 | Enter email: `testuser_[date]@example.com` | Valid email format accepted | |
| 4 | Enter password: `TestPassword123` | Password masked, minimum 8 chars accepted | |
| 5 | Click **"Create Account"** | System creates account, shows "Check your email!" success message | |
| 6 | Note confirmation message | Email confirmation prompt displayed | |

**Post-Conditions:** Account created in database, profile auto-generated via `handle_new_user` trigger.

---

### TS-AUTH-002 | User Login
**Objective:** Verify a registered user can log in with valid credentials.

**Prerequisites:** Account exists from TS-AUTH-001 or use `babasola@signproz.com` / `32519122`

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000/login` | Login form loads with Email, Password fields | |
| 2 | Enter email: `babasola@signproz.com` | Text accepted | |
| 3 | Enter password: `32519122` | Characters masked | |
| 4 | Click **"Sign In"** | System validates, redirects to `/dashboard` | |
| 5 | Observe dashboard header | User email shown in subscriber portal header | |

**Post-Conditions:** Session cookie created, user redirected to dashboard.

---

### TS-AUTH-003 | Login with Invalid Credentials
**Objective:** Verify proper error handling for bad credentials.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000/login` | Login form loads | |
| 2 | Enter email: `babasola@signproz.com` | Text accepted | |
| 3 | Enter wrong password: `wrongpassword` | Characters masked | |
| 4 | Click **"Sign In"** | Error: "Invalid login credentials" shown, stays on login page | |
| 5 | Enter empty email and click Sign In | Validation error shown | |
| 6 | Enter email but empty password | Validation error shown | |

---

### TS-AUTH-004 | User Logout
**Objective:** Verify user can log out successfully.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Login as `babasola@signproz.com` | Redirected to dashboard | |
| 2 | Click **"Sign Out"** in header | User logged out | |
| 3 | Attempt to access `/dashboard` | Redirected to `/login` | |

---

### TS-AUTH-005 | Protected Route Access
**Objective:** Verify unauthenticated users cannot access protected pages.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Clear all cookies/session | Not logged in | |
| 2 | Navigate to `http://localhost:3000/dashboard` | Redirected to `/login` | |
| 3 | Navigate to `http://localhost:3000/dashboard/documents/any-id` | Redirected to `/login` | |

---

## Test Suite: TS-DOC | Document Management

### TS-DOC-001 | Create New Document
**Objective:** Verify user can create a new document from the dashboard.

**Prerequisites:** Logged in as `babasola@signproz.com`

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | From dashboard, click **"+ New"** button | New document form/modal opens | |
| 2 | Enter title: `Contract Test [DATE]` | Title accepted | |
| 3 | Verify expiration defaults to 7 days | Default set correctly | |
| 4 | Click **"Create"** | Document created, appears in document list with status `draft` | |
| 5 | Observe document list | New doc shown with status badge "draft" | |

**Post-Conditions:** Document exists in DB with status `draft`, audit log entry created.

---

### TS-DOC-002 | View Document List
**Objective:** Verify dashboard displays all user documents.

**Prerequisites:** At least 2 documents exist (TS-DOC-001 + previous test docs)

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | On dashboard, observe document list | All user documents displayed | |
| 2 | Verify status badges show correct colors | `draft` = gray, `sent` = blue, `partially_signed` = amber, `completed` = green | |
| 3 | Search for document by title | List filters to matching documents | |
| 4 | Use filter: "Waiting for me" | Only docs where user is unsigned signer shown | |
| 5 | Use filter: "Waiting for others" | Only sent docs owned by user shown | |
| 6 | Use filter: "Signed" | Only completed docs shown | |

---

### TS-DOC-003 | Delete Draft Document
**Objective:** Verify user can delete a draft document.

**Prerequisites:** Logged in, document exists in `draft` status

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Find a draft document in the list | Document visible with "draft" badge | |
| 2 | Click **"More"** (ellipsis) on the document row | Dropdown opens with View, Edit, Duplicate, Delete | |
| 3 | Click **"Delete"** | Confirmation prompt appears | |
| 4 | Confirm deletion | Document removed from list | |

**Negative:** Attempting to delete a `sent` document should fail or not show delete option.

---

### TS-DOC-004 | Open Document Editor
**Objective:** Verify document opens in the editor with all panels.

**Prerequisites:** Logged in, at least one document exists

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click **"Edit"** on a draft document | Navigate to `/dashboard/documents/[id]` | |
| 2 | Verify left sidebar shows Signers tab and Fields tab | Tabs visible and clickable | |
| 3 | Verify center shows document preview area | Document content/preview area visible | |
| 4 | Verify right sidebar shows settings panel | Title, status, expiration, signing order visible | |
| 5 | Verify toolbar shows AI Review, AI Generate, Bulk Send buttons | All buttons visible | |

---

## Test Suite: TS-SIGNER | Signer Management

### TS-SIGNER-001 | Add Signer to Draft Document
**Objective:** Verify user can add a signer to a draft document.

**Prerequisites:** Logged in, document in `draft` status, document editor open

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Ensure Signers tab is active | Signers list visible (empty initially) | |
| 2 | Click **"+ Add Signer"** | Add signer form appears | |
| 3 | Enter name: `Jane Doe` and email: `jane@example.com` | Fields accept text | |
| 4 | Click **"Add"** | Signer added to list, badge shows "pending" | |
| 5 | Verify badge is "pending" (gray) | Status derived from `signed_at=null, viewed_at=null` | |
| 6 | Repeat — add a second signer | Both signers listed in order | |

**Post-Conditions:** Signer record created with unique `magic_token`.

---

### TS-SIGNER-002 | Add Signer — Validation
**Objective:** Verify proper validation when adding signers.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Try adding signer with empty name | Error: "Name and email are required" | |
| 2 | Try adding signer with empty email | Error: "Name and email are required" | |
| 3 | Try adding signer to a `sent` document | Error: "Only draft documents can have signers added" | |
| 4 | Add signer with same email twice | Should succeed (no uniqueness constraint) | |

---

### TS-SIGNER-003 | Remove Signer from Draft Document
**Objective:** Verify signer can be removed from draft.

**Prerequisites:** Document in `draft` status with at least 1 signer

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | In document editor, Signers tab | Signer listed with remove button (X) | |
| 2 | Click **X** on the signer | Signer removed from list | |
| 3 | Verify API confirms deletion | Signer record deleted from DB | |

**Negative:** Cannot remove signers from a `sent` document.

---

### TS-SIGNER-004 | Resend Magic Link
**Objective:** Verify user can resend a signing link to a signer.

**Prerequisites:** Document in `sent` status, at least one signer exists

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Open document editor for a sent document | Document status shows "sent" | |
| 2 | Locate a signer in the Signers tab | Signer row visible | |
| 3 | Click **"Resend"** or **"..."** on signer row | Magic link email triggered | |
| 4 | Verify API returns `{"message":"Magic link resent"}` | Success response with new `expires_at` | |
| 5 | Verify new token generated | `magic_token` updated in DB | |
| 6 | Verify audit log entry created | `signer_resend_link` action logged | |

---

## Test Suite: TS-FIELD | Signature Field Management

### TS-FIELD-001 | Add Signature Field
**Objective:** Verify user can place a signature field on a document.

**Prerequisites:** Document in `draft` status, editor open

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click **Fields** tab in left sidebar | Field palette visible with 18 field types | |
| 2 | Drag a **Signature** field from palette to document preview | Field placed at drop location | |
| 3 | Verify field appears as dashed box on preview | Colored box with "signature" label | |
| 4 | Verify field is saved in DB | `signature_fields` record created | |
| 5 | Add fields of all 13 types: initials, date, text, checkbox, radio, dropdown, attachment, name, email, company, title, phone, address | All fields placeable | |

---

### TS-FIELD-002 | Assign Field to Signer
**Objective:** Verify a field can be assigned to a specific signer.

**Prerequisites:** Document has at least 1 signer and 1 field

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | In Fields tab, click on a placed field | Field selected, selection border shown | |
| 2 | Verify Field Settings panel shows on right | Required checkbox, label, width, height controls visible | |
| 3 | Select a signer from signer dropdown | Field assigned to that signer | |
| 4 | Verify assigned field shows signer name on overlay | Field overlay displays signer name | |
| 5 | Attempt to send document with unassigned fields | Error: "All signature fields must be assigned" | |

---

### TS-FIELD-003 | Move and Resize Field
**Objective:** Verify placed fields can be repositioned and resized.

**Prerequisites:** At least 1 field placed on document preview

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click on a placed field | Field selected, delete button + resize handle visible | |
| 2 | Drag field to new position | Field repositions smoothly | |
| 3 | Verify position stored as percentage | `position_x`, `position_y` in 0–100 range | |
| 4 | Drag resize handle (bottom-right) | Field resizes, width/height updated | |
| 5 | Click **X** button to delete field | Field removed from document | |

---

### TS-FIELD-004 | PDF Upload via Drop
**Objective:** Verify a PDF can be uploaded by dropping onto the preview.

**Prerequisites:** Document editor open, draft document

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Drag a PDF file over the document preview | Amber drop highlight shown | |
| 2 | Drop the PDF file | Filename shown as overlay on preview | |
| 3 | Verify "Remove" button to clear upload | Can remove uploaded PDF | |
| 4 | Use "Upload PDF" button as alternative | File picker opens | |

---

## Test Suite: TS-SEND | Document Send Flow

### TS-SEND-001 | Send Document for Signing (Parallel)
**Objective:** Verify document can be sent to multiple signers simultaneously.

**Prerequisites:** Document in `draft` status, 2+ signers added, all fields assigned to signers

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Verify all fields are assigned to signers | No unassigned field warning | |
| 2 | Click **"Send for Signing"** button | Confirmation / loading state | |
| 3 | Verify document status changes to `sent` | Status badge updates to blue "sent" | |
| 4 | Verify magic link emails dispatched | All signers receive signing emails | |
| 5 | Verify `sent_at` timestamp set | Document.sent_at populated | |
| 6 | Verify audit log entry `document.sent` | Action logged with signer_count | |

---

### TS-SEND-002 | Send Document — Validation Errors
**Objective:** Verify send fails with appropriate errors when conditions aren't met.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Attempt to send document with 0 signers | Error: "At least one signer is required" | |
| 2 | Attempt to send document with unassigned fields | Error: "All signature fields must be assigned" | |
| 3 | Attempt to send already-sent document | Error: "Only draft documents can be sent" | |
| 4 | Attempt to send document with no fields (valid signers) | Succeeds — fields not mandatory | |

---

### TS-SEND-003 | Bulk Send
**Objective:** Verify multiple documents can be sent at once.

**Prerequisites:** Multiple draft documents with signers added

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click **"Bulk Send"** button in toolbar | Bulk send modal opens | |
| 2 | Select 2 documents from list | Documents checked | |
| 3 | Enter optional custom message | Message accepted | |
| 4 | Click **"Send All"** | Progress shown, emails dispatched | |
| 5 | Verify summary toast after completion | "X of Y sent successfully" message | |
| 6 | Verify all selected docs now `sent` | Status updated | |

---

## Test Suite: TS-SIGN | Signing Ceremony

### TS-SIGN-001 | Magic Link — Valid Token
**Objective:** Verify signer can access document via magic link.

**Prerequisites:** Document sent, signer email accessible

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Open magic link from email (format: `/sign/[docId]?token=[magic_token]`) | Sign page loads with document title | |
| 2 | Verify document content displayed | HTML content rendered in preview | |
| 3 | Verify signature fields shown as overlays | Fields visible on document preview | |
| 4 | Verify progress bar shows "0 of N fields" | Progress indicator visible | |
| 5 | Verify signer name/email shown | Confirmation of signing identity | |

---

### TS-SIGN-002 | Typed Signature
**Objective:** Verify signer can sign using the typed (styled) method.

**Prerequisites:** Sign page loaded with valid token, document has signature field

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Ensure **Type** tab is selected | Type input field visible | |
| 2 | Type full name: `Jane Doe` | Text shown in signature style (Caveat font) | |
| 3 | Verify styled preview updates live | Signature rendered elegantly, not plain text | |
| 4 | Click the field overlay on the document | Field focused | |
| 5 | Verify progress updates to "1 of N" | Progress bar advances | |
| 6 | Click **"Sign Document"** | Loading state shown | |
| 7 | Verify success screen displayed | "Document Signed!" confirmation | |

---

### TS-SIGN-003 | Drawn Signature
**Objective:** Verify signer can draw their signature on a canvas.

**Prerequisites:** Sign page loaded, signature field exists

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click **"Draw"** tab | Canvas displayed, Clear and Save Drawing buttons visible | |
| 2 | Draw signature on canvas with mouse | Strokes appear on canvas | |
| 3 | Click **"Clear"** | Canvas cleared | |
| 4 | Draw again and click **"Save Drawing"** | Signature saved as data URL | |
| 5 | Verify preview shows drawn signature | Drawn signature visible in field | |
| 6 | Submit signature | Document signed successfully | |

---

### TS-SIGN-004 | Sequential Signing Order
**Objective:** Verify sequential signing enforces order.

**Prerequisites:** Document sent with 2+ signers where order > 0

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Open magic link as second signer (order=1) when first (order=0) has not signed | "Waiting for [First Signer Name] to sign first" screen shown | |
| 2 | Open magic link as first signer (order=0) | Normal signing page shown | |
| 3 | First signer completes signing | Success screen, status `completed` if last signer | |
| 4 | Now open magic link as second signer | Should now show signing page (not wait screen) | |
| 5 | Verify next signer email triggered | Magic link sent to next signer after previous completes | |

---

### TS-SIGN-005 | Document Status — All Signed → Completed
**Objective:** Verify document transitions to `completed` when all signers finish.

**Prerequisites:** Document with 1 signer, signer's magic link

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Signer completes signing | Success screen shown | |
| 2 | Check document status in dashboard | Status badge is **green "completed"** | |
| 3 | Verify `completed_at` timestamp set | Document.completed_at populated | |
| 4 | Verify completion email sent to document owner | Email received with "Document completed" | |
| 5 | Verify audit log entry `document.completed` | Action logged | |

---

### TS-SIGN-006 | Document Status — Partially Signed (Multi-Signer)
**Objective:** Verify document stays `partially_signed` until all signers complete.

**Prerequisites:** Document with 2 signers, parallel mode

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | First signer signs | Document status becomes `partially_signed` | |
| 2 | Check status in owner dashboard | Amber "partially_signed" badge | |
| 3 | Second signer signs | Status becomes `completed` | |

---

### TS-SIGN-007 | Expired Magic Link
**Objective:** Verify expired signing links are handled gracefully.

**Prerequisites:** Signer with `token_expires_at` in the past

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `/sign/[docId]?token=[expired_token]` | Redirected to `/sign/[docId]/expired` | |
| 2 | Verify expired page displayed | "Signing Link Expired" message | |
| 3 | Verify expired notification email sent to owner | Email received (non-critical, doesn't block error) | |

---

### TS-SIGN-008 | Invalid Magic Link
**Objective:** Verify invalid tokens are handled.

**Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `/sign/[docId]?token=invalid-token-xyz` | Redirected to `/sign/[docId]/invalid` | |
| 2 | Verify invalid page displayed | "Invalid Signing Link" message | |

---

### TS-SIGN-009 | Already Signed
**Objective:** Verify already-signed signer cannot sign again.

**Prerequisites:** Signer who has already signed (signed_at set)

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Open magic link for already-signed signer | Redirected to "Already Signed" screen | |
| 2 | Verify success screen shows green checkmark | "You have already signed this document" message | |
| 3 | Verify signing form not accessible | No form fields or submit button shown | |

---

### TS-SIGN-010 | Completed Document — No More Signing
**Objective:** Verify fully completed documents cannot accept new signatures.

**Prerequisites:** Document with `status = completed`

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Open magic link for any signer of completed doc | "Document Completed" screen shown | |
| 2 | Verify no signing form accessible | Form elements not rendered | |

---

## Test Suite: TS-AI | AI Features

### TS-AI-001 | AI FAQ Chat — Home Page
**Objective:** Verify AI FAQ chatbot is accessible from home page.

**Prerequisites:** Home page loads

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click floating **"AI FAQ"** bubble (bottom-right) | Modal opens with chat interface | |
| 2 | Type a question: "How do I send a document?" | Response displayed in chat | |
| 3 | Click **"AI FAQ Chat"** button in hero section | Same modal opens | |
| 4 | Close modal | Modal dismisses | |

---

### TS-AI-002 | AI Agreement Review (Dashboard)
**Objective:** Verify AI can analyze document text for risks.

**Prerequisites:** Logged in, document editor open

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | In document editor, enter text in AI Review textarea | Text accepted | |
| 2 | Click **"Analyze with AI"** button | Loading indicator shown | |
| 3 | Verify analysis results returned | Summary, key terms, risk flags displayed | |
| 4 | Verify violet (AI Review) button style | `bg-violet-100 text-violet-800` | |

---

### TS-AI-003 | AI Generate Template
**Objective:** Verify AI can generate a document template.

**Prerequisites:** Logged in, document editor open

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click **"AI Generate Template"** (teal button) | Modal opens with prompt field | |
| 2 | Enter a template description | Prompt accepted | |
| 3 | Click **"Generate draft"** | Loading state, then template generated | |
| 4 | Verify template result displayed | Draft content shown | |

---

## Test Suite: TS-DASH | Dashboard

### TS-DASH-001 | Dashboard — Document Workspace Tab
**Objective:** Verify workspace tab shows all document management features.

**Prerequisites:** Logged in

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Verify **Workspace** tab is active by default | Tab selected | |
| 2 | Verify sidebar shows: Upload, Get from Cloud, Documents, + New | All nav items visible | |
| 3 | Verify document list loads | All user documents displayed | |
| 4 | Verify **Orange Upload** button styled correctly | `backgroundColor: #ff4e00`, full width, bold | |
| 5 | Click **"Get from Cloud"** | Dropdown opens with Google Drive, Dropbox, Box | |
| 6 | Verify search bar filters document list | Typing filters by title | |

---

### TS-DASH-002 | Dashboard — Referrals & Rewards Tab
**Objective:** Verify affiliate program panel displays correctly.

**Prerequisites:** Logged in

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Click **"Referrals & Rewards"** tab | Tab selected, referral stats shown | |
| 2 | Verify referral stats: total, active, expected payout, paid out | Stats cards visible | |
| 3 | Verify tier badge shown | Bronze/Silver/Gold/Platinum based on referrals | |
| 4 | Verify 3-year earnings projection table | Revenue projection visible | |
| 5 | Click **"Load sample"** button | Sample referral data loaded and displayed | |
| 6 | Copy referral link | Link copied, confirmation shown | |

---

### TS-DASH-003 | Stripe Payout Panel
**Objective:** Verify Stripe Connect flow in referrals panel.

**Prerequisites:** Logged in, Referrals tab open

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Verify Stripe panel visible in Referrals tab | Withdrawable balance, eligibility, status badge shown | |
| 2 | Verify status badge: "Not connected" (gray) | Default state shown | |
| 3 | Click **"1) Connect Stripe"** | Step changes to "pending" | |
| 4 | Click **"2) Confirm connection"** | Status changes to "Connected" (green) | |
| 5 | Verify "Withdraw earnings" button enabled | Enabled when connected AND eligible | |
| 6 | Check eligibility message | Shows "$50 minimum" or "Ready to withdraw" | |

---

## Test Suite: TS-EMAIL | Email Delivery

### TS-EMAIL-001 | Magic Link Email Sent
**Objective:** Verify magic link email is dispatched when document is sent.

**Prerequisites:** Supabase local Inbucket running (port 54325), document with signer

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Send document (TS-SEND-001) | Emails dispatched | |
| 2 | Open Mailpit: `http://localhost:54325` | Email visible in inbox | |
| 3 | Verify email subject contains document title | Subject: "You've been asked to sign: [Title]" | |
| 4 | Verify email contains signing link | Magic link URL visible in email body | |
| 5 | Verify "Review and Sign Document" CTA button | Button present with link | |
| 6 | Verify sender: `SignProz <noreply@signproz.com>` | From address correct | |

---

### TS-EMAIL-002 | Completion Email
**Objective:** Verify completion email sent when all signers finish.

**Prerequisites:** Document with status `completed` from TS-SIGN-005

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Check Mailpit for completion email | Email from `noreply@signproz.com` | |
| 2 | Verify subject: "Document signed: [Title]" | Correct subject line | |
| 3 | Verify body confirms all signers completed | Text mentions signer count | |

---

## Test Suite: TS-AUDIT | Audit Log

### TS-AUDIT-001 | Audit Log — Document Editor
**Objective:** Verify audit log tab shows document activity.

**Prerequisites:** Document with activity (sent, signed)

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | In document editor, click **"Audit Log"** tab | Log entries listed | |
| 2 | Verify entries show: timestamp, action, actor email | Columns populated | |
| 3 | Verify `document.sent` entry | Action logged with signer_count | |
| 4 | Verify `signer.signed` entry | Actor email = signer's email | |
| 5 | Click **Refresh** button | Log re-fetches from API | |
| 6 | Verify empty state if no activity | "No activity yet" message | |

---

## Test Suite: TS-SMOKE | Smoke Tests

### TS-SMOKE-001 | Application Loads — Home Page
**Objective:** High-level smoke test for home page.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000/` | Home page loads within 5 seconds | |
| 2 | Verify hero section with headline | "Professional agreement workflows..." visible | |
| 3 | Verify navigation: Home, Pricing, Templates, Sign In, Start Free | Nav links visible | |
| 4 | Verify feature comparison table | SignProz vs DocuSign, Dropbox Sign, etc. | |
| 5 | Verify key features pills | All 25 features listed | |
| 6 | Verify footer: About, Privacy, Terms, Affiliate | Footer links functional | |

---

### TS-SMOKE-002 | Application Loads — Pricing Page
**Objective:** Smoke test for pricing page.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000/pricing` | Pricing page loads | |
| 2 | Verify 3-tier pricing table | Free, Pro, Premium plans | |
| 3 | Verify annual/monthly toggle if present | Toggle functional | |
| 4 | Verify "Get Started" CTA buttons | Buttons link to signup | |

---

### TS-SMOKE-003 | Navigation — Static Pages
**Objective:** Smoke test all static content pages.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `/about` | About page loads | |
| 2 | Navigate to `/privacy` | Privacy policy page loads | |
| 3 | Navigate to `/terms` | Terms & Conditions page loads | |
| 4 | Navigate to `/templates` | Templates page loads | |
| 5 | Navigate to `/affiliate` | Affiliate program page loads | |
| 6 | Navigate to `/demo` | Demo page loads | |

---

### TS-SMOKE-004 | Sign Page — Token Missing
**Objective:** Smoke test sign page without token.

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000/sign/any-doc-id` (no token) | "Missing Signing Link" error shown | |
| 2 | Verify no form rendered | Form not accessible without token | |

---

## Test Suite: TS-RBAC | Role-Based Access Control

### TS-RBAC-001 | Users Cannot See Others' Documents
**Objective:** Verify RLS prevents cross-user document access.

**Prerequisites:** Two user accounts, each with documents

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Login as User A | User A dashboard shows only User A's documents | |
| 2 | Attempt to access `/api/documents/[UserB-Doc-ID]` | 401 or 404 returned | |
| 3 | Attempt to add signer to User B's document | 404 "Document not found" | |
| 4 | Attempt to sign document via User B's magic link | 401 "Invalid token" if token doesn't match | |

---

### TS-RBAC-002 | Audit Log Append-Only
**Objective:** Verify audit logs cannot be deleted (append-only).

| Step # | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Attempt DELETE on `/api/audit-logs/[id]` | Blocked at DB trigger level | |
| 2 | Verify no delete option in UI | No delete button in audit log tab | |

---

## Test Summary Sheet

| Test ID | Suite | Test Name | Priority | Status |
|---|---|---|---|---|
| TS-AUTH-001 | Auth | User Registration | P0 | |
| TS-AUTH-002 | Auth | User Login | P0 | |
| TS-AUTH-003 | Auth | Login — Invalid Credentials | P1 | |
| TS-AUTH-004 | Auth | User Logout | P1 | |
| TS-AUTH-005 | Auth | Protected Route Access | P1 | |
| TS-DOC-001 | Document | Create New Document | P0 | |
| TS-DOC-002 | Document | View Document List | P1 | |
| TS-DOC-003 | Document | Delete Draft Document | P1 | |
| TS-DOC-004 | Document | Open Document Editor | P0 | |
| TS-SIGNER-001 | Signer | Add Signer to Draft | P0 | |
| TS-SIGNER-002 | Signer | Add Signer — Validation | P2 | |
| TS-SIGNER-003 | Signer | Remove Signer | P1 | |
| TS-SIGNER-004 | Signer | Resend Magic Link | P1 | |
| TS-FIELD-001 | Field | Add Signature Field | P0 | |
| TS-FIELD-002 | Field | Assign Field to Signer | P0 | |
| TS-FIELD-003 | Field | Move and Resize Field | P2 | |
| TS-FIELD-004 | Field | PDF Upload via Drop | P2 | |
| TS-SEND-001 | Send | Send Document (Parallel) | P0 | |
| TS-SEND-002 | Send | Send — Validation Errors | P1 | |
| TS-SEND-003 | Send | Bulk Send | P2 | |
| TS-SIGN-001 | Signing | Magic Link — Valid Token | P0 | |
| TS-SIGN-002 | Signing | Typed Signature | P0 | |
| TS-SIGN-003 | Signing | Drawn Signature | P1 | |
| TS-SIGN-004 | Signing | Sequential Signing Order | P1 | |
| TS-SIGN-005 | Signing | All Signed → Completed | P0 | |
| TS-SIGN-006 | Signing | Partially Signed | P1 | |
| TS-SIGN-007 | Signing | Expired Magic Link | P1 | |
| TS-SIGN-008 | Signing | Invalid Magic Link | P1 | |
| TS-SIGN-009 | Signing | Already Signed | P1 | |
| TS-SIGN-010 | Signing | Completed — No More Signing | P1 | |
| TS-AI-001 | AI | AI FAQ Chat | P1 | |
| TS-AI-002 | AI | AI Agreement Review | P2 | |
| TS-AI-003 | AI | AI Generate Template | P2 | |
| TS-DASH-001 | Dashboard | Workspace Tab | P0 | |
| TS-DASH-002 | Dashboard | Referrals Tab | P1 | |
| TS-DASH-003 | Dashboard | Stripe Payout Panel | P2 | |
| TS-EMAIL-001 | Email | Magic Link Email Sent | P0 | |
| TS-EMAIL-002 | Email | Completion Email | P1 | |
| TS-AUDIT-001 | Audit | Audit Log in Editor | P2 | |
| TS-SMOKE-001 | Smoke | Home Page Loads | P0 | |
| TS-SMOKE-002 | Smoke | Pricing Page Loads | P1 | |
| TS-SMOKE-003 | Smoke | Static Pages Load | P1 | |
| TS-SMOKE-004 | Smoke | Sign Page — No Token | P1 | |
| TS-RBAC-001 | RBAC | No Cross-User Access | P0 | |
| TS-RBAC-002 | RBAC | Audit Log Append-Only | P0 | |

**Priority Key:**
- **P0** — Must pass (critical path)
- **P1** — Should pass (important feature)
- **P2** — Nice to have (edge case / secondary feature)