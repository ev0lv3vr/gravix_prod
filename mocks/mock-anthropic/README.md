# Mock Anthropic API Server

A drop-in replacement for the Anthropic Messages API (`/v1/messages`) for local Gravix development and testing.

## Quick Start

```bash
cd mocks/mock-anthropic
npm install
npm start
# → http://localhost:3100
```

Point the Gravix backend at it:

```bash
ANTHROPIC_API_URL=http://localhost:3100
```

## Modes

### Replay (default)

Serves responses from `fixtures/` directory. Hashes the request (model + messages) to look up a fixture via `fixtures/fixture-map.json`. If no fixture matches, returns a generic valid Anthropic response.

```bash
MOCK_MODE=replay npm start
```

### Record

Proxies requests to the real Anthropic API, saves responses as fixtures, and returns the real response. Use this to seed new fixtures.

```bash
MOCK_MODE=record REAL_ANTHROPIC_API_KEY=sk-ant-... npm start
```

Recorded fixtures are saved as `fixtures/recorded-<hash>.json` and auto-mapped in `fixture-map.json`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_ANTHROPIC_PORT` | `3100` | Server port |
| `MOCK_MODE` | `replay` | `replay` or `record` |
| `REAL_ANTHROPIC_API_KEY` | — | Required for `record` mode |

## Streaming

When the request includes `"stream": true`, the server responds with SSE events matching Anthropic's streaming format:

- `message_start` → `content_block_start` → `content_block_delta` (×N) → `content_block_stop` → `message_delta` → `message_stop`

In replay mode, stored fixtures are chunked into stream events. In record mode, the upstream stream is passed through and captured.

## Seed Fixtures

| File | Description |
|------|-------------|
| `spec-engine-response.json` | Realistic spec engine recommendation (epoxy, products, alternatives) |
| `failure-analysis-response.json` | Root cause analysis with corrective actions and TDS compliance |
| `error-response.json` | 429 rate limit error matching Anthropic's error format |

## Adding Fixtures

### Manual

1. Create a JSON file in `fixtures/` with the full Anthropic response envelope.
2. Compute the hash: `JSON.stringify({ model, messages: messages.map(m => ({ role: m.role, content: m.content })) })` → SHA-256.
3. Add the mapping to `fixtures/fixture-map.json`: `{ "<hash>": "your-fixture.json" }`.

### Via Record Mode

1. Start in record mode with a real API key.
2. Send the request you want to capture.
3. The fixture is auto-saved and mapped.

## Docker

```bash
docker build -t mock-anthropic .
docker run -p 3100:3100 -e MOCK_MODE=replay mock-anthropic
```

Or with docker-compose (in the Gravix repo root):

```yaml
mock-anthropic:
  build: ./mocks/mock-anthropic
  ports:
    - "3100:3100"
  environment:
    - MOCK_MODE=replay
```

## Health Check

```bash
curl http://localhost:3100/health
# → {"status":"ok","mode":"replay"}
```
