import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Home, Dumbbell, User, LogOut, ChevronRight, PlayCircle, Timer, Bell } from 'lucide-react';
import ProfileTab from './ProfileTab';
import TreinosTab from './TreinosTab';
import AlarmesTab from './AlarmesTab';
import CronometroTimer from './CronometroTimer';

export default function HomeAluno({ session }: { session: any }) {
  const [nome, setNome] = useState('');
  const [treinos, setTreinos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [dbError, setDbError] = useState(false);
  const [cronometroOpen, setCronometroOpen] = useState(false);
  const [treinoAtual, setTreinoAtual] = useState<any>(() => {
    const saved = localStorage.getItem('treinoAtual');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  const handleSetTreino = (treino: any) => {
    setTreinoAtual(treino);
    if (treino) localStorage.setItem('treinoAtual', JSON.stringify(treino));
    else localStorage.removeItem('treinoAtual');
    setActiveTab('home');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Buscar nome do aluno
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('nome')
          .eq('id', session.user.id)
          .single();
        
        if (userError && (userError.message.includes('permission denied') || userError.message.includes('relation "public.users" does not exist'))) {
          setDbError(true);
        } else if (userData?.nome) {
          setNome(userData.nome);
        } else {
          setNome(session.user.email?.split('@')[0] || 'Aluno');
        }

        // Buscar treinos (assumindo que a tabela se chama 'treinos')
        // Caso queira filtrar por usuário, adicione: .eq('user_id', session.user.id)
        const { data: treinosData, error: treinosError } = await supabase
          .from('treinos')
          .select('*')
          .limit(10);

        if (treinosError && (treinosError.message.includes('permission denied') || treinosError.message.includes('relation "public.treinos" does not exist'))) {
          setDbError(true);
        } else if (treinosData) {
          setTreinos(treinosData);
        } else if (treinosError) {
          console.error('Erro ao buscar treinos:', treinosError.message);
        }

      } catch (err) {
        console.error('Erro geral ao carregar HomeAluno:', err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const handleSignOut = () => {
    localStorage.removeItem('treinoAtual');
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-mesh font-sans text-white flex flex-col">
      {/* Header / Navegação */}
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black italic uppercase tracking-tighter shadow-sm">
              Simplifique<span className="text-[#39FF14]">Fitness</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'home' ? 'text-[#39FF14]' : 'text-gray-400 hover:text-white'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('treinos')}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'treinos' ? 'text-[#39FF14]' : 'text-gray-400 hover:text-white'}`}
            >
              Meus Treinos
            </button>
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'perfil' ? 'text-[#39FF14]' : 'text-gray-400 hover:text-white'}`}
            >
              Perfil
            </button>
            <button 
              onClick={() => setActiveTab('alarmes')}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'alarmes' ? 'text-[#39FF14]' : 'text-gray-400 hover:text-white'}`}
            >
              Alarmes
            </button>
            <button onClick={() => setCronometroOpen(true)} className="text-sm font-bold uppercase tracking-widest transition-colors text-yellow-400 hover:text-yellow-300 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Timer
            </button>
            <button 
              onClick={handleSignOut}
              className="text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors ml-4"
            >
              Sair
            </button>
          </nav>
          
          {/* Mobile menu handler (simplified) */}
          <button onClick={handleSignOut} className="md:hidden flex items-center justify-center p-2 text-white/50 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex justify-around items-center glass p-3 border-b border-white/5">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#39FF14]' : 'text-gray-500'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Home</span>
        </button>
        <button onClick={() => setActiveTab('treinos')} className={`flex flex-col items-center gap-1 ${activeTab === 'treinos' ? 'text-[#39FF14]' : 'text-gray-500'}`}>
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Treinos</span>
        </button>
        <button onClick={() => setActiveTab('perfil')} className={`flex flex-col items-center gap-1 ${activeTab === 'perfil' ? 'text-[#39FF14]' : 'text-gray-500'}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Perfil</span>
        </button>
        <button onClick={() => setActiveTab('alarmes')} className={`flex flex-col items-center gap-1 ${activeTab === 'alarmes' ? 'text-[#39FF14]' : 'text-gray-500'}`}>
          <Bell className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Alarmes</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 flex flex-col gap-8">
        
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'perfil' ? (
          <ProfileTab session={session} />
        ) : activeTab === 'alarmes' ? (
          <AlarmesTab />
        ) : activeTab === 'treinos' ? (
          <TreinosTab onSelectTreino={handleSetTreino} />
        ) : (
          <>
            {/* Header Section */}
            <section className="flex flex-col gap-2">
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
                Olá, <span className="text-[#39FF14]">{nome || 'Aluno'}</span>
              </h2>
              <p className="text-gray-400 font-light tracking-wide text-sm md:text-base">
                Pronto para o treino de hoje? O progresso não espera.
              </p>
            </section>

            {dbError && (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col gap-2 mb-4">
                <h3 className="text-red-500 font-bold uppercase tracking-widest text-lg">⚠️ Configuração do Supabase Necessária</h3>
                <p className="text-gray-300 text-sm">
                  Foi detectado um erro de "Permission Denied" ou tabela inexistente. Para resolver isso:
                </p>
                <ol className="list-decimal list-inside text-gray-400 text-sm space-y-1 mt-2">
                  <li>Abra o painel do seu projeto no Supabase.</li>
                  <li>Navegue até a seção <strong>SQL Editor</strong>.</li>
                  <li>Copie o conteúdo do arquivo <strong className="text-white">supabase-setup.sql</strong> (que criamos no seu projeto).</li>
                  <li>Cole no SQL Editor e clique em <strong>Run</strong> para criar as tabelas e políticas de segurança.</li>
                </ol>
              </div>
            )}

            {/* Treino do Dia (Placeholder / Em Destaque) */}
            <section className="glass rounded-3xl p-8 relative overflow-hidden group hover:border-[#39FF14]/50 transition-colors border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-[#39FF14]/20 transition-all"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {treinoAtual ? (
                  <>
                    <div>
                      <span className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">Treino do Dia</span>
                      <h3 className="text-3xl font-black italic tracking-tight uppercase mb-2">{treinoAtual.nome}</h3>
                      <p className="text-gray-400 text-sm max-w-md">
                        {treinoAtual.descricao || `${treinoAtual.categoria} - ${treinoAtual.duracao}. Nível: ${treinoAtual.nivel}`}
                      </p>
                    </div>
                    
                    <button onClick={() => setCronometroOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 bg-yellow-500 text-black font-black uppercase text-sm tracking-widest py-4 px-8 rounded-xl hover:bg-white transition-all">
                      <Timer className="w-5 h-5" />
                      Cronômetro
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">Treino do Dia</span>
                      <h3 className="text-3xl font-black italic tracking-tight uppercase mb-2">NENHUM TREINO DEFINIDO</h3>
                      <p className="text-gray-400 text-sm max-w-md">Vá na aba "Meus Treinos" e escolha um treino do catálogo para começar.</p>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab('treinos')}
                      className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#39FF14] text-black font-black uppercase text-sm tracking-widest py-4 px-8 rounded-xl hover:bg-white hover:text-black transition-all"
                    >
                      <PlayCircle className="w-5 h-5" />
                      ESCOLHER
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Lista da tabela 'treinos' do Supabase */}
            <section className="mt-4 flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <h3 className="text-XL font-black italic uppercase tracking-widest text-[#39FF14] neon-border pl-3">Meus Treinos</h3>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest cursor-pointer hover:text-white transition-colors">Ver todos</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treinos.length === 0 ? (
                  <div className="col-span-full py-12 glass rounded-2xl flex flex-col justify-center items-center text-center">
                    <Dumbbell className="w-12 h-12 text-gray-700 mb-4" />
                    <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-1">Nenhum treino disponível</h4>
                    <p className="text-sm text-gray-600">A tabela 'treinos' está vazia ou não está configurada corretamente.</p>
                  </div>
                ) : (
                  treinos.map((treino, index) => (
                    <div key={treino.id || index} onClick={() => handleSetTreino(treino)} className="glass p-6 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                          {treino.nome || treino.titulo || treino.title || treino.name || `Treino ${index + 1}`}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {treino.descricao || treino.description || "Descrição não informada."}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#39FF14] group-hover:bg-[#39FF14] group-hover:text-black transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <CronometroTimer isOpen={cronometroOpen} onClose={() => setCronometroOpen(false)} />
    </div>
  );
}
