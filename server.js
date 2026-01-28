import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// API Key from .env
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_KEY;

// Debug: List available models on startup
const listModels = async () => {
    if (!GEMINI_KEY) return;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
        const data = await response.json();
        console.log('📜 Available Gemini Models:');
        if (data.models) {
            data.models.forEach(m => console.log(`  - ${m.name.split('/').pop()} (${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log('  No models found in response:', data);
        }
    } catch (err) {
        console.error('❌ Failed to list models:', err.message);
    }
};

listModels();

app.post('/api/tarot', async (req, res) => {
    try {
        const { session, isPortuguese } = req.body;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured on server' });
        }

        if (!session || !session.cards || !session.spread) {
            return res.status(400).json({ error: 'Invalid session data' });
        }

        const { spread, cards, question, reversedIndices } = session;

        // Construct the prompt on the backend
        const cardListText = cards.map((card, idx) => {
            const isReversed = reversedIndices.includes(idx);
            const position = spread.positions[idx];
            const orientation = isReversed
                ? (isPortuguese ? 'Invertida' : 'Reversed')
                : (isPortuguese ? 'Normal' : 'Upright');
            return `- Posição ${idx + 1} (${position.name}): ${card.name} (${orientation}) - Contexto: ${position.description}`;
        }).join('\n');

        const language = isPortuguese ? 'português brasileiro' : 'English';
        const hasQuestion = question && question.trim().length > 0;

        const prompt = `
Você é um tarólogo experiente, sábio e acolhedor.Sua missão é interpretar esta tiragem de Tarot de forma DIRETA, OBJETIVA e harmoniosa.Evite prolixidade e vá direto ao ponto.

═══════════════════════════════════════
CONTEXTO DA LEITURA
═══════════════════════════════════════
• Tipo de Tiragem: ${spread.name}
• Idioma: ${language}
${hasQuestion ? `• PERGUNTA DO CONSULENTE: "${question}"` : '• Orientação geral (sem pergunta específica)'}

═══════════════════════════════════════
CARTAS REVELADAS
═══════════════════════════════════════
${cardListText}

═══════════════════════════════════════
DIRETRIZES DE INTERPRETAÇÃO
═══════════════════════════════════════
        1. SÍNTESE: Crie uma narrativa fluida e CONCISA(máximo 120 palavras).
   - Conecte as cartas entre si de forma harmoniosa.
   - Seja direto sobre o que cada carta sugere na sua posição.
   - Evite repetições ou introduções longas.

2. TOM: Acolhedor, respeitoso e empoderador
            - NUNCA faça previsões absolutas("vai acontecer", "certamente")
                - Use linguagem de possibilidade("pode indicar", "sugere", "convida a refletir")
                    - Foque no autoconhecimento e nas escolhas do consulente

3. ESTRUTURA:
        - Tema central: uma frase que capture a essência da leitura
            - Conexões: como as cartas dialogam entre si
                - Elementos simbólicos: imagens e arquétipos que se destacam
                    - Pergunta reflexiva: uma pergunta poderosa para o consulente meditar

${hasQuestion ? `4. RESPOSTA À PERGUNTA:
   - Aborde diretamente a pergunta "${question}"
   - Mostre como as cartas iluminam essa questão específica
   - Ofereça perspectivas práticas baseadas nos símbolos revelados` : ''
            }

═══════════════════════════════════════
FORMATO DE RESPOSTA(JSON)
═══════════════════════════════════════
Retorne um objeto JSON válido com os campos solicitados.
`;

        // Formal Gemini Schema Object
        const responseSchema = {
            type: "object",
            properties: {
                sintese: {
                    type: "string",
                    description: "Síntese narrativa CONCISA e direta da leitura (80-120 palavras)."
                },
                tema_central: {
                    type: "string",
                    description: "O tema principal identificado na leitura (uma frase de 5-12 palavras)"
                },
                conexoes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 2-4 conexões significativas entre as cartas"
                },
                pergunta_reflexiva: {
                    type: "string",
                    description: "Uma pergunta poderosa para o consulente refletir"
                },
                energia_geral: {
                    type: "string",
                    enum: ["positiva", "neutra", "desafiadora"],
                    description: "Classificação da energia predominante"
                },
                elementos_destaque: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 símbolos ou arquétipos que se destacam na leitura"
                },
                ...(hasQuestion && {
                    resposta_pergunta: {
                        type: "string",
                        description: "Resposta DIRETA e OBJETIVA à pergunta do consulente (máximo 2 frases)."
                    }
                })
            },
            required: ["sintese", "tema_central", "conexoes", "pergunta_reflexiva", "energia_geral", "elementos_destaque", ...(hasQuestion ? ["resposta_pergunta"] : [])]
        };

        console.log('📡 Calling Gemini API (v1beta) from backend...');

        // Try multiple model names if one fails
        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`📝 Trying model: ${modelName} `);

                const body = {
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.75,
                        maxOutputTokens: 1500,
                        responseMimeType: 'application/json',
                    }
                };

                if (responseSchema && typeof responseSchema === 'object') {
                    body.generationConfig.responseSchema = responseSchema;
                }

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log(`✅ Success with ${modelName}`);
                        return res.json({ text });
                    }
                } else {
                    console.warn(`⚠️ Model ${modelName} failed:`, data.error?.message || response.statusText);
                    lastError = data;
                    if (response.status !== 404) break; // If it's not a 404, the error might be elsewhere
                }
            } catch (err) {
                console.error(`❌ Error with ${modelName}:`, err.message);
                lastError = err;
            }
        }

        res.status(lastError?.error?.code || 500).json(lastError);
    } catch (error) {
        console.error('❌ Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Backend server running at http://localhost:${port}`);
});
