import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

export const CronometroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const adjustTime = (amount: number) => {
    if (!isActive) {
      setTimeLeft((prev) => Math.max(0, prev + amount));
    }
  };

  const formatParts = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return {
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0')
    };
  };

  const time = formatParts(timeLeft);

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 shadow-2xl">
      <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Cronômetro</h2>

      {/* Interface de Ajuste com Setas */}
      <div className="flex items-center gap-4">
        {/* Minutos */}
        <div className="flex flex-col items-center">
          <button onClick={() => adjustTime(60)} className="text-gray-600 hover:text-[#39FF14] transition-colors"><ChevronUp size={32} /></button>
          <div className="text-7xl font-mono font-bold text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">{time.mins}</div>
          <button onClick={() => adjustTime(-60)} className="text-gray-600 hover:text-[#39FF14] transition-colors"><ChevronDown size={32} /></button>
        </div>

        <div className="text-5xl font-mono font-bold text-[#39FF14] pt-4">:</div>

        {/* Segundos */}
        <div className="flex flex-col items-center">
          <button onClick={() => adjustTime(1)} className="text-gray-600 hover:text-[#39FF14] transition-colors"><ChevronUp size={32} /></button>
          <div className="text-7xl font-mono font-bold text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">{time.secs}</div>
          <button onClick={() => adjustTime(-1)} className="text-gray-600 hover:text-[#39FF14] transition-colors"><ChevronDown size={32} /></button>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-6 pt-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className="w-20 h-20 rounded-full border-2 border-[#39FF14] flex items-center justify-center text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all"
        >
          {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
        </button>

        <button
          onClick={() => { setIsActive(false); setTimeLeft(60); }}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};