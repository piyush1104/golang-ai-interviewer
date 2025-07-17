import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IconPlay, IconRefreshCw } from './Icons';

const IconPause: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
);

const PRESETS = [30, 45, 60]; // in minutes

export const Timer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(PRESETS[0] * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0) {
        setIsActive(false);
    }
    
    if(!isActive && intervalRef.current) {
        clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const handleStartStop = () => {
    if (timeLeft > 0) {
        setIsActive(!isActive);
    }
  };
  
  const handleSetTime = useCallback((minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  }, []);

  const handleReset = useCallback(() => {
    const currentPresetMinutes = PRESETS.find(p => p * 60 === timeLeft) ?? PRESETS[0];
    handleSetTime(currentPresetMinutes);
  }, [timeLeft, handleSetTime]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4">
       <div className="flex items-center gap-2">
            {PRESETS.map(minutes => (
                <button
                    key={minutes}
                    onClick={() => handleSetTime(minutes)}
                    className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                        Math.floor(timeLeft / 60) === minutes && !isActive
                        ? 'bg-cyan-500 text-white font-semibold'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                >
                    {minutes}m
                </button>
            ))}
      </div>
      <div className="text-2xl font-mono font-bold text-green-400 w-24 text-center">
        {formatTime(timeLeft)}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleStartStop} className="text-slate-300 hover:text-white transition-colors" title={isActive ? 'Pause' : 'Start'}>
          {isActive ? <IconPause className="w-5 h-5" /> : <IconPlay className="w-5 h-5 fill-current" />}
        </button>
        <button onClick={handleReset} className="text-slate-300 hover:text-white transition-colors" title="Reset">
          <IconRefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};