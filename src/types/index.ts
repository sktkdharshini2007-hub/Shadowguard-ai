export type EvaluationDecision = 'PROMOTE' | 'BLOCK';

export type ResultStatus = 'REGRESSION' | 'IMPROVEMENT' | 'PARITY_PASS' | 'PARITY_FAIL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TestCase {
  id: string;
  category: string;
  question: string;
  expectedAnswer: string;
  baselineAnswer: string;
  candidateAnswer: string;
  notes?: string;
}

export interface TestResult {
  testCase: TestCase;
  isBaselineCorrect: boolean;
  isCandidateCorrect: boolean;
  status: ResultStatus;
  normalizedExpected: string;
  normalizedBaseline: string;
  normalizedCandidate: string;
  explanation: string;
  failureCategory?: 'ENTITY_CONFUSION' | 'INCORRECT_VALUE' | 'OPPOSITE_OR_RELATED_CONCEPT' | 'DOMAIN_KNOWLEDGE_GAP' | 'NONE';
  failureDiagnosis?: string;
  suggestedInvestigationStep?: string;
}

export interface GateThresholds {
  minCandidateAccuracy: number; // e.g. 80 (percentage)
  maxPermittedQualityDrop: number; // e.g. 10 (percentage points)
}

export interface ModelMetadata {
  baselineName: string;
  baselineVersion?: string;
  candidateName: string;
  candidateVersion?: string;
  datasetName: string;
  environment?: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  triggeredRules: string[];
  summary: string;
  riskFactors: RiskFactor[];
}

export interface InvestigationSuggestion {
  id: string;
  category: 'DATA_CURATION' | 'PROMPT_TUNING' | 'EVALUATION_HARDENING';
  title: string;
  description: string;
  targetTestCases: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SimulatedModelMetrics {
  baselineLatencyMs: number;
  candidateLatencyMs: number;
  baselineCostPer1MTokens: number;
  candidateCostPer1MTokens: number;
  latencyReductionPct: number;
  costSavingsPct: number;
  isSimulated: true;
  disclaimer: string;
}

export interface EvaluationReport {
  id: string;
  timestamp: string; // ISO format
  models: ModelMetadata;
  thresholds: GateThresholds;
  testResults: TestResult[];
  totalCases: number;
  baselineCorrect: number;
  candidateCorrect: number;
  baselineAccuracy: number; // 0 - 100
  candidateAccuracy: number; // 0 - 100
  qualityDrop: number; // baselineAccuracy - candidateAccuracy (percentage points)
  regressionCount: number;
  improvementCount: number;
  parityPassCount: number;
  parityFailCount: number;
  decision: EvaluationDecision;
  decisionReason: string;
  passedThresholds: {
    accuracyMet: boolean;
    dropWithinLimit: boolean;
    zeroSevereRegressions: boolean;
  };
  riskAssessment: RiskAssessment;
  investigationSuggestions: InvestigationSuggestion[];
  simulatedMetrics: SimulatedModelMetrics;
  isDeploymentAdvisory: boolean;
  isDemoSeeded?: boolean;
  hackathonMetadata: {
    event: string;
    track: string;
    team: string;
    engine: string;
  };
}

export type ActiveTab = 'dashboard' | 'new-evaluation' | 'regression-analysis' | 'history' | 'settings';
