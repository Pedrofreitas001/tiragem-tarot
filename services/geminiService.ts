import { ReadingSession, ReadingAnalysis } from "../types";

// ============================================
// NOVA ESTRUTURA: 7 MÓDULOS CANÔNICOS
// ============================================

export interface CanonicalSynthesis {
  sintese_geral: string;          // Narrativa única integrando todas as cartas
  tema_central: string;           // Eixo simbólico da leitura
  simbolismo_cartas: string;      // Análise dos símbolos presentes nas cartas
  dinamica_das_cartas: string;    // Como as cartas se relacionam
  ponto_de_atencao: string;       // Onde o consulente pode se sabotar
  conselho_pratico: string;       // Algo aplicável no dia-a-dia
  reflexao_final: string;         // Pergunta reflexiva ou frase de fechamento
}

// ============================================
// TIPOS LEGADOS (mantidos para compatibilidade)
// ============================================

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

// Carta do Dia - Energia Coletiva
export interface DailyCardSynthesis {
  mensagem_coletiva: string;        // Mensagem sobre a energia coletiva do dia
  vibração_universal: string;       // A vibração que permeia o universo hoje
  consciência_coletiva: string;     // Como a humanidade deve direcionar sua consciência
  movimento_planetário: string;     // A energia em movimento no planeta hoje
  chamado_universal: string;        // O chamado que o universo faz à humanidade
  reflexão_coletiva: string;        // Pergunta reflexiva para a humanidade
  energia_emocional: string;        // A energia emocional predominante no coletivo
  significado_carta: string;        // O que a carta representa e simboliza
  portal_transformação: string;     // Oportunidade de transformação disponível
  mantra_diário: string;            // Afirmação ou mantra para sintonizar com a energia
}

// Tarot por Signo - 3 Cartas Personalizadas
export interface TarotPorSignoCardInterpretation {
  posicao: 'passado' | 'presente' | 'futuro';
  nome: string;
  interpretacao_signo: string;      // Interpretação à luz do signo
  palavra_chave: string;
}

export interface TarotPorSignoSynthesis {
  signo: string;
  energia_signo_hoje: string;       // Energia do signo no dia
  cartas: TarotPorSignoCardInterpretation[];
  sintese_energetica: string;       // Como as 3 cartas conversam
  mensagem_do_dia: string;          // Título principal (max 8 palavras)
  desafio_cosmico: string;          // O que o universo pede
  portal_oportunidade: string;      // Onde está a chance
  sombra_a_integrar: string;        // Aspecto interno a reconhecer
  acao_sugerida: string;            // Passo prático do dia
  mantra_signo: string;             // Mantra personalizado
  conselho_final: string;           // Mensagem de fechamento
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
export type AnySynthesis = CanonicalSynthesis | ThreeCardSynthesis | CelticCrossSynthesis | LoveSynthesis | YesNoSynthesis | DailyCardSynthesis;

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
): Promise<CanonicalSynthesis | AnySynthesis | null> => {
  try {
    console.log("📡 Chamando Backend para síntese estruturada...", { spreadId: session.spread.id, cardCount: session.cards.length });

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
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error:", response.status, errorData);
        throw new Error(`Proxy Error (${response.status}): ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    });

    console.log("📦 Result recebido:", result);

    if (!result) {
      console.error("❌ Result é null ou undefined");
      return null;
    }

    // result.text pode ser string JSON ou já um objeto
    let text = result.text;
    if (!text) {
      console.error("❌ result.text não existe:", Object.keys(result));
      return null;
    }

    console.log("📦 Resposta Gemini (text):", typeof text === 'string' ? text.substring(0, 200) : JSON.stringify(text).substring(0, 200));

    // Se já é um objeto, usar diretamente; se é string, fazer parse
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;
    console.log("✅ Síntese parseada (NOVA ESTRUTURA 7 MÓDULOS):", parsed);
    return parsed as CanonicalSynthesis;

  } catch (error) {
    console.error("❌ Erro no Gemini Proxy:", error);
    return null;
  }
};

// Nova função para Carta do Dia com IA
export const getDailyCardSynthesis = async (
  card: { name: string; name_pt?: string; id: string },
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

// Nova função para Tarot por Signo com IA
export const getTarotPorSignoSynthesis = async (
  signo: string,
  cards: { name: string; id: string }[],
  isPortuguese: boolean = true
): Promise<TarotPorSignoSynthesis | null> => {
  try {
    console.log("📡 Chamando Backend para tarot por signo...", { signo, cardCount: cards.length });

    const result = await retryWithBackoff(async () => {
      const response = await fetch('/api/tarot-signo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signo,
          cards,
          isPortuguese
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Tarot Signo Error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    });

    if (!result || !result.text) {
      console.error("❌ Falha ao obter tarot por signo");
      return null;
    }

    const parsed = typeof result.text === 'string'
      ? JSON.parse(result.text) as TarotPorSignoSynthesis
      : result.text as TarotPorSignoSynthesis;
    console.log("✅ Tarot por signo parseado:", parsed);
    return parsed;

  } catch (error) {
    console.error("❌ Erro no tarot por signo:", error);
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
