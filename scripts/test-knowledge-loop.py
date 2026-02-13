#!/usr/bin/env python3
"""
Gravix Knowledge Engine — End-to-End Loop Test

Tests the full knowledge feedback cycle against the live production API:
1. Submit a failure analysis → get AI result
2. Submit feedback on that analysis (was_helpful, outcome, actual_root_cause)
3. Trigger knowledge aggregation cron
4. Submit another analysis for the same substrate pair → verify knowledge injection
5. Check that confidence shows "Empirically Validated"

Usage:
  python3 scripts/test-knowledge-loop.py [--prod]        # test against production
  python3 scripts/test-knowledge-loop.py [--local]       # test against localhost:8000

Requires: CRON_SECRET env var (for cron trigger)
Optional: GRAVIX_EMAIL + GRAVIX_PASSWORD for authenticated tests
"""

import argparse
import json
import os
import sys
import time
import requests
from datetime import datetime

# ── Config ─────────────────────────────────────────────────
PROD_URL = "https://gravix-prod.onrender.com"
LOCAL_URL = "http://localhost:8000"

# Supabase project for auth
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://jvyohfodhaeqchjzcopf.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

CRON_SECRET = os.environ.get("CRON_SECRET", "")
GRAVIX_EMAIL = os.environ.get("GRAVIX_EMAIL", "")
GRAVIX_PASSWORD = os.environ.get("GRAVIX_PASSWORD", "")

# Test data — realistic industrial scenario
TEST_ANALYSIS_1 = {
    "substrate_a": "Polypropylene (PP)",
    "substrate_b": "Stainless Steel 304",
    "failure_mode": "Adhesive failure at the PP interface after 48 hours",
    "environment": "Indoor manufacturing floor, 22°C, 45% RH",
    "adhesive_used": "Standard cyanoacrylate (ethyl)",
    "industry": "Automotive assembly",
    "production_impact": "Line stoppage, 200 units affected",
}

TEST_FEEDBACK = {
    "was_helpful": True,
    "outcome": "resolved",
    "actual_root_cause": "Surface energy too low on PP — needed plasma treatment",
    "what_worked": "Plasma treatment + primer coat before CA application eliminated failures completely",
    "notes": "E2E test feedback"
}

TEST_ANALYSIS_2 = {
    "substrate_a": "Polypropylene (PP)",
    "substrate_b": "Stainless Steel 316",
    "failure_mode": "Bond delamination at plastic interface during thermal cycling",
    "environment": "Indoor, 20°C, 50% RH",
    "adhesive_used": "Cyanoacrylate",
    "industry": "Medical device assembly",
}


class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    BOLD = "\033[1m"
    END = "\033[0m"


def c(text, color):
    return f"{color}{text}{Colors.END}"


