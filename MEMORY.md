# MEMORY.md — Long-Term Memory

Last updated: 2026-02-13

## About My Human
- Name: Евгений (Evgeny) Нечаев, goes by Ev / @Evolv3
- Telegram username: @Evolv3
- Timezone: America/Los_Angeles (PST)
- Prefers: Opus 4.6 for coding tasks
- Style: Direct, fast-moving, gives instructions and expects execution. Doesn't like being asked unnecessary questions.
- Calls me/treats me as: an operator, not a chatbot

## Multi-Agent Setup
- **Main agent** (me) → `@GmVasyaBot` on Telegram — handles Gluemasters, MoneySamurai, email, personal, everything non-Gravix
- **Gravix agent** → `@GravixAlex_bot` on Telegram — dedicated Gravix dev agent
- Both run on **one gateway** (port 18789) with multi-account Telegram config
- Agent-to-agent messaging enabled (`tools.agentToAgent.allow: ["main", "gravix"]`)
- Gravix agent workspace: `~/.openclaw/gravix-workspace/` (SOUL.md, briefing docs, SPEC.md)
- Gravix agent dir: `~/.openclaw/agents/gravix/agent`
- I can send messages to gravix via `sessions_send(agentId="gravix", sessionKey="agent:gravix:main")`
- **Don't use separate gateways** — causes lock conflicts, port issues, Telegram 409 conflicts. Use `openclaw agents add` instead.

## Projects

### Gravix (gravix.com) — OWNED BY GRAVIX AGENT
- **What:** AI-powered industrial adhesive specification + failure analysis SaaS
- **Stack:** Next.js frontend (Vercel) + Python/FastAPI backend (Render) + Supabase
- **Status:** V2 COMPLETE — all 10 sprints shipped, backend v2.0.0 live, all migrations run
- **Post-V2 (2/13):** Gravix agent shipped 16 commits — CI hardening, 5 UI bug fixes, 3 perf wins, E2E tests, clickable analysis cards
- **Workspace:** /workspace/ (flat structure: api/, frontend/, scripts/, docs/)
- **Spec doc:** /workspace/docs/SPEC.md (source of truth for all pages)
- **USP:** Self-learning AI that gets smarter from confirmed production outcomes
- **Pricing:** $79/mo Pro, $199/mo Team (Stripe live)
- **Admin:** /admin dashboard live, e.netchaev@gmail.com has admin role
- **Crons:** aggregate-knowledge (4 AM), send-followups (10 AM), CRON_SECRET on Render ✅
- **Knowledge Engine:** Fully unblocked — schema aligned (migration 006 ✅), crons working, all 244 tests green
- **Deployment:** Frontend on Vercel (auto-deploy from main), Backend on Render (Docker)
- **I defer Gravix questions to the gravix agent** unless it's down

### Gluemasters (gluemasters.com)
- **What:** E-commerce store selling cyanoacrylate (CA/super glue) — B2B + consumer
- **Platform:** Shopify (store: gravix.myshopify.com, token in moneysamurai/api/.env)
- **Theme:** Empire, ID 131948675249
- **Products:** Thick (1500 CPS), Medium (700 CPS), Thin (100 CPS), Ultra Thin (5 CPS) CA glue in 16oz/8oz/2oz bottles + Gel + Accelerator
- **Fulfillment:** ShipBob (warehouses: Twin Lakes WI, Ontario CA, Buford GA)
- **Key audience:** Craftspeople, reef/aquascaping (Reef2Reef sponsor), manufacturers
- **Email:** sales@gluemasters.com (via himalaya/Gmail, `save-copy = false`)

#### Gluemasters — Completed (2/12)
- Full site audit + broken link fixes across 9 pages
- Pricing display fixed (removed fake compare_at_price on 14 variants)
- Homepage redesigned: use-case cards, viscosity selector, shop-by-size, social proof, trust bar
- Brand merge: Formascope fonts (Brandon Grotesque, TT Norms) + color system
- White-text-on-light-bg bug fixed across 11 pages (100+ instances)
- Font ligature bug fixed (TT Norms contextual ligatures)
- Product pages: viscosity badges + specs bars + trust badges on ALL products
- Landing page color pass (6 pages, 218 replacements)
- About Us populated, contact zip fixed, Opinew JS fix, free shipping bar
- SEO: meta tags (17 products, 6 collections), URL shortening + 190+ redirects, JSON-LD schema
- Content: 6 SEO blog posts published
- Reef2Reef section replaced with trust bar + dual CTA
- Opinew duplicate script removed from theme.liquid

