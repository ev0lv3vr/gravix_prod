# Mock Supabase Server

A lightweight, in-memory mock of Supabase's REST (PostgREST) and Auth (GoTrue) APIs for local development and testing of the Gravix platform.

## Quick Start

```bash
cd mocks/mock-supabase
npm install
npm start
```

Or with Docker:

```bash
docker build -t mock-supabase .
docker run -p 3200:3200 -p 3201:3201 mock-supabase
```

## Ports

| Port | Service | Description |
|------|---------|-------------|
| **3200** | REST / PostgREST | CRUD for all Gravix tables |
| **3201** | Auth / GoTrue | Signup, login, user retrieval |

Configure via environment variables:
- `MOCK_SUPABASE_REST_PORT` (default: 3200)
- `MOCK_SUPABASE_AUTH_PORT` (default: 3201)
- `MOCK_SUPABASE_JWT_SECRET` (default: `mock-supabase-jwt-secret`)

## Auth Endpoints (port 3201)

### POST /auth/v1/signup
```bash
curl -X POST http://localhost:3201/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Returns: `{ access_token, token_type, expires_in, refresh_token, user }`

### POST /auth/v1/token?grant_type=password
```bash
curl -X POST "http://localhost:3201/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -d '{"email":"free1@test.gravix.com","password":"TestPassword123!"}'
```

### GET /auth/v1/user
```bash
curl http://localhost:3201/auth/v1/user \
  -H "Authorization: Bearer <jwt>"
```

## REST Endpoints (port 3200)

All routes follow PostgREST conventions:

### CRUD
```
GET    /rest/v1/{table}     — Select rows (with filters)
POST   /rest/v1/{table}     — Insert row(s)
PATCH  /rest/v1/{table}     — Update rows (with filters)
DELETE /rest/v1/{table}     — Delete rows (with filters)
```

All requests require `Authorization: Bearer <jwt>` header.

### Query Parameters

| Param | Example | Description |
|-------|---------|-------------|
| `select` | `select=id,email,plan` | Column projection |
| `{column}` | `status=eq.open` | Filter: equals |
| `{column}` | `severity=neq.minor` | Filter: not equals |
| `{column}` | `defect_quantity=gt.10` | Filter: greater than |
| `{column}` | `defect_quantity=lt.100` | Filter: less than |
| `{column}` | `defect_quantity=gte.5` | Filter: greater/equal |
| `{column}` | `defect_quantity=lte.50` | Filter: less/equal |
| `{column}` | `email=like.%gravix%` | Filter: LIKE pattern |
| `{column}` | `email=ilike.%Gravix%` | Filter: case-insensitive LIKE |
| `{column}` | `closed_at=is.null` | Filter: IS NULL/TRUE/FALSE |
| `{column}` | `status=in.(open,closed)` | Filter: IN list |
| `order` | `order=created_at.desc` | Order by column |
| `limit` | `limit=10` | Limit results |
| `offset` | `offset=20` | Skip rows |

### Prefer Header

Use `Prefer: return=representation` to get inserted/updated rows back:

```bash
curl -X POST http://localhost:3200/rest/v1/failure_analyses \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"adhesive_type":"epoxy","substrate_a":"aluminum","substrate_b":"steel"}'
```

## RLS Simulation

The mock simulates Supabase Row-Level Security:

- **SELECT**: Returns only rows where `user_id = jwt.sub` (admin sees all)
- **INSERT**: Auto-injects `user_id = jwt.sub` if not provided
- **UPDATE/DELETE**: Scoped to `user_id = jwt.sub` (admin can modify all)
- **Admin bypass**: Users with `role: 'admin'` in the users table bypass all RLS

## State Reset

```bash
curl -X POST http://localhost:3200/reset
```

Reloads seed data and clears all state. Use in test setup/teardown.

## Seed Users

All passwords: `TestPassword123!`

| Email | Plan | Role |
|-------|------|------|
| free1@test.gravix.com | free | user |
| free2@test.gravix.com | free | user |
| pro1@test.gravix.com | pro | user |
| pro2@test.gravix.com | pro | user |
| pro3@test.gravix.com | pro | user |
| quality1@test.gravix.com | quality | user |
| quality2@test.gravix.com | quality | user |
| quality3@test.gravix.com | quality | user |
| enterprise1@test.gravix.com | enterprise | admin |
| enterprise2@test.gravix.com | enterprise | user |

## Tables

All tables from `specs/schema/database-schema.md` are available (30+ tables). Run `GET /health` to see the table count.

## Integration with Gravix

Set these environment variables in your Gravix dev setup:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:3200
NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-supabase-jwt-secret
SUPABASE_SERVICE_ROLE_KEY=mock-supabase-jwt-secret
```
