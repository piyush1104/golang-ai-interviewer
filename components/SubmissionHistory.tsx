
import React from 'react';
import type { SubmissionWithReview } from '../types';

interface SubmissionHistoryProps {
  submissions: SubmissionWithReview[];
  onSelect: (submission: SubmissionWithReview) => void;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
};

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ submissions, onSelect }) => {
  if (submissions.length === 0) {
    return <p className="text-slate-400 text-sm text-center">No submissions for this problem yet.</p>;
  }

  return (
    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
      {submissions.map((sub) => (
        <button
          key={sub.id}
          onClick={() => onSelect(sub)}
          className="w-full flex justify-between items-center p-3 rounded-md bg-slate-700/50 hover:bg-slate-700 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">
              {new Date(sub.timestamp).toLocaleString()}
            </span>
            {sub.isMock && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Mock
              </span>
            )}
          </div>
          <span className={`text-sm font-bold ${getScoreColor(sub.review.score)}`}>
            Score: {sub.review.score}
          </span>
        </button>
      ))}
    </div>
  );
};