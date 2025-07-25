import React, { useState, useEffect } from 'react';
import type { MCQ } from '../types';

interface AddMCQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (mcq: MCQ) => void;
}

const initialFormState = {
  question: '',
  codeSnippet: '',
  options: ['', ''],
  correctAnswerIndex: -1,
  explanation: '',
  category: 'Concepts' as MCQ['category'],
};

export const AddMCQModal: React.FC<AddMCQModalProps> = ({ isOpen, onClose, onAddQuestion }) => {
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormState(initialFormState);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formState.options];
    newOptions[index] = value;
    setFormState(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formState.options.length < 6) {
        setFormState(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removeOption = (index: number) => {
    if (formState.options.length > 2) {
        const newOptions = formState.options.filter((_, i) => i !== index);
        // Adjust correct answer index if it's affected
        const newCorrectIndex = formState.correctAnswerIndex === index ? -1 : (formState.correctAnswerIndex > index ? formState.correctAnswerIndex - 1 : formState.correctAnswerIndex);
        setFormState(prev => ({ ...prev, options: newOptions, correctAnswerIndex: newCorrectIndex }));
    }
  };

  const handleSubmit = () => {
    if (!formState.question.trim()) {
        setError('Question cannot be empty.');
        return;
    }
    if (formState.options.some(opt => !opt.trim())) {
        setError('All options must be filled.');
        return;
    }
    if (formState.correctAnswerIndex === -1) {
        setError('Please select a correct answer.');
        return;
    }
    if (!formState.explanation.trim()) {
        setError('Explanation cannot be empty.');
        return;
    }
    
    setError('');
    onAddQuestion({
        ...formState,
        id: `custom-${new Date().getTime()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h2 className="flex-shrink-0 text-2xl font-bold text-slate-100 mb-4">Add New MCQ</h2>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Question</label>
            <textarea name="question" value={formState.question} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Code Snippet (Optional)</label>
            <textarea name="codeSnippet" value={formState.codeSnippet} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 font-mono text-sm" rows={4} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
            <select name="category" value={formState.category} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200">
                <option>Concepts</option>
                <option>Syntax</option>
                <option>Concurrency</option>
                <option>Data Structures</option>
                <option>Code Fix</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Options (Mark the correct answer)</label>
            <div className="space-y-2">
                {formState.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="radio" name="correctAnswer" checked={formState.correctAnswerIndex === index} onChange={() => setFormState(prev => ({...prev, correctAnswerIndex: index}))} className="form-radio h-5 w-5 text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-500" />
                        <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className="flex-grow bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200" />
                        <button onClick={() => removeOption(index)} disabled={formState.options.length <= 2} className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
                    </div>
                ))}
            </div>
            <button onClick={addOption} disabled={formState.options.length >= 6} className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50">Add Option</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Explanation</label>
            <textarea name="explanation" value={formState.explanation} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200" rows={3} />
          </div>
        </div>
        <div className="flex-shrink-0 pt-4 mt-4 border-t border-slate-700">
          {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md">Cancel</button>
            <button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-md">Add Question</button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
      </div>
    </div>
  );
};
