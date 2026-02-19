#!/usr/bin/env node
/**
 * run-scenarios.js — Gravix Holdout Scenario Runner
 *
 * Reads YAML scenario files from a directory tree, executes HTTP steps
 * against a target API, scores pass/fail + satisfaction, and outputs
 * a formatted table + JSON report.
 *
 * Usage:
 *   node run-scenarios.js \
 *     --scenarios-dir .holdouts \
 *     --api-url http://localhost:8000 \
 *     --report-file reports/latest.json
 *
 * Scenario YAML format:
 *   name: "Scenario Name"
 *   priority: critical | important | nice-to-have
 *   steps:
 *     - name: "Step description"
 *       method: POST
 *       path: /v1/endpoint
 *       headers:
 *         Authorization: "Bearer {{token}}"
 *       body:
 *         key: value
 *       expect:
 *         status: 200
 *         body_contains: ["field1", "field2"]
 *         body_matches:
 *           field: "regex_pattern"
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// ── Argument parsing ──────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const SCENARIOS_DIR = getArg("--scenarios-dir", ".holdouts");
const API_URL = getArg("--api-url", "http://localhost:8000").replace(/\/$/, "");
const REPORT_FILE = getArg("--report-file", "reports/latest.json");
const VERBOSE = args.includes("--verbose") || args.includes("-v");

// ── Colors ────────────────────────────────────────────────

const C = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

// ── Variable interpolation ─────────────────────────────────

const builtinVars = {
  free_user_token: "mock-free-user-token",
  pro_user_token: "mock-pro-user-token",
  quality_user_token: "mock-quality-user-token",
  enterprise_user_token: "mock-enterprise-user-token",
  admin_token: "mock-admin-token",
  api_url: API_URL,
};

// Variables captured from step responses (via `capture` directive)
const capturedVars = {};

function interpolate(str) {
  if (typeof str !== "string") return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return capturedVars[key] || builtinVars[key] || `{{${key}}}`;
  });
}

function interpolateDeep(obj) {
  if (typeof obj === "string") return interpolate(obj);
  if (Array.isArray(obj)) return obj.map(interpolateDeep);
  if (obj && typeof obj === "object") {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = interpolateDeep(v);
    }
    return result;
  }
  return obj;
}

// ── Scenario discovery ─────────────────────────────────────

function findScenarioFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findScenarioFiles(fullPath));
    } else if (/\.(ya?ml)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function inferPriority(filePath) {
  const rel = path.relative(SCENARIOS_DIR, filePath).toLowerCase();
  if (rel.startsWith("critical")) return "critical";
  if (rel.startsWith("important")) return "important";
  if (rel.startsWith("nice-to-have") || rel.startsWith("nice_to_have")) return "nice-to-have";
  return "unknown";
}

// ── Step execution ─────────────────────────────────────────

async function executeStep(step) {
  const method = (step.method || "GET").toUpperCase();
  const url = `${API_URL}${interpolate(step.path || "/")}`;
  const headers = interpolateDeep(step.headers || {});
  const body = step.body ? interpolateDeep(step.body) : undefined;

  const fetchOpts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET" && method !== "HEAD") {
    fetchOpts.body = JSON.stringify(body);
  }

  const startTime = Date.now();
  let response, responseBody, responseText;

  try {
    response = await fetch(url, fetchOpts);
    responseText = await response.text();
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  } catch (err) {
    return {
      name: step.name || `${method} ${step.path}`,
      passed: false,
      latencyMs: Date.now() - startTime,
      error: `Request failed: ${err.message}`,
      expected: step.expect || {},
      actual: { error: err.message },
    };
  }

  const latencyMs = Date.now() - startTime;
  const expect = step.expect || {};
  const errors = [];

  // Check status code
  if (expect.status !== undefined && response.status !== expect.status) {
    errors.push(`Status: expected ${expect.status}, got ${response.status}`);
  }

  // Check body_contains — response body should include these strings/keys
  if (expect.body_contains && typeof responseBody === "object") {
    const bodyStr = JSON.stringify(responseBody);
    for (const needle of expect.body_contains) {
      if (!bodyStr.includes(needle)) {
        errors.push(`Body missing: "${needle}"`);
      }
    }
  }

  // Check body_matches — regex patterns against specific fields
  if (expect.body_matches && typeof responseBody === "object") {
    for (const [field, pattern] of Object.entries(expect.body_matches)) {
      const value = String(responseBody[field] || "");
      if (!new RegExp(pattern).test(value)) {
        errors.push(`Field "${field}" doesn't match /${pattern}/`);
      }
    }
  }

  // Check body_equals — exact field value matches
  if (expect.body_equals && typeof responseBody === "object") {
    for (const [field, expected] of Object.entries(expect.body_equals)) {
      const actual = responseBody[field];
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        errors.push(`Field "${field}": expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    }
  }

  // Capture variables from response
  if (step.capture && typeof responseBody === "object") {
    for (const [varName, fieldPath] of Object.entries(step.capture)) {
      const parts = fieldPath.split(".");
      let val = responseBody;
      for (const p of parts) {
        val = val?.[p];
      }
      if (val !== undefined) {
        capturedVars[varName] = String(val);
      }
    }
  }

  return {
    name: step.name || `${method} ${step.path}`,
    passed: errors.length === 0,
    latencyMs,
    errors,
    expected: expect,
    actual: {
      status: response.status,
      body: VERBOSE ? responseBody : undefined,
    },
  };
}

// ── Scenario execution ─────────────────────────────────────

async function runScenario(scenario) {
  const steps = scenario.steps || [];
  const stepResults = [];
  let passedSteps = 0;

  for (const step of steps) {
    const result = await executeStep(step);
    stepResults.push(result);
    if (result.passed) passedSteps++;

    if (VERBOSE) {
      const icon = result.passed ? "✓" : "✗";
      const color = result.passed ? C.green : C.red;
      console.error(`    ${color}${icon}${C.reset} ${result.name} ${C.dim}(${result.latencyMs}ms)${C.reset}`);
      if (!result.passed && result.errors) {
        for (const err of result.errors) {
          console.error(`      ${C.dim}→ ${err}${C.reset}`);
        }
      }
    }
  }

  const satisfaction = steps.length > 0 ? Math.round((passedSteps / steps.length) * 100) : 0;

  return {
    name: scenario.name,
    priority: scenario.priority || "unknown",
    passed: passedSteps === steps.length,
    satisfaction,
    stepsTotal: steps.length,
    stepsPassed: passedSteps,
    steps: stepResults,
  };
}

// ── Table formatting ───────────────────────────────────────

function printResultsTable(results) {
  const priorityOrder = { critical: 0, important: 1, "nice-to-have": 2, unknown: 3 };
  const sorted = [...results].sort(
    (a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
  );

  const nameWidth = Math.max(30, ...sorted.map((r) => r.name.length)) + 2;

  console.log("");
  console.log(
    `${C.bold}${"Scenario".padEnd(nameWidth)} ${"Priority".padEnd(14)} ${"Score".padEnd(8)} ${"Steps".padEnd(10)} Status${C.reset}`
  );
  console.log("─".repeat(nameWidth + 14 + 8 + 10 + 8));

  for (const r of sorted) {
    const icon = r.passed ? `${C.green}✅` : `${C.red}❌`;
    const status = r.passed ? "PASS" : "FAIL";

    let priorityColor = C.dim;
    if (r.priority === "critical") priorityColor = C.red;
    else if (r.priority === "important") priorityColor = C.yellow;

    const score =
      r.satisfaction === 100
        ? `${C.green}${r.satisfaction}%${C.reset}`
        : r.satisfaction >= 85
        ? `${C.yellow}${r.satisfaction}%${C.reset}`
        : `${C.red}${r.satisfaction}%${C.reset}`;

    console.log(
      `${r.name.padEnd(nameWidth)} ${priorityColor}${r.priority.padEnd(14)}${C.reset} ${String(r.satisfaction + "%").padEnd(8)} ${`${r.stepsPassed}/${r.stepsTotal}`.padEnd(10)} ${icon} ${status}${C.reset}`
    );
  }

  console.log("");
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  console.log(`${C.cyan}🔬 Gravix Holdout Scenario Runner${C.reset}`);
  console.log(`${C.dim}   Target: ${API_URL}${C.reset}`);
  console.log(`${C.dim}   Scenarios: ${SCENARIOS_DIR}${C.reset}`);
  console.log("");

  // Discover scenario files
  const files = findScenarioFiles(SCENARIOS_DIR);
  if (files.length === 0) {
    console.error(`${C.red}No scenario files found in ${SCENARIOS_DIR}${C.reset}`);
    process.exit(2);
  }

  console.log(`${C.blue}Found ${files.length} scenario file(s)${C.reset}`);

  // Load and parse scenarios
  const scenarios = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const docs = yaml.loadAll(content).filter(Boolean);
      for (const doc of docs) {
        if (doc.name && doc.steps) {
          // Use priority from YAML, fallback to directory-based inference
          doc.priority = doc.priority || inferPriority(file);
          doc._file = path.relative(SCENARIOS_DIR, file);
          scenarios.push(doc);
        }
      }
    } catch (err) {
      console.error(`${C.yellow}⚠ Failed to parse ${file}: ${err.message}${C.reset}`);
    }
  }

  console.log(`${C.blue}Loaded ${scenarios.length} scenario(s)${C.reset}`);
  console.log("");

  // Execute scenarios
  const results = [];
  for (const scenario of scenarios) {
    if (VERBOSE) {
      console.error(`${C.cyan}▸ ${scenario.name}${C.reset} ${C.dim}(${scenario._file})${C.reset}`);
    }

    // Reset captured vars between scenarios
    Object.keys(capturedVars).forEach((k) => delete capturedVars[k]);

    const result = await runScenario(scenario);
    result.file = scenario._file;
    results.push(result);
  }

  // Print results table
  printResultsTable(results);

  // Compute summary
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const criticalTotal = results.filter((r) => r.priority === "critical").length;
  const criticalPassed = results.filter((r) => r.priority === "critical" && r.passed).length;
  const avgSatisfaction =
    total > 0 ? Math.round(results.reduce((sum, r) => sum + r.satisfaction, 0) / total) : 0;

  const report = {
    timestamp: new Date().toISOString(),
    apiUrl: API_URL,
    scenariosDir: SCENARIOS_DIR,
    summary: {
      total,
      passed,
      failed: total - passed,
      criticalTotal,
      criticalPassed,
      criticalFailed: criticalTotal - criticalPassed,
      avgSatisfaction,
    },
    scenarios: results.map((r) => ({
      name: r.name,
      file: r.file,
      priority: r.priority,
      passed: r.passed,
      satisfaction: r.satisfaction,
      stepsTotal: r.stepsTotal,
      stepsPassed: r.stepsPassed,
      steps: r.steps.map((s) => ({
        name: s.name,
        passed: s.passed,
        latencyMs: s.latencyMs,
        errors: s.errors || [],
      })),
    })),
  };

  // Write report
  const reportDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`${C.dim}Report written to ${REPORT_FILE}${C.reset}`);
}

main().catch((err) => {
  console.error(`${C.red}Fatal error: ${err.message}${C.reset}`);
  process.exit(2);
});
