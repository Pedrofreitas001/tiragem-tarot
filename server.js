import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = 3001;

// Security: Rate limiting simples em memória
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 10; // 10 requests por minuto

// Cache de leituras para economia de tokens
const readingsCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Limpar cache expirado a cada hora
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of readingsCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            readingsCache.delete(key);
        }
    }
    // Limpar rate limit também
    for (const [ip, data] of rateLimitMap.entries()) {
        if (now - data.windowStart > RATE_LIMIT_WINDOW) {
            rateLimitMap.delete(ip);
        }
    }
}, 3600000);

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limitar tamanho do body

// API Key from .env
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_KEY;

if (!GEMINI_KEY) {
    console.error('⚠️  GEMINI API KEY não configurada! Adicione GEMINI_KEY ou VITE_GEMINI_API_KEY no .env');
}

// Rate limiting middleware
const checkRateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, windowStart: now });
        return next();
    }

    const data = rateLimitMap.get(ip);
    if (now - data.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, windowStart: now });
        return next();
    }

    if (data.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Muitas requisições. Aguarde um momento.' });
    }

    data.count++;
    next();
};

// Gerar hash para cache
const generateCacheKey = (cards, spreadId, question) => {
    const data = cards.map(c => c.name).sort().join('|') + spreadId + (question || '').trim().toLowerCase();
    return crypto.createHash('md5').update(data).digest('hex');
};

// PROMPTS OTIMIZADOS POR TIPO DE JOGO
// Seguindo regras: máx 400-500 tokens de saída, 3 parágrafos, sem explicações de tarot
const SPREAD_PROMPTS = {
    // Três Cartas: Passado, Presente, Futuro
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

    // Cruz Celta: Leitura profunda
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

    // Amor e Relacionamento
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

    // Sim ou Não
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

    // Carta do Dia
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

// Prompt base otimizado (menos tokens)
const BASE_SYSTEM_PROMPT = `Você é tarólogo experiente. Regras:
- Tom: simbólico, calmo, direto
- Sem explicar o que é tarot
- Sem significados óbvios
- Sem emojis ou listas
- Sem mencionar IA/sistema
- Linguagem elegante e simples
- Respostas práticas e personalizadas
- Máximo 3 parágrafos`;

// Endpoint principal de tarot - OTIMIZADO
app.post('/api/tarot', checkRateLimit, async (req, res) => {
    try {
        const { session, isPortuguese } = req.body;

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
            console.log('📦 Cache hit!');
            return res.json({ text: readingsCache.get(cacheKey).data });
        }

        // Formatar cartas de forma concisa
        const cardListText = cards.map((card, idx) => {
            const isReversed = reversedIndices.includes(idx);
            const position = spread.positions?.[idx]?.name || `Posição ${idx + 1}`;
            const orientation = isReversed ? (isPortuguese ? 'Inv' : 'Rev') : '';
            return `${position}: ${card.name}${orientation ? ` (${orientation})` : ''}`;
        }).join(' | ');

        // Selecionar prompt específico do spread
        const spreadConfig = SPREAD_PROMPTS[spreadId] || SPREAD_PROMPTS.three_card;
        const contextPrompt = spreadConfig.context(cardListText, question, lang);

        const fullPrompt = `${BASE_SYSTEM_PROMPT}

${contextPrompt}

Responda em JSON válido.`;

        console.log(`📡 Gemini API - Spread: ${spreadId}, Cards: ${cards.length}`);

        // Tentar modelos em ordem de preferência
        const modelsToTry = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const body = {
                    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 600, // Reduzido para economia
                        responseMimeType: 'application/json',
                        responseSchema: spreadConfig.schema
                    }
                };

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    }
                );

                const data = await response.json();

                if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = data.candidates[0].content.parts[0].text;
                    console.log(`✅ Sucesso com ${modelName}`);

                    // Salvar no cache
                    readingsCache.set(cacheKey, { data: text, timestamp: Date.now() });

                    return res.json({ text });
                }

                if (response.status === 429) {
                    console.log(`⏳ Rate limited em ${modelName}, tentando próximo...`);
                    lastError = { error: 'Rate limited' };
                    continue;
                }

                lastError = data;
                if (response.status !== 404) break;

            } catch (err) {
                console.error(`❌ Erro com ${modelName}:`, err.message);
                lastError = { error: err.message };
            }
        }

        res.status(500).json(lastError || { error: 'Falha ao gerar leitura' });

    } catch (error) {
        console.error('❌ Erro do servidor:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Endpoint específico para Carta do Dia - ULTRA OTIMIZADO
app.post('/api/daily-card', checkRateLimit, async (req, res) => {
    try {
        const { card, isPortuguese } = req.body;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: 'API não configurada' });
        }

        if (!card?.name) {
            return res.status(400).json({ error: 'Carta inválida' });
        }

        const lang = isPortuguese ? 'português' : 'English';
        const today = new Date().toISOString().split('T')[0];

        // Cache por dia + carta
        const cacheKey = `daily_${card.name}_${today}_${lang}`;
        if (readingsCache.has(cacheKey)) {
            console.log('📦 Cache hit (daily)!');
            return res.json({ text: readingsCache.get(cacheKey).data });
        }

        const prompt = `${BASE_SYSTEM_PROMPT}

Carta do Dia: ${card.name}
Idioma: ${lang}

Crie uma mensagem inspiradora e prática para o dia. Responda em JSON válido.`;

        const schema = {
            type: "object",
            properties: {
                mensagem: { type: "string", description: "Mensagem do dia (máx 80 palavras)" },
                energia: { type: "string", description: "Energia do dia (3-5 palavras)" },
                foco: { type: "string", description: "Foco sugerido (máx 25 palavras)" },
                reflexao: { type: "string", description: "Pergunta reflexiva (máx 15 palavras)" }
            },
            required: ["mensagem", "energia", "foco", "reflexao"]
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 400,
                        responseMimeType: 'application/json',
                        responseSchema: schema
                    }
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            console.log('✅ Carta do dia gerada');

            // Cache por 24h
            readingsCache.set(cacheKey, { data: text, timestamp: Date.now() });

            return res.json({ text });
        }

        res.status(500).json(data?.error || { error: 'Falha ao gerar mensagem' });

    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        geminiConfigured: !!GEMINI_KEY,
        cacheSize: readingsCache.size
    });
});

app.listen(port, () => {
    console.log(`🚀 Backend rodando em http://localhost:${port}`);
    console.log(`🔑 Gemini API: ${GEMINI_KEY ? 'Configurada' : 'NÃO CONFIGURADA'}`);
});
