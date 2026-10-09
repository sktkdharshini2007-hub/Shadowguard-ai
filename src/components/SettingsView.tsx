import React, { useState } from 'react';
import { GateThresholds } from '../types';
import {
  Sliders,
  Shield,
  Layers,
  Cpu,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  GitBranch,
  Cloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface SettingsViewProps {
  currentThresholds: GateThresholds;
  onUpdateThresholds: (thresholds: GateThresholds) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentThresholds,
  onUpdateThresholds,
}) => {
  const [minAccuracy, setMinAccuracy] = useState(currentThresholds.minCandidateAccuracy);
  const [maxDrop, setMaxDrop] = useState(currentThresholds.maxPermittedQualityDrop);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    onUpdateThresholds({
      minCandidateAccuracy: minAccuracy,
      maxPermittedQualityDrop: maxDrop,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleReset = () => {
    setMinAccuracy(80);
    setMaxDrop(10);
    setTrimWhitespace(true);
    setCaseInsensitive(true);
    onUpdateThresholds({
      minCandidateAccuracy: 80,
      maxPermittedQualityDrop: 10,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Gate Policies & Environment Invariants
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">CI/CD Governance</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Gate Invariants & System Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tune release criteria, answer normalization algorithms, and review the transparent simulation disclosure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Invariants</span>
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Gate invariants updated and saved successfully!</span>
          </div>
        )}
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gate Invariants Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Release Gate Decision Rules
            </h2>
          </div>

          <div className="space-y-6">
            {/* Min Accuracy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Minimum Candidate Accuracy
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Candidate must score at or above this threshold to qualify for release
                  </span>
                </div>
                <span className="font-mono text-cyan-400 font-bold text-sm tabular-nums">
                  {minAccuracy}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={minAccuracy}
                onChange={(e) => setMinAccuracy(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50%</span>
                <span>Production Standard: 80%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Max Permitted Quality Drop */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Maximum Permitted Quality Drop
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Baseline accuracy minus candidate accuracy in percentage points
                  </span>
                </div>
                <span className="font-mono text-amber-400 font-bold text-sm tabular-nums">
                  {maxDrop}% pts
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={maxDrop}
                onChange={(e) => setMaxDrop(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% pts (Zero Drop)</span>
                <span>Standard Limit: 10% pts</span>
                <span>40% pts</span>
              </div>
            </div>

            {/* Answer Normalization Options */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <h3 className="text-xs font-mono uppercase text-slate-400">
                Evaluation Normalization Engine
              </h3>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Case-Insensitive Folding
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Evaluates "water" identical to "Water"
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={caseInsensitive}
                    onChange={(e) => setCaseInsensitive(e.target.checked)}
                    className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Whitespace Trimming
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Strips leading and trailing spaces around candidate outputs
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={trimWhitespace}
                    onChange={(e) => setTrimWhitespace(e.target.checked)}
                    className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Hackathon Context & Simulation Disclosure */}
        <div className="space-y-6">
          {/* Hackathon Team Card */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Hackathon Project Specification
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/30 via-slate-900/80 to-slate-950 border border-violet-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-violet-400 uppercase">
                  HORIZON 2K26
                </span>
                <span className="text-[10px] font-mono bg-violet-950/80 border border-violet-500/40 text-violet-300 px-2 py-0.5 rounded">
                  COMPETITION ENTRY
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                Track: Cloud Computing, DevOps & Scalable Systems
              </div>
              <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="text-slate-500">Team Members:</span>
                <span className="text-cyan-400 font-semibold">Dharshini</span>
                <span className="text-slate-600">&</span>
                <span className="text-cyan-400 font-semibold">Suba</span>
              </div>
            </div>
          </div>

          {/* Transparency: Simulated vs Functional Feature Matrix */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Functional Engine vs. Simulated Metrics Disclosure
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Genuinely Functional in TypeScript:</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px] font-mono pl-1">
                  <li>Deterministic answer normalization & case-folding</li>
                  <li>Regression detection: (Base PASS & Cand FAIL)</li>
                  <li>Improvement detection: (Base FAIL & Cand PASS)</li>
                  <li>Release gate evaluation (Accuracy & Drop thresholds)</li>
                  <li>Documented Risk Assessment rules (LOW/MEDIUM/HIGH)</li>
                  <li>Explainable Detective failure diagnosis generator</li>
                  <li>LocalStorage persistence & JSON report export</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5 font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulated / Mock Data:</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px] font-mono pl-1">
                  <li>Model endpoint outputs (simulated benchmark answers)</li>
                  <li>Inference latency (simulated 420ms vs 115ms estimates)</li>
                  <li>Token costs (simulated $0.90 vs $0.15/1M token scale)</li>
                  <li>Release action (advisory gate recommendations only)</li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Note: ShadowGuard is an explainability and regression audit tool; model retraining and dataset modifications must be performed by ML engineers in the training pipeline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
