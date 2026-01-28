import { ReadingSession, ReadingAnalysis } from "../types";

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

// Verifica se a API está configurada (no backend agora, mas mantemos o check de disponibilidade)
export const isGeminiConfigured = (): boolean => {
  // O frontend não tem mais a chave por segurança, então assumimos que o backend está configurado
  return true;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T | null> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimited = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');

      if (isRateLimited && attempt < maxRetries) {
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  return null;
};

// Síntese estruturada chamando o Backend Proxy
export const getStructuredSynthesis = async (
  session: ReadingSession,
  isPortuguese: boolean = true
): Promise<StructuredSynthesis | null> => {
  try {
    console.log("📡 Calling Backend Proxy for structured synthesis...");

    const result = await retryWithBackoff(async () => {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session,
          isPortuguese
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Proxy Error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    });

    if (!result || !result.text) {
      console.error("❌ Failed to get response from backend");
      return null;
    }

    const text = result.text;
    console.log("📦 Gemini response via Proxy received");

    const parsed = JSON.parse(text) as StructuredSynthesis;
    console.log("✅ Parsed synthesis:", parsed);
    return parsed;

  } catch (error) {
    console.error("❌ Gemini Proxy Error:", error);
    return null;
  }
};

// Função original para compatibilidade
export const getGeminiInterpretation = async (session: ReadingSession): Promise<ReadingAnalysis | null> => {
  return null;
};
