2026-02-16: Ev reported that a previous replacement shipment used SKUs that do not exist. Likely cause: ShipBob replacement order API created a NEW inventory item (e.g., 22374746) due to missing Package Preference (PackagePreferenceNotSet) instead of using the existing SKU/inventory (e.g., Thick inv 8696102). Need to ensure replacements reference existing ShipBob inventory IDs/SKUs and package preferences are set before creating replacements.

## 2026-02-16: MoneySamurai sync auth — correct OTP flow
- `supabase.auth.admin.generateLink({type:'magiclink'})` returns `properties.email_otp` (raw numeric OTP)
- Use `verifyOtp({ email, token: email_otp, type: 'email' })` — NOT the hashed_token, NOT the URL token param
- The URL `token` param and `hashed_token` are for browser redirect flows and expire immediately for programmatic use
- Fixed in `moneysamurai/api/trigger-sync.mjs`

## 2026-02-17 — B2B email sent without approval + wrong assumption
- Sent follow-up email to Noveon Magnetics without showing Ev the draft first. External emails = ask first, always.
- Asked about bottle size preference — B2B case orders are always 16oz. Don't ask what we should already know.

## 2026-02-17 — Himalaya attachments require MML multipart syntax
- `<#part filename=...>` inside plain text body does NOT work — it gets sent as literal text
- Must wrap in `<#multipart type=mixed>` with `<#part type=text/plain>` for body + `<#part filename=...>` for attachments
- See references/message-composition.md for correct syntax

## 2026-02-17 — Sent customer email from wrong account (evgueni@ instead of sales@)
- Replied to Ryan Belnap from default `gluemasters` account (evgueni@) instead of `--account sales` (sales@)
- Also didn't reply to thread — sent a fresh email instead of using In-Reply-To
- **Rule:** Customer/B2B replies ALWAYS use `--account sales` and reply to the thread (get Message-ID from original, set In-Reply-To + References headers)

## 2026-02-17 — Wrong himalaya account for sales emails
- Customer/B2B emails come into `--account sales` (sales@gluemasters.com), NOT the default `gluemasters` account (evgueni@gluemasters.com)
- The sales monitor cron already uses the sales account — always check `--account sales` first for customer correspondence
- Default account (gluemasters) is evgueni@ which gets newsletters, Amazon, ShipBob, etc.
2026-02-17: MoneySamurai sync trigger cron: initial run failed (MODULE_NOT_FOUND @supabase/supabase-js when script run from /tmp); fixed by running from api dir. Also amazon_accounts.status column does not exist; script should not select it. OTP verify failed when using hashed_token; use linkData.properties.email_otp with verifyOtp type='email'.

- 2026-02-17: MoneySamurai sync trigger script: supabase sync_jobs schema lacks error_message column; use existing cron-moneysamurai-sync-trigger.cjs which verifies OTP via token_hash (hashed_token from generateLink), not by parsing token from action_link.
