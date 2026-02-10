# Gravix V2 — AI-Powered Industrial Materials Intelligence

> Specify industrial materials with confidence. Diagnose failures in minutes.

## What is Gravix?

Gravix is an AI-powered platform that helps manufacturing engineers:

1. **Diagnose Failures** — Upload failure data, get ranked root cause analysis with confidence scores, recommendations, and prevention plans
2. **Specify Materials** — Describe your application requirements, get vendor-neutral material specifications with application guidance

Powered by Claude AI with deep domain knowledge in industrial adhesives, sealants, and coatings.

## Architecture

```
gravix-v2/
├── frontend/          # Next.js 14 (App Router) — deployed to Vercel
├── api/               # FastAPI (Python) — deployed to Railway/Fly.io
├── database/          # Supabase PostgreSQL migrations & seed data
└── README.md          # You are here
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, React Query |
| Backend | FastAPI, Python 3.11+, Pydantic v2, httpx |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | Claude API (Anthropic) — Sonnet for production |
| Payments | Stripe (Free / Pro $79 / Team $199 / Enterprise) |
| Email | Resend |
| PDF | WeasyPrint or ReportLab |
| Hosting | Vercel (frontend), Railway (backend), Supabase (DB) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase project (create at supabase.com)
- Anthropic API key
- Stripe account
- Resend account (for transactional email)

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in order:

```bash
# In Supabase SQL Editor:
# 1. Run database/001_initial_schema.sql
# 2. Run database/002_seed_materials.sql
```

3. Note your project URL and keys:
   - Project URL: `https://your-project.supabase.co`
   - Anon key: (for frontend)
   - Service role key: (for backend — NEVER expose to client)

### 2. Backend Setup

```bash
cd api/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your keys:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - ANTHROPIC_API_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - RESEND_API_KEY

# Run development server
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs` (Swagger UI)

### 3. Frontend Setup

```bash
cd frontend/

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_API_URL=http://localhost:8000
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Run development server
npm run dev
```

Frontend available at `http://localhost:3000`

### 4. Stripe Setup

1. Create products/prices in Stripe Dashboard:
   - Pro Plan: $79/month (recurring)
   - Team Plan: $199/month (recurring)
   - Enterprise: Custom (contact sales)

2. Set up webhook endpoint: `https://api.gravix.com/v1/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`

3. Add price IDs to backend `.env`:
   - `STRIPE_PRO_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`

## Deployment

### Frontend → Vercel

```bash
cd frontend/
vercel --prod
```

DNS: `gravix.com` → Vercel

### Backend → Railway

```bash
cd api/
railway up
```

DNS: `api.gravix.com` → Railway

### Database → Supabase

Already hosted. Just run migrations via SQL Editor.

## Business Model

| Tier | Price | Analyses/mo | Specs/mo | Features |
|------|-------|-------------|----------|----------|
| Free | $0 | 2 | 2 | Basic reports (watermarked) |
| Pro | $79/mo | 15 | 15 | Full reports, case library, history |
| Team | $199/mo | 50 | 50 | + Shared workspace, API access |
| Enterprise | Custom | Unlimited | Unlimited | + SSO, dedicated support |

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/health` | Health check | No |
| POST | `/v1/analyze` | Create failure analysis | Yes |
| GET | `/v1/analyze` | List user's analyses | Yes |
| GET | `/v1/analyze/{id}` | Get analysis detail | Yes |
| POST | `/v1/specify` | Create spec request | Yes |
| GET | `/v1/specify` | List user's specs | Yes |
| GET | `/v1/specify/{id}` | Get spec detail | Yes |
| GET | `/v1/users/me` | Get current user | Yes |
| PATCH | `/v1/users/me` | Update profile | Yes |
| GET | `/v1/users/me/usage` | Get usage stats | Yes |
| GET | `/v1/cases` | Browse case library | No |
| GET | `/v1/cases/{slug}` | Get case detail | No |
| POST | `/v1/reports/analysis/{id}` | Generate PDF report | Yes |
| POST | `/v1/reports/spec/{id}` | Generate PDF spec sheet | Yes |
| POST | `/v1/billing/checkout` | Start Stripe checkout | Yes |
| POST | `/v1/billing/portal` | Open billing portal | Yes |
| POST | `/v1/billing/webhook` | Stripe webhook | Stripe |

## Project Status

- [x] Technical specification complete
- [x] Database schema + seed data
- [x] Frontend application scaffold
- [x] Backend API scaffold
- [ ] Supabase project created
- [ ] Anthropic API key configured
- [ ] Stripe products/prices created
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] DNS configured (gravix.com)
- [ ] E2E testing
- [ ] Launch 🚀
