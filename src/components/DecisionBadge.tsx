import React from 'react';
import { EvaluationDecision, RiskLevel } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

interface DecisionBadgeProps {
  decision: EvaluationDecision;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showDetails?: boolean;
  regressionCount?: number;
  qualityDrop?: number;
  riskLevel?: RiskLevel;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  decision,
  size = 'md',
  showDetails = false,
  regressionCount = 0,
  qualityDrop = 0,
  riskLevel,
}) => {
  const isPromote = decision === 'PROMOTE';

  const riskBadgeStyles = {
    LOW: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    MEDIUM: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    HIGH: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
  };

  if (size === 'hero') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isPromote
            ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-emerald-950/20 text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.15)]'
            : 'border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-rose-950/20 text-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.15)]'
        } p-6 sm:p-7`}
      >
        {/* Glow ambient highlight */}
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isPromote ? 'bg-emerald-400' : 'bg-rose-500'
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${
                isPromote
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {isPromote ? (
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              ) : (
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Advisory Gate Recommendation
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    isPromote
                      ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {isPromote ? 'RECOMMENDED: PROMOTE' : 'RECOMMENDED: BLOCK'}
                </span>
                {riskLevel && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                      riskBadgeStyles[riskLevel]
                    }`}
                  >
                    RISK: {riskLevel}
                  </span>
                )}
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 ${
                  isPromote ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {decision}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                (Advisory gate recommendation only · Requires engineering approval for actual prod rollout)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:border-l sm:border-slate-800 sm:pl-6 text-sm">
            {riskLevel && (
              <div>
                <div className="text-xs text-slate-400 font-mono">Deployment Risk</div>
                <div
                  className={`text-xl font-bold font-mono tabular-nums ${
                    riskLevel === 'LOW'
                      ? 'text-emerald-400'
                      : riskLevel === 'MEDIUM'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {riskLevel}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-400 font-mono">Regressions</div>
              <div
                className={`text-xl font-bold font-mono tabular-nums ${
                  regressionCount === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {regressionCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">Quality Delta</div>
              <div
                className={`text-xl font-bold font-mono tabular-nums ${
                  qualityDrop <= 0
                    ? 'text-emerald-400'
                    : qualityDrop <= 10
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {qualityDrop > 0 ? `-${qualityDrop.toFixed(1)}%` : `+${Math.abs(qualityDrop).toFixed(1)}%`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-bold text-sm tracking-wide ${
            isPromote
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {isPromote ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>RECOMMENDED: {decision}</span>
        </div>
        {riskLevel && (
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              riskBadgeStyles[riskLevel]
            }`}
          >
            {riskLevel} RISK
          </span>
        )}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
            isPromote
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
          }`}
        >
          {isPromote ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          <span>{decision}</span>
        </span>
        {riskLevel && (
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              riskBadgeStyles[riskLevel]
            }`}
          >
            {riskLevel}
          </span>
        )}
      </div>
    );
  }

  // Default 'md'
  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
          isPromote
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}
      >
        {isPromote ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
        <span>{decision}</span>
        {showDetails && (
          <span className="text-slate-400 font-normal ml-1">
            ({regressionCount} regr · {qualityDrop > 0 ? `-${qualityDrop}%` : `+${Math.abs(qualityDrop)}%`})
          </span>
        )}
      </div>
      {riskLevel && (
        <span
          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
            riskBadgeStyles[riskLevel]
          }`}
        >
          {riskLevel} RISK
        </span>
      )}
    </div>
  );
};
