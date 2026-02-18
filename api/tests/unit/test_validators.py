"""Unit tests for Pydantic schemas (analyze + feedback + specify)."""

import pytest
from pydantic import ValidationError

from schemas.analyze import (
    FailureAnalysisCreate,
    FailureAnalysisResponse,
    RootCause,
    Recommendation,
)
from schemas.specify import (
    SpecRequestCreate,
    BondRequirements,
    EnvironmentalConditions,
    CureConstraints,
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


# =====================================================================
# Sprint 4: Form Field Expansion — Schema backward compatibility tests
# =====================================================================

class TestFailureAnalysisFieldExpansion:
    """Sprint 4: New multi-select fields + backward compat."""

    def test_surface_prep_as_string_coerced_to_list(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="delamination",
            surface_preparation="grit blast + solvent wipe",
        )
        assert obj.surface_preparation == ["grit blast + solvent wipe"]

    def test_surface_prep_as_list_accepted(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="delamination",
            surface_preparation=["prep:solvent_wipe", "prep:abrasion"],
        )
        assert obj.surface_preparation == ["prep:solvent_wipe", "prep:abrasion"]

    def test_legacy_surface_prep_field_coerced(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="delamination",
            surface_prep="IPA wipe",
        )
        assert obj.surface_preparation == ["IPA wipe"]

    def test_chemical_exposure_str_coerced_to_list(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            chemical_exposure="MEK",
        )
        assert obj.chemical_exposure == ["MEK"]

    def test_chemical_exposure_list_accepted(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            chemical_exposure=["env:chemical", "env:salt_spray"],
        )
        assert obj.chemical_exposure == ["env:chemical", "env:salt_spray"]

    def test_new_chemical_detail_fields(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            chemical_exposure_detail=["chem:brake_fluid", "chem:mek"],
            chemical_exposure_other="proprietary solvent X",
        )
        assert len(obj.chemical_exposure_detail) == 2
        assert obj.chemical_exposure_other == "proprietary solvent X"

    def test_sterilization_methods(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            sterilization_methods=["sterilization:autoclave", "sterilization:eto"],
        )
        assert len(obj.sterilization_methods) == 2

    def test_surface_prep_detail(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            surface_prep_detail="IPA wipe followed by 5 min air dry",
        )
        assert obj.surface_prep_detail == "IPA wipe followed by 5 min air dry"

    def test_environment_list(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="cracking",
            environment=["env:high_humidity", "env:thermal_cycling"],
        )
        assert len(obj.environment) == 2

    def test_unknown_visual_failure_mode(self):
        obj = FailureAnalysisCreate(
            material_category="epoxy",
            failure_mode="unknown_visual",
        )
        assert obj.failure_mode == "unknown_visual"


class TestSpecRequestFieldExpansion:
    """Sprint 4: Spec engine schema expansion + backward compat."""

    def test_minimal_valid(self):
        obj = SpecRequestCreate(
            material_category="adhesive",
            substrate_a="aluminum",
            substrate_b="steel",
        )
        assert obj.substrate_a == "aluminum"

    def test_bond_requirements_load_types(self):
        obj = SpecRequestCreate(
            material_category="adhesive",
            substrate_a="aluminum",
            substrate_b="steel",
            bond_requirements=BondRequirements(
                load_types=["load:shear", "load:peel", "load:vibration_fatigue"],
            ),
        )
        assert len(obj.bond_requirements.load_types) == 3

    def test_bond_requirements_legacy_load_type_coerced(self):
        obj = SpecRequestCreate(
            material_category="adhesive",
            substrate_a="aluminum",
            substrate_b="steel",
            bond_requirements=BondRequirements(
                load_type="structural",
            ),
        )
        assert obj.bond_requirements.load_types == ["structural"]

    def test_bond_requirements_gap_type(self):
        obj = SpecRequestCreate(
            material_category="adhesive",
            substrate_a="aluminum",
            substrate_b="steel",
            bond_requirements=BondRequirements(
                gap_fill="2.5mm",
                gap_type="gap_type:structural",
            ),
        )
        assert obj.bond_requirements.gap_type == "gap_type:structural"

    def test_env_conditions_expanded(self):
        obj = SpecRequestCreate(
            material_category="adhesive",
            substrate_a="aluminum",
            substrate_b="steel",
            environment=EnvironmentalConditions(
                conditions=["env:high_humidity", "env:salt_spray", "env:chemical"],
                chemical_exposure_detail=["chem:brake_fluid", "chem:mek"],
                chemical_exposure_other="custom solvent",
                sterilization_methods=["sterilization:autoclave"],
            ),
        )
        assert len(obj.environment.conditions) == 3
        assert len(obj.environment.chemical_exposure_detail) == 2
        assert obj.environment.chemical_exposure_other == "custom solvent"
        assert len(obj.environment.sterilization_methods) == 1

    def test_env_chemical_exposure_str_coerced(self):
        env = EnvironmentalConditions(chemical_exposure="jet fuel")
        assert env.chemical_exposure == ["jet fuel"]

    def test_cure_constraints_expanded(self):
        obj = SpecRequestCreate(
            material_category="adhesive",
            substrate_a="aluminum",
            substrate_b="steel",
            cure_constraints=CureConstraints(
                process_capabilities=[
                    "cure_constraint:oven_available",
                    "cure_constraint:primer_ok",
                    "cure_constraint:two_part_ok",
                ],
                max_cure_temp_c=80,
                uv_shadow_areas=True,
            ),
        )
        assert len(obj.cure_constraints.process_capabilities) == 3
        assert obj.cure_constraints.max_cure_temp_c == 80
        assert obj.cure_constraints.uv_shadow_areas is True

    def test_cure_constraints_legacy_coerced(self):
        cure = CureConstraints(cure_constraint="room_temp")
        assert cure.process_capabilities == ["room_temp"]

    def test_product_considered_field(self):
        obj = SpecRequestCreate(
            material_category="adhesive",
            substrate_a="aluminum",
            substrate_b="steel",
            product_considered="Loctite 480",
        )
        assert obj.product_considered == "Loctite 480"


# =====================================================================
# Sprint 4: Prompt builder tests
# =====================================================================

class TestSpecEnginePromptBuilder:
    """Sprint 4: Verify expanded prompt builder output."""

    def test_load_types_in_prompt(self):
        from prompts.spec_engine import build_user_prompt
        data = {
            "material_category": "adhesive",
            "substrate_a": "aluminum",
            "substrate_b": "steel",
            "bond_requirements": {
                "load_types": ["load:shear", "load:peel", "load:vibration_fatigue"],
            },
        }
        prompt = build_user_prompt(data)
        assert "Shear" in prompt
        assert "Peel" in prompt
        assert "Vibration / Fatigue" in prompt

    def test_gap_type_combined_in_prompt(self):
        from prompts.spec_engine import build_user_prompt
        data = {
            "material_category": "adhesive",
            "substrate_a": "aluminum",
            "substrate_b": "steel",
            "bond_requirements": {
                "gap_fill": "2.5mm",
                "gap_type": "gap_type:structural",
            },
        }
        prompt = build_user_prompt(data)
        assert "2.5mm" in prompt
        assert "Structural gap fill" in prompt

    def test_cure_constraints_in_prompt(self):
        from prompts.spec_engine import build_user_prompt
        data = {
            "material_category": "adhesive",
            "substrate_a": "aluminum",
            "substrate_b": "steel",
            "cure_constraints": {
                "process_capabilities": [
                    "cure_constraint:oven_available",
                    "cure_constraint:two_part_ok",
                ],
                "max_cure_temp_c": 80,
                "uv_shadow_areas": True,
            },
        }
        prompt = build_user_prompt(data)
        assert "Oven / heat available" in prompt
        assert "Two-part mixing OK" in prompt
        assert "80°C" in prompt
        assert "shadow" in prompt.lower()

    def test_chemical_detail_in_prompt(self):
        from prompts.spec_engine import build_user_prompt
        data = {
            "material_category": "adhesive",
            "substrate_a": "aluminum",
            "substrate_b": "steel",
            "environment": {
                "chemical_exposure_detail": ["chem:brake_fluid", "chem:mek"],
                "chemical_exposure_other": "proprietary solvent",
            },
        }
        prompt = build_user_prompt(data)
        assert "Brake fluid" in prompt
        assert "MEK" in prompt
        assert "proprietary solvent" in prompt

    def test_sterilization_in_prompt(self):
        from prompts.spec_engine import build_user_prompt
        data = {
            "material_category": "adhesive",
            "substrate_a": "aluminum",
            "substrate_b": "steel",
            "environment": {
                "sterilization_methods": ["sterilization:autoclave", "sterilization:eto"],
            },
        }
        prompt = build_user_prompt(data)
        assert "Autoclave" in prompt
        assert "EtO" in prompt

    def test_env_conditions_in_prompt(self):
        from prompts.spec_engine import build_user_prompt
        data = {
            "material_category": "adhesive",
            "substrate_a": "aluminum",
            "substrate_b": "steel",
            "environment": {
                "conditions": ["env:high_humidity", "env:salt_spray"],
            },
        }
        prompt = build_user_prompt(data)
        assert "High humidity" in prompt
        assert "Salt spray" in prompt


class TestFailureAnalysisPromptBuilder:
    """Sprint 4: Verify expanded failure analysis prompt builder output."""

    def test_surface_prep_list_in_prompt(self):
        from prompts.failure_analysis import build_user_prompt
        data = {
            "material_category": "epoxy",
            "failure_mode": "delamination",
            "surface_preparation": ["prep:solvent_wipe", "prep:abrasion"],
        }
        prompt = build_user_prompt(data)
        assert "Solvent wipe" in prompt
        assert "Abrasion" in prompt

    def test_surface_prep_detail_in_prompt(self):
        from prompts.failure_analysis import build_user_prompt
        data = {
            "material_category": "epoxy",
            "failure_mode": "delamination",
            "surface_prep_detail": "IPA wipe followed by 80-grit scuff",
        }
        prompt = build_user_prompt(data)
        assert "IPA wipe followed by 80-grit scuff" in prompt

    def test_env_tags_in_prompt(self):
        from prompts.failure_analysis import build_user_prompt
        data = {
            "material_category": "epoxy",
            "failure_mode": "cracking",
            "chemical_exposure": ["env:high_humidity", "env:thermal_cycling"],
        }
        prompt = build_user_prompt(data)
        assert "High humidity" in prompt
        assert "Thermal cycling" in prompt

    def test_chemical_detail_in_prompt(self):
        from prompts.failure_analysis import build_user_prompt
        data = {
            "material_category": "epoxy",
            "failure_mode": "cracking",
            "chemical_exposure_detail": ["chem:brake_fluid", "chem:mek"],
            "chemical_exposure_other": "custom degreaser",
        }
        prompt = build_user_prompt(data)
        assert "Brake fluid" in prompt
        assert "MEK" in prompt
        assert "custom degreaser" in prompt

    def test_sterilization_in_prompt(self):
        from prompts.failure_analysis import build_user_prompt
        data = {
            "material_category": "epoxy",
            "failure_mode": "cracking",
            "sterilization_methods": ["sterilization:autoclave", "sterilization:gamma"],
        }
        prompt = build_user_prompt(data)
        assert "Autoclave" in prompt
        assert "Gamma" in prompt

    def test_unknown_visual_failure_mode_in_prompt(self):
        from prompts.failure_analysis import build_user_prompt
        data = {
            "material_category": "epoxy",
            "failure_mode": "unknown_visual",
        }
        prompt = build_user_prompt(data)
        assert "visual evidence" in prompt.lower() or "Unknown" in prompt
