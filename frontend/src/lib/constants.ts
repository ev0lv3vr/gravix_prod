export const MATERIAL_CATEGORIES = [
  { value: 'adhesive', label: 'Adhesive' },
  { value: 'sealant', label: 'Sealant' },
  { value: 'coating', label: 'Coating' },
] as const;

export const ADHESIVE_SUBCATEGORIES = [
  'Cyanoacrylate (CA)',
  'Epoxy',
  'Polyurethane (PU)',
  'Silicone',
  'Acrylic',
  'Anaerobic',
  'UV-Cure',
  'Hot Melt',
];

export const SEALANT_SUBCATEGORIES = [
  'Silicone',
  'Polyurethane',
  'Polysulfide',
  'Butyl',
  'Acrylic',
];

export const COATING_SUBCATEGORIES = [
  'Conformal Coating',
  'Potting Compound',
  'Encapsulant',
];

export const FAILURE_MODES = [
  'Debonding',
  'Cracking',
  'Discoloration',
  'Softening',
  'Crazing',
  'Creep',
  'Delamination',
  'Blooming',
  'Outgassing',
];

export const COMMON_SUBSTRATES = [
  'Aluminum',
  'Steel',
  'Stainless Steel',
  'Copper',
  'Brass',
  'ABS Plastic',
  'Polycarbonate',
  'Acrylic (PMMA)',
  'Nylon (PA)',
  'PVC',
  'Polypropylene (PP)',
  'Polyethylene (PE)',
  'PTFE (Teflon)',
  'PEEK',
  'Natural Rubber',
  'EPDM',
  'Silicone Rubber',
  'Glass',
  'Ceramic',
  'Wood',
  'Leather',
];

export const TIME_TO_FAILURE_OPTIONS = [
  { value: '<24h', label: 'Less than 24 hours' },
  { value: '1-7days', label: '1-7 days' },
  { value: '1-4weeks', label: '1-4 weeks' },
  { value: '1-6months', label: '1-6 months' },
  { value: '>6months', label: 'More than 6 months' },
];

export const HUMIDITY_OPTIONS = [
  { value: 'low', label: 'Low (<30%)' },
  { value: 'medium', label: 'Medium (30-70%)' },
  { value: 'high', label: 'High (>70%)' },
];

export const APPLICATION_METHODS = [
  'Manual (brush/spatula)',
  'Bead dispensing',
  'Dot dispensing',
  'Spray',
  'Roll coating',
  'Dip coating',
  'Jet dispensing',
];

export const FLEXIBILITY_OPTIONS = [
  { value: 'rigid', label: 'Rigid' },
  { value: 'semi-flexible', label: 'Semi-flexible' },
  { value: 'flexible', label: 'Flexible' },
];

export const GAP_FILL_OPTIONS = [
  { value: '<0.5mm', label: 'Less than 0.5mm' },
  { value: '0.5-2mm', label: '0.5-2mm' },
  { value: '>2mm', label: 'More than 2mm' },
];

export const CURE_TIME_OPTIONS = [
  { value: '<1min', label: 'Less than 1 minute' },
  { value: '1-10min', label: '1-10 minutes' },
  { value: '10-60min', label: '10-60 minutes' },
  { value: '1-24h', label: '1-24 hours' },
  { value: '>24h', label: 'More than 24 hours' },
];

export const CURE_METHODS = [
  { value: 'room-temp', label: 'Room temperature' },
  { value: 'heat', label: 'Heat cure' },
  { value: 'uv', label: 'UV cure' },
];

export const PRODUCTION_VOLUMES = [
  { value: 'prototype', label: 'Prototype / One-off' },
  { value: 'low', label: 'Low volume (<1,000/year)' },
  { value: 'medium', label: 'Medium volume (1,000-10,000/year)' },
  { value: 'high', label: 'High volume (>10,000/year)' },
];

export const STRENGTH_OPTIONS = [
  { value: 'not-specified', label: 'Not specified' },
  { value: '500-1000', label: '500-1,000 PSI' },
  { value: '1000-2000', label: '1,000-2,000 PSI' },
  { value: '2000-4000', label: '2,000-4,000 PSI' },
  { value: '>4000', label: 'More than 4,000 PSI' },
];

export const PLAN_LIMITS = {
  free: { analyses: 2, specs: 2 },
  pro: { analyses: 15, specs: 15 },
  team: { analyses: 50, specs: 50 },
  enterprise: { analyses: 999999, specs: 999999 },
};

export const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    analyses: 2,
    specs: 2,
    features: [
      'Basic failure analysis',
      'Basic spec generation',
      'Watermarked PDFs',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$79',
    period: 'per month',
    analyses: 15,
    specs: 15,
    features: [
      'Everything in Free',
      'Full PDF reports (no watermark)',
      'Case library access',
      'Analysis history',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Team',
    price: '$199',
    period: 'per month',
    analyses: 50,
    specs: 50,
    features: [
      'Everything in Pro',
      'Shared workspace',
      'API access',
      'Team collaboration',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    analyses: 'Unlimited',
    specs: 'Unlimited',
    features: [
      'Everything in Team',
      'Unlimited analyses & specs',
      'SSO (SAML)',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];
