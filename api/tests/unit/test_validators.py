"""Unit tests for Pydantic schemas (analyze + feedback)."""

import pytest
from pydantic import ValidationError

from schemas.analyze import (
    FailureAnalysisCreate,
    FailureAnalysisResponse,
    RootCause,
    Recommendation,
)
from schemas.feedback import (
    FeedbackCreate,
    FeedbackOutcome,
    FeedbackSource,
    SubstrateCorrection,
    FeedbackResponse,
)


# =====================================================================
# FailureAnalysisCreate
# =====================================================================

class TestFailureAnalysisCreate:
    """Tests for the analysis request schema."""

    def test_minimal_valid(self):
        """Only material_category + failure_mode are required."""
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="delamination",
        )
        assert obj.material_category == "epoxy"
        assert obj.failure_mode == "delamination"

    def test_optional_fields_default_none(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
        )
        assert obj.material_subcategory is None
        assert obj.material_product is None
        assert obj.failure_description is None
        assert obj.substrate_a is None
        assert obj.substrate_b is None
        assert obj.industry is None
        assert obj.production_impact is None
        assert obj.temperature_range is None
        assert obj.humidity is None
        assert obj.chemical_exposure is None
        assert obj.time_to_failure is None
        assert obj.application_method is None
        assert obj.surface_preparation is None
        assert obj.cure_conditions is None
        assert obj.photos is None
        assert obj.test_results is None
        assert obj.additional_notes is None

    def test_all_fields_populated(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            material_subcategory="two-part structural",
            material_product="Loctite EA 9394",
            failure_mode="delamination",
            failure_description="Bond failed after 6 months",
            substrate_a="Aluminum 6061",
            substrate_b="Carbon Fiber",
            industry="aerospace",
            production_impact="high",
            temperature_range="-40 to 180°F",
            humidity="85% RH",
            chemical_exposure="jet fuel",
            time_to_failure="6 months",
            application_method="manual dispensing",
            surface_preparation="grit blast + solvent wipe",
            cure_conditions="RT cure 24h",
            photos=["photo1.jpg", "photo2.jpg"],
            test_results="Lap shear: 2500 psi (spec: 3500 psi)",
            additional_notes="Failure at interface",
        )
        assert obj.substrate_a == "Aluminum 6061"
        assert obj.photos == ["photo1.jpg", "photo2.jpg"]

    def test_missing_material_category_fails(self):
        with pytest.raises(ValidationError) as exc_info:
            FailureAnalysisCreate(failure_mode="cracking")
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("material_category",) for e in errors)

    def test_missing_failure_mode_fails(self):
        with pytest.raises(ValidationError) as exc_info:
            FailureAnalysisCreate(material_category="epoxy")
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("failure_mode",) for e in errors)

    def test_missing_both_required_fails(self):
        with pytest.raises(ValidationError):
            FailureAnalysisCreate()

    def test_empty_string_material_category_accepted(self):
        """Pydantic str doesn't enforce non-empty by default."""
        obj = FailureAnalysisCreate(material_category="", failure_mode="x")
        assert obj.material_category == ""

    def test_photos_empty_list(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            photos=[],
        )
        assert obj.photos == []

    def test_model_dump_excludes_none(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
        )
        dumped = obj.model_dump(exclude_none=True)
        assert "substrate_a" not in dumped
        assert "material_category" in dumped

    def test_extra_fields_ignored(self):
        """Extra fields should be ignored (Pydantic default forbid is not set)."""
        # Pydantic v2 default is 'ignore' for extra
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            unknown_field="value",
        )
        assert not hasattr(obj, "unknown_field")


# =====================================================================
# RootCause schema
# =====================================================================

class TestRootCause:
    def test_valid_root_cause(self):
        rc = RootCause(
            cause="Surface contamination",
            category="surface_preparation",
            confidence=0.85,
            explanation="Oil residue detected on substrate",
            evidence=["IR spectroscopy", "Visual inspection"],
        )
        assert rc.confidence == 0.85
        assert len(rc.evidence) == 2

    def test_confidence_bounds_lower(self):
        with pytest.raises(ValidationError):
            RootCause(
                cause="x", category="y", confidence=-0.1, explanation="z"
            )

    def test_confidence_bounds_upper(self):
        with pytest.raises(ValidationError):
            RootCause(
                cause="x", category="y", confidence=1.1, explanation="z"
            )

    def test_confidence_exactly_zero(self):
        rc = RootCause(cause="x", category="y", confidence=0.0, explanation="z")
        assert rc.confidence == 0.0

    def test_confidence_exactly_one(self):
        rc = RootCause(cause="x", category="y", confidence=1.0, explanation="z")
        assert rc.confidence == 1.0

    def test_evidence_defaults_empty(self):
        rc = RootCause(cause="x", category="y", confidence=0.5, explanation="z")
        assert rc.evidence == []


