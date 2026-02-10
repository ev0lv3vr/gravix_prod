# Gravix V2 Frontend — Implementation Plan

## Project Overview
Build a COMPLETE, production-ready Next.js 14 application for Gravix — an AI-powered industrial materials intelligence platform. Two core products: (1) Failure Analysis Engine, (2) Material Specification Engine.

## Success Criteria
- ✅ Zero placeholder "Coming Soon" pages — every page is fully functional
- ✅ Multi-step forms with actual navigation and validation
- ✅ Results pages render beautifully with mock data
- ✅ TypeScript strict mode — zero `any` types
- ✅ Mobile responsive
- ✅ Proper loading/error/empty states everywhere
- ✅ Ships to production ready

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Data Fetching:** React Query (TanStack Query)
- **Forms:** react-hook-form + zod
- **Auth:** Supabase Auth (client-side)
- **API Client:** Custom API wrapper for FastAPI backend

## Architecture Decisions

### Project Structure
```
/Users/evolve/.openclaw/workspace/gravix-v2/frontend/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (sidebar nav)
│   │   ├── page.tsx                 # Landing page
│   │   ├── (marketing)/
│   │   │   ├── pricing/page.tsx
│   │   │   └── about/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   └── (app)/                   # Protected routes (auth required)
│   │       ├── layout.tsx           # App layout with sidebar
│   │       ├── dashboard/page.tsx
│   │       ├── analyze/
│   │       │   ├── page.tsx         # Multi-step form
│   │       │   └── [id]/page.tsx    # Results page
│   │       ├── specify/
│   │       │   ├── page.tsx         # Multi-step form
│   │       │   └── [id]/page.tsx    # Results page
│   │       ├── history/page.tsx
│   │       ├── cases/
│   │       │   ├── page.tsx         # Browse library
│   │       │   └── [id]/page.tsx    # Case detail
│   │       └── settings/
│   │           ├── page.tsx
│   │           └── billing/page.tsx
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── alert.tsx
│   │   │   └── skeleton.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── forms/
│   │   │   ├── FailureIntakeForm.tsx    # Multi-step wizard
│   │   │   └── SpecIntakeForm.tsx       # Multi-step wizard
│   │   ├── results/
│   │   │   ├── FailureResults.tsx
│   │   │   ├── SpecResults.tsx
│   │   │   └── ConfidenceBar.tsx
│   │   ├── dashboard/
│   │   │   ├── WelcomeCard.tsx
│   │   │   ├── UsageMeter.tsx
│   │   │   └── RecentActivity.tsx
│   │   └── marketing/
│   │       ├── Hero.tsx
│   │       ├── PricingTable.tsx
│   │       ├── FeatureSection.tsx
│   │       └── Testimonials.tsx
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client
│   │   ├── api.ts                   # FastAPI client
│   │   ├── types.ts                 # ALL TypeScript types
│   │   ├── constants.ts             # Material categories, failure modes, etc.
│   │   ├── utils.ts                 # Helper functions
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useAnalyses.ts
│   │       └── useSpecs.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── images/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.js
└── .env.example
```

### Key Design Patterns

**1. Multi-Step Forms**
- Use `useState` for current step tracking
- Zod schemas for each step
- Persist partial form data in React state
- Back/Next navigation with validation
- Progress indicator at top
- Step validation before advancing

**2. API Data Fetching**
- React Query for all async operations
- Custom hooks: `useAnalyses()`, `useSpecs()`, `useCases()`
- Automatic refetching on success
- Loading/error states built-in
- Optimistic updates where applicable

**3. Authentication Flow**
- Supabase client-side auth
- Protected routes via layout middleware
- JWT token stored in httpOnly cookies
- Auto-refresh tokens
- Redirect to login if unauthenticated

**4. Dark Mode**
- Default to dark mode
- Toggle via `next-themes`
- Persist preference in localStorage
- CSS variables for theme colors

**5. Responsive Design**
- Mobile-first approach
- Sidebar collapses to hamburger on mobile
- Tables convert to cards on small screens
- Touch-friendly hit targets (min 44px)

