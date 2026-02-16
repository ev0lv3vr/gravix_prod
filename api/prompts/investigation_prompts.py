"""AI prompt templates for 8D investigation features.

Sprint 8: Four new prompt builders for investigation-specific AI features.
"""


def get_five_why_system_prompt() -> str:
    """System prompt for 5-Why chain generation (Prompt 1)."""
    return """You are an expert root cause analyst trained in the 5-Why methodology. Your task is to generate a structured 5-Why chain that traces a root cause back to its systemic origin.

Rules:
- Each "Why" must ask about the cause identified in the previous answer
- Each answer must be specific and based on the evidence provided
- The 5th Why must reach a systemic root cause (process gap, training gap, design gap, control gap)
- Avoid circular reasoning or vague answers like "human error" or "lack of attention"
- Each level must include supporting evidence from the failure description

Respond with valid JSON in this exact format:
{
  "five_why_chain": [
    {
      "level": 1,
      "question": "Why did X happen?",
      "answer": "Because Y (specific reason)",
      "evidence": "Supporting detail from the failure description or context"
    },
    {
      "level": 2,
      "question": "Why did Y happen?",
      "answer": "Because Z",
      "evidence": "..."
    },
    ...
  ],
  "systemic_root_cause": "The ultimate systemic cause reached at level 5",
  "recommended_systemic_fix": "High-level recommendation to address the systemic cause"
}"""


def build_five_why_user_prompt(
    root_cause: str,
    failure_description: str,
    substrate_a: str,
    substrate_b: str,
    additional_context: dict = None,
) -> str:
    """Build user prompt for 5-Why chain generation."""
    lines = [
        "Generate a 5-Why chain for the following failure:\n",
        f"**Top Root Cause:** {root_cause}",
        f"**Failure Description:** {failure_description}",
        f"**Substrate A:** {substrate_a}",
        f"**Substrate B:** {substrate_b}",
    ]
    
    if additional_context:
        lines.append("\n**Additional Context:**")
        for key, value in additional_context.items():
            if value:
                label = key.replace("_", " ").title()
                lines.append(f"  - {label}: {value}")
    
    lines.append("\nTrace this root cause back through 5 levels to reach the systemic origin.")
    return "\n".join(lines)


def get_8d_narrative_system_prompt() -> str:
    """System prompt for 8D narrative generation (Prompt 2)."""
    return """You are a quality documentation specialist writing audit-ready 8D corrective action reports for automotive and aerospace industries. Your writing must:

- Use third-person passive voice ("The team determined..." not "We determined...")
- Use formal technical language appropriate for OEM auditors
- Cite specific data points, confidence scores, and empirical evidence
- Structure content according to standard 8D discipline sections
- Include quantitative metrics where available
- Reference knowledge base data when it supports conclusions
- Be concise but comprehensive

Respond with valid JSON in this exact format:
{
  "d1_team": "Formal narrative describing team formation, roles, and expertise",
  "d2_problem": "Formal problem statement using 5W2H structure",
  "d3_containment": "Narrative describing immediate containment actions taken",
  "d4_root_cause": "Formal root cause analysis narrative citing confidence scores and evidence",
  "d5_corrective_actions": "Narrative describing permanent corrective actions selected",
  "d6_verification": "Verification plan and results narrative",
  "d7_prevention": "Preventive measures and systemic improvements narrative",
  "d8_closure": "Closure statement, lessons learned, and team recognition"
}"""


def build_8d_narrative_user_prompt(investigation_data: dict) -> str:
    """Build user prompt for 8D narrative generation.
    
    Args:
        investigation_data: Complete investigation record with D1-D7 fields,
                          analysis results, action items, etc.
    """
    lines = [
        "Generate formal 8D narrative prose for the following investigation:\n",
        f"**Investigation Number:** {investigation_data.get('investigation_number')}",
        f"**Title:** {investigation_data.get('title')}",
        f"**Customer:** {investigation_data.get('customer_oem', 'N/A')}",
        f"**Severity:** {investigation_data.get('severity')}",
    ]
    
    # D1 - Team
    lines.append("\n**D1 - Team:**")
    lines.append(f"  - Team Lead: {investigation_data.get('team_lead_user_id', 'N/A')}")
    lines.append(f"  - Champion: {investigation_data.get('champion_user_id', 'N/A')}")
    if investigation_data.get('team_members'):
        lines.append(f"  - Members: {len(investigation_data['team_members'])} cross-functional participants")
    
    # D2 - Problem Description
    if investigation_data.get('what_failed'):
        lines.append("\n**D2 - Problem Description:**")
        lines.append(f"  - What: {investigation_data['what_failed']}")
        if investigation_data.get('where_in_process'):
            lines.append(f"  - Where: {investigation_data['where_in_process']}")
        if investigation_data.get('when_detected'):
            lines.append(f"  - When: {investigation_data['when_detected']}")
        if investigation_data.get('defect_quantity'):
            lines.append(f"  - Quantity: {investigation_data['defect_quantity']} units")
    
    # D4 - Root Cause Analysis Results
    if investigation_data.get('root_causes'):
        lines.append("\n**D4 - Root Cause Analysis:**")
        for i, cause in enumerate(investigation_data['root_causes'], 1):
            lines.append(f"  {i}. {cause.get('cause')} (confidence: {cause.get('confidence', 0):.2f})")
            if cause.get('explanation'):
                lines.append(f"     {cause['explanation']}")
        
        if investigation_data.get('knowledge_evidence_count'):
            lines.append(f"  - Based on {investigation_data['knowledge_evidence_count']} similar cases in Gravix knowledge base")
    
    # D3/D5/D6/D7 - Actions
    if investigation_data.get('actions'):
        for discipline in ['D3', 'D5', 'D6', 'D7']:
            discipline_actions = [a for a in investigation_data['actions'] if a.get('discipline') == discipline]
            if discipline_actions:
                lines.append(f"\n**{discipline} Actions:**")
                for action in discipline_actions:
                    lines.append(f"  - {action.get('description')} (Status: {action.get('status')})")
    
    lines.append("\nGenerate formal audit-ready prose for each discipline section.")
    return "\n".join(lines)


