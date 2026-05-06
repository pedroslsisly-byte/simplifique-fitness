-- Configuração de Tabelas e Políticas (RLS) no Supabase
-- Copie este código e cole no painel "SQL Editor" do seu projeto Supabase e clique em "Run".

-- 0. Garantir permissões básicas do schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 1. Criação/Atualização da tabela 'users' (se não existir)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  nome TEXT,
  email TEXT,
  role TEXT DEFAULT 'aluno',
  avatar_url TEXT,
  objetivo TEXT,
  peso_atual NUMERIC,
  peso_meta NUMERIC,
  dias_treino INTEGER
);

-- Garantir acesso de CRUD básico para PostgREST
GRANT ALL PRIVILEGES ON TABLE public.users TO anon, authenticated, service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 🚨 REMOÇÃO DE POLÍTICAS ANTIGAS (ISSO CORRIGE O ERRO DE "INFINITE RECURSION") 🚨
-- Removemos todas as políticas possíveis que possam ter sido criadas antes para evitar loops
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;

-- Criar política segura: usuários só podem LER o próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Criar política segura: usuários só podem ATUALIZAR o próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- Criar política: usuários podem INSERIR seu próprio perfil (para signup)
CREATE POLICY "Usuários podem criar seu perfil" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);


-- 2. Criação/Atualização da tabela 'treinos' (se não existir)
CREATE TABLE IF NOT EXISTS public.treinos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Garantir acesso de CRUD básico para PostgREST
GRANT ALL PRIVILEGES ON TABLE public.treinos TO anon, authenticated, service_role;

-- Habilitar RLS para treinos
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios treinos ou treinos gerais" ON public.treinos;

-- Criar política: permissão para LER treinos (se for do usuário logado OU se for um treino geral sem user_id)
CREATE POLICY "Usuários podem ver seus próprios treinos ou treinos gerais" 
ON public.treinos FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);


-- 3. Trigger de Cadastro de Novos Usuários
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
  );
  RETURN NEW;
END;
$$;

-- Vincular o trigger (Ignora se já existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. Criação da tabela 'alarmes'
CREATE TABLE IF NOT EXISTS public.alarmes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('agua', 'treino', 'refeicao')),
  nome TEXT NOT NULL,
  horario TIME NOT NULL,
  ativo BOOLEAN DEFAULT true,
  dias_semana TEXT DEFAULT '1,2,3,4,5,6,7',
  created_at TIMESTAMP DEFAULT NOW()
);

GRANT ALL PRIVILEGES ON TABLE public.alarmes TO anon, authenticated, service_role;
ALTER TABLE public.alarmes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios alarmes" ON public.alarmes;
DROP POLICY IF EXISTS "Usuários podem inserir alarmes" ON public.alarmes;
DROP POLICY IF EXISTS "Usuários podem atualizar alarmes" ON public.alarmes;
DROP POLICY IF EXISTS "Usuários podem excluir alarmes" ON public.alarmes;

CREATE POLICY "Usuários podem ver seus próprios alarmes" 
ON public.alarmes FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem inserir alarmes" 
ON public.alarmes FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem atualizar alarmes" 
ON public.alarmes FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem excluir alarmes" 
ON public.alarmes FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Adicionar colunas para dias da semana e tipo de som
ALTER TABLE public.alarmes 
ADD COLUMN IF NOT EXISTS dias_semana INT[] DEFAULT '{0,1,2,3,4,5,6}',
ADD COLUMN IF NOT EXISTS som TEXT DEFAULT 'bell';
