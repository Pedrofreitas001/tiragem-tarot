# Fluxo de Paywall Ajustado

## Resumo das Mudanças

Foram implementadas melhorias completas no sistema de paywall para garantir um fluxo adequado de autenticação e checkout.

### 1. **Nova Página de Checkout** (`pages/Checkout.tsx`)

Página completa com fluxo em múltiplas etapas:

#### Para Usuários Guest (Não Logados):
1. **Etapa 1: Criar Conta** - Formulário de registro
   - Email
   - Senha (min 6 caracteres)
   - Nome Completo
   - Confirmar Senha

2. **Etapa 2: Informações de Cobrança** - Após conta criada
   - Nome Completo
   - Email
   - Telefone

3. **Etapa 3: Endereço de Envio** (se produto físico)
   - CEP
   - Endereço
   - Número
   - Complemento
   - Cidade
   - Estado

4. **Etapa 4: Pagamento**
   - Seleção de plano (Mensal/Anual)
   - Resumo do pedido
   - Processamento (integração com Stripe, Square, etc)

#### Para Usuários Free (Logados sem Premium):
1. **Etapa 1: Informações de Cobrança** - Pula criar conta
2. **Etapa 2: Endereço de Envio** (se aplicável)
3. **Etapa 3: Pagamento**

### 2. **PaywallModal Ajustado** (`components/PaywallModal.tsx`)

Fluxo claramente definido:

#### Quando é Guest:
- Mostra botões "Criar Conta Grátis" e "Já tenho conta"
- Ambos chamam `onLogin()` para abrir AuthModal

#### Quando é Free (Logado):
- Mostra botão "Fazer Upgrade"
- Chama `onCheckout()` para abrir página de checkout

#### Props Atualizadas:
```typescript
interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'readings' | 'synthesis' | 'history' | 'export' | 'patterns' | 'archive' | 'ranking';
  onLogin?: () => void;
  onCheckout?: () => void;  // ✅ NOVO
}
```

### 3. **Integrações em Componentes**

Todos os PaywallModals foram atualizados para incluir `onCheckout`:

- **App.tsx** (Home, History, Explore, etc) - ✅ Atualizado
- **pages/Spreads.tsx** - ✅ Atualizado
- **components/DailyCard.tsx** - ✅ Atualizado
- **components/journey/JourneySection.tsx** - ✅ Atualizado

### 4. **Fluxo de Usuário Completo**

```
GUEST (Visitante)
  ↓
Clica em feature protegida
  ↓
PaywallModal aparece (guest mode)
  ↓
"Criar Conta" ou "Já tenho conta"
  ↓
AuthModal abre → Criar/Login
  ↓
Volta para HOME (agora Free)
  ↓
Pode fazer 3 leituras/dia
  
---

FREE (Logado)
  ↓
Clica em feature Premium
  ↓
PaywallModal aparece (free mode)
  ↓
"Fazer Upgrade"
  ↓
Checkout abre
  ↓
Preenche dados de cobrança
  ↓
Seleciona plano
  ↓
Processa pagamento
  ↓
Premium ativado! ✨
```

### 5. **Textos de Paywall**

#### Para Guest:
- "Crie sua Conta Gratuita" / "Create Your Free Account"
- Descrição: "Você usou sua tiragem gratuita de demonstração. Crie uma conta grátis para ter 3 tiragens por dia!"
- Benefícios mostrados: 3 tiragens/dia, histórico das últimas 3, 7 cartas do arquivo

#### Para Free:
- Depende da feature (Tiragens, Síntese IA, etc)
- Preço: R$ 19,90/mês ou R$ 179,90/ano
- Benefícios Premium listados

### 6. **Melhorias Técnicas**

✅ Separação clara entre guest e free tier
✅ Fluxo de checkout multi-etapa
✅ Suporte para criar conta durante checkout
✅ Validação de formulários
✅ Estados de carregamento
✅ Mensagens de erro/sucesso
✅ Responsivo mobile/desktop

### 7. **Próximos Passos**

Para completar a implementação:

1. **Integração de Payment Gateway**
   - Stripe, Mercado Pago, Square
   - Implementar em `pages/Checkout.tsx` no `handleCompleteOrder()`

2. **Webhooks de Pagamento**
   - Atualizar `subscription_tier` para "premium" no Supabase
   - Atualizar `subscription_expires_at`

3. **Confirmação de Assinatura**
   - Email de confirmação
   - Acesso imediato a features premium

4. **Testes de Segurança**
   - Validar tokens de pagamento
   - Implementar CSRF protection
   - Validação de dados sensíveis

### 8. **Traduções Suportadas**

✅ Português (pt-BR)
✅ Inglês (en-US)

Todos os textos estão no componente `Checkout.tsx` com suporte bilíngue.

---

## Estrutura de Arquivos

```
pages/
  └─ Checkout.tsx (NOVO)
  
components/
  └─ PaywallModal.tsx (ATUALIZADO)
  └─ AuthModal.tsx
  └─ journey/
      └─ JourneySection.tsx (ATUALIZADO)
  └─ DailyCard.tsx (ATUALIZADO)
  
App.tsx (ATUALIZADO)
pages/Spreads.tsx (ATUALIZADO)
```

## Notas

- O PaywallModal agora é mais inteligente e detecta automaticamente se é guest ou free
- O fluxo de AuthModal permanece o mesmo - apenas abre quando o usuário clica em "Criar Conta" ou "Já tenho conta"
- O Checkout é completamente separado e aguarda integração com payment gateway
- Todos os componentes suportam as novas props