def get_escape_point_system_prompt() -> str:
    """System prompt for escape point analysis (Prompt 3)."""
    return """You are a quality control systems analyst specializing in failure prevention and control point analysis. Your task is to identify the earliest point in the production process where a root cause should have been detected.

An "escape point" is the first control point (inspection, test, SPC, audit) that SHOULD HAVE detected the root cause but failed to do so.

Respond with valid JSON in this exact format:
{
  "escape_point": "The earliest control point that should have caught this (e.g., 'Incoming inspection of substrate surface quality')",
  "control_type": "inspection|test|SPC|audit|design_review",
  "why_missed": "Specific reason why the existing control failed to detect this root cause",
  "recommended_control": "Specific control method that would reliably detect this in the future (include acceptance criteria)",
  "process_stage": "Where in the process this control should exist (e.g., 'Incoming material', 'Pre-bonding', 'Post-cure inspection')"
}"""


def build_escape_point_user_prompt(
    root_causes: list[dict],
    where_in_process: str,
    process_description: str = None,
) -> str:
    """Build user prompt for escape point analysis."""
    lines = [
        "Identify the escape point for this failure:\n",
        "**Root Causes:**"
    ]
    
    for i, cause in enumerate(root_causes, 1):
        lines.append(f"  {i}. {cause.get('cause')} (category: {cause.get('category')})")
    
    lines.append(f"\n**Where in Process:** {where_in_process}")
    
    if process_description:
        lines.append(f"\n**Process Description:**\n{process_description}")
    
    lines.append("\nDetermine the earliest control point that should have detected these root causes.")
    return "\n".join(lines)


def get_email_parser_system_prompt() -> str:
    """System prompt for inbound email parsing (Prompt 4)."""
    return """You are an intelligent email parser specialized in extracting structured data from customer complaint emails and 8D investigation requests.

Your task is to parse raw email content and extract key investigation fields using:
- Named entity recognition for customer names, part numbers, references
- Regex pattern matching for common OEM reference formats:
  - Ford: GSDB-XXXXXXX or Complaint #XXXXX
  - Toyota: SQM-XXXXXXX
  - VW: QPN-XXXXXXX
  - BMW: QM-XXXXXXXX
- NLP extraction for failure descriptions
- Quantity and severity inference from language cues

Respond with valid JSON in this exact format:
{
  "title": "Concise investigation title extracted from subject/body",
  "customer_name": "Customer/OEM name if identifiable, else null",
  "complaint_ref": "External complaint reference number if found, else null",
  "part_number": "Part/product number if mentioned, else null",
  "failure_description": "Extracted description of what failed",
  "affected_quantity": "Number of affected units if mentioned, else null (as integer)",
  "severity_guess": "critical|major|minor",
  "confidence": 0.85,
  "extraction_notes": "Any assumptions made or ambiguous fields"
}

Severity heuristics:
- "critical" if: safety issue, line down, recall, field failure in customer hands
- "major" if: production impact, scrap/rework, customer complaint, delivery risk
- "minor" if: internal finding, isolated incident, cosmetic issue"""


def build_email_parser_user_prompt(
    subject: str,
    body: str,
    attachment_filenames: list[str] = None,
) -> str:
    """Build user prompt for email parsing."""
    lines = [
        "Parse the following email and extract investigation data:\n",
        f"**Subject:** {subject}",
        f"\n**Body:**\n{body}",
    ]
    
    if attachment_filenames:
        lines.append(f"\n**Attachments:** {', '.join(attachment_filenames)}")
    
    return "\n".join(lines)
