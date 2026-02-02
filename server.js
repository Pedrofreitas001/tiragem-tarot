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

// ============================================
// 🎯 SISTEMA CANÔNICO DE 7 MÓDULOS
// ============================================

// 1️⃣ Detecção de Tema e Tom
function detectThemeAndTone(cards, question, spread) {
    const cardNames = cards.map(c => c.name.toLowerCase()).join(' ');
    const questionLower = (question || '').toLowerCase();
    const combinedText = `${cardNames} ${questionLower}`;

    // Categorias temáticas
    if (/amor|relacionamento|coração|parceiro|casal|romance/i.test(combinedText)) {
        return { theme: 'amor', tone: 'acolhedor e empático', focus: 'conexões emocionais e vínculos afetivos' };
    }
    if (/trabalho|carreira|profissional|emprego|negócio|dinheiro|financ/i.test(combinedText)) {
        return { theme: 'carreira', tone: 'estratégico e prático', focus: 'decisões profissionais e recursos materiais' };
    }
    if (/espiritual|alma|propósito|crescimento|evolução|jornada/i.test(combinedText)) {
        return { theme: 'espiritual', tone: 'contemplativo e profundo', focus: 'desenvolvimento interior e busca de sentido' };
    }
    if (/decisão|escolha|dúvida|caminho|dilema/i.test(combinedText)) {
        return { theme: 'decisão', tone: 'claro e orientador', focus: 'clareza mental e direcionamento' };
    }

    // Padrão genérico
    return { theme: 'geral', tone: 'equilibrado e abrangente', focus: 'panorama da situação e orientações gerais' };
}

// 2️⃣ System Prompt Dinâmico
function getDynamicSystemPrompt(themeInfo, lang) {
    const langName = lang === 'português' ? 'português brasileiro' : 'English';
    const cardNameWarning = lang === 'português'
        ? '⚠️ CRÍTICO: Mencione as cartas APENAS pelos nomes em PORTUGUÊS (ex: "Sete de Paus", NUNCA "Seven of Wands")'
        : '⚠️ CRITICAL: Mention cards ONLY by their ENGLISH names';

    return `Você é um intérprete de Tarot especializado em leituras ${themeInfo.theme === 'geral' ? 'completas' : `sobre ${themeInfo.theme}`}.

🎯 Tom da leitura: ${themeInfo.tone}
🎯 Foco principal: ${themeInfo.focus}
🎯 Idioma: ${langName}

${cardNameWarning}

REGRAS ABSOLUTAS:
- Responda APENAS em JSON válido seguindo o schema exato
- Use linguagem ${themeInfo.tone}
- Integre TODAS as cartas na narrativa
- Seja direto: sem definições de tarot, sem listas, sem emojis
- NUNCA cite nomes de cartas em inglês quando o idioma for português
- Refira-se às cartas apenas pelos seus nomes traduzidos no idioma correto
- Máximo 800 tokens no total
- Cada campo deve ser conciso mas completo`;
}

// 3️⃣ Schema Canônico Universal (7 Módulos)
const CANONICAL_SCHEMA = {
    type: "object",
    properties: {
        sintese_geral: {
            type: "string",
            description: "Visão panorâmica integrando todas as cartas (80-120 palavras)"
        },
        tema_central: {
            type: "string",
            description: "Essência/núcleo da leitura (8-15 palavras)"
        },
        simbolismo_cartas: {
            type: "string",
            description: "Análise dos símbolos presentes nas cartas e seu significado profundo (50-80 palavras)"
        },
        dinamica_das_cartas: {
            type: "string",
            description: "Como as cartas dialogam entre si (60-90 palavras)"
        },
        ponto_de_atencao: {
            type: "string",
            description: "Principal desafio ou alerta (40-60 palavras)"
        },
        conselho_pratico: {
            type: "string",
            description: "Ação concreta e aplicável (30-50 palavras)"
        },
        reflexao_final: {
            type: "string",
            description: "Pensamento para levar consigo (15-25 palavras)"
        }
    },
    required: [
        "sintese_geral",
        "tema_central",
        "simbolismo_cartas",
        "dinamica_das_cartas",
        "ponto_de_atencao",
        "conselho_pratico",
        "reflexao_final"
    ]
};

