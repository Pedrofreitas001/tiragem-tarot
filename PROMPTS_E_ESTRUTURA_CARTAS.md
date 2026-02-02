# Resumo: Prompts de IA e Estrutura de Cartas do Tarot

## 1. COMO OS PROMPTS DA IA ESTÃO ESTRUTURADOS ATUALMENTE

### Localização
- **Arquivo Principal**: [`api/tarot.js`](api/tarot.js)
- **Serviço Frontend**: [`services/geminiService.ts`](services/geminiService.ts)

### Fluxo Atual

```
1. Usuário faz leitura (seleciona cartas)
   ↓
2. Frontend coleta: cards, spread_type, question, reversed_indices
   ↓
3. Chama: geminiService.getStructuredSynthesis(session)
   ↓
4. Envia para /api/tarot (Backend Proxy)
   ↓
5. Backend monta o prompt baseado no SPREAD_PROMPTS
   ↓
6. Envia para Gemini 2.0 Flash Lite com schema JSON validado
   ↓
7. Retorna síntese estruturada (JSON)
```

### Estrutura dos Prompts por Tipo de Jogo

#### **A. Sistema Base**
```javascript
const BASE_SYSTEM_PROMPT = `Você é tarólogo experiente. Regras:
- Tom: simbólico, calmo, direto
- Sem explicar o que é tarot
- Sem significados óbvios
- Sem emojis ou listas
- Sem mencionar IA/sistema
- Linguagem elegante e simples
- Respostas práticas e personalizadas
- Máximo 3 parágrafos`;
```

#### **B. Prompts Específicos por Spread**

##### **Três Cartas (Past-Present-Future)**
```javascript
context: `
Leitura: Três Cartas (Passado-Presente-Futuro)
Cartas: [Card 1] | [Card 2] | [Card 3]
${question ? `Pergunta: "${question}"` : 'Orientação geral'}

Interprete integrando as três posições temporais. Seja direto e prático.`

Schema esperado:
{
  "sintese": "string (máx 100 palavras)",
  "tema_central": "string (5-10 palavras)",
  "conselho": "string (máx 40 palavras)",
  "reflexao": "string (máx 20 palavras)"
}
```

##### **Cruz Celta (10 posições)**
```javascript
context: `
Leitura: Cruz Celta (10 posições)
Cartas: [Position 1]: Card | [Position 2]: Card | ...
${question ? `Pergunta: "${question}"` : 'Orientação profunda'}

Sintetize as 10 cartas em narrativa coesa. Foque no resultado e conselho prático.`

Schema esperado:
{
  "sintese": "string (máx 120 palavras)",
  "tema_central": "string (5-10 palavras)",
  "desafio_principal": "string (máx 25 palavras)",
  "conselho": "string (máx 50 palavras)",
  "reflexao": "string (máx 20 palavras)"
}
```

##### **Amor e Relacionamento (5 cartas)**
```javascript
context: `
Leitura: Amor e Relacionamento (5 cartas)
Cartas: [Card info]
${question ? `Pergunta: "${question}"` : 'Dinâmica do relacionamento'}

Analise a dinâmica entre as partes. Seja sensível mas direto.`

Schema esperado:
{
  "sintese": "string (máx 100 palavras)",
  "tema_central": "string (5-10 palavras)",
  "ponto_atencao": "string (máx 30 palavras)",
  "conselho": "string (máx 40 palavras)",
  "reflexao": "string (máx 20 palavras)"
}
```

##### **Sim ou Não (1 carta)**
```javascript
context: `
Leitura: Sim ou Não (1 carta)
Carta: [Card]
Pergunta: "${question || 'A resposta que busco'}"

Responda de forma direta. Indique tendência (sim/não/talvez) baseado na carta.`

Schema esperado:
{
  "resposta": "sim | nao | talvez",
  "explicacao": "string (máx 60 palavras)",
  "condicao": "string (máx 30 palavras)",
  "reflexao": "string (máx 15 palavras)"
}
```

##### **Carta do Dia (1 carta)**
```javascript
context: `
Leitura: Carta do Dia
Carta: [Card]

Interprete para o dia de hoje. Seja inspirador mas prático.`

Schema esperado:
{
  "mensagem": "string (máx 80 palavras)",
  "energia": "string (3-5 palavras)",
  "foco": "string (máx 25 palavras)",
  "reflexao": "string (máx 15 palavras)"
}
```

### Configurações Gemini
```javascript
generationConfig: {
  temperature: 0.7,           // Criatividade controlada
  maxOutputTokens: 600,       // Limite de resposta
  responseMimeType: 'application/json',
  responseSchema: spreadConfig.schema  // Validação estruturada
}
```

