# Gravix V2 — Gap Closure Plan

**Created:** 2026-02-11  
**Status:** Active  
**Goal:** Close every gap between V1/V2 specs and production. Zero missing functionality.

---

## Sprint 6 — Knowledge Engine (THE DIFFERENTIATOR) ✅ COMPLETE (2/11 nightly)

The self-learning AI loop is the #1 thing we sell — **now built.**

### 6.1 Knowledge Aggregation Job
**What:** Cron job that reads `analysis_feedback` + completed analyses, groups by substrate pair + root cause + adhesive family, computes success rates, writes/upserts to `knowledge_patterns`.
- File: `gravix-v2/api/services/knowledge_aggregator.py`
- Wire into: `gravix-v2/api/routers/cron.py` → `/aggregate-knowledge`
- Runs: Daily via cron or on-demand
- **Test:** Submit 3 feedback entries for same substrate pair. Run aggregation. Verify `knowledge_patterns` row exists with `evidence_count=3` and correct `success_rate`.

### 6.2 Knowledge Injection into AI Prompts
**What:** Before calling Claude for failure analysis or spec generation, query `knowledge_patterns` for matching substrate pair / adhesive family. Inject matched patterns as additional context in the prompt.
- Files: `gravix-v2/api/services/ai_engine.py`, `gravix-v2/api/services/knowledge_service.py` (new)
- Example injection: "Based on 12 previous confirmed cases with Aluminum → ABS using cyanoacrylate: surface contamination was the root cause 73% of the time. Recommended fix (success rate 85%): IPA wipe + 320-grit abrasion."
- **Test:** Create knowledge pattern for Al→ABS. Run failure analysis for Al→ABS. Verify AI response references the empirical data. Compare confidence score with/without knowledge.

### 6.3 Similar Cases Lookup
**What:** Query past completed analyses with matching substrates/failure mode/adhesive family. Return as `similar_cases` in the analysis response.
- File: `gravix-v2/api/services/knowledge_service.py`
- Called from: `analyze.py` and `specify.py` after AI result
- Returns: id, substrates, root_cause, outcome, confidence — max 5 matches
- **Test:** Create 3 completed analyses for same substrate pair. Create new analysis. Verify `similar_cases` array contains the 3 previous ones.

### 6.4 Confidence Calibration
**What:** When knowledge patterns exist for the substrate pair, adjust the AI's confidence score based on historical evidence count and success rate.
- Formula: `calibrated = ai_score * 0.7 + empirical_match * 0.3` (when evidence_count >= 3)
- ConfidenceBadge already shows "Empirically Validated (N)" vs "AI Estimated" — wire `case_count` from knowledge_patterns
- **Test:** Analysis without knowledge → shows "AI Estimated". Add 5 feedback entries, run aggregation. New analysis → shows "Empirically Validated (5)" with adjusted score.

### 6.5 Daily Metrics Aggregation
**What:** Cron job to populate `daily_metrics` table from real data (analyses count, specs count, resolution rate, substrate combos, adhesive families).
- Wire into: `/aggregate-metrics` cron endpoint
- Social Proof Bar and Stats Bar read from this
- **Test:** Run aggregation. Verify `daily_metrics` has today's row. Verify `/v1/stats/public` returns real numbers.

---

## Sprint 7 — PDF Export & Data Wiring

### 7.1 Wire PDF Export Buttons (P0)
**What:** Both tool result panels and both detail pages have "Export PDF" buttons that do nothing. Wire them.
- `/tool` results → call `api.getSpecPdfUrl(specId)` → open in new tab
- `/failure` results → call `api.getAnalysisPdfUrl(analysisId)` → open in new tab
- `/history/spec/[id]` → already has PDF button, verify it works with auth header
- `/history/failure/[id]` → same
- Need: Pass record ID from API response through to results components (spec page already does this from Sprint 3, verify failure page too)
- **Test:** Run a spec analysis. Click "Export PDF". Verify PDF downloads with correct content. Repeat for failure analysis. Repeat from history detail pages.

