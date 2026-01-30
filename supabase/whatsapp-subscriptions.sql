-- ============================================
-- WHATSAPP DAILY CARD SUBSCRIPTIONS
-- ============================================
-- Tabela para gerenciar assinaturas de Carta do Dia pelo WhatsApp
-- Apenas usuários Premium podem se inscrever
-- ============================================

CREATE TABLE IF NOT EXISTS public.whatsapp_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '+55', -- Suporte internacional
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscriptions_user_id ON public.whatsapp_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscriptions_is_active ON public.whatsapp_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscriptions_phone ON public.whatsapp_subscriptions(phone_number);

-- RLS
ALTER TABLE public.whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own whatsapp subscription"
  ON public.whatsapp_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whatsapp subscription"
  ON public.whatsapp_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whatsapp subscription"
  ON public.whatsapp_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own whatsapp subscription"
  ON public.whatsapp_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS set_whatsapp_subscriptions_updated_at ON public.whatsapp_subscriptions;
CREATE TRIGGER set_whatsapp_subscriptions_updated_at
  BEFORE UPDATE ON public.whatsapp_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_subscriptions TO authenticated;

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para verificar se usuário é premium antes de permitir assinatura WhatsApp
CREATE OR REPLACE FUNCTION public.check_premium_for_whatsapp()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
BEGIN
  -- Buscar o tier do usuário
  SELECT subscription_tier INTO user_tier
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Só permite se for premium
  IF user_tier != 'premium' THEN
    RAISE EXCEPTION 'WhatsApp Daily Card is only available for Premium subscribers';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para verificar premium antes de inserir
DROP TRIGGER IF EXISTS check_premium_before_whatsapp_subscription ON public.whatsapp_subscriptions;
CREATE TRIGGER check_premium_before_whatsapp_subscription
  BEFORE INSERT ON public.whatsapp_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.check_premium_for_whatsapp();