// 4️⃣ Prompts Específicos por Spread (com Few-Shot)
const SPREAD_PROMPTS = {
    three_card: (cards, question, lang) => {
        const example = lang === 'português'
            ? `EXEMPLO DE SAÍDA ESPERADA:
{
  "sintese_geral": "Sua jornada mostra uma transição significativa. O passado traz memórias de estabilidade e conforto, enquanto o presente revela um momento de pausa necessária para assimilar mudanças internas. O futuro aponta para renovação criativa, onde novas perspectivas podem florescer. As três cartas formam um arco de transformação consciente.",
  "tema_central": "Pausa reflexiva antes de um novo ciclo criativo",
  "simbolismo_cartas": "A estabilidade sólida das copas ou ouros no passado contrasta com a figura suspensa do Enforcado — ele pende de cabeça para baixo, mudando a perspectiva. O futuro traz cores vibrantes e movimento, indicando que o sacrifício presente gera frutos criativos.",
  "dinamica_das_cartas": "A estabilidade do passado contrasta com a suspensão atual, mas essa aparente inércia é preparação. O Enforcado não é fim, mas gestação. Quando o processo interno se completar, a energia criativa do futuro emerge naturalmente, trazendo soluções inesperadas.",
  "ponto_de_atencao": "Não force resoluções agora. O momento pede rendição temporária, não ação. Respeite o timing interno.",
  "conselho_pratico": "Permita-se estar em espera ativa. Use este tempo para observar, não para decidir. A clareza virá.",
  "reflexao_final": "O que está sendo gestado em você neste momento de quietude?"
}`
            : `EXPECTED OUTPUT EXAMPLE:
{
  "sintese_geral": "Your journey shows a significant transition. The past brings memories of stability and comfort, while the present reveals a necessary pause to assimilate internal changes. The future points to creative renewal, where new perspectives can flourish. The three cards form an arc of conscious transformation.",
  "tema_central": "Reflective pause before a new creative cycle",
  "simbolismo_cartas": "The solid stability of cups or pentacles in the past contrasts with the suspended figure of The Hanged Man — hanging upside down, shifting perspective. The future brings vibrant colors and movement, indicating that present sacrifice generates creative fruits.",
  "dinamica_das_cartas": "Past stability contrasts with current suspension, but this apparent inertia is preparation. The Hanged Man is not an end, but gestation. When the internal process completes, future creative energy emerges naturally, bringing unexpected solutions.",
  "ponto_de_atencao": "Don't force resolutions now. The moment asks for temporary surrender, not action. Respect the internal timing.",
  "conselho_pratico": "Allow yourself to be in active waiting. Use this time to observe, not to decide. Clarity will come.",
  "reflexao_final": "What is gestating within you in this moment of stillness?"
}`;

        return `SPREAD: Três Cartas (Passado-Presente-Futuro)
CARTAS: ${cards}
${question ? `PERGUNTA: "${question}"` : 'ORIENTAÇÃO GERAL'}

INSTRUÇÕES CRÍTICAS:
- IMPORTANTE: Use APENAS nomes de cartas em ${lang === 'português' ? 'português' : 'English'} (NUNCA em inglês se o idioma for português)
- Conecte as três posições temporais em narrativa fluida
- Mostre como o passado influencia o presente e prepara o futuro
- Seja específico sobre cada carta, não genérico

${example}`;
    },

    celtic_cross: (cards, question, lang) => {
        return `SPREAD: Cruz Celta (10 posições)
CARTAS: ${cards}
${question ? `PERGUNTA: "${question}"` : 'LEITURA PROFUNDA'}

INSTRUÇÕES:
- Integre as 10 cartas mostrando interconexões
- Dê atenção especial ao Resultado Final e ao Conselho
- Sintetize sem perder profundidade`;
    },

    love_check: (cards, question, lang) => {
        const example = lang === 'português'
            ? `EXEMPLO:
{
  "sintese_geral": "A leitura revela uma dança entre desejo e hesitação. Existe atração genuína, mas também cautela emocional. As cartas mostram que ambos carregam experiências passadas que influenciam o presente. A conexão é real, porém requer vulnerabilidade mútua para aprofundar-se.",
  "tema_central": "Atração verdadeira bloqueada por medos não ditos",
  "dinamica_das_cartas": "A energia inicial é magnética, mas encontra resistência interna. O que parece distanciamento é autopreservação. Para avançar, ambos precisam reconhecer e nomear seus receios, transformando muros em pontes.",
  "ponto_de_atencao": "A comunicação superficial mantém vocês seguros, mas também distantes. O medo da rejeição está criando a própria distância que temem.",
  "conselho_pratico": "Comece expressando uma vulnerabilidade pequena. Teste as águas com honestidade genuína sobre seus sentimentos.",
  "reflexao_final": "Que história você quer contar daqui a um ano sobre esta conexão?"
}`
            : `EXAMPLE:
{
  "sintese_geral": "The reading reveals a dance between desire and hesitation. Genuine attraction exists, but also emotional caution. The cards show that both carry past experiences influencing the present. The connection is real, yet requires mutual vulnerability to deepen.",
  "tema_central": "True attraction blocked by unspoken fears",
  "dinamica_das_cartas": "Initial energy is magnetic, but meets internal resistance. What seems like distance is self-preservation. To move forward, both need to recognize and name their fears, transforming walls into bridges.",
  "ponto_de_atencao": "Surface communication keeps you safe, but also distant. Fear of rejection is creating the very distance you dread.",
  "conselho_pratico": "Start by expressing a small vulnerability. Test the waters with genuine honesty about your feelings.",
  "reflexao_final": "What story do you want to tell a year from now about this connection?"
}`;

        return `SPREAD: Amor e Relacionamento (5 cartas)
CARTAS: ${cards}
${question ? `PERGUNTA: "${question}"` : 'DINÂMICA RELACIONAL'}

INSTRUÇÕES:
- Analise a dinâmica entre as partes com sensibilidade
- Identifique padrões emocionais sutis
- Seja honesto mas empático

${example}`;
    },

    yes_no: (cards, question, lang) => {
        return `SPREAD: Sim ou Não (1 carta)
CARTA: ${cards}
PERGUNTA: "${question || 'A resposta que busco'}"

INSTRUÇÕES:
- Analise a energia da carta para determinar a tendência
- Seja direto mas não simplista
- Explique o "porquê" da resposta
- ATENÇÃO: Use "sim", "nao" (sem til), ou "talvez" no campo resposta`;
    },

    card_of_day: (cards, question, lang) => {
        return `SPREAD: Carta do Dia
CARTA: ${cards}

INSTRUÇÕES:
- Interprete a carta para o dia de hoje
- Seja inspirador mas prático
- Foco em ação aplicável`;
    }
};

