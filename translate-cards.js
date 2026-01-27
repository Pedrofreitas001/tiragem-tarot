// Script para traduzir campos das cartas do Tarot usando API de tradução
const fs = require('fs');
const https = require('https');

// Função para traduzir texto usando LibreTranslate (API gratuita)
async function translateText(text, sourceLang = 'en', targetLang = 'pt') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
        });

        const options = {
            hostname: 'libretranslate.de',
            port: 443,
            path: '/translate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result.translatedText);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Função auxiliar para delay entre requisições
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Ler o arquivo tarotData.ts
async function translateCards() {
    console.log('🔮 Iniciando tradução das cartas do Tarot...\n');

    const fileContent = fs.readFileSync('./tarotData.ts', 'utf-8');

    // Extrair todas as cartas usando regex
    const cardPattern = /{\s*id:\s*"([^"]+)",[\s\S]*?imageUrl:[^\}]+\}/g;
    let match;
    const cards = [];

    while ((match = cardPattern.exec(fileContent)) !== null) {
        cards.push(match[0]);
    }

    console.log(`📊 Encontradas ${cards.length} cartas para processar\n`);

    const translations = {};
    let processedCount = 0;

    for (const cardText of cards) {
        // Extrair campos
        const idMatch = cardText.match(/id:\s*"([^"]+)"/);
        const nameMatch = cardText.match(/name:\s*"([^"]+)"/);
        const descMatch = cardText.match(/description:\s*"([^"]+)"/);
        const loveMatch = cardText.match(/love:\s*"([^"]+)"/);
        const careerMatch = cardText.match(/career:\s*"([^"]+)"/);
        const adviceMatch = cardText.match(/advice:\s*"([^"]+)"/);

        if (idMatch) {
            const id = idMatch[1];
            const name = nameMatch ? nameMatch[1] : '';

            console.log(`⚡ Traduzindo: ${name} (${id})...`);

            try {
                const description = descMatch ? descMatch[1] : '';
                const love = loveMatch ? loveMatch[1] : '';
                const career = careerMatch ? careerMatch[1] : '';
                const advice = adviceMatch ? adviceMatch[1] : '';

                // Traduzir cada campo
                const description_pt = description ? await translateText(description) : '';
                await delay(1000); // Delay entre requests para não sobrecarregar a API

                const love_pt = love ? await translateText(love) : '';
                await delay(1000);

                const career_pt = career ? await translateText(career) : '';
                await delay(1000);

                const advice_pt = advice ? await translateText(advice) : '';
                await delay(1000);

                translations[id] = {
                    description_pt,
                    love_pt,
                    career_pt,
                    advice_pt
                };

                processedCount++;
                console.log(`✅ Concluído: ${processedCount}/${cards.length}\n`);

            } catch (error) {
                console.error(`❌ Erro ao traduzir ${name}:`, error.message);
            }
        }
    }

    // Salvar traduções em arquivo JSON
    fs.writeFileSync(
        './translations.json',
        JSON.stringify(translations, null, 2),
        'utf-8'
    );

    console.log('\n✨ Traduções salvas em translations.json');
    console.log(`📝 Total processado: ${processedCount} cartas`);
}

// Executar
translateCards().catch(console.error);
