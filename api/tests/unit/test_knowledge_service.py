"""Unit tests for knowledge_service.py — pure-logic functions.

Tests calibrate_confidence() and format_knowledge_for_prompt() which
don't require a database connection.
"""

import pytest

from services.knowledge_service import calibrate_confidence, format_knowledge_for_prompt


# =====================================================================
# calibrate_confidence()
# =====================================================================

class TestCalibrateConfidenceNoPatterns:
    """No patterns → return original score unchanged."""

    def test_empty_patterns_returns_original(self):
        score, evidence = calibrate_confidence(0.8, [])
        assert score == 0.8
        assert evidence is None

    def test_zero_confidence_no_patterns(self):
        score, evidence = calibrate_confidence(0.0, [])
        assert score == 0.0
        assert evidence is None

    def test_one_confidence_no_patterns(self):
        score, evidence = calibrate_confidence(1.0, [])
        assert score == 1.0
        assert evidence is None


class TestCalibrateConfidenceLowEvidence:
    """Patterns with evidence_count < 3 → return original score but note evidence."""

    def test_single_pattern_evidence_1(self):
        patterns = [{"evidence_count": 1, "success_rate": 0.9}]
        score, evidence = calibrate_confidence(0.7, patterns)
        assert score == 0.7  # unchanged
        assert evidence == 1

    def test_single_pattern_evidence_2(self):
        patterns = [{"evidence_count": 2, "success_rate": 0.8}]
        score, evidence = calibrate_confidence(0.6, patterns)
        assert score == 0.6
        assert evidence == 2

    def test_multiple_low_evidence_patterns(self):
        patterns = [
            {"evidence_count": 1, "success_rate": 0.9},
            {"evidence_count": 2, "success_rate": 0.8},
        ]
        score, evidence = calibrate_confidence(0.5, patterns)
        assert score == 0.5
        assert evidence == 3  # total: 1 + 2

    def test_zero_evidence_count(self):
        patterns = [{"evidence_count": 0, "success_rate": 0.9}]
        score, evidence = calibrate_confidence(0.7, patterns)
        assert score == 0.7
        assert evidence is None  # total is 0

    def test_none_evidence_count(self):
        patterns = [{"success_rate": 0.9}]
        score, evidence = calibrate_confidence(0.7, patterns)
        assert score == 0.7
        assert evidence is None


class TestCalibrateConfidenceFormula:
    """Patterns with sufficient evidence → calibrated = ai * 0.7 + empirical * 0.3."""

    def test_basic_calibration(self):
        """ai=0.8, empirical=1.0 → 0.8*0.7 + 1.0*0.3 = 0.56 + 0.30 = 0.86"""
        patterns = [{"evidence_count": 5, "success_rate": 1.0}]
        score, evidence = calibrate_confidence(0.8, patterns)
        assert score == pytest.approx(0.86, abs=0.001)
        assert evidence == 5

    def test_calibration_low_success(self):
        """ai=0.8, empirical=0.2 → 0.56 + 0.06 = 0.62"""
        patterns = [{"evidence_count": 10, "success_rate": 0.2}]
        score, evidence = calibrate_confidence(0.8, patterns)
        assert score == pytest.approx(0.62, abs=0.001)
        assert evidence == 10

    def test_calibration_ai_zero(self):
        """ai=0.0, empirical=0.5 → 0.0 + 0.15 = 0.15"""
        patterns = [{"evidence_count": 3, "success_rate": 0.5}]
        score, evidence = calibrate_confidence(0.0, patterns)
        assert score == pytest.approx(0.15, abs=0.001)

    def test_calibration_ai_one(self):
        """ai=1.0, empirical=0.0 → 0.7 + 0.0 = 0.7"""
        patterns = [{"evidence_count": 3, "success_rate": 0.0}]
        score, evidence = calibrate_confidence(1.0, patterns)
        assert score == pytest.approx(0.7, abs=0.001)

    def test_weighted_average_multiple_patterns(self):
        """Two patterns with different evidence counts → weighted avg."""
        patterns = [
            {"evidence_count": 10, "success_rate": 0.8},
            {"evidence_count": 5, "success_rate": 0.4},
        ]
        # empirical = (10*0.8 + 5*0.4) / (10+5) = (8+2)/15 = 10/15 ≈ 0.6667
        # calibrated = 0.7 * 0.7 + 0.6667 * 0.3 = 0.49 + 0.2 = 0.69
        score, evidence = calibrate_confidence(0.7, patterns)
        assert score == pytest.approx(0.69, abs=0.01)
        assert evidence == 15

    def test_mixed_strong_and_weak_patterns(self):
        """Only strong patterns (evidence >= 3) are used for calibration."""
        patterns = [
            {"evidence_count": 10, "success_rate": 0.9},  # strong
            {"evidence_count": 1, "success_rate": 0.1},   # weak (ignored)
        ]
        # empirical from strong only: 0.9
        # calibrated = 0.6 * 0.7 + 0.9 * 0.3 = 0.42 + 0.27 = 0.69
        score, evidence = calibrate_confidence(0.6, patterns)
        assert score == pytest.approx(0.69, abs=0.01)
        assert evidence == 10  # only strong patterns count


