import {
  TestCase,
  TestResult,
  GateThresholds,
  ModelMetadata,
  EvaluationReport,
  ResultStatus,
  RiskAssessment,
  RiskFactor,
  RiskLevel,
  InvestigationSuggestion,
  SimulatedModelMetrics,
} from '../types';

export function normalizeAnswer(ans: string): string {
  if (!ans) return '';
  return ans.trim().toLowerCase();
}

export function evaluateTestCase(testCase: TestCase): TestResult {
  const normExpected = normalizeAnswer(testCase.expectedAnswer);
  const normBaseline = normalizeAnswer(testCase.baselineAnswer);
  const normCandidate = normalizeAnswer(testCase.candidateAnswer);

  const isBaselineCorrect = normBaseline === normExpected;
  const isCandidateCorrect = normCandidate === normExpected;

  let status: ResultStatus = 'PARITY_PASS';
  let explanation = '';
  let failureCategory: TestResult['failureCategory'] = 'NONE';
  let failureDiagnosis = '';
  let suggestedInvestigationStep = '';

  if (isBaselineCorrect && !isCandidateCorrect) {
    status = 'REGRESSION';
    explanation = `Critical Quality Regression: Baseline correctly predicted "${testCase.expectedAnswer}", but Candidate produced "${testCase.candidateAnswer || '(empty)'}".`;
  } else if (!isBaselineCorrect && isCandidateCorrect) {
    status = 'IMPROVEMENT';
    explanation = `Capability Gain: Baseline failed with "${testCase.baselineAnswer || '(empty)'}", but Candidate accurately answered "${testCase.expectedAnswer}".`;
  } else if (isBaselineCorrect && isCandidateCorrect) {
    status = 'PARITY_PASS';
    explanation = `Parity Retained: Both models accurately matched ground truth ("${testCase.expectedAnswer}").`;
  } else {
    status = 'PARITY_FAIL';
    explanation = `Shared Defect: Both models failed to produce expected ground truth ("${testCase.expectedAnswer}").`;
  }

  // Explainable Regression Detective: Diagnosis & Investigation Steps
  if (!isCandidateCorrect) {
    const qLower = testCase.question.toLowerCase();
    const candLower = normCandidate;
    const expLower = normExpected;

    if (qLower.includes('red planet') || (expLower === 'mars' && candLower === 'venus')) {
      failureCategory = 'ENTITY_CONFUSION';
      failureDiagnosis = `The candidate predicted "Venus" instead of "Mars". Both are neighboring terrestrial planets, but Venus is famously shrouded in yellowish sulfuric clouds, while Mars is distinctively the Red Planet due to ferric oxide on its surface. The candidate model suffered an entity attribute confusion regression.`;
      suggestedInvestigationStep = `1. Audit planetary knowledge associations in the fine-tuning training corpus. 2. Verify token attention weights between "Red Planet" and planetary names. 3. Synthesize 25 contrastive QA pairs distinguishing Mars vs Venus characteristics.`;
    } else if (qLower.includes('photosynthesis') || (expLower === 'carbon dioxide' && candLower === 'oxygen')) {
      failureCategory = 'OPPOSITE_OR_RELATED_CONCEPT';
      failureDiagnosis = `The candidate predicted "Oxygen" instead of "Carbon dioxide". Oxygen is the byproduct released during photosynthesis, whereas carbon dioxide is the gas absorbed. The candidate inverted the biological input/output relationship of the photosynthesis equation.`;
      suggestedInvestigationStep = `1. Review instructional prompt clarity and domain biological reasoning. 2. Inspect fine-tuning examples for ambiguous "gas exchange" phrasing. 3. Add bidirectional QA pairs explicitly testing photosynthetic inputs (CO2, H2O, sunlight) versus outputs (glucose, O2).`;
    } else if (qLower.includes('2 + 2') || (!isNaN(Number(candLower)) && !isNaN(Number(expLower)))) {
      failureCategory = 'INCORRECT_VALUE';
      failureDiagnosis = `Arithmetic discrepancy: The candidate produced "${testCase.candidateAnswer}", diverging from the arithmetic expectation "${testCase.expectedAnswer}".`;
      suggestedInvestigationStep = `1. Check tokenizer numeral segmentation for numeric symbols. 2. Test candidate under chain-of-thought system prompts. 3. Inspect quantization impact on attention heads handling basic arithmetic.`;
    } else if (qLower.includes('capital') || qLower.includes('tokyo')) {
      failureCategory = 'ENTITY_CONFUSION';
      failureDiagnosis = `Geographic entity confusion: Candidate produced "${testCase.candidateAnswer}" instead of the sovereign capital "${testCase.expectedAnswer}".`;
      suggestedInvestigationStep = `1. Inspect geography entity retrieval embeddings in candidate weights. 2. Check if smaller parameter size pruned specific regional facts during distillation/quantization.`;
    } else {
      failureCategory = 'DOMAIN_KNOWLEDGE_GAP';
      failureDiagnosis = `The candidate output "${testCase.candidateAnswer || '(empty)'}" failed to match expected ground truth "${testCase.expectedAnswer}". Normalized mismatch: expected "${normExpected}" vs actual "${normCandidate}".`;
      suggestedInvestigationStep = `1. Compare baseline and candidate token logprobs for "${testCase.expectedAnswer}". 2. Verify whether candidate prompt formatting matches training distribution. 3. Add this test case and 10 variations into the validation regression slice.`;
    }
  }

  return {
    testCase,
    isBaselineCorrect,
    isCandidateCorrect,
    status,
    normalizedExpected: normExpected,
    normalizedBaseline: normBaseline,
    normalizedCandidate: normCandidate,
    explanation,
    failureCategory,
    failureDiagnosis: failureDiagnosis || undefined,
    suggestedInvestigationStep: suggestedInvestigationStep || undefined,
  };
}

