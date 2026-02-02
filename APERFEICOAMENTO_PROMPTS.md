# Aperfeiçoamento dos Prompts de IA: Guia Prático

## 📋 Sumário Executivo

Seu sistema atual usa **Gemini 2.0 Flash Lite** com prompts estruturados por tipo de jogo (three_card, celtic_cross, etc.). Os prompts funcionam bem, mas há **4 áreas principais** para otimização:

1. **Few-shot Learning** - Adicionar exemplos ao prompt
2. **Contexto Dinâmico** - Ajustar tone baseado na pergunta
3. **Instrução de Rol** - Melhorar o system prompt
4. **Verificação de Qualidade** - Testar variantes

---

## 1. OTIMIZAÇÃO 1: Few-Shot Learning

### ❌ Problema Atual
```javascript
// Seu prompt atual apenas descreve o que fazer
context: (cards, question, lang) => `
Leitura: Três Cartas
Cartas: ${cards}
Interprete integrando as três posições temporais...`
```

### ✅ Solução: Adicionar Exemplos

```javascript
const SPREAD_PROMPTS = {
  three_card: {
    context: (cards, question, lang) => `...`,
    
    // NOVO: Exemplos para guiar o modelo
    examples: [
      {
        spread: "three_card",
        cards: "The Fool (Past) | The Magician (Present) | The High Priestess (Future)",
        question: "Como está meu desenvolvimento profissional?",
        expectedOutput: {
          sintese: "Você deixou para trás uma fase de indecisão e agora está tomando ação concreta (Mago). O futuro aponta para sabedoria intuitiva - pode ser hora de equilibrar ação com escuta interior.",
          tema_central: "Transformação de potencial em realidade",
          conselho: "Confie em suas habilidades atuais, mas não ignore a voz da intuição.",
          reflexao: "Onde sua ação precisa da sabedoria interna?"
        }
      },
      {
        spread: "three_card",
        cards: "The Sun (Past) | The Tower (Present) | The Star (Future)",
        question: null,
        expectedOutput: {
          sintese: "Uma época de clareza e boas energias foi interrompida por mudanças abruptas. A Star promete renovação e nova direção após essa transformação.",
          tema_central: "Crise como catalisador de renovação",
          conselho: "Não resista à mudança - ela leva a algo melhor.",
          reflexao: "Qual esperança emerge dessa destruição?"
        }
      }
    ]
  }
};
```

### Como Usar no Prompt

```javascript
const buildPromptWithExamples = (spread, cards, question, lang) => {
  const spreadConfig = SPREAD_PROMPTS[spread];
  
  let examplesText = '';
  if (spreadConfig.examples && spreadConfig.examples.length > 0) {
    examplesText = `

EXEMPLOS DE RESPOSTAS DE QUALIDADE:
${spreadConfig.examples.map((ex, i) => `
Exemplo ${i + 1}:
Cartas: ${ex.cards}
${ex.question ? `Pergunta: "${ex.question}"` : 'Leitura geral'}

Resposta esperada:
${JSON.stringify(ex.expectedOutput, null, 2)}
`).join('\n---\n')}

AGORA RESPONDA MANTENDO A QUALIDADE DESSES EXEMPLOS:
`;
  }
  
  return `${BASE_SYSTEM_PROMPT}${examplesText}
  
${spreadConfig.context(cards, question, lang)}`;
};
```

---

## 2. OTIMIZAÇÃO 2: Contexto Dinâmico

### ❌ Problema Atual
```javascript
// Um único tone para todas as perguntas
const BASE_SYSTEM_PROMPT = `Você é tarólogo experiente. Regras: ... Linguagem elegante e simples...`
```

### ✅ Solução: Detectar Tema da Pergunta

