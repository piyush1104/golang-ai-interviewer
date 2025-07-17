
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
          <span className="text-sm text-slate-300">
            {new Date(sub.timestamp).toLocaleString()}
          </span>
          <span className={`text-sm font-bold ${getScoreColor(sub.review.score)}`}>
            Score: {sub.review.score}
          </span>
        </button>
      ))}
    </div>
  );
};
