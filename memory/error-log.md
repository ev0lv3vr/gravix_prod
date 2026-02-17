2026-02-16: Ev reported that a previous replacement shipment used SKUs that do not exist. Likely cause: ShipBob replacement order API created a NEW inventory item (e.g., 22374746) due to missing Package Preference (PackagePreferenceNotSet) instead of using the existing SKU/inventory (e.g., Thick inv 8696102). Need to ensure replacements reference existing ShipBob inventory IDs/SKUs and package preferences are set before creating replacements.

## 2026-02-16: MoneySamurai sync auth — correct OTP flow
- `supabase.auth.admin.generateLink({type:'magiclink'})` returns `properties.email_otp` (raw numeric OTP)
- Use `verifyOtp({ email, token: email_otp, type: 'email' })` — NOT the hashed_token, NOT the URL token param
- The URL `token` param and `hashed_token` are for browser redirect flows and expire immediately for programmatic use
- Fixed in `moneysamurai/api/trigger-sync.mjs`
