![1769365630854](image/TESTING_PAYWALL/1769365630854.png)![1769365634953](image/TESTING_PAYWALL/1769365634953.png)![1769365638506](image/TESTING_PAYWALL/1769365638506.png)![1769365642092](image/TESTING_PAYWALL/1769365642092.png)# 🧪 Guia de Testes - Sistema de Paywall

## Checklist de Testes

### 1. Guest Mode (Visitante não logado)

#### Teste 1.1: Acessar feature protegida como guest
```
1. Abrir app em modo guest (sem login)
2. Clicar em "Começar Leitura" ou tentar acessar feature protegida
3. ✅ Deve mostrar PaywallModal modo GUEST
4. ✅ Deve mostrar benefícios: "3 tiragens/dia", "Histórico de 3"
5. ✅ Deve mostrar botões: "Criar Conta Grátis" e "Já tenho conta"
```

#### Teste 1.2: Criar conta via PaywallModal
```
1. No PaywallModal (guest), clicar "Criar Conta Grátis"
2. ✅ Deve abrir AuthModal modo REGISTER
3. Preencher: Email, Senha (6+ chars), Nome, Confirmar Senha
4. Clicar "Criar Conta"
5. ✅ Deve fechar modais e voltar para home
6. ✅ User agora deve ser LOGADO (check se avatar/menu mudou)
```

#### Teste 1.3: Login via PaywallModal
```
1. No PaywallModal (guest), clicar "Já tenho conta"
2. ✅ Deve abrir AuthModal modo LOGIN
3. Preencher email/senha de conta existente
4. ✅ Deve fazer login e voltar para home
```

---

### 2. Free Mode (Logado sem Premium)

#### Teste 2.1: Feature Premium como Free
```
1. Login com conta FREE
2. Tentar acessar feature premium (ex: Síntese IA, PDF Export)
3. ✅ Deve mostrar PaywallModal modo FREE
4. ✅ Deve mostrar benefícios premium (todos os ✨)
5. ✅ Deve mostrar preço: "R$ 19,90/mês"
```

#### Teste 2.2: Fazer Upgrade
```
1. No PaywallModal (free), clicar "Fazer Upgrade"
2. ✅ Deve abrir página CHECKOUT
3. ✅ Deve pular etapa "Account" (já logado)
4. Deve ir direto para "Billing Information"
5. ✅ Deve ter indicador de progress (Cobrança → Pagamento)
```

---

### 3. Fluxo Checkout Guest

#### Teste 3.1: Criar conta no checkout
```
1. Guest acessa checkout (via PaywallModal)
2. ✅ First step: "Criar Conta"
3. Preencher formulário:
   - Nome Completo ✅
   - Email ✅
   - Senha (6+ chars) ✅
   - Confirmar Senha ✅
4. Clicar "Próximo"
5. ✅ Conta deve ser criada
6. ✅ Avançar para "Cobrança"
```

#### Teste 3.2: Informações de Cobrança
```
1. Tela de Cobrança
2. Preencher:
   - Nome Completo ✅
   - Email ✅
   - Telefone ✅
3. Clicar "Próximo"
4. ✅ Avançar para "Pagamento"
```

#### Teste 3.3: Seleção de Plano
```
1. Tela de Pagamento
2. ✅ Deve mostrar dois planos:
   - Premium Mensal: R$ 19,90/mês
   - Premium Anual: R$ 179,90/ano (40% off)
3. ✅ Resumo deve mostrar total correto
4. ✅ Deve ter botão "Finalizar Compra"
```

#### Teste 3.4: Completar Compra
```
1. Clicar "Finalizar Compra"
2. ✅ Deve processar (alert = simulação)
3. ✅ Após sucesso, deve redirecionar para home
4. ✅ User deve estar com tier=PREMIUM
```

---

### 4. Fluxo Checkout Free

#### Teste 4.1: Upgrade Free → Premium
```
1. Login com FREE
2. Acessar Checkout
3. ✅ Deve pular "Criar Conta"
4. ✅ First step: "Cobrança"
5. Preencher dados e prosseguir
6. ✅ Ir para "Pagamento"
7. ✅ Selecionar plano e finalizar
```

---

### 5. Validações de Formulário

#### Teste 5.1: Validação de Password
```
1. No checkout, tentar criar conta com senha < 6 chars
2. ✅ Deve mostrar erro: "Senha deve ter pelo menos 6 caracteres"
```

#### Teste 5.2: Validação de Password Match
```
1. Preencher senha diferente de confirmar
2. ✅ Deve mostrar erro: "As senhas não conferem"
```

#### Teste 5.3: Campos Obrigatórios
```
1. Tentar avancar sem preencher campos
2. ✅ Deve mostrar erro: "Campo obrigatório"
```

---

