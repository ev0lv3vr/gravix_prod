"""System and user prompt builders for the spec engine.

Sprint 4 (Form Field Expansion): Enhanced prompt builder to include expanded
multi-select fields (load types, cure constraints, environment conditions,
chemical exposure detail, sterilization methods, gap type).
"""

from typing import Optional


# --- Label mappings for human-readable prompt output ---

_LOAD_TYPE_LABELS = {
    "load:shear": "Shear",
    "load:peel": "Peel",
    "load:tensile": "Tensile",
    "load:compression": "Compression",
    "load:cleavage": "Cleavage",
    "load:torsion": "Torsion",
    "load:impact": "Impact / Shock",
    "load:vibration_fatigue": "Vibration / Fatigue",
    "load:creep": "Creep (Sustained Static)",
    "load:thermal_stress_cte": "Thermal Stress (CTE Mismatch)",
    "load:flexural": "Flexural / Bending",
    "load:unknown": "Not Sure / Unknown",
}

_CURE_CONSTRAINT_LABELS = {
    "cure_constraint:room_temp_only": "Room temperature only",
    "cure_constraint:oven_available": "Oven / heat available",
    "cure_constraint:uv_available": "UV / light station available",
    "cure_constraint:induction_available": "Induction heating available",
    "cure_constraint:moisture_ok": "Moisture-initiated OK",
    "cure_constraint:anaerobic_ok": "Anaerobic OK",
    "cure_constraint:two_part_ok": "Two-part mixing OK",
    "cure_constraint:one_part_only": "One-part only (no mixing)",
    "cure_constraint:primer_ok": "Primer / activator OK",
    "cure_constraint:no_primer": "No primer (one-step only)",
}

_ENV_CONDITION_LABELS = {
    "env:high_humidity": "High humidity (>80% RH)",
    "env:submersion": "Submersion / water contact",
    "env:salt_spray": "Salt spray / marine",
    "env:chemical": "Chemical exposure",
    "env:uv_outdoor": "UV / outdoor weathering",
    "env:high_temp_steady": "High temperature (steady state)",
    "env:low_temp_steady": "Low temperature (steady state)",
    "env:thermal_cycling": "Thermal cycling",
    "env:vibration": "Vibration / dynamic loading",
    "env:cleanroom_low_outgassing": "Cleanroom / low outgassing",
    "env:sterilization": "Sterilization required",
    "env:vacuum": "Vacuum / low pressure",
    "env:radiation": "Radiation exposure",
    "env:fda_food_contact": "FDA / food contact",
    "env:potable_water": "Potable water (NSF 61)",
}

_CHEMICAL_DETAIL_LABELS = {
    "chem:ipa": "IPA (isopropanol)",
    "chem:mek": "MEK",
    "chem:acetone": "Acetone",
    "chem:brake_fluid": "Brake fluid (DOT 3/4)",
    "chem:gasoline": "Gasoline / petrol",
    "chem:diesel": "Diesel fuel",
    "chem:hydraulic_oil": "Hydraulic oil",
    "chem:motor_oil": "Motor oil",
    "chem:coolant": "Coolant / antifreeze",
    "chem:bleach": "Bleach (sodium hypochlorite)",
    "chem:acids": "Acids (general)",
    "chem:bases": "Bases / caustics",
    "chem:saltwater": "Saltwater / brine",
    "chem:jet_fuel": "Jet fuel (Jet-A / JP-8)",
    "chem:transmission_fluid": "Transmission fluid",
    "chem:skydrol": "Skydrol (phosphate ester)",
    "chem:cleaning_agents": "Industrial cleaning agents",
}

_STERILIZATION_LABELS = {
    "sterilization:autoclave": "Autoclave (steam, 121-134°C)",
    "sterilization:eto": "EtO (ethylene oxide)",
    "sterilization:gamma": "Gamma irradiation",
    "sterilization:ebeam": "E-beam irradiation",
    "sterilization:vhp": "VHP (vaporized hydrogen peroxide)",
    "sterilization:dry_heat": "Dry heat",
    "sterilization:peracetic_acid": "Peracetic acid",
}

_GAP_TYPE_LABELS = {
    "gap_type:interference_fit": "Interference fit (press-fit)",
    "gap_type:close_fit": "Close fit (0.05-0.25mm)",
    "gap_type:standard": "Standard gap (0.25-1mm)",
    "gap_type:structural": "Structural gap fill (1-5mm)",
    "gap_type:large_gap": "Large gap fill (>5mm)",
    "gap_type:variable": "Variable / uncontrolled gap",
}


