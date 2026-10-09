import React, { useState } from 'react';
import { EvaluationReport } from '../types';
import { DecisionBadge } from './DecisionBadge';
import { downloadJsonReport } from '../utils/evaluator';
import {
  History,
  Trash2,
  Eye,
  Download,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Info,
} from 'lucide-react';

interface EvaluationHistoryViewProps {
  reports: EvaluationReport[];
  onViewReport: (report: EvaluationReport) => void;
  onLoadIntoActive: (report: EvaluationReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
}

export const EvaluationHistoryView: React.FC<EvaluationHistoryViewProps> = ({
  reports,
  onViewReport,
  onLoadIntoActive,
  onDeleteReport,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | 'PROMOTE' | 'BLOCK'>('ALL');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredReports = reports.filter((r) => {
    const matchesDecision = decisionFilter === 'ALL' || r.decision === decisionFilter;
    const matchesSearch =
      searchTerm === '' ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.models.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.models.baselineName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDecision && matchesSearch;
  });

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowguard-all-evaluations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Audit Trail & Historical Gate Registry
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                Persisted in localStorage ({reports.length} records)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Evaluation Audit History
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review saved release gates, model checkpoints, detected regressions, and risk categories. Seeded benchmark runs are transparently labeled.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportAll}
              disabled={reports.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All (JSON)</span>
            </button>

            {confirmClear ? (
              <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/60 p-1 rounded-lg">
                <span className="text-[11px] text-rose-300 px-2 font-mono">Confirm clear?</span>
                <button
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="px-2 py-1 text-xs font-bold text-white bg-rose-600 rounded hover:bg-rose-500 cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                disabled={reports.length === 0}
                className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-800/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by evaluation ID or model name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setDecisionFilter('ALL')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                decisionFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setDecisionFilter('PROMOTE')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                decisionFilter === 'PROMOTE'
                  ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-500/50'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Promoted ({reports.filter((r) => r.decision === 'PROMOTE').length})
            </button>
            <button
              onClick={() => setDecisionFilter('BLOCK')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                decisionFilter === 'BLOCK'
                  ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-500/50'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              Blocked ({reports.filter((r) => r.decision === 'BLOCK').length})
            </button>
          </div>
        </div>
      </div>

      {/* History Records Table / Cards */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 space-y-3">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-400">No evaluation records found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Run a new evaluation or apply a demo preset to log deployment gate reports to history.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                report.decision === 'PROMOTE'
                  ? 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-slate-900/40 border-slate-800 hover:border-rose-500/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left meta */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                      {report.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(report.timestamp).toLocaleString()}</span>
                    </span>
                    <DecisionBadge
                      decision={report.decision}
                      size="sm"
                      riskLevel={report.riskAssessment?.level}
                    />
                    {report.isDemoSeeded ? (
                      <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        Demo Seed (Simulated Benchmark)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                        Live User Evaluation Run
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-white break-words">
                    <span className="text-slate-400 font-normal">Candidate: </span>
                    <span className="text-cyan-300">{report.models.candidateName}</span>
                    <span className="text-slate-500 font-normal mx-2">vs</span>
                    <span className="text-slate-400 font-normal">Baseline: </span>
                    <span className="text-slate-300">{report.models.baselineName}</span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono line-clamp-1">
                    {report.decisionReason}
                  </p>
                </div>

                {/* Right stats and actions */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Numerical stats */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Candidate Acc</span>
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          report.candidateAccuracy >= report.thresholds.minCandidateAccuracy
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {report.candidateAccuracy.toFixed(1)}%
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Quality Drop</span>
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          report.qualityDrop <= report.thresholds.maxPermittedQualityDrop
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {report.qualityDrop > 0 ? `-${report.qualityDrop.toFixed(1)}%` : `+${Math.abs(report.qualityDrop).toFixed(1)}%`}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Regressions</span>
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          report.regressionCount === 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {report.regressionCount}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewReport(report)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="View Report"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Report</span>
                    </button>

                    <button
                      onClick={() => onLoadIntoActive(report)}
                      className="px-2.5 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Load into Gate View"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => downloadJsonReport(report)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Download JSON Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteReport(report.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
