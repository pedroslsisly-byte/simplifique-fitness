import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const CronometroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("01:00");

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
      if (timeLeft === 0) setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const saveManualEdit = () => {
    const [m, s] = editValue.split(':').map(Number);
    if (!isNaN(m) && !isNaN(s)) {
      setTimeLeft((m * 60) + s);
    }
    setIsEditing(false);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(60);
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-6 bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-2xl">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Cronômetro</h2>

      {/* Display Editável */}
      <div className="relative group cursor-pointer" onClick={() => !isActive && setIsEditing(true)}>
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={handleManualEdit}
            onBlur={saveManualEdit}
            onKeyDown={(e) => e.key === 'Enter' && saveManualEdit()}
            className="text-7xl font-mono font-bold text-[#39FF14] bg-transparent border-none outline-none text-center w-48 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]"
          />
        ) : (
          <div className="text-7xl font-mono font-bold text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all group-hover:scale-105">
            {formatTime(timeLeft)}
          </div>
        )}
        {!isActive && !isEditing && (
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 uppercase font-bold opacity-0 group-hover:opacity-100 transition-all">Clique para editar</span>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleTimer}
          className="w-20 h-20 rounded-full border-2 border-[#39FF14] flex items-center justify-center text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all shadow-[0_0_20px_rgba(57,255,20,0.15)]"
        >
          {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
        </button>

        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Presets Rápidos */}
      <div className="flex flex-wrap justify-center gap-2">
        {[30, 60, 90, 120].map((seg) => (
          <button
            key={seg}
            onClick={() => { setIsActive(false); setTimeLeft(seg); }}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:border-[#39FF14] hover:text-[#39FF14] transition-all"
          >
            {seg < 60 ? `${seg}S` : `${seg / 60} MIN`}
          </button>
        ))}
      </div>
    </div>
  );
};