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
  analysisResult?: Record<string, unknown>;
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
  specResult?: Record<string, unknown>;
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
  properties?: Record<string, unknown>;
  compatibleSubstrates?: string[];
  incompatibleSubstrates?: string[];
  commonFailureModes?: string[];
  applicationGuidelines?: string;
  typicalApplications?: string[];
  createdAt: string;
  updatedAt: string;
}

// Form data types (partial, for multi-step forms)
export interface FailureAnalysisFormData {
  // Step 1
  materialCategory?: 'adhesive' | 'sealant' | 'coating';
  materialSubcategory?: string;
  materialProduct?: string;
  // Step 2
  failureMode?: string;
  failureDescription?: string;
  timeToFailure?: string;
  // Step 3
  substrateA?: string;
  substrateB?: string;
  temperatureRange?: string;
  humidity?: string;
  chemicalExposure?: string;
  // Step 4
  applicationMethod?: string;
  surfacePreparation?: string;
  cureConditions?: string;
}

export interface SpecRequestFormData {
  // Step 1
  substrateA?: string;
  substrateB?: string;
  // Step 2
  shearStrength?: string;
  tensileStrength?: string;
  flexibility?: string;
  gapFill?: string;
  // Step 3
  tempMin?: number;
  tempMax?: number;
  humidity?: string;
  chemicals?: string;
  uvExposure?: boolean;
  // Step 4
  maxTime?: string;
  cureMethods?: string[];
  heatAvailable?: boolean;
  uvAvailable?: boolean;
  productionVolume?: string;
  applicationMethod?: string;
}
