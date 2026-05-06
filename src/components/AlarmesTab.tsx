import { useState, useEffect } from 'react';
import { Bell, Clock, Plus, X, Trash2, Droplets, Dumbbell, Utensils, Save, Pencil } from 'lucide-react';
import { useAlarmMonitor } from '../hooks/useAlarmMonitor';

interface Alarme {
  id: string;
  tipo: 'agua' | 'treino' | 'refeicao';
  nome: string;
  horario: string;
  ativo: boolean;
  diasSemana: number[];
  som: string;
}

const TIPOS_ALARME = [
  { value: 'agua', label: '💧 Água', icon: Droplets },
  { value: 'treino', label: '🏋️ Treino', icon: Dumbbell },
  { value: 'refeicao', label: '🍽️ Refeição', icon: Utensils },
];

const PRESETS = [
  { tipo: 'agua', nome: 'Beber água', horario: '08:00', intervalo: 120 },
  { tipo: 'refeicao', nome: 'Café da manhã', horario: '07:00' },
  { tipo: 'refeicao', nome: 'Almoço', horario: '12:00' },
  { tipo: 'refeicao', nome: 'Jantar', horario: '19:00' },
  { tipo: 'treino', nome: 'Treino', horario: '18:00' },
];

export default function AlarmesTab() {
  const [alarmes, setAlarmes] = useState<Alarme[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoAlarme, setNovoAlarme] = useState({ 
    tipo: 'agua' as const, 
    nome: '', 
    horario: '08:00',
    diasSemana: [0,1,2,3,4,5,6],
    som: 'bell'
  });

  useAlarmMonitor(alarmes);

  useEffect(() => {
    const saved = localStorage.getItem('alarmes');
    if (saved) {
      try {
        setAlarmes(JSON.parse(saved));
      } catch {
        setAlarmes([]);
      }
    } else {
      const presetsIniciais = PRESETS.map((p, i) => ({
        id: `preset-${i}`,
        tipo: p.tipo as 'agua' | 'treino' | 'refeicao',
        nome: p.nome,
        horario: p.horario,
        ativo: true,
        diasSemana: [0,1,2,3,4,5,6],
        som: 'bell',
      }));
      setAlarmes(presetsIniciais);
      localStorage.setItem('alarmes', JSON.stringify(presetsIniciais));
    }
  }, []);

  const salvarAlarmes = (novosAlarmes: Alarme[]) => {
    setAlarmes(novosAlarmes);
    localStorage.setItem('alarmes', JSON.stringify(novosAlarmes));
  };

  const adicionarAlarme = () => {
    if (!novoAlarme.nome || !novoAlarme.horario) return;
    
    if (isEditing) {
      salvarAlarmes(alarmes.map(a => a.id === isEditing ? {
        ...a,
        tipo: novoAlarme.tipo,
        nome: novoAlarme.nome,
        horario: novoAlarme.horario,
        diasSemana: novoAlarme.diasSemana,
        som: novoAlarme.som,
      } : a));
    } else {
      const alarme: Alarme = {
        id: Date.now().toString(),
        tipo: novoAlarme.tipo,
        nome: novoAlarme.nome,
        horario: novoAlarme.horario,
        ativo: true,
        diasSemana: novoAlarme.diasSemana,
        som: novoAlarme.som,
      };
      salvarAlarmes([...alarmes, alarme]);
    }
    
    setIsModalOpen(false);
    setIsEditing(null);
    setNovoAlarme({ tipo: 'agua', nome: '', horario: '08:00', diasSemana: [0,1,2,3,4,5,6], som: 'bell' });
  };

  const toggleAlarme = (id: string) => {
    salvarAlarmes(alarmes.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  };

  const prepararEdicao = (alarme: Alarme) => {
    setNovoAlarme({
      tipo: alarme.tipo,
      nome: alarme.nome,
      horario: alarme.horario,
      diasSemana: alarme.diasSemana,
      som: alarme.som,
    });
    setIsModalOpen(true);
    setIsEditing(alarme.id);
  };

  const [isEditing, setIsEditing] = useState<string | null>(null);

  const excluirAlarme = (id: string) => {
    salvarAlarmes(alarmes.filter(a => a.id !== id));
  };

  const alarmesAtivos = alarmes.filter(a => a.ativo).sort((a, b) => a.horario.localeCompare(b.horario));
  const alarmesInativos = alarmes.filter(a => !a.ativo);

  const getIcone = (tipo: string) => {
    const tipoObj = TIPOS_ALARME.find(t => t.value === tipo);
    return tipoObj ? <tipoObj.icon className="w-5 h-5" /> : <Bell className="w-5 h-5" />;
  };

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'agua': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'treino': return 'text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/20';
      case 'refeicao': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const testarAlarme = () => {
    if (alarmes.length > 0) {
      const alarm = alarmes[0];
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-01a.mp3');
      audio.volume = 1;
      audio.play().then(() => {
        alert(`🔔 Testando alarme: ${alarm.nome}\nSom: ${alarm.som}`);
      }).catch(() => {
        alert('Erro ao reproduzir som. Verifique as permissões do navegador.');
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col gap-2">
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
          Meus <span className="text-[#39FF14]">Alarmes</span>
        </h2>
        <p className="text-gray-400 font-light tracking-wide text-sm md:text-base">
          Configure lembretes para sua rotina de treino e alimentação.
        </p>
      </section>

      <div className="flex justify-end gap-3">
        <button
          onClick={testarAlarme}
          className="flex items-center gap-2 bg-yellow-500 text-black font-black uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-yellow-400 transition-all"
        >
          <Bell className="w-5 h-5" />
          Testar Som
        </button>
        <button
          onClick={() => {
            if (Notification.permission !== 'granted') {
              Notification.requestPermission();
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#39FF14] text-black font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Alarme
        </button>
      </div>

      {alarmesAtivos.length === 0 && alarmesInativos.length === 0 ? (
        <div className="glass rounded-2xl p-12 flex flex-col justify-center items-center text-center">
          <Bell className="w-12 h-12 text-gray-700 mb-4" />
          <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-1">Nenhum alarme</h4>
          <p className="text-sm text-gray-600">Adicione alarmes para lembrar de beber água, treinar e se alimentar.</p>
        </div>
      ) : (
        <>
          {alarmesAtivos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Ativos</h3>
              <div className="grid gap-4">
                {alarmesAtivos.map(alarme => (
                  <div
                    key={alarme.id}
                    className="glass rounded-2xl p-6 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getCorTipo(alarme.tipo)}`}>
                        {getIcone(alarme.tipo)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">{alarme.nome}</h4>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{alarme.horario}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAlarme(alarme.id)}
                        className="relative w-14 h-8 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/30 transition-colors"
                      >
                        <div className="absolute right-1 top-1 w-6 h-6 rounded-full bg-[#39FF14] transition-transform"></div>
                      </button>
                      <button
                        onClick={() => prepararEdicao(alarme)}
                        className="p-2 text-gray-500 hover:text-[#39FF14] transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => excluirAlarme(alarme.id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alarmesInativos.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Inativos</h3>
              <div className="grid gap-4 opacity-50">
                {alarmesInativos.map(alarme => (
                  <div
                    key={alarme.id}
                    className="glass rounded-2xl p-6 flex items-center justify-between border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getCorTipo(alarme.tipo)}`}>
                        {getIcone(alarme.tipo)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-400 uppercase tracking-tight">{alarme.nome}</h4>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{alarme.horario}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAlarme(alarme.id)}
                        className="relative w-14 h-8 rounded-full bg-white/5 border border-white/10"
                      >
                        <div className="absolute left-1 top-1 w-6 h-6 rounded-full bg-gray-500 transition-transform"></div>
                      </button>
                      <button
                        onClick={() => prepararEdicao(alarme)}
                        className="p-2 text-gray-500 hover:text-[#39FF14] transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => excluirAlarme(alarme.id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-6">Novo Alarme</h3>

            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 block">Tipo</label>
                <div className="flex gap-2">
                  {TIPOS_ALARME.map(tipo => (
                    <button
                      key={tipo.value}
                      onClick={() => setNovoAlarme({ ...novoAlarme, tipo: tipo.value as any })}
                      className={`flex-1 py-3 rounded-xl border font-bold uppercase text-sm tracking-widest transition-all ${
                        novoAlarme.tipo === tipo.value
                          ? 'bg-[#39FF14]/10 border-[#39FF14] text-[#39FF14]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Nome</label>
                <input
                  type="text"
                  value={novoAlarme.nome}
                  onChange={e => setNovoAlarme({ ...novoAlarme, nome: e.target.value })}
                  placeholder="Ex: Beber água, Treino matinal..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Horário</label>
                <input
                  type="time"
                  value={novoAlarme.horario}
                  onChange={e => setNovoAlarme({ ...novoAlarme, horario: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                />
              </div>

              <div className="mt-4 space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase block">Repetir nos dias</label>
                <div className="flex justify-between">
                  {['D','S','T','Q','Q','S','S'].map((dia, index) => (
                    <button 
                      key={index}
                      type="button"
                      onClick={() => {
                        const dias = novoAlarme.diasSemana.includes(index)
                          ? novoAlarme.diasSemana.filter(d => d !== index)
                          : [...novoAlarme.diasSemana, index];
                        setNovoAlarme({ ...novoAlarme, diasSemana: dias });
                      }}
                      className={`w-8 h-8 rounded-full border text-xs font-bold transition-all ${
                        novoAlarme.diasSemana.includes(index)
                          ? 'bg-[#39FF14] border-[#39FF14] text-black'
                          : 'border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14]/20'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mt-4">Som do Alarme</label>
                <select 
                  value={novoAlarme.som}
                  onChange={e => setNovoAlarme({ ...novoAlarme, som: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#39FF14]"
                >
                  <option value="bell">Sino Padrão</option>
                  <option value="digital">Digital Premium</option>
                  <option value="energy">Energia Academia</option>
                </select>
              </div>

              <button
                onClick={adicionarAlarme}
                disabled={!novoAlarme.nome || !novoAlarme.horario}
                className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isEditing ? 'Salvar Alterações' : 'Salvar Alarme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}