class TestCalibrateConfidenceClamping:
    """Calibrated values should be clamped to [0, 1]."""

    def test_clamp_above_one(self):
        """If ai > 1 somehow, clamped to 1.0."""
        patterns = [{"evidence_count": 5, "success_rate": 1.0}]
        score, _ = calibrate_confidence(1.5, patterns)
        assert score <= 1.0

    def test_clamp_below_zero(self):
        """If ai is negative, result could be < 0; clamped to 0."""
        patterns = [{"evidence_count": 5, "success_rate": 0.0}]
        score, _ = calibrate_confidence(-0.5, patterns)
        assert score >= 0.0

    def test_result_always_in_range(self):
        """Verify across a range of inputs."""
        for ai in [0.0, 0.2, 0.5, 0.8, 1.0]:
            for rate in [0.0, 0.3, 0.6, 1.0]:
                patterns = [{"evidence_count": 5, "success_rate": rate}]
                score, _ = calibrate_confidence(ai, patterns)
                assert 0.0 <= score <= 1.0, f"ai={ai}, rate={rate} → {score}"


class TestCalibrateConfidenceNoneSuccessRate:
    """Patterns without success_rate should not contribute to weighted average."""

    def test_success_rate_none_skipped(self):
        patterns = [{"evidence_count": 5, "success_rate": None}]
        score, evidence = calibrate_confidence(0.7, patterns)
        # total_weight is 0, so returns original
        assert score == 0.7
        assert evidence == 5

    def test_mixed_none_and_valid_success(self):
        patterns = [
            {"evidence_count": 5, "success_rate": None},  # skipped
            {"evidence_count": 10, "success_rate": 0.8},  # used
        ]
        # empirical = 0.8 (only from the 10-evidence pattern)
        # calibrated = 0.6 * 0.7 + 0.8 * 0.3 = 0.42 + 0.24 = 0.66
        score, evidence = calibrate_confidence(0.6, patterns)
        assert score == pytest.approx(0.66, abs=0.01)
        assert evidence == 15  # both counts are summed

    def test_pattern_evidence_zero_but_count_ge3(self):
        """evidence_count=3 but weight=0 due to success_rate being 0."""
        patterns = [{"evidence_count": 3, "success_rate": 0.0}]
        # weight is 3, rate is 0.0; weighted_sum = 0.0, total_weight = 3
        # empirical = 0.0
        # calibrated = 0.5 * 0.7 + 0.0 * 0.3 = 0.35
        score, evidence = calibrate_confidence(0.5, patterns)
        assert score == pytest.approx(0.35, abs=0.01)


class TestCalibrateConfidenceRounding:
    """Calibrated score is rounded to 4 decimal places."""

    def test_result_rounded(self):
        patterns = [{"evidence_count": 3, "success_rate": 0.333}]
        score, _ = calibrate_confidence(0.777, patterns)
        # Check that score has at most 4 decimal places
        assert score == round(score, 4)


# =====================================================================
# format_knowledge_for_prompt()
# =====================================================================

class TestFormatKnowledgeEmpty:
    def test_empty_list_returns_empty_string(self):
        assert format_knowledge_for_prompt([]) == ""

    def test_none_like_empty(self):
        """Not called with None in practice, but empty list is the contract."""
        assert format_knowledge_for_prompt([]) == ""


