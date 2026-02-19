# Mock Stripe Server

A lightweight mock Stripe API for Gravix local development. Implements the subset of Stripe endpoints used by the Gravix billing system, with in-memory storage and automatic webhook signing.

## Quick Start

```bash
cd mocks/mock-stripe
npm install
npm start
```

Server runs on `http://localhost:3300` by default.

### With Docker

```bash
docker build -t mock-stripe .
docker run -p 3300:3300 -e WEBHOOK_URL=http://host.docker.internal:8000/v1/billing/webhook mock-stripe
```

### With docker-compose (from repo root)

The mock Stripe server is included in `docker-compose.twins.yml`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MOCK_STRIPE_PORT` | `3300` | Server port |
| `WEBHOOK_URL` | `http://localhost:8000/v1/billing/webhook` | Where webhook events are POSTed |
| `STRIPE_WEBHOOK_SECRET` | `whsec_test_mock` | Secret used to sign webhook payloads |

## Endpoints

### Customers

**`POST /v1/customers`**
```bash
curl -X POST http://localhost:3300/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Test User"}'
```

**`GET /v1/customers/:id`**
```bash
curl http://localhost:3300/v1/customers/cus_test_abc123
```

### Checkout Sessions

**`POST /v1/checkout/sessions`**
```bash
curl -X POST http://localhost:3300/v1/checkout/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "user@example.com",
    "price": "price_pro_monthly",
    "success_url": "http://localhost:3000/billing/success",
    "cancel_url": "http://localhost:3000/billing/cancel",
    "mode": "subscription",
    "metadata": {"user_id": "123"}
  }'
```

Returns a checkout session with a `url` that points to `success_url?session_id={id}`.

**`GET /v1/checkout/sessions/:id`**

Returns the session with `payment_status: "paid"` and `status: "complete"` (simulates completed payment).

### Subscriptions

**`POST /v1/subscriptions`**
```bash
curl -X POST http://localhost:3300/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"customer": "cus_test_abc123", "price": "price_pro_monthly"}'
```

**`GET /v1/subscriptions/:id`**

**`POST /v1/subscriptions/:id`** (update — Stripe convention)

**`PATCH /v1/subscriptions/:id`** (update — also supported)

```bash
# Cancel at period end
curl -X POST http://localhost:3300/v1/subscriptions/sub_test_abc123 \
  -H "Content-Type: application/json" \
  -d '{"cancel_at_period_end": true}'

# Change plan
curl -X POST http://localhost:3300/v1/subscriptions/sub_test_abc123 \
  -H "Content-Type: application/json" \
  -d '{"price": "price_quality_monthly"}'
```

**`DELETE /v1/subscriptions/:id`** — Immediately cancels (sets `status: "canceled"`)

### Webhook Trigger (test-only)

**`POST /v1/webhooks/trigger`**

Manually fire a webhook event. The server will sign it using Stripe's signature format and POST it to `WEBHOOK_URL`.

```bash
curl -X POST http://localhost:3300/v1/webhooks/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed"}'
```

If `data` is omitted, the server uses the most recently created object from the in-memory store.

Supported event types:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Health

**`GET /health`**

## Pre-configured Plans

| Plan | Price ID | Amount | Product ID |
|---|---|---|---|
| Pro | `price_pro_monthly` | $79/mo | `prod_pro` |
| Quality/Team | `price_quality_monthly` | $299/mo | `prod_quality` |
| Enterprise | `price_enterprise_monthly` | $799/mo | `prod_enterprise` |

## Webhook Signing

The mock server signs webhook payloads using the same scheme as Stripe:

```
timestamp = Math.floor(Date.now() / 1000)
payload = `${timestamp}.${JSON.stringify(body)}`
signature = HMAC-SHA256(STRIPE_WEBHOOK_SECRET, payload)
header = `t=${timestamp},v1=${signature}`
```

Your backend can verify signatures with the standard Stripe SDK using `whsec_test_mock` as the webhook secret.

## Authentication

The server accepts any `Authorization: Bearer sk_test_*` header or no auth at all. Authentication is not validated — this is a mock.

## Integration with Gravix

Set these environment variables in your backend:

```env
STRIPE_API_URL=http://localhost:3300
STRIPE_SECRET_KEY=sk_test_mock
STRIPE_WEBHOOK_SECRET=whsec_test_mock
```