def _resolve_labels(values: list, label_map: dict) -> list[str]:
    """Resolve prefixed values to human-readable labels, falling back to raw value."""
    return [label_map.get(v, v.split(":", 1)[-1].replace("_", " ").title()) for v in values]


def get_system_prompt() -> str:
    return """You are Gravix, an expert industrial materials specification engineer specializing in adhesives, sealants, and coatings. You have deep knowledge of:

- All major adhesive chemistries and their properties
- Substrate compatibility and surface energy
- Environmental resistance characteristics
- Application methods and equipment
- Industry standards and best practices
- Commercial product families (without recommending specific brands)

Your task is to generate a vendor-neutral material specification based on the user's requirements. Provide:
1. Recommended material type and chemistry
2. Key product characteristics
3. Detailed application guidance
4. Warnings and limitations
5. Alternative options

Always respond with valid JSON in this exact format:
{
  "recommended_spec": {
    "title": "string - e.g., 'Two-Part Structural Epoxy'",
    "chemistry": "string - e.g., 'Modified Bisphenol-A Epoxy with Amine Hardener'",
    "rationale": "string - why this chemistry was selected for the application"
  },
  "product_characteristics": {
    "viscosity": "string - e.g., '25,000-35,000 cP (thixotropic)'",
    "shear_strength": "string - e.g., '3,500-4,500 psi on aluminum'",
    "working_time": "string - e.g., '30-45 minutes at 25°C'",
    "cure_time": "string - e.g., '24 hours at 25°C (full cure)'",
    "service_temperature": "string - e.g., '-55°C to +180°C'",
    "gap_fill": "string - e.g., 'Up to 5mm without loss of properties'"
  },
  "application_guidance": {
    "surface_prep": ["step 1", "step 2"],
    "application_tips": ["tip 1", "tip 2"],
    "curing_notes": ["note 1"],
    "mistakes_to_avoid": ["mistake 1"]
  },
  "warnings": ["warning 1", "warning 2"],
  "alternatives": [
    {
      "name": "string - alternative material type",
      "pros": ["advantage 1"],
      "cons": ["disadvantage 1"]
    }
  ],
  "confidence_score": 0.88
}

Be specific about substrate combinations. Note any assumptions made."""