### 7.2 "Request Expert Review" → mailto or Remove
**What:** Both result panels have "Request Expert Review" button with no handler. Decision: wire to `mailto:support@gravix.com?subject=Expert Review Request — Analysis {id}` with body pre-filled.
- **Test:** Click button. Verify email client opens with correct subject/body.

### 7.3 Social Proof Bar — Live Data
**What:** Landing page Social Proof Bar (Component 1.2) has hardcoded stats. Wire to `/v1/stats/public` API with fallback to current hardcoded values.
- File: `gravix-v2/frontend/src/app/page.tsx` → `SocialProofBar` function
- Fetch on mount, show hardcoded until loaded, replace with real data
- Also wire the Stats Bar in ToolLayout
- **Test:** With no data in DB, verify fallback stats show. Add analyses to DB, run metrics aggregation, verify bar updates.

### 7.4 History Pagination
**What:** SPEC says pagination with "Load more" button. Current implementation may load all at once.
- Add `limit` + `offset` params to API calls
- Frontend: Load 20 initially, "Load more" appends next 20
- **Test:** Create 25 analyses. Load history. Verify only 20 show. Click "Load more". Verify 25 total.

### 7.5 Case Library Filter Wiring
**What:** Filter bar exists (Materials, Failure Modes, Industries, Search) — verify filters actually pass query params to the backend API and results update.
- Backend `GET /cases` already supports filters
- **Test:** Create cases with different categories. Use each filter. Verify results filter correctly.

---

## Sprint 8 — Auth & Account Completeness

### 8.1 Delete Account Backend
**What:** Settings page has delete account UI but no backend. Build `DELETE /users/me`.
- Cascade: delete all analyses, specs, feedback for user
- Cancel Stripe subscription if active
- Delete Supabase auth user
- Log to `admin_audit_log`
- **Test:** Create user with analyses + subscription. Delete account. Verify all data gone, Stripe subscription cancelled, can't log in.

### 8.2 PATCH /users/me Verification
**What:** Sprint 4 added profile save calling PATCH. Verify the backend endpoint exists and works.
- Check: `gravix-v2/api/routers/users.py` has PATCH handler
- **Test:** Update name + company from settings page. Refresh. Verify changes persisted.

### 8.3 Auth Callback Robustness
**What:** Verify Google OAuth callback + email verification callback both work in production (not just localhost).
- Check redirect URLs in Supabase dashboard match `gravix.com`
- **Test:** Sign up with new email. Click verification link. Verify redirected to dashboard. Sign in with Google. Verify redirected to dashboard.

### 8.4 Password Reset Flow End-to-End
**What:** Sprint 4 built the UI. Verify full flow works.
- **Test:** Click "Forgot password". Enter email. Receive email. Click link. Set new password. Log in with new password.

---

## Sprint 9 — Frontend Polish & Type Safety

### 9.1 TypeScript Cleanup
**What:** 17 `any` types in frontend. Replace with proper types.
- Audit all `as any` casts
- Define missing interfaces
- **Test:** `pnpm build` with no type warnings. `grep -r ": any" src/ | wc -l` → 0.

### 9.2 Form Validation (zod)
**What:** V1 spec called for zod validation. Current forms use manual state. Add zod schemas for both intake forms.
- SpecForm: substrate_a required, substrate_b required, temp range numeric
- FailureForm: failure_description required (min 20 chars), failure_mode required, substrate_a required
- Show inline errors below fields
- **Test:** Submit empty form. Verify error messages appear. Fill required fields. Submit succeeds.

### 9.3 React Query Hooks
**What:** TanStack Query is installed but most fetching is raw. Convert key data flows to useQuery for caching + refetching.
- `useCurrentUser()` — cached user profile
- `useUsage()` — cached usage stats
- `useAnalysisList()` — history list with refetch
- `useSpecList()` — same
- **Test:** Navigate between pages. Verify no redundant API calls. Update data. Verify refetch works.

### 9.4 Knowledge Flywheel Diagram Polish
**What:** SVG exists but may be basic. Make it a proper circular diagram matching SPEC 1.4 description: "Your Analysis → Confirmed Fix → Knowledge Base → Better Analysis".
- **Test:** Visual inspection. Looks professional, animates subtly.

