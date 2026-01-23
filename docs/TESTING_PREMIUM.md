# Guia: Testar Premium e Gerenciar Acesso ao Histórico

## 🎯 Objetivo
Permitir testes do plano premium e entender como o histórico de tiragens funciona com e sem paywall.

---

## 📋 Pré-requisitos
1. ✅ Estar cadastrado na plataforma
2. ✅ Ter feito pelo menos uma tiragem (para ter histórico)
3. ✅ Acesso ao Supabase Dashboard

---

## 🚀 Passos para Ativar Premium

### Passo 1: Acessar Supabase Dashboard
```
https://supabase.com/dashboard/projects
```
- Clique no seu projeto: **tiragem-tarot**
- Vá para a aba **SQL Editor**

### Passo 2: Abrir o Script de Teste
```
- Clique em "New Query"
- Copie o conteúdo de: supabase/test-premium.sql
```

### Passo 3: Personalize o Script
Encontre esta linha e **substitua** pelo seu email real:

```sql
WHERE email = 'seu-email@example.com';
```

**Exemplo:**
```sql
WHERE email = 'pedro@gmail.com';
```

### Passo 4: Execute o Script
```
1. Selecione as primeiras linhas (ATIVAR PREMIUM)
2. Clique em "Run" (ou Ctrl+Enter)
3. Execute também a parte VERIFICAR MUDANÇAS para confirmar
```

✅ **Pronto!** Seu usuário está com PREMIUM agora.

---

## 🔄 Alternar Entre Free e Premium

### Para VOLTAR para FREE:
```
1. Copie a seção "3. VOLTAR PARA FREE" do script
2. Descomente as linhas (remova os /* */)
3. Execute o comando
```

### Rápido (copie e cole):
```sql
UPDATE public.profiles
SET 
  subscription_tier = 'free',
  subscription_expires_at = NULL
WHERE email = 'seu-email@example.com';
```

---

## 📊 Entender os Limites e Histórico

### Estrutura de Limites:

```
┌─────────────────────────────────────┐
│         GUEST (Não Logado)          │
├─────────────────────────────────────┤
│ • 1 tiragem por dia                 │
│ • SEM acesso ao histórico           │
│ • Dados salvos em localStorage      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    FREE (Logado - Gratuito)         │
├─────────────────────────────────────┤
│ • 3 tiragens por dia                │
│ • Histórico: últimos 7 dias         │
│ • Máximo 3 itens no histórico       │
│ • 7 cartas para arquivo             │
│ • SEM síntese IA                    │
│ • SEM análise de padrões            │
│ • SEM exportação PDF                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      PREMIUM (Assinante)            │
├─────────────────────────────────────┤
│ • Tiragens ilimitadas               │
│ • Histórico: sem limite             │
│ • Itens no histórico: sem limite    │
│ • Cartas no arquivo: sem limite     │
│ • COM síntese IA (Gemini)           │
│ • COM análise de padrões            │
│ • COM exportação PDF                │
└─────────────────────────────────────┘
```

### ⚠️ IMPORTANTE: Histórico e Paywall

**O usuário PODE ver seu próprio histórico mesmo sendo FREE!**

Mas o acesso é **limitado**:
- ✅ Pode VER tiragens dos últimos 7 dias
- ✅ Pode VER até 3 itens no histórico
- ❌ Não pode usar síntese IA
- ❌ Não pode exportar PDF
- ❌ Não pode ver histórico completo (sem limite)
- ❌ Não pode acessar análise de padrões

**Com PREMIUM:**
- ✅ Acesso total ao histórico (sem limite de dias)
- ✅ Pode VER todos os itens
- ✅ Pode usar síntese IA
- ✅ Pode exportar PDF
- ✅ Pode analisar padrões

---

## 🔐 Como Funciona o Controle de Acesso

### No código (AuthContext.tsx):
```typescript
// Limites do plano FREE
export const FREE_TIER_LIMITS = {
  readingsPerDay: 3,
  historyDays: 7,
  maxHistoryItems: 3,
  maxArchiveCards: 7,
  hasAISynthesis: false,
  hasPatternAnalysis: false,
  hasPDFExport: false,
  hasAds: true,
};

// Limites do plano PREMIUM
export const PREMIUM_TIER_LIMITS = {
  readingsPerDay: Infinity,
  historyDays: Infinity,
  maxHistoryItems: Infinity,
  maxArchiveCards: Infinity,
  hasAISynthesis: true,
  hasPatternAnalysis: true,
  hasPDFExport: true,
  hasAds: false,
};
```

### No Supabase (schema.sql):
```sql
-- Armazenar o tier do usuário
subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
subscription_expires_at TIMESTAMPTZ,
```

---

## 🧪 Checklist de Testes

Depois de ativar PREMIUM, teste:

- [ ] **Ver histórico completo** (sem limite de 7 dias)
- [ ] **Ver mais de 3 itens** no histórico
- [ ] **Síntese IA** disponível (botão)
- [ ] **Análise de padrões** disponível
- [ ] **Exportação PDF** funcionando
- [ ] **Sem anúncios** visíveis
- [ ] **Tiragens ilimitadas** (sem contador "3/3")
- [ ] **Voltar para FREE** e verificar bloqueios voltarem

---

## 🛠️ Queries Úteis

### Ver seu perfil completo:
```sql
SELECT * FROM public.profiles WHERE email = 'seu-email@example.com';
```

### Ver todas as suas tiragens:
```sql
SELECT id, spread_type, created_at FROM public.readings 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com')
ORDER BY created_at DESC;
```

### Ver contagem de tiragens dos últimos 7 dias:
```sql
SELECT COUNT(*) as "Tiragens (últimos 7 dias)"
FROM public.readings 
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'seu-email@example.com')
AND created_at > NOW() - INTERVAL '7 days';
```

### Resetar contador de tiragens de hoje:
```sql
UPDATE public.profiles
SET readings_today = 0
WHERE email = 'seu-email@example.com';
```

---

## 🐛 Troubleshooting

### "Não consigo ativar premium"
- ✅ Verifique se o email está EXATAMENTE igual ao cadastrado
- ✅ Copie o email direto do seu perfil no app
- ✅ Verifique se não tem espaços extras

### "Mudanças não aparecem no app"
- ✅ Recarregue a página (Ctrl+R ou Cmd+R)
- ✅ Limpe o cache (Ctrl+Shift+Del)
- ✅ Faça logout e login novamente

### "Histórico desapareceu"
- ✅ Isso é normal se voltou para FREE
- ✅ Histórico anterior a 7 dias fica oculto, mas está no BD
- ✅ Volte para PREMIUM para ver histórico completo

---

## 📝 Notas Importantes

1. **Testes não afetam dados reais**: Você pode alternar quantas vezes quiser
2. **Histórico persiste**: As tiragens não são deletadas, apenas o acesso é limitado
3. **Timestamp importante**: A data de expiração está configurada para 1 ano a frente
4. **Row Level Security**: O Supabase usa RLS, então cada usuário só vê seus dados

---

## 💡 Próximos Passos

Depois que terminar os testes:

```sql
-- Volte para FREE
UPDATE public.profiles
SET subscription_tier = 'free', subscription_expires_at = NULL
WHERE email = 'seu-email@example.com';
```

Ou mantenha como PREMIUM para testes contínuos! 🚀
