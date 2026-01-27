-- ============================================
-- QUERIES ÚTEIS PARA TESTE E GERENCIAMENTO
-- ============================================

-- ============================================
-- 1. VERIFICAR STATUS ATUAL DO USUÁRIO
-- ============================================

-- Ver perfil completo com tier
SELECT 
  id,
  email,
  full_name,
  subscription_tier,
  subscription_expires_at,
  readings_today,
  last_reading_date,
  created_at
FROM public.profiles
WHERE email = 'seu-email@example.com';


-- ============================================
-- 2. ESTATÍSTICAS DE TIRAGENS
-- ============================================

-- Total de tiragens do usuário
SELECT 
  COUNT(*) as total_tiragens,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as ultimas_7_dias,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as ultimos_30_dias,
  MAX(created_at) as ultima_tiragem
FROM public.readings
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com');


-- ============================================
-- 3. VER HISTÓRICO COMPLETO (Últimos 10)
-- ============================================

SELECT 
  id,
  spread_type,
  question,
  synthesis,
  rating,
  created_at
FROM public.readings
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com')
ORDER BY created_at DESC
LIMIT 10;


-- ============================================
-- 4. VER HISTÓRICO LIMITADO (Como FREE - últimos 7 dias, máx 3)
-- ============================================

SELECT 
  id,
  spread_type,
  question,
  synthesis,
  rating,
  created_at
FROM public.readings
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com')
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 3;


-- ============================================
-- 5. ALTERNAR ENTRE PLANOS RAPIDAMENTE
-- ============================================

-- ATIVAR PREMIUM por 1 dia (teste rápido)
UPDATE public.profiles
SET 
  subscription_tier = 'premium',
  subscription_expires_at = NOW() + INTERVAL '1 day'
WHERE email = 'seu-email@example.com';


-- ATIVAR PREMIUM por 1 ano (teste longo)
UPDATE public.profiles
SET 
  subscription_tier = 'premium',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'seu-email@example.com';


-- VOLTAR PARA FREE
UPDATE public.profiles
SET 
  subscription_tier = 'free',
  subscription_expires_at = NULL
WHERE email = 'seu-email@example.com';


-- ============================================
-- 6. RESETAR CONTADOR DE TIRAGENS DO DIA
-- ============================================

UPDATE public.profiles
SET 
  readings_today = 0,
  last_reading_date = NULL
WHERE email = 'seu-email@example.com';


-- ============================================
-- 7. FORÇAR EXPIRAÇÃO DE PREMIUM
-- ============================================

-- Premium vai expirar em 5 minutos (para testar expiração)
UPDATE public.profiles
SET subscription_expires_at = NOW() + INTERVAL '5 minutes'
WHERE email = 'seu-email@example.com' AND subscription_tier = 'premium';


-- ============================================
-- 8. VER TODOS OS USUÁRIOS E SEUS TIERS
-- ============================================

SELECT 
  id,
  email,
  subscription_tier,
  subscription_expires_at,
  created_at
FROM public.profiles
ORDER BY created_at DESC;


-- ============================================
-- 9. VER USUÁRIOS COM SUBSCRIPTION EXPIRADA
-- ============================================

SELECT 
  id,
  email,
  subscription_tier,
  subscription_expires_at
FROM public.profiles
WHERE subscription_expires_at IS NOT NULL 
AND subscription_expires_at < NOW()
AND subscription_tier = 'premium';


-- ============================================
-- 10. CONTAR TIRAGENS POR DIA (Para análise)
-- ============================================

SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_tiragens,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM public.readings
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;


-- ============================================
-- 11. DELETAR HISTÓRICO DE UM USUÁRIO (CUIDADO!)
-- ============================================

-- ⚠️ ATENÇÃO: Isso apaga TODAS as tiragens!
-- DELETE FROM public.readings
-- WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com');


-- ============================================
-- 12. EXPORTAR HISTÓRICO EM CSV
-- ============================================

SELECT 
  created_at::DATE as data,
  spread_type as tipo_spread,
  question as pergunta,
  synthesis as sintese,
  rating as avaliacao
FROM public.readings
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com')
ORDER BY created_at DESC;


-- ============================================
-- RESUMO DOS COMANDOS MAIS ÚTEIS
-- ============================================

/*
👤 VER SEU PERFIL:
SELECT * FROM public.profiles WHERE email = 'seu-email@example.com';

📊 VER SEU HISTÓRICO:
SELECT * FROM public.readings WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com') ORDER BY created_at DESC;

✅ ATIVAR PREMIUM:
UPDATE public.profiles SET subscription_tier = 'premium', subscription_expires_at = NOW() + INTERVAL '1 year' WHERE email = 'seu-email@example.com';

❌ VOLTAR PARA FREE:
UPDATE public.profiles SET subscription_tier = 'free', subscription_expires_at = NULL WHERE email = 'seu-email@example.com';

🔄 RESETAR CONTADOR:
UPDATE public.profiles SET readings_today = 0, last_reading_date = NULL WHERE email = 'seu-email@example.com';
*/