### 6. Responsividade

#### Teste 6.1: Mobile
```
1. Abrir em device mobile (ou DevTools)
2. ✅ PaywallModal deve ocupar 90% da tela
3. ✅ Buttons não devem ser cortados
4. ✅ Scrollable se necessário
5. ✅ Checkout steps devem empilhar corretamente
```

#### Teste 6.2: Desktop
```
1. Abrir em tela grande (1920px)
2. ✅ Layout deve parecer bom
3. ✅ Sem overflow horizontal
4. ✅ Spacing adequado
```

---

### 7. Textos e Traduções

#### Teste 7.1: Português
```
1. App em Português
2. ✅ PaywallModal em PT: "Crie sua Conta Gratuita"
3. ✅ Checkout labels em PT
4. ✅ Mensagens de erro em PT
```

#### Teste 7.2: Inglês
```
1. App em Inglês
2. ✅ PaywallModal em EN: "Create Your Free Account"
3. ✅ Todos os textos em EN
```

---

### 8. Estados de Carregamento

#### Teste 8.1: Loading durante signup
```
1. Clicar "Criar Conta"
2. ✅ Button deve mudar para "Criando..."
3. ✅ Button deve estar disabled
4. ✅ Após sucesso, voltar ao normal
```

#### Teste 8.2: Loading durante compra
```
1. Clicar "Finalizar Compra"
2. ✅ Button deve mostrar "Processando..."
3. ✅ Button deve estar disabled
```

---

### 9. Modais e Navegação

#### Teste 9.1: Fechar PaywallModal
```
1. Abrir PaywallModal
2. Clicar no X (fechar)
3. ✅ Deve fechar
4. ✅ Backgrund clickável também fecha
```

#### Teste 9.2: Fechar AuthModal
```
1. No PaywallModal, abrir AuthModal
2. Clicar X ou voltar
3. ✅ Deve voltar ao PaywallModal
```

#### Teste 9.3: Botão Voltar no Checkout
```
1. No checkout, clicar "Voltar"
2. ✅ Deve voltar ao step anterior
3. ✅ Dados devem ser preservados
```

---

### 10. Features Integradas

#### Teste 10.1: PaywallModal no Home
```
App.tsx Home page
1. Guest tenta fazer leitura
2. ✅ Paywall feature="readings" mostra
```

#### Teste 10.2: PaywallModal no History
```
App.tsx History page
1. Guest tenta ver histórico
2. ✅ Paywall feature="history" mostra
```

#### Teste 10.3: PaywallModal no Explore
```
App.tsx Explore page
1. Free tenta ver todas as cartas
2. ✅ Paywall feature="archive" mostra
```

#### Teste 10.4: PaywallModal no Journey
```
components/journey/JourneySection.tsx
1. Free tenta acessar ranking
2. ✅ Paywall feature="ranking" mostra
```

#### Teste 10.5: PaywallModal no Daily Card
```
components/DailyCard.tsx
1. Guest tenta fazer leitura do dia
2. ✅ Paywall feature="readings" mostra
```

---

## Executar Testes

### Automático (Recomendado)
```bash
npm test
npm run test:e2e
```

### Manual (Verificação Final)
```bash
npm run dev
# Abrir em browser
# Seguir checklist acima
```

---

## Troubleshooting

### PaywallModal não abre
- [ ] Verificar se `isOpen={showPaywall}` está correto
- [ ] Verificar se `setShowPaywall(true)` está sendo chamado
- [ ] Check console para erros

### Checkout não funciona
- [ ] Verificar se `onCheckout={() => navigate('/checkout')}` está em PaywallModal
- [ ] Verificar se route `/checkout` existe no App.tsx
- [ ] Check if `import Checkout from './pages/Checkout'` existe

### Tradução errada
- [ ] Verificar `isPortuguese` context
- [ ] Verificar se `t_checkout` objeto tem a chave
- [ ] Verificar se `useLanguage()` está importado

### Validação não funciona
- [ ] Verificar regex/lógica no `handleCreateAccount()`
- [ ] Verificar se `setError()` está sendo chamado
- [ ] Verificar se erro é exibido no JSX

---

## URLs para Testar

```
Guest:
- http://localhost:5173/#/
- Clicar em qualquer feature protegida

Free:
- Login primeiro
- http://localhost:5173/#/checkout (direto)
- Ou via PaywallModal

Spreads:
- http://localhost:5173/#/spreads

Daily Card:
- http://localhost:5173/#/daily-card (EN)
- http://localhost:5173/#/carta-do-dia (PT)
```

---

## Sucesso! 🎉

Se todos os testes passarem, o sistema está pronto para:
- [ ] QA Testing
- [ ] User Acceptance Testing
- [ ] Production Deploy

---

*Last Updated: 2025-01-25*
