# Scripts de Tradução das Cartas de Tarot

Este diretório contém scripts auxiliares para traduzir os campos das cartas que ainda estão apenas em inglês.

## 📋 Campos que serão traduzidos

- `description` → `description_pt`
- `love` → `love_pt`
- `career` → `career_pt`
- `advice` → `advice_pt`

## 🚀 Como usar

### Opção 1: Usando Gemini AI (Recomendado)

```bash
# 1. Configure sua API Key do Gemini
export GEMINI_API_KEY="sua-chave-aqui"

# 2. Execute o script
node add-translations.js
```

### Opção 2: Usando LibreTranslate (Grátis)

```bash
# Execute o script (usa API pública gratuita)
node translate-cards.js
```

## ⚙️ Configuração da API Key do Gemini

1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma nova API Key
3. Configure no terminal:
   ```bash
   export GEMINI_API_KEY="sua-chave-aqui"
   ```

Ou edite diretamente o arquivo `add-translations.js` na linha:
```javascript
const GEMINI_API_KEY = 'SUA_CHAVE_AQUI';
```

## 📊 O que os scripts fazem

1. **Leem** o arquivo `tarotData.ts`
2. **Identificam** cartas sem traduções nos campos description, love, career, advice
3. **Traduzem** usando API (Gemini ou LibreTranslate)
4. **Atualizam** a interface TypeScript para incluir campos `_pt`
5. **Salvam** as mudanças automaticamente

## 🎯 Vantagens

- ✅ Tradução automática de 78 cartas
- ✅ Mantém tom místico e espiritual
- ✅ Atualiza TypeScript automaticamente
- ✅ Processa em batches para não sobrecarregar APIs
- ✅ Adiciona delays entre requisições

## 📝 Exemplo de saída

```typescript
{
  id: "maj_0",
  name: "The Fool",
  name_pt: "O Louco",
  description: "A young man stands at the edge of a cliff...",
  description_pt: "Um jovem está à beira de um penhasco...",
  love: "A new romance is on the horizon...",
  love_pt: "Um novo romance está no horizonte...",
  career: "Time for a new career path...",
  career_pt: "Hora de um novo caminho na carreira...",
  advice: "Embrace the unknown...",
  advice_pt: "Abrace o desconhecido...",
  // ...
}
```

## ⚠️ Observações

- O script `add-translations.js` processa ~5 cartas por vez
- Delay de 2 segundos entre batches
- Total de ~78 cartas = ~3-5 minutos de processamento
- Backup do arquivo original é recomendado antes de executar

## 🛠️ Troubleshooting

**Erro de API Key:**
```
Verifique se a chave está correta e tem permissões
```

**Erro de Rate Limit:**
```
Aumente o DELAY_MS no script para 3000-5000ms
```

**Traduções incompletas:**
```
Execute novamente - o script pula cartas já traduzidas
```
