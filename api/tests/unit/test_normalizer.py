"""Unit tests for utils/normalizer.py — normalize_substrate()."""

import pytest

from utils.normalizer import normalize_substrate, _COMMON_MAP


# =====================================================================
# 1. None / empty / whitespace → None
# =====================================================================

class TestNormalizerNoneAndEmpty:
    def test_none_returns_none(self):
        assert normalize_substrate(None) is None

    def test_empty_string_returns_none(self):
        assert normalize_substrate("") is None

    def test_whitespace_only_returns_none(self):
        assert normalize_substrate("   ") is None

    def test_single_space_returns_none(self):
        assert normalize_substrate(" ") is None

    def test_tabs_only_returns_none(self):
        assert normalize_substrate("\t\t") is None

    def test_newlines_only_returns_none(self):
        assert normalize_substrate("\n") is None

    def test_mixed_whitespace_returns_none(self):
        assert normalize_substrate("  \t\n  ") is None


# =====================================================================
# 2. Lowercasing
# =====================================================================

class TestNormalizerLowercase:
    def test_uppercase_input(self):
        result = normalize_substrate("STEEL")
        assert result == "steel"

    def test_mixed_case(self):
        result = normalize_substrate("StAiNlEsS StEeL")
        assert result == "stainless steel"

    def test_already_lowercase(self):
        result = normalize_substrate("copper")
        assert result == "copper"


# =====================================================================
# 3. Common abbreviation mapping (_COMMON_MAP)
# =====================================================================

class TestNormalizerCommonMap:
    def test_aluminium_to_aluminum(self):
        assert normalize_substrate("aluminium") == "aluminum"

    def test_aluminium_uppercase(self):
        assert normalize_substrate("ALUMINIUM") == "aluminum"

    def test_aluminium_mixed_case(self):
        assert normalize_substrate("Aluminium") == "aluminum"

    def test_al_abbreviation(self):
        assert normalize_substrate("al") == "aluminum"

    def test_alu_abbreviation(self):
        assert normalize_substrate("alu") == "aluminum"

    def test_pc_to_polycarbonate(self):
        assert normalize_substrate("PC") == "polycarbonate"

    def test_pc_lowercase(self):
        assert normalize_substrate("pc") == "polycarbonate"

    def test_abs_stays_abs(self):
        assert normalize_substrate("ABS") == "abs"

    def test_abs_mixed_case(self):
        assert normalize_substrate("Abs") == "abs"

    def test_pmma_to_acrylic(self):
        assert normalize_substrate("PMMA") == "acrylic"

    def test_cf_to_carbon_fiber(self):
        assert normalize_substrate("CF") == "carbon fiber"

    def test_cfrp_to_carbon_fiber(self):
        assert normalize_substrate("CFRP") == "carbon fiber"

    def test_all_common_map_entries(self):
        """Every key in _COMMON_MAP should normalize to its value."""
        for key, expected in _COMMON_MAP.items():
            result = normalize_substrate(key)
            assert result == expected, f"_COMMON_MAP[{key!r}] expected {expected!r}, got {result!r}"


# =====================================================================
# 4. Punctuation / special character removal
# =====================================================================

class TestNormalizerPunctuation:
    def test_parentheses_removed(self):
        result = normalize_substrate("Aluminum (6061-T6)")
        # Parens are non-alnum non-space non-hyphen → replaced by space
        assert "(" not in result
        assert ")" not in result

    def test_commas_removed(self):
        result = normalize_substrate("steel, galvanized")
        assert "," not in result

    def test_periods_removed(self):
        result = normalize_substrate("p.v.c")
        assert "." not in result

    def test_slashes_removed(self):
        result = normalize_substrate("rubber/neoprene")
        assert "/" not in result

    def test_hyphens_preserved(self):
        result = normalize_substrate("6061-T6")
        assert "-" in result

    def test_at_sign_removed(self):
        result = normalize_substrate("alloy@test")
        assert "@" not in result

    def test_hash_removed(self):
        result = normalize_substrate("grade#5")
        assert "#" not in result


# =====================================================================
# 5. Whitespace collapsing
# =====================================================================

class TestNormalizerWhitespace:
    def test_multiple_spaces_collapsed(self):
        result = normalize_substrate("stainless    steel")
        assert result == "stainless steel"

    def test_leading_trailing_stripped(self):
        result = normalize_substrate("  copper  ")
        assert result == "copper"

    def test_tabs_collapsed(self):
        result = normalize_substrate("carbon\tfiber")
        assert result == "carbon fiber"

    def test_newlines_collapsed(self):
        result = normalize_substrate("carbon\nfiber")
        assert result == "carbon fiber"


# =====================================================================
# 6. Underscore → space normalization
# =====================================================================

class TestNormalizerUnderscore:
    def test_underscore_to_space(self):
        result = normalize_substrate("stainless_steel")
        assert result == "stainless steel"

    def test_multiple_underscores(self):
        result = normalize_substrate("carbon__fiber__reinforced")
        assert result == "carbon fiber reinforced"

    def test_mixed_underscore_and_space(self):
        result = normalize_substrate("carbon_fiber composite")
        assert result == "carbon fiber composite"


# =====================================================================
# 7. Combined / real-world inputs
# =====================================================================

class TestNormalizerRealWorld:
    def test_aluminum_6061_t6(self):
        result = normalize_substrate("Aluminum 6061-T6")
        assert result == "aluminum 6061-t6"

    def test_aluminum_with_parens(self):
        result = normalize_substrate("Aluminum (6061-T6)")
        # parens become spaces, get collapsed
        assert result == "aluminum 6061-t6"

    def test_stainless_steel_304(self):
        result = normalize_substrate("Stainless Steel 304")
        assert result == "stainless steel 304"

    def test_glass_filled_nylon(self):
        result = normalize_substrate("Glass-Filled Nylon")
        assert result == "glass-filled nylon"

    def test_e_coat_with_special_chars(self):
        result = normalize_substrate("E-Coat (Electrocoat)")
        assert result == "e-coat electrocoat"

    def test_single_char_material(self):
        # A single valid character shouldn't be None
        result = normalize_substrate("a")
        assert result is not None

    def test_number_only(self):
        result = normalize_substrate("304")
        assert result == "304"

    def test_hyphen_only(self):
        result = normalize_substrate("-")
        assert result == "-"

    def test_abbreviation_with_trailing_space(self):
        """Trailing spaces should be stripped before map lookup."""
        assert normalize_substrate("  PC  ") == "polycarbonate"

    def test_abbreviation_with_underscore(self):
        """Underscores converted to spaces — so 'p_c' != 'pc' in map."""
        result = normalize_substrate("p_c")
        # 'p_c' → 'p c' (after underscore→space) → not in map → 'p c'
        assert result == "p c"


# =====================================================================
# 8. Idempotency
# =====================================================================

class TestNormalizerIdempotent:
    def test_double_normalize(self):
        """Normalizing an already-normalized value should return the same."""
        first = normalize_substrate("Aluminum 6061-T6")
        second = normalize_substrate(first)
        assert first == second

    def test_double_normalize_abbreviation(self):
        first = normalize_substrate("PC")
        second = normalize_substrate(first)
        assert first == second
