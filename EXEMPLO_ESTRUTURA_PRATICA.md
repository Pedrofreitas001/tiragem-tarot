# Exemplo Prático: Estrutura de Módulos para Cartas

## 1. Exemplo de Arquivo .txt Modular

### Arquivo: `data/cartas-raw/arcanos-maiores/0-o-louco.txt`

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
Novos começos, inocência, espontaneidade, espírito livre. Dar um salto de fé 
no desconhecido com otimismo e confiança.

---MEANING-REV-EN---
Holding back, recklessness, risk-taking without thought. Naivety leading to 
poor decisions.

---MEANING-REV-PT---
Hesitação, imprudência, assumir riscos sem pensar. Ingenuidade levando a 
decisões ruins.

---DESCRIPTION-EN---
A young man stands at the edge of a cliff, about to step into the unknown. He 
carries a small bag and a white rose, symbolizing purity. A small dog at his 
feet represents loyalty and protection.

---DESCRIPTION-PT---
Um jovem está à beira de um penhasco, prestes a dar um passo no desconhecido. 
Ele carrega uma pequena bolsa e uma rosa branca, simbolizando pureza. Um 
pequeno cão a seus pés representa lealdade e proteção.

---LOVE-EN---
A new romance is on the horizon. Be open to unexpected connections. If in a 
relationship, bring back spontaneity and adventure.

---LOVE-PT---
Um novo romance está no horizonte. Esteja aberto a conexões inesperadas. Se em 
um relacionamento, traga de volta a espontaneidade e aventura.

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

---

## 2. Arquivo de Configuração (JSON)

### `data/cartas-config.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-02",
  "totalCards": 78,
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
    },
    {
      "id": "maj_2",
      "name_en": "The High Priestess",
      "name_pt": "A Sacerdotisa",
      "slug_en": "the-high-priestess-card",
      "slug_pt": "carta-a-sacerdotisa",
      "source_file": "arcanos-maiores/2-a-sacerdotisa.txt"
    },
    {
      "id": "min_cups_01",
      "name_en": "Ace of Cups",
      "name_pt": "Ás de Copas",
      "slug_en": "ace-of-cups",
      "slug_pt": "as-de-copas",
      "source_file": "arcanos-menores/copas/01-as-de-copas.txt"
    }
  ]
}
```

---

## 3. Script de Compilação (Node.js)

### `scripts/compile-cards.js`

```javascript
#!/usr/bin/env node

/**
 * Compile Cards Script
 * Converte arquivos .txt modulares em JSON validado
 * 
 * Uso: node scripts/compile-cards.js [--watch]
 */

const fs = require('fs');
const path = require('path');

// Configurações
const DATA_DIR = path.join(__dirname, '../data');
const RAW_CARDS_DIR = path.join(DATA_DIR, 'cartas-raw');
const CONFIG_FILE = path.join(DATA_DIR, 'cartas-config.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'cards-compiled.json');

/**
 * Parse seções de um arquivo .txt
 * Formato esperado: ---SECTION_NAME---conteúdo---NEXT_SECTION---
 */
function parseSections(content) {
  const sections = {};
  
  // Regex para encontrar seções
  const sectionRegex = /---(\w+-[\w-]*)---([\s\S]*?)(?=---|$)/g;
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    const [, sectionName, sectionContent] = match;
    sections[sectionName.trim()] = sectionContent.trim();
  }
  
  return sections;
}

/**
 * Parse lista de keywords (uma por linha, começando com -)
 */
function parseKeywordList(text) {
  return text
    .split('\n')
    .map(line => line.replace(/^[\s-]*/, '').trim())
    .filter(line => line.length > 0);
}

/**
 * Parse metadados simples (KEY: VALUE)
 */
function parseMetadata(metadataText) {
  const metadata = {};
  
  metadataText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const k = key.trim().toUpperCase();
      const v = valueParts.join(':').trim();
      metadata[k] = v;
    }
  });
  
  return metadata;
}

/**
 * Compilar um arquivo .txt para TarotCardData
 */
function compileCard(cardConfig) {
  const filePath = path.join(RAW_CARDS_DIR, cardConfig.source_file);
  
  // Validar arquivo existe
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const sections = parseSections(content);
  
  // Validar seções obrigatórias
  const requiredSections = [
    'METADATA', 'KEYWORDS-EN', 'KEYWORDS-PT',
    'MEANING-UP-EN', 'MEANING-UP-PT',
    'MEANING-REV-EN', 'MEANING-REV-PT',
    'DESCRIPTION-EN', 'DESCRIPTION-PT',
    'LOVE-EN', 'LOVE-PT',
    'CAREER-EN', 'CAREER-PT',
    'ADVICE-EN', 'ADVICE-PT'
  ];
  
  const missingSection = requiredSections.find(s => !sections[s]);
  if (missingSection) {
    console.error(`❌ Seção obrigatória faltando em ${cardConfig.source_file}: ${missingSection}`);
    return null;
  }
  
  // Parse metadata
  const metadata = parseMetadata(sections.METADATA);
  
  // Construir objeto TarotCardData
  const card = {
    id: metadata.ID,
    name: cardConfig.name_en,
    name_pt: cardConfig.name_pt,
    slug: cardConfig.slug_en,
    slug_pt: cardConfig.slug_pt,
    number: parseInt(metadata.NUMBER || '0'),
    arcana: metadata.ARCANA === 'major' ? 'major' : 'minor',
    suit: metadata.SUIT && metadata.SUIT !== 'none' ? metadata.SUIT : undefined,
    element: metadata.ELEMENT && metadata.ELEMENT !== 'none' ? metadata.ELEMENT : undefined,
    keywords: parseKeywordList(sections['KEYWORDS-EN']),
    keywords_pt: parseKeywordList(sections['KEYWORDS-PT']),
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
    imageUrl: metadata.IMAGE_URL
  };
  
  return card;
}