// 5️⃣ Construtor de Prompt Completo
function buildFullPrompt(spreadId, cards, question, reversedIndices, lang) {
    const themeInfo = detectThemeAndTone(cards, question, null);
    const systemPrompt = getDynamicSystemPrompt(themeInfo, lang);

    // Formatar cartas com nomes no idioma correto
    const cardListText = cards.map((card, idx) => {
        const isReversed = reversedIndices.includes(idx);
        const orientation = isReversed ? (lang === 'português' ? ' (Invertida)' : ' (Reversed)') : '';
        // Usar nome traduzido se disponível e idioma for português
        const cardName = (lang === 'português' && card.name_pt) ? card.name_pt : card.name;
        return `${cardName}${orientation}`;
    }).join(' | ');

    // Prompt específico do spread
    const spreadPromptFn = SPREAD_PROMPTS[spreadId] || SPREAD_PROMPTS.three_card;
    const spreadContext = spreadPromptFn(cardListText, question, lang);

    return `${systemPrompt}

${spreadContext}

RESPONDA EM JSON VÁLIDO SEGUINDO EXATAMENTE O SCHEMA DE 7 MÓDULOS.`;
}

// ============================================
// 📡 ENDPOINT PRINCIPAL DE TAROT
// ============================================
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

        // 🎯 Construir prompt completo usando novo sistema
        const fullPrompt = buildFullPrompt(spreadId, cards, question, reversedIndices, lang);

        console.log(`📡 Gemini API - Spread: ${spreadId}, Cards: ${cards.length}`);

        // Tentar modelos em ordem de preferência
        const modelsToTry = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const body = {
                    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.75,
                        maxOutputTokens: 800,
                        responseMimeType: 'application/json',
                        responseSchema: CANONICAL_SCHEMA
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