class TestFormatKnowledgeSinglePattern:
    def test_single_pattern_basic(self):
        patterns = [{
            "substrate_a_normalized": "aluminum",
            "substrate_b_normalized": "steel",
            "evidence_count": 5,
            "success_rate": 0.8,
            "root_cause_category": "surface_preparation",
            "adhesive_family": "epoxy",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "EMPIRICAL KNOWLEDGE" in result
        assert "Pattern 1:" in result
        assert "aluminum" in result
        assert "steel" in result
        assert "surface_preparation" in result
        assert "epoxy" in result
        assert "5 confirmed cases" in result
        assert "80%" in result

    def test_single_pattern_no_adhesive(self):
        patterns = [{
            "substrate_a_normalized": "glass",
            "substrate_b_normalized": "plastic",
            "evidence_count": 3,
            "success_rate": 0.5,
            "root_cause_category": "chemical_attack",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "Adhesive family" not in result  # unknown adhesive not shown

    def test_adhesive_unknown_not_shown(self):
        patterns = [{
            "substrate_a_normalized": "x",
            "substrate_b_normalized": "y",
            "evidence_count": 1,
            "root_cause_category": "unknown",
            "adhesive_family": "unknown",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "Adhesive family" not in result


class TestFormatKnowledgeMultiplePatterns:
    def test_two_patterns(self):
        patterns = [
            {
                "substrate_a_normalized": "aluminum",
                "substrate_b_normalized": "steel",
                "evidence_count": 10,
                "success_rate": 0.9,
                "root_cause_category": "surface_prep",
                "metadata": {},
            },
            {
                "substrate_a_normalized": "glass",
                "substrate_b_normalized": "nylon",
                "evidence_count": 3,
                "success_rate": 0.6,
                "root_cause_category": "thermal",
                "metadata": {},
            },
        ]
        result = format_knowledge_for_prompt(patterns)
        assert "Pattern 1:" in result
        assert "Pattern 2:" in result
        assert "aluminum" in result
        assert "glass" in result

    def test_pattern_numbering_sequential(self):
        patterns = [
            {"substrate_a_normalized": f"sub_{i}", "substrate_b_normalized": "y",
             "evidence_count": 1, "root_cause_category": "x", "metadata": {}}
            for i in range(5)
        ]
        result = format_knowledge_for_prompt(patterns)
        for i in range(1, 6):
            assert f"Pattern {i}:" in result


class TestFormatKnowledgeMetadata:
    def test_confirmed_fixes_shown(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 5,
            "root_cause_category": "x",
            "metadata": {
                "top_confirmed_fixes": ["IPA wipe", "Grit blast", "Plasma treatment"],
            },
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "Confirmed fixes:" in result
        assert "IPA wipe" in result

    def test_confirmed_root_causes_shown(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 5,
            "root_cause_category": "x",
            "metadata": {
                "top_confirmed_root_causes": ["Oil contamination", "Moisture ingress"],
            },
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "Confirmed root causes:" in result
        assert "Oil contamination" in result

    def test_max_three_fixes_shown(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 5,
            "root_cause_category": "x",
            "metadata": {
                "top_confirmed_fixes": ["fix1", "fix2", "fix3", "fix4", "fix5"],
            },
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "fix1" in result
        assert "fix3" in result
        # fix4 and fix5 are sliced out by [:3]
        assert "fix4" not in result

    def test_empty_metadata(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 1,
            "root_cause_category": "x",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "Confirmed fixes" not in result
        assert "Confirmed root causes" not in result

    def test_no_metadata_key(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 1,
            "root_cause_category": "x",
        }]
        result = format_knowledge_for_prompt(patterns)
        # Should not crash — .get("metadata", {}) handles it
        assert "Pattern 1:" in result


class TestFormatKnowledgeSuccessRate:
    def test_success_rate_formatted_as_percent(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 5,
            "success_rate": 0.85,
            "root_cause_category": "x",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "85%" in result

    def test_success_rate_none_not_shown(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 5,
            "success_rate": None,
            "root_cause_category": "x",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "Success rate" not in result

    def test_success_rate_zero(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 5,
            "success_rate": 0.0,
            "root_cause_category": "x",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "0%" in result


class TestFormatKnowledgeStructure:
    def test_header_and_footer_present(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 1,
            "root_cause_category": "x",
            "metadata": {},
        }]
        result = format_knowledge_for_prompt(patterns)
        assert "--- EMPIRICAL KNOWLEDGE FROM CONFIRMED PRODUCTION OUTCOMES ---" in result
        assert "--- END EMPIRICAL KNOWLEDGE ---" in result

    def test_returns_string(self):
        patterns = [{
            "substrate_a_normalized": "a",
            "substrate_b_normalized": "b",
            "evidence_count": 1,
            "root_cause_category": "x",
            "metadata": {},
        }]
        assert isinstance(format_knowledge_for_prompt(patterns), str)
