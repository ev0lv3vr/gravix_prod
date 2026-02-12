"""Unit tests for utils/classifier.py — classify_root_cause_category()."""

import pytest

from utils.classifier import classify_root_cause_category


# =====================================================================
# 1. None / empty → "unknown"
# =====================================================================

class TestClassifierEmpty:
    def test_none_returns_unknown(self):
        assert classify_root_cause_category(None) == "unknown"

    def test_empty_list_returns_unknown(self):
        assert classify_root_cause_category([]) == "unknown"

    def test_empty_tuple_returns_unknown(self):
        assert classify_root_cause_category(()) == "unknown"

    def test_empty_generator_returns_unknown(self):
        assert classify_root_cause_category(x for x in []) == "unknown"


# =====================================================================
# 2. Single root cause (dict)
# =====================================================================

class TestClassifierSingleCause:
    def test_single_dict_with_category(self):
        causes = [{"category": "surface_preparation", "confidence": 0.8}]
        assert classify_root_cause_category(causes) == "surface_preparation"

    def test_single_dict_with_root_cause_category_key(self):
        causes = [{"root_cause_category": "contamination", "confidence": 0.7}]
        assert classify_root_cause_category(causes) == "contamination"

    def test_single_dict_category_preferred_over_root_cause_category(self):
        """When both keys exist, 'category' is checked first (or-short-circuit)."""
        causes = [{"category": "adhesive_failure", "root_cause_category": "other", "confidence": 0.9}]
        result = classify_root_cause_category(causes)
        assert result == "adhesive_failure"

    def test_single_dict_no_confidence(self):
        """Even without confidence, category should be returned."""
        causes = [{"category": "thermal_degradation"}]
        assert classify_root_cause_category(causes) == "thermal_degradation"

    def test_single_dict_confidence_none(self):
        causes = [{"category": "chemical_attack", "confidence": None}]
        assert classify_root_cause_category(causes) == "chemical_attack"


# =====================================================================
# 3. Multiple causes — highest confidence wins
# =====================================================================

class TestClassifierMultipleCauses:
    def test_two_causes_picks_higher_confidence(self):
        causes = [
            {"category": "surface_preparation", "confidence": 0.6},
            {"category": "contamination", "confidence": 0.9},
        ]
        assert classify_root_cause_category(causes) == "contamination"

    def test_three_causes_picks_highest(self):
        causes = [
            {"category": "a", "confidence": 0.3},
            {"category": "b", "confidence": 0.8},
            {"category": "c", "confidence": 0.5},
        ]
        assert classify_root_cause_category(causes) == "b"

    def test_equal_confidence_picks_first_encountered_highest(self):
        """When confidences tie, the first one encountered at that level wins."""
        causes = [
            {"category": "first", "confidence": 0.7},
            {"category": "second", "confidence": 0.7},
        ]
        # Both have 0.7. First one sets best_conf to 0.7, second is not > 0.7
        assert classify_root_cause_category(causes) == "first"

    def test_mixed_with_and_without_confidence(self):
        causes = [
            {"category": "no_conf"},
            {"category": "with_conf", "confidence": 0.5},
        ]
        assert classify_root_cause_category(causes) == "with_conf"

    def test_all_without_confidence_returns_first(self):
        causes = [
            {"category": "first_seen"},
            {"category": "second_seen"},
        ]
        assert classify_root_cause_category(causes) == "first_seen"


# =====================================================================
# 4. None entries in list
# =====================================================================

class TestClassifierNoneEntries:
    def test_list_of_nones(self):
        assert classify_root_cause_category([None, None]) == "unknown"

    def test_none_mixed_with_valid(self):
        causes = [None, {"category": "valid", "confidence": 0.8}, None]
        assert classify_root_cause_category(causes) == "valid"

    def test_none_at_start(self):
        causes = [None, {"category": "good", "confidence": 0.5}]
        assert classify_root_cause_category(causes) == "good"


# =====================================================================
# 5. Pydantic model support (via model_dump)
# =====================================================================

