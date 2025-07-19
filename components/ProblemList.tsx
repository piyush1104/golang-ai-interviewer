import React from 'react';
import type { Problem, SubmissionWithReview } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { IconBrainCircuit, IconCheckCircle, IconHistory, IconChevronRight, IconSettings } from './Icons';

interface ProblemListProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onOpenSettings: () => void;
}

const ProblemCard: React.FC<{ problem: Problem; onSelect: () => void }> = ({ problem, onSelect }) => {
  const [submissions] = useLocalStorage<SubmissionWithReview[]>(`submissions-${problem.id}`, []);
  
  const isAttempted = submissions.length > 0;
  const bestScore = isAttempted ? Math.max(...submissions.map(s => s.review.score)) : 0;
  const submissionsCount = submissions.length;

  const levelColor = {
    Hard: 'border-red-500/50 bg-red-500/10 text-red-400',
    Medium: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    Easy: 'border-green-500/50 bg-green-500/10 text-green-400',
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      onClick={onSelect}
      className="group bg-slate-800 border border-slate-700/50 rounded-lg p-6 hover:border-cyan-400/50 hover:bg-slate-700/60 cursor-pointer transition-all duration-300"
    >
      <div className="flex justify-between items-start gap-6">
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-300">{problem.title}</h3>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${levelColor[problem.tags.level]}`}>
              {problem.tags.level}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">
              {problem.tags.concept}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-6 text-sm text-slate-400 mt-1">
          {isAttempted ? (
              <>
                  <div className="flex items-center gap-2" title="Best Score">
                      <IconCheckCircle className={`w-5 h-5 ${getScoreColor(bestScore)}`} />
                      <span className={`font-bold ${getScoreColor(bestScore)}`}>{bestScore}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Submissions">
                      <IconHistory className="w-4 h-4" />
                      <span>{submissionsCount}</span>
                  </div>
              </>
          ) : (
              <span className="text-slate-500 italic">Not attempted</span>
          )}
          <IconChevronRight className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors duration-300" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-400 leading-relaxed">
        {problem.description}
      </p>
    </div>
  );
};


export const ProblemList: React.FC<ProblemListProps> = ({ problems, onSelectProblem, onOpenSettings }) => {
  return (
    <div className="relative max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
       <button 
        onClick={onOpenSettings} 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 text-slate-400 hover:text-white transition-colors z-10" 
        title="Settings"
      >
        <IconSettings className="w-6 h-6" />
      </button>
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-4 mb-2">
            <IconBrainCircuit className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-extrabold text-slate-100">GoLang AI Interviewer</h1>
        </div>
        <p className="text-lg text-slate-400">Select a problem to start your mock interview.</p>
      </header>
      <div className="space-y-4">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} onSelect={() => onSelectProblem(problem)} />
        ))}
      </div>
    </div>
  );
};