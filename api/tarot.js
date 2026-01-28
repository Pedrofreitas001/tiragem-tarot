// Vercel Serverless Function - /api/tarot
import crypto from 'crypto';

// Cache em memória (compartilhado entre invocações na mesma instância)
const readingsCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// PROMPTS OTIMIZADOS POR TIPO DE JOGO
const SPREAD_PROMPTS = {
    three_card: {
        context: (cards, question, lang) => `
Leitura: Três Cartas (Passado-Presente-Futuro)
Cartas: ${cards}
${question ? `Pergunta: "${question}"` : 'Orientação geral'}
Idioma: ${lang}

Interprete integrando as três posições temporais. Seja direto e prático.`,
        schema: {
            type: "object",
            properties: {
                sintese: { type: "string", description: "Narrativa fluida conectando passado-presente-futuro (máx 100 palavras)" },
                tema_central: { type: "string", description: "Essência da leitura (5-10 palavras)" },
                conselho: { type: "string", description: "Orientação prática e aplicável (máx 40 palavras)" },
                reflexao: { type: "string", description: "Fechamento curto (máx 20 palavras)" }
            },
            required: ["sintese", "tema_central", "conselho", "reflexao"]
        }
    },
    celtic_cross: {
        context: (cards, question, lang) => `
Leitura: Cruz Celta (10 posições)
Cartas: ${cards}
${question ? `Pergunta: "${question}"` : 'Orientação profunda'}
Idioma: ${lang}

Sintetize as 10 cartas em narrativa coesa. Foque no resultado e conselho prático.`,
        schema: {
            type: "object",
            properties: {
                sintese: { type: "string", description: "Síntese integrando todas as cartas (máx 120 palavras)" },
                tema_central: { type: "string", description: "Tema dominante (5-10 palavras)" },
                desafio_principal: { type: "string", description: "O maior obstáculo identificado (máx 25 palavras)" },
                conselho: { type: "string", description: "Orientação clara (máx 50 palavras)" },
                reflexao: { type: "string", description: "Fechamento (máx 20 palavras)" }
            },
            required: ["sintese", "tema_central", "desafio_principal", "conselho", "reflexao"]
        }
    },
    love_check: {
        context: (cards, question, lang) => `
Leitura: Amor e Relacionamento (5 cartas)
Cartas: ${cards}
${question ? `Pergunta: "${question}"` : 'Dinâmica do relacionamento'}
Idioma: ${lang}

Analise a dinâmica entre as partes. Seja sensível mas direto.`,
        schema: {
            type: "object",
            properties: {
                sintese: { type: "string", description: "Análise da dinâmica relacional (máx 100 palavras)" },
                tema_central: { type: "string", description: "Estado do relacionamento (5-10 palavras)" },
                ponto_atencao: { type: "string", description: "O que precisa de cuidado (máx 30 palavras)" },
                conselho: { type: "string", description: "Como fortalecer a conexão (máx 40 palavras)" },
                reflexao: { type: "string", description: "Fechamento (máx 20 palavras)" }
            },
            required: ["sintese", "tema_central", "ponto_atencao", "conselho", "reflexao"]
        }
    },
    yes_no: {
        context: (cards, question, lang) => `
Leitura: Sim ou Não (1 carta)
Carta: ${cards}
Pergunta: "${question || 'A resposta que busco'}"
Idioma: ${lang}

Responda de forma direta. Indique tendência (sim/não/talvez) baseado na carta.`,
        schema: {
            type: "object",
            properties: {
                resposta: { type: "string", enum: ["sim", "nao", "talvez"], description: "Tendência da resposta" },
                explicacao: { type: "string", description: "Por que a carta indica isso (máx 60 palavras)" },
                condicao: { type: "string", description: "Condição ou ressalva importante (máx 30 palavras)" },
                reflexao: { type: "string", description: "Fechamento (máx 15 palavras)" }
            },
            required: ["resposta", "explicacao", "condicao", "reflexao"]
        }
    },
    card_of_day: {
        context: (cards, question, lang) => `
Leitura: Carta do Dia
Carta: ${cards}
Idioma: ${lang}

Interprete para o dia de hoje. Seja inspirador mas prático.`,
        schema: {
            type: "object",
            properties: {
                mensagem: { type: "string", description: "Mensagem do dia integrando a carta (máx 80 palavras)" },
                energia: { type: "string", description: "Energia predominante (3-5 palavras)" },
                foco: { type: "string", description: "No que focar hoje (máx 25 palavras)" },
                reflexao: { type: "string", description: "Pergunta para meditar (máx 15 palavras)" }
            },
            required: ["mensagem", "energia", "foco", "reflexao"]
        }
    }
};

const BASE_SYSTEM_PROMPT = `Você é tarólogo experiente. Regras:
- Tom: simbólico, calmo, direto
- Sem explicar o que é tarot
- Sem significados óbvios
- Sem emojis ou listas
- Sem mencionar IA/sistema
- Linguagem elegante e simples
- Respostas práticas e personalizadas
- Máximo 3 parágrafos`;

const generateCacheKey = (cards, spreadId, question) => {
    const data = cards.map(c => c.name).sort().join('|') + spreadId + (question || '').trim().toLowerCase();
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
        const { session, isPortuguese } = req.body;
        const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: 'API não configurada' });
        }

        if (!session?.cards || !session?.spread) {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        const { spread, cards, question, reversedIndices = [] } = session;
        const spreadId = spread.id || 'three_card';
        const lang = isPortuguese ? 'português' : 'English';

        // Verificar cache
        const cacheKey = generateCacheKey(cards, spreadId, question);
        if (readingsCache.has(cacheKey)) {
            const cached = readingsCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log('📦 Cache hit!');
                return res.json({ text: cached.data });
            }
        }

        // Formatar cartas
        const cardListText = cards.map((card, idx) => {
            const isReversed = reversedIndices.includes(idx);
            const position = spread.positions?.[idx]?.name || `Posição ${idx + 1}`;
            const orientation = isReversed ? (isPortuguese ? 'Inv' : 'Rev') : '';
            return `${position}: ${card.name}${orientation ? ` (${orientation})` : ''}`;
        }).join(' | ');

        const spreadConfig = SPREAD_PROMPTS[spreadId] || SPREAD_PROMPTS.three_card;
        const contextPrompt = spreadConfig.context(cardListText, question, lang);

        const fullPrompt = `${BASE_SYSTEM_PROMPT}\n\n${contextPrompt}\n\nResponda em JSON válido.`;

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
                        maxOutputTokens: 600,
                        responseMimeType: 'application/json',
                        responseSchema: spreadConfig.schema
                    }
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;

            // Salvar no cache
            readingsCache.set(cacheKey, { data: text, timestamp: Date.now() });

            return res.json({ text });
        }

        return res.status(500).json(data?.error || { error: 'Falha ao gerar leitura' });

    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
