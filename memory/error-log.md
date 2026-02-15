
2026-02-14: MoneySamurai sync trigger: supabase-js verifyOtp for magiclink should use {type:'magiclink', token_hash: properties.hashed_token} (not token=email_otp/hashed_token). Also sync_status table missing in PostgREST schema cache; use best-effort and proceed.
