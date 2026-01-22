import { GoogleGenAI, Type } from "@google/genai";
import { ReadingSession, ReadingAnalysis } from "../types";

// Initialize Gemini Client only if API key is available
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

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
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 0 },
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
