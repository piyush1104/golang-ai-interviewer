
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MCQ_PROBLEMS, MCQ_CATEGORIES } from '../constants';
import type { MCQ, MCQAnswerStatus, MCQCategory } from '../types';
import { AddMCQModal } from './AddMCQModal';
import { MCQCard } from './MCQCard';
import { MCQHistory } from './MCQHistory';
import { IconPlusCircle, IconChevronRight, IconChevronLeft, IconArrowLeft, IconClipboardList, IconHistory as IconHistorySidebar } from './Icons';

interface MCQPageProps {
  onBack: () => void;
}

const SidebarButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-md text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-300'
        : 'text-slate-300 hover:bg-slate-700/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const FilterButton: React.FC<{
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-cyan-500 text-white'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`}
  >
    {label} <span className="text-xs bg-slate-800/50 rounded-full px-1.5 py-0.5 ml-1">{count}</span>
  </button>
);

export const MCQPage: React.FC<MCQPageProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<'questions' | 'history'>('questions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [customMcqs, setCustomMcqs] = useLocalStorage<MCQ[]>('custom-mcqs', []);
  const [answers, setAnswers] = useLocalStorage<Record<string, MCQAnswerStatus>>('mcq-answers', {});
  const [filter, setFilter] = useState<MCQCategory | 'all'>('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const allQuestions = useMemo(() => [...MCQ_PROBLEMS, ...customMcqs.map(q => ({...q, isCustom: true}))], [customMcqs]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allQuestions.length };
    MCQ_CATEGORIES.forEach(cat => {
        counts[cat] = allQuestions.filter(q => q.category === cat).length;
    });
    return counts;
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    if (filter === 'all') return allQuestions;
    return allQuestions.filter(q => q.category === filter);
  }, [allQuestions, filter]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [filter]);

  const handleStatusChange = (mcqId: string, status: MCQAnswerStatus) => {
    setAnswers(prev => ({...prev, [mcqId]: status}));
  };
  
  const handleAddQuestion = (newQuestion: MCQ) => {
    setCustomMcqs(prev => [...prev, newQuestion]);
    setIsAddModalOpen(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(i => i - 1);
    }
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const QuizView = (
    <div>
      <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg w-full overflow-x-auto mb-6">
        <FilterButton label="All" count={categoryCounts.all} isActive={filter === 'all'} onClick={() => setFilter('all')} />
        {MCQ_CATEGORIES.map(cat => (
          <FilterButton key={cat} label={cat} count={categoryCounts[cat] || 0} isActive={filter === cat} onClick={() => setFilter(cat)} />
        ))}
      </div>

      <div className="bg-slate-800/50 p-4 sm:p-6 rounded-lg min-h-[400px]">
        {currentQuestion ? (
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-4 text-center">
              Question <span className="text-white font-bold">{currentQuestionIndex + 1}</span> of <span className="text-white font-bold">{filteredQuestions.length}</span>
            </h3>
            <MCQCard
              key={currentQuestion.id}
              mcq={currentQuestion}
              status={answers[currentQuestion.id]}
              onStatusChange={handleStatusChange}
            />
            <div className="mt-6 flex justify-between items-center">
              <button 
                onClick={handlePrev} 
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                <IconChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <button 
                onClick={handleNext} 
                disabled={currentQuestionIndex >= filteredQuestions.length - 1}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Next
                <IconChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <p className="text-slate-400 text-lg">No questions found for the selected filter.</p>
            <p className="text-slate-500 mt-2">Try selecting another category or adding your own questions!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <AddMCQModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddQuestion={handleAddQuestion}
      />
      <header className="mb-8 flex items-center relative">
         <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10"
          title="Go Back"
        >
          <IconArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-slate-100 text-center flex-grow">Golang Interview Quiz</h1>
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="space-y-2">
                <SidebarButton label="Questions" icon={<IconClipboardList className="w-5 h-5"/>} isActive={activeView === 'questions'} onClick={() => setActiveView('questions')} />
                <SidebarButton label="History" icon={<IconHistorySidebar className="w-5 h-5"/>} isActive={activeView === 'history'} onClick={() => setActiveView('history')} />
                <SidebarButton label="Modify Questions" icon={<IconPlusCircle className="w-5 h-5"/>} isActive={false} onClick={() => setIsAddModalOpen(true)} />
            </div>
        </aside>
        <main className="flex-grow min-w-0">
            {activeView === 'questions' ? QuizView : <MCQHistory allQuestions={allQuestions} answers={answers} />}
        </main>
      </div>
    </div>
  );
};
