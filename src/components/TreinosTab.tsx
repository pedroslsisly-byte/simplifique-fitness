import React, { useState } from 'react';
import { Dumbbell, Clock, Activity, ChevronRight, X, Sparkles, Loader2 } from 'lucide-react';

const CATEGORIAS = ['Todos', 'Musculação', 'Crossfit', 'Funcional', 'Cardio', 'Pilates', 'Artes Marciais'];

const TREINOS_MOCK = [
  { id: 1, categoria: 'Musculação', nome: 'Hipertrofia A/B/C', duracao: '60 min', nivel: 'Intermediário', exercicios: ['Supino Reto - 4x10', 'Agachamento Livre - 4x10', 'Desenvolvimento Halteres - 3x12', 'Puxada Frontal - 4x12'] },
  { id: 2, categoria: 'Musculação', nome: 'Força Máxima', duracao: '45 min', nivel: 'Avançado', exercicios: ['Levantamento Terra - 5x5', 'Supino Fechado - 5x5', 'Agachamento Frontal - 5x5'] },
  { id: 3, categoria: 'Musculação', nome: 'Full Body Iniciante', duracao: '40 min', nivel: 'Iniciante', exercicios: ['Leg Press - 3x15', 'Puxada Máquina - 3x15', 'Supino Máquina - 3x15', 'Prancha - 3x30s'] },
  { id: 4, categoria: 'Funcional', nome: 'Treino HIIT 15 min', duracao: '15 min', nivel: 'Intermediário', exercicios: ['Burpees - 45s', 'Mountain Climbers - 45s', 'Jumping Jacks - 45s', 'Descanso 15s (Repetir 4x)'] },
  { id: 5, categoria: 'Funcional', nome: 'Mobilidade e Core', duracao: '30 min', nivel: 'Iniciante', exercicios: ['Gato-Camelo - 2x10', 'Rotação Torácica - 2x10', 'Prancha Lateral - 3x30s', 'Abdominal Remador - 3x15'] },
  { id: 6, categoria: 'Crossfit', nome: 'WOD do Dia', duracao: '50 min', nivel: 'Avançado', exercicios: ['Aquecimento Modular', 'AMRAP 20 min:', '5 Pull-ups', '10 Push-ups', '15 Air Squats'] },
  { id: 7, categoria: 'Crossfit', nome: 'LPO Básico', duracao: '45 min', nivel: 'Intermediário', exercicios: ['Snatch Balance - 4x3', 'Hang Power Cleans - 5x3', 'Overhead Squat - 4x5'] },
  { id: 8, categoria: 'Cardio', nome: 'Corrida Intervalada', duracao: '30 min', nivel: 'Intermediário', exercicios: ['Aquecimento 5 min (Trote)', 'Sprint 1 min / Caminhada 1 min (x10)', 'Resfriamento 5 min'] },
  { id: 9, categoria: 'Pilates', nome: 'Mat Pilates Base', duracao: '40 min', nivel: 'Iniciante', exercicios: ['The Hundred', 'Roll Up', 'Single Leg Circle', 'Spine Stretch Forward'] },
  { id: 10, categoria: 'Artes Marciais', nome: 'Muay Thai Fundamentals', duracao: '60 min', nivel: 'Iniciante', exercicios: ['Pular Corda - 10 min', 'Sombra - 3 rounds (3 min)', 'Saco de Pancadas - 4 rounds', 'Abdominais Fortalecimento'] }
];

interface TreinosTabProps {
  onSelectTreino?: (treino: any) => void;
}