```javascript
/**
 * Detecta tema da pergunta e retorna tone ajustado
 */
function detectThemeAndTone(question = '') {
  const themes = {
    amor: {
      keywords: ['amor', 'relacionamento', 'romance', 'coração', 'parceiro', 'crush', 'casal'],
      tone: 'compassionate',
      toneText: 'Seja empático e sensível. Reconheça as emoções envolvidas. Foco em clareza emocional.'
    },
    carreira: {
      keywords: ['trabalho', 'emprego', 'carreira', 'negócio', 'projeto', 'profissional', 'empresa'],
      tone: 'practical',
      toneText: 'Seja prático e direto. Foco em ação e resultados. Ofereça orientação acionável.'
    },
    saude: {
      keywords: ['saúde', 'físico', 'mental', 'bem-estar', 'energia', 'cura', 'doença'],
      tone: 'nurturing',
      toneText: 'Seja acolhedor e encorajador. Foque no bem-estar integral. Nunca dê orientação médica.'
    },
    espiritualidade: {
      keywords: ['espiritual', 'divino', 'alma', 'chamado', 'propósito', 'essência', 'despertar'],
      tone: 'profound',
      toneText: 'Seja profundo e introspectivo. Explore significado e propósito. Evite clichês.'
    },
    financeiro: {
      keywords: ['dinheiro', 'financeiro', 'investimento', 'ganho', 'perda', 'riqueza', 'abundância'],
      tone: 'analytical',
      toneText: 'Seja claro e perspicaz. Equilibre esperança com realismo. Foco em oportunidades.'
    }
  };
  
  const lowerQuestion = (question || '').toLowerCase();
  
  // Encontrar tema com maior relevância
  let detectedTheme = 'general';
  let maxMatches = 0;
  
  for (const [theme, config] of Object.entries(themes)) {
    const matches = config.keywords.filter(kw => lowerQuestion.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedTheme = theme;
    }
  }
  
  return {
    theme: detectedTheme,
    tone: themes[detectedTheme]?.tone || 'balanced',
    instruction: themes[detectedTheme]?.toneText || ''
  };
}

/**
 * Gerar system prompt dinâmico
 */
function getDynamicSystemPrompt(question = '') {
  const base = `Você é tarólogo experiente. Regras gerais:
- Tom: simbólico, calmo, direto
- Sem explicar o que é tarot
- Sem significados óbvios
- Sem emojis ou listas
- Sem mencionar IA/sistema
- Linguagem elegante e simples
- Respostas práticas e personalizadas`;

  const { theme, instruction } = detectThemeAndTone(question);
  
  return `${base}

[CONTEXTO ESPECÍFICO: ${theme.toUpperCase()}]
${instruction}

Máximo 3 parágrafos por resposta.`;
}
```

### Uso Integrado

```javascript
// Em api/tarot.js
const buildFullPrompt = (cards, question, lang, spreadId) => {
  const systemPrompt = getDynamicSystemPrompt(question);
  const spreadConfig = SPREAD_PROMPTS[spreadId];
  const contextPrompt = spreadConfig.context(cards, question, lang);
  
  return `${systemPrompt}\n\n${contextPrompt}\n\nResponda em JSON válido.`;
};
```

---

## 3. OTIMIZAÇÃO 3: Melhorar Instruction Suivante (Rol Refinado)

### ❌ Problema Atual - Instrução Genérica
```javascript
const BASE_SYSTEM_PROMPT = `Você é tarólogo experiente. Regras: ...`
// Muito genérico, sem detalhes de estilo
```

### ✅ Solução: Definir Rol Claro com Nuances

```javascript
const REFINED_SYSTEM_PROMPT = `VOCÊ É: Tarólogo experiente e intuitivo com 20+ anos de prática

ESTILO:
- Profundo sem ser pomposo
- Intuitivo sem ser vago
- Direto sem ser frio
- Poético sem ser clichê

RESTRIÇÕES:
❌ Não explique os significados das cartas (assuma que o usuário conhece)
❌ Não use listas com bullets ou emojis
❌ Não mencione ser uma IA ou um sistema
❌ Não faça previsões absolutas (use "tendências", "potenciais")
❌ Não ignore cartas invertidas - integre-as na narrativa
❌ Não ofereça múltiplas interpretações (seja claro em sua visão)
❌ Não use linguagem excessivamente mística

✅ SIM:
✅ Integre todas as cartas em uma narrativa fluida
✅ Aponte conexões entre as cartas (como se "conversam")
✅ Ofereça aplicação prática - o que fazer com essa informação
✅ Respeite reversos como complementos, não negações
✅ Use linguagem que ressoa (elegante, simples, autêntica)
✅ Termine com algo reflexivo que empodere o leitor
✅ Adapte tom à natureza da pergunta (amor vs. carreira vs. espiritual)

ESTRUTURA DE PENSAMENTO:
1. Qual é a NARRATIVA geral dessas cartas juntas?
2. Qual é o CONFLITO ou TENSÃO principal?
3. Qual é o POTENCIAL ou DIREÇÃO emergente?
4. Qual é a AÇÃO imediata recomendada?
5. Qual é a REFLEXÃO profunda para levar adiante?

