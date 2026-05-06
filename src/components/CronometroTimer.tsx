import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

export const CronometroTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTimeLeft(minutes * 60 + seconds);
  }, [minutes, seconds]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    setMinutes(mins);
    setSeconds(secs);
    if (timeLeft === 0) setIsActive(false);
  }, [timeLeft]);

  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(1);
    setSeconds(0);
  };

  const adjustMinutes = (delta: number) => {
    if (isActive) return;
    setMinutes(prev => Math.max(0, prev + delta));
  };

  const adjustSeconds = (delta: number) => {
    if (isActive) return;
    setSeconds(prev => {
      const newValue = prev + delta;
      if (newValue >= 60) {
        setMinutes(m => m + 1);
        return 0;
      }
      if (newValue < 0) {
        setMinutes(m => Math.max(0, m - 1));
        return 59;
      }
      return newValue;
    });
  };

  const handleTimeInput = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = inputValue.split(':');
    if (parts.length === 2) {
      const mins = Math.min(99, Math.max(0, parseInt(parts[0]) || 0));
      const secs = Math.min(59, Math.max(0, parseInt(parts[1]) || 0));
      setMinutes(mins);
      setSeconds(secs);
    }
    setIsEditing(false);
  };

  const setPreset = (min: number) => {
    setIsActive(false);
    setMinutes(min);
    setSeconds(0);
  };

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-[400px] p-8 rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col items-center gap-6">

      <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">
        Cronômetro
      </span>

      {/* DISPLAY PRINCIPAL COM INPUT */}
      {isEditing ? (
        <form onSubmit={handleTimeInput} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder="MM:SS"
            autoFocus
            className="text-6xl font-mono font-bold text-center text-[#39FF14] bg-transparent border-b-2 border-[#39FF14] outline-none w-48 drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]"
          />
        </form>
      ) : (
        <div 
          onClick={() => {
            if (!isActive) {
              setInputValue(`${format(minutes)}:${format(seconds)}`);
              setIsEditing(true);
            }
          }}
          className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {/* MINUTOS */}
          <div className="flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); adjustMinutes(1); }}
              disabled={isActive}
              className="text-[#39FF14] hover:scale-125 transition-transform disabled:opacity-30 p-2"
            >
              <Plus size={32} />
            </button>
            
            <div className="text-8xl font-mono font-bold text-[#39FF14] drop-shadow-[0_0_25px_rgba(57,255,20,0.5)] min-w-[80px] text-center">
              {format(minutes)}
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); adjustMinutes(-1); }}
              disabled={isActive}
              className="text-[#39FF14] hover:scale-125 transition-transform disabled:opacity-30 p-2"
            >
              <Minus size={32} />
            </button>
            
            <span className="text-xs text-gray-500 mt-1">min</span>
          </div>

          <span className="text-6xl font-mono font-bold text-[#39FF14] pt-8">:</span>

          {/* SEGUNDOS */}
          <div className="flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); adjustSeconds(1); }}
              disabled={isActive}
              className="text-[#39FF14] hover:scale-125 transition-transform disabled:opacity-30 p-2"
            >
              <Plus size={32} />
            </button>
            
            <div className="text-8xl font-mono font-bold text-[#39FF14] drop-shadow-[0_0_25px_rgba(57,255,20,0.5)] min-w-[80px] text-center">
              {format(seconds)}
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); adjustSeconds(-1); }}
              disabled={isActive}
              className="text-[#39FF14] hover:scale-125 transition-transform disabled:opacity-30 p-2"
            >
              <Minus size={32} />
            </button>
            
            <span className="text-xs text-gray-500 mt-1">seg</span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        Toque nos números para digitar • Use + / - para ajustar
      </p>

      {/* CONTROLES PRINCIPAIS */}
      <div className="flex items-center gap-8 pt-2">
        <button
          onClick={toggleTimer}
          className="w-28 h-28 rounded-full border-4 border-[#39FF14] flex items-center justify-center text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all shadow-[0_0_40px_rgba(57,255,20,0.5)]"
        >
          {isActive ? <Pause size={40} /> : <Play size={40} fill="currentColor" />}
        </button>

        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      {/* PRESETS */}
      <div className="w-full">
        <p className="text-xs text-gray-500 text-center mb-3">Selecione um tempo</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60].map((min) => (
            <button
              key={min}
              onClick={() => setPreset(min)}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all"
            >
              {min}min
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};