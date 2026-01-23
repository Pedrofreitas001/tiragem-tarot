/**
 * useJourneyProgress - Hook para calcular o progresso simbólico do usuário
 *
 * CONCEITO: "A Espiral do Louco"
 *
 * Na tradição do Tarot, O Louco (0) atravessa os 21 Arcanos Maiores em uma
 * jornada de transformação. Não é linear - é uma espiral ascendente onde
 * cada volta traz novos níveis de compreensão dos mesmos arquétipos.
 *
 * O progresso do usuário é calculado com base em:
 * - Número de tiragens realizadas
 * - Diversidade de cartas encontradas
 * - Padrões emergentes (cartas recorrentes)
 * - Tempo de jornada (dias desde o início)
 *
 * Cada "marco" representa um arquétipo desbloqueado através da prática.
 * Marcos futuros permanecem velados, criando mistério e antecipação.
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Os 22 Arcanos Maiores como marcos da jornada
export interface ArcanaMarker {
  id: number;
  name: string;
  nameEn: string;
  symbol: string;
  threshold: number; // Número de tiragens para desbloquear
  essence: string; // Essência arquetípica (PT)
  essenceEn: string;
  revelation: string; // Frase de revelação quando desbloqueado (PT)
  revelationEn: string;
  latentMessage: string; // Mensagem quando ainda latente (PT)
  latentMessageEn: string;
}

export const ARCANA_JOURNEY: ArcanaMarker[] = [
  {
    id: 0,
    name: 'O Louco',
    nameEn: 'The Fool',
    symbol: '0',
    threshold: 0,
    essence: 'O Salto',
    essenceEn: 'The Leap',
    revelation: 'Você deu o primeiro passo no desconhecido.',
    revelationEn: 'You took the first step into the unknown.',
    latentMessage: 'A jornada aguarda seu início.',
    latentMessageEn: 'The journey awaits your beginning.',
  },
  {
    id: 1,
    name: 'O Mago',
    nameEn: 'The Magician',
    symbol: 'I',
    threshold: 1,
    essence: 'A Intenção',
    essenceEn: 'The Intention',
    revelation: 'Sua vontade começou a tomar forma.',
    revelationEn: 'Your will has begun to take shape.',
    latentMessage: 'O poder ainda dorme.',
    latentMessageEn: 'The power still sleeps.',
  },
  {
    id: 2,
    name: 'A Sacerdotisa',
    nameEn: 'The High Priestess',
    symbol: 'II',
    threshold: 3,
    essence: 'O Silêncio',
    essenceEn: 'The Silence',
    revelation: 'Você aprendeu a ouvir o que não é dito.',
    revelationEn: 'You learned to hear what is unspoken.',
    latentMessage: 'Os véus ainda não se abriram.',
    latentMessageEn: 'The veils have not yet parted.',
  },
  {
    id: 3,
    name: 'A Imperatriz',
    nameEn: 'The Empress',
    symbol: 'III',
    threshold: 5,
    essence: 'A Criação',
    essenceEn: 'The Creation',
    revelation: 'Algo novo germina em você.',
    revelationEn: 'Something new germinates within you.',
    latentMessage: 'A abundância espera ser cultivada.',
    latentMessageEn: 'Abundance waits to be cultivated.',
  },
  {
    id: 4,
    name: 'O Imperador',
    nameEn: 'The Emperor',
    symbol: 'IV',
    threshold: 7,
    essence: 'A Estrutura',
    essenceEn: 'The Structure',
    revelation: 'Você está construindo fundamentos.',
    revelationEn: 'You are building foundations.',
    latentMessage: 'A ordem ainda não se manifestou.',
    latentMessageEn: 'Order has not yet manifested.',
  },
  {
    id: 5,
    name: 'O Hierofante',
    nameEn: 'The Hierophant',
    symbol: 'V',
    threshold: 10,
    essence: 'A Tradição',
    essenceEn: 'The Tradition',
    revelation: 'Você toca a sabedoria ancestral.',
    revelationEn: 'You touch ancestral wisdom.',
    latentMessage: 'Os ensinamentos aguardam.',
    latentMessageEn: 'The teachings await.',
  },
  {
    id: 6,
    name: 'Os Amantes',
    nameEn: 'The Lovers',
    symbol: 'VI',
    threshold: 12,
    essence: 'A Escolha',
    essenceEn: 'The Choice',
    revelation: 'Você está aprendendo a escolher.',
    revelationEn: 'You are learning to choose.',
    latentMessage: 'A encruzilhada ainda não chegou.',
    latentMessageEn: 'The crossroads has not yet come.',
  },
  {
    id: 7,
    name: 'O Carro',
    nameEn: 'The Chariot',
    symbol: 'VII',
    threshold: 15,
    essence: 'O Movimento',
    essenceEn: 'The Movement',
    revelation: 'Você ganhou momentum.',
    revelationEn: 'You have gained momentum.',
    latentMessage: 'As forças ainda não se alinharam.',
    latentMessageEn: 'The forces have not yet aligned.',
  },
  {
    id: 8,
    name: 'A Força',
    nameEn: 'Strength',
    symbol: 'VIII',
    threshold: 18,
    essence: 'A Coragem',
    essenceEn: 'The Courage',
    revelation: 'Sua força interior desperta.',
    revelationEn: 'Your inner strength awakens.',
    latentMessage: 'O leão ainda não foi domado.',
    latentMessageEn: 'The lion has not yet been tamed.',
  },
  {
    id: 9,
    name: 'O Eremita',
    nameEn: 'The Hermit',
    symbol: 'IX',
    threshold: 21,
    essence: 'A Introspecção',
    essenceEn: 'The Introspection',
    revelation: 'Você encontrou luz na solidão.',
    revelationEn: 'You found light in solitude.',
    latentMessage: 'A lanterna ainda não foi acesa.',
    latentMessageEn: 'The lantern has not yet been lit.',
  },
  {
    id: 10,
    name: 'A Roda da Fortuna',
    nameEn: 'Wheel of Fortune',
    symbol: 'X',
    threshold: 25,
    essence: 'Os Ciclos',
    essenceEn: 'The Cycles',
    revelation: 'Você reconhece os padrões.',
    revelationEn: 'You recognize the patterns.',
    latentMessage: 'A roda ainda não girou.',
    latentMessageEn: 'The wheel has not yet turned.',
  },
  {
    id: 11,
    name: 'A Justiça',
    nameEn: 'Justice',
    symbol: 'XI',
    threshold: 30,
    essence: 'O Equilíbrio',
    essenceEn: 'The Balance',
    revelation: 'Você busca a verdade.',
    revelationEn: 'You seek the truth.',
    latentMessage: 'A balança ainda não se equilibrou.',
    latentMessageEn: 'The scales have not yet balanced.',
  },
  {
    id: 12,
    name: 'O Enforcado',
    nameEn: 'The Hanged Man',
    symbol: 'XII',
    threshold: 35,
    essence: 'A Suspensão',
    essenceEn: 'The Suspension',
    revelation: 'Você vê de uma perspectiva nova.',
    revelationEn: 'You see from a new perspective.',
    latentMessage: 'A inversão ainda não chegou.',
    latentMessageEn: 'The inversion has not yet come.',
  },
  {
    id: 13,
    name: 'A Morte',
    nameEn: 'Death',
    symbol: 'XIII',
    threshold: 40,
    essence: 'A Transformação',
    essenceEn: 'The Transformation',
    revelation: 'Você deixou algo morrer para renascer.',
    revelationEn: 'You let something die to be reborn.',
    latentMessage: 'O fim ainda não veio.',
    latentMessageEn: 'The end has not yet come.',
  },
  {
    id: 14,
    name: 'A Temperança',
    nameEn: 'Temperance',
    symbol: 'XIV',
    threshold: 45,
    essence: 'A Alquimia',
    essenceEn: 'The Alchemy',
    revelation: 'Você está integrando opostos.',
    revelationEn: 'You are integrating opposites.',
    latentMessage: 'A mistura ainda não começou.',
    latentMessageEn: 'The blending has not yet begun.',
  },
  {
    id: 15,
    name: 'O Diabo',
    nameEn: 'The Devil',
    symbol: 'XV',
    threshold: 50,
    essence: 'As Sombras',
    essenceEn: 'The Shadows',
    revelation: 'Você reconhece suas correntes.',
    revelationEn: 'You recognize your chains.',
    latentMessage: 'As sombras ainda se escondem.',
    latentMessageEn: 'The shadows still hide.',
  },
  {
    id: 16,
    name: 'A Torre',
    nameEn: 'The Tower',
    symbol: 'XVI',
    threshold: 60,
    essence: 'A Ruptura',
    essenceEn: 'The Rupture',
    revelation: 'Você sobreviveu ao colapso.',
    revelationEn: 'You survived the collapse.',
    latentMessage: 'A estrutura ainda não caiu.',
    latentMessageEn: 'The structure has not yet fallen.',
  },
  {
    id: 17,
    name: 'A Estrela',
    nameEn: 'The Star',
    symbol: 'XVII',
    threshold: 70,
    essence: 'A Esperança',
    essenceEn: 'The Hope',
    revelation: 'Você encontrou renovação.',
    revelationEn: 'You found renewal.',
    latentMessage: 'A luz ainda não brilhou.',
    latentMessageEn: 'The light has not yet shone.',
  },
  {
    id: 18,
    name: 'A Lua',
    nameEn: 'The Moon',
    symbol: 'XVIII',
    threshold: 80,
    essence: 'O Inconsciente',
    essenceEn: 'The Unconscious',
    revelation: 'Você navega o desconhecido.',
    revelationEn: 'You navigate the unknown.',
    latentMessage: 'Os sonhos ainda não falaram.',
    latentMessageEn: 'The dreams have not yet spoken.',
  },
  {
    id: 19,
    name: 'O Sol',
    nameEn: 'The Sun',
    symbol: 'XIX',
    threshold: 90,
    essence: 'A Clareza',
    essenceEn: 'The Clarity',
    revelation: 'Você encontrou a luz interior.',
    revelationEn: 'You found the inner light.',
    latentMessage: 'O amanhecer ainda não chegou.',
    latentMessageEn: 'The dawn has not yet come.',
  },
  {
    id: 20,
    name: 'O Julgamento',
    nameEn: 'Judgement',
    symbol: 'XX',
    threshold: 100,
    essence: 'O Despertar',
    essenceEn: 'The Awakening',
    revelation: 'Você ouviu o chamado.',
    revelationEn: 'You heard the call.',
    latentMessage: 'O chamado ainda não soou.',
    latentMessageEn: 'The call has not yet sounded.',
  },
  {
    id: 21,
    name: 'O Mundo',
    nameEn: 'The World',
    symbol: 'XXI',
    threshold: 120,
    essence: 'A Integração',
    essenceEn: 'The Integration',
    revelation: 'Você completou um ciclo.',
    revelationEn: 'You completed a cycle.',
    latentMessage: 'A totalidade ainda não se manifestou.',
    latentMessageEn: 'Wholeness has not yet manifested.',
  },
];

export interface JourneyProgress {
  // Número total de tiragens feitas
  totalReadings: number;
  // Dias desde a primeira tiragem
  daysSinceStart: number;
  // Marcos desbloqueados
  unlockedMarkers: ArcanaMarker[];
  // Próximo marco a desbloquear
  nextMarker: ArcanaMarker | null;
  // Progresso até o próximo marco (0-100)
  progressToNext: number;
  // Número de tiragens para o próximo marco
  readingsToNext: number;
  // Todos os marcos (para visualização)
  allMarkers: ArcanaMarker[];
  // Índice do marco atual
  currentMarkerIndex: number;
  // Porcentagem total da jornada
  totalProgress: number;
  // Mensagem contextual baseada no progresso
  contextMessage: string;
  contextMessageEn: string;
}

export const useJourneyProgress = (): JourneyProgress => {
  const { readingsToday, profile } = useAuth();

  return useMemo(() => {
    // Simular progresso baseado em dados disponíveis
    // Em produção, isso viria do histórico real do usuário
    const totalReadings = profile?.readings_today || readingsToday || 0;

    // Calcular dias desde o início (simulado)
    const daysSinceStart = profile?.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Encontrar marcos desbloqueados
    const unlockedMarkers = ARCANA_JOURNEY.filter(m => totalReadings >= m.threshold);
    const currentMarkerIndex = unlockedMarkers.length - 1;

    // Próximo marco
    const nextMarker = ARCANA_JOURNEY.find(m => totalReadings < m.threshold) || null;

    // Progresso até o próximo marco
    let progressToNext = 100;
    let readingsToNext = 0;

    if (nextMarker && currentMarkerIndex >= 0) {
      const currentThreshold = ARCANA_JOURNEY[currentMarkerIndex].threshold;
      const nextThreshold = nextMarker.threshold;
      const range = nextThreshold - currentThreshold;
      const progress = totalReadings - currentThreshold;
      progressToNext = Math.min(100, (progress / range) * 100);
      readingsToNext = nextThreshold - totalReadings;
    } else if (nextMarker) {
      progressToNext = (totalReadings / nextMarker.threshold) * 100;
      readingsToNext = nextMarker.threshold - totalReadings;
    }

    // Progresso total da jornada
    const lastThreshold = ARCANA_JOURNEY[ARCANA_JOURNEY.length - 1].threshold;
    const totalProgress = Math.min(100, (totalReadings / lastThreshold) * 100);

    // Mensagem contextual
    let contextMessage = 'Sua jornada aguarda o primeiro passo.';
    let contextMessageEn = 'Your journey awaits the first step.';

    if (totalReadings === 0) {
      contextMessage = 'O Louco olha para o abismo. Você dará o salto?';
      contextMessageEn = 'The Fool gazes into the abyss. Will you take the leap?';
    } else if (totalReadings < 5) {
      contextMessage = `Você atravessou ${totalReadings} ${totalReadings === 1 ? 'portal' : 'portais'}. A jornada apenas começou.`;
      contextMessageEn = `You crossed ${totalReadings} ${totalReadings === 1 ? 'portal' : 'portals'}. The journey has just begun.`;
    } else if (totalReadings < 15) {
      contextMessage = 'Padrões começam a emergir das sombras.';
      contextMessageEn = 'Patterns begin to emerge from the shadows.';
    } else if (totalReadings < 30) {
      contextMessage = 'Você está na metade do caminho visível. O invisível ainda aguarda.';
      contextMessageEn = 'You are halfway through the visible path. The invisible still awaits.';
    } else if (totalReadings < 50) {
      contextMessage = 'Os arcanos mais profundos começam a revelar-se.';
      contextMessageEn = 'The deeper arcana begin to reveal themselves.';
    } else if (totalReadings < 80) {
      contextMessage = 'Você caminha entre a luz e a sombra.';
      contextMessageEn = 'You walk between light and shadow.';
    } else if (totalReadings < 100) {
      contextMessage = 'O fim da espiral se aproxima. Ou seria um novo início?';
      contextMessageEn = 'The end of the spiral approaches. Or is it a new beginning?';
    } else {
      contextMessage = 'Você completou a espiral. A jornada continua em outro nível.';
      contextMessageEn = 'You completed the spiral. The journey continues on another level.';
    }

    return {
      totalReadings,
      daysSinceStart,
      unlockedMarkers,
      nextMarker,
      progressToNext,
      readingsToNext,
      allMarkers: ARCANA_JOURNEY,
      currentMarkerIndex: Math.max(0, currentMarkerIndex),
      totalProgress,
      contextMessage,
      contextMessageEn,
    };
  }, [readingsToday, profile]);
};

export default useJourneyProgress;
