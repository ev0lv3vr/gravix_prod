# GRAVIX V2 — Full Code Audit (2026-02-10)

## 🔴 CRITICAL (8 issues — will break in production)

### C1. Supabase client crashes SSR at import time
`frontend/src/lib/supabase.ts` — throws on missing env vars at module eval time, cascading crash across all imports.

### C2. Usage tracking is entirely localStorage — trivially bypassed
`frontend/src/hooks/useUsageTracking.ts` — DevTools → clear localStorage = unlimited free uses. Backend UsageService exists but frontend never fetches real usage.

### C3. Frontend ↔ Backend schema mismatch (Spec Engine)
Frontend sends `{ bond_requirements: { load_type }, environment: { conditions } }` but backend expects `BondRequirements(shear_strength, tensile_strength...)` and `EnvironmentalConditions(humidity, chemical_exposure...)`. Also `cure_constraints` sent as string, backend expects object. **Every API call will 422.**

### C4. Frontend ↔ Backend schema mismatch (Failure Analysis)
Frontend sends `environment_conditions`, `production_impact`, `industry` — backend schema doesn't have these. Response mapping assumes `response.rootCauses` (camelCase) but backend returns `root_causes` (snake_case) with different structure.

### C5. Pricing page wrong env var + wrong checkout payload
Uses `NEXT_PUBLIC_BACKEND_URL` (not `NEXT_PUBLIC_API_URL`). Sends `{ tier: 'pro' }` but backend expects `{ price_id: str }`.

### C6. Auth callback doesn't properly establish session
Creates new Supabase client inline, verified session never stored to client cookies. AuthContext `onAuthStateChange` may never fire. Also redirects to `/auth/error` which doesn't exist.

### C7. Backend requires ALL env vars — no graceful degradation
Missing any one of 11 required env vars crashes entire API. Can't even hit /health without Stripe + Resend + Anthropic keys.

### C8. Plan limits mismatch
Frontend: 5 free analyses. Backend: 2. Spec says 5. Pro: frontend says "Unlimited", backend enforces 15.

---

## 🟡 MAJOR (16 issues)

- M1: Footer links to /about, /privacy, /terms — pages don't exist
- M2: Social proof bar hardcoded — never calls /api/stats/public
- M3: Dashboard uses hardcoded mock data
- M4: History page uses hardcoded mock data
- M5: Case library hardcoded (6 cases, only 2 have detail pages)
- M6: Settings page save does nothing (TODO comment)
- M7: Feedback page does nothing (TODO comment)
- M8: "Export PDF" buttons have no onClick handler
- M9: "Request Expert Review" buttons do nothing
- M10: React Query Providers wrapper defined but never used
- M11: EnvironmentChips component unused (forms have inline impl)
- M12: ConfidenceIndicator vs ConfidenceBadge — duplicate, one unused
- M13: Backend PDF endpoints are POST, frontend expects GET (405)
- M14: Backend case view count has race condition
- M15: Stripe webhook returns 200 even on errors
- M16: datetime import ordering issue in stripe_service.py

---

## 🟢 MINOR (15 issues)

- m1: `_isFree` parameter unused in results components
- m2: Frontend types.ts doesn't match actual form data shapes
- m3: toast.ts uses undefined CSS animation class
- m4: uuid dependency may be missing from package.json
- m5: Loading skeleton colors don't match page colors
- m6: `font-heading` class used in globals.css but never defined in Tailwind
- m7: No rate limiting on backend (AI endpoints cost money per call)
- m8: Backend uses anon key for authenticated operations (relies on RLS)
- m9: gapFill typed as string but rendered as number input
- m10: pdfUtils potential null access on empty rootCauses
- m11: No custom 404 page
- m12: Missing aria-labels on interactive elements
- m13: ConfidenceIndicator uses undefined Tailwind classes
- m14: Root page renders own Header (fine but fragile)
- m15: SpecRequestCreate requires object fields with no defaults

---

## What's solid
- Demo mode mock data (excellent, substrate-aware)
- UI design and dark-mode styling
- AI prompts (deep domain knowledge)
- Backend architecture (clean separation)
- Auth modal UX
- Failure mode SVG cards
- Substrate typeahead selector

## Priority fix order
1. Fix frontend↔backend schema contracts (C3, C4, C5)
2. Fix Supabase SSR crash (C1)
3. Align plan limits (C8)
4. Fix auth callback (C6)
5. Make backend env vars optional where possible (C7)
6. Wire real API data to dashboard/history/cases (M3-M5)
7. Wire PDF export + feedback (M7, M8)
