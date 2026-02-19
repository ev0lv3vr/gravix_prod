#!/usr/bin/env node
/**
 * Smoke test for mock Supabase server.
 * Tests: signup, login, JWT user retrieval, CRUD with RLS, cross-user isolation, reset.
 */

const http = require('http');

const REST_PORT = process.env.MOCK_SUPABASE_REST_PORT || 3200;
const AUTH_PORT = process.env.MOCK_SUPABASE_AUTH_PORT || 3201;

function request(port, method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

async function run() {
  console.log('\n🧪 Mock Supabase Smoke Tests\n');

  // ─── Test 1: Health checks ───
  console.log('1. Health checks');
  const restHealth = await request(REST_PORT, 'GET', '/health');
  assert(restHealth.status === 200, `REST health OK (${restHealth.body.tables} tables)`);
  const authHealth = await request(AUTH_PORT, 'GET', '/health');
  assert(authHealth.status === 200, `Auth health OK (${authHealth.body.users} seed users)`);

  // ─── Test 2: Signup a new user ───
  console.log('\n2. Signup');
  const signup = await request(AUTH_PORT, 'POST', '/auth/v1/signup', {
    email: 'smoke@test.gravix.com',
    password: 'SmokeTest123!',
  });
  assert(signup.status === 200, 'Signup returns 200');
  assert(signup.body.access_token, 'Returns access_token');
  assert(signup.body.user?.id, 'Returns user with id');
  assert(signup.body.user?.email === 'smoke@test.gravix.com', 'Returns correct email');
  const userAToken = signup.body.access_token;
  const userAId = signup.body.user.id;

  // ─── Test 3: Duplicate signup fails ───
  console.log('\n3. Duplicate signup');
  const dup = await request(AUTH_PORT, 'POST', '/auth/v1/signup', {
    email: 'smoke@test.gravix.com',
    password: 'SmokeTest123!',
  });
  assert(dup.status === 400, 'Duplicate signup returns 400');

  // ─── Test 4: Login with seed user ───
  console.log('\n4. Login seed user');
  const login = await request(AUTH_PORT, 'POST', '/auth/v1/token?grant_type=password', {
    email: 'free1@test.gravix.com',
    password: 'TestPassword123!',
  });
  assert(login.status === 200, 'Login returns 200');
  assert(login.body.access_token, 'Returns access_token');
  const userBToken = login.body.access_token;
  const userBId = login.body.user.id;

  // ─── Test 5: Get user from JWT ───
  console.log('\n5. Get user from JWT');
  const getUser = await request(AUTH_PORT, 'GET', '/auth/v1/user', null, {
    Authorization: `Bearer ${userAToken}`,
  });
  assert(getUser.status === 200, 'Get user returns 200');
  assert(getUser.body.email === 'smoke@test.gravix.com', 'Correct user returned');

  // ─── Test 6: Insert with Prefer: return=representation ───
  console.log('\n6. Insert (failure_analyses)');
  const insert = await request(REST_PORT, 'POST', '/rest/v1/failure_analyses', {
    adhesive_type: 'epoxy',
    substrate_a: 'aluminum',
    substrate_b: 'steel',
    failure_mode: 'debonding',
    status: 'completed',
  }, {
    Authorization: `Bearer ${userAToken}`,
    Prefer: 'return=representation',
  });
  assert(insert.status === 201, 'Insert returns 201');
  assert(insert.body.id, 'Inserted row has id');
  assert(insert.body.user_id === userAId, 'RLS injected user_id correctly');
  const analysisId = insert.body.id;

  // ─── Test 7: SELECT sees own rows ───
  console.log('\n7. SELECT own rows');
  const selectOwn = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${userAToken}`,
  });
  assert(selectOwn.status === 200, 'SELECT returns 200');
  assert(Array.isArray(selectOwn.body), 'Returns array');
  assert(selectOwn.body.length === 1, 'User A sees their 1 row');

  // ─── Test 8: RLS blocks cross-user access ───
  console.log('\n8. RLS cross-user isolation');
  const selectOther = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${userBToken}`,
  });
  assert(selectOther.status === 200, 'SELECT by User B returns 200');
  assert(selectOther.body.length === 0, 'User B sees 0 rows (RLS blocks)');

  // ─── Test 9: User B inserts their own row ───
  console.log('\n9. User B insert + isolation');
  await request(REST_PORT, 'POST', '/rest/v1/failure_analyses', {
    adhesive_type: 'cyanoacrylate',
    substrate_a: 'glass',
    substrate_b: 'plastic',
    failure_mode: 'blooming',
    status: 'pending',
  }, {
    Authorization: `Bearer ${userBToken}`,
    Prefer: 'return=representation',
  });
  const selectB = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${userBToken}`,
  });
  assert(selectB.body.length === 1, 'User B sees only their 1 row');
  const selectA = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${userAToken}`,
  });
  assert(selectA.body.length === 1, 'User A still sees only their 1 row');

  // ─── Test 10: Filter with eq ───
  console.log('\n10. Filter (eq)');
  const filtered = await request(REST_PORT, 'GET',
    '/rest/v1/failure_analyses?status=eq.completed', null, {
    Authorization: `Bearer ${userAToken}`,
  });
  assert(filtered.body.length === 1, 'Filter eq returns matching rows');

  // ─── Test 11: Select projection ───
  console.log('\n11. Select projection');
  const projected = await request(REST_PORT, 'GET',
    '/rest/v1/failure_analyses?select=id,adhesive_type', null, {
    Authorization: `Bearer ${userAToken}`,
  });
  assert(Object.keys(projected.body[0]).length === 2, 'Projection returns only selected columns');

  // ─── Test 12: PATCH (update) ───
  console.log('\n12. PATCH (update)');
  const patched = await request(REST_PORT, 'PATCH',
    `/rest/v1/failure_analyses?id=eq.${analysisId}`,
    { adhesive_type: 'polyurethane' },
    {
      Authorization: `Bearer ${userAToken}`,
      Prefer: 'return=representation',
    },
  );
  assert(patched.status === 200, 'PATCH returns 200');
  assert(patched.body[0]?.adhesive_type === 'polyurethane', 'Field updated correctly');

  // ─── Test 13: DELETE ───
  console.log('\n13. DELETE');
  const deleted = await request(REST_PORT, 'DELETE',
    `/rest/v1/failure_analyses?id=eq.${analysisId}`, null, {
    Authorization: `Bearer ${userAToken}`,
    Prefer: 'return=representation',
  });
  assert(deleted.status === 200, 'DELETE returns 200');
  assert(deleted.body.length === 1, 'Deleted 1 row');

  // Verify it's gone
  const afterDel = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${userAToken}`,
  });
  assert(afterDel.body.length === 0, 'User A has 0 rows after delete');

  // ─── Test 14: Admin login and bypass ───
  console.log('\n14. Admin RLS bypass');
  const adminLogin = await request(AUTH_PORT, 'POST', '/auth/v1/token?grant_type=password', {
    email: 'enterprise1@test.gravix.com',
    password: 'TestPassword123!',
  });
  assert(adminLogin.status === 200, 'Admin login OK');
  const adminToken = adminLogin.body.access_token;

  // Admin should see User B's row
  const adminSelect = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${adminToken}`,
  });
  assert(adminSelect.body.length === 1, 'Admin sees all rows (1 from User B)');

  // ─── Test 15: Reset ───
  console.log('\n15. State reset');
  const reset = await request(REST_PORT, 'POST', '/reset');
  assert(reset.status === 200, 'Reset returns 200');

  // After reset, analyses should be empty
  const afterReset = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${adminToken}`,
  });
  // Token is now invalid since auth users were reloaded — need to re-login
  const adminLogin2 = await request(AUTH_PORT, 'POST', '/auth/v1/token?grant_type=password', {
    email: 'enterprise1@test.gravix.com',
    password: 'TestPassword123!',
  });
  const adminToken2 = adminLogin2.body.access_token;
  const afterReset2 = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses', null, {
    Authorization: `Bearer ${adminToken2}`,
  });
  assert(afterReset2.body.length === 0, 'After reset, failure_analyses is empty');

  // Seed users still work
  const seedLogin = await request(AUTH_PORT, 'POST', '/auth/v1/token?grant_type=password', {
    email: 'pro1@test.gravix.com',
    password: 'TestPassword123!',
  });
  assert(seedLogin.status === 200, 'Seed users still accessible after reset');

  // ─── Test 16: Unauthenticated request blocked ───
  console.log('\n16. Unauthenticated blocked');
  const noAuth = await request(REST_PORT, 'GET', '/rest/v1/failure_analyses');
  assert(noAuth.status === 401, 'Unauthenticated request returns 401');

  // ─── Summary ───
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'═'.repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Smoke test error:', err);
  process.exit(1);
});
