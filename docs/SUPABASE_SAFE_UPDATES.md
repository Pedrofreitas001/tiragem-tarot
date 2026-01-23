# Guia: Atualizar Supabase SEM Perder Dados 🔒

## 📋 Entender o Que Você Já Tem

Verifique qual é o estado atual do seu Supabase:

```sql
-- Execute no SQL Editor do Supabase para VER o que já existe

-- 1. Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Ver estrutura de cada tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Ver índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;

-- 4. Ver políticas RLS
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🛡️ Opção 1: SEGURA (Recomendada)
### Para quando você quer **manter 100% dos dados**

```sql
-- ✅ Método: Verificar coluna antes de adicionar

-- Se precisa adicionar coluna em profiles:
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Se precisa criar índice:
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON public.profiles(subscription_tier);

-- Resultado: ✅ Nada quebra, nada perde
```

---

## 🔄 Opção 2: MIGRAÇÃO COM BACKUP
### Para quando quer **atualizar com segurança**

```sql
-- PASSO 1: Fazer backup dos dados
CREATE TABLE public.profiles_backup AS 
SELECT * FROM public.profiles;

CREATE TABLE public.readings_backup AS 
SELECT * FROM public.readings;

-- PASSO 2: Agora é seguro fazer alterações
-- (você tem backup se algo der errado)

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nova_coluna TEXT;

-- PASSO 3: Se deu errado, restaurar
-- RESTORE FROM: public.profiles_backup
-- (Depois delete a tabela original)
```

---

## ⚙️ Opção 3: SCHEMA SEM RISCO (Para Dados Pequenos)
### Se não tem dados importantes ainda

```sql
-- ✅ Seguro deletar e recriar se:
-- - Está em desenvolvimento/testes
-- - Não tem dados reais de usuários
-- - Quer começar do zero

-- 1. Fazer backup PRIMEIRO
CREATE TABLE public.backup_everything AS
SELECT 'profiles' as table_name, to_jsonb(profiles.*) as data 
FROM public.profiles
UNION ALL
SELECT 'readings', to_jsonb(readings.*)
FROM public.readings
UNION ALL
SELECT 'subscriptions', to_jsonb(subscriptions.*)
FROM public.subscriptions;

-- 2. Agora sim, recriar com o schema novo
-- (delete e execute o schema.sql limpo)
```

---

## 📊 Sua Situação Atual (Segura!)

Seu `schema.sql` usa:
```sql
CREATE TABLE IF NOT EXISTS public.profiles (...)
CREATE TABLE IF NOT EXISTS public.readings (...)
CREATE TABLE IF NOT EXISTS public.subscriptions (...)
```

✅ **Isso é SEGURO!** O `IF NOT EXISTS` garante que:
- Se a tabela existe → não faz nada
- Se não existe → cria
- **Nenhum dado é deletado**

---

## 🚀 Recomendação: Passo a Passo Seguro

### Passo 1: Verificar Estado Atual
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Se tem: profiles, readings, subscriptions → Vá para Passo 2**
**Se não tem nada → Execute todo o schema.sql**

### Passo 2: Executar Alterações Seguras
```sql
-- Executar linha por linha, começando com:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Depois adicionar colunas novas (se precisar):
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nova_coluna_tipo TIPODADO DEFAULT valor;

-- Depois criar índices novos:
CREATE INDEX IF NOT EXISTS idx_novo ON public.profiles(coluna);

-- Depois criar/atualizar políticas RLS:
DROP POLICY IF EXISTS "nome_policy" ON public.profiles;
CREATE POLICY "nome_policy" ...
```

### Passo 3: Testar
```sql
-- Ver que os dados ainda existem
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.readings;
SELECT COUNT(*) FROM public.subscriptions;
```

---

## ⚠️ Erros Comuns (Como Evitar)

❌ **NÃO FAÇA:**
```sql
DROP TABLE public.profiles;  -- ISSO DELETA TUDO!
DROP SCHEMA public;          -- ISSO DELETA TUDO!
DELETE FROM public.profiles; -- Isso apaga dados!
```

✅ **FAÇA ISSO:**
```sql
CREATE TABLE IF NOT EXISTS ... -- Seguro
ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... -- Seguro
CREATE INDEX IF NOT EXISTS ... -- Seguro
CREATE POLICY IF NOT EXISTS ... -- Seguro (quase)
```

---

## 🎯 Seu Comando SEGURO

Se quer executar o schema.sql inteiro SEM RISCO:

1. **Copie TODO o conteúdo** de `supabase/schema.sql`
2. **No Supabase Dashboard:**
   - SQL Editor → New Query
   - Cole o código
   - Clique em "Run"

✅ **Resultado:**
- Se tabelas já existem → Nada acontece (IF NOT EXISTS)
- Se tabelas não existem → Cria tudo
- Dados existentes → Permanecem intactos

---

## 📝 Checklist Final

Antes de fazer qualquer alteração:

- [ ] Você fez backup dos dados? (pode ser screenshot do supabase)
- [ ] Sabe qual é o estado atual (rodar query acima)?
- [ ] Está usando `IF NOT EXISTS` ou `ADD COLUMN IF NOT EXISTS`?
- [ ] Testou em um novo projeto antes?
- [ ] Tem acesso ao Supabase para reverter?

Se respondeu SIM para tudo → **Seguro executar!** 🚀

---

## 🆘 Se Algo Der Errado

1. **Não entre em pânico!** Os dados não desaparecem magicamente
2. **Verifique:**
   ```sql
   SELECT COUNT(*) FROM public.profiles;
   SELECT COUNT(*) FROM public.readings;
   ```
3. **Se dados sumiram:**
   - Supabase tem backups automáticos
   - Você pode restaurar no dashboard
   - Menu: Project Settings → Backups → Restore

---

## 💡 Resumo Ultra-Rápido

**Para NUNCA bagunçar seu Supabase:**

1. Sempre use `IF NOT EXISTS` / `IF NOT` no SQL
2. Sempre faça backup antes (pode ser screenshot)
3. Sempre teste em um projeto de teste primeiro
4. Sempre execute linha por linha (não tudo de uma vez)
5. Sempre verifique `SELECT COUNT(*)` depois

**Fazendo isso → 99.9% seguro!** ✅
