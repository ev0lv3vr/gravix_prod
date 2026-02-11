# MEMORY.md — Long-Term Memory

Last updated: 2026-02-10

## About My Human
- Name: Евгений (Evgeny) Нечаев, goes by Ev / @Evolv3
- Telegram username: @Evolv3
- Timezone: America/Los_Angeles (PST)
- Prefers: Opus 4.6 for coding tasks
- Style: Direct, fast-moving, gives instructions and expects execution. Doesn't like being asked unnecessary questions.
- Calls me/treats me as: an operator, not a chatbot

## Projects

### Gravix (gravix.com)
- **What:** AI-powered industrial adhesive specification + failure analysis SaaS
- **Stack:** Next.js frontend (Vercel) + Python/FastAPI backend (Render) + Supabase
- **Status:** V2 frontend rebuild in progress from detailed UI spec
- **Workspace:** /workspace/gravix-v2/
- **Spec doc:** /workspace/gravix-v2/SPEC.md (source of truth for all pages)
- **Key pages:** Landing (8 components), Spec Engine (/tool), Failure Analysis (/failure), Pricing, Dashboard, History, Case Library, Settings, Auth Modal, Feedback
- **USP:** Self-learning AI that gets smarter from confirmed production outcomes (vs generic ChatGPT)
- **Needs:** Stripe webhook secret, Resend API key, Supabase JWT secret

### Gluemasters (gluemasters.com)
- **What:** E-commerce store selling cyanoacrylate (CA/super glue) — B2B + consumer
- **Platform:** Shopify
- **Products:** Thick (1500 CPS), Medium (700 CPS), Thin (100 CPS), Ultra Thin (5 CPS) CA glue in 16oz bottles (~$42-46)
- **Fulfillment:** ShipBob (multiple warehouses: Twin Lakes WI, Ontario CA, Buford GA)
- **Key audience:** Craftspeople, reef/aquascaping (Reef2Reef sponsor), manufacturers
- **Issues identified:** Empty homepage sections, no product differentiation, fake sale pricing, no visible reviews, needs dual-audience segmentation
- **Email:** sales@gluemasters.com (via himalaya/Gmail)
- **Note:** himalaya config set `save-copy = false` (Gmail auto-saves to Sent)

### MoneySamurai
- **What:** Product data/analytics platform
- **Workspace:** /workspace/moneysamurai/
- **Status:** Running, automated data syncs (products, orders, inventory, financial, restock)

## Tools & Setup
- Shopify CLI installed (`shopify` v3.90.0) — auth has been problematic (device code timeouts)
- himalaya for email (sales@gluemasters.com)
- ShipBob API for fulfillment tracking
- Vercel for Gravix frontend deployments (auto-deploy from main)
- Render for Gravix backend (gravix-prod.onrender.com)
- Resend API key: stored in /workspace/gravix-v2/api/.env
- Supabase project: jvyohfodhaeqchjzcopf (keys in /workspace/gravix-v2/frontend/.env.local)
- Google OAuth: Client ID + Secret stored in /workspace/gravix-v2/api/.env
- All Gravix secrets consolidated in /workspace/gravix-v2/api/.env

## Lessons Learned
- **Don't use opacity-0 for scroll animations as initial state** — breaks mobile visibility if JS/IntersectionObserver doesn't fire. Use progressive enhancement.
- **himalaya SMTP save-to-Sent causes retries** — set `save-copy = false` for Gmail accounts
- **Shopify CLI device auth times out quickly** — may need Theme Access password approach instead
- **Context compaction loses important details** — write everything to files immediately, don't rely on session memory