## File Creation Order

### Phase 1: Foundation (Config & Setup)
1. `package.json` — all dependencies
2. `tsconfig.json` — strict TypeScript config
3. `tailwind.config.ts` — design tokens
4. `next.config.ts` — Next.js config
5. `.env.example` — environment variables template
6. `postcss.config.js` — PostCSS plugins

### Phase 2: Core Infrastructure
7. `src/lib/types.ts` — ALL TypeScript interfaces
8. `src/lib/constants.ts` — Material categories, failure modes, etc.
9. `src/lib/utils.ts` — Helper functions (cn, formatters, etc.)
10. `src/lib/supabase.ts` — Supabase client setup
11. `src/lib/api.ts` — FastAPI client wrapper
12. `src/styles/globals.css` — Global styles + CSS variables

### Phase 3: shadcn/ui Components
13-27. All UI primitives in `src/components/ui/`
- Button, Card, Input, Select, Badge, Progress, Tabs, Dialog, Form, Label, Textarea, RadioGroup, Separator, Alert, Skeleton

### Phase 4: Layout Components
28. `src/components/layout/Header.tsx`
29. `src/components/layout/Sidebar.tsx`
30. `src/components/layout/Footer.tsx`
31. `src/components/layout/ThemeToggle.tsx`

### Phase 5: Root Layout
32. `src/app/layout.tsx` — Root layout with providers
33. `src/app/globals.css` — App-level global styles

### Phase 6: Marketing Pages
34. `src/components/marketing/Hero.tsx`
35. `src/components/marketing/PricingTable.tsx`
36. `src/components/marketing/FeatureSection.tsx`
37. `src/components/marketing/Testimonials.tsx`
38. `src/app/page.tsx` — Landing page
39. `src/app/(marketing)/pricing/page.tsx`
40. `src/app/(marketing)/about/page.tsx`

### Phase 7: Auth Pages
41. `src/app/(auth)/login/page.tsx`
42. `src/app/(auth)/signup/page.tsx`
43. `src/app/(auth)/forgot-password/page.tsx`

### Phase 8: Protected App Layout
44. `src/app/(app)/layout.tsx` — App layout with sidebar + auth check

### Phase 9: Dashboard
45. `src/components/dashboard/WelcomeCard.tsx`
46. `src/components/dashboard/UsageMeter.tsx`
47. `src/components/dashboard/RecentActivity.tsx`
48. `src/app/(app)/dashboard/page.tsx`

### Phase 10: Failure Analysis Flow
49. `src/components/forms/FailureIntakeForm.tsx` — Multi-step wizard
50. `src/app/(app)/analyze/page.tsx`
51. `src/components/results/ConfidenceBar.tsx`
52. `src/components/results/FailureResults.tsx`
53. `src/app/(app)/analyze/[id]/page.tsx`

### Phase 11: Spec Request Flow
54. `src/components/forms/SpecIntakeForm.tsx` — Multi-step wizard
55. `src/app/(app)/specify/page.tsx`
56. `src/components/results/SpecResults.tsx`
57. `src/app/(app)/specify/[id]/page.tsx`

### Phase 12: History & Case Library
58. `src/app/(app)/history/page.tsx`
59. `src/app/(app)/cases/page.tsx`
60. `src/app/(app)/cases/[id]/page.tsx`

### Phase 13: Settings & Billing
61. `src/app/(app)/settings/page.tsx`
62. `src/app/(app)/settings/billing/page.tsx`

### Phase 14: React Query Hooks
63. `src/lib/hooks/useAuth.ts`
64. `src/lib/hooks/useAnalyses.ts`
65. `src/lib/hooks/useSpecs.ts`

## Detailed Component Specifications

### Multi-Step Form Pattern (FailureIntakeForm & SpecIntakeForm)

