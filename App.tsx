import React, { useState, useCallback } from 'react';
import { ProblemList } from './components/ProblemList';
import { ProblemDetail } from './components/ProblemDetail';
import { SettingsModal } from './components/SettingsModal';
import { PROBLEMS } from './constants';
import type { Problem } from './types';

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [onKeySaveAction, setOnKeySaveAction] = useState<((key: string) => void) | null>(null);
  const [modalContext, setModalContext] = useState<'general' | 'submit'>('general');

  const handleProblemSelect = useCallback((problem: Problem) => {
    setSelectedProblem(problem);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedProblem(null);
    setOnKeySaveAction(null); // Clean up callback
  }, []);
  
  const handleOpenSettings = useCallback((cb: ((key: string) => void) | null = null, context: 'general' | 'submit' = 'general') => {
    setOnKeySaveAction(() => cb);
    setModalContext(context);
    setIsSettingsModalOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsModalOpen(false);
    setOnKeySaveAction(null);
  }, []);

  const handleSaveSettings = useCallback((savedKey: string) => {
    if (onKeySaveAction) {
      onKeySaveAction(savedKey);
    }
    handleCloseSettings();
  }, [onKeySaveAction, handleCloseSettings]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        context={modalContext}
      />
      {selectedProblem ? (
        <ProblemDetail 
          problem={selectedProblem} 
          onBackToList={handleBackToList}
          onOpenSettings={handleOpenSettings}
        />
      ) : (
        <ProblemList 
          problems={PROBLEMS} 
          onSelectProblem={handleProblemSelect} 
          onOpenSettings={() => handleOpenSettings()}
        />
      )}
    </div>
  );
}