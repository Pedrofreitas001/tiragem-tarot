-- ============================================
-- SCRIPT DE TESTE - ATIVAR PREMIUM PARA TESTES
-- ============================================
-- Este script permite testar a funcionalidade premium
-- alterando o plano do seu usuário

-- ⚠️ IMPORTANTE: 
-- 1. Substitua 'seu-email@example.com' pelo seu email real
-- 2. Execute este script no SQL Editor do Supabase
-- 3. Para voltar para free, use a segunda parte abaixo

-- ============================================
-- 1. ATIVAR PREMIUM (com validade em 1 ano)
-- ============================================
UPDATE public.profiles
SET 
  subscription_tier = 'premium',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'seu-email@example.com';

-- ============================================
-- 2. VERIFICAR MUDANÇAS
-- ============================================
SELECT 
  id,
  email,
  subscription_tier,
  subscription_expires_at,
  readings_today,
  created_at
FROM public.profiles
WHERE email = 'seu-email@example.com';

-- ============================================
-- 3. VOLTAR PARA FREE (quando terminar testes)
-- ============================================
-- Descomente as linhas abaixo para voltar para free
/*
UPDATE public.profiles
SET 
  subscription_tier = 'free',
  subscription_expires_at = NULL
WHERE email = 'seu-email@example.com';
*/

-- ============================================
-- DETALHES IMPORTANTE PARA O HISTÓRICO
-- ============================================
-- 
-- O histórico de tiragens é controlado por estes limites:
-- 
-- FREE (Logado):
--   - 3 tiragens por dia
--   - Histórico: últimos 7 dias
--   - Máximo 3 itens no histórico
--   - Máximo 7 cartas para consulta no arquivo
--   - SEM síntese IA
--   - SEM análise de padrões
--   - SEM exportação PDF
--
-- PREMIUM:
--   - Tiragens ilimitadas
--   - Histórico: sem limite
--   - Máximo de itens: sem limite
--   - Máximo de cartas no arquivo: sem limite
--   - COM síntese IA
--   - COM análise de padrões
--   - COM exportação PDF
--
-- GUEST (Não logado):
--   - 1 tiragem por dia (localStorage)
--   - SEM acesso ao histórico
--   - Apenas visita como convidado
--
-- ⚠️ IMPORTANTE: Os usuários podem VER seu próprio histórico
-- mesmo com FREE, mas as funcionalidades extras estão bloqueadas
-- pelo PAYWALL. As tiragens gratuitas ficam visíveis, tiragens
-- premium ficam protegidas se não estiver subscrito.