export default function TreinosTab({ onSelectTreino }: TreinosTabProps) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedTreino, setSelectedTreino] = useState<typeof TREINOS_MOCK[0] | null>(null);
  const [tempoDisponivel, setTempoDisponivel] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptedExercicios, setAdaptedExercicios] = useState<string[]>([]);
  const [adaptedDuracao, setAdaptedDuracao] = useState<string>('');

  const handleSelectTreino = (treino: typeof TREINOS_MOCK[0] | null) => {
    setSelectedTreino(treino);
    if (treino) {
      setAdaptedExercicios(treino.exercicios);
      setAdaptedDuracao(treino.duracao);
    }
    setTempoDisponivel('');
    setIsAdapting(false);
  };

  const adaptarComIA = () => {
    const tempo = Number(tempoDisponivel);
    if (!tempo || tempo <= 0 || !selectedTreino) return;
    
    setIsAdapting(true);
    setTimeout(() => {
      const originalTime = parseInt(selectedTreino.duracao);
      
      const totalExs = selectedTreino.exercicios.length;
      // Define to cut the list in half
      const targetExs = Math.max(1, Math.ceil(totalExs / 2));
      
      const novosExs = selectedTreino.exercicios.slice(0, targetExs).map(ex => {
        return ex + ' (Adaptado)';
      });
      
      setAdaptedExercicios(novosExs);
      setAdaptedDuracao(`${tempo} min (Ajustado pela IA ✨)`);
      setIsAdapting(false);
      alert(`Treino adaptado para ${tempo} minutos!`);
    }, 3000);
  };

  const filteredTreinos = activeCategory === 'Todos' 
    ? TREINOS_MOCK 
    : TREINOS_MOCK.filter(t => t.categoria === activeCategory);

  return (
    <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <section className="flex flex-col gap-2">
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
          Catálogo de <span className="text-[#39FF14]">Treinos</span>
        </h2>
        <p className="text-gray-400 font-light tracking-wide text-sm md:text-base">
          Escolha sua modalidade e encontre o treino ideal para o seu objetivo hoje.
        </p>
      </section>

      {/* Tabs / Filtros */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-3 min-w-max">
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]'
                  : 'glass text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Treinos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreinos.length === 0 ? (
          <div className="col-span-full py-12 glass rounded-2xl flex flex-col justify-center items-center text-center">
            <Dumbbell className="w-12 h-12 text-gray-700 mb-4" />
            <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-1">Nenhum treino encontrado</h4>
            <p className="text-sm text-gray-600">Ainda não temos treinos para essa categoria.</p>
          </div>
        ) : (
          filteredTreinos.map(treino => (
            <div 
              key={treino.id} 
              className="glass rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-[#39FF14]/30 transition-colors border border-white/5"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#39FF14]/10 transition-all"></div>

              {/* Tag Nível & Categoria */}
              <div className="flex items-center justify-between relative z-10 w-full mb-2">
                <span className="inline-block px-3 py-1 bg-white/5 text-gray-300 border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {treino.categoria}
                </span>
              </div>

              {/* Título & Detalhes */}
              <div className="flex flex-col gap-3 flex-1 relative z-10">
                <h3 className="text-2xl font-black italic tracking-tight uppercase group-hover:text-[#39FF14] transition-colors">
                  {treino.nome}
                </h3>
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-sm font-medium">{treino.duracao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Activity className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-sm font-medium">{treino.nivel}</span>
                  </div>
                </div>
              </div>

              {/* Botão Ver Detalhes */}
              <button 
                onClick={() => handleSelectTreino(treino)}
                className="w-full flex items-center justify-center gap-2 bg-[#39FF14]/10 border border-[#39FF14]/20 hover:bg-[#39FF14] hover:border-[#39FF14] text-[#39FF14] hover:text-black transition-all font-black uppercase text-sm tracking-widest py-4 rounded-xl mt-auto relative z-10"
              >
                Ver Detalhes
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes do Treino */}
      {selectedTreino && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => handleSelectTreino(null)}
        >
          <div 
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 pb-4 border-b border-white/5">
              <button 
                onClick={() => handleSelectTreino(null)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <span className="inline-block px-3 py-1 mb-4 bg-white/5 text-gray-300 border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {selectedTreino.categoria}
              </span>
              
              <h3 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4 pr-10">
                {selectedTreino.nome}
              </h3>

              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#39FF14]" />
                  <span className={`text-sm font-medium ${adaptedDuracao.includes('IA') ? 'text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]' : ''}`}>{adaptedDuracao}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#39FF14]" />
                  <span className="text-sm font-medium">{selectedTreino.nivel}</span>
                </div>
              </div>

              {/* Controles da IA */}
              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-[#39FF14]/20 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Tempo disponível hoje?</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={tempoDisponivel}
                      onChange={e => setTempoDisponivel(e.target.value)}
                      placeholder="Ex: 30" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
                    />
                    <span className="text-sm text-gray-400 font-medium">min</span>
                  </div>
                </div>
                <button 
                  onClick={adaptarComIA}
                  disabled={isAdapting || !tempoDisponivel || Number(tempoDisponivel) <= 0}
                  className="w-full sm:w-auto self-end px-6 py-3 bg-[linear-gradient(45deg,transparent,rgba(57,255,20,0.1),transparent)] bg-[length:200%_200%] animate-[gradient_2s_linear_infinite] border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14]/20 font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)] whitespace-nowrap"
                >
                  {isAdapting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  )}
                  {isAdapting ? 'Gerando...' : '✨ PERSONALIZAR TREINO'}
                </button>
              </div>
            </div>

            {/* Modal Body / Exercícios */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 scrollbar-hide">
              {isAdapting ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin" />
                  <p className="text-[#39FF14] font-bold tracking-widest uppercase text-sm animate-pulse text-center">
                    A IA está montando seu treino...
                  </p>
                </div>
              ) : (
                <>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#39FF14] mb-4">Exercícios</h4>
                  <ul className="space-y-3">
                    {adaptedExercicios.map((ex, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-[#39FF14]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[#39FF14] text-xs font-bold">{idx + 1}</span>
                        </div>
                        <span className="text-gray-300 font-medium">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 pt-4 border-t border-white/5 bg-black/20">
              <button 
                onClick={() => {
                  if (onSelectTreino) {
                    onSelectTreino(selectedTreino);
                  } else {
                    alert(`O treino "${selectedTreino.nome}" foi definido como atual! (Mock)`);
                  }
                  setSelectedTreino(null);
                }}
                className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors"
              >
                Definir como meu Treino Atual
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
