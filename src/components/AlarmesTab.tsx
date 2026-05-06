import { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Plus, X, Trash2, Droplets, Dumbbell, Utensils, Save, Pencil, Volume2, Upload } from 'lucide-react';

interface Alarme {
  id: string;
  tipo: 'agua' | 'treino' | 'refeicao';
  nome: string;
  horario: string;
  ativo: boolean;
  diasSemana: number[];
  som: string;
  musicaCustomUrl?: string;
  musicaCustomNome?: string;
}

const TIPOS_ALARME = [
  { value: 'agua', label: '💧 Água', icon: Droplets },
  { value: 'treino', label: '🏋️ Treino', icon: Dumbbell },
  { value: 'refeicao', label: '🍽️ Refeição', icon: Utensils },
];

const PRESETS = [
  { tipo: 'agua', nome: 'Beber água', horario: '08:00' },
  { tipo: 'refeicao', nome: 'Café da manhã', horario: '07:00' },
  { tipo: 'refeicao', nome: 'Almoço', horario: '12:00' },
  { tipo: 'refeicao', nome: 'Jantar', horario: '19:00' },
  { tipo: 'treino', nome: 'Treino', horario: '18:00' },
];

const OPCOES_SOM = [
  { value: 'fanfara', label: '🎺 Fanfara Épica', desc: 'Sequência triunfal de notas' },
  { value: 'pulso', label: '💓 Pulso Energético', desc: 'Batida forte crescente' },
  { value: 'digital', label: '📟 Alerta Digital', desc: 'Beeps precisos e claros' },
  { value: 'zen', label: '🧘 Sino Zen', desc: '3 toques suaves e calmos' },
  { value: 'academia', label: '⚡ Energia Academia', desc: 'Som intenso de treino' },
];

// ─── Web Audio API ────────────────────────────────────────────────────────────

function makeCtx(): AudioContext {
  const C = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (C.state === 'suspended') C.resume();
  return C;
}

function playFanfara(ac: AudioContext) {
  const notas = [
    { freq: 523, t: 0, dur: 0.15 },
    { freq: 659, t: 0.16, dur: 0.15 },
    { freq: 784, t: 0.32, dur: 0.15 },
    { freq: 1047, t: 0.48, dur: 0.35 },
    { freq: 784, t: 0.85, dur: 0.15 },
    { freq: 1047, t: 1.02, dur: 0.5 },
  ];
  notas.forEach(({ freq, t, dur }) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, ac.currentTime + t);
    g.gain.setValueAtTime(0, ac.currentTime + t);
    g.gain.linearRampToValueAtTime(0.4, ac.currentTime + t + 0.03);
    g.gain.setValueAtTime(0.4, ac.currentTime + t + dur - 0.05);
    g.gain.linearRampToValueAtTime(0, ac.currentTime + t + dur);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + dur + 0.01);
  });
}

function playPulso(ac: AudioContext) {
  [0, 0.35, 0.7, 1.05].forEach((t, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sine';
    const base = 120 + i * 60;
    osc.frequency.setValueAtTime(base * 2, ac.currentTime + t);
    osc.frequency.exponentialRampToValueAtTime(base, ac.currentTime + t + 0.2);
    g.gain.setValueAtTime(0.5 + i * 0.1, ac.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.28);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + 0.3);
  });
}

function playDigital(ac: AudioContext) {
  [0, 0.15, 0.3, 0.6, 0.75, 0.9].forEach(t => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, ac.currentTime + t);
    g.gain.setValueAtTime(0.25, ac.currentTime + t);
    g.gain.setValueAtTime(0.001, ac.currentTime + t + 0.1);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + 0.12);
  });
}

function playZen(ac: AudioContext) {
  [0, 0.6, 1.2].forEach(t => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ac.currentTime + t);
    osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + t + 0.8);
    g.gain.setValueAtTime(0.5, ac.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 1.2);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + 1.2);
  });
}

