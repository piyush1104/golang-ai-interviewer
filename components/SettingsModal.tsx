
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { IconEye, IconEyeOff, IconSettings, IconAlertTriangle } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  context?: 'general' | 'submit';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, context = 'general' }) => {
  const [storedApiKey, setStoredApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [inputValue, setInputValue] = useState(storedApiKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setInputValue(storedApiKey);
    }
  }, [isOpen, storedApiKey]);
  
  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(inputValue);
    onSave(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    setStoredApiKey('');
  };

  const saveButtonText = context === 'submit' ? 'Save and Submit' : 'Save and Close';

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
    >
      <div 
        className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-100 mb-4">
          <IconSettings className="w-6 h-6 text-cyan-400" />
          <span>API Key Settings</span>
        </h2>
        
        <p className="text-slate-400 mb-4 text-sm">
          Your Gemini API key is stored securely in your browser's local storage and is never sent anywhere except to Google for analysis.
        </p>

        <div className="space-y-2 mb-6">
            <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-300">
                Gemini API Key
            </label>
            <div className="relative">
                <input
                    id="api-key-input"
                    type={showKey ? 'text' : 'password'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 pr-10 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter your API key"
                />
                <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white"
                    title={showKey ? 'Hide key' : 'Show key'}
                >
                    {showKey ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                </button>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {saveButtonText}
          </button>
          <button
            onClick={handleClear}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Clear Key
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
};