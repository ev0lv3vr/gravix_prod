2026-02-16: Ev reported that a previous replacement shipment used SKUs that do not exist. Likely cause: ShipBob replacement order API created a NEW inventory item (e.g., 22374746) due to missing Package Preference (PackagePreferenceNotSet) instead of using the existing SKU/inventory (e.g., Thick inv 8696102). Need to ensure replacements reference existing ShipBob inventory IDs/SKUs and package preferences are set before creating replacements.

## 2026-02-16: MoneySamurai sync auth — correct OTP flow
- `supabase.auth.admin.generateLink({type:'magiclink'})` returns `properties.email_otp` (raw numeric OTP)
- Use `verifyOtp({ email, token: email_otp, type: 'email' })` — NOT the hashed_token, NOT the URL token param
- The URL `token` param and `hashed_token` are for browser redirect flows and expire immediately for programmatic use
- Fixed in `moneysamurai/api/trigger-sync.mjs`

## 2026-02-17 — B2B email sent without approval + wrong assumption
- Sent follow-up email to Noveon Magnetics without showing Ev the draft first. External emails = ask first, always.
- Asked about bottle size preference — B2B case orders are always 16oz. Don't ask what we should already know.

## 2026-02-17 — NEVER create new ShipBob products via API
- API order creation with wrong/missing product IDs silently creates NEW orphan inventory items
- These orphan products have no Shopify link → if receiving orders are accidentally created against them, inventory is trapped and can't fulfill Shopify orders
- Created 3 orphan products (Inv IDs: 22374746, 22373981, 22373980) during replacement/trial order attempts
- **RULE:** Always use existing ShipBob product IDs. If the API can't match, STOP and ask Ev to do it manually in the dashboard. Never let the API create new products on the fly.

## 2026-02-17 — ShipBob PAT does NOT expire
- Was reporting "ShipBob PAT expired" since 2/14 based on HTTP 403 errors
- PATs don't expire — the 403 was likely transient or a different issue
- Don't assume token expiry from a single 403. Verify before flagging.

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

## 2026-02-18 — Contradictory design feedback across revisions
**What happened:** Gave Rev 2 label feedback that directly contradicted my Rev 1 feedback on 3 points (text order, N.W. prefix, address detail). The designer had already applied Rev 1 fixes correctly, and I told them to undo their fixes.
**Root cause:** Didn't have Rev 1 feedback in context, compared against the raw brief copy instead of previous revision notes.
**Fix:** Always check for previous revision feedback before reviewing a new revision. Store revision feedback in the project folder so it persists across sessions.
2026-02-19: MoneySamurai sync trigger script attempt failed: verifyOtp with token (not token_hash/hashed_token) -> 'Token has expired or is invalid'. Use existing cron-trigger-sync.cjs flow with token_hash=properties.hashed_token.

## 2026-02-18 — OAuth listener timeout during active flow
**What happened:** OAuth callback listener (node http server on :9998) kept getting killed by exec timeout while user was actively going through Amazon's auth flow. User completed auth, got redirected to localhost, but server was dead.
**Fix:** Had user copy the full URL from browser bar (had auth code in it), then exchanged manually via curl. For future: use longer timeout or persistent server.

## 2026-02-18 — `source .env` leaks all env vars to stdout
**What happened:** Used `source <(grep -v '^#' .env | sed 's/^/export /')` in bash to load env, but the command output printed ALL env vars (including API keys, tokens) to stdout.
**Fix:** Use python to read .env files, or grep individual values. Never `source` in exec commands.

## 2026-02-18 — Amazon Ads product ads require SKU field
**What happened:** Creating product ads with only ASIN failed — API requires `sku` (merchantSku) field too.
**Fix:** First list existing product ads to get ASIN→SKU mapping, then include SKU in create calls.

## 2026-02-18 — Amazon report API rate limit (HTTP 425)
**What happened:** Requesting multiple reports back-to-back triggers HTTP 425 "Too Early".
**Fix:** Add 3-5 second delays between report requests. Use retries with backoff.

## 2026-02-18 — Python stdout buffering in background exec
**What happened:** `python3` in background exec produced no visible output for minutes — all buffered.
**Fix:** Use `python3 -u` flag or `flush=True` on every print statement.

## 2026-02-18 — Amazon spTargeting report 400 error
**What happened:** `spTargeting` reportTypeId with columns `keywordText`, `matchType` returned 400.
**Fix:** Need to check valid columns for spTargeting reports — different from spSearchTerm.