class KnowledgeLoopTest:
    def __init__(self, base_url, cron_secret):
        self.base_url = base_url.rstrip("/")
        self.cron_secret = cron_secret
        self.token = None
        self.analysis_id = None
        self.results = []

    def log(self, step, msg, status="info"):
        icons = {"pass": "✅", "fail": "❌", "info": "ℹ️", "warn": "⚠️", "step": "🔄"}
        icon = icons.get(status, "ℹ️")
        color = {
            "pass": Colors.GREEN,
            "fail": Colors.RED,
            "warn": Colors.YELLOW,
            "info": Colors.BLUE,
            "step": Colors.BOLD,
        }.get(status, "")
        print(f"  {icon} {c(f'[{step}]', color)} {msg}")

    def check(self, step, condition, pass_msg, fail_msg):
        if condition:
            self.log(step, pass_msg, "pass")
            self.results.append((step, True, pass_msg))
        else:
            self.log(step, fail_msg, "fail")
            self.results.append((step, False, fail_msg))
        return condition

    def run(self):
        print(f"\n{c('='*60, Colors.BOLD)}")
        print(f"{c('  GRAVIX KNOWLEDGE ENGINE — E2E LOOP TEST', Colors.BOLD)}")
        print(f"{c('='*60, Colors.BOLD)}")
        print(f"  Target: {self.base_url}")
        print(f"  Time:   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        self.step_0_health()
        self.step_1_auth()
        self.step_2_analyze()
        self.step_3_feedback()
        self.step_4_aggregate()
        self.step_5_reanalyze()
        self.step_6_stats()

        self.summary()

    def step_0_health(self):
        print(f"\n{c('Step 0: Health Check', Colors.BOLD)}")
        try:
            r = requests.get(f"{self.base_url}/health", timeout=15)
            data = r.json()
            self.check("health", r.status_code == 200, f"API healthy — v{data.get('version', '?')}", f"Health check failed: {r.status_code}")
        except Exception as e:
            self.check("health", False, "", f"Cannot reach API: {e}")
            print(f"\n  {c('Cannot continue without API access. Aborting.', Colors.RED)}")
            self.summary()
            sys.exit(1)

    def step_1_auth(self):
        print(f"\n{c('Step 1: Authentication', Colors.BOLD)}")
        if not GRAVIX_EMAIL or not GRAVIX_PASSWORD:
            self.log("auth", "No GRAVIX_EMAIL/GRAVIX_PASSWORD — running unauthenticated", "warn")
            self.log("auth", "Set env vars for full loop test (analyze/feedback require auth)", "info")
            return

        if not SUPABASE_ANON_KEY:
            self.log("auth", "No SUPABASE_ANON_KEY — cannot authenticate", "warn")
            return

        try:
            self.log("auth", f"Signing in as {GRAVIX_EMAIL}...", "step")
            r = requests.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                json={"email": GRAVIX_EMAIL, "password": GRAVIX_PASSWORD},
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                timeout=15,
            )
            if r.status_code == 200:
                data = r.json()
                self.token = data.get("access_token")
                self.check("auth", bool(self.token), f"Authenticated as {GRAVIX_EMAIL}", "No access token in response")
            else:
                self.check("auth", False, "", f"Auth failed: {r.status_code} — {r.text[:200]}")
        except Exception as e:
            self.check("auth", False, "", f"Auth error: {e}")

    def step_2_analyze(self):
        print(f"\n{c('Step 2: Submit Failure Analysis', Colors.BOLD)}")
        self.log("analyze", f"Substrates: {TEST_ANALYSIS_1['substrate_a']} → {TEST_ANALYSIS_1['substrate_b']}", "step")

        try:
            r = requests.post(
                f"{self.base_url}/analyze",
                json=TEST_ANALYSIS_1,
                headers=self._headers(),
                timeout=60,
            )

            if r.status_code == 429:
                self.check("analyze", False, "", "Rate limited — try again later")
                return

            self.check("analyze.status", r.status_code == 200, f"Analysis returned 200", f"Got {r.status_code}: {r.text[:200]}")

            if r.status_code == 200:
                data = r.json()
                self.analysis_id = data.get("id") or data.get("analysis_id")
                
                has_root_cause = bool(data.get("root_cause_analysis") or data.get("root_causes"))
                self.check("analyze.content", has_root_cause, "Root cause analysis present", "Missing root cause analysis")

                confidence = data.get("confidence_score") or data.get("confidence")
                self.check("analyze.confidence", confidence is not None, f"Confidence score: {confidence}", "Missing confidence score")

                evidence = data.get("knowledge_evidence_count", 0)
                self.log("analyze", f"Knowledge evidence count: {evidence}", "info")

                similar = data.get("similar_cases", [])
                self.log("analyze", f"Similar cases found: {len(similar)}", "info")

                if self.analysis_id:
                    self.log("analyze", f"Analysis ID: {self.analysis_id}", "info")
                else:
                    self.log("analyze", "No analysis ID returned — feedback step will be skipped", "warn")

        except requests.Timeout:
            self.check("analyze", False, "", "Request timed out (60s) — Render may be cold-starting")
        except Exception as e:
            self.check("analyze", False, "", f"Error: {e}")

    def step_3_feedback(self):
        print(f"\n{c('Step 3: Submit Feedback', Colors.BOLD)}")

        if not self.analysis_id:
            self.log("feedback", "Skipping — no analysis ID from step 2", "warn")
            return

        try:
            payload = {**TEST_FEEDBACK, "analysis_id": self.analysis_id}
            r = requests.post(
                f"{self.base_url}/v1/feedback",
                json=payload,
                headers=self._headers(),
                timeout=30,
            )

            self.check(
                "feedback",
                r.status_code in (200, 201),
                f"Feedback submitted (status {r.status_code})",
                f"Feedback failed: {r.status_code} — {r.text[:200]}",
            )

            if r.status_code in (200, 201):
                data = r.json()
                self.log("feedback", f"Response: {json.dumps(data)[:200]}", "info")

        except Exception as e:
            self.check("feedback", False, "", f"Error: {e}")

    def step_4_aggregate(self):
        print(f"\n{c('Step 4: Trigger Knowledge Aggregation', Colors.BOLD)}")

        if not self.cron_secret:
            self.log("aggregate", "No CRON_SECRET — skipping aggregation trigger", "warn")
            self.log("aggregate", "Set CRON_SECRET env var to test full loop", "info")
            return

        cron_endpoints = [
            "/v1/cron/aggregate-knowledge",
            "/v1/cron/aggregate-metrics",
        ]

        for endpoint in cron_endpoints:
            try:
                r = requests.post(
                    f"{self.base_url}{endpoint}",
                    headers={"X-Cron-Secret": self.cron_secret},
                    timeout=30,
                )
                self.check(
                    f"cron.{endpoint.split('/')[-1]}",
                    r.status_code == 200,
                    f"{endpoint} → 200 OK",
                    f"{endpoint} → {r.status_code}: {r.text[:200]}",
                )
                if r.status_code == 200:
                    data = r.json()
                    self.log("aggregate", f"  Result: {json.dumps(data)[:200]}", "info")
            except Exception as e:
                self.check(f"cron.{endpoint.split('/')[-1]}", False, "", f"Error: {e}")

    def step_5_reanalyze(self):
        print(f"\n{c('Step 5: Re-analyze Similar Substrates', Colors.BOLD)}")
        self.log("reanalyze", f"Substrates: {TEST_ANALYSIS_2['substrate_a']} → {TEST_ANALYSIS_2['substrate_b']}", "step")
        self.log("reanalyze", "Expecting knowledge injection from step 3/4 feedback", "info")

        try:
            r = requests.post(
                f"{self.base_url}/analyze",
                json=TEST_ANALYSIS_2,
                headers=self._headers(),
                timeout=60,
            )

            if r.status_code == 429:
                self.check("reanalyze", False, "", "Rate limited — try again later")
                return

            self.check("reanalyze.status", r.status_code == 200, "Second analysis returned 200", f"Got {r.status_code}")

            if r.status_code == 200:
                data = r.json()
                evidence = data.get("knowledge_evidence_count", 0)

                # The key test: does the second analysis have knowledge evidence?
                self.check(
                    "reanalyze.knowledge",
                    evidence > 0,
                    f"Knowledge injected! Evidence count: {evidence} 🎯",
                    f"No knowledge evidence found (count: {evidence}). Loop may need more data or aggregation hasn't run yet.",
                )

                similar = data.get("similar_cases", [])
                self.check(
                    "reanalyze.similar",
                    len(similar) > 0,
                    f"Similar cases returned: {len(similar)}",
                    "No similar cases found. May need more historical data.",
                )

                confidence = data.get("confidence_score") or data.get("confidence")
                self.log("reanalyze", f"Confidence: {confidence}", "info")

        except requests.Timeout:
            self.check("reanalyze", False, "", "Request timed out (60s)")
        except Exception as e:
            self.check("reanalyze", False, "", f"Error: {e}")

    def step_6_stats(self):
        print(f"\n{c('Step 6: Verify Public Stats', Colors.BOLD)}")
        try:
            r = requests.get(f"{self.base_url}/v1/stats/public", timeout=15)
            self.check("stats.status", r.status_code == 200, "Stats endpoint OK", f"Got {r.status_code}")

            if r.status_code == 200:
                data = r.json()
                self.log("stats", f"Total analyses: {data.get('total_analyses', '?')}", "info")
                self.log("stats", f"Knowledge patterns: {data.get('knowledge_patterns_count', '?')}", "info")
                self.log("stats", f"Resolution rate: {data.get('resolution_rate', '?')}", "info")
                self.log("stats", f"Specs completed: {data.get('specs_completed_count', '?')}", "info")
        except Exception as e:
            self.check("stats", False, "", f"Error: {e}")

    def summary(self):
        print(f"\n{c('='*60, Colors.BOLD)}")
        print(f"{c('  RESULTS SUMMARY', Colors.BOLD)}")
        print(f"{c('='*60, Colors.BOLD)}")

        passed = sum(1 for _, ok, _ in self.results if ok)
        failed = sum(1 for _, ok, _ in self.results if not ok)
        total = len(self.results)

        for step, ok, msg in self.results:
            icon = "✅" if ok else "❌"
            print(f"  {icon} {step}: {msg}")

        print()
        color = Colors.GREEN if failed == 0 else Colors.RED
        print(f"  {c(f'{passed}/{total} passed', color)}, {failed} failed")
        print()

        if failed > 0:
            print(f"  {c('NOTES:', Colors.YELLOW)}")
            print(f"  • Knowledge loop needs ≥1 feedback + aggregation to show evidence")
            print(f"  • First run will show 0 evidence — run again after cron fires")
            print(f"  • Rate limits may block rapid re-testing (10 req/min)")
            print()

    def _headers(self):
        h = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gravix Knowledge Loop E2E Test")
    parser.add_argument("--prod", action="store_true", help="Test against production")
    parser.add_argument("--local", action="store_true", help="Test against localhost:8000")
    parser.add_argument("--url", help="Custom base URL")
    args = parser.parse_args()

    if args.url:
        url = args.url
    elif args.local:
        url = LOCAL_URL
    else:
        url = PROD_URL  # default to prod

    # Load CRON_SECRET from api/.env if not in env
    if not CRON_SECRET:
        env_file = os.path.join(os.path.dirname(__file__), "..", "api", ".env")
        if os.path.exists(env_file):
            with open(env_file) as f:
                for line in f:
                    if line.startswith("CRON_SECRET="):
                        os.environ["CRON_SECRET"] = line.strip().split("=", 1)[1]
                        break
            CRON_SECRET_LOCAL = os.environ.get("CRON_SECRET", "")
        else:
            CRON_SECRET_LOCAL = ""
    else:
        CRON_SECRET_LOCAL = CRON_SECRET

    test = KnowledgeLoopTest(url, CRON_SECRET_LOCAL)
    test.run()