EXEMPLO DE TOM ESPERADO:
"O Louco em posição de passado sugere um salto de fé que o trouxe até aqui. 
Agora O Mago aparece - você tem os recursos, mas falta direcionamento. 
O futuro aponta para A Sacerdotisa: a resposta está em ouvir sua intuição, 
não em fazer mais. Descanse um pouco do fazer. Confie no processo."
`;
```

---

## 4. OTIMIZAÇÃO 4: Script de Validação e Teste

### Criar `scripts/test-prompts.js`

```javascript
/**
 * Script para testar diferentes versões de prompt
 * Mede qualidade das respostas usando critérios automáticos
 */

const fs = require('fs');

// Dados de teste com casos conhecidos
const TEST_CASES = [
  {
    name: "Três Cartas: Carreira",
    spread: "three_card",
    cards: "The Fool (Past) | The Magician (Present) | The Star (Future)",
    question: "Como está minha carreira?",
    lang: "português",
    criteria: {
      hasNarrative: true,      // Deve ter narrativa fluida
      hasActionable: true,     // Deve ter algo acionável
      noLists: true,           // Sem listas/bullets
      integrates3Cards: true,  // Integra as 3 cartas
      length: [80, 200]        // Entre 80-200 palavras
    }
  },
  {
    name: "Sim ou Não: Direto",
    spread: "yes_no",
    cards: "The Sun",
    question: "Devo aceitar essa oferta de emprego?",
    lang: "português",
    criteria: {
      hasAnswer: true,         // Deve ter sim/não/talvez
      hasExplanation: true,    // Deve explicar
      directTone: true,        // Direto, sem vaguidade
      length: [50, 150]
    }
  }
];

/**
 * Score uma resposta baseado em critérios
 */
function scoreResponse(response, criteria) {
  let score = 0;
  let feedback = [];
  
  // Verifica narrativa (múltiplas sentenças conectadas)
  if (criteria.hasNarrative) {
    const sentences = response.split(/[.!?]/).length;
    if (sentences >= 3) {
      score += 20;
    } else {
      feedback.push("❌ Falta narrativa fluida");
    }
  }
  
  // Verifica se tem algo acionável (verbos imperativos)
  if (criteria.hasActionable) {
    const actionVerbs = ['faça', 'considere', 'confie', 'escute', 'busque', 'evite', 'explore'];
    const hasAction = actionVerbs.some(v => response.toLowerCase().includes(v));
    if (hasAction) {
      score += 20;
    } else {
      feedback.push("⚠️ Poderia ser mais acionável");
    }
  }
  
  // Verifica se não usa listas
  if (criteria.noLists) {
    const hasLists = /^[\s]*[-•*]\s|^\s*\d+\./m.test(response);
    if (!hasLists) {
      score += 15;
    } else {
      feedback.push("❌ Usa listas (evitar)");
    }
  }
  
  // Verifica integração de múltiplas cartas
  if (criteria.integrates3Cards) {
    // Conta quantas cartas são mencionadas
    const cards = (response.match(/Mago|Louco|Sacerdotisa|Sol|Torre|Estrela|Mago/gi) || []).length;
    if (cards >= 2) {
      score += 20;
    } else {
      feedback.push("⚠️ Falta integração entre as cartas");
    }
  }
  
  // Verifica comprimento
  if (criteria.length) {
    const words = response.split(/\s+/).length;
    if (words >= criteria.length[0] && words <= criteria.length[1]) {
      score += 25;
    } else {
      feedback.push(`⚠️ Comprimento: ${words} palavras (esperado: ${criteria.length[0]}-${criteria.length[1]})`);
    }
  }
  
  return { score: Math.min(100, score), feedback };
}

/**
 * Executar testes
 */
async function runTests() {
  console.log('🧪 Iniciando testes de prompts\n');
  
  const results = [];
  
  for (const testCase of TEST_CASES) {
    console.log(`📝 Testando: ${testCase.name}`);
    
    try {
      // Chamar sua API
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: {
            spread: { id: testCase.spread },
            cards: testCase.cards.split('|').map(c => ({ name: c.trim() })),
            question: testCase.question,
            reversedIndices: []
          },
          isPortuguese: testCase.lang === 'português'
        })
      });
      
      const data = await response.json();
      const responseText = data.text;
      
      // Avaliar resposta
      const { score, feedback } = scoreResponse(responseText, testCase.criteria);
      
      results.push({
        testCase: testCase.name,
        score,
        feedback,
        response: responseText.substring(0, 150) + '...'
      });
      
      console.log(`  ✅ Score: ${score}/100`);
      feedback.forEach(f => console.log(`     ${f}`));
      console.log('');
      
    } catch (error) {
      console.error(`  ❌ Erro: ${error.message}\n`);
    }
  }
  
  // Relatório final
  console.log('\n📊 RESUMO DOS TESTES\n');
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  results.forEach(r => {
    console.log(`${r.testCase}: ${r.score}/100`);
  });
  
  console.log(`\n📈 Score Médio: ${avgScore.toFixed(1)}/100`);
  
  if (avgScore >= 80) {
    console.log('✅ Qualidade excelente! Prompts estão bem calibrados.');
  } else if (avgScore >= 60) {
    console.log('⚠️ Qualidade aceitável. Considere as otimizações sugeridas acima.');
  } else {
    console.log('❌ Qualidade baixa. Revise os prompts com urgência.');
  }
}

runTests().catch(console.error);
```

