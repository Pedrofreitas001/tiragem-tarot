// Vercel Serverless Function - /api/tarot-signo

// Cache em memória
const signoCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

const ZODIAC_DATA = {
    aries: { nome: 'Áries', elemento: 'Fogo', regente: 'Marte', qualidade: 'Cardinal', energia: 'iniciativa, coragem, impulso' },
    touro: { nome: 'Touro', elemento: 'Terra', regente: 'Vênus', qualidade: 'Fixo', energia: 'estabilidade, sensorialidade, persistência' },
    gemeos: { nome: 'Gêmeos', elemento: 'Ar', regente: 'Mercúrio', qualidade: 'Mutável', energia: 'comunicação, versatilidade, curiosidade' },
    cancer: { nome: 'Câncer', elemento: 'Água', regente: 'Lua', qualidade: 'Cardinal', energia: 'emoção, proteção, nutrição' },
    leao: { nome: 'Leão', elemento: 'Fogo', regente: 'Sol', qualidade: 'Fixo', energia: 'expressão, criatividade, liderança' },
    virgem: { nome: 'Virgem', elemento: 'Terra', regente: 'Mercúrio', qualidade: 'Mutável', energia: 'análise, serviço, aperfeiçoamento' },
    libra: { nome: 'Libra', elemento: 'Ar', regente: 'Vênus', qualidade: 'Cardinal', energia: 'equilíbrio, harmonia, relacionamentos' },
    escorpiao: { nome: 'Escorpião', elemento: 'Água', regente: 'Plutão', qualidade: 'Fixo', energia: 'transformação, profundidade, intensidade' },
    sagitario: { nome: 'Sagitário', elemento: 'Fogo', regente: 'Júpiter', qualidade: 'Mutável', energia: 'expansão, filosofia, aventura' },
    capricornio: { nome: 'Capricórnio', elemento: 'Terra', regente: 'Saturno', qualidade: 'Cardinal', energia: 'estrutura, ambição, responsabilidade' },
    aquario: { nome: 'Aquário', elemento: 'Ar', regente: 'Urano', qualidade: 'Fixo', energia: 'inovação, liberdade, coletividade' },
    peixes: { nome: 'Peixes', elemento: 'Água', regente: 'Netuno', qualidade: 'Mutável', energia: 'intuição, compaixão, transcendência' }
};

