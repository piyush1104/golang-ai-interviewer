
import React, { useState, useCallback } from 'react';
import { ProblemDetail } from './components/ProblemDetail';
import { SettingsModal } from './components/SettingsModal';
import { HomePage } from './components/HomePage';
import { CodingProblemsPage } from './components/CodingProblemsPage';
import { MCQPage } from './components/MCQPage';
import type { Problem } from './types';

export default function App() {
  const [page, setPage] = useState<'landing' | 'coding' | 'mcq'>('landing');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [onKeySaveAction, setOnKeySaveAction] = useState<((key: string) => void) | null>(null);
  const [modalContext, setModalContext] = useState<'general' | 'submit'>('general');

  const handleProblemSelect = useCallback((problem: Problem) => {
    setSelectedProblem(problem);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedProblem(null);
    setPage('coding'); // Return to the coding problems list
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

  const renderContent = () => {
    if (selectedProblem) {
      return (
        <ProblemDetail 
          problem={selectedProblem} 
          onBackToList={handleBackToList}
          onOpenSettings={handleOpenSettings}
        />
      );
    }

    switch (page) {
      case 'coding':
        return (
          <CodingProblemsPage
            onSelectProblem={handleProblemSelect}
            onOpenSettings={() => handleOpenSettings()}
            onBack={() => setPage('landing')}
          />
        );
      case 'mcq':
        return <MCQPage onBack={() => setPage('landing')} />;
      case 'landing':
      default:
        return <HomePage onNavigate={setPage} onOpenSettings={() => handleOpenSettings()} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        context={modalContext}
      />
      {renderContent()}
    </div>
  );
}
