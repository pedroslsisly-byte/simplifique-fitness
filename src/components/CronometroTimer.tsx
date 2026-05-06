import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const CronometroTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (timeLeft === 0) setIsActive(false);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(60);
  };

  const setPreset = (seconds: number) => {
    setIsActive(false);
    setTimeLeft(seconds);
  };

  const adjustTime = (amount: number) => {
    setTimeLeft((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="w-[320px] p-6 rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col items-center gap-6">

      {/* Título */}
      <span className="text-xs tracking-widest text-gray-500 uppercase">
        Cronômetro
      </span>

      {/* Display */}
      <div className="text-6xl font-mono font-semibold text-[#39FF14] tracking-wider drop-shadow-[0_0_10px_rgba(57,255,20,0.25)]">
        {formatTime(timeLeft)}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-5">
        <button
          onClick={toggleTimer}
          className="w-16 h-16 rounded-full border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.2)]"
        >
          {isActive ? <Pause size={26} /> : <Play size={26} fill="currentColor" />}
        </button>

        <button
          onClick={resetTimer}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap justify-center">
        {[30, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            onClick={() => setPreset(sec)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all"
          >
            {sec < 60 ? `${sec}s` : `${sec / 60} min`}
          </button>
        ))}
      </div>

      {/* Ajuste fino */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => adjustTime(-15)}
          className="text-gray-500 hover:text-white transition"
        >
          -15s
        </button>

        <div className="h-4 w-px bg-white/10"></div>

        <button
          onClick={() => adjustTime(15)}
          className="text-gray-500 hover:text-white transition"
        >
          +15s
        </button>
      </div>
    </div>
  );
};