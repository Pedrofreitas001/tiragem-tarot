// Vercel Serverless Function - /api/tarot
import crypto from 'crypto';

// Cache em memória (compartilhado entre invocações na mesma instância)
const readingsCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Detecta tema da pergunta e retorna tone ajustado
 */
function detectThemeAndTone(question = '') {
    const themes = {
        amor: {
            keywords: ['amor', 'relacionamento', 'romance', 'coração', 'parceiro', 'crush', 'casal', 'paixão', 'namoro', 'casamento'],
            tone: 'compassionate',
            toneText: 'Seja empático e sensível. Reconheça as emoções envolvidas. Foco em clareza emocional sem julgamento.'
        },
        carreira: {
            keywords: ['trabalho', 'emprego', 'carreira', 'negócio', 'projeto', 'profissional', 'empresa', 'sucesso', 'promoção', 'chefe'],
            tone: 'practical',
            toneText: 'Seja prático e direto. Foco em ação e resultados concretos. Ofereça orientação acionável.'
        },
        saude: {
            keywords: ['saúde', 'físico', 'mental', 'bem-estar', 'energia', 'cura', 'doença', 'corpo', 'mente'],
            tone: 'nurturing',
            toneText: 'Seja acolhedor e encorajador. Foque no bem-estar integral. NUNCA dê orientação médica específica.'
        },
        espiritualidade: {
            keywords: ['espiritual', 'divino', 'alma', 'chamado', 'propósito', 'essência', 'despertar', 'missão', 'transcendência'],
            tone: 'profound',
            toneText: 'Seja profundo e introspectivo. Explore significado e propósito maior. Evite clichês espirituais.'
        },
        financeiro: {
            keywords: ['dinheiro', 'financeiro', 'investimento', 'ganho', 'perda', 'riqueza', 'abundância', 'grana', 'economia'],
            tone: 'analytical',
            toneText: 'Seja claro e perspicaz. Equilibre esperança com realismo. Foco em oportunidades práticas.'
        }
    };

    const lowerQuestion = (question || '').toLowerCase();

    // Encontrar tema com maior relevância
    let detectedTheme = 'general';
    let maxMatches = 0;

    for (const [theme, config] of Object.entries(themes)) {
        const matches = config.keywords.filter(kw => lowerQuestion.includes(kw)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            detectedTheme = theme;
        }
    }

    return {
        theme: detectedTheme,
        tone: themes[detectedTheme]?.tone || 'balanced',
        instruction: themes[detectedTheme]?.toneText || ''
    };
}

/**
 * Gerar system prompt dinâmico baseado na pergunta
 */
function getDynamicSystemPrompt(question = '') {
    const base = `VOCÊ É: Tarólogo experiente e intuitivo com 20+ anos de prática

ESTILO DE COMUNICAÇÃO:
- Profundo sem ser pomposo
- Intuitivo sem ser vago
- Direto sem ser frio
- Poético sem ser clichê

RESTRIÇÕES IMPORTANTES:
❌ Não explique os significados das cartas individualmente
❌ Não use listas com bullets ou emojis
❌ Não mencione ser uma IA ou sistema
❌ Não faça previsões absolutas (use "tendências", "potenciais")
❌ Não ignore cartas invertidas - integre-as na narrativa
❌ Não ofereça múltiplas interpretações (seja claro em sua visão)
❌ Não use linguagem excessivamente mística ou genérica
❌ NUNCA cite nomes de cartas em inglês - use APENAS nomes em português

✅ FAÇA SEMPRE:
✅ Integre TODAS as cartas em uma narrativa fluida e coerente
✅ Aponte conexões e tensões entre as cartas (como elas "conversam")
✅ Ofereça aplicação prática - o que fazer com essa informação
✅ Respeite reversos como complementos/nuances, não negações
✅ Use linguagem que ressoa (elegante, simples, autêntica)
✅ Termine com algo reflexivo que empodere o leitor`;

    const { theme, instruction } = detectThemeAndTone(question);

    if (instruction) {
        return `${base}

[CONTEXTO ESPECÍFICO DETECTADO: ${theme.toUpperCase()}]
${instruction}`;
    }

    return base;
}

