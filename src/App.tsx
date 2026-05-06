// src/App.tsx
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import LoginScreen from './components/LoginScreen';
import HomeAluno from './components/HomeAluno';
import SetupRequiredScreen from './components/SetupRequiredScreen';

import DashboardAdmin from './components/DashboardAdmin';

const Loading = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'aluno' | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbSetupRequired, setDbSetupRequired] = useState(false);

  const checkUserRole = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Perfil não encontrado, usando padrão aluno');
        setUserRole('aluno');
      } else {
        setUserRole(data?.role || 'aluno');
      }
    } catch (err) {
      console.log('Erro ao buscar perfil, usando padrão aluno');
      setUserRole('aluno');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          checkUserRole(session.user.id);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <Loading />;
  if (!session) return <LoginScreen />;
  if (userRole === 'admin') return <DashboardAdmin />;
  return <HomeAluno session={session} />;
}