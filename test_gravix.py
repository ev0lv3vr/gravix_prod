#!/usr/bin/env python3
"""Test script for Gravix Knowledge Engine end-to-end flow."""

import json
import time
import requests
from datetime import datetime, timedelta, timezone
from jose import jwt

# Configuration
BASE_URL = "https://gravix-prod.onrender.com"
CRON_SECRET = "7tAvLEsrI5uGNSFa0WgauloQkICM-_uRDXD5HaE6Cbw"

# Create a test JWT token
# Using HS256 with a test secret since we don't have access to the real Supabase secret
TEST_JWT_SECRET = "super-secret-jwt-test-key-at-least-32-chars-long!!"
TEST_USER_ID = "test-user-" + str(int(time.time()))

def create_test_token():
    """Create a JWT token for testing."""
    payload = {
        "sub": TEST_USER_ID,
        "email": "test@gravix-test.com",
        "aud": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")
    return token

def test_health():
    """Test the health endpoint."""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def create_analysis(token, scenario):
    """Create a failure analysis."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(f"{BASE_URL}/analyze", json=scenario, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Analysis ID: {data.get('id')}")
        print(f"Status: {data.get('status')}")
        return data
    else:
        print(f"Error: {response.text}")
        return None

def submit_feedback(token, analysis_id, feedback_data):
    """Submit feedback for an analysis."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(f"{BASE_URL}/v1/feedback", json=feedback_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Feedback ID: {data.get('id')}")
        return data
    else:
        print(f"Error: {response.text}")
        return None

