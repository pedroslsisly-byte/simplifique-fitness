import React, { useState } from 'react';
import { Database, Copy, CheckCircle2 } from 'lucide-react';

export default function SetupRequiredScreen({ onDismiss }: { onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- Configuração do Banco de Dados no Supabase (SIMPLIFIQUE FITNESS)
-- IMPORTANTE: Copie TUDO deste bloco, cole no "SQL Editor" do seu Supabase e aperte "Run".

-- 0. Garantir permissões completas do schema para o Supabase
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 1. Criação/Atualização da tabela 'users'
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  nome TEXT,
  email TEXT,
  role TEXT DEFAULT 'aluno',
  avatar_url TEXT,
  objetivo TEXT,
  peso_atual NUMERIC,
  peso_meta NUMERIC,
  dias_treino INTEGER,
  lembrar_agua BOOLEAN DEFAULT true,
  lembrar_treino BOOLEAN DEFAULT true,
  lembrar_refeicao BOOLEAN DEFAULT false
);

-- Garantir acesso de CRUD básico para a tabela após ela ser criada
GRANT ALL PRIVILEGES ON TABLE public.users TO anon, authenticated, service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.users;

CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Criação/Atualização da tabela 'treinos'
CREATE TABLE IF NOT EXISTS public.treinos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Garantir acesso de CRUD básico para a tabela após ela ser criada
GRANT ALL PRIVILEGES ON TABLE public.treinos TO anon, authenticated, service_role;

ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios treinos ou treinos gerais" ON public.treinos;

CREATE POLICY "Usuários podem ver seus próprios treinos ou treinos gerais" 
ON public.treinos FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- 3. Inserir contas já existentes (caso falte no banco)
INSERT INTO public.users (id, email, nome, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Aluno'), 'aluno'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 4. Função e Trigger para criar aluno automaticamente no sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Aluno'), 
    'aluno'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-mesh font-sans text-white flex flex-col items-center justify-center p-6">
      <div className="glass max-w-3xl w-full p-8 rounded-3xl border-l-4 border-l-[#39FF14]">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/5 rounded-2xl">
            <Database className="w-8 h-8 text-[#39FF14]" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight">Banco de Dados Requer Configuração</h1>
            <p className="text-gray-400">Ocorreu um erro de permissão (Permission Denied). As tabelas ainda não foram criadas ou as permissões de Seguranças (RLS) estão incorretas no seu Supabase.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-bold">Siga os passos abaixo, pois eu não consigo acessar seu Dashboard do Supabase para fazer isso automaticamente:</p>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>Acesse o painel do seu projeto no <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#39FF14] hover:underline">Supabase</a>.</li>
            <li>No menu lateral, vá em <strong>SQL Editor</strong>.</li>
            <li>Clique em <strong>New Query</strong> e cole o código abaixo.</li>
            <li>Clique em <strong>Run</strong> para criar as tabelas e dar as permissões necessárias.</li>
          </ol>
        </div>

        <div className="relative mt-6 mb-8 group">
          <button 
            onClick={copyToClipboard}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold uppercase"
          >
            {copied ? <><CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar SQL</>}
          </button>
          <pre className="bg-black/50 border border-white/10 p-6 rounded-2xl overflow-x-auto text-xs text-gray-300 font-mono h-64">
            <code>{sqlCode}</code>
          </pre>
        </div>

        <button 
          onClick={onDismiss}
          className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors"
        >
          Pronto! Já executei o script no Supabase
        </button>
      </div>
    </div>
  );
}