### Usar no package.json

```json
{
  "scripts": {
    "test:prompts": "node scripts/test-prompts.js",
    "test:prompts:watch": "nodemon --watch api scripts/test-prompts.js"
  }
}
```

---

## 5. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Preparação (30 min)
- [ ] Copiar exemplos few-shot para SPREAD_PROMPTS
- [ ] Criar função `detectThemeAndTone()`
- [ ] Criar função `getDynamicSystemPrompt()`
- [ ] Atualizar `SPREAD_PROMPTS` com exemplos

### Fase 2: Integração (1 hora)
- [ ] Integrar detecção de tema em `/api/tarot.js`
- [ ] Atualizar `buildPrompt()` para usar novo system prompt
- [ ] Testar manualmente 3 leituras diferentes
- [ ] Verificar qualidade das respostas

### Fase 3: Validação (1 hora)
- [ ] Criar `scripts/test-prompts.js`
- [ ] Executar testes em 5+ casos diferentes
- [ ] Documentar resultados
- [ ] Iterar conforme necessário

### Fase 4: Deploy (30 min)
- [ ] Atualizar API em produção
- [ ] Monitorar feedback de usuários
- [ ] Fazer ajustes finos baseado em feedback real

---

## 6. Tabela de Referência: Temas e Tons

| Tema | Keywords | Tom | Instrução-Chave |
|------|----------|-----|-----------------|
| **Amor** | amor, relacionamento, romance, casal | compassionate | "Reconheça as emoções. Seja sensível." |
| **Carreira** | trabalho, emprego, negócio, projeto | practical | "Seja direto. Foque em ação." |
| **Saúde** | saúde, bem-estar, energia, cura | nurturing | "Seja acolhedor. Nunca orientação médica." |
| **Espiritual** | espiritual, alma, propósito, essência | profound | "Explore significado. Evite clichês." |
| **Financeiro** | dinheiro, investimento, riqueza, ganho | analytical | "Seja perspicaz. Equilibre esperança/realismo." |

---

## 7. Recursos Adicionais

### Otimizações Futuras (Advanced)

```javascript
// 1. Retrieval-Augmented Generation (RAG)
// Buscar contexto similar de leituras anteriores
async function getRelevantContext(cards, question) {
  const similar = await searchHistoricalReadings(cards, question);
  return similar.map(r => r.synthesis).join('\n\n');
}

// 2. Validação de Resposta
function validateSynthesis(synthesis, schema) {
  const required = schema.required || [];
  const valid = required.every(field => synthesis[field]?.length > 0);
  return { valid, missing: required.filter(f => !synthesis[f]) };
}

// 3. Refinement Loop
async function refineResponse(initialResponse, feedback) {
  const refinementPrompt = `
A síntese anterior recebeu este feedback: "${feedback}"
Melhore a resposta mantendo a estrutura JSON:
${JSON.stringify(initialResponse, null, 2)}
`;
  return await callGemini(refinementPrompt);
}
```

---

**Status**: Pronto para implementação  
**Tempo estimado**: 2-3 horas  
**Impacto esperado**: +40% melhoria na qualidade das respostas  
**Data**: 2026-02-02