def trigger_cron(endpoint):
    """Trigger a cron endpoint."""
    headers = {
        "X-Cron-Secret": CRON_SECRET,
        "Content-Type": "application/json"
    }
    response = requests.post(f"{BASE_URL}/v1/cron/{endpoint}", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return data
    else:
        print(f"Error: {response.text}")
        return None

# Test scenarios
SCENARIOS = [
    {
        "name": "Automotive Assembly - Epoxy Bond Failure",
        "data": {
            "material_category": "epoxy",
            "material_subcategory": "structural",
            "failure_mode": "adhesive_failure",
            "failure_description": "Epoxy bond between aluminum and composite failed during thermal cycling",
            "substrate_a": "aluminum",
            "substrate_b": "carbon fiber composite",
            "industry": "automotive",
            "production_impact": "high",
            "temperature_range": "-40°C to 120°C",
            "humidity": "85% RH",
            "time_to_failure": "500 cycles",
            "application_method": "automated dispensing",
            "surface_preparation": "solvent wipe",
            "cure_conditions": "room temperature, 24 hours"
        }
    },
    {
        "name": "Aerospace Bonding - Acrylic Adhesive Delamination",
        "data": {
            "material_category": "acrylic",
            "material_subcategory": "pressure_sensitive",
            "failure_mode": "cohesive_failure",
            "failure_description": "Acrylic adhesive tape delaminated from titanium surface under vibration",
            "substrate_a": "titanium",
            "substrate_b": "polyimide film",
            "industry": "aerospace",
            "production_impact": "critical",
            "temperature_range": "-55°C to 150°C",
            "chemical_exposure": "jet fuel, hydraulic fluid",
            "time_to_failure": "1000 hours vibration",
            "application_method": "manual application",
            "surface_preparation": "abrasive cleaning, primer"
        }
    },
    {
        "name": "Electronics Assembly - Silicone Adhesive Curing Issue",
        "data": {
            "material_category": "silicone",
            "material_subcategory": "rtv",
            "failure_mode": "incomplete_cure",
            "failure_description": "Silicone adhesive remains tacky after recommended cure time",
            "substrate_a": "pcb",
            "substrate_b": "plastic housing",
            "industry": "electronics",
            "production_impact": "medium",
            "temperature_range": "20°C to 85°C",
            "humidity": "60% RH",
            "cure_conditions": "room temperature, 48 hours",
            "additional_notes": "Issue only occurs with certain batches"
        }
    },
    {
        "name": "Medical Device - Cyanoacrylate Bond Weakness",
        "data": {
            "material_category": "cyanoacrylate",
            "material_subcategory": "instant",
            "failure_mode": "low_bond_strength",
            "failure_description": "Insufficient bond strength between polycarbonate components",
            "substrate_a": "polycarbonate",
            "substrate_b": "polycarbonate",
            "industry": "medical",
            "production_impact": "high",
            "temperature_range": "15°C to 40°C",
            "humidity": "40% RH",
            "time_to_failure": "immediate (during assembly)",
            "application_method": "precision applicator",
            "surface_preparation": "IPA wipe",
            "cure_conditions": "instant, 5 second fixture"
        }
    },
    {
        "name": "Construction - Polyurethane Sealant Degradation",
        "data": {
            "material_category": "polyurethane",
            "material_subcategory": "sealant",
            "failure_mode": "environmental_degradation",
            "failure_description": "Polyurethane sealant cracking and yellowing after UV exposure",
            "substrate_a": "glass",
            "substrate_b": "aluminum frame",
            "industry": "construction",
            "production_impact": "medium",
            "temperature_range": "-20°C to 60°C",
            "humidity": "variable outdoor conditions",
            "chemical_exposure": "UV radiation, rain, pollution",
            "time_to_failure": "18 months outdoor exposure",
            "application_method": "caulking gun",
            "surface_preparation": "surface cleaning"
        }
    }
]

def main():
    """Run the end-to-end test."""
    print("=" * 60)
    print("Gravix Knowledge Engine End-to-End Test")
    print("=" * 60)
    
    # Step 1: Test health
    print("\n[Step 1] Testing health endpoint...")
    if not test_health():
        print("❌ Health check failed!")
        return
    print("✓ Health check passed")
    
    # Step 2: Create test token
    print("\n[Step 2] Creating test JWT token...")
    token = create_test_token()
    print(f"✓ Token created for user: {TEST_USER_ID}")
    
    # Step 3: Submit analyses
    print("\n[Step 3] Submitting 5 adhesive analysis requests...")
    analyses = []
    for i, scenario in enumerate(SCENARIOS, 1):
        print(f"\n--- Scenario {i}: {scenario['name']} ---")
        analysis = create_analysis(token, scenario['data'])
        if analysis:
            analyses.append(analysis)
            print("✓ Analysis created")
        else:
            print("❌ Analysis failed")
        time.sleep(1)  # Rate limiting
    
    print(f"\n✓ Created {len(analyses)} analyses")
    
    # Step 4: Submit feedback
    print("\n[Step 4] Submitting feedback for analyses...")
    feedback_scenarios = [
        {"was_helpful": True, "root_cause_confirmed": 1, "outcome": "resolved", "what_worked": "Surface preparation improvement resolved the issue"},
        {"was_helpful": True, "root_cause_confirmed": 2, "outcome": "partially_resolved", "what_worked": "Changed primer, helped but not completely"},
        {"was_helpful": False, "root_cause_confirmed": 0, "outcome": "different_cause", "actual_root_cause": "Contamination from upstream process"},
        {"was_helpful": True, "root_cause_confirmed": 1, "outcome": "resolved", "estimated_cost_saved": 50000.0},
        {"was_helpful": True, "root_cause_confirmed": 3, "outcome": "still_testing"}
    ]
    
    for i, (analysis, fb_data) in enumerate(zip(analyses, feedback_scenarios), 1):
        print(f"\n--- Feedback {i} for {analysis.get('id')} ---")
        fb_data["analysis_id"] = analysis.get("id")
        feedback = submit_feedback(token, analysis.get("id"), fb_data)
        if feedback:
            print("✓ Feedback submitted")
        else:
            print("❌ Feedback failed")
        time.sleep(1)
    
    # Step 5: Trigger knowledge aggregation
    print("\n[Step 5] Triggering knowledge aggregation...")
    knowledge_result = trigger_cron("aggregate-knowledge")
    if knowledge_result:
        print("✓ Knowledge aggregation completed")
    else:
        print("❌ Knowledge aggregation failed")
    
    # Step 6: Trigger metrics aggregation
    print("\n[Step 6] Triggering metrics aggregation...")
    metrics_result = trigger_cron("aggregate-metrics")
    if metrics_result:
        print("✓ Metrics aggregation completed")
    else:
        print("❌ Metrics aggregation failed")
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Health Check: ✓")
    print(f"Analyses Created: {len(analyses)}/5")
    print(f"Knowledge Aggregation: {'✓' if knowledge_result else '❌'}")
    print(f"Metrics Aggregation: {'✓' if metrics_result else '❌'}")
    print("\nNote: Since we don't have access to the production Supabase instance,")
    print("the analyses likely failed due to authentication. The cron endpoints")
    print("should work as they use the X-Cron-Secret header.")
    print("=" * 60)

if __name__ == "__main__":
    main()
