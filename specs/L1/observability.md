# Observability & Monitoring — L1 Summary

> Full detail: `L2/observability-full.md` | Source: gravix-final-prd.md Parts II, IX

## What It Does
Logs every AI call, every API request, and aggregates daily metrics. Provides the data layer for the admin dashboard and operational visibility.

## Three Systems
1. **AI Engine Telemetry** — logs every Claude API call: model, tokens, latency, cost, knowledge context used, confidence score, errors
2. **API Request Logging** — middleware logs every HTTP request: method, path, status, latency, user, plan
3. **Daily Metrics Aggregator** — cron job computes daily rollups: volume, engagement, AI performance, knowledge coverage, conversion

## Key Tables
- `ai_engine_logs` — per-call telemetry (RLS: admins only)
- `api_request_logs` — per-request HTTP logs (RLS: admins only)
- `daily_metrics` — pre-aggregated daily stats (RLS: admins only)
- `admin_audit_log` — tracks admin actions (RLS: admins only)

## API Contracts
```
GET /api/admin/metrics/overview — { period } → volume, conversion, revenue summary
GET /api/admin/metrics/ai-engine — { period } → latency, error rate, token usage, knowledge impact
GET /api/admin/metrics/engagement — { period } → feedback funnel, top users, plan distribution
GET /api/admin/metrics/knowledge — → pattern coverage, calibration accuracy, top patterns
GET /api/admin/metrics/system — → endpoint performance, recent errors, DB size
GET /api/admin/stats — public-safe aggregate stats (total analyses, avg confidence) for landing page
All admin endpoints: require `require_admin` dependency (403 if not admin role)
```

## Key Services
- `TelemetryLogger` — wraps every `client.messages.create()` call, captures timing + token counts + knowledge context
- `RequestLoggingMiddleware` — FastAPI middleware, logs after response, samples at 100% (all requests)
- `DailyMetricsAggregator` — cron (runs at 00:05 UTC), queries ai_engine_logs + api_request_logs + analysis_feedback, upserts into daily_metrics
- `PublicStatsEndpoint` — cached (5 min TTL), returns safe aggregates for landing page social proof bar

## Critical Validations
- All observability tables are admin-only (RLS policies)
- Telemetry logger must not slow down AI responses — log asynchronously (fire-and-forget insert)
- Request logging middleware must not break on logging failures — catch all exceptions, never 500 on log failure
- Daily metrics aggregator is idempotent — re-running for same date overwrites, doesn't duplicate
- Cost calculation: input_tokens × model_input_price + output_tokens × model_output_price

## Cron Schedule
| Job | Frequency | What It Does |
|-----|-----------|-------------|
| Daily metrics aggregator | Daily 00:05 UTC | Compute daily_metrics row for yesterday |
| Follow-up email sender | Daily 09:00 UTC | Send feedback reminder emails for 48h-old analyses |
| Knowledge aggregator | Daily 01:00 UTC | Recompute knowledge_patterns from all feedback |
| Pattern detection | Daily 02:00 UTC | Check for new pattern clusters (Enterprise alerts) |
