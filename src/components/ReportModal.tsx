import React, { useState } from 'react';
import { EvaluationReport } from '../types';
import { downloadJsonReport } from '../utils/evaluator';
import { DecisionBadge } from './DecisionBadge';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Zap,
  Clock,
  DollarSign,
  HelpCircle,
  Wrench,
  Info,
} from 'lucide-react';

interface ReportModalProps {
  report: EvaluationReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ report, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'cases' | 'risk' | 'json'>('summary');

  if (!isOpen || !report) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const risk = report.riskAssessment;
  const metrics = report.simulatedMetrics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Deployment Audit Report
                </h3>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {report.id}
                </span>
                {report.isDemoSeeded && (
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.2 rounded">
                    Demo Seed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Evaluated: {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadJsonReport(report)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Download JSON Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-[#090e1a]/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'summary'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Summary
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'cases'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Test Breakdown ({report.testResults.length})
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'risk'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk & Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw JSON Payload
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div
                className={`p-5 rounded-xl border ${
                  report.decision === 'PROMOTE'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <DecisionBadge decision={report.decision} size="lg" riskLevel={risk?.level} />
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {report.decision === 'PROMOTE'
                          ? 'Model Gate Passed: Release Authorized'
                          : 'Model Gate Blocked: Rollback Enforced'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        {report.decisionReason}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right font-mono text-xs text-slate-400">
                    <div>Advisory Status</div>
                    <div className="text-slate-200 font-semibold">
                      Requires Engineering Sign-off
                    </div>
                  </div>
                </div>
              </div>

              {/* Models Comparison Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Baseline Model (Golden Reference)
                  </div>
                  <div className="font-semibold text-white text-sm break-words">
                    {report.models.baselineName}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-mono">
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {report.baselineAccuracy.toFixed(1)}% ({report.baselineCorrect}/{report.totalCases})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    Candidate Model (Evaluation Target)
                  </div>
                  <div className="font-semibold text-white text-sm break-words">
                    {report.models.candidateName}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-mono">
                    <span className="text-slate-400">Accuracy:</span>
                    <span
                      className={`font-bold tabular-nums ${
                        report.candidateAccuracy >= report.thresholds.minCandidateAccuracy
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {report.candidateAccuracy.toFixed(1)}% ({report.candidateCorrect}/{report.totalCases})
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated Metrics Strip */}
              {metrics && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Architecture Metrics (Simulated Values)
                    </span>
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                      SYNTHETIC ESTIMATE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Latency (Base)</span>
                      <span className="text-slate-300 font-bold">{metrics.baselineLatencyMs}ms</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Latency (Cand)</span>
                      <span className="text-emerald-400 font-bold">{metrics.candidateLatencyMs}ms ({metrics.latencyReductionPct}% faster)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Cost / 1M Tokens (Base)</span>
                      <span className="text-slate-300 font-bold">${metrics.baselineCostPer1MTokens.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Cost / 1M Tokens (Cand)</span>
                      <span className="text-emerald-400 font-bold">${metrics.candidateCostPer1MTokens.toFixed(2)} ({metrics.costSavingsPct}% saved)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gate Invariants Checklist */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                  Configured Deployment Gate Invariants
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {report.passedThresholds.accuracyMet ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>Candidate Min Accuracy</span>
                    </div>
                    <div className="font-mono tabular-nums text-right">
                      <span className={report.passedThresholds.accuracyMet ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {report.candidateAccuracy.toFixed(1)}%
                      </span>
                      <span className="text-slate-500"> / {report.thresholds.minCandidateAccuracy}% req</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {report.passedThresholds.dropWithinLimit ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>Quality Drop Threshold</span>
                    </div>
                    <div className="font-mono tabular-nums text-right">
                      <span
                        className={
                          report.passedThresholds.dropWithinLimit
                            ? 'text-emerald-400'
                            : 'text-rose-400 font-bold'
                        }
                      >
                        {report.qualityDrop > 0 ? `+${report.qualityDrop.toFixed(1)}%` : `${report.qualityDrop.toFixed(1)}%`}
                      </span>
                      <span className="text-slate-500"> / max {report.thresholds.maxPermittedQualityDrop}% pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hackathon Signature */}
              <div className="text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {report.hackathonMetadata.event} · {report.hackathonMetadata.track}
                </div>
                <div>Team: {report.hackathonMetadata.team}</div>
              </div>
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="space-y-3">
              {report.testResults.map((result, idx) => (
                <div
                  key={result.testCase.id || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    result.status === 'REGRESSION'
                      ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                      : result.status === 'IMPROVEMENT'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                      : !result.isCandidateCorrect
                      ? 'bg-rose-950/15 border-rose-500/30 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {result.testCase.id}
                      </span>
                      <span className="text-xs font-medium text-slate-300">
                        {result.testCase.question}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold shrink-0 ${
                        result.status === 'REGRESSION'
                          ? 'bg-rose-900/60 border-rose-500/60 text-rose-300'
                          : result.status === 'IMPROVEMENT'
                          ? 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Expected:</span>
                      <span className="text-cyan-300 font-semibold">{result.testCase.expectedAnswer}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Baseline:</span>
                      <span
                        className={result.isBaselineCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400'}
                      >
                        {result.testCase.baselineAnswer} {result.isBaselineCorrect ? '(PASS)' : '(FAIL)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Candidate:</span>
                      <span
                        className={
                          result.isCandidateCorrect
                            ? 'text-emerald-400 font-semibold'
                            : 'text-rose-400 font-bold bg-rose-950/60 px-1 rounded border border-rose-800'
                        }
                      >
                        {result.testCase.candidateAnswer} {result.isCandidateCorrect ? '(PASS)' : '(FAIL)'}
                      </span>
                    </div>
                  </div>

                  {/* Failure Diagnostic & Investigation Step */}
                  {!result.isCandidateCorrect && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
                      <div>
                        <span className="font-mono text-rose-400 font-bold block text-[11px]">
                          Failure Diagnosis:
                        </span>
                        <p className="text-slate-300 leading-relaxed font-sans">
                          {result.failureDiagnosis || result.explanation}
                        </p>
                      </div>
                      {result.suggestedInvestigationStep && (
                        <div>
                          <span className="font-mono text-cyan-400 font-bold block text-[11px]">
                            Suggested Investigation:
                          </span>
                          <p className="text-slate-400 leading-relaxed font-sans">
                            {result.suggestedInvestigationStep}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    <span>Deployment Risk Assessment Details</span>
                  </h4>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                      risk?.level === 'LOW'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : risk?.level === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : 'bg-rose-950 text-rose-300 border-rose-500/50'
                    }`}
                  >
                    {risk?.level} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{risk?.summary}</p>
              </div>

              <div>
                <h5 className="text-xs font-mono uppercase text-slate-400 mb-2">
                  Documented Invariant Rules Triggered:
                </h5>
                <div className="space-y-2 text-xs font-mono">
                  {risk?.triggeredRules.map((rule, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="relative">
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090e1a] flex items-center justify-between text-xs text-slate-400">
          <span>ShadowGuard Deterministic CI/CD Gate Engine</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadJsonReport(report)}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