# =====================================================================
# Recommendation schema
# =====================================================================

class TestRecommendation:
    def test_valid_recommendation(self):
        rec = Recommendation(
            title="Clean surfaces",
            description="Use IPA solvent wipe before bonding",
            priority="high",
            implementation_steps=["Step 1", "Step 2"],
        )
        assert rec.priority == "high"

    def test_implementation_steps_default_empty(self):
        rec = Recommendation(
            title="x", description="y", priority="medium"
        )
        assert rec.implementation_steps == []


# =====================================================================
# FeedbackCreate — exactly one target validation
# =====================================================================

class TestFeedbackCreate:
    """Tests for the feedback schema and its model_validator."""

    def test_valid_with_analysis_id(self):
        fb = FeedbackCreate(
            analysis_id="ana-123",
            was_helpful=True,
        )
        assert fb.analysis_id == "ana-123"
        assert fb.spec_id is None

    def test_valid_with_spec_id(self):
        fb = FeedbackCreate(
            spec_id="spec-456",
            was_helpful=False,
        )
        assert fb.spec_id == "spec-456"
        assert fb.analysis_id is None

    def test_rejects_both_analysis_and_spec(self):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackCreate(
                analysis_id="ana-123",
                spec_id="spec-456",
                was_helpful=True,
            )
        assert "not both" in str(exc_info.value).lower()

    def test_rejects_neither_analysis_nor_spec(self):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackCreate(was_helpful=True)
        assert "either" in str(exc_info.value).lower()

    def test_was_helpful_required(self):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackCreate(analysis_id="ana-123")
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("was_helpful",) for e in errors)

    def test_was_helpful_true(self):
        fb = FeedbackCreate(analysis_id="a", was_helpful=True)
        assert fb.was_helpful is True

    def test_was_helpful_false(self):
        fb = FeedbackCreate(analysis_id="a", was_helpful=False)
        assert fb.was_helpful is False


# =====================================================================
# FeedbackCreate — root_cause_confirmed range
# =====================================================================

class TestFeedbackRootCauseConfirmed:
    def test_default_zero(self):
        fb = FeedbackCreate(analysis_id="a", was_helpful=True)
        assert fb.root_cause_confirmed == 0

    def test_valid_range_values(self):
        for val in range(6):
            fb = FeedbackCreate(
                analysis_id="a", was_helpful=True, root_cause_confirmed=val
            )
            assert fb.root_cause_confirmed == val

    def test_below_range_rejected(self):
        with pytest.raises(ValidationError):
            FeedbackCreate(
                analysis_id="a", was_helpful=True, root_cause_confirmed=-1
            )

    def test_above_range_rejected(self):
        with pytest.raises(ValidationError):
            FeedbackCreate(
                analysis_id="a", was_helpful=True, root_cause_confirmed=6
            )

    def test_way_above_range_rejected(self):
        with pytest.raises(ValidationError):
            FeedbackCreate(
                analysis_id="a", was_helpful=True, root_cause_confirmed=100
            )


# =====================================================================
# FeedbackCreate — outcome enum
# =====================================================================

class TestFeedbackOutcome:
    def test_valid_outcomes(self):
        for outcome in FeedbackOutcome:
            fb = FeedbackCreate(
                analysis_id="a",
                was_helpful=True,
                outcome=outcome,
            )
            assert fb.outcome == outcome

    def test_outcome_from_string(self):
        fb = FeedbackCreate(
            analysis_id="a",
            was_helpful=True,
            outcome="resolved",
        )
        assert fb.outcome == FeedbackOutcome.resolved

    def test_invalid_outcome_rejected(self):
        with pytest.raises(ValidationError):
            FeedbackCreate(
                analysis_id="a",
                was_helpful=True,
                outcome="made_it_worse",
            )

    def test_outcome_none_by_default(self):
        fb = FeedbackCreate(analysis_id="a", was_helpful=True)
        assert fb.outcome is None

    def test_all_enum_values_exist(self):
        expected = {
            "resolved", "partially_resolved", "not_resolved",
            "different_cause", "still_testing", "abandoned",
        }
        assert {e.value for e in FeedbackOutcome} == expected