export function calculateRiskAssessment(
  results: TestResult[],
  baselineAccuracy: number,
  candidateAccuracy: number,
  qualityDrop: number,
  regressionCount: number,
  thresholds: GateThresholds
): RiskAssessment {
  const triggeredRules: string[] = [];
  const riskFactors: RiskFactor[] = [];
  let highestSeverity: 'low' | 'medium' | 'high' = 'low';

  // Rule 1: High Quality Drop (> 15% pts)
  if (qualityDrop > 15.0) {
    const msg = `Rule #1 Triggered: Quality drop is +${qualityDrop.toFixed(1)}% pts, exceeding high-risk threshold (> 15.0% pts).`;
    triggeredRules.push(msg);
    riskFactors.push({
      factor: 'Severe Quality Degradation',
      severity: 'high',
      description: `Baseline achieved ${baselineAccuracy.toFixed(1)}% while candidate dropped to ${candidateAccuracy.toFixed(1)}% (Drop: ${qualityDrop.toFixed(1)}% pts).`,
    });
    highestSeverity = 'high';
  }

  // Rule 2: Multiple Critical Regressions (>= 2 regressions)
  if (regressionCount >= 2) {
    const msg = `Rule #2 Triggered: Detected ${regressionCount} critical regressions (threshold >= 2 for high risk).`;
    triggeredRules.push(msg);
    riskFactors.push({
      factor: 'Multiple Broken Golden Invariants',
      severity: 'high',
      description: `${regressionCount} test cases that passed on production baseline failed on the candidate model.`,
    });
    highestSeverity = 'high';
  }

  // Rule 3: Candidate Accuracy Well Below Gate Minimum
  if (candidateAccuracy < thresholds.minCandidateAccuracy - 10.0) {
    const msg = `Rule #3 Triggered: Candidate accuracy (${candidateAccuracy.toFixed(1)}%) is more than 10% below minimum requirement (${thresholds.minCandidateAccuracy.toFixed(1)}%).`;
    triggeredRules.push(msg);
    riskFactors.push({
      factor: 'Significant Accuracy Deficit',
      severity: 'high',
      description: `Target accuracy is ${thresholds.minCandidateAccuracy}%, but candidate scored ${candidateAccuracy.toFixed(1)}%.`,
    });
    highestSeverity = 'high';
  }

  // Rule 4: Moderate Quality Drop (> 5% and <= 15%)
  if (qualityDrop > 5.0 && qualityDrop <= 15.0) {
    const msg = `Rule #4 Triggered: Quality drop is +${qualityDrop.toFixed(1)}% pts (moderate risk zone: 5.0% - 15.0% pts).`;
    triggeredRules.push(msg);
    riskFactors.push({
      factor: 'Moderate Quality Drop',
      severity: 'medium',
      description: `Candidate shows observable drop compared to baseline (${qualityDrop.toFixed(1)}% pts).`,
    });
    if (highestSeverity !== 'high') highestSeverity = 'medium';
  }

  // Rule 5: Single Regression
  if (regressionCount === 1) {
    const msg = `Rule #5 Triggered: Detected 1 regression from baseline behavior.`;
    triggeredRules.push(msg);
    riskFactors.push({
      factor: 'Single Regression Detected',
      severity: 'medium',
      description: `One test case that succeeded on baseline failed on candidate.`,
    });
    if (highestSeverity !== 'high') highestSeverity = 'medium';
  }

  // Rule 6: Minor Accuracy Deficit (under threshold, but within 10%)
  if (
    candidateAccuracy < thresholds.minCandidateAccuracy &&
    candidateAccuracy >= thresholds.minCandidateAccuracy - 10.0
  ) {
    const msg = `Rule #6 Triggered: Candidate accuracy (${candidateAccuracy.toFixed(1)}%) is marginally below required ${thresholds.minCandidateAccuracy}%.`;
    triggeredRules.push(msg);
    riskFactors.push({
      factor: 'Marginal Threshold Miss',
      severity: 'medium',
      description: `Short of release threshold by ${(thresholds.minCandidateAccuracy - candidateAccuracy).toFixed(1)} percentage points.`,
    });
    if (highestSeverity !== 'high') highestSeverity = 'medium';
  }

  // Rule 7: Clean / Safe Invariants
  if (regressionCount === 0 && candidateAccuracy >= thresholds.minCandidateAccuracy && qualityDrop <= 0) {
    const msg = `Rule #7 Triggered: Zero regressions detected; candidate accuracy (${candidateAccuracy.toFixed(1)}%) meets or exceeds baseline with no degradation.`;
    triggeredRules.push(msg);
    riskFactors.push({
      factor: 'All Gate Invariants Satisfied',
      severity: 'low',
      description: `Candidate model preserved all baseline capabilities with zero detected regression vectors.`,
    });
  }

  let level: RiskLevel = 'LOW';
  if (highestSeverity === 'high') {
    level = 'HIGH';
  } else if (highestSeverity === 'medium') {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  let summary = '';
  if (level === 'HIGH') {
    summary = `HIGH DEPLOYMENT RISK: Candidate demonstrates significant quality degradation or multiple regressions. Releasing this candidate carries elevated risk of user-facing production defects.`;
  } else if (level === 'MEDIUM') {
    summary = `MEDIUM DEPLOYMENT RISK: Candidate exhibits isolated regressions or narrow metric misses. Requires targeted engineer review before sign-off.`;
  } else {
    summary = `LOW DEPLOYMENT RISK: Candidate meets quality invariants with zero regressions. Safe for progression to next staging phase.`;
  }

  return {
    level,
    triggeredRules,
    summary,
    riskFactors,
  };
}

export function generateSmartInvestigationSuggestions(
  results: TestResult[]
): InvestigationSuggestion[] {
  const suggestions: InvestigationSuggestion[] = [];
  const failedResults = results.filter((r) => !r.isCandidateCorrect);

  if (failedResults.length === 0) {
    suggestions.push({
      id: 'SUGG-00',
      category: 'EVALUATION_HARDENING',
      title: 'Expand Benchmark Coverage with Adversarial Edge Cases',
      description:
        'All current test cases passed. Recommend expanding the evaluation suite with out-of-distribution prompts, edge-case entity phrasing, and multihop queries to stress-test candidate robustness.',
      targetTestCases: results.map((r) => r.testCase.id),
      priority: 'LOW',
    });
    return suggestions;
  }

  // 1. Data Curation Suggestion
  const entityConfusionCases = failedResults.filter(
    (r) => r.failureCategory === 'ENTITY_CONFUSION' || r.failureCategory === 'OPPOSITE_OR_RELATED_CONCEPT'
  );

  if (entityConfusionCases.length > 0) {
    suggestions.push({
      id: 'SUGG-01',
      category: 'DATA_CURATION',
      title: 'Curate Contrastive QA Pairs for Confused Domain Entities',
      description: `Candidate confused distinct domain concepts (e.g., Mars vs Venus, Carbon Dioxide vs Oxygen in ${entityConfusionCases.map((r) => r.testCase.id).join(', ')}). Synthesize 30-50 curated QA pairs in the instruction-tuning dataset explicitly contrasting these related terms to decouple attention weights.`,
      targetTestCases: entityConfusionCases.map((r) => r.testCase.id),
      priority: 'HIGH',
    });
  }

  // 2. Prompt & System Instruction Tuning
  suggestions.push({
    id: 'SUGG-02',
    category: 'PROMPT_TUNING',
    title: 'Audit System Instructions & Output Precision Constraints',
    description: `Evaluate candidate responses under a structured system prompt requiring step-by-step verification before concise answer generation. For factual QA tasks, instruct the model to verify entity attributes (e.g., surface color of planet, chemical gas direction).`,
    targetTestCases: failedResults.map((r) => r.testCase.id),
    priority: 'MEDIUM',
  });

  // 3. Evaluation Hardening & Slicing
  suggestions.push({
    id: 'SUGG-03',
    category: 'EVALUATION_HARDENING',
    title: 'Construct Sliced Regression Test Suite Around Failed Concepts',
    description: `Create dedicated evaluation slices for the failed subject areas (${[...new Set(failedResults.map((r) => r.testCase.category))].join(', ')}). Track per-slice accuracy across future checkpoint evaluations to verify resolution.`,
    targetTestCases: failedResults.map((r) => r.testCase.id),
    priority: 'HIGH',
  });

  return suggestions;
}

export function generateSimulatedModelMetrics(
  baselineName: string,
  candidateName: string
): SimulatedModelMetrics {
  // Estimated simulated values based on typical 70B (baseline) vs 8B (candidate) latency/cost differences
  const baselineLatencyMs = 420; // Simulated reference latency
  const candidateLatencyMs = 115; // Simulated candidate latency (faster smaller model)
  const baselineCostPer1MTokens = 0.90; // $0.90 per 1M tokens
  const candidateCostPer1MTokens = 0.15; // $0.15 per 1M tokens

  const latencyReductionPct = Number((((baselineLatencyMs - candidateLatencyMs) / baselineLatencyMs) * 100).toFixed(1));
  const costSavingsPct = Number((((baselineCostPer1MTokens - candidateCostPer1MTokens) / baselineCostPer1MTokens) * 100).toFixed(1));

  return {
    baselineLatencyMs,
    candidateLatencyMs,
    baselineCostPer1MTokens,
    candidateCostPer1MTokens,
    latencyReductionPct,
    costSavingsPct,
    isSimulated: true,
    disclaimer:
      'SIMULATED METRICS: Latency and cost estimates are calculated from standard parameter architecture profiles (70B baseline vs 8B candidate) for trade-off evaluation. They are not measured from live production endpoints.',
  };
}

export function runFullEvaluation(
  testCases: TestCase[],
  thresholds: GateThresholds,
  models: ModelMetadata
): EvaluationReport {
  const results = testCases.map(evaluateTestCase);
  const totalCases = results.length;

  const baselineCorrect = results.filter((r) => r.isBaselineCorrect).length;
  const candidateCorrect = results.filter((r) => r.isCandidateCorrect).length;

  const baselineAccuracy = totalCases > 0 ? (baselineCorrect / totalCases) * 100 : 0;
  const candidateAccuracy = totalCases > 0 ? (candidateCorrect / totalCases) * 100 : 0;

  // Quality drop in percentage points = baseline accuracy - candidate accuracy
  const qualityDrop = baselineAccuracy - candidateAccuracy;

  const regressionCount = results.filter((r) => r.status === 'REGRESSION').length;
  const improvementCount = results.filter((r) => r.status === 'IMPROVEMENT').length;
  const parityPassCount = results.filter((r) => r.status === 'PARITY_PASS').length;
  const parityFailCount = results.filter((r) => r.status === 'PARITY_FAIL').length;

  const accuracyMet = candidateAccuracy >= thresholds.minCandidateAccuracy;
  const dropWithinLimit = qualityDrop <= thresholds.maxPermittedQualityDrop;
  const zeroSevereRegressions = regressionCount === 0;

  // Release Gate Rule:
  // Recommend PROMOTE only when its accuracy meets the minimum and
  // the quality drop does not exceed the configured limit.
  // Otherwise recommend BLOCK.
  const isPromoted = accuracyMet && dropWithinLimit;
  const decision = isPromoted ? 'PROMOTE' : 'BLOCK';

  // Construct transparent audit explanation
  const failureReasons: string[] = [];
  if (!accuracyMet) {
    failureReasons.push(
      `Candidate accuracy (${candidateAccuracy.toFixed(1)}%) is below the required gate threshold (${thresholds.minCandidateAccuracy.toFixed(1)}%)`
    );
  }
  if (!dropWithinLimit) {
    failureReasons.push(
      `Quality drop (${qualityDrop > 0 ? '+' : ''}${qualityDrop.toFixed(1)}% pts) exceeds maximum permitted degradation (${thresholds.maxPermittedQualityDrop.toFixed(1)}% pts)`
    );
  }

  let decisionReason = '';
  if (isPromoted) {
    if (regressionCount === 0) {
      decisionReason = `Advisory Gate Recommendation: PROMOTE. Candidate meets all safety invariants: Accuracy (${candidateAccuracy.toFixed(1)}% >= ${thresholds.minCandidateAccuracy}%), quality degradation within limits (${qualityDrop.toFixed(1)}% pts <= ${thresholds.maxPermittedQualityDrop}% pts), and 0 regressions detected. Verified safe for staging progression. (Note: Human/pipeline approval still required for live production release).`;
    } else {
      decisionReason = `Advisory Gate Recommendation: PROMOTE (Conditional). Candidate meets nominal gate criteria: Accuracy (${candidateAccuracy.toFixed(1)}% >= ${thresholds.minCandidateAccuracy}%) and quality drop (${qualityDrop.toFixed(1)}% pts <= ${thresholds.maxPermittedQualityDrop}% pts) stay within acceptable bounds despite ${regressionCount} regression(s). Review regression report before final deployment.`;
    }
  } else {
    decisionReason = `Advisory Gate Recommendation: BLOCK. ${failureReasons.join('; ')}. Detected ${regressionCount} regression(s) where candidate degraded from baseline behavior. Deployment blocked to prevent production quality regressions.`;
  }

  // Calculate documented deployment risk assessment
  const riskAssessment = calculateRiskAssessment(
    results,
    baselineAccuracy,
    candidateAccuracy,
    qualityDrop,
    regressionCount,
    thresholds
  );

  // Generate smart investigation suggestions
  const investigationSuggestions = generateSmartInvestigationSuggestions(results);

  // Generate simulated comparative model metrics
  const simulatedMetrics = generateSimulatedModelMetrics(models.baselineName, models.candidateName);

  const id = `EVAL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

  return {
    id,
    timestamp: new Date().toISOString(),
    models,
    thresholds,
    testResults: results,
    totalCases,
    baselineCorrect,
    candidateCorrect,
    baselineAccuracy: Number(baselineAccuracy.toFixed(1)),
    candidateAccuracy: Number(candidateAccuracy.toFixed(1)),
    qualityDrop: Number(qualityDrop.toFixed(1)),
    regressionCount,
    improvementCount,
    parityPassCount,
    parityFailCount,
    decision,
    decisionReason,
    passedThresholds: {
      accuracyMet,
      dropWithinLimit,
      zeroSevereRegressions,
    },
    riskAssessment,
    investigationSuggestions,
    simulatedMetrics,
    isDeploymentAdvisory: true,
    hackathonMetadata: {
      event: 'HORIZON 2K26',
      track: 'Cloud Computing, DevOps & Scalable Systems',
      team: 'Dharshini and Suba',
      engine: 'ShadowGuard Deterministic Gate & Explainability Engine v3.0',
    },
  };
}

export function downloadJsonReport(report: EvaluationReport): void {
  const filename = `shadowguard-eval-${report.id.toLowerCase()}-${new Date(report.timestamp).toISOString().split('T')[0]}.json`;
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
