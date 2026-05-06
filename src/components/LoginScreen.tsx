import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Dumbbell, Loader2, Mail, Lock, User } from 'lucide-react';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Email ou senha incorretos. Tente novamente.');
          }
          if (signInError.message.includes('Too many requests')) {
            throw new Error('Muitas tentativas. Aguarde alguns segundos e tente novamente.');
          }
          throw signInError;
        }

        if (!data.user) {
          throw new Error('Erro ao fazer login. Tente novamente.');
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: nome.trim(),
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            throw new Error('Este email já está cadastrado. Faça login.');
          }
          if (signUpError.message.includes('Password')) {
            throw new Error('A senha deve ter pelo menos 6 caracteres.');
          }
          throw signUpError;
        }

        if (data.user) {
          setSuccess('Conta criada com sucesso! Você pode fazer login.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      setError(err.message || 'Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans w-full p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#39FF14]/10 rounded-full mb-4">
            <Dumbbell className="w-10 h-10 text-[#39FF14]" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Simplifique<span className="text-[#39FF14]">Fitness</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Sua academia, sua rotina, seu progresso.</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              {isLogin ? 'Bem-vindo de volta!' : 'Criar nova conta'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Entre com seu email para continuar.' : 'Preencha seus dados para começar.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-4 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2">
              {success}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#39FF14] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#39FF14] transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#39FF14] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#39FF14] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#39FF14] text-black font-black uppercase py-4 rounded-xl hover:opacity-90 transition-opacity tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                isLogin ? 'Entrar' : 'Cadastrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }} 
                className="text-[#39FF14] font-bold hover:underline"
              >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 Simplifique Fitness. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}