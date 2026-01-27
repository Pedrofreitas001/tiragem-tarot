# ⚡ Setup Rápido do Supabase (Tudo de Uma Vez)

## 🚀 Em 3 Passos

### 1️⃣ Abra o Supabase Dashboard
```
https://supabase.com/dashboard/projects
```

### 2️⃣ Vá para SQL Editor
- Clique no seu projeto `tiragem-tarot`
- Menu esquerdo: **SQL Editor**
- Clique em **"New Query"**

### 3️⃣ Copie e Cole TUDO
```
Arquivo: supabase/setup-completo.sql
Copie TODO o conteúdo
Cole no SQL Editor
Clique em "Run"
```

## ✅ Pronto!

**Resultado esperado:**
```
3 linhas de resultado:
- profiles | XX | 10
- readings | XX | 9
- subscriptions | XX | 12

(XX = seus dados antigos, se tiver)
```

## 🛡️ Segurança Garantida

```sql
CREATE TABLE IF NOT EXISTS ...    ✅ Seguro
CREATE INDEX IF NOT EXISTS ...     ✅ Seguro
DROP POLICY IF EXISTS ...          ✅ Seguro
CREATE POLICY ... (nova)           ✅ Seguro
```

**Seu arquivo usa IF NOT EXISTS em TUDO = Nenhum dado é deletado!**

## 🔍 Se Algo Der Errado

Verifique:
```sql
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.readings;
SELECT COUNT(*) FROM public.subscriptions;
```

Se a contagem > 0 → **Seus dados estão intactos!** ✅

---

## 💡 O que foi criado:

✅ Tabelas: `profiles`, `readings`, `subscriptions`
✅ Índices: 7 para performance
✅ RLS (Row Level Security): Segurança de dados
✅ Triggers: Automação (criar perfil, atualizar data, etc)
✅ Views: Estatísticas do usuário
✅ Permissions: Acesso correto para usuários

---

**Tudo seguro, rápido e em uma execução só!** 🎉
