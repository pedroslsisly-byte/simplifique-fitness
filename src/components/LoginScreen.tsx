import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginScreen() {
  const [configOk, setConfigOk] = useState<boolean | null>(null);
  
  useEffect(() => {
    supabase.from('treinos').select('id').limit(1).then(({ error }) => {
      setConfigOk(!error);
    });
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando autenticação...', { email, isLogin });
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('Login response:', { data, error });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: nome,
            }
          }
        });
        console.log('Signup response:', { data, error });
        if (error) throw error;
        alert('Cadastro realizado com sucesso! Verifique seu email se necessário ou continue.');
      }
    } catch (err: any) {
      console.error('Erro de Autenticação:', err);
      const errorMessage = err.message || 'Erro de conexão. Verifique sua internet e tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center font-sans w-full">
      <div className="w-full min-h-screen flex flex-col md:flex-row">
        {/* Image Side (Visual) */}
        <div className="w-full md:w-1/2 min-h-[30vh] md:h-screen relative overflow-hidden flex flex-col justify-end p-8 md:p-16">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase mb-2 italic">
              Simplifique<br />
              <span className="text-[#39FF14]">Fitness</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-light tracking-wide max-w-sm hidden md:block">
              O seu progresso começa com a clareza. Treine de forma inteligente, viva de forma simples.
            </p>
          </div>
        </div>
        
        {/* Form Side */}
        <div className="w-full md:w-1/2 flex-1 flex items-center justify-center p-6 md:p-12 bg-black/20">
          <div className="w-full max-w-md glass p-8 md:p-10 rounded-3xl shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h2>
              <p className="text-gray-500 text-sm italic">
                {isLogin ? 'Faça login para continuar sua jornada.' : 'Inicie sua jornada no Simplifique Fitness.'}
              </p>
            </div>
            
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {configOk === false && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Problema de conexão com banco de dados. Continue mesmo assim.
                </div>
              )}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 input-focus transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 input-focus transition-all"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Senha</label>
                  {isLogin && <a href="#" className="text-[10px] text-[#39FF14] uppercase font-bold hover:underline">Esqueceu?</a>}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/20 input-focus transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#39FF14] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#39FF14] text-black font-black uppercase py-4 rounded-xl hover:opacity-90 transition-opacity mt-4 tracking-tighter disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isLogin ? 'Entrar no App' : 'Cadastrar'
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-xs text-gray-600 uppercase font-bold tracking-widest">
                {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }} 
                  className="text-white hover:text-[#39FF14] transition-colors"
                >
                  {isLogin ? 'Cadastre-se' : 'Faça login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}