import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BarChart, 
  Users, 
  Dumbbell, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Search, 
  Plus,
  MoreVertical,
  Menu,
  X
} from 'lucide-react';

export default function DashboardAdmin() {
  const [activeMenu, setActiveMenu] = useState('visao-geral');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: BarChart },
    { id: 'alunos', label: 'Alunos', icon: Users },
    { id: 'catalogo', label: 'Catálogo de Exercícios', icon: Dumbbell }
  ];

  const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend?: string }) => (
    <div className="glass rounded-3xl p-6 flex flex-col gap-4 border border-white/5 relative overflow-hidden group hover:border-[#39FF14]/30 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#39FF14]/10 transition-all"></div>
      <div className="flex justify-between items-start relative z-10">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">{title}</p>
        <span className="p-3 rounded-2xl bg-white/5 text-[#39FF14]">
          <Icon className="w-5 h-5" />
        </span>
      </div>
      <div className="relative z-10 flex items-end gap-3 mt-2">
        <h3 className="text-4xl font-black tracking-tighter text-white">{value}</h3>
        {trend && <span className="text-sm font-medium text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded-lg mb-1">{trend}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-[#39FF14] selection:text-black">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a] z-50 sticky top-0">
        <h1 className="text-xl font-black italic tracking-tighter">SIMPLIFIQUE <span className="text-[#39FF14]">FITNESS</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col
        transition-transform duration-300 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 hidden md:block">
          <h1 className="text-2xl font-black italic tracking-tighter">SIMPLIFIQUE <span className="text-[#39FF14]">FITNESS</span></h1>
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 py-8 md:py-4 flex flex-col gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setIsMobileMenuOpen(false); }}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-sm w-full
                  ${isActive 
                    ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#39FF14]' : ''}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 px-6 py-4 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold uppercase tracking-widest text-sm w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase relative z-10">
                {navItems.find(i => i.id === activeMenu)?.label}
              </h2>
              <p className="text-gray-400 mt-2 font-medium">Bem-vindo ao painel de controle central.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14] animate-pulse"></span>
              <span className="text-sm font-bold uppercase tracking-widest text-[#39FF14]">Sistema Online</span>
            </div>
          </header>

          {/* Views */}
          {activeMenu === 'visao-geral' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Alunos" value="1,248" icon={Users} trend="+12% que mês anterior" />
                <StatCard title="Receita (Mês)" value="R$ 45.2K" icon={DollarSign} trend="+8.4%" />
                <StatCard title="Treinos IA Gerados" value="9,302" icon={Activity} trend="+401 esta semana" />
              </div>
              
              {/* placeholder chart área */}
              <div className="glass rounded-3xl p-8 border border-white/5 hidden md:block">
                <h3 className="text-lg font-bold uppercase tracking-widest text-[#39FF14] mb-6">Atividade Recente</h3>
                <div className="h-64 flex items-end justify-between gap-2 opacity-50 px-4 mt-12 pb-4 border-b border-white/10">
                   {/* Fake barras */}
                   {[40, 70, 30, 90, 50, 100, 60, 80, 45, 65, 85, 30].map((h, i) => (
                     <div key={i} className="w-full bg-[#39FF14]/20 rounded-t-sm hover:bg-[#39FF14] transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                       <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black text-xs font-bold px-2 py-1 rounded">
                         {h}0 acessos
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'alunos' && (
            <div className="glass border border-white/5 rounded-3xl p-6 lg:p-8 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="relative w-full md:w-96">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar aluno por nome ou email..." 
                    className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#39FF14] transition-colors font-medium shadow-inner"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] appearance-none font-bold text-sm tracking-widest uppercase flex-1 md:flex-none">
                    <option>STATUS: TODOS</option>
                    <option>ATIVOS</option>
                    <option>INATIVOS</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <th className="pb-4 pl-4">Aluno</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Último Treino</th>
                      <th className="pb-4 text-right pr-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { nome: 'João Silva', email: 'joao.silva@email.com', status: 'Ativo', data: 'Hoje, 08:30' },
                      { nome: 'Maria Santos', email: 'maria.s@email.com', status: 'Ativo', data: 'Ontem, 19:15' },
                      { nome: 'Pedro Henrique', email: 'pedro@email.com', status: 'Inativo', data: 'Há 15 dias' },
                      { nome: 'Ana Costa', email: 'ana.costa@email.com', status: 'Ativo', data: 'Hoje, 06:00' },
                    ].map((aluno, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#39FF14]">
                              {aluno.nome.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white tracking-wide">{aluno.nome}</p>
                              <p className="text-xs text-gray-500">{aluno.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                            aluno.status === 'Ativo' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {aluno.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-400 font-medium">
                          {aluno.data}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <button className="px-4 py-2 bg-white/5 hover:bg-[#39FF14] border border-white/10 hover:border-[#39FF14] text-gray-300 hover:text-black font-bold uppercase tracking-widest text-[10px] rounded-lg transition-colors">
                            Ver Perfil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'catalogo' && (
            <div className="space-y-6">
              <div className="flex justify-end mb-6 border-b border-white/5 pb-6">
                <button className="flex items-center gap-2 bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                  <Plus className="w-5 h-5" />
                  Novo Exercício
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { nome: 'Supino Reto com Barra', grupo: 'Peito', nivel: 'Intermediário' },
                  { nome: 'Agachamento Livre', grupo: 'Pernas', nivel: 'Avançado' },
                  { nome: 'Puxada Frontal', grupo: 'Costas', nivel: 'Iniciante' },
                  { nome: 'Desenvolvimento Halteres', grupo: 'Ombros', nivel: 'Intermediário' },
                  { nome: 'Rosca Direta', grupo: 'Bíceps', nivel: 'Iniciante' },
                  { nome: 'Tríceps Polia', grupo: 'Tríceps', nivel: 'Iniciante' },
                ].map((ex, idx) => (
                  <div key={idx} className="glass p-5 rounded-2xl border border-white/5 flex items-start justify-between group hover:border-[#39FF14]/30 transition-colors">
                    <div>
                      <h4 className="font-bold text-white text-lg">{ex.nome}</h4>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded uppercase font-bold tracking-widest">
                          {ex.grupo}
                        </span>
                        <span className="text-[10px] bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 rounded uppercase font-bold tracking-widest">
                          {ex.nivel}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
