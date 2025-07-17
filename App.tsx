import React, { useState, useCallback } from 'react';
import { ProblemList } from './components/ProblemList';
import { ProblemDetail } from './components/ProblemDetail';
import { PROBLEMS } from './constants';
import type { Problem } from './types';

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const handleProblemSelect = useCallback((problem: Problem) => {
    setSelectedProblem(problem);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedProblem(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      {selectedProblem ? (
        <ProblemDetail 
          problem={selectedProblem} 
          onBackToList={handleBackToList}
        />
      ) : (
        <ProblemList 
          problems={PROBLEMS} 
          onSelectProblem={handleProblemSelect} 
        />
      )}
    </div>
  );
}
