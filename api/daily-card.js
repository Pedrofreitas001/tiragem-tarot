// Vercel Serverless Function - /api/daily-card

// Cache em memória
const dailyCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

const BASE_SYSTEM_PROMPT = `Você é tarólogo experiente. Regras:
- Tom: simbólico, calmo, direto
- Sem explicar o que é tarot
- Sem significados óbvios
- Sem emojis ou listas
- Sem mencionar IA/sistema
- Linguagem elegante e simples
- Respostas práticas e personalizadas
- Máximo 3 parágrafos`;

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
        const { card, isPortuguese } = req.body;
        const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: 'API não configurada' });
        }

        if (!card?.name) {
            return res.status(400).json({ error: 'Carta inválida' });
        }

        const lang = isPortuguese ? 'português' : 'English';
        const today = new Date().toISOString().split('T')[0];

        // Cache por dia + carta + idioma
        const cacheKey = `daily_${card.name}_${today}_${lang}`;
        if (dailyCache.has(cacheKey)) {
            const cached = dailyCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log('📦 Cache hit (daily)!');
                return res.json({ text: cached.data });
            }
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

            // Cache por 24h
            dailyCache.set(cacheKey, { data: text, timestamp: Date.now() });

            return res.json({ text });
        }

        return res.status(500).json(data?.error || { error: 'Falha ao gerar mensagem' });

    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
