
import React, { useState, useEffect, useCallback } from 'react';

export const Timer: React.FC = () => {
  const [duration, setDuration] = useState<number>(45 * 60); // Default 45 mins in seconds
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Add a sound or notification
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleStartStop = () => {
    if (timeLeft === 0) return;
    setIsActive(!isActive);
  };

  const handleReset = useCallback((newDuration: number) => {
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsActive(false);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const presets = [30, 45, 60];

  return (
    <div className="text-center">
      <div className="text-5xl font-mono font-bold text-slate-100 mb-4">{formatTime(timeLeft)}</div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <button onClick={handleStartStop} className={`px-4 py-2 rounded-md font-semibold text-white w-24 transition-colors ${isActive ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'}`}>
          {isActive ? 'Pause' : 'Start'}
        </button>
      </div>
      <div className="flex justify-center gap-2">
        {presets.map((minutes) => (
          <button
            key={minutes}
            onClick={() => handleReset(minutes * 60)}
            className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${duration === minutes * 60 ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
          >
            {minutes} min
          </button>
        ))}
      </div>
    </div>
  );
};
