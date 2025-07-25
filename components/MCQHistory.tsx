
import React, { useMemo } from 'react';
import type { MCQ, MCQAnswerStatus } from '../types';
import { IconCheckCircle, IconAlertTriangle } from './Icons';

interface MCQHistoryProps {
  allQuestions: (MCQ & { isCustom?: boolean })[];
  answers: Record<string, MCQAnswerStatus>;
}

export const MCQHistory: React.FC<MCQHistoryProps> = ({ allQuestions, answers }) => {

  const answeredQuestions = useMemo(() => {
    return Object.keys(answers)
      .map(id => {
        const question = allQuestions.find(q => q.id === id);
        if (!question) return null;
        return {
          ...question,
          status: answers[id],
        };
      })
      .filter(Boolean) as (MCQ & { status: MCQAnswerStatus })[];
  }, [allQuestions, answers]);
  
  if (answeredQuestions.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg">
        <p className="text-slate-400 text-lg">No questions have been answered yet.</p>
        <p className="text-slate-500 mt-2">Go to the 'Questions' tab and start the quiz!</p>
      </div>
    );
  }
  
  const passedCount = answeredQuestions.filter(q => q.status === 'passed').length;
  const totalAnswered = answeredQuestions.length;
  const score = totalAnswered > 0 ? Math.round((passedCount / totalAnswered) * 100) : 0;

  return (
    <div>
        <div className="bg-slate-800/50 p-5 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Your Progress</h2>
            <div className="flex flex-wrap items-center justify-between text-lg gap-4">
                <span className="text-slate-300">Total Answered: <span className="font-bold text-white">{totalAnswered}</span></span>
                <span className="text-green-400">Passed: <span className="font-bold">{passedCount}</span></span>
                <span className="text-red-400">Failed: <span className="font-bold">{totalAnswered - passedCount}</span></span>
                <span className="text-cyan-400">Score: <span className="font-bold">{score}%</span></span>
            </div>
        </div>
        <div className="space-y-3">
            {answeredQuestions.map(q => (
                <div key={q.id} className="bg-slate-800 p-4 rounded-md border border-slate-700 flex justify-between items-center">
                    <div>
                        <p className="text-slate-200">{q.question}</p>
                        <span className="text-xs text-slate-400">{q.category}</span>
                    </div>
                    {q.status === 'passed' ? (
                        <span className="flex items-center gap-2 text-sm font-semibold text-green-400">
                            <IconCheckCircle className="w-5 h-5" /> Passed
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-sm font-semibold text-red-400">
                            <IconAlertTriangle className="w-5 h-5" /> Failed
                        </span>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};
