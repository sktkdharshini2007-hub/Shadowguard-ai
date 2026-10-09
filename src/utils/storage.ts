import { EvaluationReport } from '../types';
import {
  DEFAULT_TEST_CASES,
  DEFAULT_THRESHOLDS,
  DEFAULT_MODELS,
  PRESET_SAFE_CANDIDATE,
  PRESET_REGRESSION_DETECTED,
} from '../data/defaultTestCases';
import { runFullEvaluation } from './evaluator';

const STORAGE_KEY = 'shadowguard_eval_history_v3';
const ACTIVE_REPORT_KEY = 'shadowguard_active_report_v3';

export function getSavedReports(): EvaluationReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = generateInitialSeedHistory();
      saveReports(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate schema has riskAssessment; re-evaluate if older schema
      const validated = parsed.map((item) => {
        if (!item.riskAssessment || !item.simulatedMetrics) {
          const testCases = item.testResults ? item.testResults.map((r: any) => r.testCase) : DEFAULT_TEST_CASES;
          const reevaluated = runFullEvaluation(
            testCases,
            item.thresholds || DEFAULT_THRESHOLDS,
            item.models || DEFAULT_MODELS
          );
          reevaluated.id = item.id;
          reevaluated.timestamp = item.timestamp;
          reevaluated.isDemoSeeded = item.isDemoSeeded ?? true;
          return reevaluated;
        }
        return item;
      });
      return validated;
    }
    const seeded = generateInitialSeedHistory();
    saveReports(seeded);
    return seeded;
  } catch (err) {
    console.error('Failed to load reports from localStorage', err);
    return generateInitialSeedHistory();
  }
}

export function saveReports(reports: EvaluationReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to persist reports', err);
  }
}

export function saveNewReport(report: EvaluationReport): void {
  const existing = getSavedReports();
  // Ensure user evaluation is marked as non-seeded
  const userReport: EvaluationReport = {
    ...report,
    isDemoSeeded: false,
  };
  const updated = [userReport, ...existing.filter((r) => r.id !== userReport.id)].slice(0, 50); // Keep last 50
  saveReports(updated);
  setActiveReport(userReport);
}

export function deleteReportById(id: string): EvaluationReport[] {
  const existing = getSavedReports();
  const updated = existing.filter((r) => r.id !== id);
  saveReports(updated);
  return updated;
}

export function clearAllReports(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
}

export function getActiveReport(): EvaluationReport {
  try {
    const raw = localStorage.getItem(ACTIVE_REPORT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.riskAssessment) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  // Default to initial evaluation of default test cases
  const defaultEval = runFullEvaluation(DEFAULT_TEST_CASES, DEFAULT_THRESHOLDS, DEFAULT_MODELS);
  defaultEval.isDemoSeeded = true;
  setActiveReport(defaultEval);
  return defaultEval;
}

export function setActiveReport(report: EvaluationReport): void {
  try {
    localStorage.setItem(ACTIVE_REPORT_KEY, JSON.stringify(report));
  } catch (e) {
    console.error(e);
  }
}

function generateInitialSeedHistory(): EvaluationReport[] {
  // Preset 2: Regression Detected run
  const run1 = runFullEvaluation(
    PRESET_REGRESSION_DETECTED,
    DEFAULT_THRESHOLDS,
    {
      ...DEFAULT_MODELS,
      candidateName: 'Llama-3-8B-Quantized-Candidate (v1.5-rc1)',
    }
  );
  const now = Date.now();
  run1.timestamp = new Date(now - 1000 * 60 * 18).toISOString();
  run1.id = 'EVAL-DEMO-REGRESSION-02';
  run1.isDemoSeeded = true;

  // Preset 1: Safe Candidate run
  const run2 = runFullEvaluation(
    PRESET_SAFE_CANDIDATE,
    DEFAULT_THRESHOLDS,
    {
      ...DEFAULT_MODELS,
      candidateName: 'Llama-3-70B-FineTuned-Safe (v1.4.1)',
    }
  );
  run2.timestamp = new Date(now - 1000 * 60 * 125).toISOString();
  run2.id = 'EVAL-DEMO-SAFE-01';
  run2.isDemoSeeded = true;

  // An earlier baseline test
  const run3 = runFullEvaluation(
    PRESET_SAFE_CANDIDATE,
    { minCandidateAccuracy: 90, maxPermittedQualityDrop: 5 },
    {
      baselineName: 'Mistral-Large-2407 (prod)',
      candidateName: 'Mistral-Nemo-12B (candidate-b)',
      datasetName: 'Core Competency Regression Suite (5 Curated Benchmarks)',
      environment: 'Staging / Shadow Deployment Cluster 02',
    }
  );
  run3.timestamp = new Date(now - 1000 * 60 * 60 * 24).toISOString();
  run3.id = 'EVAL-DEMO-BENCHMARK-00';
  run3.isDemoSeeded = true;

  return [run1, run2, run3];
}
