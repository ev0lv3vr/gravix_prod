/**
 * RLS (Row-Level Security) simulation middleware for mock Supabase.
 *
 * Extracts JWT from Authorization header or apikey header,
 * verifies signature, and attaches decoded user info to req.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');

// Service keys bypass JWT verification (like Supabase service_role key)
const SERVICE_KEYS = new Set([
  'mock-service-key',
  process.env.MOCK_SUPABASE_SERVICE_KEY || 'mock-service-key',
]);

/**
 * Middleware: extract and verify JWT, attach to req.jwtPayload.
 * Service keys get a synthetic admin-level payload (bypasses RLS).
 * Does NOT reject unauthenticated requests — individual handlers decide.
 */
function extractJwt(req, res, next) {
  req.jwtPayload = null;
  req.isServiceRole = false;

  let token = null;

  // Try Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // Fall back to apikey header
  if (!token && req.headers.apikey) {
    token = req.headers.apikey;
  }

  if (token) {
    // Check if it's a service key — bypass JWT verification
    if (SERVICE_KEYS.has(token)) {
      req.isServiceRole = true;
      req.jwtPayload = { sub: 'service_role', role: 'service_role', aud: 'authenticated' };
    } else {
      try {
        req.jwtPayload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        // Token invalid — leave jwtPayload null
      }
    }
  }

  next();
}

/**
 * Apply RLS filtering for SELECT queries.
 * Filters rows to user_id = jwt.sub unless user is admin.
 *
 * @param {Array} rows - All rows from the table
 * @param {Object} schema - Table schema with userIdColumn and adminOnly
 * @param {Object|null} jwtPayload - Decoded JWT (null if unauthenticated)
 * @param {Store} store - Data store (to look up user role)
 * @returns {Array} Filtered rows
 */
function rlsFilterSelect(rows, schema, jwtPayload, store, req) {
  if (!jwtPayload) return [];
  if (req && req.isServiceRole) return rows; // Service role bypasses all RLS
  if (schema.adminOnly && !isAdmin(jwtPayload, store)) return [];
  if (!schema.userIdColumn) return rows; // No RLS column (public table)
  if (isAdmin(jwtPayload, store)) return rows; // Admin bypasses RLS

  const userId = jwtPayload.sub;
  return rows.filter(row => row[schema.userIdColumn] === userId);
}

/**
 * Inject user_id into a row for INSERT if not already provided.
 */
function rlsInjectUserId(row, schema, jwtPayload, req) {
  if (!schema.userIdColumn || !jwtPayload) return row;
  if (req && req.isServiceRole) return row; // Service role — don't inject, trust the payload
  if (schema.userIdColumn === 'id') return row; // Don't overwrite primary key
  if (!row[schema.userIdColumn]) {
    row[schema.userIdColumn] = jwtPayload.sub;
  }
  return row;
}

/**
 * Filter rows for UPDATE/DELETE scope.
 * Returns only rows owned by the current user (unless admin).
 */
function rlsScopeWrite(rows, schema, jwtPayload, store, req) {
  if (!jwtPayload) return [];
  if (req && req.isServiceRole) return rows; // Service role bypasses RLS
  if (!schema.userIdColumn) return rows;
  if (isAdmin(jwtPayload, store)) return rows;

  const userId = jwtPayload.sub;
  return rows.filter(row => row[schema.userIdColumn] === userId);
}

/**
 * Check if user has admin role.
 */
function isAdmin(jwtPayload, store) {
  if (!jwtPayload) return false;
  const usersTable = store.getTableData('users') || [];
  const user = usersTable.find(u => u.id === jwtPayload.sub);
  return user && user.role === 'admin';
}

module.exports = {
  extractJwt,
  rlsFilterSelect,
  rlsInjectUserId,
  rlsScopeWrite,
  isAdmin,
};
