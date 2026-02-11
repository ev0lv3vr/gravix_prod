/**
 * Demo mode: realistic mock data for when the backend API is unreachable.
 * Uses real adhesive types, real failure modes, and real surface prep instructions.
 */

import type { SpecResultData } from '@/components/tool/SpecResults';
import type { FailureResultData } from '@/components/failure/FailureResults';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** True when NEXT_PUBLIC_API_URL is blank / unset / localhost-but-unreachable */
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_API_URL;
  return !url || url === '';
}

/**
 * Simulate network latency so the loading animation plays naturally.
 * Returns after 2.5-4.5 s (random).
 */
export function simulateLatency(): Promise<void> {
  const ms = 2500 + Math.random() * 2000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Spec Engine — mock result keyed off substrates
// ---------------------------------------------------------------------------

interface SpecDemoInput {
  substrateA: string;
  substrateB: string;
  loadType?: string;
  environment?: string[];
  tempMin?: number;
  tempMax?: number;
}

export function generateMockSpecResult(input: SpecDemoInput): SpecResultData {
  const a = input.substrateA.toLowerCase();
  const b = input.substrateB.toLowerCase();

  // Detect substrate families
  const hasMetal =
    ['aluminum', 'steel', 'stainless', 'copper', 'brass', 'titanium'].some(
      (m) => a.includes(m) || b.includes(m)
    );
  const hasPlastic =
    ['abs', 'polycarbonate', 'nylon', 'pvc', 'acrylic', 'pmma', 'peek', 'pp', 'pe', 'ptfe'].some(
      (p) => a.includes(p) || b.includes(p)
    );
  const hasLSE =
    ['pp', 'polypropylene', 'pe', 'polyethylene', 'ptfe', 'teflon'].some(
      (l) => a.includes(l) || b.includes(l)
    );
  const hasRubber =
    ['rubber', 'epdm', 'silicone rubber'].some((r) => a.includes(r) || b.includes(r));
  const isStructural = input.loadType === 'structural';

  // Route to the right recommendation
  if (hasLSE) return lseResult(input);
  if (hasMetal && hasPlastic) return metalPlasticResult(input);
  if (hasMetal && !hasPlastic && !hasRubber) return metalMetalResult(input, isStructural);
  if (hasRubber) return rubberResult(input);
  return generalResult(input);
}

function metalMetalResult(input: SpecDemoInput, structural: boolean): SpecResultData {
  return {
    recommendedSpec: {
      materialType: structural
        ? 'Two-Part Structural Epoxy'
        : 'Two-Part Structural Methacrylate',
      chemistry: structural ? 'Bisphenol-A / Amine-cured Epoxy' : 'Methyl Methacrylate (MMA)',
      subcategory: 'Structural Adhesive',
      rationale: `For bonding ${input.substrateA} to ${input.substrateB}, a ${structural ? 'toughened epoxy' : 'structural methacrylate'} provides excellent shear and peel strength on metallic substrates. ${structural ? 'Epoxy' : 'MMA'}-based adhesives wet out machined metal surfaces well and develop high lap-shear values (>3,000 PSI) after full cure. The chemistry is resistant to vibration fatigue and offers service temperatures from −55 °C to +150 °C, suitable for your specified range.`,
    },
    productCharacteristics: {
      viscosityRange: '35,000–65,000 cP (thixotropic paste)',
      cureTime: '24 h @ 23 °C; 1 h @ 80 °C',
      expectedStrength: '3,500–4,200 PSI lap shear (Al-Al)',
      temperatureResistance: `−55 °C to +150 °C`,
      gapFillCapability: 'Up to 5 mm',
    },
    applicationGuidance: {
      surfacePreparation: [
        `Degrease ${input.substrateA} with acetone or MEK wipe — ensure no residue remains.`,
        `Abrade bonding surfaces with 80-grit aluminum oxide paper or Scotch-Brite pad to create mechanical key (Ra 1.5–3.0 µm).`,
        `Wipe again with IPA to remove particulates; allow 2 min flash-off.`,
        `For ${input.substrateB}: repeat degreasing and abrasion. If anodized aluminum, ensure oxide layer is fresh (<72 h).`,
        'Apply adhesive within 30 min of surface prep to prevent re-contamination.',
      ],
      applicationTips: [
        'Mix at 1:1 ratio by volume; use static mix nozzle for consistent stoichiometry.',
        'Apply a continuous bead 3–5 mm wide along the bond line center.',
        'Close joint and clamp at 5–10 PSI; squeeze-out should be visible along full perimeter.',
        'Cure at room temperature for 24 h or accelerate at 80 °C for 60 min.',
      ],
      curingNotes: [
        'Working time: 20–30 min at 23 °C. Reduce by half at 35 °C.',
        'Handling strength (~50% of ultimate) reached in 4–6 h at RT.',
        'Full cure: 24 h at 23 °C or 1 h at 80 °C.',
        'Do not disturb the bond during cure — micro-movement degrades strength significantly.',
      ],
      commonMistakesToAvoid: [
        'Insufficient surface abrasion — smooth machined surfaces cause adhesive failure.',
        'Contaminated substrates from fingerprints after cleaning.',
        'Incorrect mix ratio — off-ratio mix leaves uncured pockets.',
        'Applying at temperatures below 15 °C — dramatically slows cure.',
      ],
    },
    warnings: [
      `If either substrate is anodized, verify the anodization type: sulfuric acid anodize bonds well, but hard anodize (Type III) may require primer.`,
      'Exotherm risk: do not apply in bond gaps >10 mm without consulting TDS — thick sections can overheat.',
      'Not recommended for dynamic peel loads — consider toughened acrylic if peel is primary.',
    ],
    alternatives: [
      {
        materialType: 'Structural Acrylic (MMA)',
        chemistry: 'Methyl Methacrylate',
        advantages: [
          'Tolerant of slightly oily surfaces',
          'Better peel and impact resistance than epoxy',
          'Faster fixture time (5–8 min)',
        ],
        disadvantages: [
          'Strong odor during cure — requires ventilation',
          'Lower temperature resistance (120 °C max)',
          'Slightly lower lap-shear than structural epoxy',
        ],
        whenToUse: 'When fixture speed is critical or when peel loads are expected.',
      },
      {
        materialType: 'Anaerobic Threadlocker / Retainer',
        chemistry: 'Dimethacrylate Ester',
        advantages: [
          'Excellent for cylindrical metal-to-metal fits',
          'Cures in the absence of air — self-fixturing',
          'No mixing required',
        ],
        disadvantages: [
          'Requires metal ion contact to cure — not for plastics',
          'Gap fill limited to 0.5 mm',
          'Lower shear strength (~2,200 PSI)',
        ],
        whenToUse: 'For press-fit or slip-fit cylindrical assemblies only.',
      },
    ],
    confidenceScore: 0.91,
  };
}

function metalPlasticResult(input: SpecDemoInput): SpecResultData {
  return {
    recommendedSpec: {
      materialType: 'Toughened Two-Part Epoxy',
      chemistry: 'Rubber-Toughened Bisphenol-A Epoxy',
      subcategory: 'Multi-substrate Adhesive',
      rationale: `Bonding ${input.substrateA} to ${input.substrateB} requires an adhesive that bridges the CTE mismatch between metal and plastic. A rubber-toughened epoxy absorbs differential thermal expansion while maintaining strong adhesion to both surfaces. This chemistry bonds well to metals after abrasion and to engineering plastics without primers in most cases.`,
    },
    productCharacteristics: {
      viscosityRange: '45,000–80,000 cP (non-sag paste)',
      cureTime: '24 h @ 23 °C; 45 min @ 65 °C',
      expectedStrength: '2,800–3,400 PSI lap shear',
      temperatureResistance: '−40 °C to +120 °C',
      gapFillCapability: 'Up to 3 mm',
    },
    applicationGuidance: {
      surfacePreparation: [
        `Metal substrate (${input.substrateA.includes('luminum') || input.substrateA.includes('steel') || input.substrateA.includes('teel') ? input.substrateA : input.substrateB}): Abrade with 120-grit paper, then wipe with IPA. Allow 5 min to dry.`,
        `Plastic substrate (${input.substrateA.includes('ABS') || input.substrateA.includes('arbon') || input.substrateA.includes('ylon') ? input.substrateA : input.substrateB}): Lightly abrade with 320-grit paper. Clean with IPA — avoid acetone on polycarbonate (stress cracking risk).`,
        'For polycarbonate or acrylic: test a spot with IPA first to ensure no crazing.',
        'Apply primer only if bond tests fall below 80% of expected values.',
      ],
      applicationTips: [
        'Apply a thin film (0.1–0.3 mm) to both surfaces for maximum contact area.',
        'Assemble within 15 min of application — open time is limited.',
        'Clamp at low pressure (2–5 PSI) to avoid squeezing adhesive too thin.',
        'Fillet excess adhesive at joint edges for improved peel resistance.',
      ],
      curingNotes: [
        'Room temperature cure: 24 h for handling, 7 days for full properties.',
        'Heat cure at 65 °C for 45 min achieves >90% of ultimate strength.',
        'Post-cure at 80 °C for 30 min can improve thermal resistance by 10–15 °C.',
      ],
      commonMistakesToAvoid: [
        'Using acetone on polycarbonate — causes micro-crazing and weakens the substrate.',
        'Ignoring CTE mismatch — rigid adhesives crack under thermal cycling with dissimilar substrates.',
        'Applying too thick — bond lines >3 mm are weaker, not stronger.',
      ],
    },
    warnings: [
      'CTE mismatch between metal and plastic will stress the bond line during thermal cycling. Ensure operating temperature range matches your service conditions.',
      'If the plastic is glass-filled, surface energy may be lower — corona or plasma treatment may be needed.',
    ],
    alternatives: [
      {
        materialType: 'Structural Polyurethane',
        chemistry: 'MDI-based Polyurethane',
        advantages: [
          'Higher elongation (150–300%) absorbs CTE mismatch better',
          'Paintable and can be sanded',
          'Good low-temperature flexibility',
        ],
        disadvantages: [
          'Lower ultimate shear strength (~1,800 PSI)',
          'Moisture-sensitive during cure',
          'Longer fixture time (2–4 h)',
        ],
        whenToUse: 'When thermal cycling is severe or when joint flexibility is required.',
      },
      {
        materialType: 'Cyanoacrylate (toughened)',
        chemistry: 'Ethyl/Alkoxy Cyanoacrylate',
        advantages: [
          'Fixture in seconds — ideal for high-volume production',
          'No mixing required',
          'Good on smooth plastics',
        ],
        disadvantages: [
          'Brittle unless rubber-toughened grade used',
          'Poor gap fill (< 0.2 mm)',
          'Weak on polyolefins without primer',
        ],
        whenToUse: 'For small bond areas with tight fit-up in high-speed production.',
      },
    ],
    confidenceScore: 0.87,
  };
}

function lseResult(input: SpecDemoInput): SpecResultData {
  return {
    recommendedSpec: {
      materialType: 'Modified Cyanoacrylate with Polyolefin Primer',
      chemistry: 'Surface-Insensitive Ethyl Cyanoacrylate + Heptane-Based Primer',
      subcategory: 'Low Surface Energy Bonding',
      rationale: `${input.substrateA} and/or ${input.substrateB} are low surface energy (LSE) substrates (<35 mN/m). Standard adhesives will not wet these surfaces adequately. A primed cyanoacrylate system or a structural adhesive designed for LSE plastics is required. The primer modifies the surface to accept the adhesive, enabling bond strengths approaching substrate failure.`,
    },
    productCharacteristics: {
      viscosityRange: '100–200 cP (thin liquid)',
      cureTime: '10–30 s fixture; 24 h full cure',
      expectedStrength: '800–1,200 PSI (substrate-limited on PP/PE)',
      temperatureResistance: '−30 °C to +80 °C',
      gapFillCapability: 'Up to 0.2 mm (0.5 mm with gel grade)',
    },
    applicationGuidance: {
      surfacePreparation: [
        'Apply polyolefin primer (heptane-based) to both LSE surfaces with a brush or felt-tip applicator.',
        'Allow primer to flash off for 60–90 seconds — surface will appear dry.',
        'Do NOT abrade PP/PE — mechanical abrasion creates weak boundary layers on polyolefins.',
        'For PTFE: plasma or corona treatment is mandatory; primer alone is insufficient.',
        'Ensure surfaces are free of mold release agents — wash with mild detergent and water first if needed.',
      ],
      applicationTips: [
        'Apply adhesive to one surface only, immediately after primer dries.',
        'Close joint quickly — CA fixture time is 10–30 seconds.',
        'Use minimum adhesive — thin bond lines are strongest with CA.',
        'For larger areas, consider a gel-grade CA to prevent run-off.',
      ],
      curingNotes: [
        'Fixture: 10–30 s depending on substrate and humidity.',
        'Handling strength: ~80% at 5 minutes.',
        'Full cure: 24 hours. Accelerator can reduce to minutes but may whiten (blooming).',
      ],
      commonMistakesToAvoid: [
        'Skipping the primer — CA alone will peel off PP/PE with finger pressure.',
        'Abrading polyolefins — creates dust layer that weakens the bond.',
        'Applying too much adhesive — thick CA bond lines are dramatically weaker.',
        'Using accelerator on visible surfaces — causes white haze (blooming).',
      ],
    },
    warnings: [
      'Polyolefin primer contains heptane — use in well-ventilated area. Flash point 0 °C.',
      'PTFE cannot be reliably bonded with primer + CA alone. Plasma/corona pre-treatment is required.',
      'Bond strength is substrate-limited: PP/PE will tear before the adhesive fails if properly primed.',
    ],
    alternatives: [
      {
        materialType: 'Structural Acrylic for LSE Plastics',
        chemistry: 'Modified MMA with built-in surface activator',
        advantages: [
          'No separate primer step needed',
          'Better gap fill than CA (up to 5 mm)',
          'Higher peel and impact resistance',
        ],
        disadvantages: [
          'Strong odor — requires ventilation',
          '5–10 min fixture time',
          'Higher cost per ml',
        ],
        whenToUse: 'When primer step is not feasible in production or when gap fill is needed.',
      },
    ],
    confidenceScore: 0.83,
  };
}

function rubberResult(input: SpecDemoInput): SpecResultData {
  return {
    recommendedSpec: {
      materialType: 'Flexible Cyanoacrylate (Rubber-Toughened)',
      chemistry: 'Rubber-Modified Ethyl Cyanoacrylate',
      subcategory: 'Flexible Bond',
      rationale: `Bonding ${input.substrateA} to ${input.substrateB} where at least one substrate is an elastomer requires a flexible adhesive that can accommodate substrate deformation. A rubber-toughened CA provides instant fixturing with elongation up to 200%, preventing the brittle fracture typical of standard CA on rubber joints.`,
    },
    productCharacteristics: {
      viscosityRange: '1,500–3,000 cP (gel)',
      cureTime: '15–45 s fixture; 24 h full cure',
      expectedStrength: '600–1,000 PSI lap shear',
      temperatureResistance: '−40 °C to +100 °C',
      gapFillCapability: 'Up to 0.5 mm',
    },
    applicationGuidance: {
      surfacePreparation: [
        'Clean rubber surfaces with IPA wipe to remove processing oils and mold release agents.',
        'For EPDM: light abrasion with Scotch-Brite, then IPA wipe. EPDM has inherently low surface energy.',
        'For silicone rubber: plasma or corona treatment strongly recommended — silicone is notoriously difficult to bond.',
        'Allow surfaces to dry completely before adhesive application.',
      ],
      applicationTips: [
        'Apply a thin film of adhesive to one surface only.',
        'Press parts together firmly — rubber compliance helps achieve intimate contact.',
        'Hold for 30–60 seconds for initial fixture.',
        'For silicone rubber, use a silicone-specific primer before CA application.',
      ],
      curingNotes: [
        'Fixture: 15–45 s (slower on dry/low-humidity days).',
        'Use activator on the mating surface if fixture time exceeds 60 s.',
        'Full properties develop over 24 h.',
      ],
      commonMistakesToAvoid: [
        'Using rigid CA on rubber — it will crack when the rubber flexes.',
        'Bonding silicone rubber without plasma/corona/primer — guaranteed failure.',
        'Compressing rubber joints too much — stressed rubber pulls away during relaxation.',
      ],
    },
    warnings: [
      'Silicone rubber bonds are inherently difficult. Even with treatment, expect 40–60% lower strength than other elastomers.',
      'Natural rubber contains anti-ozonants that migrate to the surface over time — bond freshly-molded parts when possible.',
    ],
    alternatives: [
      {
        materialType: 'Contact Cement (Polychloroprene)',
        chemistry: 'Neoprene-based Contact Adhesive',
        advantages: [
          'Excellent on rubber-to-rubber and rubber-to-fabric',
          'Large area coverage',
          'Flexible bond line',
        ],
        disadvantages: [
          'Solvent-based — VOC concerns',
          'Lower shear strength than CA or epoxy',
          'Requires both-side application and tack-dry time',
        ],
        whenToUse: 'For large-area rubber bonding where instant fixture is not needed.',
      },
    ],
    confidenceScore: 0.84,
  };
}

function generalResult(input: SpecDemoInput): SpecResultData {
  return {
    recommendedSpec: {
      materialType: 'Two-Part Epoxy (General Purpose)',
      chemistry: 'Amine-Cured Bisphenol-A Epoxy',
      subcategory: 'General Purpose Structural',
      rationale: `For bonding ${input.substrateA} to ${input.substrateB}, a general-purpose two-part epoxy provides a reliable balance of strength, temperature resistance, and ease of use. This chemistry bonds to a wide range of substrates with proper surface preparation and offers good chemical resistance.`,
    },
    productCharacteristics: {
      viscosityRange: '30,000–60,000 cP (thixotropic)',
      cureTime: '24 h @ 23 °C; 1 h @ 80 °C',
      expectedStrength: '2,500–3,500 PSI lap shear',
      temperatureResistance: '−55 °C to +120 °C',
      gapFillCapability: 'Up to 3 mm',
    },
    applicationGuidance: {
      surfacePreparation: [
        `Clean ${input.substrateA} with IPA or acetone to remove oils and contaminants.`,
        `Abrade both surfaces with 80–120 grit sandpaper to promote mechanical interlock.`,
        `Clean ${input.substrateB} with IPA wipe after abrasion to remove dust.`,
        'Bond within 30 minutes of surface prep.',
      ],
      applicationTips: [
        'Mix at the specified ratio (typically 1:1 or 2:1) — do not estimate.',
        'Apply to one surface and spread evenly with a spatula.',
        'Assemble parts and clamp with moderate pressure.',
        'Verify squeeze-out around the full perimeter to confirm complete wet-out.',
      ],
      curingNotes: [
        'Working time: ~30 min at 23 °C.',
        'Handling strength in 6–8 h at room temperature.',
        'Full properties: 24 h at RT or 1 h at 80 °C.',
      ],
      commonMistakesToAvoid: [
        'Incorrect mix ratio — causes soft, uncured areas.',
        'Disturbing the bond during cure.',
        'Applying at temperatures below 10 °C without heat-assisted cure.',
      ],
    },
    warnings: [
      'Verify chemical compatibility with your service environment — not all epoxies resist solvents equally.',
      'For outdoor applications, check UV resistance — most epoxies yellow and degrade with prolonged UV exposure.',
    ],
    alternatives: [
      {
        materialType: 'Polyurethane Adhesive',
        chemistry: 'Two-Part Polyurethane',
        advantages: [
          'More flexible than epoxy — better fatigue resistance',
          'Paintable and sandable',
          'Good impact resistance',
        ],
        disadvantages: [
          'Lower shear strength than epoxy',
          'Moisture-sensitive during cure',
          'Longer fixture time',
        ],
        whenToUse: 'When flexibility or paintability is required.',
      },
    ],
    confidenceScore: 0.85,
  };
}

// ---------------------------------------------------------------------------
// Failure Analysis — mock result keyed off failure mode + context
// ---------------------------------------------------------------------------

interface FailureDemoInput {
  failureMode: string;
  failureDescription: string;
  substrateA: string;
  substrateB: string;
  adhesiveUsed?: string;
  timeToFailure?: string;
  environment?: string[];
  surfacePrep?: string;
}

export function generateMockFailureResult(input: FailureDemoInput): FailureResultData {
  const mode = input.failureMode.toLowerCase();
  const envFactors = input.environment || [];
  const hasHumidity = envFactors.some((e) => e.toLowerCase().includes('humid'));
  const hasChemical = envFactors.some((e) => e.toLowerCase().includes('chemical'));
  const hasThermal = envFactors.some((e) => e.toLowerCase().includes('thermal'));
  const hasUV = envFactors.some((e) => e.toLowerCase().includes('uv'));

  if (mode.includes('adhesive') || mode.includes('debond')) {
    return adhesiveFailureResult(input, { hasHumidity, hasChemical, hasThermal });
  }
  if (mode.includes('cohesive')) {
    return cohesiveFailureResult(input, { hasHumidity, hasThermal });
  }
  if (mode.includes('substrate')) {
    return substrateFailureResult(input);
  }
  // mixed mode or default
  return mixedModeResult(input, { hasHumidity, hasChemical, hasThermal, hasUV });
}

function adhesiveFailureResult(
  input: FailureDemoInput,
  env: { hasHumidity: boolean; hasChemical: boolean; hasThermal: boolean }
): FailureResultData {
  const rootCauses = [
    {
      rank: 1,
      cause: 'Inadequate Surface Preparation',
      category: 'surface_prep',
      confidence: 0.89,
      explanation: `Clean separation from the ${input.substrateA} surface indicates the adhesive never achieved proper wetting. This is the #1 cause of adhesive failure in production environments. Surface contaminants (oils, oxides, mold release) create a weak boundary layer that fails under load.`,
      mechanism: 'Contaminant film prevents intimate molecular contact between adhesive and substrate → weak boundary layer forms → interfacial crack propagation under mechanical or environmental stress.',
      gravixData: 'Confirmed in 73% of adhesive failure cases involving metal substrates',
    },
    {
      rank: 2,
      cause: env.hasHumidity
        ? 'Moisture-Induced Interface Degradation'
        : 'Substrate Surface Energy Mismatch',
      category: env.hasHumidity ? 'environmental' : 'material_selection',
      confidence: env.hasHumidity ? 0.76 : 0.68,
      explanation: env.hasHumidity
        ? `High humidity environment accelerates hydrolytic attack at the adhesive-substrate interface. Water molecules displace adhesive bonds at the interface, particularly on metal oxides, leading to progressive debonding.`
        : `The surface energy of ${input.substrateB} may be below the wetting threshold of the adhesive used. Adhesives require the substrate surface energy to exceed the adhesive surface tension by ≥10 mN/m for reliable bonds.`,
      mechanism: env.hasHumidity
        ? 'H₂O molecules diffuse along interface → hydrolysis of adhesive-oxide bonds → osmotic blistering → progressive delamination.'
        : 'Incomplete wetting → contact angle >30° → reduced true contact area → stress concentration at void boundaries → crack initiation.',
    },
    {
      rank: 3,
      cause: 'Insufficient Cure at Interface',
      category: 'process',
      confidence: 0.52,
      explanation: 'If the adhesive was under-cured at the interface (due to temperature, contamination, or off-ratio mixing), the interfacial layer may have remained weak even if the bulk adhesive cured properly.',
      mechanism: 'Surface contaminants or low temperature inhibit cure at the interface → thin uncured layer at boundary → adhesive failure under stress despite apparently cured bulk.',
    },
  ];

  return {
    diagnosis: {
      topRootCause: rootCauses[0].cause,
      confidence: rootCauses[0].confidence,
      explanation: rootCauses[0].explanation,
    },
    rootCauses,
    contributingFactors: [
      `Adhesive failure mode (clean surface visible on ${input.substrateA}) rules out cohesive and substrate failure.`,
      input.timeToFailure && input.timeToFailure !== 'immediate'
        ? `Failure after ${input.timeToFailure} suggests environmental degradation may have contributed to an initially marginal bond.`
        : 'Immediate or early failure strongly indicates surface preparation deficiency.',
      env.hasChemical
        ? 'Chemical exposure environment may have attacked the interface preferentially.'
        : '',
      env.hasThermal
        ? 'Thermal cycling induces interfacial shear stress from CTE mismatch — exacerbates any pre-existing weakness.'
        : '',
    ].filter(Boolean),
    immediateActions: [
      `Inspect failed surfaces under magnification — look for contamination patterns, fingerprints, or machining oil residue on the ${input.substrateA} side.`,
      'Perform a water-break test on a fresh substrate: clean, abrade, then apply distilled water. It should sheet evenly, not bead.',
      'Check the adhesive batch — verify expiration date and storage conditions (many adhesives degrade if stored above 25 °C).',
      'Bond 5 test coupons with verified surface prep and test to failure — compare to datasheet values.',
    ],
    longTermSolutions: [
      `Implement standardized surface prep procedure: abrade with specified grit → solvent wipe (IPA preferred over acetone for most substrates) → verify with water-break test → bond within 30 min.`,
      'Add incoming QC check: measure surface energy with dyne pens or contact angle goniometer before bonding.',
      env.hasHumidity
        ? 'For humid environments: apply corrosion-inhibiting primer before adhesive, or switch to a moisture-resistant adhesive chemistry (e.g., epoxy-polyamide).'
        : 'Document and standardize the surface prep window — time between cleaning and bonding should be <30 min.',
      'Introduce destructive peel testing on production samples at defined intervals (e.g., 1 per 50 units).',
    ],
    preventionPlan: [
      'Create a visual work instruction for surface preparation — photos of acceptable vs. unacceptable surfaces.',
      'Implement process control: operator sign-off on surface prep + adhesive batch number for each assembly.',
      'Schedule quarterly adhesion audits — destructive test random samples and compare to baseline.',
      'Store adhesive per manufacturer TDS (typically 2–8 °C for reactive adhesives).',
      'Train operators annually on contamination sources: skin oils, silicone spray, shop air compressor oil.',
    ],
    similarCases: [
      { id: 'case-001', title: 'Epoxy debonding from aluminum heat sink — automotive ECU', industry: 'Automotive' },
      { id: 'case-002', title: 'CA failure on stainless steel sensor housing', industry: 'Medical Device' },
    ],
    confidenceScore: 0.89,
  };
}

function cohesiveFailureResult(
  input: FailureDemoInput,
  env: { hasHumidity: boolean; hasThermal: boolean }
): FailureResultData {
  return {
    diagnosis: {
      topRootCause: 'Adhesive Overloaded Beyond Cohesive Strength',
      confidence: 0.82,
      explanation: `Cohesive failure (break within the adhesive layer itself) between ${input.substrateA} and ${input.substrateB} indicates the adhesive bonded well to both surfaces but the bulk adhesive was exceeded. This can be caused by under-specification, excessive bond-line thickness, or environmental degradation of the adhesive bulk.`,
    },
    rootCauses: [
      {
        rank: 1,
        cause: 'Excessive Bond-Line Thickness',
        category: 'process',
        confidence: 0.82,
        explanation: 'Thick bond lines (>1 mm for most structural adhesives) develop internal voids and stress concentrations that reduce cohesive strength by 30–60% compared to optimal thickness (0.1–0.3 mm).',
        mechanism: 'Thick bond line → internal voids from air entrapment during mixing → stress concentration at void tips → crack initiation → cohesive propagation through weakest adhesive cross-section.',
        gravixData: 'Seen in 41% of cohesive failure cases in Gravix database',
      },
      {
        rank: 2,
        cause: env.hasThermal ? 'Thermal Degradation of Adhesive' : 'Adhesive Under-Specification for Load',
        category: env.hasThermal ? 'environmental' : 'material_selection',
        confidence: env.hasThermal ? 0.74 : 0.71,
        explanation: env.hasThermal
          ? 'Thermal cycling above the adhesive\'s glass transition temperature (Tg) softens the polymer matrix, dramatically reducing cohesive strength. Even brief excursions above Tg can cause permanent property loss.'
          : `The applied loads may exceed the adhesive's rated cohesive strength for this joint geometry. Lap-shear values from datasheets assume optimized overlap ratios — real-world joints often have less favorable geometry.`,
        mechanism: env.hasThermal
          ? 'Temperature > Tg → polymer chain mobility increases → creep and plastic deformation → cohesive rupture under sustained load.'
          : 'Applied stress > cohesive strength at weakest cross-section → plastic zone development → crack growth → failure.',
      },
      {
        rank: 3,
        cause: 'Incomplete or Inhomogeneous Cure',
        category: 'process',
        confidence: 0.58,
        explanation: 'If mixing was inadequate (common with manual mixing of two-part adhesives), pockets of uncured or partially cured adhesive act as initiation sites for cohesive failure.',
        mechanism: 'Off-ratio or undermixed regions → localized soft spots → stress concentration → cohesive crack initiation at soft/hard boundary.',
      },
    ],
    contributingFactors: [
      'Cohesive failure confirms good surface adhesion — surface prep is likely adequate.',
      'Check bond-line thickness: if >1 mm, this is likely the primary factor.',
      env.hasHumidity ? 'Moisture absorption swells most adhesives 1–3%, reducing cohesive strength.' : '',
      `Time to failure of ${input.timeToFailure || 'unknown'} may indicate creep if under sustained static load.`,
    ].filter(Boolean),
    immediateActions: [
      'Measure the bond-line thickness on failed samples — compare to adhesive TDS recommended range.',
      'Section the failed adhesive and examine under magnification for voids, unmixed regions, or color variations.',
      'Verify the applied load vs. adhesive rated strength — calculate the actual stress on the bond area.',
      'Check batch mix records — confirm ratio, mix time, and pot life were within specification.',
    ],
    longTermSolutions: [
      'Control bond-line thickness with glass bead spacers or shims (0.15–0.25 mm typical for structural adhesives).',
      'Switch to a static mix nozzle if currently hand-mixing — ensures consistent stoichiometry.',
      'If load exceeds adhesive capability: increase bond area (longer overlap) or upgrade adhesive chemistry.',
      env.hasThermal
        ? 'Select an adhesive with Tg at least 20 °C above maximum service temperature.'
        : 'Perform design-of-experiment on bond geometry to optimize lap-shear ratio.',
    ],
    preventionPlan: [
      'Specify bond-line thickness on assembly drawings with tolerances.',
      'Add visual inspection for squeeze-out as evidence of proper wet-out.',
      'Implement lot-testing: bond 3 coupons per adhesive batch, test at 24 h, file results.',
      'For two-part adhesives: mandate static mix nozzles or machine mixing for consistency.',
    ],
    similarCases: [
      { id: 'case-003', title: 'Epoxy cohesive failure in electronics potting — thermal cycling', industry: 'Electronics' },
    ],
    confidenceScore: 0.82,
  };
}

function substrateFailureResult(input: FailureDemoInput): FailureResultData {
  return {
    diagnosis: {
      topRootCause: 'Bond Exceeds Substrate Strength — Joint Design Success',
      confidence: 0.93,
      explanation: `Substrate failure (${input.substrateA} or ${input.substrateB} tears or fractures before the adhesive bond) means the adhesive system is working correctly — the bond is stronger than the substrate. However, if this failure mode is undesirable (damaging the substrate), the joint needs redesign to distribute load.`,
    },
    rootCauses: [
      {
        rank: 1,
        cause: 'Substrate Weaker Than Adhesive Bond',
        category: 'design',
        confidence: 0.93,
        explanation: 'This is technically a successful bond — the adhesive is doing its job. Substrate failure occurs when the interlaminar strength (for composites) or tear strength (for soft materials) is lower than the adhesive bond strength.',
        mechanism: 'Applied load → stress transferred through adhesive to substrate → substrate fails at its weakest plane (e.g., composite interlaminar layer, foam cell walls, wood grain).',
        gravixData: 'Substrate failure is the desired mode in 85% of structural bond validations',
      },
      {
        rank: 2,
        cause: 'Stress Concentration at Bond Edges',
        category: 'design',
        confidence: 0.61,
        explanation: 'Peel stresses at the edges of lap joints can initiate substrate failure even when average stress is well below substrate strength. This is especially true for brittle substrates like ceramics or thermoset composites.',
        mechanism: 'Non-uniform stress distribution in lap joint → peak stress at overlap ends can be 4–8x average → substrate failure initiates at stress concentration → propagates.',
      },
    ],
    contributingFactors: [
      'Substrate failure confirms excellent adhesion and adequate cohesive strength.',
      `If ${input.substrateA} is a composite or layered material, interlaminar strength is typically the weakest link.`,
      'If the substrate is foam, wood, or paper: these always fail before a properly bonded structural adhesive.',
    ],
    immediateActions: [
      'Determine if substrate failure is acceptable for your application — in many cases, this is the gold standard.',
      'If substrate damage is unacceptable: reduce bond area to limit peel-out force, or add a load-spreading feature.',
      'Inspect the substrate material for defects (delamination, voids, grain weakness) that may have lowered its strength.',
    ],
    longTermSolutions: [
      'If substrate failure is acceptable: document it as the validated failure mode and set it as the acceptance criterion for production testing.',
      'If substrate failure is unacceptable: redesign the joint to reduce peel loading — use scarf joints or add fillets.',
      'Consider reinforcing the substrate locally (e.g., doublers on composites, metal inserts in foam).',
      'For composites: specify a peel ply on the bond surface to ensure consistent interlaminar strength at the interface.',
    ],
    preventionPlan: [
      'Define the acceptable failure mode in the bond specification document.',
      'Perform validation testing that confirms substrate failure consistently — this validates the adhesive system.',
      'Monitor substrate incoming quality — batch-to-batch variation in substrate strength can shift the failure mode.',
    ],
    confidenceScore: 0.93,
  };
}

function mixedModeResult(
  input: FailureDemoInput,
  env: { hasHumidity: boolean; hasChemical: boolean; hasThermal: boolean; hasUV: boolean }
): FailureResultData {
  return {
    diagnosis: {
      topRootCause: 'Combined Surface Prep and Environmental Degradation',
      confidence: 0.78,
      explanation: `Mixed-mode failure (both adhesive and cohesive failure visible) between ${input.substrateA} and ${input.substrateB} indicates multiple interacting failure mechanisms. The bond was marginal — partly attached, partly separated. This typically results from inconsistent surface preparation combined with environmental stress.`,
    },
    rootCauses: [
      {
        rank: 1,
        cause: 'Inconsistent Surface Preparation Across Bond Area',
        category: 'surface_prep',
        confidence: 0.78,
        explanation: 'Mixed failure mode with regions of both adhesive and cohesive failure strongly suggests that surface prep was adequate in some areas but not others. This creates a non-uniform interface strength that fails progressively.',
        mechanism: 'Well-prepared regions hold (cohesive failure) → poorly-prepared regions release (adhesive failure) → load transfers to remaining bond → cascade failure.',
        gravixData: 'Mixed-mode failures correlate with manual surface prep in 67% of cases',
      },
      {
        rank: 2,
        cause: env.hasUV ? 'UV Degradation of Adhesive' : 'Environmental Stress Cracking',
        category: 'environmental',
        confidence: env.hasUV ? 0.72 : 0.65,
        explanation: env.hasUV
          ? 'UV exposure breaks polymer chains at the exposed adhesive surface, creating a degraded surface layer that fails adhesively while the protected interior fails cohesively.'
          : `Environmental exposure (${[env.hasHumidity ? 'humidity' : '', env.hasChemical ? 'chemicals' : '', env.hasThermal ? 'thermal cycling' : ''].filter(Boolean).join(', ') || 'general weathering'}) degrades the adhesive non-uniformly, starting at exposed edges and propagating inward.`,
        mechanism: env.hasUV
          ? 'UV photons → chain scission in exposed adhesive → surface embrittlement → microcracking → environmental ingress → progressive mixed-mode failure from edges.'
          : 'Environmental agents penetrate from bond-line edges → interface degradation outpaces bulk degradation → mixed adhesive/cohesive failure pattern.',
      },
      {
        rank: 3,
        cause: 'Adhesive Selection Near Performance Limit',
        category: 'material_selection',
        confidence: 0.55,
        explanation: 'The adhesive may be operating near its performance envelope — adequate in ideal conditions but failing when any variable (surface prep, environment, load) is slightly out of specification.',
        mechanism: 'Marginal design margin → small perturbations push some regions past adhesive or cohesive limits → mixed failure pattern.',
      },
    ],
    contributingFactors: [
      'Mixed-mode failure is harder to diagnose than pure modes — examine the failure pattern carefully to map adhesive vs. cohesive regions.',
      'Adhesive failure regions indicate where surface prep was deficient or environmental attack occurred.',
      'Cohesive failure regions confirm the adhesive chemistry can work with these substrates.',
      input.adhesiveUsed ? `Adhesive used (${input.adhesiveUsed}) — verify compatibility with both substrates.` : '',
    ].filter(Boolean),
    immediateActions: [
      'Photograph the failure surfaces and map adhesive vs. cohesive regions — the pattern reveals the failure progression.',
      'Test surface energy of fresh substrates vs. failed substrates using dyne pens.',
      'Review surface prep procedure — look for steps where inconsistency could occur.',
      'Bond 5 test coupons with strictly controlled surface prep and test — if results improve, surface prep is confirmed as root cause.',
    ],
    longTermSolutions: [
      'Standardize and automate surface preparation where possible (e.g., automated abrasion, plasma treatment).',
      'Increase design margin: use a higher-performance adhesive or increase bond area by 30%.',
      env.hasUV ? 'Protect bond line from UV exposure with a sealant bead or paint over the fillet.' : 'Seal bond-line edges to prevent environmental ingress.',
      'Implement incoming surface energy testing — reject substrates below specification.',
    ],
    preventionPlan: [
      'Define minimum surface energy requirement for both substrates (typically ≥38 mN/m for structural bonds).',
      'Add process verification step: water-break test or dyne-pen check before bonding.',
      'Schedule periodic destructive testing to monitor bond quality trends.',
      'Review adhesive TDS for environmental resistance ratings — ensure they cover your service conditions with margin.',
    ],
    similarCases: [
      { id: 'case-004', title: 'Mixed-mode epoxy failure on outdoor aluminum assembly', industry: 'Construction' },
      { id: 'case-005', title: 'Inconsistent CA bonding on ABS housings — consumer electronics', industry: 'Consumer' },
    ],
    confidenceScore: 0.78,
  };
}
