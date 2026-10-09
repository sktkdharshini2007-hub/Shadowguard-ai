import React, { useState, useEffect } from 'react';
import { ActiveTab, EvaluationReport, GateThresholds, TestCase, ModelMetadata } from './types';
import {
  DEFAULT_TEST_CASES,
  DEFAULT_THRESHOLDS,
  DEFAULT_MODELS,
} from './data/defaultTestCases';
import {
  getSavedReports,
  saveNewReport,
  getActiveReport,
  setActiveReport,
  deleteReportById,
  clearAllReports,
} from './utils/storage';
import { runFullEvaluation } from './utils/evaluator';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NewEvaluationView } from './components/NewEvaluationView';
import { RegressionAnalysisView } from './components/RegressionAnalysisView';
import { EvaluationHistoryView } from './components/EvaluationHistoryView';
import { SettingsView } from './components/SettingsView';
import { ReportModal } from './components/ReportModal';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [allReports, setAllReports] = useState<EvaluationReport[]>([]);
  const [activeReport, setActiveReportState] = useState<EvaluationReport | null>(null);
  const [thresholds, setThresholds] = useState<GateThresholds>(DEFAULT_THRESHOLDS);
  const [models, setModels] = useState<ModelMetadata>(DEFAULT_MODELS);
  const [testCases, setTestCases] = useState<TestCase[]>(DEFAULT_TEST_CASES);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [modalReport, setModalReport] = useState<EvaluationReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const saved = getSavedReports();
    setAllReports(saved);

    const active = getActiveReport();
    setActiveReportState(active);
    if (active) {
      setThresholds(active.thresholds);
      setModels(active.models);
      if (active.testResults && active.testResults.length > 0) {
        setTestCases(active.testResults.map((r) => r.testCase));
      }
    }
  }, []);

  // Quick evaluation trigger from top header CTA
  const handleQuickRun = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const report = runFullEvaluation(testCases, thresholds, models);
      saveNewReport(report);
      setAllReports(getSavedReports());
      setActiveReportState(report);
      setIsEvaluating(false);

      if (report.decision === 'PROMOTE') {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }

      setModalReport(report);
      setIsModalOpen(true);
    }, 600);
  };

  // Called when NewEvaluationView completes an evaluation
  const handleEvaluationComplete = (report: EvaluationReport) => {
    saveNewReport(report);
    setAllReports(getSavedReports());
    setActiveReportState(report);
    setModalReport(report);
    setIsModalOpen(true);
  };

  // View a report in modal
  const handleOpenReportModal = (report: EvaluationReport) => {
    setModalReport(report);
    setIsModalOpen(true);
  };

  // Load a report into active workspace
  const handleLoadIntoActive = (report: EvaluationReport) => {
    setActiveReportState(report);
    setActiveReport(report);
    setThresholds(report.thresholds);
    setModels(report.models);
    setTestCases(report.testResults.map((r) => r.testCase));
    setActiveTab('regression-analysis');
  };

  // Delete a report from history
  const handleDeleteReport = (id: string) => {
    const updated = deleteReportById(id);
    setAllReports(updated);
    if (activeReport?.id === id && updated.length > 0) {
      setActiveReportState(updated[0]);
      setActiveReport(updated[0]);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    clearAllReports();
    setAllReports([]);
  };

  // Update thresholds from Settings
  const handleUpdateThresholds = (newThresholds: GateThresholds) => {
    setThresholds(newThresholds);
    if (activeReport) {
      const reevaluated = runFullEvaluation(
        activeReport.testResults.map((r) => r.testCase),
        newThresholds,
        activeReport.models
      );
      saveNewReport(reevaluated);
      setAllReports(getSavedReports());
      setActiveReportState(reevaluated);
    }
  };

  if (!activeReport) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickRun={handleQuickRun}
        isEvaluating={isEvaluating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            activeReport={activeReport}
            allReports={allReports}
            onNavigateToNew={() => setActiveTab('new-evaluation')}
            onNavigateToRegression={() => setActiveTab('regression-analysis')}
            onNavigateToHistory={() => setActiveTab('history')}
            onViewReport={handleOpenReportModal}
            isEvaluating={isEvaluating}
          />
        )}

        {activeTab === 'new-evaluation' && (
          <NewEvaluationView
            onEvaluationComplete={handleEvaluationComplete}
            initialThresholds={thresholds}
            initialModels={models}
            initialTestCases={testCases}
          />
        )}

        {activeTab === 'regression-analysis' && (
          <RegressionAnalysisView
            report={activeReport}
            allReports={allReports}
            onOpenReportModal={() => handleOpenReportModal(activeReport)}
          />
        )}

        {activeTab === 'history' && (
          <EvaluationHistoryView
            reports={allReports}
            onViewReport={handleOpenReportModal}
            onLoadIntoActive={handleLoadIntoActive}
            onDeleteReport={handleDeleteReport}
            onClearAll={handleClearAllHistory}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentThresholds={thresholds}
            onUpdateThresholds={handleUpdateThresholds}
          />
        )}
      </main>

      {/* Report Modal */}
      <ReportModal
        report={modalReport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a12] py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SHADOWGUARD</span>
            <span>·</span>
            <span>AI Model Deployment & Regression Gate</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>HORIZON 2K26</span>
            <span>·</span>
            <span>Cloud Computing, DevOps & Scalable Systems</span>
            <span>·</span>
            <span className="text-cyan-400">Team: Dharshini & Suba</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