# =====================================================================
# FeedbackCreate — optional fields
# =====================================================================

class TestFeedbackOptionalFields:
    def test_recommendation_implemented_default_empty(self):
        fb = FeedbackCreate(analysis_id="a", was_helpful=True)
        assert fb.recommendation_implemented == []

    def test_recommendation_implemented_list(self):
        fb = FeedbackCreate(
            analysis_id="a",
            was_helpful=True,
            recommendation_implemented=["rec-1", "rec-2"],
        )
        assert len(fb.recommendation_implemented) == 2

    def test_substrate_corrections_default_empty(self):
        fb = FeedbackCreate(analysis_id="a", was_helpful=True)
        assert fb.substrate_corrections == []

    def test_substrate_corrections_populated(self):
        fb = FeedbackCreate(
            analysis_id="a",
            was_helpful=True,
            substrate_corrections=[
                SubstrateCorrection(
                    field="substrate_a", original="aluminum", corrected="aluminium 7075"
                )
            ],
        )
        assert len(fb.substrate_corrections) == 1
        assert fb.substrate_corrections[0].corrected == "aluminium 7075"

    def test_feedback_source_default_in_app(self):
        fb = FeedbackCreate(analysis_id="a", was_helpful=True)
        assert fb.feedback_source == FeedbackSource.in_app

    def test_feedback_source_api(self):
        fb = FeedbackCreate(
            analysis_id="a",
            was_helpful=True,
            feedback_source=FeedbackSource.api,
        )
        assert fb.feedback_source == FeedbackSource.api

    def test_estimated_cost_saved_float(self):
        fb = FeedbackCreate(
            analysis_id="a",
            was_helpful=True,
            estimated_cost_saved=5000.50,
        )
        assert fb.estimated_cost_saved == 5000.50

    def test_actual_root_cause_string(self):
        fb = FeedbackCreate(
            analysis_id="a",
            was_helpful=True,
            actual_root_cause="Oil contamination from machining",
        )
        assert fb.actual_root_cause == "Oil contamination from machining"

    def test_full_feedback(self):
        fb = FeedbackCreate(
            analysis_id="a",
            was_helpful=True,
            root_cause_confirmed=2,
            outcome="resolved",
            recommendation_implemented=["rec-1"],
            actual_root_cause="Surface contamination",
            what_worked="IPA solvent wipe",
            what_didnt_work="Acetone wipe alone",
            time_to_resolution="2 days",
            estimated_cost_saved=10000.0,
            feedback_source="api",
        )
        assert fb.outcome == FeedbackOutcome.resolved


# =====================================================================
# SubstrateCorrection
# =====================================================================

class TestSubstrateCorrection:
    def test_valid_correction(self):
        sc = SubstrateCorrection(
            field="substrate_a",
            original="aluminum",
            corrected="aluminum 7075-t6",
        )
        assert sc.field == "substrate_a"

    def test_original_optional(self):
        sc = SubstrateCorrection(field="substrate_b", corrected="steel 304")
        assert sc.original is None

    def test_corrected_required(self):
        with pytest.raises(ValidationError):
            SubstrateCorrection(field="substrate_a", original="old")

    def test_field_required(self):
        with pytest.raises(ValidationError):
            SubstrateCorrection(corrected="new")


# =====================================================================
# FeedbackSource enum
# =====================================================================

class TestFeedbackSource:
    def test_all_sources(self):
        expected = {"in_app", "email", "api"}
        assert {s.value for s in FeedbackSource} == expected


# =====================================================================
# FailureAnalysisResponse
# =====================================================================

class TestFailureAnalysisResponse:
    def test_minimal_response(self):
        resp = FailureAnalysisResponse(
            id="test-id",
            user_id="user-1",
            material_category="epoxy",
            failure_mode="delamination",
        )
        assert resp.status == "pending"
        assert resp.root_causes == []
        assert resp.contributing_factors == []
        assert resp.recommendations == []

    def test_full_response(self):
        resp = FailureAnalysisResponse(
            id="test-id",
            user_id="user-1",
            material_category="epoxy",
            failure_mode="delamination",
            confidence_score=0.85,
            root_causes=[
                RootCause(
                    cause="contamination",
                    category="surface_preparation",
                    confidence=0.85,
                    explanation="Oil residue",
                )
            ],
            status="completed",
        )
        assert resp.status == "completed"
        assert len(resp.root_causes) == 1
