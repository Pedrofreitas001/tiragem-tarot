// Vercel Serverless Function - /api/physical-reading
// Interpreta tiragens físicas de tarot feitas pelo usuário (Premium only)

import crypto from 'crypto';
import { requirePremium } from './_lib/auth.js';

// Cache em memória
const readingsCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Configuração de spreads físicos
const PHYSICAL_SPREAD_CONFIG = {
    yes_no: {
        name: 'Sim ou Não',
        name_en: 'Yes or No',
        cardCount: 1,
        positions: ['Resposta'],
        positions_en: ['Answer']
    },
    three_card: {
        name: 'Três Cartas',
        name_en: 'Three Cards',
        cardCount: 3,
        positions: ['Passado', 'Presente', 'Futuro'],
        positions_en: ['Past', 'Present', 'Future']
    },
    five_card: {
        name: 'Cruz Simples',
        name_en: 'Simple Cross',
        cardCount: 5,
        positions: ['Centro', 'Cruzamento', 'Passado', 'Futuro', 'Resultado'],
        positions_en: ['Center', 'Crossing', 'Past', 'Future', 'Outcome']
    },
    seven_card: {
        name: 'Sete Cartas',
        name_en: 'Seven Cards',
        cardCount: 7,
        positions: ['Passado', 'Presente', 'Futuro', 'Conselho', 'Ambiente', 'Esperanças', 'Resultado'],
        positions_en: ['Past', 'Present', 'Future', 'Advice', 'Environment', 'Hopes', 'Outcome']
    },
    celtic_cross: {
        name: 'Cruz Celta',
        name_en: 'Celtic Cross',
        cardCount: 10,
        positions: ['Significador', 'Cruzamento', 'Base', 'Passado', 'Coroa', 'Futuro', 'Eu', 'Ambiente', 'Esperanças/Medos', 'Resultado'],
        positions_en: ['Significator', 'Crossing', 'Foundation', 'Past', 'Crown', 'Future', 'Self', 'Environment', 'Hopes/Fears', 'Outcome']
    },
    custom: {
        name: 'Personalizado',
        name_en: 'Custom',
        cardCount: null, // Variável
        positions: null,
        positions_en: null
    }
};

const BASE_SYSTEM_PROMPT = `Você é um tarólogo experiente e respeitado. Regras:
- Tom: simbólico, profundo, direto e objetivo
- Sem floreios místicos exagerados
- Sem explicar o que é tarot
- Sem emojis ou listas numeradas
- Sem mencionar IA/sistema
- Linguagem elegante e acessível
- Respostas práticas e personalizadas
- Considere a ordem e posição de cada carta`;

const generateCacheKey = (cards, spreadType, question) => {
    const data = cards.join('|') + spreadType + (question || '').trim().toLowerCase();
    return crypto.createHash('md5').update(data).digest('hex');
};

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Server-side premium validation - prevents bypass via direct API call
        const auth = await requirePremium(req, res);
        if (!auth) return; // Response already sent by requirePremium

        const { spreadType, cards, question, isPortuguese = true } = req.body;
        const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: 'API não configurada' });
        }

        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ error: 'Cartas não fornecidas' });
        }

        if (!spreadType) {
            return res.status(400).json({ error: 'Tipo de jogada não fornecido' });
        }

        const lang = isPortuguese ? 'português' : 'English';
        const spreadConfig = PHYSICAL_SPREAD_CONFIG[spreadType] || PHYSICAL_SPREAD_CONFIG.custom;
        const spreadName = isPortuguese ? spreadConfig.name : spreadConfig.name_en;

        // Verificar cache
        const cacheKey = generateCacheKey(cards, spreadType, question);
        if (readingsCache.has(cacheKey)) {
            const cached = readingsCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log('📦 Cache hit!');
                return res.json({ interpretation: cached.data });
            }
        }

        // Formatar cartas com posições
        let cardListText;
        if (spreadConfig.positions) {
            const positions = isPortuguese ? spreadConfig.positions : spreadConfig.positions_en;
            cardListText = cards.map((card, idx) => {
                const position = positions[idx] || `Posição ${idx + 1}`;
                return `${position}: ${card}`;
            }).join('\n');
        } else {
            cardListText = cards.map((card, idx) => `Carta ${idx + 1}: ${card}`).join('\n');
        }

        // Construir prompt
        const contextPrompt = `
O usuário fez uma tiragem física de tarot e precisa de interpretação.

Tipo de jogada: ${spreadName} (${cards.length} cartas)
${question ? `Pergunta: "${question}"` : 'Orientação geral solicitada'}
Idioma da resposta: ${lang}

Cartas em ordem:
${cardListText}

Interprete essa tiragem de forma clara, objetiva e profunda.

Organize sua resposta EXATAMENTE neste formato JSON:
{
    "visao_geral": "Síntese geral da tiragem conectando todas as cartas (máx 100 palavras)",
    "cartas": [
        {
            "posicao": "Nome da posição",
            "carta": "Nome da carta",
            "interpretacao": "Significado desta carta nesta posição (máx 50 palavras)"
        }
    ],
    "sintese_final": "Conclusão prática e conselho aplicável (máx 80 palavras)",
    "tema_central": "Essência da leitura em 5-10 palavras"
}`;

        const fullPrompt = `${BASE_SYSTEM_PROMPT}\n\n${contextPrompt}\n\nResponda APENAS com JSON válido.`;

        // Chamar Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1200,
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: "object",
                            properties: {
                                visao_geral: { type: "string", description: "Síntese geral da tiragem" },
                                cartas: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            posicao: { type: "string" },
                                            carta: { type: "string" },
                                            interpretacao: { type: "string" }
                                        },
                                        required: ["posicao", "carta", "interpretacao"]
                                    }
                                },
                                sintese_final: { type: "string", description: "Conclusão prática" },
                                tema_central: { type: "string", description: "Essência da leitura" }
                            },
                            required: ["visao_geral", "cartas", "sintese_final", "tema_central"]
                        }
                    }
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;

            // Tentar parsear JSON
            let interpretation;
            try {
                interpretation = JSON.parse(text);
            } catch {
                // Se falhar, retornar texto como está
                interpretation = { raw: text };
            }

            // Salvar no cache
            readingsCache.set(cacheKey, { data: interpretation, timestamp: Date.now() });

            return res.json({ interpretation });
        }

        // Verificar rate limit
        if (response.status === 429) {
            return res.status(429).json({ error: 'Muitas requisições. Tente novamente em alguns segundos.' });
        }

        return res.status(500).json(data?.error || { error: 'Falha ao gerar interpretação' });

    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
