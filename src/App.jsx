import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import LoadingExperience from './components/LoadingExperience';
import Result from './pages/Result';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import { predictLoan } from './ml/inference';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [runtimeError, setRuntimeError] = useState(null);
  const [assessmentKey, setAssessmentKey] = useState(0);

  // Initiates application assessment workflow with Under Review progression
  const handleStartAssessment = async (applicationData) => {
    setRuntimeError(null);
    setIsProcessing(true);
    setShowLoading(true);
    setPendingResult(null);

    try {
      // Execute CatBoost inference and SHAP explainability on backend
      const result = await predictLoan(applicationData);

      // Save pending result to be activated once Under Review animation finishes
      setPendingResult({
        ...result,
        rawApplication: { ...applicationData },
      });
    } catch (err) {
      console.error('Assessment execution failed:', err);
      setRuntimeError(
        err.message || 'Unable to complete underwriting assessment. Please check that the backend server is active and try again.'
      );
      setShowLoading(false);
      setIsProcessing(false);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setIsProcessing(false);
    if (pendingResult) {
      setAssessmentResult(pendingResult);
      setActivePage('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewAssessment = () => {
    setAssessmentResult(null);
    setPendingResult(null);
    setRuntimeError(null);
    setAssessmentKey((prev) => prev + 1);
    setActivePage('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050706] text-[#E6ECE8] selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Glassy Top Bar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Body */}
      <main className="flex-1">
        {runtimeError && (
          <div className="max-w-4xl mx-auto px-4 pt-28">
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-sm flex items-center justify-between gap-4 font-mono shadow-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{runtimeError}</span>
              </div>
              <button
                onClick={() => setRuntimeError(null)}
                className="px-3 py-1 rounded bg-red-900/60 hover:bg-red-800/80 text-white text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {showLoading ? (
          <LoadingExperience onComplete={handleLoadingComplete} />
        ) : (
          <>
            {activePage === 'home' && <Home setActivePage={setActivePage} />}
            {activePage === 'assessment' && (
              <Assessment
                key={assessmentKey}
                onStartAssessment={handleStartAssessment}
                isProcessing={isProcessing}
              />
            )}
            {activePage === 'result' && assessmentResult && (
              <Result
                assessmentResult={assessmentResult}
                onNewAssessment={handleNewAssessment}
              />
            )}
            {activePage === 'how-it-works' && <HowItWorks setActivePage={setActivePage} />}
            {activePage === 'about' && <About setActivePage={setActivePage} />}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

    </div>
  );
}
