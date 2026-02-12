# Sprint 8 Report — Auth & Account Completeness

**Date:** 2026-02-12

## Shipped

### 8.1 Delete Account Backend (P0)
- Added `DELETE /users/me` (auth-required) to delete **only the current user**.
- Best-effort cascade cleanup across user-owned public tables:
  - `failure_analyses`, `spec_requests`, `feedback`, `analysis_feedback`, `api_request_logs`, `ai_engine_logs`, plus `users` row.
- Cancels any active Stripe subscriptions for the user (if Stripe is configured + `stripe_customer_id` exists).
- Deletes the Supabase **Auth user** via Admin API.
- Writes an audit event to `admin_audit_log` with action `delete_account`.

### 8.2 PATCH /users/me verified (backend + frontend)
- Backend already had `PATCH /users/me` updating `users` fields.
- Frontend Settings page already calls it via `api.updateProfile()`.

### 8.3 Auth callback robustness
- `/auth/callback` (Next.js route handler) supports:
  - OAuth `code` → `exchangeCodeForSession`
  - Email confirmation + recovery flows via `token_hash` + `type` → `verifyOtp`
- Added `/auth/error` page for failed callback cases.

### 8.4 Password reset flow end-to-end
- Password reset emails now redirect to `/auth/callback?next=/auth/reset`.
- Added `/auth/reset` page to let the user set a new password using `supabase.auth.updateUser({ password })`.

## Manual dashboard steps required (Supabase / Stripe)

### Supabase Auth → URL Configuration
Ensure the following are present in **Auth → URL Configuration**:
- **Site URL**: `https://gravix.com` (and optionally `https://www.gravix.com` if used)
- **Redirect URLs** (at minimum):
  - `https://gravix.com/auth/callback`
  - `https://www.gravix.com/auth/callback` (if you use www)
  - `http://localhost:3000/auth/callback` (dev)

Password reset + email confirmation flows depend on this.

### Stripe
No dashboard changes required, but:
- Ensure `STRIPE_SECRET_KEY` is set in API env.
- If subscriptions are managed elsewhere, confirm cancellation semantics (current behavior cancels active/trialing subscriptions immediately).
