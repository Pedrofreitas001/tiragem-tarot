import { GoogleGenAI, Type } from "@google/genai";
import { ReadingSession, ReadingAnalysis } from "../types";

// Initialize Gemini Client only if API key is available
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

// Tipo para síntese estruturada
export interface StructuredSynthesis {
  sintese: string;
  tema_central: string;
  conexoes: string[];
  pergunta_reflexiva: string;
  energia_geral: 'positiva' | 'neutra' | 'desafiadora';
  elementos_destaque: string[];
}

// Verifica se a API está configurada
export const isGeminiConfigured = (): boolean => {
  return Boolean(API_KEY && ai);
};

// Síntese estruturada para Premium (resposta mais confiável e padronizada)
export const getStructuredSynthesis = async (
  session: ReadingSession,
  isPortuguese: boolean = true
): Promise<StructuredSynthesis | null> => {
  if (!API_KEY || !ai) {
    console.warn("Gemini API Key is not configured.");
    return null;
  }

  const { spread, cards, question, reversedIndices } = session;

  const cardListText = cards.map((card, idx) => {
    const isReversed = reversedIndices.includes(idx);
    const position = spread.positions[idx];
    const orientation = isReversed
      ? (isPortuguese ? 'Invertida' : 'Reversed')
      : (isPortuguese ? 'Normal' : 'Upright');
    return `- Posição ${idx + 1} (${position.name}): ${card.name} (${orientation})`;
  }).join('\n');

  const language = isPortuguese ? 'português brasileiro' : 'English';

  const prompt = `
Você é um intérprete de Tarot experiente e respeitoso. Analise esta tiragem e forneça uma síntese estruturada.

REGRAS IMPORTANTES:
1. Responda em ${language}
2. Máximo 3 parágrafos na síntese
3. Tom: acolhedor, reflexivo, simbólico - NUNCA faça previsões absolutas ou determinísticas
4. Foque em padrões, conexões entre as cartas e insights simbólicos
5. Termine com uma pergunta reflexiva para o consulente
6. NUNCA diga que algo "vai acontecer" - use linguagem como "pode indicar", "sugere", "convida a refletir"
7. Respeite que o Tarot é uma ferramenta de autoconhecimento, não de adivinhação

TIRAGEM:
- Tipo: ${spread.name}
- Pergunta do consulente: "${question || (isPortuguese ? 'Orientação geral' : 'General guidance')}"
- Cartas:
${cardListText}

Forneça a resposta no formato JSON especificado.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      sintese: {
        type: Type.STRING,
        description: "Síntese narrativa da leitura em 2-3 parágrafos (máximo 200 palavras)"
      },
      tema_central: {
        type: Type.STRING,
        description: "O tema principal identificado na leitura (máximo 10 palavras)"
      },
      conexoes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de 2-4 conexões interessantes entre as cartas"
      },
      pergunta_reflexiva: {
        type: Type.STRING,
        description: "Uma pergunta para o consulente refletir sobre a leitura"
      },
      energia_geral: {
        type: Type.STRING,
        description: "Classificação da energia: positiva, neutra ou desafiadora"
      },
      elementos_destaque: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 elementos simbólicos que se destacam na leitura"
      }
    },
    required: ["sintese", "tema_central", "conexoes", "pergunta_reflexiva", "energia_geral", "elementos_destaque"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const text = response.text;
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