#### Gluemasters — Open Items
- [ ] Verify Opinew has 1,183 reviews imported (needs dashboard login)
- [ ] Fix oversold inventory: Gel 20g (-6), Thick 2oz (-1)
- [ ] Back-in-stock notification app (Shopify App Store)
- [ ] Bundle offers (Phase 4 — needs product strategy)
- [ ] Refund policy still links to gravixadhesives.com (needs `write_legal_policies` scope)
- [ ] Google Search Console sitemap submission (needs manual access)

#### Pump Accelerator 8oz — Label & Listing Project
- **Supplier:** Xtralok (Chicago) — pump spray bottle, same formula as existing aerosol
- **Bottle dims:** H 5¼", W 2", C 6¼", label size 3"×5"
- **UPC:** 199874971148 (GS1 registered)
- **Model:** ACC0201
- **Designer:** Designcoffers (Fiverr) — $450 for full package
  - Print-ready label (front + back)
  - 7 Amazon listing images (3D renders + infographics)
  - 5 Amazon A+ Content modules
  - 3D bottle mockups
  - ETA: ~Feb 17-18 for first review
- **Competitor research done:** Starbond ($14.50), BSI, TotalBond, ASI, Chem-Set
- **Target price:** $14.99
- **Files:** `gluemasters-bizdev/labels/pump-accelerator-8oz/` (copy draft, designer brief, UPC, research)
- **Creative assets:** `gluemasters-bizdev/creative-assets/` (397 files from Formascope Google Drive)

### MoneySamurai
- **What:** Product data/analytics platform
- **Workspace:** /workspace/moneysamurai/
- **Status:** Running, automated data syncs via cron (products, orders, inventory, financial, restock)
- **Note:** ESM project — use `import` not `require()`, scripts need .mjs or type=module

## Tools & Setup
- Shopify CLI installed (`shopify` v3.90.0) — auth has been problematic (device code timeouts)
- himalaya for email (sales@gluemasters.com, `save-copy = false`)
- ShipBob API for fulfillment tracking
- Vercel for Gravix frontend (auto-deploy from main, project: gravix-prod)
- Render for Gravix backend (gravix-prod.onrender.com, service: srv-d65o7l9r0fns73biao5g)
- Supabase project: jvyohfodhaeqchjzcopf
- All Gravix secrets in /workspace/api/.env and Render env vars
- Vercel auth: `~/.local/share/com.vercel.cli/auth.json`

## Development Pipeline
- **Gravix agent** now handles its own pipeline: PLAN → CODE → GATES → REVIEW → DEPLOY
- **Gate script:** `scripts/check.sh` (tsc, lint, build, pattern checks, secret scan)
- **Branch strategy:** feature branches → merge to main → Vercel auto-deploy
- **Sub-agents:** Opus 4.6 for spawned work

## Lessons Learned
- **Don't use separate gateways for multi-agent** — use `openclaw agents add` + multi-account Telegram on one gateway. Separate gateways cause lock conflicts and the `--profile` flag has bugs with `isLoaded` detection.
- **Don't use opacity-0 for scroll animations** — breaks mobile if JS doesn't fire
- **himalaya SMTP save-to-Sent causes retries** — set `save-copy = false` for Gmail
- **Shopify CLI device auth times out quickly** — may need Theme Access password approach
- **Context compaction loses details** — write everything to files immediately
- **TT Norms font has contextual ligatures** — disable with `font-variant-ligatures: no-common-ligatures no-contextual`
- **git config core.compression 0** fixes LibreSSL SSL_read errors on large HTTPS pushes
- **gdown gets rate-limited on Google Drive folders** — zip download is more reliable
- **Formascope fonts are CFF/PostScript OTF** — reportlab can't embed them
- **MoneySamurai is ESM** — CommonJS `require()` fails; use imports or .cjs extension