// NOVA ESTRUTURA: 7 MÓDULOS CANÔNICOS (universais para todos os spreads)
const CANONICAL_SCHEMA = {
    type: "object",
    properties: {
        sintese_geral: {
            type: "string",
            description: "Narrativa única integrando TODAS as cartas. Não explique carta por carta. Conte uma história coesa. (80-150 palavras)"
        },
        tema_central: {
            type: "string",
            description: "O eixo simbólico da leitura. Conceitual, curto, quase um título invisível. (5-12 palavras)"
        },
        simbolismo_cartas: {
            type: "string",
            description: "Análise dos símbolos presentes nas cartas (elementos, cores, figuras, numeros). O que os símbolos revelam sobre a situação. (40-70 palavras)"
        },
        dinamica_das_cartas: {
            type: "string",
            description: "Como as cartas SE RELACIONAM. Onde está a tensão? Quem reforça/bloqueia quem? Não repita a síntese. (40-80 palavras)"
        },
        ponto_de_atencao: {
            type: "string",
            description: "Onde o consulente pode se sabotar ou ignorar algo. Nunca acusatório, sempre consciente. (25-50 palavras)"
        },
        conselho_pratico: {
            type: "string",
            description: "Algo aplicável no dia-a-dia. Direto, sem vagueza. Algo que se possa fazer ou evitar. (25-50 palavras)"
        },
        reflexao_final: {
            type: "string",
            description: "Pergunta reflexiva OU frase poderosa de fechamento. Não repetir conselho. Deixe o usuário pensando. (15-30 palavras)"
        }
    },
    required: ["sintese_geral", "tema_central", "simbolismo_cartas", "dinamica_das_cartas", "ponto_de_atencao", "conselho_pratico", "reflexao_final"]
};

// PROMPTS OTIMIZADOS POR TIPO DE JOGO (com few-shot examples)
const SPREAD_PROMPTS = {
    three_card: {
        context: (cards, question, lang) => `
Leitura: Três Cartas (Passado-Presente-Futuro)
Cartas: ${cards}
${question ? `Pergunta: "${question}"` : 'Orientação geral'}
Idioma: ${lang}

Interprete integrando as três posições temporais em narrativa fluida.`,

        examples: `
EXEMPLO DE QUALIDADE:
Cartas: O Louco (Passado) | O Mago (Presente) | A Sacerdotisa (Futuro)
Pergunta: "Como está meu desenvolvimento profissional?"

{
  "sintese_geral": "Você deixou para trás uma fase de indecisão e agora está tomando ação concreta. O Mago mostra que você tem os recursos, mas a Sacerdotisa no futuro sugere que a próxima etapa exige menos fazer e mais escutar. Há uma transição em curso: da ação impulsiva para a ação consciente.",
  "tema_central": "Transformação de potencial em sabedoria aplicada",
  "simbolismo_cartas": "O Louco traz o número zero, o potencial puro. O Mago é o um, a manifestação. A Sacerdotisa é o dois, a dualidade e o mistério. Juntos formam uma sequência numérica de evolução: do caos à criação, da criação à sabedoria oculta.",
  "dinamica_das_cartas": "O Louco trouxe coragem, o Mago trouxe habilidade, mas a Sacerdotisa vem impor pausa. Existe tensão entre agir e esperar — a leitura pede equilíbrio.",
  "ponto_de_atencao": "A pressa pode fazer você repetir padrões antigos. Cuidado com ação por ansiedade em vez de clareza.",
  "conselho_pratico": "Antes de decidir algo grande, reduza estímulos externos. Menos opinião, mais escuta interior.",
  "reflexao_final": "O que muda quando você confia menos no controle e mais no processo?"
}
`
    },
    celtic_cross: {
        context: (cards, question, lang) => `
Leitura: Cruz Celta (10 posições)
Cartas: ${cards}
${question ? `Pergunta: "${question}"` : 'Orientação profunda'}
Idioma: ${lang}

Sintetize as 10 cartas em narrativa coesa. Identifique o eixo central da leitura.`,

        examples: `
EXEMPLO DE QUALIDADE:
(Cruz Celta com 10 cartas integrando presente, desafio, passado, futuro, etc.)

{
  "sintese_geral": "A situação mostra alguém no centro de uma transformação forçada. O que parecia estável foi abalado, mas há uma base sólida escondida. O desafio não é evitar a mudança, mas atravessá-la sem perder o essencial. As cartas de futuro apontam para reconstrução consciente.",
  "tema_central": "Destruição necessária como portal para autenticidade",
  "dinamica_das_cartas": "A Torre no presente colide com O Imperador no passado — controle sendo desfeito. A Estrela no futuro reconcilia caos com esperança. Há um arco claro: rigidez → ruptura → renovação.",
  "ponto_de_atencao": "O risco é tentar controlar o incontrolável. Existe uma parte sua que ainda quer voltar ao que era.",
  "conselho_pratico": "Não tome decisões grandes agora. Deixe a poeira baixar. Foque em cuidar de si enquanto a tempestade passa.",
  "reflexao_final": "O que estava escondido atrás da estrutura que desmoronou?"
}
`
    },
    love_check: {
        context: (cards, question, lang) => `
Leitura: Amor e Relacionamento (5 cartas)
Cartas: ${cards}
${question ? `Pergunta: "${question}"` : 'Dinâmica do relacionamento'}
Idioma: ${lang}

Analise a dinâmica relacional entre as partes. Seja sensível mas direto.`,

        examples: `
EXEMPLO DE QUALIDADE:
{
  "sintese_geral": "A conexão existe, mas está sendo testada por expectativas não ditas. Uma parte quer avanço, outra quer segurança. As cartas mostram amor real, mas também mostram que ninguém está falando sobre o que realmente importa.",
  "tema_central": "Amor presente, comunicação ausente",
  "dinamica_das_cartas": "Copas aparecem (sentimento real), mas Espadas também (conflito mental). A tensão não é entre as pessoas, é entre o que se sente e o que se expressa.",
  "ponto_de_atencao": "O silêncio está criando histórias na cabeça de ambos. Suposições estão substituindo conversa.",
  "conselho_pratico": "Pergunte diretamente o que você tem medo de perguntar. Assuma o risco da honestidade.",
  "reflexao_final": "O que você não está dizendo por medo de ouvir a resposta?"
}
`
    },
    yes_no: {
        context: (cards, question, lang) => `
Leitura: Sim ou Não (1 carta)
Carta: ${cards}
Pergunta: "${question || 'A resposta que busco'}"
Idioma: ${lang}

Responda de forma direta e honesta. Use a carta para indicar tendência.`,

        examples: `
EXEMPLO DE QUALIDADE:
Carta: O Sol
Pergunta: "Devo aceitar essa oferta de emprego?"

{
  "sintese_geral": "Sim, com confiança. A carta aponta para expansão, clareza e energia positiva. Não há sinais de bloqueio ou armadilhas ocultas.",
  "tema_central": "Alinhamento entre oportunidade e momento",
  "dinamica_das_cartas": "O Sol é expansão pura. Não há conflito interno na leitura.",
  "ponto_de_atencao": "Cuidado apenas com otimismo que ignora detalhes práticos. Celebre, mas não deixe de ler o contrato.",
  "conselho_pratico": "Aceite, mas mantenha os pés no chão nos primeiros meses.",
  "reflexao_final": "Você está pronto para o que está pedindo?"
}
`
    },
    card_of_day: {
        context: (cards, question, lang) => `
Leitura: Carta do Dia
Carta: ${cards}
Idioma: ${lang}

Interprete para o dia de hoje. Seja inspirador mas prático.`,

        examples: `
EXEMPLO DE QUALIDADE:
Carta: A Força

{
  "sintese_geral": "Hoje é um dia para dominar impulsos, não suprimi-los. A Força não é sobre violência, é sobre controle gentil. Use a paciência como poder.",
  "tema_central": "Coragem tranquila",
  "dinamica_das_cartas": "A Força sugere situação que exige firmeza sem agressividade. Há algo a ser domesticado — talvez uma reação, um medo, um hábito.",
  "ponto_de_atencao": "Não confunda força com dureza. O risco é ser rígido demais.",
  "conselho_pratico": "Quando se sentir provocado hoje, respire antes de reagir. A pausa é poder.",
  "reflexao_final": "O que dentro de você precisa ser acalmado, não vencido?"
}
`
    }
};