class TestClassifierPydanticModel:
    def test_pydantic_like_object(self):
        """Objects with model_dump() method should work."""

        class FakeModel:
            def model_dump(self):
                return {"category": "pydantic_cat", "confidence": 0.85}

        causes = [FakeModel()]
        assert classify_root_cause_category(causes) == "pydantic_cat"

    def test_mixed_dict_and_pydantic(self):
        class FakeModel:
            def model_dump(self):
                return {"category": "model_cat", "confidence": 0.3}

        causes = [
            FakeModel(),
            {"category": "dict_cat", "confidence": 0.9},
        ]
        assert classify_root_cause_category(causes) == "dict_cat"


# =====================================================================
# 6. Edge cases — category formatting
# =====================================================================

class TestClassifierCategoryEdgeCases:
    def test_whitespace_category_stripped(self):
        causes = [{"category": "  surface_prep  ", "confidence": 0.8}]
        assert classify_root_cause_category(causes) == "surface_prep"

    def test_empty_string_category_skipped(self):
        """Empty string category (after strip) should be falsy, so skipped."""
        causes = [
            {"category": "", "confidence": 0.9},
            {"category": "real", "confidence": 0.5},
        ]
        assert classify_root_cause_category(causes) == "real"

    def test_whitespace_only_category_skipped(self):
        causes = [
            {"category": "   ", "confidence": 0.9},
            {"category": "fallback", "confidence": 0.1},
        ]
        assert classify_root_cause_category(causes) == "fallback"

    def test_none_category_value_skipped(self):
        causes = [
            {"category": None, "confidence": 0.9},
            {"category": "valid", "confidence": 0.5},
        ]
        assert classify_root_cause_category(causes) == "valid"

    def test_numeric_category_skipped(self):
        """Non-string category should be skipped (isinstance check)."""
        causes = [
            {"category": 123, "confidence": 0.9},
            {"category": "valid", "confidence": 0.5},
        ]
        assert classify_root_cause_category(causes) == "valid"


# =====================================================================
# 7. Confidence edge cases
# =====================================================================

class TestClassifierConfidenceEdgeCases:
    def test_zero_confidence(self):
        """Zero confidence is valid and greater than initial -1.0."""
        causes = [{"category": "zero_conf", "confidence": 0.0}]
        assert classify_root_cause_category(causes) == "zero_conf"

    def test_negative_confidence(self):
        """Negative confidence is still > -1.0 initial."""
        causes = [{"category": "neg_conf", "confidence": -0.5}]
        assert classify_root_cause_category(causes) == "neg_conf"

    def test_very_high_confidence(self):
        causes = [{"category": "high", "confidence": 100.0}]
        assert classify_root_cause_category(causes) == "high"

    def test_string_confidence_coerced(self):
        """String confidence should be converted via float()."""
        causes = [{"category": "str_conf", "confidence": "0.75"}]
        assert classify_root_cause_category(causes) == "str_conf"

    def test_invalid_string_confidence_ignored(self):
        """Non-numeric string confidence → skipped for ranking but category still captured."""
        causes = [{"category": "bad_conf", "confidence": "not-a-number"}]
        # Category is set as best_category (first seen), but conf_f is None
        assert classify_root_cause_category(causes) == "bad_conf"


# =====================================================================
# 8. Unknown shape handling
# =====================================================================

class TestClassifierUnknownShapes:
    def test_string_items_skipped(self):
        causes = ["string_cause", "another"]
        assert classify_root_cause_category(causes) == "unknown"

    def test_int_items_skipped(self):
        causes = [42, 99]
        assert classify_root_cause_category(causes) == "unknown"

    def test_mixed_valid_and_invalid_shapes(self):
        causes = [
            "just_a_string",
            {"category": "valid", "confidence": 0.7},
            42,
        ]
        assert classify_root_cause_category(causes) == "valid"

    def test_no_category_key_at_all(self):
        causes = [{"confidence": 0.9, "description": "something"}]
        assert classify_root_cause_category(causes) == "unknown"

    def test_empty_dict(self):
        causes = [{}]
        assert classify_root_cause_category(causes) == "unknown"
