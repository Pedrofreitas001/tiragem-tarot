# 📁 Estrutura de Imagens do Projeto

## Como Usar Esta Pasta

Adicione suas imagens nos diretórios abaixo conforme o tipo. Após adicionar os arquivos, atualize os caminhos nos arquivos TypeScript correspondentes.

---

## 📸 Estrutura de Diretórios

### 1. `/spreads` - Imagens de Fundo das Tiradas
**Uso:** Background das 3 cartas de seleção de spreads na home.

**Arquivos esperados:**
- `three_card.jpg` - Three Card Spread
- `celtic_cross.jpg` - Celtic Cross Spread
- `love_check.jpg` - Love & Relationship Spread

**Tamanho recomendado:** 800x600px ou maior
**Formato:** JPG, PNG ou WebP

**Como atualizar no código:**
Edite `App.tsx` (linhas ~381-383):
```tsx
const spreadImages: Record<string, string> = {
  'three_card': '/images/spreads/three_card.jpg',
  'celtic_cross': '/images/spreads/celtic_cross.jpg',
  'love_check': '/images/spreads/love_check.jpg',
};
```

---

### 2. `/products` - Imagens de Produtos
**Uso:** Fotos de produtos na loja (shop).

**Nomeação sugerida:**
- `product-1.jpg`, `product-1-2.jpg`, `product-1-3.jpg` (variações do produto 1)
- `product-2.jpg`, `product-2-2.jpg` (variações do produto 2)
- etc.

**Tamanho recomendado:** 500x500px ou maior
**Formato:** JPG, PNG ou WebP

**Como atualizar no código:**
Edite `data/products.ts`:
```tsx
{
  id: 'product-id-1',
  name: 'Product Name',
  images: [
    '/images/products/product-1.jpg',
    '/images/products/product-1-2.jpg',
    '/images/products/product-1-3.jpg'
  ],
  // ... outros dados
}
```

---

### 3. `/cards/major` - Cartas Maiores do Tarot
**Uso:** As 22 cartas maiores do tarot (0-21).

**Nomeação requerida:**
```
ar00.jpg (The Fool)
ar01.jpg (The Magician)
ar02.jpg (The High Priestess)
... até ...
ar21.jpg (The World)
```

**Tamanho recomendado:** 300x520px
**Formato:** JPG ou PNG

---

### 4. `/cards/minor` - Cartas Menores do Tarot
**Uso:** As 56 cartas menores do tarot (4 naipes x 14 ranks).

**Nomeação requerida:**
Siga o padrão: `{suit}{rank}.jpg`

**Naipes:**
- `w` = Wands (Paus)
- `c` = Cups (Copas)
- `s` = Swords (Espadas)
- `p` = Pentacles (Pentáculos)

**Ranks:**
```
a   = Ace (Ás)
2-10 = Number cards (2-10)
p   = Page (Valete)
n   = Knight (Cavalo)
q   = Queen (Rainha)
k   = King (Rei)
```

**Exemplos:**
```
wa.jpg, w2.jpg, w3.jpg, ... w10.jpg, wp.jpg, wn.jpg, wq.jpg, wk.jpg
ca.jpg, c2.jpg, c3.jpg, ... c10.jpg, cp.jpg, cn.jpg, cq.jpg, ck.jpg
sa.jpg, s2.jpg, s3.jpg, ... s10.jpg, sp.jpg, sn.jpg, sq.jpg, sk.jpg
pa.jpg, p2.jpg, p3.jpg, ... p10.jpg, pp.jpg, pn.jpg, pq.jpg, pk.jpg
```

**Total:** 56 arquivos

**Tamanho recomendado:** 300x520px
**Formato:** JPG ou PNG

---

## 🔄 Como Atualizar as URLs no Código

### Opção 1: Usar URLs Locais (Recomendado)
Após adicionar os arquivos em `/public/images`, atualize os caminhos:

```tsx
// Em constants.ts, função generateDeck()
const baseUrl = "/images/cards"; // URLs locais

// Construção automática dos caminhos
const fileIndex = index.toString().padStart(2, '0');
imageUrl: `${baseUrl}/major/ar${fileIndex}.jpg`
```

### Opção 2: Usar URLs Externas
Se preferir manter URLs externas:
```tsx
const baseUrl = "https://seu-servidor.com/cartas";
```

---

## ✅ Checklist de Upload

- [ ] Adicionar 3 imagens em `/spreads`
- [ ] Adicionar imagens de produtos em `/products`
- [ ] Adicionar 22 cartas maiores em `/cards/major`
- [ ] Adicionar 56 cartas menores em `/cards/minor`
- [ ] Atualizar `constants.ts` com novo `baseUrl`
- [ ] Atualizar `data/products.ts` com caminhos locais
- [ ] Atualizar `App.tsx` com caminhos dos spreads
- [ ] Testar no navegador
- [ ] Fazer commit e push

---

## 📝 Notas Importantes

1. **Nomeação de Arquivos:** Use exatamente os nomes especificados acima
2. **Formato:** Recomenda-se JPG para melhor compressão ou WebP para qualidade superior
3. **Otimização:** Comprima as imagens antes de fazer upload (use ferramentas como TinyPNG)
4. **Responsive:** Certifique-se que as imagens funcionam em móvel, tablet e desktop

---

## 🚀 Próximos Passos

1. Copie os arquivos de imagem para as respectivas pastas
2. Atualize os caminhos no código conforme instruído acima
3. Execute `npm run dev` para testar localmente
4. Faça commit e push das mudanças
