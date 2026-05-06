import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

export const CronometroTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

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

  const changeMinutes = (value: number) => {
    if (isActive) return;
    setMinutes((prev) => Math.max(0, prev + value));
  };

  const changeSeconds = (value: number) => {
    if (isActive) return;
    setSeconds((prev) => {
      let newValue = prev + value;
      if (newValue > 59) {
        setMinutes((m) => m + 1);
        return 0;
      }
      if (newValue < 0) {
        setMinutes((m) => Math.max(0, m - 1));
        return 59;
      }
      return newValue;
    });
  };

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-[340px] p-8 rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col items-center gap-8">

      <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">
        Cronômetro
      </span>

      {/* DISPLAY COM SETAS GRANDES */}
      <div className="flex items-center gap-6">
        {/* MINUTOS */}
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => changeMinutes(1)} 
            disabled={isActive}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all disabled:opacity-30"
          >
            <ChevronUp size={28} />
          </button>

          <div className="text-7xl font-mono font-bold text-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,0.4)] min-w-[100px] text-center">
            {format(minutes)}
          </div>

          <button 
            onClick={() => changeMinutes(-1)} 
            disabled={isActive}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all disabled:opacity-30"
          >
            <ChevronDown size={28} />
          </button>
        </div>

        <span className="text-6xl font-mono font-bold text-[#39FF14] pt-6">:</span>

        {/* SEGUNDOS */}
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => changeSeconds(1)} 
            disabled={isActive}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all disabled:opacity-30"
          >
            <ChevronUp size={28} />
          </button>

          <div className="text-7xl font-mono font-bold text-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,0.4)] min-w-[100px] text-center">
            {format(seconds)}
          </div>

          <button 
            onClick={() => changeSeconds(-1)} 
            disabled={isActive}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all disabled:opacity-30"
          >
            <ChevronDown size={28} />
          </button>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="flex items-center gap-6 pt-2">
        <button
          onClick={toggleTimer}
          className="w-20 h-20 rounded-full border-2 border-[#39FF14] flex items-center justify-center text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
        >
          {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
        </button>

        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* PRESETS */}
      <div className="flex gap-3">
        {[30, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            onClick={() => {
              setIsActive(false);
              setMinutes(Math.floor(sec / 60));
              setSeconds(sec % 60);
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all"
          >
            {sec < 60 ? `${sec}s` : `${sec / 60}min`}
          </button>
        ))}
      </div>
    </div>
  );
};