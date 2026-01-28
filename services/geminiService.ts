import { ReadingSession, ReadingAnalysis } from "../types";

// Tipos para síntese estruturada por tipo de jogo
export interface BaseSynthesis {
  tema_central?: string;
  reflexao: string;
}

// Três Cartas
export interface ThreeCardSynthesis extends BaseSynthesis {
  sintese: string;
  tema_central: string;
  conselho: string;
}

// Cruz Celta
export interface CelticCrossSynthesis extends BaseSynthesis {
  sintese: string;
  tema_central: string;
  desafio_principal: string;
  conselho: string;
}

// Amor e Relacionamento
export interface LoveSynthesis extends BaseSynthesis {
  sintese: string;
  tema_central: string;
  ponto_atencao: string;
  conselho: string;
}

// Sim ou Não
export interface YesNoSynthesis extends BaseSynthesis {
  resposta: 'sim' | 'nao' | 'talvez';
  explicacao: string;
  condicao: string;
}

// Carta do Dia
export interface DailyCardSynthesis {
  mensagem: string;
  energia: string;
  foco: string;
  reflexao: string;
}

// Tipo legado para compatibilidade
export interface StructuredSynthesis {
  sintese: string;
  tema_central: string;
  conexoes: string[];
  pergunta_reflexiva: string;
  energia_geral: 'positiva' | 'neutra' | 'desafiadora';
  elementos_destaque: string[];
  resposta_pergunta?: string;
}

// União de todos os tipos
export type AnySynthesis = ThreeCardSynthesis | CelticCrossSynthesis | LoveSynthesis | YesNoSynthesis | DailyCardSynthesis;

// Verifica se a API está configurada
export const isGeminiConfigured = (): boolean => {
  return true; // Backend sempre configurado
};

// Helper para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry com exponential backoff
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
        console.log(`Rate limited. Aguardando ${waitTime / 1000}s antes de tentar novamente...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  return null;
};

// Síntese estruturada via Backend Proxy - OTIMIZADA
export const getStructuredSynthesis = async (
  session: ReadingSession,
  isPortuguese: boolean = true
): Promise<AnySynthesis | null> => {
  try {
    console.log("📡 Chamando Backend para síntese estruturada...");

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
      console.error("❌ Falha ao obter resposta do backend");
      return null;
    }

    const text = result.text;
    console.log("📦 Resposta Gemini recebida via Proxy");

    const parsed = JSON.parse(text) as AnySynthesis;
    console.log("✅ Síntese parseada:", parsed);
    return parsed;

  } catch (error) {
    console.error("❌ Erro no Gemini Proxy:", error);
    return null;
  }
};

// Nova função para Carta do Dia com IA
export const getDailyCardSynthesis = async (
  card: { name: string; id: string },
  isPortuguese: boolean = true
): Promise<DailyCardSynthesis | null> => {
  try {
    console.log("📡 Chamando Backend para carta do dia...");

    const result = await retryWithBackoff(async () => {
      const response = await fetch('/api/daily-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card,
          isPortuguese
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Daily Card Error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    });

    if (!result || !result.text) {
      console.error("❌ Falha ao obter carta do dia");
      return null;
    }

    const parsed = JSON.parse(result.text) as DailyCardSynthesis;
    console.log("✅ Carta do dia parseada:", parsed);
    return parsed;

  } catch (error) {
    console.error("❌ Erro na carta do dia:", error);
    return null;
  }
};

// Função para converter nova síntese para formato legado (compatibilidade)
export const convertToLegacySynthesis = (synthesis: AnySynthesis, spreadId: string): StructuredSynthesis => {
  const base: StructuredSynthesis = {
    sintese: '',
    tema_central: '',
    conexoes: [],
    pergunta_reflexiva: '',
    energia_geral: 'neutra',
    elementos_destaque: []
  };

  if ('sintese' in synthesis) {
    base.sintese = synthesis.sintese;
  }
  if ('mensagem' in synthesis) {
    base.sintese = synthesis.mensagem;
  }
  if ('explicacao' in synthesis) {
    base.sintese = synthesis.explicacao;
  }

  if ('tema_central' in synthesis) {
    base.tema_central = synthesis.tema_central;
  }
  if ('energia' in synthesis) {
    base.tema_central = synthesis.energia;
  }

  if ('reflexao' in synthesis) {
    base.pergunta_reflexiva = synthesis.reflexao;
  }

  if ('conselho' in synthesis) {
    base.conexoes = [synthesis.conselho];
  }
  if ('foco' in synthesis) {
    base.conexoes = [synthesis.foco];
  }
  if ('condicao' in synthesis) {
    base.conexoes = [synthesis.condicao];
  }

  if ('resposta' in synthesis) {
    base.resposta_pergunta = synthesis.resposta === 'sim' ? 'Sim' : synthesis.resposta === 'nao' ? 'Não' : 'Talvez';
    base.energia_geral = synthesis.resposta === 'sim' ? 'positiva' : synthesis.resposta === 'nao' ? 'desafiadora' : 'neutra';
  }

  if ('desafio_principal' in synthesis) {
    base.elementos_destaque = [synthesis.desafio_principal];
  }
  if ('ponto_atencao' in synthesis) {
    base.elementos_destaque = [synthesis.ponto_atencao];
  }

  return base;
};

// Função original mantida para compatibilidade
export const getGeminiInterpretation = async (session: ReadingSession): Promise<ReadingAnalysis | null> => {
  return null;
};
