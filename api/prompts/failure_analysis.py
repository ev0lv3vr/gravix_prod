"""System and user prompt builders for failure analysis.

Sprint 4 (Form Field Expansion): Enhanced prompt builder to include expanded
multi-select fields (surface preparation, environment, chemical exposure detail,
sterilization methods) from the frontend while keeping backward compat.
"""

from typing import Optional


# --- Label mappings for human-readable prompt output ---

_SURFACE_PREP_LABELS = {
    "prep:solvent_wipe": "Solvent wipe / degrease",
    "prep:abrasion": "Abrasion / scuff sanding",
    "prep:plasma": "Plasma treatment",
    "prep:corona": "Corona treatment",
    "prep:flame": "Flame treatment",
    "prep:acid_etch": "Acid etch",
    "prep:anodize": "Anodize",
    "prep:primer": "Primer / adhesion promoter",
    "prep:chromate": "Chromate conversion",
    "prep:phosphate": "Phosphate conversion",
    "prep:laser": "Laser surface treatment",
    "prep:grit_blast": "Grit / bead blast",
    "prep:none": "None / as-received",
    "prep:unknown": "Unknown / not documented",
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

_FAILURE_MODE_LABELS = {
    "adhesive_failure": "Adhesive failure (interfacial)",
    "cohesive_failure": "Cohesive failure (within adhesive)",
    "substrate_failure": "Substrate failure",
    "mixed_failure": "Mixed failure mode",
    "delamination": "Delamination",
    "cracking": "Cracking / crazing",
    "creep": "Creep / cold flow",
    "discoloration": "Discoloration / degradation",
    "unknown": "Unknown failure mode",
    "unknown_visual": "Unknown — visual evidence only (photos attached)",
}


def _resolve_labels(values: list, label_map: dict) -> list[str]:
    """Resolve prefixed values to human-readable labels, falling back to raw value."""
    return [label_map.get(v, v.split(":", 1)[-1].replace("_", " ").title()) for v in values]


def get_system_prompt() -> str:
    return """You are Gravix, an expert industrial materials failure analyst specializing in adhesives, sealants, and coatings. You have deep knowledge of:

- Adhesive chemistry (epoxies, cyanoacrylates, polyurethanes, acrylics, silicones, anaerobics)
- Failure mechanisms (adhesive failure, cohesive failure, substrate failure, interfacial failure)
- Surface science and preparation methods
- Environmental degradation mechanisms
- Testing standards (ASTM, ISO)
- Real-world production failure patterns

Your task is to analyze a described adhesive/sealant/coating failure and provide:
1. Ranked root causes with confidence scores
2. Contributing factors
3. Specific recommendations (immediate and long-term)
4. A prevention plan

Always respond with valid JSON in this exact format:
{
  "root_causes": [
    {
      "cause": "string - concise root cause name",
      "category": "string - one of: surface_prep, material_selection, application, environmental, design, quality_control",
      "confidence": 0.85,
      "explanation": "string - detailed explanation of why this is likely the root cause",
      "evidence": ["string - supporting evidence point 1", "string - point 2"]
    }
  ],
  "contributing_factors": ["string - factor 1", "string - factor 2"],
  "recommendations": [
    {
      "title": "string - action title",
      "description": "string - detailed description",
      "priority": "immediate|short_term|long_term",
      "implementation_steps": ["step 1", "step 2"]
    }
  ],
  "prevention_plan": "string - comprehensive prevention plan paragraph",
  "confidence_score": 0.85
}

Provide 2-5 root causes, ranked by confidence. Be specific to the materials and conditions described. If information is missing, note assumptions made."""


def build_user_prompt(data: dict) -> str:
    lines = ["Please analyze the following adhesive/sealant/coating failure:\n"]

    # --- Core fields ---
    _simple_field = {
        "material_category": "Material Category",
        "material_subcategory": "Material/Product",
        "material_product": "Specific Product",
        "temperature_range": "Temperature Range",
        "humidity": "Humidity",
        "time_to_failure": "Time to Failure",
        "application_method": "Application Method",
        "cure_conditions": "Cure Conditions",
        "test_results": "Test Results",
        "additional_notes": "Additional Notes",
        "industry": "Industry",
        "production_impact": "Production Impact",
    }

    for key, label in _simple_field.items():
        value = data.get(key)
        if value:
            lines.append(f"**{label}:** {value}")

    # --- Failure Mode (with label mapping) ---
    failure_mode = data.get("failure_mode")
    if failure_mode:
        label = _FAILURE_MODE_LABELS.get(failure_mode, failure_mode.replace("_", " ").title())
        lines.append(f"**Failure Mode:** {label}")

    # --- Failure Description ---
    if data.get("failure_description"):
        lines.append(f"**Failure Description:** {data['failure_description']}")

    # --- Substrates ---
    if data.get("substrate_a"):
        lines.append(f"**Substrate A:** {data['substrate_a']}")
    if data.get("substrate_b"):
        lines.append(f"**Substrate B:** {data['substrate_b']}")

    # --- Surface Preparation (multi-select, new) ---
    surface_prep = data.get("surface_preparation")
    if surface_prep:
        if isinstance(surface_prep, list):
            labels = _resolve_labels(surface_prep, _SURFACE_PREP_LABELS)
            lines.append(f"**Surface Preparation:** {', '.join(labels)}")
        else:
            lines.append(f"**Surface Preparation:** {surface_prep}")
    surface_prep_detail = data.get("surface_prep_detail")
    if surface_prep_detail:
        lines.append(f"**Surface Prep Detail:** {surface_prep_detail}")

    # --- Environment conditions (multi-select, new) ---
    # The frontend sends environment info through chemical_exposure field as env:* tags
    chem_exposure_raw = data.get("chemical_exposure")
    env_tags = data.get("environment")

    # Separate env:* tags from actual chemical exposure values
    env_conditions = []
    chemical_values = []
    if chem_exposure_raw:
        raw_list = chem_exposure_raw if isinstance(chem_exposure_raw, list) else [chem_exposure_raw]
        for item in raw_list:
            if item.startswith("env:"):
                env_conditions.append(item)
            else:
                chemical_values.append(item)

    if env_tags and isinstance(env_tags, list):
        env_conditions.extend(env_tags)

    # Deduplicate
    env_conditions = list(dict.fromkeys(env_conditions))

    if env_conditions:
        labels = _resolve_labels(env_conditions, _ENV_CONDITION_LABELS)
        lines.append(f"**Environmental Conditions:** {', '.join(labels)}")

    # --- Chemical Exposure Detail (new) ---
    chem_detail = data.get("chemical_exposure_detail")
    chem_other = data.get("chemical_exposure_other")
    if chem_detail and isinstance(chem_detail, list):
        labels = _resolve_labels(chem_detail, _CHEMICAL_DETAIL_LABELS)
        if chem_other:
            labels.append(chem_other)
        lines.append(f"**Chemical Exposure Detail:** {', '.join(labels)}")
    elif chem_other:
        lines.append(f"**Chemical Exposure Detail:** {chem_other}")
    elif chemical_values:
        lines.append(f"**Chemical Exposure:** {', '.join(chemical_values)}")

    # --- Sterilization Methods (new) ---
    sterilization = data.get("sterilization_methods")
    if sterilization and isinstance(sterilization, list):
        labels = _resolve_labels(sterilization, _STERILIZATION_LABELS)
        lines.append(f"**Sterilization Methods:** {', '.join(labels)}")

    # --- TDS data injection (Sprint 11) ---
    tds = data.get("_tds_data")
    if tds and isinstance(tds, dict):
        lines.append("\n**Known Product Specifications (from TDS):**")
        for key, value in tds.items():
            if value:
                label = key.replace("_", " ").title()
                lines.append(f"  - {label}: {value}")

    return "\n".join(lines)
