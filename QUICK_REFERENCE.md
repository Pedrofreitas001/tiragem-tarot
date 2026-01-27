# 📚 Referência Rápida - Paywall System

## Principais Arquivos

### 🆕 Novos
```
pages/Checkout.tsx                 ← Página de checkout completa
```

### ✏️ Modificados  
```
components/PaywallModal.tsx        ← Adicionado onCheckout prop
App.tsx                            ← Import Checkout, 4 PaywallModals
pages/Spreads.tsx                  ← PaywallModal com onCheckout
components/DailyCard.tsx           ← PaywallModal com onCheckout
components/journey/JourneySection.tsx ← useNavigate + onCheckout
```

---

## Como Usar PaywallModal

### Antes (Velho)
```tsx
<PaywallModal
  isOpen={showPaywall}
  onClose={() => setShowPaywall(false)}
  feature="readings"
  onLogin={() => {
    setShowPaywall(false);
    setShowAuthModal(true);
  }}
/>
```

### Depois (Novo) ✨
```tsx
<PaywallModal
  isOpen={showPaywall}
  onClose={() => setShowPaywall(false)}
  feature="readings"
  onLogin={() => {
    setShowPaywall(false);
    setShowAuthModal(true);
  }}
  onCheckout={() => navigate('/checkout')}  // ← NOVO
/>
```

---

## Fluxo Automático

### PaywallModal Detecta Automáticamente:

```typescript
// Em PaywallModal.tsx
const { user, tier, isGuest } = useAuth();

if (isGuest) {
  // Mostra: "Criar Conta" + "Já tenho conta"
  // Ambos chamam: onLogin()
} else if (tier === 'free') {
  // Mostra: "Fazer Upgrade"
  // Chama: onCheckout()
}
```

---

## Props do PaywallModal

```typescript
interface PaywallModalProps {
  isOpen: boolean;                    // Controlar se mostra
  onClose: () => void;                // Fechar modal
  feature?: 'readings' | 'synthesis' 
           | 'history' | 'export' 
           | 'patterns' | 'archive' 
           | 'ranking';               // Qual feature está protegida
  onLogin?: () => void;               // Guest clicou em criar/login
  onCheckout?: () => void;            // Free clicou em upgrade
}
```

---

## Etapas do Checkout

### Guest
1. **Criar Conta** (Email, Senha, Nome)
2. **Cobrança** (Email, Telefone, Nome)
3. **Envio** (Endereço, CEP, Cidade)
4. **Pagamento** (Plano, Confirmação)

### Free
1. **Cobrança** (Email, Telefone, Nome)
2. **Envio** (Endereço, CEP, Cidade)
3. **Pagamento** (Plano, Confirmação)

---

## Integrar em Novo Componente

```typescript
// 1. Importar
import { useNavigate } from 'react-router-dom';
import { PaywallModal } from './PaywallModal';

// 2. No componente
const MyComponent = () => {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);

  // 3. Usar
  return (
    <>
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="readings"  // Ou outra feature
        onLogin={() => {
          setShowPaywall(false);
          // Abrir auth modal se quiser
        }}
        onCheckout={() => navigate('/checkout')}
      />
    </>
  );
};
```

---

## Status por Componente

| Componente | PaywallModal | onCheckout | Status |
|-----------|--------------|-----------|--------|
| App Home | ✅ | ✅ | ✅ Ready |
| App History | ✅ | ✅ | ✅ Ready |
| App Explore | ✅ | ✅ | ✅ Ready |
| Spreads | ✅ | ✅ | ✅ Ready |
| DailyCard | ✅ | ✅ | ✅ Ready |
| JourneySection | ✅ | ✅ | ✅ Ready |

---

## Variáveis de Ambiente Necessárias

Para payment gateway (TODO):
```env
VITE_STRIPE_PUBLIC_KEY=pk_...
VITE_STRIPE_SECRET_KEY=sk_...

# Ou
VITE_MERCADO_PAGO_TOKEN=...
```

---

## Textos Suportados

### Português
- ✅ "Crie sua Conta Gratuita"
- ✅ "Fazer Upgrade"
- ✅ "R$ 19,90/mês"
- ✅ Todos os labels e mensagens

### Inglês
- ✅ "Create Your Free Account"
- ✅ "Upgrade Now"
- ✅ "$3.99/month"
- ✅ All labels and messages

---

## Validações Implementadas

✅ Senha mínimo 6 caracteres
✅ Confirm password match
✅ Email format (HTML5)
✅ Campos obrigatórios
✅ Telefone required
✅ CEP required

---

## Payment Gateway (TODO)

Implementar em `pages/Checkout.tsx`:

```typescript
const handleCompleteOrder = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // TODO: Integrar Stripe / Mercado Pago
    const { error } = await stripe.confirmPayment({
      // ... opções de pagamento
    });
    
    if (error) {
      setError(error.message);
    } else {
      // Sucesso! Redirecionar
      navigate('/');
    }
  } finally {
    setLoading(false);
  }
};
```

---

## Troubleshooting Rápido

### PaywallModal não aparece
```
- Verificar: isOpen={showPaywall}
- Verificar: setShowPaywall(true) é chamado
- Check: console.log() para debug
```

### Checkout não carrega
```
- Verificar: import Checkout do App.tsx
- Verificar: <Route path="/checkout" element={<Checkout />} />
- Check: Network tab para erros
```

### Guest/Free não detecta
```
- Verificar: useAuth() está importado
- Verificar: isGuest e tier vêm do context
- Check: AuthContext está funcionando
```

### Textos em inglês quando deveria PT
```
- Verificar: useLanguage() retorna isPortuguese
- Verificar: LanguageProvider wraps app
- Check: localStorage para 'language' setting
```

---

## Próximos Passos (Checklist)

- [ ] Integrar Stripe
- [ ] Implementar handleCompleteOrder()
- [ ] Criar webhook endpoint
- [ ] Testar fluxo guest→free→premium
- [ ] Testar fluxo free→premium
- [ ] Configurar emails
- [ ] Deploy staging
- [ ] QA testing
- [ ] Deploy production

---

## URLs Importantes

```
Homepage:     http://localhost:5173/#/
Checkout:     http://localhost:5173/#/checkout
Spreads:      http://localhost:5173/#/spreads
Daily Card:   http://localhost:5173/#/daily-card
Daily Card PT: http://localhost:5173/#/carta-do-dia
```

---

## Documentação Completa

- 📖 `docs/PAYWALL_SYSTEM.md` - Arquitetura completa
- 📋 `PAYWALL_CHANGES.md` - Mudanças resumidas
- 🧪 `TESTING_PAYWALL.md` - Testes detalhados
- 📚 `PAYWALL_SUMMARY.md` - Resumo executivo

---

## Quick Links

```typescript
// usePaywall hook
const { checkAccess, isPremium, isGuest, isFree } = usePaywall();

// useAuth hook
const { user, tier, isGuest, signUp, signIn } = useAuth();

// useLanguage hook
const { isPortuguese } = useLanguage();

// useNavigate
const navigate = useNavigate();
```

---

## Features Protegidas

```
'readings'    → Limite diário de leituras
'synthesis'   → Síntese com IA
'history'     → Histórico completo
'export'      → Exportar PDF
'patterns'    → Análise de padrões
'archive'     → Arquivo completo (78 cartas)
'ranking'     → Ranking premium
```

---

*Última atualização: 25 Jan 2025*
*Sistema versão: 2.0 ✨*

