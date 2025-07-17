
import React from 'react';
import type { SubmissionWithReview } from '../types';
import { IconCheckCircle, IconAlertTriangle, IconCode, IconArrowLeft, IconBrainCircuit } from './Icons';
import { CodeEditor } from './CodeEditor';

interface ReviewViewProps {
  submission: SubmissionWithReview;
  onBack: () => void;
}

const getScoreColorClasses = (score: number): string => {
  if (score >= 90) return 'bg-green-500/10 text-green-400 border-green-500/30';
  if (score >= 75) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  return 'bg-red-500/10 text-red-400 border-red-500/30';
};

export const ReviewView: React.FC<ReviewViewProps> = ({ submission, onBack }) => {
  const { review, code } = submission;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <IconBrainCircuit className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-slate-100">Submission Review</h1>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <IconArrowLeft className="w-5 h-5" />
            <span>Back to Editor</span>
          </button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Panel: Review */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 space-y-6 sticky top-24">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-slate-900/50">
             <div className="flex-shrink-0">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${getScoreColorClasses(review.score)}`}>
                    <span className="text-4xl font-bold">{review.score}</span>
                </div>
            </div>
            <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-200 mb-1">Overall Score</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{review.feedback}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-green-400 mb-3">
                    <IconCheckCircle className="w-5 h-5"/>
                    Strengths
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300 text-sm">
                    {review.strengths.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-yellow-400 mb-3">
                    <IconAlertTriangle className="w-5 h-5"/>
                    Areas for Improvement
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300 text-sm">
                    {review.areasForImprovement.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}
                </ul>
            </div>
          </div>
        </div>

        {/* Right Panel: Code */}
        <div className="bg-slate-800 rounded-lg shadow-lg flex-grow flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex-shrink-0 p-4 border-b border-slate-700">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-400">
              <IconCode className="w-5 h-5" />
              <span>Submitted Code</span>
            </h2>
          </div>
          <div className="flex-grow relative">
            <CodeEditor code={code} readOnly={true} />
          </div>
        </div>
      </main>
    </div>
  );
};
