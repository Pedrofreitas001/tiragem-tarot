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

## ✅ Checklist de Upload

- [ ] Adicionar 3 imagens em `/spreads`
- [ ] Adicionar imagens de produtos em `/products`
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
5. **Imagens do Tarot:** As cartas do tarot continuam sendo puxadas do servidor externo (sacred-texts.com) e NÃO precisam ser adicionadas aqui.

---

## 🚀 Próximos Passos

1. Copie os arquivos de imagem para as respectivas pastas
2. Atualize os caminhos no código conforme instruído acima
3. Execute `npm run dev` para testar localmente
4. Faça commit e push das mudanças

