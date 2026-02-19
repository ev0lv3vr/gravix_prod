/**
 * GoTrue-compatible Auth endpoints for mock Supabase.
 * Port 3201 — handles signup, login, and user retrieval.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.MOCK_SUPABASE_JWT_SECRET || 'mock-supabase-jwt-secret';
const JWT_EXPIRY = 3600; // 1 hour

function createAuthRouter(store) {
  const router = express.Router();

  /**
   * Generate a real-format JWT for a user.
   */
  function generateTokens(user) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      aud: 'authenticated',
      iat: now,
      exp: now + JWT_EXPIRY,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
    const refreshToken = uuidv4();

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: JWT_EXPIRY,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: 'authenticated',
        user_metadata: {},
        app_metadata: { provider: 'email' },
        created_at: user.created_at,
      },
    };
  }

  /**
   * POST /auth/v1/signup
   */
  router.post('/auth/v1/signup', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
      }

      // Check if user already exists
      const existing = store.authUsers.find(u => u.email === email);
      if (existing) {
        return res.status(400).json({ error: 'User already registered' });
      }

      // Hash password and create auth user
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const now = new Date().toISOString();

      const authUser = {
        id: userId,
        email,
        password_hash: passwordHash,
        created_at: now,
      };
      store.authUsers.push(authUser);

      // Also create a row in the users table
      const usersTable = store.getTableData('users');
      if (usersTable) {
        usersTable.push({
          id: userId,
          email,
          role: 'user',
          plan: 'free',
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

      const tokens = generateTokens(authUser);
      return res.status(200).json(tokens);
    } catch (err) {
      console.error('[auth] signup error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /auth/v1/token?grant_type=password
   */
  router.post('/auth/v1/token', async (req, res) => {
    try {
      const grantType = req.query.grant_type;
      if (grantType !== 'password') {
        return res.status(400).json({ error: 'Unsupported grant_type. Use "password".' });
      }

      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
      }

      const user = store.authUsers.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }

      const tokens = generateTokens(user);
      return res.status(200).json(tokens);
    } catch (err) {
      console.error('[auth] token error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /auth/v1/user — returns user from JWT
   */
  router.get('/auth/v1/user', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const authUser = store.authUsers.find(u => u.id === decoded.sub);
      if (!authUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Look up role from users table
      const usersTable = store.getTableData('users') || [];
      const dbUser = usersTable.find(u => u.id === decoded.sub);

      return res.status(200).json({
        id: authUser.id,
        email: authUser.email,
        role: dbUser?.role || 'user',
        user_metadata: {},
        app_metadata: { provider: 'email' },
        created_at: authUser.created_at,
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  });

  // JWKS endpoint — Gravix backend tries to fetch this for JWT verification.
  // Since we use HS256 (symmetric), return an empty JWKS. The backend should
  // fall back to the shared secret (SUPABASE_JWT_SECRET).
  router.get('/.well-known/jwks.json', (req, res) => {
    res.json({ keys: [] });
  });

  return router;
}

module.exports = { createAuthRouter, JWT_SECRET };
