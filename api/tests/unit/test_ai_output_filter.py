"""Tests for AI output post-processing filter."""

import copy
import pytest

from services.ai_output_filter import filter_ai_output


# ---------------------------------------------------------------------------
# Test fixtures
# ---------------------------------------------------------------------------

FULL_RESULT = {
    "id": "abc-123",
    "user_id": "usr-1",
    "status": "completed",
    "root_causes": [
        {"cause": "Surface contamination", "category": "surface_prep", "confidence": 0.92, "explanation": "Oil residue", "evidence": ["visible residue"]},
        {"cause": "Incorrect cure time", "category": "process", "confidence": 0.78, "explanation": "Under-cured", "evidence": ["soft bond line"]},
        {"cause": "Wrong adhesive", "category": "material_selection", "confidence": 0.65, "explanation": "Incompatible chemistry", "evidence": ["spec mismatch"]},
        {"cause": "Humidity exposure", "category": "environment", "confidence": 0.55, "explanation": "Moisture ingress", "evidence": ["whitening"]},
        {"cause": "Thermal shock", "category": "environment", "confidence": 0.40, "explanation": "CTE mismatch", "evidence": ["cracking"]},
    ],
    "contributing_factors": ["High humidity", "No primer used", "Short pot life"],
    "prevention_plan": "Implement surface prep verification and cure monitoring.",
    "confidence_score": 0.92,
    "similar_cases": [
        {"id": "case-1", "failure_mode": "adhesion", "match_score": 0.95},
        {"id": "case-2", "failure_mode": "cohesion", "match_score": 0.88},
        {"id": "case-3", "failure_mode": "adhesion", "match_score": 0.82},
        {"id": "case-4", "failure_mode": "delamination", "match_score": 0.75},
        {"id": "case-5", "failure_mode": "adhesion", "match_score": 0.70},
        {"id": "case-6", "failure_mode": "creep", "match_score": 0.60},
    ],
}


# ---------------------------------------------------------------------------
# Free tier
# ---------------------------------------------------------------------------

class TestFreeTier:
    def test_root_causes_truncated_to_2(self):
        result = filter_ai_output(FULL_RESULT, "free")
        assert len(result["root_causes"]) == 2

    def test_confidence_stripped_from_root_causes(self):
        result = filter_ai_output(FULL_RESULT, "free")
        for rc in result["root_causes"]:
            assert "confidence" not in rc
            assert "confidence_score" not in rc

    def test_top_level_confidence_stripped(self):
        result = filter_ai_output(FULL_RESULT, "free")
        assert "confidence_score" not in result

    def test_contributing_factors_empty(self):
        result = filter_ai_output(FULL_RESULT, "free")
        assert result["contributing_factors"] == []

    def test_prevention_plan_null(self):
        result = filter_ai_output(FULL_RESULT, "free")
        assert result["prevention_plan"] is None

    def test_similar_cases_hidden(self):
        result = filter_ai_output(FULL_RESULT, "free")
        assert result["similar_cases"] is None

    def test_original_not_mutated(self):
        original = copy.deepcopy(FULL_RESULT)
        filter_ai_output(FULL_RESULT, "free")
        assert FULL_RESULT == original


# ---------------------------------------------------------------------------
# Pro tier
# ---------------------------------------------------------------------------

class TestProTier:
    def test_root_causes_all_5(self):
        result = filter_ai_output(FULL_RESULT, "pro")
        assert len(result["root_causes"]) == 5

    def test_confidence_preserved(self):
        result = filter_ai_output(FULL_RESULT, "pro")
        assert result["confidence_score"] == 0.92
        assert result["root_causes"][0]["confidence"] == 0.92

    def test_contributing_factors_preserved(self):
        result = filter_ai_output(FULL_RESULT, "pro")
        assert len(result["contributing_factors"]) == 3

    def test_prevention_plan_preserved(self):
        result = filter_ai_output(FULL_RESULT, "pro")
        assert result["prevention_plan"] is not None

    def test_similar_cases_count_only(self):
        result = filter_ai_output(FULL_RESULT, "pro")
        assert len(result["similar_cases"]) == 1
        assert result["similar_cases"][0]["count"] == 6


# ---------------------------------------------------------------------------
# Team / Quality tier
# ---------------------------------------------------------------------------

class TestTeamTier:
    def test_root_causes_all_5(self):
        result = filter_ai_output(FULL_RESULT, "team")
        assert len(result["root_causes"]) == 5

    def test_similar_cases_full_detail_capped_at_5(self):
        result = filter_ai_output(FULL_RESULT, "team")
        assert len(result["similar_cases"]) == 5
        # Full detail — each case has its fields
        assert "failure_mode" in result["similar_cases"][0]

    def test_quality_alias_same_as_team(self):
        team_result = filter_ai_output(FULL_RESULT, "team")
        quality_result = filter_ai_output(FULL_RESULT, "quality")
        assert team_result == quality_result

    def test_everything_preserved(self):
        result = filter_ai_output(FULL_RESULT, "team")
        assert result["confidence_score"] == 0.92
        assert len(result["contributing_factors"]) == 3
        assert result["prevention_plan"] is not None


# ---------------------------------------------------------------------------
# Enterprise tier
# ---------------------------------------------------------------------------

class TestEnterpriseTier:
    def test_similar_cases_full_detail_capped_at_5(self):
        result = filter_ai_output(FULL_RESULT, "enterprise")
        assert len(result["similar_cases"]) == 5

    def test_everything_preserved(self):
        result = filter_ai_output(FULL_RESULT, "enterprise")
        assert result["confidence_score"] == 0.92
        assert len(result["root_causes"]) == 5
        assert result["prevention_plan"] is not None


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------

class TestEdgeCases:
    def test_unknown_plan_treated_as_free(self):
        result = filter_ai_output(FULL_RESULT, "bogus")
        assert len(result["root_causes"]) == 2
        assert result["similar_cases"] is None

    def test_none_plan_treated_as_free(self):
        result = filter_ai_output(FULL_RESULT, None)
        assert len(result["root_causes"]) == 2

    def test_empty_result(self):
        result = filter_ai_output({}, "free")
        # Filter adds keys for fields it nulls/empties even on empty input
        assert result.get("contributing_factors") == []
        assert result.get("prevention_plan") is None
        assert result.get("similar_cases") is None

    def test_no_similar_cases_count_only(self):
        data = {**FULL_RESULT, "similar_cases": None}
        result = filter_ai_output(data, "pro")
        assert result["similar_cases"] == [{"count": 0}]

    def test_empty_similar_cases_count_only(self):
        data = {**FULL_RESULT, "similar_cases": []}
        result = filter_ai_output(data, "pro")
        assert result["similar_cases"] == [{"count": 0}]
