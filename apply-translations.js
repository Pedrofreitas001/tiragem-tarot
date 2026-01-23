// Script para gerar traduções das cartas usando traduções manuais otimizadas
const fs = require('fs');

// Traduções prontas para os campos mais comuns
const translations = {
    // Descrições comuns
    "A young man": "Um jovem",
    "A figure": "Uma figura",
    "A woman": "Uma mulher",
    "A man": "Um homem",
    "stands at the edge": "está à beira",
    "sits on": "senta-se em",
    "holds": "segura",
    "represents": "representa",
    "symbolizing": "simbolizando",

    // Amor
    "A new romance is on the horizon": "Um novo romance está no horizonte",
    "Be open to unexpected connections": "Esteja aberto a conexões inesperadas",
    "If in a relationship": "Se estiver em um relacionamento",
    "bring back spontaneity": "traga de volta a espontaneidade",

    // Carreira
    "Time for a new career": "Hora de uma nova carreira",
    "Don't overthink": "Não pense demais",
    "trust your instincts": "confie em seus instintos",

    // Conselho
    "Embrace the unknown": "Abrace o desconhecido",
    "with an open heart": "com um coração aberto",
    "Sometimes the best": "Às vezes o melhor"
};

// Traduções completas para cada carta (exemplos)
const cardTranslations = {
    "maj_0": {
        description_pt: "Um jovem está à beira de um penhasco, prestes a dar um passo no desconhecido. Ele carrega uma pequena bolsa e uma rosa branca, simbolizando pureza. Um pequeno cão aos seus pés representa lealdade e proteção.",
        love_pt: "Um novo romance está no horizonte. Esteja aberto a conexões inesperadas. Se estiver em um relacionamento, traga de volta espontaneidade e aventura.",
        career_pt: "Hora de um novo caminho na carreira ou projeto. Não pense demais - confie em seus instintos e dê o salto.",
        advice_pt: "Abrace o desconhecido com um coração aberto. Às vezes as melhores aventuras começam com um único passo na incerteza."
    },
    "maj_1": {
        description_pt: "Uma figura está de pé com uma mão apontando para o céu e outra para a terra, canalizando energia divina. Em sua mesa estão os símbolos de todos os quatro naipes - representando domínio sobre todos os elementos.",
        love_pt: "Tome a iniciativa no amor. Você tem o charme e a habilidade de atrair o que deseja. Seja autêntico.",
        career_pt: "Você tem tudo o que precisa para o sucesso. Use suas habilidades e força de vontade para alcançar seus objetivos. Grande potencial pela frente.",
        advice_pt: "Você tem os recursos que precisa. Canalize sua energia e aja agora com confiança."
    }
    // Continue para todas as 78 cartas...
};

async function addTranslationsToFile() {
    console.log('🔮 Adicionando traduções às cartas...\n');

    let content = fs.readFileSync('./tarotData.ts', 'utf-8');

    // Atualizar interface
    if (!content.includes('description_pt:')) {
        content = content.replace(
            /description: string;/,
            'description: string;\n  description_pt: string;'
        );
        content = content.replace(
            /love: string;/,
            'love: string;\n  love_pt: string;'
        );
        content = content.replace(
            /career: string;/,
            'career: string;\n  career_pt: string;'
        );
        content = content.replace(
            /advice: string;/,
            'advice: string;\n  advice_pt: string;'
        );
        console.log('✅ Interface atualizada\n');
    }

    // Adicionar traduções para cada carta
    for (const [cardId, trans] of Object.entries(cardTranslations)) {
        const cardRegex = new RegExp(
            `(id: "${cardId}"[\\s\\S]*?description: "([^"]*)")([\\s\\S]*?)(love: "([^"]*)")([\\s\\S]*?)(career: "([^"]*)")([\\s\\S]*?)(advice: "([^"]*)")`,
            'g'
        );

        content = content.replace(cardRegex, (match) => {
            let updated = match;
            if (!updated.includes('description_pt:')) {
                updated = updated.replace(
                    /(description: "[^"]*")/,
                    `$1,\n    description_pt: "${trans.description_pt}"`
                );
            }
            if (!updated.includes('love_pt:')) {
                updated = updated.replace(
                    /(love: "[^"]*")/,
                    `$1,\n    love_pt: "${trans.love_pt}"`
                );
            }
            if (!updated.includes('career_pt:')) {
                updated = updated.replace(
                    /(career: "[^"]*")/,
                    `$1,\n    career_pt: "${trans.career_pt}"`
                );
            }
            if (!updated.includes('advice_pt:')) {
                updated = updated.replace(
                    /(advice: "[^"]*")/,
                    `$1,\n    advice_pt: "${trans.advice_pt}"`
                );
            }
            return updated;
        });

        console.log(`✅ Carta ${cardId} traduzida`);
    }

    fs.writeFileSync('./tarotData.ts', content, 'utf-8');
    console.log('\n✨ Traduções adicionadas com sucesso!');
}

addTranslationsToFile().catch(console.error);
