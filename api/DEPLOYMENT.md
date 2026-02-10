# Gravix API Deployment Guide

Complete deployment checklist and instructions for production deployment.

---

## ✅ Pre-Deployment Checklist

### 1. External Services Setup

#### Supabase
- [ ] Create new Supabase project
- [ ] Run database schema from `gravix-spec.md` Section 6
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Seed materials reference data (Section 6.2 of spec)
- [ ] Configure Supabase Auth (email/password, Google OAuth)
- [ ] Get credentials:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`
  - `SUPABASE_JWT_SECRET` (from Project Settings → API → JWT Secret)

#### Anthropic Claude
- [ ] Sign up at https://console.anthropic.com
- [ ] Create API key
- [ ] Note: Claude Sonnet 4 recommended for production
- [ ] Get credential: `ANTHROPIC_API_KEY`

#### Stripe
- [ ] Create Stripe account
- [ ] Create products and prices for Pro and Team plans
- [ ] Configure webhooks endpoint: `https://api.gravix.com/billing/webhook`
- [ ] Select events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Get credentials:
  - `STRIPE_SECRET_KEY` (use test key for staging, live key for production)
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_ID_PRO`
  - `STRIPE_PRICE_ID_TEAM`

#### Resend
- [ ] Sign up at https://resend.com
- [ ] Verify domain (gravix.com)
- [ ] Create API key
- [ ] Get credentials:
  - `RESEND_API_KEY`
  - `FROM_EMAIL=noreply@gravix.com`

---

## 🚀 Deployment Options

### Option 1: Railway

**Pros:** Simple, auto-deploy from GitHub, good free tier  
**Cons:** Can be expensive at scale

#### Steps:

1. **Connect Repository**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `gravix_prod` repository
   - Select `api/` directory as root

2. **Configure Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add all variables from `.env.example`
   - Use production credentials

3. **Deploy**
   - Railway auto-detects Dockerfile
   - Click "Deploy"
   - Get public URL: `gravix-api.up.railway.app`

4. **Custom Domain**
   - Go to Settings → Domains
   - Add custom domain: `api.gravix.com`
   - Configure DNS CNAME record

#### Railway.toml (Optional)

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 10
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3
```

---

### Option 2: Fly.io

**Pros:** Global edge deployment, cost-effective, excellent performance  
**Cons:** More manual configuration

#### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Launch App**
   ```bash
   cd api/
   fly launch
   # Name: gravix-api
   # Region: Choose closest to users
   # PostgreSQL: No (using Supabase)
   # Redis: No
   ```

4. **Set Secrets**
   ```bash
   fly secrets set \
     SUPABASE_URL=... \
     SUPABASE_ANON_KEY=... \
     SUPABASE_SERVICE_KEY=... \
     SUPABASE_JWT_SECRET=... \
     ANTHROPIC_API_KEY=... \
     STRIPE_SECRET_KEY=... \
     STRIPE_WEBHOOK_SECRET=... \
     RESEND_API_KEY=...
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

6. **Custom Domain**
   ```bash
   fly certs create api.gravix.com
   # Configure DNS A/AAAA records as instructed
   ```

#### fly.toml

```toml
app = "gravix-api"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  ENVIRONMENT = "production"
  API_PORT = "8000"
  FRONTEND_URL = "https://gravix.com"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[compute]
  memory = "512mb"
  cpus = 1
