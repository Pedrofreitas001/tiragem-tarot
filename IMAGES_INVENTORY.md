# Inventário de Imagens do Site

## Imagens a Substituir

### 1. Spread Background Images (Home Page)
Utilizadas na seção de seleção de tiradas (spreads).
- **Localização:** App.tsx, linhas ~381-383
- **Uso:** Background das 3 cartas de spreads (Three Card, Celtic Cross, Love & Relationship)

```
'three_card': 'https://images.unsplash.com/photo-1635497611324-129442752063?w=800&q=80'
'celtic_cross': 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80'
'love_check': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80'
```

**Recomendação de substituto:**
- Imagens místicas/espirituais relacionadas a tarot
- Dimensões: mínimo 800x600px
- Formato sugerido: JPG ou WebP
- Estrutura no código:
```tsx
const spreadImages: Record<string, string> = {
  'three_card': 'NOVA_URL_AQUI',
  'celtic_cross': 'NOVA_URL_AQUI',
  'love_check': 'NOVA_URL_AQUI',
};
```

---

### 2. Product Images (Shop)
Vêm do arquivo `data/products.ts`
- **Uso:** Cards de produtos na loja e detalhes de produto
- **Estrutura:** Array `images: []` em cada produto

**Como substituir:**
1. Editar `data/products.ts`
2. Procurar por `images: [...]` em cada produto
3. Substituir as URLs

**Exemplo:**
```tsx
{
  id: 'tarot-deck-1',
  name: 'Mystical Rider Tarot',
  images: [
    'NOVA_URL_IMAGEM_1',
    'NOVA_URL_IMAGEM_2',
    'NOVA_URL_IMAGEM_3'
  ],
  // ... outros dados
}
```

---

### 3. Card Images (Tarot Cards)
Geradas dinamicamente via `constants.ts`
- **Localização:** constants.ts
- **Uso:** Cartas do tarot (78 cartas totais)
- **Fonte atual:** sacred-texts.com
- **Pattern:** 
  - Major Arcana: `ar00.jpg` - `ar21.jpg`
  - Minor Arcana: `{suit}{rank}.jpg` (ex: `w1.jpg`, `c10.jpg`)

**Como substituir:**
1. Fazer upload de todas as 78 cartas em um servidor
2. Criar um novo `baseUrl` apontando para o servidor
3. Manter a mesma nomenclatura ou ajustar o padrão de construção

```tsx
// Em generateDeck() dentro de constants.ts
const baseUrl = "NOVO_SERVIDOR_CARTAS"; // ex: "https://seu-servidor.com/cartas"
```

---

## Resumo de Tipos de Imagem

| Tipo | Quantidade | Local | Prioridade |
|------|-----------|-------|-----------|
| Spreads (Background) | 3 | App.tsx ~381-383 | Alta |
| Product Images | ~10-20 | data/products.ts | Alta |
| Tarot Cards | 78 | constants.ts baseUrl | Média |
| Avatar/Profile | Dinâmica | contexts/CartContext | Baixa |

---

## Passos para Substituição

### Opção 1: URLs Externas (Recomendado)
1. Hospede as imagens em um servidor (Imgur, Cloudinary, S3, etc)
2. Atualize as URLs nos arquivos listados
3. Teste as imagens no site

### Opção 2: URLs Locais
1. Coloque as imagens em `public/images/`
2. Use URLs como `/images/spread-1.jpg`
3. Atualize os caminhos nos arquivos

---

## Checklist de Substituição

- [ ] Imagens de Spreads (3 imagens)
- [ ] Imagens de Produtos (shop)
- [ ] Imagens de Cartas de Tarot (78 imagens)
- [ ] Testar responsive (mobile, tablet, desktop)
- [ ] Verificar qualidade das imagens
- [ ] Otimizar tamanho das imagens para web
