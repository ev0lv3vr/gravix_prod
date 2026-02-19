/**
 * Mock Supabase Server — REST (PostgREST) + Auth (GoTrue)
 *
 * Two Express servers on two ports:
 *   - REST_PORT (3200): PostgREST-compatible CRUD for all Gravix tables
 *   - AUTH_PORT (3201): GoTrue-compatible auth endpoints
 */

const express = require('express');
const cors = require('cors');
const { Store } = require('./store');
const { createAuthRouter } = require('./auth');
const { createRestRouter } = require('./rest');

// Configuration
const REST_PORT = parseInt(process.env.MOCK_SUPABASE_REST_PORT || '3200', 10);
const AUTH_PORT = parseInt(process.env.MOCK_SUPABASE_AUTH_PORT || '3201', 10);

// Shared in-memory store
const store = new Store();
store.loadSeed();

// ─── REST Server (PostgREST-compatible) ───
const restApp = express();
restApp.use(cors());
restApp.use(express.json({ limit: '10mb' }));

// Health check
restApp.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mock-supabase-rest',
    tables: store.getTableNames().length,
  });
});

// JWKS endpoint on REST port (Supabase client may look for it here)
restApp.get('/auth/v1/.well-known/jwks.json', (req, res) => {
  res.json({ keys: [] });
});

// Mount REST routes
restApp.use(createRestRouter(store));

// ─── Auth Server (GoTrue-compatible) ───
const authApp = express();
authApp.use(cors());
authApp.use(express.json());

// Health check
authApp.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mock-supabase-auth',
    users: store.authUsers.length,
  });
});

// Mount Auth routes
authApp.use(createAuthRouter(store));

// ─── Start Servers ───
const restServer = restApp.listen(REST_PORT, () => {
  console.log(`[mock-supabase] REST server listening on port ${REST_PORT}`);
  console.log(`  Tables: ${store.getTableNames().length}`);
  console.log(`  Routes: GET/POST/PATCH/DELETE /rest/v1/{table}`);
  console.log(`  Reset:  POST /reset`);
});

const authServer = authApp.listen(AUTH_PORT, () => {
  console.log(`[mock-supabase] Auth server listening on port ${AUTH_PORT}`);
  console.log(`  Seed users: ${store.authUsers.length}`);
  console.log(`  Routes: POST /auth/v1/signup, POST /auth/v1/token, GET /auth/v1/user`);
});

// Graceful shutdown
function shutdown() {
  console.log('\n[mock-supabase] Shutting down...');
  restServer.close();
  authServer.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Export for testing
module.exports = { restApp, authApp, store };
