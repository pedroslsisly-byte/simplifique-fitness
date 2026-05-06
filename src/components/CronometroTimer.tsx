import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

export const CronometroTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  
  const [editMinutes, setEditMinutes] = useState(false);
  const [editSeconds, setEditSeconds] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('01');
  const [inputSeconds, setInputSeconds] = useState('00');

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
    setInputMinutes(mins.toString().padStart(2, '0'));
    setInputSeconds(secs.toString().padStart(2, '0'));
    if (timeLeft === 0) setIsActive(false);
  }, [timeLeft]);

  const toggleTimer = () => setIsActive((prev) => !prev);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(1);
    setSeconds(0);
    setInputMinutes('01');
    setInputSeconds('00');
  };

  const changeMinutes = (value: number) => {
    if (isActive) return;
    setMinutes((prev) => Math.max(0, prev + value));
    setInputMinutes(Math.max(0, minutes + value).toString().padStart(2, '0'));
  };

  const changeSeconds = (value: number) => {
    if (isActive) return;
    setSeconds((prev) => {
      let newValue = prev + value;
      if (newValue > 59) {
        setMinutes((m) => m + 1);
        setInputMinutes((minutes + 1).toString().padStart(2, '0'));
        return 0;
      }
      if (newValue < 0) {
        setMinutes((m) => Math.max(0, m - 1));
        setInputMinutes(Math.max(0, minutes - 1).toString().padStart(2, '0'));
        return 59;
      }
      return newValue;
    });
  };

  const handleMinutesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') return;
    const num = Math.min(99, parseInt(val) || 0);
    setMinutes(num);
    setInputMinutes(num.toString().padStart(2, '0'));
  };

  const handleSecondsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') return;
    const num = Math.min(59, parseInt(val) || 0);
    setSeconds(num);
    setInputSeconds(num.toString().padStart(2, '0'));
  };

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-[360px] p-8 rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col items-center gap-8">

      <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">
        Cronômetro
      </span>

      {/* DISPLAY COM SETAS GRANDES + INPUT MANUAL */}
      <div className="flex items-center gap-6">
        {/* MINUTOS */}
        <div className="flex flex-col items-center gap-3">
          <button 
            onClick={() => changeMinutes(1)} 
            disabled={isActive}
            className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14] transition-all disabled:opacity-30 disabled:hover:border-white/10"
          >
            <ChevronUp size={36} />
          </button>

          {editMinutes ? (
            <input
              type="text"
              value={inputMinutes}
              onChange={handleMinutesInput}
              onBlur={() => setEditMinutes(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditMinutes(false)}
              autoFocus
              className="w-28 h-20 text-7xl font-mono font-bold text-center text-[#39FF14] bg-transparent border-b-2 border-[#39FF14] outline-none drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]"
              maxLength={2}
            />
          ) : (
            <div 
              onClick={() => !isActive && setEditMinutes(true)}
              className="w-28 h-20 flex items-center justify-center text-7xl font-mono font-bold text-[#39FF14] cursor-pointer hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]"
            >
              {format(minutes)}
            </div>
          )}

          <button 
            onClick={() => changeMinutes(-1)} 
            disabled={isActive}
            className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14] transition-all disabled:opacity-30 disabled:hover:border-white/10"
          >
            <ChevronDown size={36} />
          </button>
        </div>

        <span className="text-6xl font-mono font-bold text-[#39FF14] pt-6">:</span>

        {/* SEGUNDOS */}
        <div className="flex flex-col items-center gap-3">
          <button 
            onClick={() => changeSeconds(1)} 
            disabled={isActive}
            className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14] transition-all disabled:opacity-30 disabled:hover:border-white/10"
          >
            <ChevronUp size={36} />
          </button>

          {editSeconds ? (
            <input
              type="text"
              value={inputSeconds}
              onChange={handleSecondsInput}
              onBlur={() => setEditSeconds(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditSeconds(false)}
              autoFocus
              className="w-28 h-20 text-7xl font-mono font-bold text-center text-[#39FF14] bg-transparent border-b-2 border-[#39FF14] outline-none drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]"
              maxLength={2}
            />
          ) : (
            <div 
              onClick={() => !isActive && setEditSeconds(true)}
              className="w-28 h-20 flex items-center justify-center text-7xl font-mono font-bold text-[#39FF14] cursor-pointer hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]"
            >
              {format(seconds)}
            </div>
          )}

          <button 
            onClick={() => changeSeconds(-1)} 
            disabled={isActive}
            className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14] transition-all disabled:opacity-30 disabled:hover:border-white/10"
          >
            <ChevronDown size={36} />
          </button>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="flex items-center gap-6 pt-2">
        <button
          onClick={toggleTimer}
          className="w-24 h-24 rounded-full border-4 border-[#39FF14] flex items-center justify-center text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all shadow-[0_0_30px_rgba(57,255,20,0.4)]"
        >
          {isActive ? <Pause size={36} /> : <Play size={36} fill="currentColor" />}
        </button>

        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      {/* PRESETS */}
      <div className="flex gap-4">
        {[30, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            onClick={() => {
              setIsActive(false);
              setMinutes(Math.floor(sec / 60));
              setSeconds(sec % 60);
              setInputMinutes(Math.floor(sec / 60).toString().padStart(2, '0'));
              setInputSeconds((sec % 60).toString().padStart(2, '0'));
            }}
            className="px-5 py-3 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all"
          >
            {sec < 60 ? `${sec}s` : `${sec/60}min`}
          </button>
        ))}
      </div>
    </div>
  );
};