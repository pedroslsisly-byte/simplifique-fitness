import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X } from 'lucide-react';

interface CronometroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  duracao?: string;
}

const PRESETS = [
  { label: '30s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '90s', value: 90 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
];

export default function CronometroTimer({ isOpen, onClose, duracao }: CronometroTimerProps) {
  const [segundos, setSegundos] = useState(duracao ? parseInt(duracao) * 60 : 60);
  const [isAtivo, setIsAtivo] = useState(false);
  const [tempoPersonalizado, setTempoPersonalizado] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAtivo && segundos > 0) {
      intervalRef.current = setInterval(() => {
        setSegundos(prev => {
          if (prev <= 1) {
            setIsAtivo(false);
            new Audio('/notification.mp3').play().catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAtivo, segundos]);

  const formatarTempo = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const segs = totalSegundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const adicionarTempo = (valor: number) => {
    setSegundos(prev => prev + valor);
  };

  const aplicarTempoPersonalizado = () => {
    const tempo = parseInt(tempoPersonalizado);
    if (tempo > 0 && tempo <= 3600) {
      setSegundos(tempo * 60);
      setTempoPersonalizado('');
    }
  };

  const resetar = () => {
    setIsAtivo(false);
    setSegundos(duracao ? parseInt(duracao) * 60 : 60);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black italic uppercase tracking-tight text-center mb-8">
          Cronômetro
        </h2>

        <div className="text-center mb-8">
          <div className="text-7xl font-black tabular-nums tracking-tighter mb-4">
            <span className={segundos === 0 ? 'text-red-500' : 'text-[#39FF14]'}>
              {formatarTempo(segundos)}
            </span>
          </div>
          {segundos === 0 && (
            <p className="text-red-500 font-bold uppercase tracking-widest animate-pulse">
              Tempo esgotado!
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsAtivo(!isAtivo)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isAtivo 
                ? 'bg-yellow-500/20 text-yellow-500 border-2 border-yellow-500' 
                : 'bg-[#39FF14]/20 text-[#39FF14] border-2 border-[#39FF14]'
            }`}
          >
            {isAtivo ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
          </button>
          <button
            onClick={resetar}
            className="w-20 h-20 rounded-full bg-white/5 text-gray-400 border-2 border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-2 flex-wrap">
            {PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setSegundos(preset.value)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={tempoPersonalizado}
              onChange={e => setTempoPersonalizado(e.target.value)}
              placeholder="Minutos"
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
            />
            <button
              onClick={aplicarTempoPersonalizado}
              className="px-4 py-3 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] rounded-xl font-bold uppercase tracking-widest hover:bg-[#39FF14]/20"
            >
              Definir
            </button>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => adicionarTempo(-15)}
              disabled={segundos <= 15}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold uppercase hover:bg-white/10 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" /> 15s
            </button>
            <button
              onClick={() => adicionarTempo(15)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold uppercase hover:bg-white/10"
            >
              <Plus className="w-4 h-4" /> 15s
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}