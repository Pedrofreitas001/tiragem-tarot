# Plano de Tradução Completo - Mystic Tarot

## Status Atual da Internacionalização

### ✅ Já Traduzido (Completo)
- **UI Geral** (`locales/pt.ts` e `locales/en.ts`):
  - Navegação, botões, labels
  - Textos da loja, carrinho, checkout
  - Mensagens do sistema

- **Dados dos Produtos** (`data/products.ts`):
  - Nomes, descrições, detalhes
  - Campos `_en` para versão inglesa

- **Nomes das Cartas** (`tarotData.ts`):
  - `name` (inglês) e `name_pt` (português)
  - `keywords` e `keywords_pt`
  - `meaning_up` e `meaning_up_pt`
  - `meaning_rev` e `meaning_rev_pt`

---

## 🔴 Pendente de Tradução

### 1. Conteúdo das Cartas de Tarot (78 cartas)

**Arquivo:** `tarotData.ts`

| Campo | Status | Estimativa |
|-------|--------|------------|
| `description` | Apenas inglês | 78 textos (~30 palavras cada) |
| `love` | Apenas inglês | 78 textos (~15 palavras cada) |
| `career` | Apenas inglês | 78 textos (~15 palavras cada) |
| `advice` | Apenas inglês | 78 textos (~20 palavras cada) |
| `element` | Apenas inglês | 4 elementos (Fire, Water, Earth, Air) |

**Exemplo de estrutura atual:**
```typescript
{
  id: "maj_0",
  name: "The Fool",
  name_pt: "O Louco",  // ✅ Traduzido
  element: "Air",  // ❌ Precisa element_pt: "Ar"
  keywords: [...],
  keywords_pt: [...],  // ✅ Traduzido
  meaning_up: "...",
  meaning_up_pt: "...",  // ✅ Traduzido
  description: "A young man stands...",  // ❌ Precisa description_pt
  love: "A new romance...",  // ❌ Precisa love_pt
  career: "Time for a new...",  // ❌ Precisa career_pt
  advice: "Embrace the unknown...",  // ❌ Precisa advice_pt
}
```

**Estrutura proposta:**
```typescript
{
  // ... campos existentes ...
  element: "Air",
  element_pt: "Ar",
  description: "A young man stands...",
  description_pt: "Um jovem está de pé...",
  love: "A new romance...",
  love_pt: "Um novo romance...",
  career: "Time for a new...",
  career_pt: "Hora de uma nova...",
  advice: "Embrace the unknown...",
  advice_pt: "Abrace o desconhecido...",
}
```

---

### 2. Posições dos Spreads (Tiragens)

**Arquivo:** `constants.ts`

| Spread | Posições | Status |
|--------|----------|--------|
| Three Card | 3 posições | Apenas inglês |
| Celtic Cross | 10 posições | Apenas inglês |
| Love & Relationship | 5 posições | Apenas inglês |

**Total: 18 posições para traduzir**

**Exemplo atual:**
```typescript
positions: [
  { index: 0, name: 'The Past', description: 'Influences from the past affecting the situation.' },
  // ...
]
```

**Estrutura proposta:**
```typescript
positions: [
  {
    index: 0,
    name: 'The Past',
    name_pt: 'O Passado',
    description: 'Influences from the past affecting the situation.',
    description_pt: 'Influências do passado afetando a situação.'
  },
  // ...
]
```

---

### 3. Elementos (4 traduções)

| Inglês | Português |
|--------|-----------|
| Fire | Fogo |
| Water | Água |
| Earth | Terra |
| Air | Ar |

---

## Plano de Implementação

### Etapa 1: Atualizar Interface TypeScript
1. Adicionar campos `_pt` ao `TarotCardData` em `tarotData.ts`
2. Adicionar campos `_pt` ao `Position` em `types.ts`
3. Criar helper functions para retornar campo localizado

### Etapa 2: Traduzir Posições dos Spreads (18 textos)
```typescript
// Three Card Spread
"The Past" → "O Passado"
"The Present" → "O Presente"
"The Future" → "O Futuro"

// Celtic Cross (10 posições)
"The Significator" → "O Significador"
"The Crossing" → "O Cruzamento"
"The Foundation" → "A Fundação"
"The Recent Past" → "O Passado Recente"
"The Crown" → "A Coroa"
"The Near Future" → "O Futuro Próximo"
"The Self" → "O Eu"
"The Environment" → "O Ambiente"
"Hopes & Fears" → "Esperanças e Medos"
"The Outcome" → "O Resultado"

// Love Spread (5 posições)
"You" → "Você"
"Them" → "A Outra Pessoa"
"Relationship" → "O Relacionamento"
"Challenge" → "O Desafio"
"Advice" → "O Conselho"
```

### Etapa 3: Traduzir Cartas (78 cartas)
Dividido em sub-etapas:

**3.1 Arcanos Maiores (22 cartas)**
- Prioridade Alta - são as cartas mais vistas
- Campos: description_pt, love_pt, career_pt, advice_pt

**3.2 Naipe de Copas (14 cartas)**
- Relacionado a emoções e amor

**3.3 Naipe de Ouros (14 cartas)**
- Relacionado a finanças e materialidade

**3.4 Naipe de Espadas (14 cartas)**
- Relacionado a mente e conflitos

**3.5 Naipe de Paus (14 cartas)**
- Relacionado a paixão e ação

---

## Estimativa de Trabalho

| Item | Quantidade | Complexidade |
|------|------------|--------------|
| Posições dos Spreads | 18 textos | Baixa |
| Elementos | 4 textos | Baixa |
| Arcanos Maiores | 22 × 4 campos = 88 textos | Média |
| Arcanos Menores | 56 × 4 campos = 224 textos | Média |
| **Total** | **~334 textos** | - |

---

## Integração com o Sistema i18n Existente

O app já usa `LanguageContext` e funções helper. Após adicionar os campos `_pt`:

```typescript
// Em constants.ts ou novo arquivo helpers
export const getLocalizedPosition = (
  position: Position,
  isPortuguese: boolean
) => ({
  name: isPortuguese ? position.name_pt : position.name,
  description: isPortuguese ? position.description_pt : position.description
});

export const getLocalizedCardField = (
  card: TarotCardData,
  field: 'description' | 'love' | 'career' | 'advice' | 'element',
  isPortuguese: boolean
): string => {
  const ptField = `${field}_pt` as keyof TarotCardData;
  return isPortuguese
    ? (card[ptField] as string) || (card[field] as string)
    : card[field] as string;
};
```

---

## Próximos Passos

1. **Aprovar este plano** com o usuário
2. **Implementar Etapa 1** - Atualizar tipos TypeScript
3. **Implementar Etapa 2** - Traduzir posições (rápido)
4. **Implementar Etapa 3** - Traduzir cartas (mais demorado)
5. **Testar** a troca de idiomas em todas as telas
6. **Commit** incrementais a cada etapa completada
