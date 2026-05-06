import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Save, Bell, RefreshCw, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfileTab({ session }: { session: any }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState({
    nome: '',
    avatar_url: '',
    objetivo: 'Hipertrofia',
    peso_atual: '',
    peso_meta: '',
    dias_treino: '3',
    lembrar_agua: true,
    lembrar_treino: true,
    lembrar_refeicao: false
  });
  
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Evolução mock data (placeholder)
  const mockEvolutionData = [
    { name: 'Jan', peso: 85 },
    { name: 'Fev', peso: 84 },
    { name: 'Mar', peso: 82.5 },
    { name: 'Abr', peso: 81 },
    { name: 'Mai', peso: 79.5 },
    { name: 'Jun', peso: parseInt(profile.peso_atual) || 78 },
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        setFetching(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error loading user profile', error);
          if (error.message.includes('permission denied') || error.message.includes('does not exist')) {
            setMessage({ type: 'error', text: 'Você precisa rodar o script SQL no Supabase (ver tela Home) para habilitar as tabelas.' });
          }
        } else if (data) {
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string) => {
    setProfile(prev => ({ ...prev, [name]: !(prev as any)[name] }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      
      const updates = {
        id: session.user.id,
        objetivo: profile.objetivo,
        peso_atual: profile.peso_atual ? parseFloat(profile.peso_atual as string) : null,
        peso_meta: profile.peso_meta ? parseFloat(profile.peso_meta as string) : null,
        dias_treino: profile.dias_treino ? parseInt(profile.dias_treino as string) : null,
        // Optional tracking flags could also be saved if added to schema
      };

      const { error } = await supabase
        .from('users')
        .upsert(updates);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB
      setMessage({ type: 'error', text: 'Imagem muito grande (máximo 2MB).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfile(prev => ({ ...prev, avatar_url: event.target!.result as string }));
        // Salvar avatar imediatamente
        saveAvatar(event.target!.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = async (base64Str: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .upsert({ id: session.user.id, avatar_url: base64Str });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao salvar foto.' });
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (fetching) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Meu Perfil</h2>
          <p className="text-gray-400 text-sm tracking-wide">Gerencie seus dados e acompanhe sua evolução.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário - Ocupa 2 colunas no grid lg */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass rounded-3xl p-6 lg:p-8">
            {/* Foto de Perfil */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/5">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleAvatarInput} 
                className="hidden" 
              />
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-gray-500 uppercase">{profile.nome?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-[#39FF14]" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold uppercase tracking-tight">{profile.nome || session.user.email}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 cursor-pointer hover:text-[#39FF14]" onClick={triggerFileInput}>Alterar Foto de Perfil</p>
              </div>
            </div>

            {/* Configuração de Rotina e Metas */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h4 className="text-lg font-black italic tracking-widest uppercase text-[#39FF14] neon-border pl-3">Metas e Medidas</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Objetivo Principal</label>
                  <select 
                    name="objetivo" 
                    value={profile.objetivo || ''} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] appearance-none"
                  >
                    <option value="" disabled className="bg-[#050505]">Selecione um objetivo</option>
                    <option value="Emagrecimento" className="bg-[#050505]">Emagrecimento</option>
                    <option value="Hipertrofia" className="bg-[#050505]">Hipertrofia</option>
                    <option value="Manutenção" className="bg-[#050505]">Manutenção</option>
                    <option value="Condicionamento Físico" className="bg-[#050505]">Condicionamento Físico</option>
                    <option value="Definição Muscular" className="bg-[#050505]">Definição Muscular</option>
                    <option value="Ganho de Força" className="bg-[#050505]">Ganho de Força</option>
                    <option value="Saúde e Bem-estar" className="bg-[#050505]">Saúde e Bem-estar</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Dias p/ treinar (sem.)</label>
                  <select 
                    name="dias_treino" 
                    value={profile.dias_treino || ''} 
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] appearance-none"
                  >
                    <option value="" disabled className="bg-[#050505]">Selecione</option>
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <option key={d} value={d} className="bg-[#050505]">{d} dia{d > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Peso Atual (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    name="peso_atual" 
                    value={profile.peso_atual || ''} 
                    onChange={handleChange}
                    placeholder="Ex: 75.5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#39FF14] transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Meta de Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    name="peso_meta" 
                    value={profile.peso_meta || ''} 
                    onChange={handleChange}
                    placeholder="Ex: 70.0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#39FF14] transition-colors"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20'}`}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto mt-4 px-8 py-3 bg-[#39FF14] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar Alterações
              </button>
            </form>
          </section>

          {/* Gráfico de Evolução (Recharts Desktop View) */}
          <section className="glass rounded-3xl p-6 lg:p-8 hidden sm:block">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <BarChart3 className="w-6 h-6 text-[#39FF14]" />
              <h4 className="text-lg font-black italic tracking-widest uppercase text-white">Evolução de Peso</h4>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400 font-bold ml-auto">ÚLTIMOS 6 MESES</span>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="gray" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="gray" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(57,255,20,0.5)', borderRadius: '12px' }}
                    itemStyle={{ color: '#39FF14', fontWeight: 'bold' }}
                    labelStyle={{ color: 'gray', marginBottom: '5px' }}
                  />
                  <Area type="monotone" dataKey="peso" stroke="#39FF14" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Coluna Sidebar (Lembretes) */}
        <div className="space-y-6">
          <section className="glass rounded-3xl p-6">
            <h4 className="text-lg font-black italic tracking-widest uppercase text-[#39FF14] neon-border pl-3 mb-6">Lembretes</h4>
            
            <div className="space-y-4">
              <ToggleRow 
                label="Beber Água" 
                active={profile.lembrar_agua} 
                onChange={() => handleToggle('lembrar_agua')} 
                desc="Avisos a cada 2h"
              />
              <ToggleRow 
                label="Lembrar do Treino" 
                active={profile.lembrar_treino} 
                onChange={() => handleToggle('lembrar_treino')} 
                desc="Aviso 1h antes"
              />
              <ToggleRow 
                label="Lembrar Refeições" 
                active={profile.lembrar_refeicao} 
                onChange={() => handleToggle('lembrar_refeicao')} 
                desc="Cronograma alimentar"
              />
            </div>
            
            <div className="mt-8 p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl flex items-start gap-3">
              <Bell className="w-5 h-5 text-[#39FF14] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 font-medium">As notificações push devem estar ativadas no seu dispositivo para receber os lembretes do aplicativo.</p>
            </div>
          </section>
          
          {/* Gráfico Mobile Fallback */}
          <section className="glass rounded-3xl p-6 sm:hidden">
             <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-[#39FF14]" />
              <h4 className="text-sm font-black italic tracking-widest uppercase text-white">Evolução</h4>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEvolutionData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPesoMob" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Area type="monotone" dataKey="peso" stroke="#39FF14" strokeWidth={2} fillOpacity={1} fill="url(#colorPesoMob)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Sub-component para os toggles
function ToggleRow({ label, desc, active, onChange }: { label: string, desc: string, active: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={onChange}>
      <div>
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-[10px] text-gray-500 font-semibold uppercase">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-[#39FF14]' : 'bg-gray-700'}`}>
        <div className={`absolute top-1 left-1 bg-black w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
