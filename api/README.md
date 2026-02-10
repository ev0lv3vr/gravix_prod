# Gravix API

**AI-Powered Industrial Materials Intelligence Platform**

FastAPI backend for Gravix - diagnose adhesive failures and generate material specifications using Claude AI.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Supabase account (for database and auth)
- Anthropic API key (for Claude)
- Stripe account (for payments)
- Resend account (for emails)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd gravix-v2/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your actual credentials
```

### Environment Variables

See `.env.example` for all required environment variables. Key variables:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-your-key
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret

# Resend
RESEND_API_KEY=re_your-key
```

### Run Development Server

```bash
# With auto-reload
uvicorn main:app --reload --port 8000

# Or using Python directly
python main.py
```

API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

---

## 📁 Project Structure

```
api/
├── main.py                      # FastAPI app entry point
├── config.py                    # Pydantic Settings (env vars)
├── database.py                  # Supabase client singleton
├── dependencies.py              # Auth dependency (JWT verification)
├── routers/
│   ├── health.py                # GET /health
│   ├── analyze.py               # Failure analysis endpoints
│   ├── specify.py               # Material specification endpoints
│   ├── users.py                 # User management endpoints
│   ├── cases.py                 # Case library (public) endpoints
│   ├── reports.py               # PDF generation endpoints
│   └── billing.py               # Stripe billing endpoints
├── schemas/
│   ├── common.py                # Shared Pydantic models
│   ├── analyze.py               # Failure analysis schemas
│   ├── specify.py               # Spec request schemas
│   ├── user.py                  # User schemas
│   ├── case.py                  # Case library schemas
│   └── billing.py               # Billing schemas
├── services/
│   ├── ai_engine.py             # Claude API integration
│   ├── pdf_generator.py         # PDF report generation
│   ├── stripe_service.py        # Stripe integration
│   ├── email_service.py         # Resend email service
│   └── usage_service.py         # Usage tracking and limits
├── prompts/
│   ├── failure_analysis.py      # AI prompt for failure analysis
│   └── spec_engine.py           # AI prompt for spec generation
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Health

- `GET /health` - Health check (no auth required)

### Authentication

All endpoints except `/health` and `/cases` require authentication.

**Authorization header:** `Bearer <JWT_TOKEN>`

JWT tokens are issued by Supabase Auth.

### Failure Analysis

- `POST /analyze` - Create new failure analysis
- `GET /analyze` - List user's analyses (paginated)
- `GET /analyze/{id}` - Get specific analysis

### Material Specification

- `POST /specify` - Create new spec request
- `GET /specify` - List user's specs (paginated)
- `GET /specify/{id}` - Get specific spec

### User Management

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `GET /users/me/usage` - Get usage statistics

### Case Library (Public)

- `GET /cases` - List public cases (no auth, supports filters)
- `GET /cases/{id_or_slug}` - Get specific case (no auth)

### PDF Reports

- `POST /reports/analysis/{id}` - Generate PDF for failure analysis
- `POST /reports/spec/{id}` - Generate PDF for specification

### Billing (Stripe)

- `POST /billing/checkout` - Create checkout session for upgrade
- `POST /billing/portal` - Create customer portal session
- `POST /billing/webhook` - Stripe webhook handler (no auth)

---

## 🧠 AI Engine

### Failure Analysis

The failure analysis AI prompt includes comprehensive domain knowledge:

- **Material properties** for cyanoacrylates, epoxies, polyurethanes, silicones
- **Failure modes** (debonding, cracking, discoloration, etc.)
- **Root cause categories** (surface prep, compatibility, application, cure, environmental)
- **Substrate reference** for metals, plastics, elastomers with surface prep requirements

**Output:** Structured JSON with ranked root causes (with confidence scores), contributing factors, recommendations, and prevention plan.

### Specification Engine

The spec engine AI prompt includes:

- **Material selection decision trees** based on substrates, strength, flexibility, temperature, cure, gap fill, environmental exposure
- **Substrate compatibility matrix** with surface energy and prep requirements
- **Application methods** with bondline control characteristics
- **Surface preparation methods** and when to use them

**Output:** Vendor-neutral specification with recommended chemistry, product characteristics, application guidance, warnings, and alternatives.

---

## 💳 Usage Limits

| Plan | Analyses/month | Specs/month |
|------|----------------|-------------|
| Free | 2 | 2 |
| Pro | 15 | 15 |
| Team | 50 | 50 |
| Enterprise | Unlimited | Unlimited |

Usage is tracked monthly and enforced before calling the AI engine.

---

## 🔐 Authentication

The API uses Supabase JWT tokens for authentication:

1. Frontend authenticates users via Supabase Auth
2. Frontend includes JWT token in `Authorization: Bearer <token>` header
3. Backend verifies token using `SUPABASE_JWT_SECRET`
4. User ID is extracted from token and used to enforce RLS policies

---

## 🗄️ Database

The API uses **Supabase (PostgreSQL)** with Row Level Security (RLS) enabled.

### Tables

- `users` - User profiles and plan information
- `subscriptions` - Stripe subscription data
- `failure_analyses` - Failure analysis records
- `spec_requests` - Material specification records
- `case_library` - Public failure case studies
- `materials` - Reference data for material properties
- `expert_reviews` - Expert review requests (future feature)
- `usage_logs` - Usage analytics

See `../spec.md` Section 6 for complete schema.

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t gravix-api .
```

### Run Container

```bash
docker run -d \
  --name gravix-api \
  -p 8000:8000 \
  --env-file .env \
  gravix-api
```

### Docker Compose (Optional)

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped
```

---

## 🚢 Deployment (Railway / Fly.io)

### Railway

1. Connect GitHub repository
2. Add environment variables in Railway dashboard
3. Railway auto-detects Dockerfile and deploys

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app (follow prompts)
fly launch

# Set secrets
fly secrets set SUPABASE_URL=... ANTHROPIC_API_KEY=... STRIPE_SECRET_KEY=...

# Deploy
fly deploy
```

---

## 🧪 Testing

### Manual Testing

Use the interactive API docs at `/docs` when running in debug mode.

### cURL Examples

**Health check:**
```bash
curl http://localhost:8000/health
```

**Create failure analysis (requires auth):**
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "material_category": "adhesive",
    "material_subcategory": "cyanoacrylate",
    "failure_mode": "debonding",
    "failure_description": "Bond failed after 2 weeks in humid environment",
    "substrate_a": "aluminum",
    "substrate_b": "polycarbonate"
  }'
```

---

## 📊 Monitoring

### Health Check

`GET /health` returns database connectivity status.

### Logs

The application logs to stdout. In production, configure log aggregation (e.g., Railway logs, Fly.io logs, Datadog).

### Error Handling

- All endpoints return consistent error responses
- Unhandled exceptions are caught by global exception handler
- Detailed errors in development, sanitized in production

---

## 🔧 Development

### Code Style

- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Keep functions focused and testable

### Adding New Endpoints

1. Create schema in `schemas/`
2. Add business logic in `services/`
3. Create router in `routers/`
4. Include router in `main.py`

### Database Migrations

Schema changes are managed in Supabase SQL editor. For version control:

1. Export schema: `supabase db dump`
2. Commit SQL files to repository
3. Apply on new environments via Supabase dashboard

---

## 📝 License

© 2026 Gravix. All rights reserved.

---

## 🤝 Support

For issues or questions:
- Open GitHub issue
- Email: support@gravix.com

---

Built with ❤️ using FastAPI, Claude, and Supabase.
