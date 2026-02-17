"""System and user prompt builders for the spec engine."""


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

    # Bond requirements
    bond = data.get("bond_requirements", {})
    if isinstance(bond, dict) and any(bond.values()):
        lines.append("\n**Bond Requirements:**")
        for key, value in bond.items():
            if value and value is not False:
                label = key.replace("_", " ").title()
                lines.append(f"  - {label}: {value}")

    # Environmental conditions
    env = data.get("environment", {})
    if isinstance(env, dict) and any(env.values()):
        lines.append("\n**Environmental Conditions:**")
        for key, value in env.items():
            if value and value is not False:
                label = key.replace("_", " ").title()
                lines.append(f"  - {label}: {value}")

    # Cure constraints
    cure = data.get("cure_constraints", {})
    if isinstance(cure, dict) and any(cure.values()):
        lines.append("\n**Cure Constraints:**")
        for key, value in cure.items():
            if value and value is not False:
                label = key.replace("_", " ").title()
                lines.append(f"  - {label}: {value}")

    # Optional fields – sanitize user-controlled values before prompt insertion
    def _sanitize(value: str) -> str:
        return str(value).replace("\n", " ").replace("\r", " ").strip()

    if data.get("production_volume"):
        lines.append(f"\n**Production Volume:** {_sanitize(data['production_volume'])}")
    if data.get("application_method"):
        lines.append(f"**Application Method:** {_sanitize(data['application_method'])}")
    if data.get("required_fixture_time"):
        lines.append(f"**Required Fixture Time:** {_sanitize(data['required_fixture_time'])}")
    if data.get("additional_requirements"):
        lines.append(f"**Additional Requirements:** {_sanitize(data['additional_requirements'])}")

    return "\n".join(lines)