```

---

### Option 3: Render

**Pros:** Simple setup, free tier, automatic SSL  
**Cons:** Free tier has cold starts

#### Steps:

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Name:** gravix-api
   - **Root Directory:** `api`
   - **Runtime:** Docker
   - **Instance Type:** Starter (or higher for production)
5. Add environment variables from `.env.example`
6. Deploy
7. Custom domain: `api.gravix.com` in Settings

---

### Option 4: Google Cloud Run

**Pros:** Serverless, scales to zero, cost-effective  
**Cons:** Cold starts, more complex setup

#### Steps:

1. **Enable Cloud Run API**
   ```bash
   gcloud services enable run.googleapis.com
   ```

2. **Build and Push Image**
   ```bash
   cd api/
   gcloud builds submit --tag gcr.io/PROJECT_ID/gravix-api
   ```

3. **Deploy**
   ```bash
   gcloud run deploy gravix-api \
     --image gcr.io/PROJECT_ID/gravix-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars SUPABASE_URL=...,ANTHROPIC_API_KEY=...
   ```

4. **Custom Domain**
   - Cloud Run → Service → Manage Custom Domains
   - Add `api.gravix.com`
   - Configure DNS

---

## 🔒 Security Checklist

- [ ] All environment variables set correctly
- [ ] `DEBUG=false` in production
- [ ] Supabase RLS policies enabled
- [ ] Stripe webhook signature verification enabled
- [ ] CORS restricted to production frontend URL
- [ ] API docs (`/docs`, `/redoc`) disabled in production
- [ ] HTTPS enforced
- [ ] Secrets not committed to repository
- [ ] Database backups configured (Supabase auto-backups)

---

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://api.gravix.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T12:00:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

### 2. Create Test User
- Sign up via frontend
- Verify welcome email received
- Check user created in Supabase `users` table

### 3. Test Failure Analysis
- Login via frontend
- Submit failure analysis
- Verify AI response
- Download PDF report
- Check usage counter incremented

### 4. Test Spec Generation
- Submit spec request
- Verify AI response
- Download PDF spec sheet

### 5. Test Usage Limits
- Create 3 analyses as free user (2 should succeed, 3rd should fail)
- Verify error: `USAGE_LIMIT_EXCEEDED`

### 6. Test Stripe Integration
- Initiate upgrade to Pro
- Complete payment (use test card: `4242 4242 4242 4242`)
- Verify user upgraded to `pro` plan
- Verify usage limits increased
- Test customer portal access

### 7. Test Stripe Webhooks
- Trigger test webhook from Stripe dashboard
- Check logs for successful handling
- Verify plan updates in database

---

## 📊 Monitoring & Logging

### Application Logs

**Railway:**
```bash
railway logs
```

**Fly.io:**
```bash
fly logs
```

**Render:**
View logs in Render dashboard

### Error Tracking

Consider integrating:
- **Sentry** for error tracking
- **Datadog** for APM
- **LogTail** for log aggregation

### Metrics to Monitor

- Request latency (P50, P95, P99)
- Error rate
- AI API call duration
- Database query time
- Memory usage
- CPU usage

### Alerts

Set up alerts for:
- API downtime
- High error rate (>5%)
- Slow AI responses (>30s)
- Database connection failures
- Stripe webhook failures

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
    paths:
      - 'api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          service: gravix-api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🆘 Troubleshooting

### Database Connection Issues
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase project is not paused
- Verify network connectivity

### AI Engine Failures
- Check `ANTHROPIC_API_KEY` is valid
- Verify API quota not exceeded
- Check Claude API status: https://status.anthropic.com

### PDF Generation Fails
- Ensure WeasyPrint dependencies installed (check Dockerfile)
- Verify sufficient memory (increase instance size if needed)

### Stripe Webhooks Not Working
- Verify webhook URL is correct: `https://api.gravix.com/billing/webhook`
- Check webhook secret matches
- Ensure endpoint is publicly accessible
- Test webhook with Stripe CLI: `stripe listen --forward-to localhost:8000/billing/webhook`

---

## 🔧 Rollback Plan

If deployment fails:

1. **Railway/Render:** Revert to previous deployment in dashboard
2. **Fly.io:** `fly releases` → `fly releases rollback <version>`
3. **Emergency:** Update frontend to point to old API URL temporarily

---

## 📈 Scaling Considerations

### Performance Optimization

- Enable Redis caching for materials reference data
- Add read replicas for database (if query load high)
- Implement rate limiting per user
- Cache AI responses for common queries (if desired)

### Cost Optimization

- Monitor AI API usage (largest cost factor)
- Optimize prompt length (currently comprehensive - may be trimmed if cost is issue)
- Use cheaper Claude model for non-critical operations
- Scale down during low-traffic hours (if using auto-scaling platform)

---

## ✅ Deployment Complete!

Once all checklist items are ✅:

1. Update DNS to point `api.gravix.com` to deployed service
2. Update frontend `NEXT_PUBLIC_API_URL` to production API
3. Test full flow from frontend
4. Monitor logs for first hour
5. Celebrate! 🎉

---

**Need help?** Check logs, review error messages, consult service documentation, or reach out to support.