### Cache Implementado
- **Duração**: 24 horas
- **Chave**: MD5 hash das cartas + spread_type + question
- **Benefício**: Evita regeneração para mesmas leituras

---

## 2. ESTRUTURA ATUAL DAS CARTAS

### Localização
- **Banco de Dados**: [`tarotData.ts`](tarotData.ts) (78 cartas hardcoded)
- **Tipos**: [`types.ts`](types.ts)
- **Exibição**: [`App.tsx`](App.tsx) - componente `CardDetails` (linhas 2170-2340)

### Interface TarotCardData Atual

```typescript
export interface TarotCardData {
  id: string;                    // maj_0, min_cups_01, etc
  name: string;                  // "The Fool"
  name_pt: string;               // "O Louco"
  slug: string;                  // "the-fool-card"
  slug_pt: string;               // "carta-o-louco"
  number: number;                // 0, 1, 2, ...
  arcana: 'major' | 'minor';     // Arcano Maior ou Menor
  suit?: string;                 // "Wands", "Cups", "Swords", "Pentacles"
  element?: string;              // "Air", "Fire", "Water", "Earth"
  keywords: string[];            // ["Freedom", "Faith", ...]
  keywords_pt: string[];         // ["Liberdade", "Fé", ...]
  meaning_up: string;            // Significado direto (EN)
  meaning_up_pt: string;         // Significado direto (PT)
  meaning_rev: string;           // Significado invertido (EN)
  meaning_rev_pt: string;        // Significado invertido (PT)
  description: string;           // Descrição visual (EN)
  description_pt: string;        // Descrição visual (PT)
  love: string;                  // Contexto amoroso (EN)
  love_pt: string;               // Contexto amoroso (PT)
  career: string;                // Contexto profissional (EN)
  career_pt: string;             // Contexto profissional (PT)
  advice: string;                // Conselho (EN)
  advice_pt: string;             // Conselho (PT)
  imageUrl: string;              // URL da imagem
}
```

### Dados Atualmente Armazenados por Carta
```
✅ Meta-dados (id, name, slug, arcana, suit, element, number)
✅ Significados (direto, invertido, keywords)
✅ Contextos especializados (love, career, general)
✅ Descrição visual
✅ Bilíngue (EN + PT)

❌ NÃO tem: Dados estruturados por módulos/tópicos
❌ NÃO tem: Facilidade para edição em arquivo de texto
❌ NÃO tem: Separação clara entre conteúdo e apresentação
```

