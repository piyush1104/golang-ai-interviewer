
import React from 'react';
import type { Problem } from '../types';

interface ProblemSelectorProps {
  problems: Problem[];
  selectedProblem: Problem | null;
  onSelect: (problem: Problem) => void;
}

export const ProblemSelector: React.FC<ProblemSelectorProps> = ({ problems, selectedProblem, onSelect }) => {
  return (
    <nav className="flex flex-col space-y-2">
      {problems.map((problem) => (
        <button
          key={problem.id}
          onClick={() => onSelect(problem)}
          className={`w-full text-left p-3 rounded-md text-sm font-medium transition-colors duration-200 ${
            selectedProblem?.id === problem.id
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          {problem.title}
        </button>
      ))}
    </nav>
  );
};