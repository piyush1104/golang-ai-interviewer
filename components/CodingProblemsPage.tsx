
import React from 'react';
import { ProblemList } from './ProblemList';
import { PROBLEMS } from '../constants';
import { IconBrainCircuit, IconSettings, IconArrowLeft } from './Icons';
import type { Problem } from '../types';

interface CodingProblemsPageProps {
  onSelectProblem: (problem: Problem) => void;
  onOpenSettings: () => void;
  onBack: () => void;
}

export const CodingProblemsPage: React.FC<CodingProblemsPageProps> = ({ onSelectProblem, onOpenSettings, onBack }) => {
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-10 relative">
        <button
          onClick={onBack}
          className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10"
          title="Go Back"
        >
          <IconArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-2">
                <IconBrainCircuit className="w-10 h-10 text-cyan-400" />
                <h1 className="text-4xl font-extrabold text-slate-100">Machine Coding Problems</h1>
            </div>
            <p className="text-md text-slate-400">Select a problem to start practicing.</p>
        </div>

        <button 
          onClick={onOpenSettings} 
          className="absolute top-1/2 -translate-y-1/2 right-0 text-slate-400 hover:text-white transition-colors z-10" 
          title="Settings"
        >
          <IconSettings className="w-6 h-6" />
        </button>
      </header>
      
      <ProblemList problems={PROBLEMS} onSelectProblem={onSelectProblem} />
    </div>
  );
};