### Como é Exibido Atualmente
- **Página**: [`/arquivo-arcano/:cardSlug`](App.tsx#L2233)
- **Componente**: `CardDetails` (linhas 2170-2340 em App.tsx)
- **Seções**:
  1. Imagem da carta
  2. Título + Badges (Arcano Maior/Menor, Naipe)
  3. Keywords
  4. Significado Direto (General Meaning)
  5. Cards de Contexto: ❤️ Amor, 💼 Carreira, 💡 Conselho
  6. Significado Invertido (Reversed)
  7. Simbolismo Histórico (se disponível via API)

---

## 3. PROPOSTA: ESTRUTURA EM MÓDULOS COM ARQUIVO DE TEXTO + JSON

### ✅ SIM, É POSSÍVEL E RECOMENDADO!

### Vantagens dessa Abordagem

| Aspecto | Atual | Proposto |
|---------|-------|----------|
| **Edição** | TypeScript direto | Arquivo .txt ou .md legível |
| **Importação** | Hardcoded no código | Script converte .txt → JSON |
| **Modularização** | Tudo em um array | Cada carta em um módulo separado |
| **Uso em Modelos** | Dados brutos | Estrutura pronta para LLMs |
| **Versionamento** | Difícil | Git-friendly |
| **Tradução** | Manual inline | Separado por idioma |

### Arquitetura Proposta

```
projeto/
├── data/
│   ├── cartas-raw/                    # 📝 Arquivos de texto (fonte)
│   │   ├── arcanos-maiores/
│   │   │   ├── 0-o-louco.txt
│   │   │   ├── 1-o-mago.txt
│   │   │   └── ...
│   │   └── arcanos-menores/
│   │       ├── copas-as.txt
│   │       └── ...
│   │
│   ├── cartas-config.json             # 🔧 Metadados (id, slug, URL imagem)
│   │
│   └── cards-compiled.json             # 📦 Saída final (TarotCardData array)
│
├── scripts/
│   └── compile-cards.js               # 🔨 Converte .txt → JSON
│
└── tarotData.ts                       # 📥 Importa cards-compiled.json
```

### Formato do Arquivo de Texto (Proposto)

**Exemplo: `data/cartas-raw/arcanos-maiores/0-o-louco.txt`**

```
---METADATA---
ID: maj_0
ARCANA: major
NUMBER: 0
ELEMENT: Air
SUIT: none
IMAGE_URL: https://www.sacred-texts.com/tarot/pkt/img/ar00.jpg

---KEYWORDS-EN---
- Freedom
- Faith
- Innocence
- New Beginnings

---KEYWORDS-PT---
- Liberdade
- Fé
- Inocência
- Novos Começos

---MEANING-UP-EN---
New beginnings, innocence, spontaneity, a free spirit. Taking a leap of 
faith into the unknown with optimism and trust.

---MEANING-UP-PT---
Novos começos, inocência, espontaneidade, espírito livre. Dar um salto 
de fé no desconhecido com otimismo e confiança.

---MEANING-REV-EN---
Holding back, recklessness, risk-taking without thought. Naivety leading 
to poor decisions.

---MEANING-REV-PT---
Hesitação, imprudência, assumir riscos sem pensar. Ingenuidade levando a 
decisões ruins.

---DESCRIPTION-EN---
A young man stands at the edge of a cliff, about to step into the unknown. 
He carries a small bag and a white rose, symbolizing purity. A small dog 
at his feet represents loyalty and protection.

---DESCRIPTION-PT---
Um jovem está à beira de um penhasco, prestes a dar um passo no 
desconhecido. Ele carrega uma pequena bolsa e uma rosa branca, 
simbolizando pureza. Um pequeno cão a seus pés representa lealdade e proteção.

---LOVE-EN---
A new romance is on the horizon. Be open to unexpected connections. 
If in a relationship, bring back spontaneity and adventure.

---LOVE-PT---
Um novo romance está no horizonte. Esteja aberto a conexões inesperadas. 
Se em um relacionamento, traga de volta a espontaneidade e aventura.

---CAREER-EN---
Time for a new career path or project. Don't overthink - trust your instincts 
and take that leap.

---CAREER-PT---
Hora de um novo caminho ou projeto profissional. Não pense demais - confie em 
seus instintos e dê o salto.

---ADVICE-EN---
Embrace the unknown with an open heart. Sometimes the best adventures begin 
with a single step into uncertainty.

---ADVICE-PT---
Abrace o desconhecido com o coração aberto. Às vezes as melhores aventuras 
começam com um único passo na incerteza.
```

### Arquivo de Configuração: `data/cartas-config.json`

```json
{
  "cards": [
    {
      "id": "maj_0",
      "name_en": "The Fool",
      "name_pt": "O Louco",
      "slug_en": "the-fool-card",
      "slug_pt": "carta-o-louco",
      "source_file": "arcanos-maiores/0-o-louco.txt"
    },
    {
      "id": "maj_1",
      "name_en": "The Magician",
      "name_pt": "O Mago",
      "slug_en": "the-magician-card",
      "slug_pt": "carta-o-mago",
      "source_file": "arcanos-maiores/1-o-mago.txt"
    }
    // ... 76 mais
  ]
}
```

### Script de Compilação: `scripts/compile-cards.js`

```javascript
const fs = require('fs');
const path = require('path');

/**
 * Lê arquivos .txt em formato modular
 * Compila para JSON final compatível com TarotCardData[]
 */
function compileCards() {
  const configPath = path.join(__dirname, '../data/cartas-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  const compiledCards = config.cards.map(cardConfig => {
    const filePath = path.join(__dirname, `../data/cartas-raw/${cardConfig.source_file}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const sections = {};
    const regex = /---(\w+-\w+-?\w*?)---([\s\S]*?)(?=---|$)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const [, sectionName, sectionContent] = match;
      sections[sectionName] = sectionContent.trim();
    }
    
    // Parse arrays (keywords)
    const parseList = (text) => text.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
    
    // Construir objeto TarotCardData
    return {
      id: sections.METADATA.match(/ID:\s*(\w+)/)[1],
      name: cardConfig.name_en,
      name_pt: cardConfig.name_pt,
      slug: cardConfig.slug_en,
      slug_pt: cardConfig.slug_pt,
      number: parseInt(sections.METADATA.match(/NUMBER:\s*(\d+)/)[1]),
      arcana: sections.METADATA.match(/ARCANA:\s*(\w+)/)[1],
      suit: sections.METADATA.match(/SUIT:\s*(\w+)/)[1],
      element: sections.METADATA.match(/ELEMENT:\s*(.+)/)[1]?.trim(),
      keywords: parseList(sections['KEYWORDS-EN']),
      keywords_pt: parseList(sections['KEYWORDS-PT']),
      meaning_up: sections['MEANING-UP-EN'],
      meaning_up_pt: sections['MEANING-UP-PT'],
      meaning_rev: sections['MEANING-REV-EN'],
      meaning_rev_pt: sections['MEANING-REV-PT'],
      description: sections['DESCRIPTION-EN'],
      description_pt: sections['DESCRIPTION-PT'],
      love: sections['LOVE-EN'],
      love_pt: sections['LOVE-PT'],
      career: sections['CAREER-EN'],
      career_pt: sections['CAREER-PT'],
      advice: sections['ADVICE-EN'],
      advice_pt: sections['ADVICE-PT'],
      imageUrl: sections.METADATA.match(/IMAGE_URL:\s*(.+)/)[1].trim()
    };
  });
  
  // Salvar JSON compilado
  fs.writeFileSync(
    path.join(__dirname, '../data/cards-compiled.json'),
    JSON.stringify(compiledCards, null, 2)
  );
  
  console.log(`✅ ${compiledCards.length} cartas compiladas!`);
}

