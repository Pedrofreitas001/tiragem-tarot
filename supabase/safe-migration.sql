-- ============================================
-- MIGRAÇÃO SEGURA DO SUPABASE
-- ============================================
-- Use este script para ADICIONAR coisas novas
-- SEM deletar dados existentes
-- ============================================

-- ⚠️ IMPORTANTE: Execute linha por linha!
-- Copie uma seção, execute, verifique, depois próxima

-- ============================================
-- PASSO 1: VERIFICAR ESTADO ATUAL
-- ============================================

-- Executar PRIMEIRO para ver o que já existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Resultado esperado:
-- ✅ Se tem: profiles, readings, subscriptions → vá para PASSO 2
-- ❌ Se não tem nada → execute schema.sql completo


-- ============================================
-- PASSO 2: ESTENDER TABELAS COM NOVAS COLUNAS
-- ============================================

-- Se precisar adicionar coluna em profiles:
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS readings_today INTEGER DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_reading_date DATE;

-- Se precisar em readings:
ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS spread_type TEXT;

ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS cards JSONB;

ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS question TEXT;

ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS synthesis TEXT;

ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Se precisar em subscriptions:
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS provider TEXT CHECK (provider IN ('stripe', 'mercadopago'));

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS plan TEXT;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS price_cents INTEGER;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;


-- ============================================
-- PASSO 3: ADICIONAR ÍNDICES (performance)
-- ============================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Índices para readings
CREATE INDEX IF NOT EXISTS idx_readings_user_id ON public.readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON public.readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_spread_type ON public.readings(spread_type);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);


-- ============================================
-- PASSO 4: VERIFICAR QUE TUDO ESTÁ OK
-- ============================================

-- Ver estrutura de profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver contagem de dados
SELECT 
  'profiles' as tabela, COUNT(*) as total
FROM public.profiles
UNION ALL
SELECT 'readings', COUNT(*) FROM public.readings
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM public.subscriptions;

-- Resultado: ✅ Se contagem é > 0, seus dados estão intactos!


-- ============================================
-- PASSO 5: HABILITAR RLS (Segurança)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Apagar políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can insert own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can update own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can delete own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Criar políticas NOVAS
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own readings"
  ON public.readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings"
  ON public.readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings"
  ON public.readings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own readings"
  ON public.readings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================
-- PASSO 6: CRIAR/ATUALIZAR FUNÇÕES
-- ============================================

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao registrar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================
-- ✅ TUDO PRONTO!
-- ============================================

-- Executar esta query para CONFIRMAR que tudo está OK:
SELECT 
  schemaname as schema,
  tablename as tabela,
  COUNT(*) as colunas
FROM pg_tables t
LEFT JOIN information_schema.columns c 
  ON t.tablename = c.table_name AND t.schemaname = c.table_schema
WHERE t.schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ✅ Se vir: profiles, readings, subscriptions → SUCESSO!
-- ✅ Se sua contagem de dados aumentou ou permaneceu igual → SEUS DADOS ESTÃO SEGUROS!
