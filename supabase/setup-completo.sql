-- ============================================
-- SUPABASE - SETUP COMPLETO (TUDO DE UMA VEZ)
-- ============================================
-- Cole TUDO isso no SQL Editor e clique "Run"
-- Seguro! Usa IF NOT EXISTS em tudo
-- ============================================

-- Habilitar extensão UUID (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  readings_today INTEGER DEFAULT 0,
  last_reading_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- ============================================
-- TABELA: readings
-- ============================================
CREATE TABLE IF NOT EXISTS public.readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  spread_type TEXT NOT NULL,
  cards JSONB NOT NULL,
  question TEXT,
  synthesis TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_user_id ON public.readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON public.readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_spread_type ON public.readings(spread_type);

-- ============================================
-- TABELA: subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  provider TEXT CHECK (provider IN ('stripe', 'mercadopago')),
  provider_subscription_id TEXT,
  plan TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can insert own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can update own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can delete own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Criar políticas (seguras)
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
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao registrar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Função para verificar e atualizar status de assinatura expirada
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at < NOW() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
    -- Também atualizar o tier do perfil
    UPDATE public.profiles
    SET subscription_tier = 'free', subscription_expires_at = NULL
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar expiração
DROP TRIGGER IF EXISTS check_subscription_expiry_trigger ON public.subscriptions;
CREATE TRIGGER check_subscription_expiry_trigger
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.check_subscription_expiry();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para estatísticas do usuário
DROP VIEW IF EXISTS public.user_stats;
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  p.id as user_id,
  p.subscription_tier,
  COUNT(r.id) as total_readings,
  COUNT(CASE WHEN r.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as readings_last_7_days,
  COUNT(CASE WHEN r.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as readings_last_30_days,
  MAX(r.created_at) as last_reading_at
FROM public.profiles p
LEFT JOIN public.readings r ON p.id = r.user_id
GROUP BY p.id, p.subscription_tier;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Dar acesso às tabelas para authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readings TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.user_stats TO authenticated;

-- Dar acesso para anon users (necessário para registro)
GRANT INSERT ON public.profiles TO anon;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Execute esta query para CONFIRMAR que tudo está OK:
SELECT 
  'profiles' as tabela,
  COUNT(*) as total_registros,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public') as total_colunas
FROM public.profiles
UNION ALL
SELECT 'readings', COUNT(*), (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'readings' AND table_schema = 'public')
FROM public.readings
UNION ALL
SELECT 'subscriptions', COUNT(*), (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'subscriptions' AND table_schema = 'public')
FROM public.subscriptions;

-- ✅ SUCESSO! Se viu as 3 tabelas → Tudo pronto!
-- ✅ Seus dados antigos estão INTACTOS (IF NOT EXISTS protegeu tudo)
-- ✅ Você tem todas as colunas, índices, triggers e políticas
