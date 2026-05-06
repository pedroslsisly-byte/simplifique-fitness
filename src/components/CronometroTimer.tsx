import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type AlarmSound = 'digital' | 'chime' | 'urgent';

export const CronometroTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialTime, setInitialTime] = useState<number>(60);
  
  const [inputMins, setInputMins] = useState<string>(Math.floor(initialTime / 60).toString());
  const [inputSecs, setInputSecs] = useState<string>((initialTime % 60).toString().padStart(2, '0'));
  
  const [alarmSound, setAlarmSound] = useState<AlarmSound>('digital');
  const [volume, setVolume] = useState<number>(50);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const playBeep = (type: AlarmSound, volLevel: number) => {
    if (volLevel === 0) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const vol = volLevel / 100;
    
    if (type === 'digital') {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime + i * 0.4); 
        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.4);
        gainNode.gain.linearRampToValueAtTime(vol * 0.5, ctx.currentTime + i * 0.4 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.4);
        osc.stop(ctx.currentTime + i * 0.4 + 0.3);
      }
    } else if (type === 'chime') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol * 0.6, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 2);
        osc2.stop(ctx.currentTime + 2);

        setTimeout(() => {
            if(ctx.state !== 'closed') {
                const osc3 = ctx.createOscillator();
                const objGain = ctx.createGain();
                osc3.type = 'sine';
                osc3.frequency.setValueAtTime(783.99, ctx.currentTime);
                objGain.gain.setValueAtTime(0, ctx.currentTime);
                objGain.gain.linearRampToValueAtTime(vol * 0.5, ctx.currentTime + 0.1);
                objGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
                osc3.connect(objGain);
                objGain.connect(ctx.destination);
                osc3.start(ctx.currentTime);
                osc3.stop(ctx.currentTime + 2);
            }
        }, 500);
    } else if (type === 'urgent') {
        for (let i = 0; i < 6; i++) {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(i % 2 === 0 ? 800 : 1200, ctx.currentTime + i * 0.2); 
          gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
          gainNode.gain.linearRampToValueAtTime(vol * 0.4, ctx.currentTime + i * 0.2 + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.15);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.2);
          osc.stop(ctx.currentTime + i * 0.2 + 0.15);
        }
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      playBeep(alarmSound, volume);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, alarmSound, volume]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (timeLeft === 0 && !isRunning) {
       setTimeLeft(initialTime);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const handleMinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMins(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
        const s = initialTime % 60;
        const newTotal = (num * 60) + s;
        setInitialTime(newTotal);
        if (!isRunning) setTimeLeft(newTotal);
    }
  };

  const handleSecsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputSecs(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
        const m = Math.floor(initialTime / 60);
        const s = Math.min(num, 59);
        const newTotal = (m * 60) + s;
        setInitialTime(newTotal);
        if (!isRunning) setTimeLeft(newTotal);
    }
  };

  const handleBlur = () => {
    setInputMins(Math.floor(initialTime / 60).toString());
    setInputSecs((initialTime % 60).toString().padStart(2, '0'));
  };

  useEffect(() => {
    setInputMins(Math.floor(initialTime / 60).toString());
    setInputSecs((initialTime % 60).toString().padStart(2, '0'));
  }, [initialTime]);

  return (
    <div className="bg-[#0F0F10] text-[#E0E0E0] font-sans flex flex-col relative overflow-hidden selection:bg-[#4ADE80]/20 rounded-[2.5rem] border border-white/5 shadow-2xl pb-8">
      <header className="w-full flex justify-center items-center pt-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">Cronômetro Premium</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 pt-4 px-4">
        <div className="relative flex items-center justify-center w-full max-w-4xl mx-auto">
          <div className="font-mono text-[80px] sm:text-[100px] leading-none tracking-[-0.05em] flex tabular-nums slashed-zero">
            <span className="text-white">{formatTime(timeLeft).split(':')[0]}</span>
            <span className={`text-zinc-700 mx-2 ${isRunning ? "animate-pulse" : ""}`}>:</span>
            <span className="text-[#4ADE80]">{formatTime(timeLeft).split(':')[1]}</span>
          </div>
        </div>

        <div className="mt-8 w-full max-w-2xl mx-auto flex flex-col items-center border-t border-zinc-800/80 pt-6 px-4">
          <label className="text-[10px] uppercase tracking-widest text-[#4ADE80] font-bold mb-4">Ajustar Tempo</label>
          
          <div className="flex bg-zinc-900/40 p-4 rounded-3xl border border-white/[0.05] items-center justify-center gap-6 w-full max-w-md">
            <div className="flex flex-col items-center">
              <input type="number" min="0" max="999" disabled={isRunning} value={inputMins} onChange={handleMinsChange} onBlur={handleBlur} className="w-20 bg-black/50 border border-zinc-800 rounded-2xl p-3 text-white font-mono text-center text-2xl focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] focus:outline-none transition-all disabled:opacity-30 custom-number-input" />
              <span className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.2em] font-bold">Min</span>
            </div>
            <span className="text-zinc-600 text-3xl font-mono leading-none pb-4">:</span>
            <div className="flex flex-col items-center">
              <input type="number" min="0" max="59" disabled={isRunning} value={inputSecs} onChange={handleSecsChange} onBlur={handleBlur} className="w-20 bg-black/50 border border-zinc-800 rounded-2xl p-3 text-white font-mono text-center text-2xl focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] focus:outline-none transition-all disabled:opacity-30 custom-number-input" />
              <span className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.2em] font-bold">Seg</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-md mt-6">
            <div className="flex flex-col flex-1 gap-2">
              <label className="text-[10px] uppercase tracking-widest text-[#4ADE80] font-bold">Som</label>
              <div className="flex gap-2 h-11">
                {(['digital', 'chime', 'urgent'] as AlarmSound[]).map((type) => (
                  <button key={type} disabled={isRunning} onClick={() => { setAlarmSound(type); playBeep(type, volume); }} className={`flex-1 py-1 text-[10px] uppercase tracking-wider font-bold rounded border disabled:opacity-50 ${alarmSound === type ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-black/50 text-zinc-500 border-zinc-900'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col flex-1 gap-2">
              <label className="text-[10px] uppercase tracking-widest text-[#4ADE80] font-bold">Volume</label>
              <div className="flex items-center gap-3 h-11 bg-black/50 px-3 rounded-lg border border-zinc-900">
                <VolumeX className="w-4 h-4 text-zinc-600" />
                <input type="range" min="0" max="100" value={volume} disabled={isRunning} onChange={(e) => setVolume(Number(e.target.value))} onMouseUp={() => playBeep(alarmSound, volume)} className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none accent-[#4ADE80]" />
                <Volume2 className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-center items-center pt-10 gap-8">
        <button onClick={handleReset} disabled={isRunning && timeLeft > 0} className="group flex flex-col items-center gap-3 disabled:opacity-30">
          <div className="w-14 h-14 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-all">
            <RotateCcw className="text-zinc-400 w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Reset</span>
        </button>

        <button onClick={handleStartPause} className="group flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-[#4ADE80] p-1">
            <div className="w-full h-full rounded-full bg-[#4ADE80] shadow-[0_0_20px_rgba(74,222,128,0.2)] flex items-center justify-center text-black">
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-2" />}
            </div>
          </div>
          <span className="text-[11px] uppercase tracking-[0.3em] font-black text-[#4ADE80]">
            {isRunning ? 'Pausar' : 'Iniciar'}
          </span>
        </button>

        <button onClick={() => { setIsRunning(false); setTimeLeft(0); }} className="group flex flex-col items-center gap-3 opacity-50 hover:opacity-100">
          <div className="w-14 h-14 rounded-full border border-red-500/20 hover:border-red-500/50 flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/50">Stop</span>
        </button>
      </footer>
    </div>
  );
};