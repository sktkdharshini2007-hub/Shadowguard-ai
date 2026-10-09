import React, { useState } from 'react';
import { EvaluationReport, ResultStatus } from '../types';
import { DecisionBadge } from './DecisionBadge';
import { downloadJsonReport } from '../utils/evaluator';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  Sparkles,
  Wrench,
  HelpCircle,
  Lightbulb,
  Database,
  Terminal,
  ShieldAlert,
} from 'lucide-react';

interface RegressionAnalysisViewProps {
  report: EvaluationReport;
  allReports: EvaluationReport[];
  onOpenReportModal: () => void;
}

export const RegressionAnalysisView: React.FC<RegressionAnalysisViewProps> = ({
  report,
  allReports,
  onOpenReportModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ResultStatus | 'FAILED_CANDIDATE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Filter test results
  const filteredResults = report.testResults.filter((r) => {
    let matchesStatus = true;
    if (statusFilter === 'FAILED_CANDIDATE') {
      matchesStatus = !r.isCandidateCorrect;
    } else if (statusFilter !== 'ALL') {
      matchesStatus = r.status === statusFilter;
    }

    const matchesSearch =
      searchTerm === '' ||
      r.testCase.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testCase.expectedAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testCase.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedCaseId(expandedCaseId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Explainable Regression Detective & Diagnostic Suite
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">Report ID: {report.id}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Regression Detective & Explainability Analysis
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deep diagnostic auditing: Explains why candidate answers failed and provides actionable next-step investigation pathways.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadJsonReport(report)}
              className="px-3.5 py-2 text-xs font-semibold text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Report</span>
            </button>
            <DecisionBadge decision={report.decision} size="md" riskLevel={report.riskAssessment.level} />
          </div>
        </div>

        {/* Analytics Snapshot Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Baseline vs Candidate */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Baseline Accuracy</div>
            <div className="text-xl font-bold font-mono text-cyan-300 tabular-nums mt-0.5">
              {report.baselineAccuracy.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {report.baselineCorrect} / {report.totalCases} pass
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Candidate Accuracy</div>
            <div
              className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                report.candidateAccuracy >= report.thresholds.minCandidateAccuracy
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {report.candidateAccuracy.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {report.candidateCorrect} / {report.totalCases} pass
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/30 bg-rose-950/10">
            <div className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Regressions Caught</span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 tabular-nums mt-0.5">
              {report.regressionCount}
            </div>
            <div className="text-[10px] text-rose-400/70 font-mono">
              Base PASS → Cand FAIL
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Quality Delta</div>
            <div
              className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                report.qualityDrop <= 0
                  ? 'text-emerald-400'
                  : report.qualityDrop <= report.thresholds.maxPermittedQualityDrop
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {report.qualityDrop > 0 ? `-${report.qualityDrop.toFixed(1)}%` : `+${Math.abs(report.qualityDrop).toFixed(1)}%`}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Drop limit: {report.thresholds.maxPermittedQualityDrop}% pts
            </div>
          </div>
        </div>
      </div>

      {/* Smart Investigation Suggestions Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Smart Investigation Pathways (ML Engineering Guidance)
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Generated from actual failed test cases to guide dataset curation, prompt engineering, and evaluation slicing.
            </p>
          </div>

          <div className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2.5 py-1 rounded border border-slate-800">
            Audit Assistance · No automated weight edits
          </div>
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.investigationSuggestions.map((sugg) => (
            <div
              key={sugg.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                    {sugg.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      sugg.priority === 'HIGH'
                        ? 'bg-rose-950 border-rose-500/50 text-rose-300'
                        : sugg.priority === 'MEDIUM'
                        ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {sugg.priority} PRIORITY
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-100">{sugg.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{sugg.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                Target Cases: <span className="text-slate-300">{sugg.targetTestCases.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 font-mono italic pt-1">
          * Notice: ShadowGuard is an explainability and diagnostic audit platform. It provides actionable investigation guidance; model retraining and dataset modifications must be performed by ML engineers in the training pipeline.
        </div>
      </div>

      {/* Explainable Comparison Table */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-4">
        {/* Table Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Benchmark Vector Detective Table ({filteredResults.length} / {report.testResults.length})
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Failed candidate answers are highlighted with red alerts. Click any row to view diagnostic explanation & next-step advice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompt / answer..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-48 font-mono"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({report.testResults.length})
              </button>
              <button
                onClick={() => setStatusFilter('REGRESSION')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  statusFilter === 'REGRESSION'
                    ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-500/50'
                    : 'text-rose-400/80 hover:text-rose-300'
                }`}
              >
                Regressions ({report.regressionCount})
              </button>
              <button
                onClick={() => setStatusFilter('FAILED_CANDIDATE')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  statusFilter === 'FAILED_CANDIDATE'
                    ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-500/50'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Failed Candidate ({report.testResults.filter((r) => !r.isCandidateCorrect).length})
              </button>
              <button
                onClick={() => setStatusFilter('IMPROVEMENT')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  statusFilter === 'IMPROVEMENT'
                    ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/50'
                    : 'text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                Improvements ({report.improvementCount})
              </button>
            </div>
          </div>
        </div>

        {/* The Full Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-3">Test Case</th>
                <th className="py-3 px-3">Prompt / Question</th>
                <th className="py-3 px-3">Expected Ground Truth</th>
                <th className="py-3 px-3">Baseline Output</th>
                <th className="py-3 px-3">Candidate Output (Target)</th>
                <th className="py-3 px-3 text-right">Verdict Status</th>
                <th className="py-3 px-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No test cases match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const isRegressed = result.status === 'REGRESSION';
                  const isImproved = result.status === 'IMPROVEMENT';
                  const isCandFailed = !result.isCandidateCorrect;
                  const isExpanded = expandedCaseId === result.testCase.id;

                  return (
                    <React.Fragment key={result.testCase.id}>
                      <tr
                        onClick={() => toggleExpand(result.testCase.id)}
                        className={`hover:bg-slate-900/80 transition-colors cursor-pointer ${
                          isCandFailed
                            ? 'bg-rose-950/15 text-slate-200'
                            : isImproved
                            ? 'bg-emerald-950/20 text-slate-200'
                            : 'text-slate-300'
                        }`}
                      >
                        {/* ID & Category */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-300">{result.testCase.id}</div>
                          <div className="text-[10px] text-slate-500 font-sans truncate max-w-[120px]">
                            {result.testCase.category}
                          </div>
                        </td>

                        {/* Question */}
                        <td className="py-3.5 px-3 font-sans font-medium text-slate-200 max-w-xs">
                          {result.testCase.question}
                        </td>

                        {/* Expected */}
                        <td className="py-3.5 px-3 text-cyan-300 font-semibold">
                          {result.testCase.expectedAnswer}
                        </td>

                        {/* Baseline */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {result.isBaselineCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <span
                              className={
                                result.isBaselineCorrect ? 'text-emerald-300' : 'text-rose-400'
                              }
                            >
                              {result.testCase.baselineAnswer}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {result.isBaselineCorrect ? 'PASS' : 'FAIL'}
                          </span>
                        </td>

                        {/* Candidate (Highlighted on failure) */}
                        <td className="py-3.5 px-3">
                          <div
                            className={`p-1.5 rounded-lg border inline-flex items-center gap-1.5 ${
                              isCandFailed
                                ? 'bg-rose-950/60 border-rose-500/80 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                            }`}
                          >
                            {result.isCandidateCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <span className="font-bold">{result.testCase.candidateAnswer}</span>
                            <span className="text-[10px] uppercase font-mono ml-1">
                              ({result.isCandidateCorrect ? 'PASS' : 'FAIL'})
                            </span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-3 text-right">
                          <span
                            className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${
                              isRegressed
                                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                                : isImproved
                                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : result.isCandidateCorrect
                                ? 'bg-slate-900 border-slate-700 text-slate-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            {result.status}
                          </span>
                        </td>

                        {/* Expand Chevron */}
                        <td className="py-3.5 px-2 text-slate-500">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </td>
                      </tr>

                      {/* Expandable detail row: Explainable Detective */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90">
                          <td colSpan={7} className="p-5 border-b border-slate-800 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Why did this test fail? */}
                              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono">
                                  <HelpCircle className="w-4 h-4" />
                                  <span>Failure Diagnostic (Why this failed):</span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                  {result.failureDiagnosis || result.explanation}
                                </p>
                                {result.failureCategory && (
                                  <div className="text-[11px] font-mono text-cyan-400 pt-1">
                                    Categorized: <span className="text-slate-300">{result.failureCategory.replace('_', ' ')}</span>
                                  </div>
                                )}
                              </div>

                              {/* Practical suggested next steps */}
                              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
                                  <Wrench className="w-4 h-4" />
                                  <span>Suggested Investigation Steps:</span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                  {result.suggestedInvestigationStep ||
                                    'Audit training distributions and evaluate tokenizer embeddings for the prompt entities.'}
                                </p>
                              </div>
                            </div>

                            {/* Normalized Strings & Diagnostic Data */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 font-mono text-xs">
                              <div>
                                <span className="text-slate-500 block text-[10px]">Normalized Expected</span>
                                <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded">
                                  "{result.normalizedExpected}"
                                </code>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">Normalized Baseline</span>
                                <code
                                  className={`bg-slate-950 px-1.5 py-0.5 rounded ${
                                    result.isBaselineCorrect ? 'text-emerald-300' : 'text-rose-400'
                                  }`}
                                >
                                  "{result.normalizedBaseline}"
                                </code>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">Normalized Candidate</span>
                                <code
                                  className={`bg-slate-950 px-1.5 py-0.5 rounded ${
                                    result.isCandidateCorrect ? 'text-emerald-300' : 'text-rose-400 font-bold'
                                  }`}
                                >
                                  "{result.normalizedCandidate}"
                                </code>
                              </div>
                            </div>

                            {result.testCase.notes && (
                              <div className="text-[11px] text-slate-400 italic">
                                Context Note: {result.testCase.notes}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