const BASE_SYSTEM_PROMPT = `Você é um astrólogo-tarólogo experiente que combina a sabedoria do tarot com a astrologia. Sua missão é criar leituras personalizadas que conectam as energias das cartas com as características específicas de cada signo do zodíaco.

ESTILO DE ESCRITA:
- Tom místico, profundo e inspirador
- Linguagem elegante e poética, mas acessível
- Evite clichês e obviedades
- Não use emojis ou símbolos de signos
- Máximo 2-3 parágrafos por campo
- Foque em insights práticos e transformadores
- Conecte sempre as cartas com a natureza do signo

ABORDAGEM DAS 3 CARTAS:
As 3 cartas revelam uma tríade energética que forma um diálogo místico:
- Carta 1: A energia que desperta (o impulso inicial)
- Carta 2: A energia que sustenta (o ponto de equilíbrio)
- Carta 3: A energia que transforma (o potencial a integrar)

Juntas, formam um campo de força que ressoa especialmente com o signo em questão.`;

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
        const { signo, cards, isPortuguese } = req.body;
        const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: 'API não configurada' });
        }

        if (!signo || !cards || cards.length !== 3) {
            return res.status(400).json({ error: 'Signo ou cartas inválidos' });
        }

        const signData = ZODIAC_DATA[signo.toLowerCase()];
        if (!signData) {
            return res.status(400).json({ error: 'Signo não reconhecido' });
        }

        const lang = isPortuguese ? 'português' : 'English';
        const today = new Date().toISOString().split('T')[0];

        // Cache por dia + signo + idioma
        const cacheKey = `signo_v1_${signo}_${today}_${lang}`;
        if (signoCache.has(cacheKey)) {
            const cached = signoCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                console.log('📦 Cache hit (signo)!');
                return res.json({ text: cached.data });
            }
        }

        const cardNames = cards.map(c => c.name).join(', ');

        const prompt = `${BASE_SYSTEM_PROMPT}

SIGNO: ${signData.nome}
ELEMENTO: ${signData.elemento}
REGENTE: ${signData.regente}
QUALIDADE: ${signData.qualidade}
ENERGIA NATURAL: ${signData.energia}

CARTAS DO DIA PARA ${signData.nome.toUpperCase()}:
1. ${cards[0].name} (energia que desperta)
2. ${cards[1].name} (energia que sustenta)
3. ${cards[2].name} (energia que transforma)

IDIOMA: ${lang}
DATA: ${today}

Como astrólogo-tarólogo, crie uma leitura profunda e personalizada para ${signData.nome}, conectando as energias específicas deste signo com a tríade de cartas revelada hoje.

IMPORTANTE:
- Conecte cada interpretação com as características naturais de ${signData.nome}
- Mostre como as cartas dialogam entre si formando uma mensagem unificada
- Seja específico sobre como o elemento ${signData.elemento} e o regente ${signData.regente} influenciam a leitura
- NÃO use emojis ou símbolos

Responda EXCLUSIVAMENTE em JSON válido com todos os campos preenchidos.`;

        const schema = {
            type: "object",
            properties: {
                signo: {
                    type: "string",
                    description: "Nome do signo"
                },
                energia_signo_hoje: {
                    type: "string",
                    description: "Síntese da energia predominante para o signo hoje, conectando elemento e regente (máx 60 palavras)"
                },
                cartas: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            nome: { type: "string" },
                            papel: { type: "string", description: "desperta, sustenta ou transforma" },
                            interpretacao: { type: "string", description: "Interpretação da carta para este signo (máx 50 palavras)" },
                            conexao_signo: { type: "string", description: "Como esta carta ressoa com a natureza do signo (máx 30 palavras)" }
                        },
                        required: ["nome", "papel", "interpretacao", "conexao_signo"]
                    },
                    minItems: 3,
                    maxItems: 3
                },
                sintese_energetica: {
                    type: "string",
                    description: "Síntese de como as 3 cartas trabalham juntas para o signo (máx 80 palavras)"
                },
                mensagem_do_dia: {
                    type: "string",
                    description: "Mensagem central do dia em formato de título inspirador (máx 12 palavras)"
                },
                desafio_cosmico: {
                    type: "string",
                    description: "O desafio que o universo apresenta ao signo hoje (máx 50 palavras)"
                },
                portal_oportunidade: {
                    type: "string",
                    description: "A oportunidade única disponível para o signo hoje (máx 50 palavras)"
                },
                sombra_a_integrar: {
                    type: "string",
                    description: "Aspecto interno que pede atenção e integração hoje (máx 45 palavras)"
                },
                acao_sugerida: {
                    type: "string",
                    description: "Ação prática e específica para alinhar-se com as energias do dia (máx 40 palavras)"
                },
                mantra_signo: {
                    type: "string",
                    description: "Afirmação poderosa personalizada para o signo hoje (máx 15 palavras)"
                },
                conselho_final: {
                    type: "string",
                    description: "Conselho sábio e inspirador para encerrar a leitura (máx 35 palavras)"
                }
            },
            required: [
                "signo", "energia_signo_hoje", "cartas", "sintese_energetica",
                "mensagem_do_dia", "desafio_cosmico", "portal_oportunidade",
                "sombra_a_integrar", "acao_sugerida", "mantra_signo", "conselho_final"
            ]
        };

        console.log('📡 Fazendo chamada para Gemini (tarot-signo)...', {
            signo: signData.nome,
            cartas: cardNames,
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
                        temperature: 0.85,
                        maxOutputTokens: 1200,
                        responseMimeType: 'application/json',
                        responseSchema: schema
                    }
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            console.log('✅ Resposta da IA (signo):', text.substring(0, 200) + '...');

            // Validar JSON
            try {
                const parsed = JSON.parse(text);
                console.log('📊 Campos retornados:', Object.keys(parsed));
            } catch (parseError) {
                console.error('❌ Erro ao parsear resposta:', parseError);
            }

            // Cache por 24h
            signoCache.set(cacheKey, { data: text, timestamp: Date.now() });

            return res.json({ text });
        }

        console.error('❌ Resposta inválida da API:', data);
        return res.status(500).json(data?.error || { error: 'Falha ao gerar leitura' });

    } catch (error) {
        console.error('❌ Erro detalhado (signo):', {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            error: 'Erro interno',
            details: error.message
        });
    }
}
