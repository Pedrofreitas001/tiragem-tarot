/**
 * Script Auxiliar para Adicionar Traduções às Cartas
 * 
 * Como usar:
 * 1. Cole sua GEMINI_API_KEY abaixo
 * 2. Execute: node add-translations.js
 * 3. O script irá atualizar o arquivo tarotData.ts automaticamente
 */

const fs = require('fs');

// ========== CONFIGURAÇÃO ==========
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'SUA_CHAVE_AQUI';
const TAROT_FILE = './tarotData.ts';
const BATCH_SIZE = 5; // Traduzir 5 cartas por vez
const DELAY_MS = 2000; // Delay entre batches

// ========== FUNÇÕES ==========

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateWithGemini(texts) {
    const prompt = `Traduza os seguintes textos de cartas de Tarot do inglês para português brasileiro. 
Mantenha o tom místico e espiritual. Retorne apenas as traduções separadas por "###":

${texts.join('\n---\n')}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        const data = await response.json();
        const translated = data.candidates[0].content.parts[0].text;
        return translated.split('###').map(t => t.trim()).filter(Boolean);
    } catch (error) {
        console.error('Erro na tradução:', error.message);
        return texts; // Retorna originais em caso de erro
    }
}

function extractCardData(fileContent) {
    const cards = [];
    const cardRegex = /{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]*)"[\s\S]*?love:\s*"([^"]*)"[\s\S]*?career:\s*"([^"]*)"[\s\S]*?advice:\s*"([^"]*)"[\s\S]*?imageUrl:[^}]+}/g;

    let match;
    while ((match = cardRegex.exec(fileContent)) !== null) {
        cards.push({
            id: match[1],
            description: match[2],
            love: match[3],
            career: match[4],
            advice: match[5],
            fullMatch: match[0]
        });
    }

    return cards;
}

async function processTranslations() {
    console.log('🔮 Iniciando processo de tradução...\n');

    if (!fs.existsSync(TAROT_FILE)) {
        console.error('❌ Arquivo tarotData.ts não encontrado!');
        return;
    }

    let fileContent = fs.readFileSync(TAROT_FILE, 'utf-8');
    const cards = extractCardData(fileContent);

    console.log(`📊 Encontradas ${cards.length} cartas para processar\n`);

    // Primeiro, atualizar a interface
    const interfaceUpdate = `export interface TarotCardData {
  id: string;
  name: string;
  name_pt: string;
  slug: string;
  slug_pt: string;
  number: number;
  arcana: 'major' | 'minor';
  suit?: string;
  element?: string;
  keywords: string[];
  keywords_pt: string[];
  meaning_up: string;
  meaning_up_pt: string;
  meaning_rev: string;
  meaning_rev_pt: string;
  description: string;
  description_pt: string;
  love: string;
  love_pt: string;
  career: string;
  career_pt: string;
  advice: string;
  advice_pt: string;
  imageUrl: string;
}`;

    fileContent = fileContent.replace(
        /export interface TarotCardData \{[\s\S]*?\}/,
        interfaceUpdate
    );

    console.log('✅ Interface atualizada\n');

    // Processar em batches
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
        const batch = cards.slice(i, i + BATCH_SIZE);
        console.log(`⚡ Processando batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(cards.length / BATCH_SIZE)}...`);

        for (const card of batch) {
            // Para cada campo, adicionar versão _pt
            const fieldsToAdd = [
                { field: 'description', text: card.description },
                { field: 'love', text: card.love },
                { field: 'career', text: card.career },
                { field: 'advice', text: card.advice }
            ];

            for (const { field, text } of fieldsToAdd) {
                if (text && !card.fullMatch.includes(`${field}_pt:`)) {
                    const translated = await translateWithGemini([text]);
                    const translatedText = translated[0] || text;

                    // Adicionar campo traduzido após o campo original
                    const fieldRegex = new RegExp(`(${field}:\\s*"[^"]*")`, 'g');
                    const replacement = `$1,\n    ${field}_pt: "${translatedText.replace(/"/g, '\\"')}"`;

                    fileContent = fileContent.replace(fieldRegex, replacement);

                    console.log(`  ✓ ${card.id}: ${field}_pt adicionado`);
                    await delay(500); // Pequeno delay entre campos
                }
            }
        }

        if (i + BATCH_SIZE < cards.length) {
            console.log(`⏳ Aguardando ${DELAY_MS}ms antes do próximo batch...\n`);
            await delay(DELAY_MS);
        }
    }

    // Salvar arquivo atualizado
    fs.writeFileSync(TAROT_FILE, fileContent, 'utf-8');

    console.log('\n✨ Processo concluído!');
    console.log('📝 Arquivo tarotData.ts atualizado com traduções\n');
}

// ========== EXECUÇÃO ==========

if (GEMINI_API_KEY === 'SUA_CHAVE_AQUI') {
    console.log('⚠️  ATENÇÃO: Configure sua GEMINI_API_KEY primeiro!\n');
    console.log('Opções:');
    console.log('1. Edite o arquivo e adicione a chave');
    console.log('2. Ou execute: GEMINI_API_KEY=sua_chave node add-translations.js\n');
} else {
    processTranslations().catch(console.error);
}