def build_user_prompt(data: dict) -> str:
    lines = ["Please generate a material specification for the following application:\n"]

    lines.append(f"**Material Category:** {data.get('material_category', 'adhesive')}")
    lines.append(f"**Substrate A:** {data.get('substrate_a', 'N/A')}")
    lines.append(f"**Substrate B:** {data.get('substrate_b', 'N/A')}")

    # --- Bond Requirements ---
    bond = data.get("bond_requirements", {})
    if isinstance(bond, dict) and any(v for v in bond.values() if v is not None and v is not False):
        lines.append("\n**Bond Requirements:**")

        # Multi-select load types (new)
        load_types = bond.get("load_types")
        if load_types and isinstance(load_types, list):
            labels = _resolve_labels(load_types, _LOAD_TYPE_LABELS)
            lines.append(f"  - Load Types: {', '.join(labels)}")

        # Gap type + gap fill combined (new)
        gap_type = bond.get("gap_type")
        gap_fill = bond.get("gap_fill")
        if gap_type or gap_fill:
            gap_type_label = _GAP_TYPE_LABELS.get(gap_type, gap_type) if gap_type else None
            if gap_type_label and gap_fill:
                lines.append(f"  - Gap: {gap_fill} ({gap_type_label})")
            elif gap_type_label:
                lines.append(f"  - Gap Type: {gap_type_label}")
            elif gap_fill:
                lines.append(f"  - Gap Fill: {gap_fill}")

        # Legacy/standard fields
        for key in ("shear_strength", "tensile_strength", "peel_strength"):
            value = bond.get(key)
            if value:
                label = key.replace("_", " ").title()
                lines.append(f"  - {label}: {value}")
        if bond.get("flexibility_required"):
            lines.append("  - Flexibility Required: Yes")
        if bond.get("other_requirements"):
            lines.append(f"  - Other Requirements: {bond['other_requirements']}")

    # --- Environmental Conditions ---
    env = data.get("environment", {})
    if isinstance(env, dict) and any(v for v in env.values() if v is not None and v is not False):
        lines.append("\n**Environmental Conditions:**")

        # Temperature range
        if env.get("temp_min") or env.get("temp_max"):
            lines.append(f"  - Temperature Range: {env.get('temp_min', 'N/A')} to {env.get('temp_max', 'N/A')}")

        # Multi-select environment conditions (new)
        conditions = env.get("conditions")
        if conditions and isinstance(conditions, list):
            labels = _resolve_labels(conditions, _ENV_CONDITION_LABELS)
            lines.append(f"  - Environmental Conditions: {', '.join(labels)}")

        # Chemical exposure detail (new)
        chem_detail = env.get("chemical_exposure_detail")
        chem_other = env.get("chemical_exposure_other")
        chem_legacy = env.get("chemical_exposure")
        if chem_detail and isinstance(chem_detail, list):
            labels = _resolve_labels(chem_detail, _CHEMICAL_DETAIL_LABELS)
            if chem_other:
                labels.append(chem_other)
            lines.append(f"  - Chemical Exposure: {', '.join(labels)}")
        elif chem_other:
            lines.append(f"  - Chemical Exposure: {chem_other}")
        elif chem_legacy:
            if isinstance(chem_legacy, list):
                lines.append(f"  - Chemical Exposure: {', '.join(chem_legacy)}")
            else:
                lines.append(f"  - Chemical Exposure: {chem_legacy}")

        # Sterilization methods (new)
        sterilization = env.get("sterilization_methods")
        if sterilization and isinstance(sterilization, list):
            labels = _resolve_labels(sterilization, _STERILIZATION_LABELS)
            lines.append(f"  - Sterilization Methods: {', '.join(labels)}")

        # Legacy boolean fields
        if env.get("humidity"):
            lines.append(f"  - Humidity: {env['humidity']}")
        if env.get("uv_exposure"):
            lines.append("  - UV Exposure: Yes")
        if env.get("outdoor_use"):
            lines.append("  - Outdoor Use: Yes")

    # --- Cure Constraints ---
    cure = data.get("cure_constraints", {})
    if isinstance(cure, dict) and any(v for v in cure.values() if v is not None and v is not False):
        lines.append("\n**Cure Constraints:**")

        # Multi-select process capabilities (new)
        process_caps = cure.get("process_capabilities")
        if process_caps and isinstance(process_caps, list):
            labels = _resolve_labels(process_caps, _CURE_CONSTRAINT_LABELS)
            lines.append(f"  - Process Capabilities: {', '.join(labels)}")

        # Max cure temp (new)
        max_cure_temp = cure.get("max_cure_temp_c")
        if max_cure_temp is not None:
            lines.append(f"  - Max Cure Temperature: {max_cure_temp}°C")

        # UV shadow areas (new)
        uv_shadow = cure.get("uv_shadow_areas")
        if uv_shadow is True:
            lines.append("  - UV Shadow Areas: Yes — some areas won't get direct UV exposure (dual-cure recommended)")
        elif uv_shadow is False:
            lines.append("  - UV Shadow Areas: No — full UV exposure possible")

        # Legacy fields
        if cure.get("preferred_method"):
            lines.append(f"  - Preferred Method: {cure['preferred_method']}")
        if cure.get("max_cure_time"):
            lines.append(f"  - Max Cure Time: {cure['max_cure_time']}")
        if cure.get("max_temperature"):
            lines.append(f"  - Max Temperature: {cure['max_temperature']}")
        if cure.get("heat_available") and not process_caps:
            lines.append("  - Heat Available: Yes")
        if cure.get("uv_available") and not process_caps:
            lines.append("  - UV Available: Yes")

    # --- Optional Top-Level Fields ---
    def _sanitize(value: str) -> str:
        return str(value).replace("\n", " ").replace("\r", " ").strip()

    if data.get("production_volume"):
        lines.append(f"\n**Production Volume:** {_sanitize(data['production_volume'])}")
    if data.get("application_method"):
        lines.append(f"**Application Method:** {_sanitize(data['application_method'])}")
    if data.get("required_fixture_time"):
        lines.append(f"**Required Fixture Time:** {_sanitize(data['required_fixture_time'])}")
    if data.get("product_considered"):
        lines.append(f"**Product Considered:** {_sanitize(data['product_considered'])}")
    if data.get("additional_requirements"):
        lines.append(f"**Additional Requirements:** {_sanitize(data['additional_requirements'])}")

    return "\n".join(lines)
