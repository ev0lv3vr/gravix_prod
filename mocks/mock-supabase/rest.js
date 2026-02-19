/**
 * PostgREST-compatible REST endpoints for mock Supabase.
 * Supports CRUD with query params: select, eq, neq, gt, lt, gte, lte,
 * like, ilike, is, in, order, limit, offset.
 * Supports Prefer: return=representation header.
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  extractJwt,
  rlsFilterSelect,
  rlsInjectUserId,
  rlsScopeWrite,
} = require('./rls');

function createRestRouter(store) {
  const router = express.Router();

  // Apply JWT extraction to all REST routes
  router.use(extractJwt);

  /**
   * POST /reset — reload seed data, clear all state.
   */
  router.post('/reset', (req, res) => {
    store.loadSeed();
    return res.status(200).json({ message: 'State reset to seed data' });
  });

  /**
   * GET /rest/v1/:table — SELECT with filtering
   */
  router.get('/rest/v1/:table', (req, res) => {
    const { table } = req.params;
    const schema = store.getTableSchema(table);
    if (!schema) {
      return res.status(404).json({ error: `Table "${table}" not found` });
    }

    if (!req.jwtPayload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let rows = store.getTableData(table) || [];

    // Apply RLS
    rows = rlsFilterSelect(rows, schema, req.jwtPayload, store, req);

    // Apply PostgREST-style filters from query params
    rows = applyFilters(rows, req.query);

    // Apply ordering
    rows = applyOrder(rows, req.query.order);

    // Apply offset and limit
    const offset = parseInt(req.query.offset) || 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    if (offset > 0) {
      rows = rows.slice(offset);
    }
    if (limit !== undefined) {
      rows = rows.slice(0, limit);
    }

    // Apply select (column projection)
    rows = applySelect(rows, req.query.select);

    return res.status(200).json(rows);
  });

  /**
   * POST /rest/v1/:table — INSERT
   */
  router.post('/rest/v1/:table', (req, res) => {
    const { table } = req.params;
    const schema = store.getTableSchema(table);
    if (!schema) {
      return res.status(404).json({ error: `Table "${table}" not found` });
    }

    if (!req.jwtPayload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tableData = store.getTableData(table);
    const isArray = Array.isArray(req.body);
    const inputRows = isArray ? req.body : [req.body];
    const insertedRows = [];

    for (let row of inputRows) {
      // Generate id if not provided
      if (!row.id) {
        row.id = uuidv4();
      }

      // Add timestamps
      const now = new Date().toISOString();
      if (!row.created_at && schema.columns.includes('created_at')) {
        row.created_at = now;
      }
      if (!row.updated_at && schema.columns.includes('updated_at')) {
        row.updated_at = now;
      }

      // RLS: inject user_id
      row = rlsInjectUserId(row, schema, req.jwtPayload, req);

      tableData.push(row);
      insertedRows.push(row);
    }

    // Check Prefer header
    const prefer = req.headers.prefer || '';
    if (prefer.includes('return=representation')) {
      return res.status(201).json(isArray ? insertedRows : insertedRows[0]);
    }

    return res.status(201).json({});
  });

  /**
   * PATCH /rest/v1/:table — UPDATE with filters
   */
  router.patch('/rest/v1/:table', (req, res) => {
    const { table } = req.params;
    const schema = store.getTableSchema(table);
    if (!schema) {
      return res.status(404).json({ error: `Table "${table}" not found` });
    }

    if (!req.jwtPayload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tableData = store.getTableData(table);
    const updates = req.body;

    // Find matching rows via filters
    let candidates = applyFilters(tableData, req.query);

    // RLS: scope to user's rows
    candidates = rlsScopeWrite(candidates, schema, req.jwtPayload, store, req);

    const updatedRows = [];
    for (const candidate of candidates) {
      const idx = tableData.indexOf(candidate);
      if (idx === -1) continue;

      // Apply updates
      for (const [key, value] of Object.entries(updates)) {
        tableData[idx][key] = value;
      }

      // Update timestamp
      if (schema.columns.includes('updated_at')) {
        tableData[idx].updated_at = new Date().toISOString();
      }

      updatedRows.push(tableData[idx]);
    }

    const prefer = req.headers.prefer || '';
    if (prefer.includes('return=representation')) {
      return res.status(200).json(updatedRows);
    }

    return res.status(204).send();
  });

  /**
   * DELETE /rest/v1/:table — DELETE with filters
   */
  router.delete('/rest/v1/:table', (req, res) => {
    const { table } = req.params;
    const schema = store.getTableSchema(table);
    if (!schema) {
      return res.status(404).json({ error: `Table "${table}" not found` });
    }

    if (!req.jwtPayload) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tableData = store.getTableData(table);

    // Find matching rows
    let candidates = applyFilters(tableData, req.query);

    // RLS: scope to user's rows
    candidates = rlsScopeWrite(candidates, schema, req.jwtPayload, store, req);

    const deletedRows = [];
    for (const candidate of candidates) {
      const idx = tableData.indexOf(candidate);
      if (idx !== -1) {
        deletedRows.push(tableData.splice(idx, 1)[0]);
      }
    }

    const prefer = req.headers.prefer || '';
    if (prefer.includes('return=representation')) {
      return res.status(200).json(deletedRows);
    }

    return res.status(204).send();
  });

  return router;
}

// ─── Filter Helpers ───

/**
 * Apply PostgREST-style filters from query params.
 * Supports: eq, neq, gt, lt, gte, lte, like, ilike, is, in
 */
function applyFilters(rows, query) {
  let result = [...rows];

  for (const [key, value] of Object.entries(query)) {
    // Skip non-filter params
    if (['select', 'order', 'limit', 'offset'].includes(key)) continue;

    // Parse the operator and value: column=op.value
    const strValue = String(value);
    const dotIndex = strValue.indexOf('.');
    if (dotIndex === -1) continue;

    const op = strValue.substring(0, dotIndex);
    const filterVal = strValue.substring(dotIndex + 1);

    result = result.filter(row => {
      const cellValue = row[key];
      return matchFilter(cellValue, op, filterVal);
    });
  }

  return result;
}

function matchFilter(cellValue, op, filterVal) {
  switch (op) {
    case 'eq':
      return String(cellValue) === filterVal;
    case 'neq':
      return String(cellValue) !== filterVal;
    case 'gt':
      return Number(cellValue) > Number(filterVal);
    case 'lt':
      return Number(cellValue) < Number(filterVal);
    case 'gte':
      return Number(cellValue) >= Number(filterVal);
    case 'lte':
      return Number(cellValue) <= Number(filterVal);
    case 'like':
      // PostgREST uses * as wildcard, translate to regex
      return new RegExp('^' + filterVal.replace(/%/g, '.*').replace(/\*/g, '.*') + '$').test(String(cellValue));
    case 'ilike':
      return new RegExp('^' + filterVal.replace(/%/g, '.*').replace(/\*/g, '.*') + '$', 'i').test(String(cellValue));
    case 'is':
      if (filterVal === 'null') return cellValue === null || cellValue === undefined;
      if (filterVal === 'true') return cellValue === true;
      if (filterVal === 'false') return cellValue === false;
      return false;
    case 'in':
      // Format: (val1,val2,val3)
      const values = filterVal.replace(/^\(/, '').replace(/\)$/, '').split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return values.includes(String(cellValue));
    default:
      return true;
  }
}

/**
 * Apply ordering: order=column.asc or order=column.desc
 */
function applyOrder(rows, orderParam) {
  if (!orderParam) return rows;

  const parts = orderParam.split(',');
  const result = [...rows];

  // Process in reverse order for stable multi-column sort
  for (let i = parts.length - 1; i >= 0; i--) {
    const [col, dir] = parts[i].split('.');
    const ascending = dir !== 'desc';

    result.sort((a, b) => {
      const va = a[col];
      const vb = b[col];
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      const cmp = va < vb ? -1 : 1;
      return ascending ? cmp : -cmp;
    });
  }

  return result;
}

/**
 * Apply select (column projection).
 * select=col1,col2,col3
 */
function applySelect(rows, selectParam) {
  if (!selectParam || selectParam === '*') return rows;

  const cols = selectParam.split(',').map(c => c.trim());

  return rows.map(row => {
    const projected = {};
    for (const col of cols) {
      if (col in row) {
        projected[col] = row[col];
      }
    }
    return projected;
  });
}

module.exports = { createRestRouter };
