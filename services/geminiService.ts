import { GoogleGenAI, Type } from "@google/genai";
import { ReadingSession, ReadingAnalysis } from "../types";

// Initialize Gemini Client only if API key is available
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log("Gemini AI initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
  }
}

// Tipo para síntese estruturada
export interface StructuredSynthesis {
  sintese: string;
  tema_central: string;
  conexoes: string[];
  pergunta_reflexiva: string;
  energia_geral: 'positiva' | 'neutra' | 'desafiadora';
  elementos_destaque: string[];
  resposta_pergunta?: string;
}

// Verifica se a API está configurada
export const isGeminiConfigured = (): boolean => {
  const configured = Boolean(API_KEY && ai);
  console.log("Gemini configured:", configured, "API_KEY exists:", Boolean(API_KEY));
  return configured;
};

// Síntese estruturada para Premium (resposta mais confiável e padronizada)
export const getStructuredSynthesis = async (
  session: ReadingSession,
  isPortuguese: boolean = true
): Promise<StructuredSynthesis | null> => {
  if (!API_KEY || !ai) {
    console.warn("Gemini API Key is not configured. API_KEY:", Boolean(API_KEY), "ai:", Boolean(ai));
    return null;
  }

  const { spread, cards, question, reversedIndices } = session;

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
Você é um tarólogo experiente, sábio e acolhedor. Sua missão é interpretar esta tiragem de Tarot de forma clara, objetiva e harmoniosa.

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
1. SÍNTESE: Crie uma narrativa fluida e coerente (2-3 parágrafos curtos)
   - Conecte as cartas entre si de forma harmoniosa
   - Use linguagem acessível, evitando jargões excessivos
   - Seja específico sobre o que cada carta sugere na sua posição

2. TOM: Acolhedor, respeitoso e empoderador
   - NUNCA faça previsões absolutas ("vai acontecer", "certamente")
   - Use linguagem de possibilidade ("pode indicar", "sugere", "convida a refletir")
   - Foque no autoconhecimento e nas escolhas do consulente

3. ESTRUTURA:
   - Tema central: uma frase que capture a essência da leitura
   - Conexões: como as cartas dialogam entre si
   - Elementos simbólicos: imagens e arquétipos que se destacam
   - Pergunta reflexiva: uma pergunta poderosa para o consulente meditar

${hasQuestion ? `4. RESPOSTA À PERGUNTA:
   - Aborde diretamente a pergunta "${question}"
   - Mostre como as cartas iluminam essa questão específica
   - Ofereça perspectivas práticas baseadas nos símbolos revelados` : ''}

═══════════════════════════════════════
FORMATO DE RESPOSTA
═══════════════════════════════════════
Retorne um JSON estruturado conforme o schema especificado.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      sintese: {
        type: Type.STRING,
        description: "Síntese narrativa da leitura em 2-3 parágrafos (150-200 palavras). Seja específico sobre cada carta."
      },
      tema_central: {
        type: Type.STRING,
        description: "O tema principal identificado na leitura (uma frase de 5-12 palavras)"
      },
      conexoes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de 2-4 conexões significativas entre as cartas"
      },
      pergunta_reflexiva: {
        type: Type.STRING,
        description: "Uma pergunta poderosa para o consulente refletir"
      },
      energia_geral: {
        type: Type.STRING,
        description: "Classificação da energia predominante: positiva, neutra ou desafiadora"
      },
      elementos_destaque: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 símbolos ou arquétipos que se destacam na leitura"
      },
      ...(hasQuestion && {
        resposta_pergunta: {
          type: Type.STRING,
          description: "Resposta direta à pergunta do consulente baseada nas cartas (2-3 frases)"
        }
      })
    },
    required: ["sintese", "tema_central", "conexoes", "pergunta_reflexiva", "energia_geral", "elementos_destaque", ...(hasQuestion ? ["resposta_pergunta"] : [])]
  };

  try {
    console.log("Calling Gemini API for structured synthesis...");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.75,
        maxOutputTokens: 1500,
      }
    });

    const text = response.text;
    console.log("Gemini response received:", text ? "success" : "empty");

    if (!text) return null;
    return JSON.parse(text) as StructuredSynthesis;

  } catch (error) {
    console.error("Gemini API Error (Structured Synthesis):", error);
    return null;
  }
};

// Função original para compatibilidade
export const getGeminiInterpretation = async (session: ReadingSession): Promise<ReadingAnalysis | null> => {
  if (!API_KEY || !ai) {
    console.warn("Gemini API Key is not configured. Using fallback interpretation.");
    return null;
  }

  const { spread, cards, question, reversedIndices } = session;

  const cardListText = cards.map((card, idx) => {
    const isReversed = reversedIndices.includes(idx);
    const position = spread.positions[idx];
    return `- Position ${idx + 1} (${position.name}): ${card.name} ${isReversed ? '(Reversed)' : '(Upright)'}. Context: ${position.description}`;
  }).join('\n');

  const prompt = `
    You are an expert Mystic Tarot Reader.

    User Query: "${question || 'General Guidance'}"
    Spread Used: ${spread.name}

    The cards drawn are:
    ${cardListText}

    Provide a structured interpretation in JSON format.
    1. 'synthesis': A deep, narrative summary of the reading's energy (approx 60-80 words).
    2. 'cards': An array where each item corresponds to a card drawn. Include specific interpretation for its position.
    3. 'advice': A final actionable advice.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      synthesis: { type: Type.STRING, description: "A mystical summary of the reading." },
      cards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            index: { type: Type.INTEGER },
            name: { type: Type.STRING },
            interpretation: { type: Type.STRING, description: "Detailed interpretation of this card in its position." },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      advice: { type: Type.STRING, description: "Actionable spiritual advice." }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ReadingAnalysis;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
