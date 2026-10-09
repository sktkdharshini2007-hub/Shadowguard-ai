import { TestCase, GateThresholds, ModelMetadata } from '../types';

export const DEFAULT_MODELS: ModelMetadata = {
  baselineName: 'Llama-3-70B-Instruct (v1.4-prod)',
  candidateName: 'Llama-3-8B-Quantized-Candidate (v1.5-rc1)',
  datasetName: 'Core Competency Regression Suite (5 Curated Benchmarks)',
  environment: 'Staging / Shadow Deployment Cluster 04',
};

export const DEFAULT_THRESHOLDS: GateThresholds = {
  minCandidateAccuracy: 80, // Minimum candidate accuracy percentage
  maxPermittedQualityDrop: 10, // Max allowed quality drop in percentage points
};

export const DEFAULT_TEST_CASES: TestCase[] = [
  {
    id: 'TC-01',
    category: 'Chemistry & Physical Science',
    question: 'What is H2O commonly called?',
    expectedAnswer: 'Water',
    baselineAnswer: 'Water',
    candidateAnswer: 'Water',
    notes: 'Fundamental chemical nomenclature test',
  },
  {
    id: 'TC-02',
    category: 'Astronomy & Planetary Science',
    question: 'Which planet is known as the Red Planet?',
    expectedAnswer: 'Mars',
    baselineAnswer: 'Mars',
    candidateAnswer: 'Venus',
    notes: 'Planetary trivia test - Candidate hallucinates Venus due to surface color ambiguity',
  },
  {
    id: 'TC-03',
    category: 'Biology & Botany',
    question: 'What gas do plants absorb during photosynthesis?',
    expectedAnswer: 'Carbon dioxide',
    baselineAnswer: 'Carbon dioxide',
    candidateAnswer: 'Oxygen',
    notes: 'Photosynthesis gas exchange - Candidate confounds absorbed vs emitted gas',
  },
  {
    id: 'TC-04',
    category: 'Arithmetic & Foundations',
    question: 'What is 2 + 2?',
    expectedAnswer: '4',
    baselineAnswer: '4',
    candidateAnswer: '4',
    notes: 'Elementary integer arithmetic sanity check',
  },
  {
    id: 'TC-05',
    category: 'Geography & World Capitals',
    question: 'What is the capital of Japan?',
    expectedAnswer: 'Tokyo',
    baselineAnswer: 'Tokyo',
    candidateAnswer: 'Tokyo',
    notes: 'Entity association and world capitals factoid',
  },
];

export const PRESET_SAFE_CANDIDATE: TestCase[] = [
  {
    id: 'TC-01',
    category: 'Chemistry & Physical Science',
    question: 'What is H2O commonly called?',
    expectedAnswer: 'Water',
    baselineAnswer: 'Water',
    candidateAnswer: 'Water',
    notes: 'Fundamental chemical nomenclature test',
  },
  {
    id: 'TC-02',
    category: 'Astronomy & Planetary Science',
    question: 'Which planet is known as the Red Planet?',
    expectedAnswer: 'Mars',
    baselineAnswer: 'Mars',
    candidateAnswer: 'Mars',
    notes: 'Correct answer provided by candidate',
  },
  {
    id: 'TC-03',
    category: 'Biology & Botany',
    question: 'What gas do plants absorb during photosynthesis?',
    expectedAnswer: 'Carbon dioxide',
    baselineAnswer: 'Carbon dioxide',
    candidateAnswer: 'Carbon dioxide',
    notes: 'Correct answer provided by candidate',
  },
  {
    id: 'TC-04',
    category: 'Arithmetic & Foundations',
    question: 'What is 2 + 2?',
    expectedAnswer: '4',
    baselineAnswer: '4',
    candidateAnswer: '4',
    notes: 'Elementary integer arithmetic sanity check',
  },
  {
    id: 'TC-05',
    category: 'Geography & World Capitals',
    question: 'What is the capital of Japan?',
    expectedAnswer: 'Tokyo',
    baselineAnswer: 'Tokyo',
    candidateAnswer: 'Tokyo',
    notes: 'Entity association and world capitals factoid',
  },
];

export const PRESET_REGRESSION_DETECTED: TestCase[] = [
  {
    id: 'TC-01',
    category: 'Chemistry & Physical Science',
    question: 'What is H2O commonly called?',
    expectedAnswer: 'Water',
    baselineAnswer: 'Water',
    candidateAnswer: 'Water',
    notes: 'Passes in both models',
  },
  {
    id: 'TC-02',
    category: 'Astronomy & Planetary Science',
    question: 'Which planet is known as the Red Planet?',
    expectedAnswer: 'Mars',
    baselineAnswer: 'Mars',
    candidateAnswer: 'Venus',
    notes: 'Regression: Baseline passed (Mars), Candidate failed (Venus)',
  },
  {
    id: 'TC-03',
    category: 'Biology & Botany',
    question: 'What gas do plants absorb during photosynthesis?',
    expectedAnswer: 'Carbon dioxide',
    baselineAnswer: 'Carbon dioxide',
    candidateAnswer: 'Oxygen',
    notes: 'Regression: Baseline passed (Carbon dioxide), Candidate failed (Oxygen)',
  },
  {
    id: 'TC-04',
    category: 'Arithmetic & Foundations',
    question: 'What is 2 + 2?',
    expectedAnswer: '4',
    baselineAnswer: '4',
    candidateAnswer: '4',
    notes: 'Passes in both models',
  },
  {
    id: 'TC-05',
    category: 'Geography & World Capitals',
    question: 'What is the capital of Japan?',
    expectedAnswer: 'Tokyo',
    baselineAnswer: 'Tokyo',
    candidateAnswer: 'Tokyo',
    notes: 'Passes in both models',
  },
];

export const PRESET_IMPROVEMENT_DETECTED: TestCase[] = [
  {
    id: 'TC-01',
    category: 'Chemistry & Physical Science',
    question: 'What is H2O commonly called?',
    expectedAnswer: 'Water',
    baselineAnswer: 'Water',
    candidateAnswer: 'Water',
    notes: 'Both baseline and candidate pass',
  },
  {
    id: 'TC-02',
    category: 'Astronomy & Planetary Science',
    question: 'Which planet is known as the Red Planet?',
    expectedAnswer: 'Mars',
    baselineAnswer: 'Jupiter', // Baseline fails!
    candidateAnswer: 'Mars',    // Candidate passes!
    notes: 'Improvement: Baseline failed (Jupiter), Candidate succeeded (Mars)',
  },
  {
    id: 'TC-03',
    category: 'Biology & Botany',
    question: 'What gas do plants absorb during photosynthesis?',
    expectedAnswer: 'Carbon dioxide',
    baselineAnswer: 'Carbon dioxide',
    candidateAnswer: 'Carbon dioxide',
    notes: 'Both pass',
  },
  {
    id: 'TC-04',
    category: 'Arithmetic & Foundations',
    question: 'What is 2 + 2?',
    expectedAnswer: '4',
    baselineAnswer: '4',
    candidateAnswer: '4',
    notes: 'Both pass',
  },
  {
    id: 'TC-05',
    category: 'Geography & World Capitals',
    question: 'What is the capital of Japan?',
    expectedAnswer: 'Tokyo',
    baselineAnswer: 'Tokyo',
    candidateAnswer: 'Tokyo',
    notes: 'Both pass',
  },
];
