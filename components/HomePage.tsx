
import React from 'react';
import { IconBrainCircuit, IconSettings } from './Icons';

interface HomePageProps {
  onNavigate: (page: 'coding' | 'mcq') => void;
  onOpenSettings: () => void;
}

const LandingButton: React.FC<{label: string, onClick: () => void}> = ({ label, onClick }) => (
    <div
        onClick={onClick}
        className="group bg-slate-800 border-2 border-slate-700/80 rounded-lg p-8 hover:border-cyan-400/80 hover:bg-slate-700/60 cursor-pointer transition-all duration-300 text-center"
    >
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-300">{label}</h3>
    </div>
);

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSettings }) => {
  return (
    <div className="max-w-screen-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-screen">
      <header className="text-center mb-10 relative">
        <button 
          onClick={onOpenSettings} 
          className="absolute top-0 right-0 text-slate-400 hover:text-white transition-colors z-10" 
          title="Settings"
        >
          <IconSettings className="w-6 h-6" />
        </button>
        <div className="flex justify-center items-center gap-4 mb-4">
            <IconBrainCircuit className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-extrabold text-slate-100">GoLang AI Interviewer</h1>
        </div>
        <p className="text-lg text-slate-400">Select a practice mode below to get started.</p>
      </header>
      
      <main className="grid grid-cols-1 gap-6">
        <LandingButton label="Machine Coding Problems →" onClick={() => onNavigate('coding')} />
        <LandingButton label="Golang Interview Quiz →" onClick={() => onNavigate('mcq')} />
      </main>
    </div>
  );
};
