/**
 * Phase 4: Mock product data for the Product Catalog & Performance pages.
 * 
 * This module provides realistic mock data until the API endpoints are ready.
 * All data is anonymized — no real company or facility names in performance data.
 * 
 * To swap for real API: replace the functions below with fetch calls to
 * `/v1/products/catalog` and `/v1/products/:manufacturer/:slug/performance`.
 */

// ============================================================================
// Types
// ============================================================================

export interface ProductCatalogItem {
  slug: string;
  name: string;
  manufacturer: string;
  manufacturerSlug: string;
  chemistry: string;
  totalApplications: number;
  failureRate: number; // percentage, e.g. 4.2
  topFailureMode: string;
  topFailureModePercent: number;
}

export interface ProductPerformanceData {
  slug: string;
  name: string;
  manufacturer: string;
  manufacturerSlug: string;
  chemistry: string;

  // Key Specifications
  specs: {
    viscosity: string;
    fixtureTime: string;
    cureTime: string;
    shearStrength: string;
    tempRange: string;
    source: string;
    verified: boolean;
  };

  // Field Performance
  performance: {
    totalApplications: number;
    failureRate: number;
    failureModes: Array<{ mode: string; percent: number }>;
    rootCauses: Array<{ cause: string; percent: number }>;
    applicationErrors: Array<{ error: string; percent: number }>;
  };
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PRODUCTS: ProductCatalogItem[] = [
  {
    slug: 'loctite-495',
    name: 'Loctite 495',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Cyanoacrylate',
    totalApplications: 142,
    failureRate: 4.2,
    topFailureMode: 'Humidity degradation',
    topFailureModePercent: 41,
  },
  {
    slug: 'dp460',
    name: '3M DP460',
    manufacturer: '3M',
    manufacturerSlug: '3m',
    chemistry: 'Epoxy (2-part)',
    totalApplications: 89,
    failureRate: 2.1,
    topFailureMode: 'Cure temperature',
    topFailureModePercent: 38,
  },
  {
    slug: 'loctite-401',
    name: 'Loctite 401',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Cyanoacrylate',
    totalApplications: 67,
    failureRate: 6.8,
    topFailureMode: 'Humidity degradation',
    topFailureModePercent: 45,
  },
  {
    slug: 'dp420',
    name: '3M DP420',
    manufacturer: '3M',
    manufacturerSlug: '3m',
    chemistry: 'Epoxy (2-part)',
    totalApplications: 58,
    failureRate: 8.2,
    topFailureMode: 'UV degradation',
    topFailureModePercent: 71,
  },
  {
    slug: 'ea-9394',
    name: 'EA 9394',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Epoxy (paste)',
    totalApplications: 53,
    failureRate: 3.4,
    topFailureMode: 'Surface contamination',
    topFailureModePercent: 52,
  },
  {
    slug: 'loctite-480',
    name: 'Loctite 480',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Cyanoacrylate (rubber-toughened)',
    totalApplications: 47,
    failureRate: 3.8,
    topFailureMode: 'Thermal cycling',
    topFailureModePercent: 36,
  },
  {
    slug: 'ma310',
    name: 'Plexus MA310',
    manufacturer: 'ITW',
    manufacturerSlug: 'itw',
    chemistry: 'MMA (Methacrylate)',
    totalApplications: 42,
    failureRate: 2.0,
    topFailureMode: 'Incomplete mix',
    topFailureModePercent: 48,
  },
  {
    slug: 'lord-310a-b',
    name: 'Lord 310A/B',
    manufacturer: 'Parker Lord',
    manufacturerSlug: 'parker-lord',
    chemistry: 'Acrylic (2-part)',
    totalApplications: 38,
    failureRate: 1.8,
    topFailureMode: 'Surface prep',
    topFailureModePercent: 55,
  },
  {
    slug: 'e-120hp',
    name: 'Loctite E-120HP',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Epoxy (2-part)',
    totalApplications: 35,
    failureRate: 5.1,
    topFailureMode: 'Cure temperature',
    topFailureModePercent: 42,
  },
  {
    slug: 'scotch-weld-2216',
    name: 'Scotch-Weld 2216',
    manufacturer: '3M',
    manufacturerSlug: '3m',
    chemistry: 'Epoxy (flexible)',
    totalApplications: 31,
    failureRate: 2.9,
    topFailureMode: 'Mix ratio',
    topFailureModePercent: 39,
  },
  {
    slug: 'sika-power-4720',
    name: 'SikaPower-4720',
    manufacturer: 'Sika',
    manufacturerSlug: 'sika',
    chemistry: 'Epoxy (crash-durable)',
    totalApplications: 28,
    failureRate: 1.5,
    topFailureMode: 'Surface contamination',
    topFailureModePercent: 60,
  },
  {
    slug: 'permabond-910',
    name: 'Permabond 910',
    manufacturer: 'Permabond',
    manufacturerSlug: 'permabond',
    chemistry: 'Cyanoacrylate',
    totalApplications: 25,
    failureRate: 5.6,
    topFailureMode: 'Moisture degradation',
    topFailureModePercent: 50,
  },
  {
    slug: 'dp810',
    name: '3M DP810',
    manufacturer: '3M',
    manufacturerSlug: '3m',
    chemistry: 'Acrylic (low-odor)',
    totalApplications: 22,
    failureRate: 3.2,
    topFailureMode: 'Gap fill exceeded',
    topFailureModePercent: 44,
  },
  {
    slug: 'araldite-2011',
    name: 'Araldite 2011',
    manufacturer: 'Huntsman',
    manufacturerSlug: 'huntsman',
    chemistry: 'Epoxy (2-part)',
    totalApplications: 19,
    failureRate: 4.7,
    topFailureMode: 'Cure temperature',
    topFailureModePercent: 35,
  },
  {
    slug: 'loctite-3090',
    name: 'Loctite 3090',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Cyanoacrylate (gap-filling)',
    totalApplications: 16,
    failureRate: 7.1,
    topFailureMode: 'Excessive gap',
    topFailureModePercent: 58,
  },
  {
    slug: 'betamate-1496v',
    name: 'Betamate 1496V',
    manufacturer: 'Dow',
    manufacturerSlug: 'dow',
    chemistry: 'Epoxy (structural)',
    totalApplications: 14,
    failureRate: 2.3,
    topFailureMode: 'Surface prep',
    topFailureModePercent: 47,
  },
  {
    slug: 'dp105',
    name: '3M DP105',
    manufacturer: '3M',
    manufacturerSlug: '3m',
    chemistry: 'Epoxy (clear)',
    totalApplications: 12,
    failureRate: 4.0,
    topFailureMode: 'Humidity',
    topFailureModePercent: 40,
  },
  {
    slug: 'loctite-4090',
    name: 'Loctite 4090',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Hybrid (CA/Epoxy)',
    totalApplications: 11,
    failureRate: 3.6,
    topFailureMode: 'Thermal cycling',
    topFailureModePercent: 42,
  },
];

const MOCK_PERFORMANCE: Record<string, ProductPerformanceData> = {
  'henkel/loctite-495': {
    slug: 'loctite-495',
    name: 'Loctite 495',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Cyanoacrylate (Ethyl)',
    specs: {
      viscosity: '20–50 cP',
      fixtureTime: '5–20 s',
      cureTime: '24 h @ 22 °C',
      shearStrength: '17–24 MPa (steel)',
      tempRange: '−54 °C to 82 °C',
      source: 'Manufacturer TDS',
      verified: true,
    },
    performance: {
      totalApplications: 142,
      failureRate: 4.2,
      failureModes: [
        { mode: 'Adhesive', percent: 68 },
        { mode: 'Cohesive', percent: 22 },
        { mode: 'Mixed', percent: 10 },
      ],
      rootCauses: [
        { cause: 'Moisture degradation', percent: 41 },
        { cause: 'Surface preparation', percent: 29 },
        { cause: 'Incorrect substrate', percent: 18 },
        { cause: 'Thermal stress', percent: 12 },
      ],
      applicationErrors: [
        { error: 'Applied below minimum temperature', percent: 15 },
        { error: 'No primer on low-surface-energy substrates', percent: 23 },
        { error: 'Exceeded fixture time before clamping', percent: 12 },
      ],
    },
  },
  '3m/dp460': {
    slug: 'dp460',
    name: '3M DP460',
    manufacturer: '3M',
    manufacturerSlug: '3m',
    chemistry: 'Epoxy (2-part)',
    specs: {
      viscosity: '45,000 cP (mixed)',
      fixtureTime: '40–60 min',
      cureTime: '4 h @ 65 °C / 24 h @ 23 °C',
      shearStrength: '27–33 MPa (steel)',
      tempRange: '−55 °C to 177 °C',
      source: 'Manufacturer TDS',
      verified: true,
    },
    performance: {
      totalApplications: 89,
      failureRate: 2.1,
      failureModes: [
        { mode: 'Adhesive', percent: 45 },
        { mode: 'Cohesive', percent: 40 },
        { mode: 'Mixed', percent: 15 },
      ],
      rootCauses: [
        { cause: 'Cure temperature too low', percent: 38 },
        { cause: 'Mix ratio deviation', percent: 25 },
        { cause: 'Surface contamination', percent: 22 },
        { cause: 'Expired material', percent: 15 },
      ],
      applicationErrors: [
        { error: 'Cured at ambient instead of elevated temperature', percent: 28 },
        { error: 'Incorrect mix ratio from static mixer', percent: 18 },
        { error: 'Insufficient surface abrasion', percent: 14 },
      ],
    },
  },
  'henkel/loctite-401': {
    slug: 'loctite-401',
    name: 'Loctite 401',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Cyanoacrylate (Ethyl)',
    specs: {
      viscosity: '20–50 cP',
      fixtureTime: '3–10 s',
      cureTime: '24 h @ 22 °C',
      shearStrength: '15–20 MPa (steel)',
      tempRange: '−54 °C to 82 °C',
      source: 'Manufacturer TDS',
      verified: true,
    },
    performance: {
      totalApplications: 67,
      failureRate: 6.8,
      failureModes: [
        { mode: 'Adhesive', percent: 72 },
        { mode: 'Cohesive', percent: 18 },
        { mode: 'Mixed', percent: 10 },
      ],
      rootCauses: [
        { cause: 'Humidity degradation', percent: 45 },
        { cause: 'Surface contamination', percent: 22 },
        { cause: 'Low-energy substrate mismatch', percent: 20 },
        { cause: 'Thermal cycling', percent: 13 },
      ],
      applicationErrors: [
        { error: 'Used on polyolefin without primer', percent: 31 },
        { error: 'Applied in high-humidity environment (>60% RH)', percent: 22 },
        { error: 'Excessive adhesive application (gap-filling attempt)', percent: 15 },
      ],
    },
  },
  '3m/dp420': {
    slug: 'dp420',
    name: '3M DP420',
    manufacturer: '3M',
    manufacturerSlug: '3m',
    chemistry: 'Epoxy (2-part)',
    specs: {
      viscosity: '70,000 cP (mixed)',
      fixtureTime: '20–30 min',
      cureTime: '2 h @ 65 °C / 24 h @ 23 °C',
      shearStrength: '20–28 MPa (steel)',
      tempRange: '−55 °C to 82 °C',
      source: 'Manufacturer TDS',
      verified: true,
    },
    performance: {
      totalApplications: 58,
      failureRate: 8.2,
      failureModes: [
        { mode: 'Adhesive', percent: 55 },
        { mode: 'Cohesive', percent: 30 },
        { mode: 'Mixed', percent: 15 },
      ],
      rootCauses: [
        { cause: 'UV degradation', percent: 71 },
        { cause: 'Surface preparation', percent: 15 },
        { cause: 'Thermal cycling', percent: 14 },
      ],
      applicationErrors: [
        { error: 'Used in outdoor/UV-exposed application without protection', percent: 45 },
        { error: 'Insufficient surface cleaning', percent: 20 },
        { error: 'Applied below minimum temperature', percent: 12 },
      ],
    },
  },
  'henkel/ea-9394': {
    slug: 'ea-9394',
    name: 'EA 9394',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Epoxy (paste)',
    specs: {
      viscosity: '500,000 cP (paste)',
      fixtureTime: '60–90 min',
      cureTime: '5 days @ 25 °C / 1 h @ 93 °C',
      shearStrength: '28–35 MPa (aluminum)',
      tempRange: '−55 °C to 177 °C',
      source: 'Manufacturer TDS',
      verified: true,
    },
    performance: {
      totalApplications: 53,
      failureRate: 3.4,
      failureModes: [
        { mode: 'Adhesive', percent: 58 },
        { mode: 'Cohesive', percent: 32 },
        { mode: 'Mixed', percent: 10 },
      ],
      rootCauses: [
        { cause: 'Surface contamination', percent: 52 },
        { cause: 'Mix ratio', percent: 24 },
        { cause: 'Cure temperature', percent: 16 },
        { cause: 'Expired material', percent: 8 },
      ],
      applicationErrors: [
        { error: 'Surface not properly degreased (solvent wipe skipped)', percent: 35 },
        { error: 'Incorrect hand-mixing ratio', percent: 18 },
        { error: 'Applied at < 18 °C facility temperature', percent: 12 },
      ],
    },
  },
  'henkel/loctite-480': {
    slug: 'loctite-480',
    name: 'Loctite 480',
    manufacturer: 'Henkel',
    manufacturerSlug: 'henkel',
    chemistry: 'Cyanoacrylate (rubber-toughened)',
    specs: {
      viscosity: '110–200 cP',
      fixtureTime: '20–50 s',
      cureTime: '24 h @ 22 °C',
      shearStrength: '20–25 MPa (steel)',
      tempRange: '−54 °C to 82 °C',
      source: 'Manufacturer TDS',
      verified: true,
    },
    performance: {
      totalApplications: 47,
      failureRate: 3.8,
      failureModes: [
        { mode: 'Adhesive', percent: 50 },
        { mode: 'Cohesive', percent: 35 },
        { mode: 'Mixed', percent: 15 },
      ],
      rootCauses: [
        { cause: 'Thermal cycling', percent: 36 },
        { cause: 'Impact/vibration', percent: 28 },
        { cause: 'Surface preparation', percent: 22 },
        { cause: 'Humidity', percent: 14 },
      ],
      applicationErrors: [
        { error: 'Insufficient surface abrasion on smooth substrates', percent: 25 },
        { error: 'Applied in thermal cycling environment beyond spec', percent: 20 },
        { error: 'Over-applied adhesive creating stress concentration', percent: 12 },
      ],
    },
  },
};

// ============================================================================
// Filter Options
// ============================================================================

export const CHEMISTRY_OPTIONS = [
  'Cyanoacrylate',
  'Epoxy (2-part)',
  'Epoxy (paste)',
  'Epoxy (flexible)',
  'Epoxy (clear)',
  'Epoxy (structural)',
  'Epoxy (crash-durable)',
  'MMA (Methacrylate)',
  'Acrylic (2-part)',
  'Acrylic (low-odor)',
  'Hybrid (CA/Epoxy)',
  'Cyanoacrylate (rubber-toughened)',
  'Cyanoacrylate (gap-filling)',
];

export const MANUFACTURER_OPTIONS = [
  '3M',
  'Dow',
  'Henkel',
  'Huntsman',
  'ITW',
  'Parker Lord',
  'Permabond',
  'Sika',
];

export const APPLICATION_OPTIONS = [
  'Automotive',
  'Aerospace',
  'Electronics',
  'Medical Device',
  'Construction',
  'Consumer',
  'Marine',
  'General Manufacturing',
];

// ============================================================================
// API functions (mock for now — swap for real fetch when ready)
// ============================================================================

/**
 * Get filtered product catalog.
 * Only returns products with ≥10 documented applications.
 * Sorted by total applications descending.
 */
export function getProductCatalog(filters?: {
  search?: string;
  chemistry?: string;
  manufacturer?: string;
  application?: string;
}): ProductCatalogItem[] {
  let products = [...MOCK_PRODUCTS]
    .filter(p => p.totalApplications >= 10)
    .sort((a, b) => b.totalApplications - a.totalApplications);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.chemistry.toLowerCase().includes(q)
    );
  }

  if (filters?.chemistry) {
    const chem = filters.chemistry.toLowerCase();
    products = products.filter(p =>
      p.chemistry.toLowerCase().includes(chem)
    );
  }

  if (filters?.manufacturer) {
    products = products.filter(
      p => p.manufacturer === filters.manufacturer
    );
  }

  // Application filter is a placeholder — in production, each product would have
  // application categories in its data. For now, no-op if set.

  return products;
}

/**
 * Get product performance data by manufacturer slug and product slug.
 * Returns null if product not found.
 */
export function getProductPerformance(
  manufacturerSlug: string,
  productSlug: string
): ProductPerformanceData | null {
  const key = `${manufacturerSlug}/${productSlug}`;
  return MOCK_PERFORMANCE[key] || null;
}

/**
 * Get all available manufacturer/slug pairs for static paths.
 */
export function getAllProductPaths(): Array<{ manufacturer: string; slug: string }> {
  return Object.keys(MOCK_PERFORMANCE).map(key => {
    const [manufacturer, slug] = key.split('/');
    return { manufacturer, slug };
  });
}
