
import React from 'react';
import type { Review } from '../types';
import { IconX, IconCheckCircle, IconAlertTriangle } from './Icons';

interface ReviewModalProps {
  review: Review;
  onClose: () => void;
}

const getScoreColorClasses = (score: number): string => {
  if (score >= 90) return 'bg-green-500/10 text-green-400 border-green-500/30';
  if (score >= 75) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  return 'bg-red-500/10 text-red-400 border-red-500/30';
};

export const ReviewModal: React.FC<ReviewModalProps> = ({ review, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-100">Code Review Feedback</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <IconX className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-slate-900/50">
             <div className="flex-shrink-0">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${getScoreColorClasses(review.score)}`}>
                    <span className="text-4xl font-bold">{review.score}</span>
                </div>
            </div>
            <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-200 mb-1">Overall Score</h3>
                <p className="text-slate-400">{review.feedback}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-green-400 mb-3">
                    <IconCheckCircle className="w-5 h-5"/>
                    Strengths
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                    {review.strengths.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-yellow-400 mb-3">
                    <IconAlertTriangle className="w-5 h-5"/>
                    Areas for Improvement
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                    {review.areasForImprovement.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}
                </ul>
            </div>
          </div>

        </main>
        
        <footer className="flex-shrink-0 p-4 border-t border-slate-700 text-right">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
            >
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};
