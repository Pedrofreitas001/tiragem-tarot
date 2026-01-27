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
  return configured;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper with exponential backoff for rate limiting
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T | null> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimited = error?.status === 429 || error?.message?.includes('429');

      if (isRateLimited && attempt < maxRetries) {
        const waitTime = baseDelay * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s
        console.log(`Rate limited. Waiting ${waitTime/1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await delay(waitTime);
        continue;
      }

      throw error;
    }
  }
  return null;
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

    const result = await retryWithBackoff(async () => {
      const response = await ai!.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.75,
          maxOutputTokens: 1500,
        }
      });
      return response;
    });

    if (!result) {
      console.error("Failed to get response after retries");
      return null;
    }

    const text = result.text;
    console.log("Gemini response received:", text ? "success" : "empty");

    if (!text) return null;
    return JSON.parse(text) as StructuredSynthesis;

  } catch (error) {
    console.error("Gemini API Error (Structured Synthesis):", error);
    return null;
  }
};

// Função original para compatibilidade - não usada ativamente, mantida para fallback
export const getGeminiInterpretation = async (session: ReadingSession): Promise<ReadingAnalysis | null> => {
  // Retorna null para evitar chamada dupla - usamos apenas getStructuredSynthesis
  return null;
};
