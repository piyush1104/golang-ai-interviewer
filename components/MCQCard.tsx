
import React, { useState, useEffect } from 'react';
import type { MCQ, MCQAnswerStatus } from '../types';
import { CodeEditor } from './CodeEditor';
import { IconCheckCircle, IconAlertTriangle } from './Icons';

interface MCQCardProps {
  mcq: MCQ & { isCustom?: boolean };
  status?: MCQAnswerStatus;
  onStatusChange: (mcqId: string, status: MCQAnswerStatus) => void;
}

export const MCQCard: React.FC<MCQCardProps> = ({ mcq, status, onStatusChange }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(!!status);

  useEffect(() => {
    setIsAnswered(!!status);
    setSelectedOption(null);
  }, [mcq.id, status]);

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    const newStatus = selectedOption === mcq.correctAnswerIndex ? 'passed' : 'failed';
    onStatusChange(mcq.id, newStatus);
  };

  const getOptionClasses = (index: number) => {
    const base = "w-full text-left p-3 rounded-md border transition-all duration-200 flex items-center gap-3";
    
    if (!isAnswered) {
      return `${base} bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-cyan-400 ${selectedOption === index ? '!border-cyan-400 !bg-slate-700 ring-2 ring-cyan-400' : ''}`;
    }

    const isCorrect = index === mcq.correctAnswerIndex;
    const isSelected = index === selectedOption;

    if (isCorrect) {
      return `${base} bg-green-500/20 border-green-500 text-green-300 font-semibold`;
    }
    if (isSelected && !isCorrect) {
      return `${base} bg-red-500/20 border-red-500 text-red-300 font-semibold`;
    }

    return `${base} bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed opacity-70`;
  };

  const StatusBadge = () => {
    if (!status) return null;
    if (status === 'passed') {
      return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Passed</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Failed</span>;
  }

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow">
            <h3 className="font-bold text-lg text-slate-100 mb-1">
                {mcq.question}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">{mcq.category}</span>
              {mcq.isCustom && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">Custom</span>}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
             <StatusBadge />
          </div>
        </div>

        {mcq.codeSnippet && (
            <div className="my-4 rounded-md overflow-hidden border border-slate-700 max-h-60">
                <CodeEditor code={mcq.codeSnippet} readOnly={true} />
            </div>
        )}

        <div className="space-y-3">
          {mcq.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              disabled={isAnswered}
              className={getOptionClasses(index)}
            >
              <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-slate-500 flex items-center justify-center">
                {selectedOption === index && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
              </div>
              <span className="flex-grow">{option}</span>
            </button>
          ))}
        </div>

        {!isAnswered && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-md transition-colors"
            >
              Check Answer
            </button>
          </div>
        )}
      </div>

      {isAnswered && (
        <div className={`border-t p-5 ${status === 'passed' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
           <h4 className="flex items-center gap-2 text-md font-bold mb-2">
            {status === 'passed' ? 
              <span className="text-green-400 flex items-center gap-2"><IconCheckCircle className="w-5 h-5" /> Correct!</span> : 
              <span className="text-red-400 flex items-center gap-2"><IconAlertTriangle className="w-5 h-5" /> Incorrect</span>
            }
          </h4>
          <p className="text-slate-300 leading-relaxed">{mcq.explanation}</p>
        </div>
      )}
    </div>
  );
};
