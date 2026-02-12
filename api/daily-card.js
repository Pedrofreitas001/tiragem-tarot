// Vercel Serverless Function - /api/daily-card

// Cache em memória
const dailyCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

const BASE_SYSTEM_PROMPT = `Você é um tarólogo experiente especializado em energias coletivas. 

MISSÃO: Canalizar a energia coletiva do dia através da carta sorteada, oferecendo insights profundos sobre as vibrações universais que afetam toda a humanidade neste dia.

ABORDAGEM:
- Focque na energia COLETIVA, não individual
- Conecte a carta com as tendências universais do dia
- Tom místico, elevado, mas prático
- Linguagem poética sem ser rebuscada
- Sem clichês ou obviedades
- Sem mencionar IA/sistema
- Máximo 3 parágrafos por campo
- IMPORTANTE: Use SEMPRE o nome da carta no idioma solicitado. NUNCA mencione nomes de cartas em inglês quando o idioma for português (ex: use "Ás de Copas" e não "Ace of Cups")

PERSPECTIVA: Esta carta representa as energias que permeiam o universo hoje, influenciando toda a humanidade de forma sutil mas poderosa.`;

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

        // Determinar nome da carta no idioma correto
        const cardNameForPrompt = isPortuguese && card.name_pt ? card.name_pt : card.name;

        // Cache por dia + carta + idioma - LIMPAR CACHE PARA NOVOS CAMPOS
        const cacheKey = `daily_v3_${card.name}_${today}_${lang}`;
        if (dailyCache.has(cacheKey)) {
            const cached = dailyCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log('📦 Cache hit (daily)!');
                return res.json({ text: cached.data });
            }
        }

        const prompt = `${BASE_SYSTEM_PROMPT}

CARTA DO DIA: ${cardNameForPrompt}
IDIOMA: ${lang}
DATA: ${today}

Como tarólogo conectado às energias universais, canalize a energia coletiva que ${cardNameForPrompt} traz para toda a humanidade hoje.

Crie uma interpretação completa focada na ENERGIA COLETIVA do dia. 

IMPORTANTE: Forneça TODOS os 10 campos solicitados no JSON. Cada campo deve ter conteúdo significativo e único.

REGRA CRÍTICA: Cada campo DEVE conter uma mensagem COMPLETA e coerente. NUNCA gere textos que precisem ser cortados. Respeite rigorosamente os limites de caracteres definidos no schema. Cada frase deve fazer sentido por si só, sem necessidade de continuação.

Responda EXCLUSIVAMENTE em JSON válido com todos os campos obrigatórios preenchidos.`;

        const schema = {
            type: "object",
            properties: {
                mensagem_coletiva: {
                    type: "string",
                    description: "Mensagem poética sobre a energia coletiva do dia (máx 100 palavras)"
                },
                vibração_universal: {
                    type: "string",
                    description: "A vibração que permeia o universo hoje (MÁXIMO 5 palavras, seja conciso)"
                },
                consciência_coletiva: {
                    type: "string",
                    description: "Como a humanidade deve direcionir sua consciência hoje (máx 45 palavras)"
                },
                movimento_planetário: {
                    type: "string",
                    description: "A energia cósmica em movimento no planeta hoje (máx 40 palavras)"
                },
                chamado_universal: {
                    type: "string",
                    description: "O chamado sagrado que o universo faz à humanidade hoje (máx 35 palavras)"
                },
                reflexão_coletiva: {
                    type: "string",
                    description: "Pergunta profunda para reflexão coletiva da humanidade (máx 25 palavras)"
                },
                energia_emocional: {
                    type: "string",
                    description: "A energia emocional predominante no coletivo hoje. IMPORTANTE: máximo 100 caracteres. Deve ser uma frase completa e coerente que caiba neste limite sem cortes."
                },
                significado_carta: {
                    type: "string",
                    description: "Breve descrição objetiva do que esta carta representa e simboliza, sua essência e energia. IMPORTANTE: máximo 120 caracteres. Deve ser uma frase completa e coerente que caiba neste limite sem cortes."
                },
                portal_transformação: {
                    type: "string",
                    description: "Oportunidade de transformação disponível para todos hoje (máx 30 palavras)"
                },
                mantra_diário: {
                    type: "string",
                    description: "Uma afirmação ou mantra curto para sintonizar com a energia do dia. IMPORTANTE: máximo 60 caracteres. Deve ser uma frase completa e impactante."
                }
            },
            required: ["mensagem_coletiva", "vibração_universal", "consciência_coletiva", "movimento_planetário", "chamado_universal", "reflexão_coletiva", "energia_emocional", "significado_carta", "portal_transformação", "mantra_diário"]
        };

        console.log('📡 Fazendo chamada para Gemini...', {
            carta: card.name,
            idioma: lang,
            temChave: !!GEMINI_KEY
        });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 600,
                        responseMimeType: 'application/json',
                        responseSchema: schema
                    }
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            console.log('✅ Resposta da IA:', text);

            // Tentar parsear para validar se todos os campos estão presentes
            try {
                const parsed = JSON.parse(text);
                console.log('📊 Campos retornados:', Object.keys(parsed));

                // Validar se todos os campos obrigatórios estão presentes
                const requiredFields = [
                    'mensagem_coletiva', 'vibração_universal', 'consciência_coletiva',
                    'movimento_planetário', 'chamado_universal', 'reflexão_coletiva',
                    'energia_emocional', 'significado_carta', 'portal_transformação', 'mantra_diário'
                ];

                const missingFields = requiredFields.filter(field => !parsed[field]);
                if (missingFields.length > 0) {
                    console.warn('⚠️ Campos ausentes:', missingFields);
                }
            } catch (parseError) {
                console.error('❌ Erro ao parsear resposta:', parseError);
            }

            // Cache por 24h com nova versão
            dailyCache.set(cacheKey, { data: text, timestamp: Date.now() });

            return res.json({ text });
        }

        console.error('❌ Resposta inválida da API:', data);
        return res.status(500).json(data?.error || { error: 'Falha ao gerar mensagem' });

    } catch (error) {
        console.error('❌ Erro detalhado:', {
            message: error.message,
            stack: error.stack,
            card: card?.name,
            lang,
            hasGeminiKey: !!GEMINI_KEY
        });
        return res.status(500).json({
            error: 'Erro interno',
            details: error.message
        });
    }
}