### 9.5 Landing Page Mockup Previews
**What:** SPEC 1.4 Feature Blocks want result preview cards/mockups. Current may be text placeholders.
- Add static but realistic-looking result card previews in the feature blocks
- **Test:** Visual inspection. Landing page feature blocks show convincing result previews.

---

## Sprint 10 — Production Hardening

### 10.1 Error Monitoring
**What:** No error tracking in production. Add Sentry or similar.
- Backend: sentry-sdk FastAPI integration
- Frontend: @sentry/nextjs
- **Test:** Trigger an error. Verify it appears in Sentry dashboard.

### 10.2 Rate Limiting
**What:** No rate limiting on public endpoints. Add to prevent abuse.
- Landing page stats endpoint
- Auth endpoints (prevent brute force)
- AI endpoints (already have usage limits, but add request-level throttle)
- **Test:** Hit endpoint 100 times rapidly. Verify 429 after threshold.

### 10.3 API Response Caching
**What:** Public stats, case library can be cached.
- Add Cache-Control headers to public endpoints
- **Test:** Hit `/v1/stats/public` twice. Second request returns cached.

### 10.4 SEO & Meta Tags
**What:** Landing page needs proper meta tags, OG image, structured data.
- Title, description, og:image for all marketing pages
- **Test:** Share gravix.com link. Verify preview card shows correctly.

### 10.5 Database Migrations — Verify All Run
**What:** 4 migration files exist. Verify they've actually been run on production Supabase.
- Check: `knowledge_patterns` table exists
- Check: `api_request_logs` table exists
- Check: `daily_metrics` table exists
- Check: `admin_audit_log` table exists
- **Test:** Query each table from Supabase dashboard. All exist with correct columns.

---

## Verification Test Plan

### Smoke Test (Run After Each Sprint)
1. ☐ Landing page loads, all 8 components visible
2. ☐ Sign up with email/password → verify email → log in
3. ☐ Sign in with Google OAuth
4. ☐ Run spec analysis → results appear → PDF downloads
5. ☐ Run failure analysis → results appear → PDF downloads
6. ☐ Submit feedback on analysis → thank you message
7. ☐ History page shows analyses → click into detail → all sections render
8. ☐ Settings: update profile, view plan, export data
9. ☐ Pricing: click "Upgrade to Pro" → Stripe checkout loads
10. ☐ Admin: /admin loads with stats, users, activity, logs
11. ☐ Mobile: repeat steps 1-6 on phone-sized viewport

### Knowledge Engine Test (After Sprint 6)
12. ☐ Submit 5 failure analyses for same substrate pair
13. ☐ Submit feedback (outcomes) for 3 of them
14. ☐ Run knowledge aggregation
15. ☐ Submit new analysis for same pair → verify knowledge injection in response
16. ☐ Verify similar_cases populated in response
17. ☐ Verify ConfidenceBadge shows "Empirically Validated (3)"
18. ☐ Verify Social Proof Bar shows real numbers

### Billing Test (After Sprint 8)
19. ☐ Free user hits limit → upgrade modal → Stripe checkout → plan upgrades
20. ☐ Pro user → Settings → Manage Subscription → Stripe portal
21. ☐ Cancel subscription → plan reverts to free
22. ☐ Delete account → all data removed

### Full Regression (Before Launch)
23. ☐ All smoke test items pass
24. ☐ All knowledge engine items pass
25. ☐ All billing items pass
26. ☐ Lighthouse score > 80 on landing page
27. ☐ No console errors on any page
28. ☐ All forms validate correctly (empty + invalid input)
29. ☐ 404 page works for unknown routes

---

## Sprint Execution Order

| Sprint | Scope | Priority | Est. Effort |
|--------|-------|----------|-------------|
| **6** | Knowledge Engine (5 tasks) | P0 — Core differentiator | Heavy |
| **7** | PDF Export + Data Wiring (5 tasks) | P0 — User-facing gaps | Medium |
| **8** | Auth & Account (4 tasks) | P1 — Completeness | Medium |
| **9** | Frontend Polish (5 tasks) | P2 — Quality | Medium |
| **10** | Production Hardening (5 tasks) | P2 — Pre-launch | Medium |

**Total: 24 tasks across 5 sprints.**