**State Management:**
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<PartialFormData>({});
const totalSteps = 5;
```

**Step Schemas (Zod):**
```typescript
const step1Schema = z.object({
  materialCategory: z.enum(['adhesive', 'sealant', 'coating']),
  materialSubcategory: z.string().min(1, 'Required'),
  // ... other fields
});
```

**Navigation:**
- Back button: `setCurrentStep(prev => prev - 1)` (always enabled except step 1)
- Next button: Validate current step → if valid, advance → if not, show errors
- Progress bar: `(currentStep / totalSteps) * 100`

**Validation Strategy:**
- On "Next": Trigger validation for current step only
- On "Submit": Validate all steps (should already be valid)
- Show inline errors below fields

**Styling:**
- Max width 600px, centered
- Each step slides in from right (optional animation)
- Step titles bold, above each section
- Form fields use shadcn/ui Input, Select, Textarea components

### FailureIntakeForm Steps

**Step 1: Material Information**
- Material Category (radio: adhesive/sealant/coating)
- Material Subcategory (select: cyanoacrylate/epoxy/etc. — filtered by category)
- Material Product Name (optional text input)

**Step 2: Failure Details**
- Failure Mode (select: debonding/cracking/discoloration/etc.)
- Failure Description (textarea, 100-2000 chars)
- Time to Failure (select: <24h, 1-7 days, 1-4 weeks, 1-6 months, >6 months)

**Step 3: Substrates & Environment**
- Substrate A (combobox with autocomplete from common materials)
- Substrate B (combobox)
- Temperature Range (text input, e.g. "-20°C to 80°C")
- Humidity (select: Low <30%, Medium 30-70%, High >70%)
- Chemical Exposure (textarea, optional)

**Step 4: Application Details**
- Application Method (select: manual/bead dispensing/spray/etc.)
- Surface Preparation (textarea, optional)
- Cure Conditions (textarea, optional)

**Step 5: Review & Submit**
- Display all entered data in readonly cards
- "Edit Step X" buttons to go back
- Submit button (primary, calls API)

### SpecIntakeForm Steps

**Step 1: Substrates**
- Substrate A (combobox)
- Substrate B (combobox)

**Step 2: Requirements**
- Shear Strength Required (number input PSI + select: "Not specified" / 500-1000 / 1000-2000 / >2000)
- Tensile Strength (similar)
- Flexibility Required (select: Rigid / Semi-flexible / Flexible)
- Gap Fill (select: <0.5mm / 0.5-2mm / >2mm)

**Step 3: Environment**
- Operating Temperature Min (number input °C)
- Operating Temperature Max (number input °C)
- Humidity Exposure (select)
- Chemical Exposure (textarea, optional)
- UV Exposure (checkbox)

**Step 4: Constraints**
- Max Cure Time (select: <1 min, 1-10 min, 10-60 min, 1-24 hours, >24 hours)
- Cure Method Available (checkboxes: Room temp, Heat, UV)
- Production Volume (select: Prototype, Low <1000/yr, Medium 1000-10k, High >10k)
- Application Method (select)

**Step 5: Review & Submit**
- Same pattern as failure form

### Results Page Mock Data

**FailureResults Mock Response:**
```typescript
const mockFailureResult = {
  id: 'mock-123',
  rootCauses: [
    {
      cause: 'Surface Contamination',
      confidence: 0.85,
      explanation: 'Oil, grease, or other contaminants on substrate surfaces prevent proper wetting...',
      evidence: ['Common with aluminum substrates', 'Adhesive failure pattern typical of contamination']
    },
    {
      cause: 'Thermal Cycling Stress',
      confidence: 0.65,
      explanation: 'Wide temperature range (-20°C to 80°C) creates expansion/contraction mismatch...',
      evidence: ['Dissimilar CTE between aluminum and ABS', 'Failure after 2 weeks suggests fatigue']
    },
    {
      cause: 'Inadequate Surface Preparation',
      confidence: 0.55,
      explanation: 'Aluminum oxide layer may not have been properly treated...',
      evidence: ['No abrasion or etching mentioned', 'Smooth aluminum can be problematic for CA']
    }
  ],
  contributingFactors: [
    'Low humidity environment may have slowed CA cure',
    'Bondline thickness not specified — may be too thick for CA'
  ],
  recommendations: {
    immediate: [
      'Clean both surfaces with isopropyl alcohol (IPA) or acetone',
      'Lightly abrade aluminum with 320-grit sandpaper or Scotch-Brite',
      'Use CA primer on ABS to improve adhesion'
    ],
    longTerm: [
      'Consider switching to rubber-toughened CA for better thermal cycling resistance',
      'Alternative: Use flexible epoxy or polyurethane adhesive for this temperature range',
      'Implement surface cleanliness verification in production'
    ]
  },
  preventionPlan: 'Establish surface prep SOP: (1) Solvent wipe, (2) Abrasion, (3) Final solvent wipe. Verify with water break test. Consider environmental testing for qualification.',
  similarCases: [
    { id: 'case-1', title: 'CA Debonding on Aluminum-ABS Assembly', industry: 'Automotive' },
    { id: 'case-2', title: 'Thermal Cycling Failure in Electronics', industry: 'Electronics' }
  ],
  confidence: 0.85,
  createdAt: new Date().toISOString()
};
```

**SpecResults Mock Response:**
```typescript
const mockSpecResult = {
  id: 'spec-mock-456',
  recommendedSpec: {
    title: 'Structural Epoxy Adhesive',
    chemistry: 'Two-Part Epoxy (Bisphenol A/F)',
    rationale: 'Provides excellent strength, chemical resistance, and thermal stability for stainless steel to polycarbonate bonds.'
  },
  productCharacteristics: {
    viscosity: '5,000-15,000 cP (paste)',
    shearStrength: '3,000-4,500 PSI',
    workingTime: '30-60 minutes',
    cureTime: '24 hours at 25°C (or 1 hour at 60°C)',
    serviceTemperature: '-40°C to 120°C',
    gapFill: 'Excellent (up to 5mm)'
  },
  applicationGuidance: {
    surfacePrep: [
      'Stainless steel: Degrease with IPA, abrade with 180-320 grit, final IPA wipe',
      'Polycarbonate: Degrease with IPA only (avoid abrasion to prevent stress cracking)'
    ],
    applicationTips: [
      'Mix ratio 1:1 by volume — measure accurately',
      'Apply to one surface, press together, clamp if possible',
      'Avoid bondline thicker than 0.5mm for maximum strength'
    ],
    curingNotes: [
      'Room temperature cure: Full strength in 24 hours',
      'Heat cure (60°C): Full strength in 1 hour',
      'Do not disturb bond during first 10 minutes'
    ],
    mistakesToAvoid: [
      'Do not use cyanoacrylate — polycarbonate will craze',
      'Avoid over-tightening clamps — can squeeze out too much adhesive',
      'Do not apply to wet surfaces'
    ]
  },
  warnings: [
    'Polycarbonate is prone to stress cracking with some adhesives — test compatibility',
    'Epoxy has limited gap fill at thin bondlines — ensure good fitment',
    'Exothermic reaction during cure — large volumes may generate heat'
  ],
  alternatives: [
    {
      name: 'Flexible Polyurethane',
      pros: ['Better impact resistance', 'Easier to apply (one-part)'],
      cons: ['Lower shear strength (~2,000 PSI)', 'Slower cure (3-7 days)']
    },
    {
      name: 'Acrylic Adhesive (MMA)',
      pros: ['Fast cure (5-15 min)', 'No mixing required'],
      cons: ['Lower max temp (80°C)', 'Strong odor during cure']
    }
  ],
  createdAt: new Date().toISOString()
};
```

### Design System (Tailwind Config)

**Color Palette:**
```typescript
colors: {
  primary: {
    DEFAULT: '#10b981', // emerald-500
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    DEFAULT: '#f59e0b', // amber-500
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  dark: {
    bg: '#0a0f1e', // Dark navy
    card: '#1e293b', // Slate-800
    border: '#334155', // Slate-700
  }
}
```

**Typography:**
```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
}
```

## TypeScript Types (from spec)

All types defined in `src/lib/types.ts`:

```typescript
// User & Auth
export interface User {
  id: string;
  email: string;
  name?: string;
  company?: string;
  role?: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  analysesThisMonth: number;
  specsThisMonth: number;
  analysesResetDate: string;
  specsResetDate: string;
  stripeCustomerId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Failure Analysis
export interface FailureAnalysis {
  id: string;
  userId: string;
  materialCategory: 'adhesive' | 'sealant' | 'coating';
  materialSubcategory?: string;
  materialProduct?: string;
  failureMode: string;
  failureDescription?: string;
  substrateA?: string;
  substrateB?: string;
  temperatureRange?: string;
  humidity?: string;
  chemicalExposure?: string;
  timeToFailure?: string;
  applicationMethod?: string;
  surfacePreparation?: string;
  cureConditions?: string;
  photos?: string[];
  testResults?: string;
  additionalNotes?: string;
  analysisResult?: any;
  rootCauses?: RootCause[];
  contributingFactors?: string[];
  recommendations?: Recommendations;
  preventionPlan?: string;
  similarCases?: SimilarCase[];
  confidenceScore?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  isPublic: boolean;
  aiModelVersion?: string;
  processingTimeMs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RootCause {
  cause: string;
  confidence: number;
  explanation: string;
  evidence: string[];
}

export interface Recommendations {
  immediate: string[];
  longTerm: string[];
}

export interface SimilarCase {
  id: string;
  title: string;
  industry: string;
}

// Spec Request
export interface SpecRequest {
  id: string;
  userId: string;
  materialCategory: 'adhesive' | 'sealant' | 'coating';
  substrateA: string;
  substrateB: string;
  bondRequirements?: BondRequirements;
  environment?: Environment;
  cureConstraints?: CureConstraints;
  productionVolume?: string;
  applicationMethod?: string;
  additionalRequirements?: string;
  specResult?: any;
  recommendedSpec?: RecommendedSpec;
  productCharacteristics?: ProductCharacteristics;
  applicationGuidance?: ApplicationGuidance;
  warnings?: string[];
  alternatives?: Alternative[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  aiModelVersion?: string;
  processingTimeMs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BondRequirements {
  shearStrength?: string;
  tensileStrength?: string;
  flexibility?: string;
  gapFill?: string;
}

export interface Environment {
  tempMin?: number;
  tempMax?: number;
  humidity?: string;
  chemicals?: string;
  uvExposure?: boolean;
}

export interface CureConstraints {
  maxTime?: string;
  method?: string[];
  heatAvailable?: boolean;
  uvAvailable?: boolean;
}

export interface RecommendedSpec {
  title: string;
  chemistry: string;
  rationale: string;
}

export interface ProductCharacteristics {
  viscosity: string;
  shearStrength: string;
  workingTime: string;
  cureTime: string;
  serviceTemperature: string;
  gapFill: string;
}

export interface ApplicationGuidance {
  surfacePrep: string[];
  applicationTips: string[];
  curingNotes: string[];
  mistakesToAvoid: string[];
}

export interface Alternative {
  name: string;
  pros: string[];
  cons: string[];
}

// Case Library
export interface Case {
  id: string;
  sourceAnalysisId?: string;
  title: string;
  summary?: string;
  materialCategory: string;
  materialSubcategory?: string;
  failureMode: string;
  rootCause?: string;
  contributingFactors?: string[];
  solution?: string;
  preventionTips?: string;
  lessonsLearned?: string;
  industry?: string;
  applicationType?: string;
  tags?: string[];
  views: number;
  helpfulVotes: number;
  isFeatured: boolean;
  slug?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Material (reference data)
export interface Material {
  id: string;
  category: 'adhesive' | 'sealant' | 'coating';
  subcategory: string;
  name: string;
  description?: string;
  properties?: any;
  compatibleSubstrates?: string[];
  incompatibleSubstrates?: string[];
  commonFailureModes?: string[];
  applicationGuidelines?: string;
  typicalApplications?: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Constants (Material Categories, Failure Modes, etc.)

`src/lib/constants.ts`:

```typescript
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
```

## API Client (`src/lib/api.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { FailureAnalysis, SpecRequest, Case } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private async getAuthHeaders() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    };
  }

  // Failure Analysis
  async createFailureAnalysis(data: Partial<FailureAnalysis>): Promise<FailureAnalysis> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create analysis');
    return response.json();
  }

  async getFailureAnalysis(id: string): Promise<FailureAnalysis> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch analysis');
    return response.json();
  }