compileCards();
```

### Como Usar com Modelos de IA

```typescript
// No seu geminiService.ts ou api/tarot.js

// Opção 1: Usar dados estruturados para prompt melhorado
const getCardContextForPrompt = (cardId: string): string => {
  const card = TAROT_CARDS.find(c => c.id === cardId);
  return `
Card: ${card.name}
Arcana: ${card.arcana}
Element: ${card.element}
Keywords: ${card.keywords.join(', ')}
Meaning (Upright): ${card.meaning_up}
Context (Love): ${card.love}
Context (Career): ${card.career}
`;
};

// Opção 2: Passar conteúdo das cartas direto como contexto ao modelo
const buildContextualPrompt = (cards, question) => {
  const cardContexts = cards.map((card, idx) => `
Position ${idx + 1}: ${card.name}
- General: ${card.description}
- Love: ${card.love}
- Career: ${card.career}
- Advice: ${card.advice}
`).join('\n');

  return `
${BASE_SYSTEM_PROMPT}

CARD DATA:
${cardContexts}

USER QUESTION: ${question}

Synthesize this reading with the card context above.
`;
};
```

---

## 4. MELHORIAS SUGERIDAS PARA OS PROMPTS

### A. Versioning do Prompt
```javascript
// Adicionar versionamento
const SPREAD_PROMPTS = {
  version: "2.0",
  updated_at: "2026-02-02",
  three_card: { ... }
};
```

### B. Prompts Dinâmicos Baseados em Contexto
```javascript
// Detectar tema da pergunta e ajustar tone
const getContextualPrompt = (question, spread) => {
  if (question?.toLowerCase().includes('amor')) {
    return `${BASE_SYSTEM_PROMPT}\nCONTEXT: Love & Relationships question\nTone: Compassionate yet direct.`;
  }
  // ... outros contextos
};
```

### C. Prompts com Exemplos (Few-shot)
```javascript
const SPREAD_PROMPTS = {
  three_card: {
    context: (cards, question, lang) => `...`,
    examples: [
      {
        input: { cards: "The Fool | The Magician | The High Priestess", spread: "three_card" },
        output: { sintese: "...", tema_central: "...", ... }
      }
    ]
  }
};
```

### D. Prompt Refinement Script
```javascript
// scripts/test-prompts.js
// Testar diferentes versões de prompt e medir qualidade
const testPromptVariant = async (variant, testCards) => {
  const results = await Promise.all(
    testCards.map(cards => generateSynthesis(cards, variant))
  );
  
  // Score baseado em: relevância, estrutura, clareza
  return scoreResults(results);
};
```

---

## 5. RESUMO: Próximos Passos Recomendados

### Fase 1: Preparar Estrutura de Dados ✅ (Rápido)
1. Criar `data/cartas-raw/` com arquivos `.txt` modular
2. Criar `data/cartas-config.json`
3. Criar `scripts/compile-cards.js`
4. Testar compilação

### Fase 2: Otimizar Prompts 🎯 (Impactante)
1. Adicionar exemplos (few-shot learning) aos prompts
2. Criar versões alternativas de prompts
3. Adicionar contexto dinâmico baseado na pergunta
4. Testar com Gemini e medir qualidade

### Fase 3: Integração 🔄
1. Migrar `tarotData.ts` para usar `cards-compiled.json`
2. Adicionar suporte para hot-reload de dados
3. Criar painel de admin para editar cards

---

## 📚 Referências Técnicas

| Arquivo | Linhas | Função |
|---------|--------|--------|
| [`api/tarot.js`](api/tarot.js) | 1-120 | SPREAD_PROMPTS, BASE_SYSTEM_PROMPT |
| [`services/geminiService.ts`](services/geminiService.ts) | 1-150 | getStructuredSynthesis, AnySynthesis types |
| [`tarotData.ts`](tarotData.ts) | 1-100 | TarotCardData interface |
| [`App.tsx`](App.tsx) | 2170-2340 | CardDetails component |

---

**Criado em**: 2026-02-02  
**Versão do Sistema**: Tarot Antigravity v2.0