/**
 * Compilar todas as cartas
 */
function compileAllCards() {
  console.log('📦 Compilando cartas...\n');
  
  // Ler config
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`❌ Arquivo de configuração não encontrado: ${CONFIG_FILE}`);
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  
  // Compilar cada carta
  const compiledCards = [];
  let successCount = 0;
  let errorCount = 0;
  
  config.cards.forEach(cardConfig => {
    const compiled = compileCard(cardConfig);
    
    if (compiled) {
      compiledCards.push(compiled);
      successCount++;
      console.log(`✅ ${compiled.name_pt} (${compiled.id})`);
    } else {
      errorCount++;
    }
  });
  
  console.log(`\n📊 Resultado: ${successCount} cartas compiladas, ${errorCount} erros\n`);
  
  if (errorCount > 0) {
    console.error('❌ Abortando due a erros');
    process.exit(1);
  }
  
  // Validar duplicatas
  const ids = compiledCards.map(c => c.id);
  const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  
  if (duplicates.length > 0) {
    console.error(`❌ IDs duplicados encontrados: ${duplicates.join(', ')}`);
    process.exit(1);
  }
  
  // Salvar output
  const output = {
    version: config.version,
    lastCompiled: new Date().toISOString(),
    totalCards: compiledCards.length,
    cards: compiledCards
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`✅ JSON compilado salvo em: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log(`📊 Total: ${compiledCards.length} cartas\n`);
}

/**
 * Watch mode: recompilar quando arquivos mudam
 */
function startWatchMode() {
  console.log('👀 Modo watch iniciado. Pressione Ctrl+C para sair.\n');
  
  fs.watch(RAW_CARDS_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.txt')) {
      console.log(`📝 Mudança detectada: ${filename}`);
      setTimeout(compileAllCards, 500); // Debounce
    }
  });
}

// Main
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');

try {
  compileAllCards();
  
  if (watchMode) {
    startWatchMode();
  }
} catch (error) {
  console.error('❌ Erro durante compilação:', error.message);
  process.exit(1);
}
```

---

## 4. Resultado: `data/cards-compiled.json`

```json
{
  "version": "1.0",
  "lastCompiled": "2026-02-02T15:30:00.000Z",
  "totalCards": 78,
  "cards": [
    {
      "id": "maj_0",
      "name": "The Fool",
      "name_pt": "O Louco",
      "slug": "the-fool-card",
      "slug_pt": "carta-o-louco",
      "number": 0,
      "arcana": "major",
      "element": "Air",
      "keywords": [
        "Freedom",
        "Faith",
        "Innocence",
        "New Beginnings"
      ],
      "keywords_pt": [
        "Liberdade",
        "Fé",
        "Inocência",
        "Novos Começos"
      ],
      "meaning_up": "New beginnings, innocence, spontaneity, a free spirit. Taking a leap of faith into the unknown with optimism and trust.",
      "meaning_up_pt": "Novos começos, inocência, espontaneidade, espírito livre. Dar um salto de fé no desconhecido com otimismo e confiança.",
      "meaning_rev": "Holding back, recklessness, risk-taking without thought. Naivety leading to poor decisions.",
      "meaning_rev_pt": "Hesitação, imprudência, assumir riscos sem pensar. Ingenuidade levando a decisões ruins.",
      "description": "A young man stands at the edge of a cliff, about to step into the unknown. He carries a small bag and a white rose, symbolizing purity. A small dog at his feet represents loyalty and protection.",
      "description_pt": "Um jovem está à beira de um penhasco, prestes a dar um passo no desconhecido. Ele carrega uma pequena bolsa e uma rosa branca, simbolizando pureza. Um pequeno cão a seus pés representa lealdade e proteção.",
      "love": "A new romance is on the horizon. Be open to unexpected connections. If in a relationship, bring back spontaneity and adventure.",
      "love_pt": "Um novo romance está no horizonte. Esteja aberto a conexões inesperadas. Se em um relacionamento, traga de volta a espontaneidade e aventura.",
      "career": "Time for a new career path or project. Don't overthink - trust your instincts and take that leap.",
      "career_pt": "Hora de um novo caminho ou projeto profissional. Não pense demais - confie em seus instintos e dê o salto.",
      "advice": "Embrace the unknown with an open heart. Sometimes the best adventures begin with a single step into uncertainty.",
      "advice_pt": "Abrace o desconhecido com o coração aberto. Às vezes as melhores aventuras começam com um único passo na incerteza.",
      "imageUrl": "https://www.sacred-texts.com/tarot/pkt/img/ar00.jpg"
    },
    {
      "id": "maj_1",
      "name": "The Magician",
      "name_pt": "O Mago",
      "slug": "the-magician-card",
      "slug_pt": "carta-o-mago",
      "number": 1,
      "arcana": "major",
      "element": "Air",
      "keywords": [
        "Manifestation",
        "Power",
        "Action",
        "Resourcefulness"
      ],
      "keywords_pt": [
        "Manifestação",
        "Poder",
        "Ação",
        "Desenvoltura"
      ],
      "meaning_up": "Skill, diplomacy, willpower, self-confidence. You have all the tools you need to manifest your desires. Take action now.",
      "meaning_up_pt": "Habilidade, diplomacia, força de vontade, autoconfiança. Você tem todas as ferramentas necessárias para manifestar seus desejos.",
      "meaning_rev": "Manipulation, poor planning, untapped talents. Using skills for deception or not using them at all.",
      "meaning_rev_pt": "Manipulação, planejamento ruim, talentos não utilizados. Usar habilidades para enganar ou não usá-las.",
      "description": "A figure stands with one hand pointing to the sky and one to the earth, channeling divine energy. On his table are the symbols of all four suits - representing mastery over all elements.",
      "description_pt": "Uma figura está com uma mão apontando para o céu e outra para a terra, canalizando energia divina. Em sua mesa estão os símbolos dos quatro naipes - representando domínio sobre todos os elementos.",
      "love": "Take initiative in love. You have the charm and ability to attract what you desire. Be authentic.",
      "love_pt": "Tome iniciativa no amor. Você tem o charme e a habilidade para atrair o que deseja. Seja autêntico.",
      "career": "You have everything needed for success. Use your skills and willpower to achieve your goals. Great potential ahead.",
      "career_pt": "Você tem tudo necessário para o sucesso. Use suas habilidades e força de vontade para alcançar seus objetivos. Grande potencial à frente.",
      "advice": "You have the resources you need. Channel your energy and act now with confidence.",
      "advice_pt": "Você tem os recursos que precisa. Canalize sua energia e aja agora com confiança.",
      "imageUrl": "https://www.sacred-texts.com/tarot/pkt/img/ar01.jpg"
    }
  ]
}
```

---

## 5. Como Integrar com TypeScript

### Opção A: Importar JSON Compilado

```typescript
// tarotData.ts
import compiledCards from '../data/cards-compiled.json';

export const TAROT_CARDS: TarotCardData[] = compiledCards.cards;
```

### Opção B: Script de Build que Gera `tarotData.ts`

```typescript
// scripts/generate-tarot-data.js
const fs = require('fs');
const compiled = JSON.parse(fs.readFileSync('./data/cards-compiled.json', 'utf-8'));

const output = `
// ⚠️ AUTO-GENERATED FILE - NÃO EDITAR MANUALMENTE
// Gerado por scripts/generate-tarot-data.js
// Re-executar: npm run compile:cards

import { TarotCardData } from '../types';

export const TAROT_CARDS: TarotCardData[] = ${JSON.stringify(compiled.cards, null, 2)};
`;

fs.writeFileSync('./tarotData.ts', output);
console.log('✅ tarotData.ts gerado com sucesso!');
```

### Opção C: Hot Reload em Desenvolvimento

```typescript
// lib/cardLoader.ts
import { useMemo } from 'react';

let cachedCards: TarotCardData[] | null = null;

export async function loadCards(): Promise<TarotCardData[]> {
  if (cachedCards) return cachedCards;
  
  const response = await fetch('/data/cards-compiled.json');
  cachedCards = (await response.json()).cards;
  return cachedCards;
}

export function useCards() {
  return useMemo(() => loadCards(), []);
}
```

---

## 6. Package.json Scripts

Adicionar ao seu `package.json`:

```json
{
  "scripts": {
    "compile:cards": "node scripts/compile-cards.js",
    "compile:cards:watch": "node scripts/compile-cards.js --watch",
    "build": "npm run compile:cards && vite build"
  }
}
```

---

## ✅ Vantagens Dessa Arquitetura

| Aspecto | Ganho |
|---------|-------|
| **Edição** | Arquivo .txt simples, sem TypeScript |
| **Modularização** | 78 arquivos separados em organizado |
| **Versionamento** | Cada carta é um commit |
| **Tradução** | Seções bilíngues lado a lado |
| **Escalabilidade** | Fácil adicionar mais cartas |
| **Otimização para IA** | JSON estruturado pronto para prompts |
| **Manutenibilidade** | Sem duplicação de dados |
| **Hot Reload** | Compilação automática com --watch |

---

**Última atualização**: 2026-02-02