  async listFailureAnalyses(): Promise<FailureAnalysis[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze`, { headers });
    if (!response.ok) throw new Error('Failed to fetch analyses');
    return response.json();
  }

  // Spec Requests
  async createSpecRequest(data: Partial<SpecRequest>): Promise<SpecRequest> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/specify`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create spec');
    return response.json();
  }

  async getSpecRequest(id: string): Promise<SpecRequest> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/specify/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch spec');
    return response.json();
  }

  async listSpecRequests(): Promise<SpecRequest[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/specify`, { headers });
    if (!response.ok) throw new Error('Failed to fetch specs');
    return response.json();
  }

  // Case Library
  async listCases(filters?: { materialCategory?: string; failureMode?: string }): Promise<Case[]> {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${API_URL}/cases?${params}`);
    if (!response.ok) throw new Error('Failed to fetch cases');
    return response.json();
  }

  async getCase(id: string): Promise<Case> {
    const response = await fetch(`${API_URL}/cases/${id}`);
    if (!response.ok) throw new Error('Failed to fetch case');
    return response.json();
  }

  // User
  async getCurrentUser() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me`, { headers });
    if (!response.ok) return null;
    return response.json();
  }

  // PDF Download
  getAnalysisPdfUrl(id: string): string {
    return `${API_URL}/reports/analysis/${id}/pdf`;
  }

  getSpecPdfUrl(id: string): string {
    return `${API_URL}/reports/spec/${id}/pdf`;
  }
}

export const api = new ApiClient();
```

## Risk Assessment & Edge Cases

### Risks
1. **Multi-step form abandonment** — Mitigation: Save partial progress in localStorage
2. **API timeouts (15s for AI)** — Mitigation: Show loading states, allow retry
3. **Free tier abuse** — Mitigation: Usage tracking enforced server-side
4. **Mobile form UX** — Mitigation: Single-column layout, large touch targets
5. **Type safety gaps** — Mitigation: Strict TypeScript, no `any` types

### Edge Cases to Handle
- **Empty states:** No analyses yet, no specs yet, no cases in library
- **Error states:** API failure, network timeout, validation errors
- **Loading states:** Initial page load, form submission, data fetching
- **Quota exceeded:** Show upgrade modal when user hits plan limit
- **Expired session:** Redirect to login with return URL
- **Missing env vars:** Graceful error in development
- **Long text overflow:** Truncate with "Read more" or scroll containers
- **Image upload failures:** Validate size/format client-side, show progress

## Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@tanstack/react-query": "^5.56.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.454.0",
    "next-themes": "^0.3.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

## Environment Variables (.env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics, etc.
# NEXT_PUBLIC_GA_ID=
```

## Build & Deployment

**Development:**
```bash
npm install
npm run dev
```

**Production Build:**
```bash
npm run build
npm run start
```

**Vercel Deployment:**
- Auto-deploy on push to `main`
- Environment variables set in Vercel dashboard
- Preview deployments for PRs

## Next Steps (After Plan Approval)

1. **Phase 2:** Get this plan reviewed by a staff engineer sub-agent
2. **Phase 3:** Build all components in order listed above
3. **Phase 4:** Code review by staff engineer sub-agent
4. **Phase 5:** Verify — TypeScript check, test all pages, check responsive design
5. **Phase 6:** Deploy to Vercel, verify live deployment

---

**Plan Status:** ✅ COMPLETE — Ready for review