function playAcademia(ac: AudioContext) {
  const osc1 = ac.createOscillator();
  const osc2 = ac.createOscillator();
  const g = ac.createGain();
  osc1.connect(g); osc2.connect(g); g.connect(ac.destination);
  osc1.type = 'sawtooth'; osc2.type = 'square';
  osc1.frequency.setValueAtTime(150, ac.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.6);
  osc2.frequency.setValueAtTime(300, ac.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(1800, ac.currentTime + 0.6);
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(0.45, ac.currentTime + 0.1);
  g.gain.setValueAtTime(0.45, ac.currentTime + 0.5);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.1);
  osc1.start(ac.currentTime); osc2.start(ac.currentTime);
  osc1.stop(ac.currentTime + 1.1); osc2.stop(ac.currentTime + 1.1);
  setTimeout(() => {
    const ac2 = makeCtx();
    const o = ac2.createOscillator();
    const g2 = ac2.createGain();
    o.connect(g2); g2.connect(ac2.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(600, ac2.currentTime);
    o.frequency.exponentialRampToValueAtTime(1400, ac2.currentTime + 0.4);
    g2.gain.setValueAtTime(0.45, ac2.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ac2.currentTime + 0.6);
    o.start(ac2.currentTime); o.stop(ac2.currentTime + 0.6);
  }, 700);
}

const audioCustomEl: { el: HTMLAudioElement | null } = { el: null };

function playCustom(url: string) {
  if (audioCustomEl.el) { audioCustomEl.el.pause(); audioCustomEl.el = null; }
  const audio = new Audio(url);
  audio.volume = 1;
  audioCustomEl.el = audio;
  audio.play().catch(e => console.error('Erro ao tocar música:', e));
  setTimeout(() => { audio.pause(); }, 30000);
}

export function tocarSom(som: string, musicaUrl?: string) {
  if (som === 'custom' && musicaUrl) { playCustom(musicaUrl); return; }
  try {
    const ac = makeCtx();
    if (som === 'fanfara') playFanfara(ac);
    else if (som === 'pulso') playPulso(ac);
    else if (som === 'digital') playDigital(ac);
    else if (som === 'academia') playAcademia(ac);
    else playZen(ac);
  } catch (e) { console.error('Web Audio error:', e); }
}

// ─── Monitor de alarmes ───────────────────────────────────────────────────────

function useAlarmMonitor(alarmes: Alarme[]) {
  const disparados = useRef<Set<string>>(new Set());
  useEffect(() => {
    const iv = setInterval(() => {
      const agora = new Date();
      const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
      const dia = agora.getDay();
      alarmes.forEach(a => {
        if (!a.ativo || a.horario !== hora || !a.diasSemana.includes(dia)) return;
        const chave = `${a.id}-${hora}`;
        if (disparados.current.has(chave)) return;
        disparados.current.add(chave);
        tocarSom(a.som, a.musicaCustomUrl);
        if (Notification.permission === 'granted')
          new Notification(`🔔 ${a.nome}`, { body: `Hora: ${a.horario}` });
      });
      disparados.current.forEach(c => { if (!c.endsWith(hora)) disparados.current.delete(c); });
    }, 10_000);
    return () => clearInterval(iv);
  }, [alarmes]);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlarmesTab() {
  const [alarmes, setAlarmes] = useState<Alarme[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [novoAlarme, setNovoAlarme] = useState<{
    tipo: 'agua' | 'treino' | 'refeicao';
    nome: string; horario: string; diasSemana: number[]; som: string;
    musicaCustomUrl?: string; musicaCustomNome?: string;
  }>({ tipo: 'agua', nome: '', horario: '08:00', diasSemana: [0, 1, 2, 3, 4, 5, 6], som: 'fanfara' });

  useAlarmMonitor(alarmes);

  useEffect(() => {
    const saved = localStorage.getItem('alarmes');
    if (saved) { try { setAlarmes(JSON.parse(saved)); } catch { setAlarmes([]); } }
    else {
      const ini = PRESETS.map((p, i) => ({
        id: `preset-${i}`, tipo: p.tipo as 'agua' | 'treino' | 'refeicao',
        nome: p.nome, horario: p.horario, ativo: true,
        diasSemana: [0, 1, 2, 3, 4, 5, 6], som: 'fanfara',
      }));
      setAlarmes(ini); localStorage.setItem('alarmes', JSON.stringify(ini));
    }
  }, []);

  const salvar = (novos: Alarme[]) => { setAlarmes(novos); localStorage.setItem('alarmes', JSON.stringify(novos)); };
  const confirmar = () => {
    if (!novoAlarme.nome || !novoAlarme.horario) return;
    if (isEditing) salvar(alarmes.map(a => a.id === isEditing ? { ...a, ...novoAlarme } : a));
    else salvar([...alarmes, { id: Date.now().toString(), ...novoAlarme, ativo: true }]);
    fechar();
  };
  const fechar = () => {
    setIsModalOpen(false); setIsEditing(null);
    setNovoAlarme({ tipo: 'agua', nome: '', horario: '08:00', diasSemana: [0, 1, 2, 3, 4, 5, 6], som: 'fanfara' });
  };
  const toggle = (id: string) => salvar(alarmes.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  const editar = (a: Alarme) => {
    setNovoAlarme({ tipo: a.tipo, nome: a.nome, horario: a.horario, diasSemana: a.diasSemana, som: a.som, musicaCustomUrl: a.musicaCustomUrl, musicaCustomNome: a.musicaCustomNome });
    setIsEditing(a.id); setIsModalOpen(true);
  };
  const excluir = (id: string) => salvar(alarmes.filter(a => a.id !== id));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNovoAlarme(p => ({ ...p, som: 'custom', musicaCustomUrl: url, musicaCustomNome: file.name }));
  };

  const ativos = [...alarmes].filter(a => a.ativo).sort((a, b) => a.horario.localeCompare(b.horario));
  const inativos = alarmes.filter(a => !a.ativo);

  const corTipo = (t: string) =>
    t === 'agua' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      : t === 'treino' ? 'text-[#39FF14] bg-[#39FF14]/10 border-[#39FF14]/20'
        : 'text-orange-400 bg-orange-400/10 border-orange-400/20';

  const icone = (t: string) =>
    t === 'agua' ? <Droplets className="w-5 h-5" />
      : t === 'treino' ? <Dumbbell className="w-5 h-5" />
        : <Utensils className="w-5 h-5" />;

  const somLabel = (a: Alarme) =>
    a.som === 'custom' ? (a.musicaCustomNome ?? 'Música personalizada')
      : OPCOES_SOM.find(s => s.value === a.som)?.label ?? a.som;

  const Card = ({ a, opaco = false }: { a: Alarme; opaco?: boolean }) => (
    <div className={`glass rounded-2xl p-6 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors ${opaco ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${corTipo(a.tipo)}`}>{icone(a.tipo)}</div>
        <div>
          <h4 className="text-lg font-bold text-white uppercase tracking-tight">{a.nome}</h4>
          <div className="flex items-center gap-3 text-gray-400">
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span className="text-sm font-medium">{a.horario}</span></div>
            <span className="text-xs text-gray-600 truncate max-w-[150px]">{somLabel(a)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => toggle(a.id)} className={`relative w-14 h-8 rounded-full border transition-colors ${a.ativo ? 'bg-[#39FF14]/20 border-[#39FF14]/30' : 'bg-white/5 border-white/10'}`}>
          <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${a.ativo ? 'right-1 bg-[#39FF14]' : 'left-1 bg-gray-500'}`} />
        </button>
        <button onClick={() => editar(a)} className="p-2 text-gray-500 hover:text-[#39FF14] transition-colors"><Pencil className="w-5 h-5" /></button>
        <button onClick={() => excluir(a.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
      </div>
    </div>
  );

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

      <div className="flex justify-end">
        <button onClick={() => { if (Notification.permission !== 'granted') Notification.requestPermission(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#39FF14] text-black font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white transition-all">
          <Plus className="w-5 h-5" /> Novo Alarme
        </button>
      </div>

      {alarmes.length === 0 ? (
        <div className="glass rounded-2xl p-12 flex flex-col justify-center items-center text-center">
          <Bell className="w-12 h-12 text-gray-700 mb-4" />
          <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-1">Nenhum alarme</h4>
          <p className="text-sm text-gray-600">Adicione alarmes para lembrar de beber água, treinar e se alimentar.</p>
        </div>
      ) : (
        <>
          {ativos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Ativos</h3>
              <div className="grid gap-4">{ativos.map(a => <Card key={a.id} a={a} />)}</div>
            </div>
          )}
          {inativos.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Inativos</h3>
              <div className="grid gap-4">{inativos.map(a => <Card key={a.id} a={a} opaco />)}</div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={fechar} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-6">{isEditing ? 'Editar Alarme' : 'Novo Alarme'}</h3>

            <div className="space-y-6">
              {/* Tipo */}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 block">Tipo</label>
                <div className="flex gap-2">
                  {TIPOS_ALARME.map(t => (
                    <button key={t.value} onClick={() => setNovoAlarme(p => ({ ...p, tipo: t.value as any }))}
                      className={`flex-1 py-3 rounded-xl border font-bold uppercase text-sm tracking-widest transition-all ${novoAlarme.tipo === t.value ? 'bg-[#39FF14]/10 border-[#39FF14] text-[#39FF14]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Nome</label>
                <input type="text" value={novoAlarme.nome} onChange={e => setNovoAlarme(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Beber água, Treino matinal..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]" />
              </div>

              {/* Horário */}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Horário</label>
                <input type="time" value={novoAlarme.horario} onChange={e => setNovoAlarme(p => ({ ...p, horario: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]" />
              </div>

              {/* Dias */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-3">Repetir nos dias</label>
                <div className="flex justify-between">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <button key={i} type="button"
                      onClick={() => {
                        const dias = novoAlarme.diasSemana.includes(i)
                          ? novoAlarme.diasSemana.filter(x => x !== i)
                          : [...novoAlarme.diasSemana, i];
                        setNovoAlarme(p => ({ ...p, diasSemana: dias }));
                      }}
                      className={`w-9 h-9 rounded-full border text-xs font-bold transition-all ${novoAlarme.diasSemana.includes(i) ? 'bg-[#39FF14] border-[#39FF14] text-black' : 'border-[#39FF14]/40 text-[#39FF14] hover:bg-[#39FF14]/20'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sons */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-3">Som do Alarme</label>
                <div className="grid gap-2">
                  {OPCOES_SOM.map(s => (
                    <div key={s.value}
                      onClick={() => setNovoAlarme(p => ({ ...p, som: s.value, musicaCustomUrl: undefined, musicaCustomNome: undefined }))}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all ${novoAlarme.som === s.value ? 'bg-[#39FF14]/10 border-[#39FF14]' : 'bg-white/5 border-white/10 hover:bg-white/8'}`}>
                      <div>
                        <p className={`text-sm font-bold ${novoAlarme.som === s.value ? 'text-[#39FF14]' : 'text-white'}`}>{s.label}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); tocarSom(s.value); }}
                        className="p-2 text-gray-500 hover:text-[#39FF14] transition-colors" title="Ouvir prévia">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Música personalizada */}
                  <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${novoAlarme.som === 'custom' ? 'bg-[#39FF14]/10 border-[#39FF14]' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${novoAlarme.som === 'custom' ? 'text-[#39FF14]' : 'text-white'}`}>🎵 Música Personalizada</p>
                      <p className="text-xs text-gray-500 truncate">
                        {novoAlarme.musicaCustomNome ?? 'Escolha um arquivo MP3, WAV, OGG...'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {novoAlarme.som === 'custom' && novoAlarme.musicaCustomUrl && (
                        <button type="button" onClick={() => tocarSom('custom', novoAlarme.musicaCustomUrl)}
                          className="p-2 text-gray-500 hover:text-[#39FF14] transition-colors" title="Ouvir prévia">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                      <label className="flex items-center gap-1 px-3 py-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg text-[#39FF14] text-xs font-bold cursor-pointer hover:bg-[#39FF14]/20 transition-all whitespace-nowrap">
                        <Upload className="w-3 h-3" /> Escolher
                        <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={confirmar} disabled={!novoAlarme.nome || !novoAlarme.horario}
                className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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