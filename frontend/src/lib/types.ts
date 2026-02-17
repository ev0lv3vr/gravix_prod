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
  analysesResetDate: string | null;
  specsResetDate: string | null;
  stripeCustomerId?: string;
  avatarUrl?: string;
  createdAt: string | null;
  updatedAt: string | null;
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

// API recommendation format (with priority field)
export interface ApiRecommendation {
  title?: string;
  description?: string;
  priority?: 'immediate' | 'short_term' | 'long_term';
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

// History page types
export interface HistoryItem {
  id: string;
  type: 'spec' | 'failure';
  status: string;
  date?: string;
  substrates: string;
  confidenceScore?: number | null;
  title?: string;
  result?: string;
  createdAt?: string | null;
  outcome?: null;
  pdfAvailable?: boolean;
}

// Case filters
export interface CaseFilters {
  materialCategory?: string;
  failureMode?: string;
  industry?: string;
  search?: string;
}

// Alternative spec (parsed from API)
export interface ParsedAlternative {
  name: string;
  pros: string[];
  cons: string[];
}

// API response types (snake_case from backend)
// Visual analysis result from API
export interface ApiVisualAnalysisResult {
  image_url: string;
  failure_mode?: string;
  confidence?: number;
  description?: string;
}

// TDS compliance item from API
export interface ApiTDSComplianceItem {
  parameter: string;
  actual: string;
  spec: string;
  status: 'violation' | 'pass' | 'warning';
}

// Known risk data from API
export interface ApiKnownRiskData {
  product_name: string;
  substrate_pair: string;
  total_failures: number;
  failure_rate: number;
  most_common_cause: string;
  common_cause_percent: number;
  typical_time_to_failure?: string;
  alternatives?: Array<{
    name: string;
    failure_rate: number;
    case_count: number;
  }>;
  linked_cases?: Array<{
    id: string;
    title: string;
    outcome?: string;
  }>;
}

export interface ApiFailureAnalysisResponse {
  id: string;
  root_causes?: RootCause[];
  rootCauses?: RootCause[];
  contributing_factors?: string[];
  contributingFactors?: string[];
  recommendations?: ApiRecommendation[] | Recommendations;
  prevention_plan?: string;
  preventionPlan?: string;
  confidence_score?: number;
  confidenceScore?: number;
  similar_cases?: SimilarCase[];
  similarCases?: SimilarCase[];
  knowledge_evidence_count?: number;
  knowledgeEvidenceCount?: number;
  // Phase 3: visual analysis and TDS compliance
  visual_analysis?: ApiVisualAnalysisResult[];
  visualAnalysis?: ApiVisualAnalysisResult[];
  tds_compliance?: {
    product_name: string;
    items: ApiTDSComplianceItem[];
  };
  tdsCompliance?: {
    product_name: string;
    items: ApiTDSComplianceItem[];
  };
}

export interface ApiSpecResponse {
  id: string;
  recommended_spec?: RecommendedSpec;
  recommendedSpec?: RecommendedSpec;
  product_characteristics?: ProductCharacteristics;
  productCharacteristics?: ProductCharacteristics;
  application_guidance?: ApplicationGuidance | ApiApplicationGuidance;
  applicationGuidance?: ApplicationGuidance | ApiApplicationGuidance;
  warnings?: string[];
  alternatives?: Alternative[] | ApiAlternative[];
  confidence_score?: number;
  confidenceScore?: number;
  knowledge_evidence_count?: number;
  knowledgeEvidenceCount?: number;
  // Phase 3: known risks
  known_risks?: string[];
  knownRisks?: string[];
  known_risk_data?: ApiKnownRiskData;
  knownRiskData?: ApiKnownRiskData;
}

export interface ApiApplicationGuidance {
  surface_prep?: string[];
  surfacePrep?: string[];
  application_tips?: string[];
  applicationTips?: string[];
  curing_notes?: string[];
  curingNotes?: string[];
  mistakes_to_avoid?: string[];
  mistakesToAvoid?: string[];
}

export interface ApiAlternative {
  name: string;
  pros: string[];
  cons: string[];
}
