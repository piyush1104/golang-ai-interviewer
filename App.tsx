
import React, { useState, useCallback, useMemo } from 'react';
import { ProblemSelector } from './components/ProblemSelector';
import { CodeEditor } from './components/CodeEditor';
import { Timer } from './components/Timer';
import { SubmissionHistory } from './components/SubmissionHistory';
import { ReviewView } from './components/ReviewView';
import { IconBook, IconCode, IconHistory, IconSend, IconLoader, IconBrainCircuit } from './components/Icons';
import { PROBLEMS } from './constants';
import type { Problem, SubmissionWithReview } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getReview } from './services/geminiService';

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(PROBLEMS[0]);
  const [code, setCode] = useState<string>(PROBLEMS[0].skeletonCode);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submissions, setSubmissions] = useLocalStorage<Record<string, SubmissionWithReview[]>>('golang-submissions', {});

  const [view, setView] = useState<'editor' | 'review'>('editor');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithReview | null>(null);


  const currentSubmissions = useMemo(() => {
    return selectedProblem ? submissions[selectedProblem.id] || [] : [];
  }, [selectedProblem, submissions]);

  const handleProblemSelect = useCallback((problem: Problem) => {
    setSelectedProblem(problem);
    setCode(problem.skeletonCode);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedProblem || !code) return;

    setIsLoading(true);
    try {
      const geminiReview = await getReview(code, selectedProblem);
      if (geminiReview) {
        const newSubmission: SubmissionWithReview = {
          id: `sub-${Date.now()}`,
          problemId: selectedProblem.id,
          code,
          timestamp: new Date().toISOString(),
          review: geminiReview
        };
        
        setSubmissions(prev => ({
          ...prev,
          [selectedProblem.id]: [newSubmission, ...(prev[selectedProblem.id] || [])]
        }));

        setSelectedSubmission(newSubmission);
        setView('review');
      }
    } catch (error) {
      console.error("Failed to get review from Gemini:", error);
      alert("Sorry, an error occurred while getting the review. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [code, selectedProblem, setSubmissions]);

  const handleBackToEditor = () => {
    setSelectedSubmission(null);
    setView('editor');
  };

  if (view === 'review' && selectedSubmission) {
    return <ReviewView submission={selectedSubmission} onBack={handleBackToEditor} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBrainCircuit className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-slate-100">GoLang AI Interviewer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-slate-800 rounded-lg shadow-lg p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-400 mb-4">
              <IconBook className="w-5 h-5" />
              <span>Interview Problems</span>
            </h2>
            <ProblemSelector
              problems={PROBLEMS}
              selectedProblem={selectedProblem}
              onSelect={handleProblemSelect}
            />
          </div>

          {selectedProblem && (
            <div className="bg-slate-800 rounded-lg shadow-lg p-5">
              <h3 className="text-lg font-bold text-slate-200 mb-2">{selectedProblem.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{selectedProblem.description}</p>
            </div>
          )}

          <div className="bg-slate-800 rounded-lg shadow-lg p-5">
            <Timer />
          </div>

          <div className="bg-slate-800 rounded-lg shadow-lg p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-400 mb-4">
              <IconHistory className="w-5 h-5" />
              <span>Submission History</span>
            </h2>
            <SubmissionHistory submissions={currentSubmissions} onSelect={(submission) => {
                setSelectedSubmission(submission);
                setView('review');
            }} />
          </div>
        </aside>

        {/* Right Panel */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <div className="bg-slate-800 rounded-lg shadow-lg flex-grow flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-slate-700">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-400">
                <IconCode className="w-5 h-5" />
                <span>Code Editor</span>
              </h2>
            </div>
            <div className="flex-grow relative">
                <CodeEditor code={code} onChange={setCode} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-slate-700">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedProblem}
                className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <IconLoader className="animate-spin w-5 h-5" />
                    <span>Reviewing...</span>
                  </>
                ) : (
                  <>
                    <IconSend className="w-5 h-5" />
                    <span>Submit for Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