const generateCacheKey = (cards, spreadId, question) => {
    const data = cards.map(c => c.name).sort().join('|') + spreadId + (question || '').trim().toLowerCase();
    return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * Construir prompt completo com system + examples + context
 */
function buildFullPrompt(cards, question, lang, spreadId) {
    const systemPrompt = getDynamicSystemPrompt(question);
    const spreadConfig = SPREAD_PROMPTS[spreadId] || SPREAD_PROMPTS.three_card;

    const contextPrompt = spreadConfig.context(cards, question, lang);
    const examples = spreadConfig.examples || '';

    return `${systemPrompt}

${examples}

${contextPrompt}

Responda APENAS com JSON válido seguindo o schema dos 7 módulos canônicos.`;
}

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

        // Formatar cartas com nomes no idioma correto
        const cardListText = cards.map((card, idx) => {
            const isReversed = reversedIndices.includes(idx);
            const position = spread.positions?.[idx]?.name || `Posição ${idx + 1}`;
            const orientation = isReversed ? (isPortuguese ? 'Inv' : 'Rev') : '';
            // Usar nome traduzido se disponível e idioma for português
            const cardName = (isPortuguese && card.name_pt) ? card.name_pt : card.name;
            return `${position}: ${cardName}${orientation ? ` (${orientation})` : ''}`;
        }).join(' | ');

        const spreadConfig = SPREAD_PROMPTS[spreadId] || SPREAD_PROMPTS.three_card;

        // Construir prompt completo com detecção de tema/tone
        const fullPrompt = buildFullPrompt(cardListText, question, lang, spreadId);

        // Chamar Gemini com schema canônico de 7 módulos
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.75, // Aumentado para mais criatividade
                        maxOutputTokens: 800, // Aumentado para 7 módulos
                        responseMimeType: 'application/json',
                        responseSchema: CANONICAL_SCHEMA
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
