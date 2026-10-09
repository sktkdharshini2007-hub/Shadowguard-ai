import React, { useState } from 'react';
import { EvaluationReport } from '../types';
import { DecisionBadge } from './DecisionBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Eye,
  Activity,
  Cpu,
  Zap,
  DollarSign,
  Compass,
  FileSearch,
  Sparkles,
  Info,
  Clock,
  ShieldAlert as ShieldAlertIcon,
} from 'lucide-react';
import { downloadJsonReport } from '../utils/evaluator';

interface DashboardViewProps {
  activeReport: EvaluationReport;
  allReports: EvaluationReport[];
  onNavigateToNew: () => void;
  onNavigateToRegression: () => void;
  onNavigateToHistory: () => void;
  onViewReport: (report: EvaluationReport) => void;
  isEvaluating: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeReport,
  allReports,
  onNavigateToNew,
  onNavigateToRegression,
  onNavigateToHistory,
  onViewReport,
  isEvaluating,
}) => {
  const [showDemoGuide, setShowDemoGuide] = useState(true);

  // Aggregate stats from allReports
  const totalEvaluations = allReports.length;
  const totalPromoted = allReports.filter((r) => r.decision === 'PROMOTE').length;
  const totalBlocked = allReports.filter((r) => r.decision === 'BLOCK').length;
  const totalRegressions = allReports.reduce((acc, r) => acc + r.regressionCount, 0);

  const avgBaselineAccuracy =
    totalEvaluations > 0
      ? (allReports.reduce((acc, r) => acc + r.baselineAccuracy, 0) / totalEvaluations).toFixed(1)
      : '0.0';

  const avgCandidateAccuracy =
    totalEvaluations > 0
      ? (allReports.reduce((acc, r) => acc + r.candidateAccuracy, 0) / totalEvaluations).toFixed(1)
      : '0.0';

  const risk = activeReport.riskAssessment;
  const metrics = activeReport.simulatedMetrics;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Demo Walkthrough & Hackathon Judge Guide Banner */}
      {showDemoGuide && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 shadow-lg relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Demo Guide · Evaluator Walkthrough
                  </span>
                  <span className="text-[10px] font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 text-cyan-300">
                    HORIZON 2K26
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ShadowGuard audits candidate models before release. Try the pre-built scenarios in{' '}
                  <button
                    onClick={onNavigateToNew}
                    className="text-cyan-400 underline font-semibold hover:text-cyan-300"
                  >
                    New Evaluation
                  </button>
                  : <strong>Preset 1 (Safe Candidate $\rightarrow$ Low Risk / PROMOTE)</strong>,{' '}
                  <strong>Preset 2 (Regression Detected $\rightarrow$ High Risk / BLOCK)</strong>, or inspect failure diagnoses in{' '}
                  <button
                    onClick={onNavigateToRegression}
                    className="text-cyan-400 underline font-semibold hover:text-cyan-300"
                  >
                    Regression Detective
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onNavigateToNew}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
              >
                Open Demo Presets
              </button>
              <button
                onClick={() => setShowDemoGuide(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Release Gate Verdict Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0e1628] to-[#0a0f1d] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
                SIMULATED DEMO MODELS · ADVISORY RELEASE GATE
              </span>
              <span className="text-slate-500 font-mono text-xs">
                {activeReport.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Model Deployment Safety & Regression Gate
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Automated safety guardrail auditing candidate weights against golden production reference data.
              Calculates deterministic regression deltas and enforces advisory PROMOTE/BLOCK decisions before production rollout.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <div>
                <span className="text-slate-500">Baseline: </span>
                <span className="text-slate-200 font-medium">{activeReport.models.baselineName}</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">vs</span>
              <div>
                <span className="text-cyan-500">Candidate: </span>
                <span className="text-cyan-300 font-medium">{activeReport.models.candidateName}</span>
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onNavigateToNew}
              disabled={isEvaluating}
              className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RUN EVALUATION</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewReport(activeReport)}
                className="flex-1 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>View Audit</span>
              </button>

              <button
                onClick={() => downloadJsonReport(activeReport)}
                className="px-3 py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Download JSON Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Gate Banner */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <DecisionBadge
            decision={activeReport.decision}
            size="hero"
            regressionCount={activeReport.regressionCount}
            qualityDrop={activeReport.qualityDrop}
            riskLevel={risk.level}
          />
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Evaluations */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="text-xs font-mono text-slate-400">Total Evaluations</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {totalEvaluations}
          </div>
          <div className="text-[11px] text-slate-500">Persistent runs</div>
        </div>

        {/* Promoted */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-sm space-y-1">
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Recommended Promote</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-300">
            {totalPromoted}
          </div>
          <div className="text-[11px] text-emerald-400/70 font-mono tabular-nums">
            {totalEvaluations > 0 ? `${((totalPromoted / totalEvaluations) * 100).toFixed(0)}% pass rate` : '0%'}
          </div>
        </div>

        {/* Blocked */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 backdrop-blur-sm space-y-1">
          <div className="text-xs font-mono text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Recommended Block</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-300">
            {totalBlocked}
          </div>
          <div className="text-[11px] text-rose-400/70 font-mono tabular-nums">
            {totalEvaluations > 0 ? `${((totalBlocked / totalEvaluations) * 100).toFixed(0)}% gate blocks` : '0%'}
          </div>
        </div>

        {/* Baseline Accuracy */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="text-xs font-mono text-slate-400">Baseline Acc</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300">
            {activeReport.baselineAccuracy.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            Avg: {avgBaselineAccuracy}%
          </div>
        </div>

        {/* Candidate Accuracy */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="text-xs font-mono text-slate-400">Candidate Acc</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              activeReport.candidateAccuracy >= activeReport.thresholds.minCandidateAccuracy
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {activeReport.candidateAccuracy.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            Min threshold: {activeReport.thresholds.minCandidateAccuracy}%
          </div>
        </div>

        {/* Regressions Count */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-1">
          <div className="text-xs font-mono text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Regressions</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400">
            {activeReport.regressionCount}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            Total caught: {totalRegressions}
          </div>
        </div>
      </div>

      {/* NEW: Deployment Risk Assessment Panel (Documented Invariant Rules) */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlertIcon className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Deployment Risk Assessment
              </h2>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  risk.level === 'LOW'
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : risk.level === 'MEDIUM'
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                    : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                }`}
              >
                LEVEL: {risk.level} RISK
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Calculated using documented, rule-based heuristics evaluating quality drop and critical failures.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Decision Invariants: </span>
            <span className={activeReport.decision === 'PROMOTE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {activeReport.decision}
            </span>
          </div>
        </div>

        {/* Risk summary statement */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
          {risk.summary}
        </div>

        {/* Triggered Rules Grid (Transparent, non-arbitrary explanation) */}
        <div>
          <div className="text-xs font-mono text-slate-400 mb-2">
            Documented Risk Rules Evaluated ({risk.triggeredRules.length} triggered):
          </div>
          <div className="space-y-2">
            {risk.triggeredRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 text-xs font-mono text-slate-300 flex items-start gap-2.5"
              >
                <span className="text-cyan-400 font-bold shrink-0">→</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk factors breakdown */}
        {risk.riskFactors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {risk.riskFactors.map((rf, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  rf.severity === 'high'
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : rf.severity === 'medium'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold">{rf.factor}</span>
                  <span className="text-[10px] uppercase font-bold">{rf.severity}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">{rf.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW: Model Comparison with Simulated Latency & Cost Metrics */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Model Architecture Trade-Offs & Simulated Metrics
              </h2>
              <span className="text-[10px] font-mono bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 px-2 py-0.5 rounded font-bold">
                SIMULATED VALUES
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Comparing golden 70B reference against quantized candidate checkpoint.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Parameter Trade-off Estimation
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Accuracy Delta */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono text-slate-400">Accuracy Comparison</div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-slate-200 text-sm">{activeReport.baselineAccuracy.toFixed(0)}% (Base)</span>
              <span className="text-cyan-400 font-bold text-lg">{activeReport.candidateAccuracy.toFixed(0)}% (Cand)</span>
            </div>
            <div
              className={`text-[11px] font-mono ${
                activeReport.qualityDrop <= 0
                  ? 'text-emerald-400'
                  : activeReport.qualityDrop <= activeReport.thresholds.maxPermittedQualityDrop
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              Quality Delta: {activeReport.qualityDrop > 0 ? `-${activeReport.qualityDrop.toFixed(1)}%` : `+${Math.abs(activeReport.qualityDrop).toFixed(1)}%`}
            </div>
          </div>

          {/* Simulated Latency */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Latency (Simulated)</span>
              <Clock className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-slate-400 text-sm">{metrics.baselineLatencyMs}ms</span>
              <span className="text-emerald-400 font-bold text-lg">{metrics.candidateLatencyMs}ms</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              ~{metrics.latencyReductionPct}% faster inference (simulated)
            </div>
          </div>

          {/* Simulated Cost */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Cost / 1M Tokens (Simulated)</span>
              <DollarSign className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-slate-400 text-sm">${metrics.baselineCostPer1MTokens.toFixed(2)}</span>
              <span className="text-emerald-400 font-bold text-lg">${metrics.candidateCostPer1MTokens.toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              ~{metrics.costSavingsPct}% cost reduction (simulated)
            </div>
          </div>

          {/* Release Invariant Status */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono text-slate-400">Release Gate Invariant</div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-slate-400 text-sm">Gate Policy</span>
              <span className={`font-bold text-lg ${activeReport.decision === 'PROMOTE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {activeReport.decision}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {activeReport.passedThresholds.accuracyMet && activeReport.passedThresholds.dropWithinLimit
                ? 'All release conditions met'
                : 'Blocking conditions violated'}
            </div>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-300/90 font-mono">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>{metrics.disclaimer}</span>
        </div>
      </div>

      {/* Main Grid: Comparison Visualizer & Quick Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Baseline vs Candidate Accuracy & Metrics Visualizer */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Model Accuracy & Regression Visualizer
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Deterministic performance delta across {activeReport.totalCases} evaluation benchmarks
              </p>
            </div>
            <button
              onClick={onNavigateToRegression}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Explainable Detective</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Side by side visual bars */}
          <div className="space-y-5">
            {/* Baseline Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
                  Baseline ({activeReport.models.baselineName})
                </span>
                <span className="font-mono tabular-nums text-cyan-300 font-bold">
                  {activeReport.baselineAccuracy.toFixed(1)}% ({activeReport.baselineCorrect}/{activeReport.totalCases})
                </span>
              </div>
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(activeReport.baselineAccuracy, 4)}%` }}
                />
              </div>
            </div>

            {/* Candidate Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-sm inline-block ${
                      activeReport.decision === 'PROMOTE' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  Candidate ({activeReport.models.candidateName})
                </span>
                <span
                  className={`font-mono tabular-nums font-bold ${
                    activeReport.candidateAccuracy >= activeReport.thresholds.minCandidateAccuracy
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {activeReport.candidateAccuracy.toFixed(1)}% ({activeReport.candidateCorrect}/{activeReport.totalCases})
                </span>
              </div>
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
                {/* Min Accuracy Threshold Guide Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{ left: `${activeReport.thresholds.minCandidateAccuracy}%` }}
                  title={`Min Threshold: ${activeReport.thresholds.minCandidateAccuracy}%`}
                />
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeReport.candidateAccuracy >= activeReport.thresholds.minCandidateAccuracy
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                      : 'bg-gradient-to-r from-rose-600 to-red-500'
                  }`}
                  style={{ width: `${Math.max(activeReport.candidateAccuracy, 4)}%` }}
                />
              </div>
              <div className="flex items-between justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                <span>0%</span>
                <span className="text-amber-400/90">
                  Target Invariant: ≥{activeReport.thresholds.minCandidateAccuracy}%
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Quick Case Status Row */}
          <div className="pt-2">
            <div className="text-xs font-mono uppercase text-slate-400 mb-2">
              Curated Test Suite Cases ({activeReport.testResults.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {activeReport.testResults.map((tr) => (
                <div
                  key={tr.testCase.id}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    tr.status === 'REGRESSION'
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : tr.status === 'IMPROVEMENT'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : tr.isCandidateCorrect
                      ? 'bg-slate-950 border-cyan-800/40 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{tr.testCase.id}</div>
                  <div className="text-[10px] font-mono mt-0.5 truncate" title={tr.testCase.question}>
                    {tr.testCase.question}
                  </div>
                  <div className="text-[10px] font-mono font-semibold uppercase mt-1">
                    {tr.status === 'REGRESSION'
                      ? 'REGRESSION'
                      : tr.status === 'IMPROVEMENT'
                      ? 'IMPROVED'
                      : tr.isCandidateCorrect
                      ? 'PASS'
                      : 'FAIL'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Gate Enforcement Details & Recent Runs */}
        <div className="space-y-6">
          {/* Gate Criteria Audit Panel */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Release Gate Conditions</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Criterion 1 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                {activeReport.passedThresholds.accuracyMet ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-200">
                    Candidate Minimum Accuracy
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Requires ≥{activeReport.thresholds.minCandidateAccuracy}%. Current:{' '}
                    <span className={activeReport.passedThresholds.accuracyMet ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {activeReport.candidateAccuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Criterion 2 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                {activeReport.passedThresholds.dropWithinLimit ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-200">
                    Max Quality Drop Limit
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Permitted: ≤{activeReport.thresholds.maxPermittedQualityDrop}% pts. Current:{' '}
                    <span className={activeReport.passedThresholds.dropWithinLimit ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {activeReport.qualityDrop > 0 ? `+${activeReport.qualityDrop.toFixed(1)}%` : `${activeReport.qualityDrop.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Criterion 3 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                {activeReport.regressionCount === 0 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-200">
                    Regression Tolerance
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Detected:{' '}
                    <span className={activeReport.regressionCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {activeReport.regressionCount} regression(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Evaluations Card */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Recent Evaluations</span>
              </h3>
              <button
                onClick={onNavigateToHistory}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View all ({allReports.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {allReports.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  onClick={() => onViewReport(r)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-cyan-400 font-medium">
                        {r.id}
                      </span>
                      {r.isDemoSeeded && (
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                          Demo Seed
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 truncate group-hover:text-cyan-300 transition-colors">
                      {r.models.candidateName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold tabular-nums text-slate-200">
                      {r.candidateAccuracy.toFixed(0)}%
                    </span>
                    <DecisionBadge decision={r.decision} size="sm" riskLevel={r.riskAssessment.level} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
