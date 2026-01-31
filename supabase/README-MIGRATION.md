# Como Aplicar a Migration do viewed_at

## Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://app.supabase.com
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"

3. **Execute a Migration**
   - Clique em "New Query"
   - Copie todo o conteúdo do arquivo `add-viewed-at.sql`
   - Cole no editor
   - Clique em "Run" ou pressione Ctrl+Enter

4. **Verifique se funcionou**
   - Vá em "Table Editor"
   - Selecione a tabela `readings`
   - Você deve ver uma nova coluna `viewed_at` do tipo `timestamptz`

## O que foi adicionado:

- **Campo `viewed_at`**: Registra quando uma leitura foi visualizada pela primeira vez
- **Índice**: Melhora a performance das queries que filtram por visualização
- **Comentário**: Documentação no próprio banco de dados

## Como funciona:

Agora quando o usuário clica para ver uma leitura:
1. A leitura abre normalmente
2. Se `viewed_at` é NULL (não visualizada), o sistema atualiza com a data/hora atual
3. O badge "Nova" só aparece se `viewed_at` é NULL
4. Isso é persistido no banco de dados, não mais no localStorage
