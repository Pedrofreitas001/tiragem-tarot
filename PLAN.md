# Plano de Implementação - Zaya Tarot

## Visão Geral
7 tarefas de melhoria para o Zaya Tarot, organizadas por prioridade e dependência.

---

## Tarefa 1: Melhorar Navbar para Telas Menores

**Problema:** O menu mobile atual é um dropdown simples que ocupa muito espaço vertical e não tem boa UX em telas pequenas (< 375px).

**Solução:**
- Transformar o menu mobile em um **drawer/slide-in** lateral (vindo da direita) com overlay escuro
- Adicionar ícones ao lado de cada item do menu mobile para melhor escaneabilidade
- Reduzir padding do header em telas < 360px
- Fechar menu ao clicar fora (overlay) ou ao navegar
- Adicionar animação de slide-in suave
- Garantir que o logo "Zaya Tarot" não quebre em telas muito pequenas

**Arquivos:** `App.tsx` (Header component, linhas 151-238)

---

## Tarefa 2: Seção de Signos na Home

**Problema:** O usuário só acessa signos pela página dedicada. Precisa de um atalho na home.

**Solução:**
- Adicionar nova seção após a seção de WhatsApp/Carta do Dia na Home
- Grid de 12 mini-cards compactos (4 colunas desktop, 3 mobile)
- Cada card: ícone do signo (symbol unicode ♈♉♊...) + nome + elemento (cor de borda)
- SEM imagem (apenas ícone/símbolo e texto)
- Click navega para `/tarot-por-signo/:signo`
- Header da seção: "Tarot por Signo" com subtítulo
- Usar dados de `data/zodiacData.ts` para nomes e símbolos

**Arquivos:** `App.tsx` (Home component), `data/zodiacData.ts`

---

## Tarefa 3: Corrigir Checkout Stripe

**Problema Identificado:** A função `handlePayment` em `Checkout.tsx` (linha 107-156) **NÃO redireciona para o Stripe**. Ela simula o pagamento com `setTimeout(1500ms)` e depois marca o usuário como premium diretamente no Supabase. Isso é um mock, não integração real.

**O que falta para funcionar:**
O backend (`api/create-checkout-session.js`) está corretamente implementado, mas precisa das seguintes **variáveis de ambiente** configuradas no Vercel:

1. **`STRIPE_SECRET_KEY`** - Chave secreta do Stripe (começa com `sk_test_` ou `sk_live_`)
2. **`STRIPE_PREMIUM_PRICE_ID`** - ID do preço do plano premium (começa com `price_`)
3. **`STRIPE_WEBHOOK_SECRET`** - Secret do webhook (começa com `whsec_`) para validar eventos

**Já configurado:** `VITE_STRIPE_PUBLISHABLE_KEY` (pk_test_...) e `productId` (prod_TuEXZVRLRlGKSn)

**Solução (código):**
- Substituir o mock `handlePayment` por chamada real ao `redirectToCheckout` do `stripeService.ts`
- Remover os botões de PIX e Débito da fase de pagamento
- Remover o badge "PIX" da seção de formas de pagamento na fase de planos
- Manter apenas Visa, Mastercard e Stripe como métodos visuais
- O fluxo correto: formulário → criar conta → `redirectToCheckout()` → Stripe Checkout → webhook atualiza para premium

**Credenciais necessárias do usuário:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PREMIUM_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

---

## Tarefa 4: Loading nos Gráficos do Histórico + Melhorias

**Problema:** Os gráficos aparecem instantaneamente sem transição, e o gráfico de jogadas por dia é limitado.

**Solução:**
1. **Loading/Skeleton:** Adicionar estado de loading com skeleton animado (shimmer) nos gráficos. Mostrar dados só após animação de "estabilização" (fade-in progressivo)
2. **Scroll por meses:** Adicionar navegação por mês no gráfico de jogadas por dia (setas esquerda/direita ou select)
3. **Barras mais próximas:** Reduzir gap entre barras do gráfico de jogadas por dia
4. **Agregação mensal:** Quando houver dados de mais de 1 mês, mostrar toggle "Diário / Mensal" que agrupa jogadas por mês

**Arquivos:** `components/HistoryFiltered.tsx`

---

## Tarefa 5: Sitemap e SEO para Arquivo Arcano

**Problema:** As páginas de cartas dedicadas precisam ser indexadas pelo Google.

**Nota importante:** O app usa `HashRouter` (`/#/`), o que dificulta indexação. Porém, como migrar para BrowserRouter é uma mudança grande, vamos focar no que é possível agora.

**Solução:**
- Criar `public/sitemap.xml` estático com todas as 78 URLs de cartas + páginas principais
- Adicionar meta tags dinâmicas (title, description, og:tags) nas páginas de cartas individuais usando `document.title` e meta tags via `useEffect`
- Criar `public/robots.txt` permitindo crawlers
- Adicionar structured data (JSON-LD) para cada carta com schema.org
- Nota: Para SEO completo no futuro, será necessário migrar de HashRouter para BrowserRouter + SSR/prerender

**Arquivos:** `public/sitemap.xml` (novo), `public/robots.txt` (novo), `App.tsx` (ArquivoArcano component), `pages/arquivo-arcano.tsx`

---

## Tarefa 6: Documento de Prompts da IA

**Problema:** Precisa documentar todos os prompts atuais para otimização futura.

**Solução:** Gerar documento `docs/prompts-ia-atual.md` com:
- Prompt da Carta do Dia (`api/daily-card.js`)
- Prompt dos Jogos de Tarot (`api/tarot.js` + `services/geminiService.ts`)
- Prompt do Tarot por Signo (`api/tarot-signo.js`)
- Para cada prompt: texto completo, parâmetros, modelo usado, temperatura, estrutura de resposta esperada
- Seção de observações sobre pontos de melhoria identificados

**Arquivos:** `docs/prompts-ia-atual.md` (novo)

---

## Tarefa 7: Botão de Regenerar Leitura pós-Cadastro (Guest → User)

**Problema:** Quando um guest faz uma tirada, recebe CTA para criar conta, e ao criar a conta a tirada é perdida.

**Análise do código:** Já existe `getGuestReading()` e `transferGuestReadingToUser()` em `readingsService.ts`. O problema é que a transferência pode não estar funcionando, ou a leitura guest não inclui a síntese IA.

**Solução:**
- Após o cadastro, verificar se existe uma guest reading salva (`getGuestReading()`)
- Se existir, mostrar um banner/botão na home ou na página de resultado: "Você tinha uma leitura pendente. Gerar interpretação agora?"
- Ao clicar, recuperar as cartas da leitura guest, chamar a API de síntese, e salvar no histórico do novo usuário
- Limpar guest reading após transferência com `clearGuestReading()`

**Arquivos:** `App.tsx` (Home/Result components), `services/readingsService.ts`, `components/AuthModal.tsx`

---

## Ordem de Execução

1. **Tarefa 1** - Navbar (impacto visual imediato, independente)
2. **Tarefa 2** - Seção Signos na Home (independente)
3. **Tarefa 3** - Checkout Stripe (precisa de credenciais do usuário - implementar código e pedir credenciais)
4. **Tarefa 4** - Loading nos Gráficos (independente)
5. **Tarefa 5** - Sitemap/SEO (independente)
6. **Tarefa 6** - Documento de Prompts (apenas documentação, sem código)
7. **Tarefa 7** - Regenerar Leitura Guest (depende de entender o fluxo atual de guest)
