/**
 * Generate seed.json with pre-hashed passwords.
 * Run once: node generate-seed.js
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const PASSWORD = 'TestPassword123!';

const userDefs = [
  { email: 'free1@test.gravix.com', plan: 'free', role: 'user' },
  { email: 'free2@test.gravix.com', plan: 'free', role: 'user' },
  { email: 'pro1@test.gravix.com', plan: 'pro', role: 'user' },
  { email: 'pro2@test.gravix.com', plan: 'pro', role: 'user' },
  { email: 'pro3@test.gravix.com', plan: 'pro', role: 'user' },
  { email: 'quality1@test.gravix.com', plan: 'quality', role: 'user' },
  { email: 'quality2@test.gravix.com', plan: 'quality', role: 'user' },
  { email: 'quality3@test.gravix.com', plan: 'quality', role: 'user' },
  { email: 'enterprise1@test.gravix.com', plan: 'enterprise', role: 'admin' },
  { email: 'enterprise2@test.gravix.com', plan: 'enterprise', role: 'user' },
];

async function generate() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const now = new Date().toISOString();

  const authUsers = [];
  const usersRows = [];

  for (const def of userDefs) {
    const id = uuidv4();
    authUsers.push({
      id,
      email: def.email,
      password_hash: hash,
      created_at: now,
    });
    usersRows.push({
      id,
      email: def.email,
      role: def.role,
      plan: def.plan,
      display_name: null,
      avatar_url: null,
      analysis_count: 0,
      spec_count: 0,
      investigation_count: 0,
      monthly_analysis_count: 0,
      monthly_spec_count: 0,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      created_at: now,
      updated_at: now,
    });
  }

  const seed = {
    auth_users: authUsers,
    tables: {
      users: usersRows,
    },
  };

  fs.writeFileSync(
    path.join(__dirname, 'seed.json'),
    JSON.stringify(seed, null, 2)
  );

  console.log(`Generated seed.json with ${authUsers.length} users`);
}

generate().catch(console.error);
