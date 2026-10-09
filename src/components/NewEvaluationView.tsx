import React, { useState, useEffect } from 'react';
import { TestCase, GateThresholds, ModelMetadata, EvaluationReport } from '../types';
import {
  DEFAULT_TEST_CASES,
  DEFAULT_THRESHOLDS,
  DEFAULT_MODELS,
  PRESET_SAFE_CANDIDATE,
  PRESET_REGRESSION_DETECTED,
  PRESET_IMPROVEMENT_DETECTED,
} from '../data/defaultTestCases';
import { runFullEvaluation } from '../utils/evaluator';
import { DecisionBadge } from './DecisionBadge';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sliders,
  Plus,
  Trash2,
  Info,
  Check,
  ChevronRight,
  Database,
  Cpu,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

interface NewEvaluationViewProps {
  onEvaluationComplete: (report: EvaluationReport) => void;
  initialThresholds?: GateThresholds;
  initialModels?: ModelMetadata;
  initialTestCases?: TestCase[];
}

export const NewEvaluationView: React.FC<NewEvaluationViewProps> = ({
  onEvaluationComplete,
  initialThresholds = DEFAULT_THRESHOLDS,
  initialModels = DEFAULT_MODELS,
  initialTestCases = DEFAULT_TEST_CASES,
}) => {
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [thresholds, setThresholds] = useState<GateThresholds>(initialThresholds);
  const [models, setModels] = useState<ModelMetadata>(initialModels);
  const [activePreset, setActivePreset] = useState<'custom' | 'safe' | 'regression' | 'improvement'>('regression');
  const [isRunning, setIsRunning] = useState(false);
  const [runningStep, setRunningStep] = useState(0);

  // Live dynamic evaluation calculation as user edits!
  const liveEvaluation = runFullEvaluation(testCases, thresholds, models);

  const handleApplyPreset = (presetType: 'safe' | 'regression' | 'improvement') => {
    setActivePreset(presetType);
    if (presetType === 'safe') {
      setTestCases(JSON.parse(JSON.stringify(PRESET_SAFE_CANDIDATE)));
      setModels({
        ...models,
        candidateName: 'Llama-3-8B-FineTuned-Safe (v1.5-rc2)',
      });
    } else if (presetType === 'regression') {
      setTestCases(JSON.parse(JSON.stringify(PRESET_REGRESSION_DETECTED)));
      setModels({
        ...models,
        candidateName: 'Llama-3-8B-Quantized-Candidate (v1.5-rc1)',
      });
    } else if (presetType === 'improvement') {
      setTestCases(JSON.parse(JSON.stringify(PRESET_IMPROVEMENT_DETECTED)));
      setModels({
        ...models,
        baselineName: 'Llama-3-70B-Instruct-Legacy (v1.0)',
        candidateName: 'Llama-3-8B-FineTuned-Improved (v2.0)',
      });
    }
  };

  const handleResetDemo = () => {
    setActivePreset('regression');
    setTestCases(JSON.parse(JSON.stringify(DEFAULT_TEST_CASES)));
    setThresholds(DEFAULT_THRESHOLDS);
    setModels(DEFAULT_MODELS);
  };

  const handleUpdateTestCase = (index: number, field: keyof TestCase, value: string) => {
    setActivePreset('custom');
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const handleAddTestCase = () => {
    setActivePreset('custom');
    const newId = `TC-0${testCases.length + 1}`;
    const newCase: TestCase = {
      id: newId,
      category: 'General Reasoning',
      question: 'What is the speed of light in vacuum (approx)?',
      expectedAnswer: '300,000 km/s',
      baselineAnswer: '300,000 km/s',
      candidateAnswer: '300,000 km/s',
    };
    setTestCases([...testCases, newCase]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    setActivePreset('custom');
    const updated = testCases.filter((_, i) => i !== index);
    setTestCases(updated);
  };

  const handleRunEvaluation = () => {
    setIsRunning(true);
    setRunningStep(0);

    // Step-by-step CI/CD pipeline simulation
    const steps = [
      'Normalizing answers & case-folding...',
      'Comparing baseline against expected truth...',
      'Comparing candidate against expected truth...',
      'Detecting regressions & evaluating risk rules...',
      'Evaluating deployment release gate invariants...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setRunningStep(current);
      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsRunning(false);
          const finalReport = runFullEvaluation(testCases, thresholds, models);
          if (finalReport.decision === 'PROMOTE') {
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch (e) {
              // Ignore if canvas-confetti fails
            }
          }
          onEvaluationComplete(finalReport);
        }, 300);
      }
    }, 250);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header and Presets Bar */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Deployment Gate Configuration & Evaluation Sandbox
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">Simulated Demo Endpoints</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              New Model Evaluation Gate
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure candidate models, test questions, golden ground truths, and release thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            <button
              onClick={handleRunEvaluation}
              disabled={isRunning}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN EVALUATION GATE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Demo Presets Selector */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Standard Demo Presets</span>
            </span>
            <span className="text-[11px] text-slate-500">
              One-click scenarios for hackathon demonstration
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleApplyPreset('safe')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'safe'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">PRESET 1: SAFE CANDIDATE</span>
                {activePreset === 'safe' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                All 5 candidate answers correct (100%). Zero regressions. Risk: LOW $\rightarrow$ Recommend PROMOTE.
              </p>
            </button>

            <button
              onClick={() => handleApplyPreset('regression')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'regression'
                  ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">PRESET 2: REGRESSION DETECTED</span>
                {activePreset === 'regression' && <Check className="w-4 h-4 text-rose-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Sample: Venus & Oxygen. 3/5 correct (60%), 2 regressions. Risk: HIGH $\rightarrow$ Recommend BLOCK.
              </p>
            </button>

            <button
              onClick={() => handleApplyPreset('improvement')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'improvement'
                  ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">PRESET 3: CANDIDATE IMPROVEMENT</span>
                {activePreset === 'improvement' && <Check className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Baseline fails Mars (answers Jupiter); candidate succeeds. Risk: LOW $\rightarrow$ Recommend PROMOTE.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Execution Animation Modal / Overlay */}
      {isRunning && (
        <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Executing ShadowGuard Deployment Gate
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Evaluating {testCases.length} deterministic test vectors...
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 tabular-nums">
              Step {runningStep + 1} of 5
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((runningStep + 1) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Live Verdict Box */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DecisionBadge
              decision={liveEvaluation.decision}
              size="lg"
              riskLevel={liveEvaluation.riskAssessment.level}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">
                  Live Dynamic Gate Recommendation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Updates in real time
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {liveEvaluation.decision === 'PROMOTE'
                  ? 'RECOMMENDED ACTION: PROMOTE (Meets Safety Invariants)'
                  : 'RECOMMENDED ACTION: BLOCK (Violates Safety Invariants)'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Candidate Acc:</span>
              <span
                className={`font-bold tabular-nums text-sm ${
                  liveEvaluation.candidateAccuracy >= thresholds.minCandidateAccuracy
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {liveEvaluation.candidateAccuracy.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Quality Drop:</span>
              <span
                className={`font-bold tabular-nums text-sm ${
                  liveEvaluation.qualityDrop <= thresholds.maxPermittedQualityDrop
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {liveEvaluation.qualityDrop > 0 ? `+${liveEvaluation.qualityDrop.toFixed(1)}%` : `${liveEvaluation.qualityDrop.toFixed(1)}%`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Regressions:</span>
              <span
                className={`font-bold tabular-nums text-sm ${
                  liveEvaluation.regressionCount === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {liveEvaluation.regressionCount}
              </span>
            </div>
          </div>
        </div>

        {/* Release Conditions Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-300 flex items-center gap-1.5">
              {liveEvaluation.passedThresholds.accuracyMet ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>Condition 1: Candidate Accuracy ≥ {thresholds.minCandidateAccuracy}%</span>
            </span>
            <span className={liveEvaluation.passedThresholds.accuracyMet ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {liveEvaluation.passedThresholds.accuracyMet ? 'PASS' : 'FAIL'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-300 flex items-center gap-1.5">
              {liveEvaluation.passedThresholds.dropWithinLimit ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>Condition 2: Quality Drop ≤ {thresholds.maxPermittedQualityDrop}% pts</span>
            </span>
            <span className={liveEvaluation.passedThresholds.dropWithinLimit ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {liveEvaluation.passedThresholds.dropWithinLimit ? 'PASS' : 'FAIL'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          {liveEvaluation.decisionReason}
        </p>
      </div>

      {/* Model Metadata & Thresholds Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Names Configuration */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Model Endpoint Identifiers
            </h3>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded ml-auto">
              SIMULATED DEMO MODELS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Baseline Model Name (Production Reference)
              </label>
              <input
                type="text"
                value={models.baselineName}
                onChange={(e) => setModels({ ...models, baselineName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g. Llama-3-70b-instruct"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 mb-1.5">
                Candidate Model Name (Release Target)
              </label>
              <input
                type="text"
                value={models.candidateName}
                onChange={(e) => setModels({ ...models, candidateName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-cyan-800/60 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="e.g. Llama-3-8b-candidate"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Evaluation Dataset Name
              </label>
              <input
                type="text"
                value={models.datasetName}
                onChange={(e) => setModels({ ...models, datasetName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Release Gate Thresholds Slider Card */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Release Gate Thresholds
            </h3>
          </div>

          <div className="space-y-5">
            {/* Threshold 1: Min Candidate Accuracy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Min Candidate Accuracy</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {thresholds.minCandidateAccuracy}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={thresholds.minCandidateAccuracy}
                onChange={(e) =>
                  setThresholds({ ...thresholds, minCandidateAccuracy: Number(e.target.value) })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50%</span>
                <span>Default: 80%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Threshold 2: Max Permitted Quality Drop */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Max Permitted Quality Drop</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {thresholds.maxPermittedQualityDrop}% pts
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={thresholds.maxPermittedQualityDrop}
                onChange={(e) =>
                  setThresholds({ ...thresholds, maxPermittedQualityDrop: Number(e.target.value) })
                }
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Strict)</span>
                <span>Default: 10% pts</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Test Cases Table */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Deterministic Test Benchmarks ({testCases.length})
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Answers are normalized (trimmed & case-folded). Edit any field to test gate responsiveness.
            </p>
          </div>

          <button
            onClick={handleAddTestCase}
            className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Test Case</span>
          </button>
        </div>

        <div className="space-y-4">
          {testCases.map((tc, index) => {
            const result = liveEvaluation.testResults[index];
            const isRegressed = result?.status === 'REGRESSION';
            const isImproved = result?.status === 'IMPROVEMENT';
            const isCandFailed = result ? !result.isCandidateCorrect : false;

            return (
              <div
                key={tc.id || index}
                className={`p-4 rounded-xl border transition-all ${
                  isRegressed
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isImproved
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Case {index + 1} ({tc.id})
                    </span>
                    <input
                      type="text"
                      value={tc.category}
                      onChange={(e) => handleUpdateTestCase(index, 'category', e.target.value)}
                      className="text-xs font-mono text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:outline-none px-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {result && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          isRegressed
                            ? 'bg-rose-900/60 border-rose-500/60 text-rose-300'
                            : isImproved
                            ? 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300'
                            : result.isCandidateCorrect
                            ? 'bg-slate-800 border-slate-700 text-slate-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {result.status}
                      </span>
                    )}
                    {testCases.length > 1 && (
                      <button
                        onClick={() => handleRemoveTestCase(index)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove Case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Question */}
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Prompt / Question
                    </label>
                    <textarea
                      rows={2}
                      value={tc.question}
                      onChange={(e) => handleUpdateTestCase(index, 'question', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  {/* Expected Ground Truth */}
                  <div>
                    <label className="block text-[11px] font-mono text-cyan-400 mb-1">
                      Expected Ground Truth
                    </label>
                    <input
                      type="text"
                      value={tc.expectedAnswer}
                      onChange={(e) => handleUpdateTestCase(index, 'expectedAnswer', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-cyan-800/40 rounded text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Baseline Answer */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-slate-400">
                        Baseline Answer
                      </label>
                      {result && (
                        <span
                          className={`text-[10px] font-mono ${
                            result.isBaselineCorrect ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {result.isBaselineCorrect ? 'PASS' : 'FAIL'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={tc.baselineAnswer}
                      onChange={(e) => handleUpdateTestCase(index, 'baselineAnswer', e.target.value)}
                      className={`w-full px-2.5 py-1.5 bg-slate-900 border rounded text-xs font-mono focus:outline-none transition-colors ${
                        result?.isBaselineCorrect
                          ? 'border-emerald-800/50 text-emerald-300'
                          : 'border-slate-800 text-slate-300'
                      }`}
                    />
                  </div>

                  {/* Candidate Answer */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-slate-400">
                        Candidate Answer
                      </label>
                      {result && (
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            result.isCandidateCorrect ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {result.isCandidateCorrect ? 'PASS' : 'FAIL'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={tc.candidateAnswer}
                      onChange={(e) => handleUpdateTestCase(index, 'candidateAnswer', e.target.value)}
                      className={`w-full px-2.5 py-1.5 bg-slate-900 border rounded text-xs font-mono font-semibold focus:outline-none transition-colors ${
                        result?.isCandidateCorrect
                          ? 'border-emerald-800/60 text-emerald-300'
                          : 'border-rose-800/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
