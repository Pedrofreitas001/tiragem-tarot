/**
 * Card Content Service
 * ====================
 *
 * Este serviço mescla os dados padrão do tarot com conteúdo customizado.
 * Permite acessar módulos customizados para qualquer carta.
 */

import { TarotCardData, TAROT_CARDS } from '../tarotData';
import {
  CUSTOM_CARD_CONTENT,
  CustomCardContent,
  MODULE_DEFINITIONS,
  ModuleDefinition
} from '../data/customCardContent';

// Interface para carta com conteúdo expandido
export interface EnhancedTarotCard extends TarotCardData {
  customContent?: CustomCardContent;
  modules: CardModule[];
}

// Interface para um módulo de conteúdo
export interface CardModule {
  key: string;
  label: string;
  label_pt: string;
  icon: string;
  color: string;
  content: string;
  content_pt: string;
  order: number;
}

/**
 * Busca o conteúdo customizado de uma carta específica
 */
export const getCustomContent = (cardId: string): CustomCardContent | undefined => {
  return CUSTOM_CARD_CONTENT.find(c => c.cardId === cardId);
};

/**
 * Busca uma carta com todo seu conteúdo (padrão + customizado)
 */
export const getEnhancedCard = (cardId: string): EnhancedTarotCard | undefined => {
  const baseCard = TAROT_CARDS.find(c => c.id === cardId);
  if (!baseCard) return undefined;

  const customContent = getCustomContent(cardId);
  const modules = getCardModules(baseCard, customContent);

  return {
    ...baseCard,
    customContent,
    modules,
  };
};

/**
 * Retorna todos os módulos disponíveis para uma carta
 * Mescla módulos padrão (love, career, advice) com customizados
 */
export const getCardModules = (
  card: TarotCardData,
  customContent?: CustomCardContent
): CardModule[] => {
  const modules: CardModule[] = [];

  for (const def of MODULE_DEFINITIONS) {
    // Conteúdo do módulo (prioriza customizado sobre padrão)
    const content =
      customContent?.[def.key] ||
      (card as Record<string, unknown>)[def.key] as string | undefined;

    const content_pt =
      customContent?.[`${def.key}_pt`] ||
      (card as Record<string, unknown>)[`${def.key}_pt`] as string | undefined;

    // Só adiciona se houver conteúdo em pelo menos um idioma
    if (content || content_pt) {
      modules.push({
        key: def.key,
        label: def.label,
        label_pt: def.label_pt,
        icon: def.icon,
        color: def.color,
        content: content || '',
        content_pt: content_pt || '',
        order: def.order,
      });
    }
  }

  // Ordena por ordem definida
  return modules.sort((a, b) => a.order - b.order);
};

/**
 * Retorna um módulo específico de uma carta
 */
export const getCardModule = (
  cardId: string,
  moduleKey: string,
  isPortuguese: boolean = true
): string | undefined => {
  const card = TAROT_CARDS.find(c => c.id === cardId);
  if (!card) return undefined;

  const customContent = getCustomContent(cardId);
  const suffix = isPortuguese ? '_pt' : '';

  // Prioriza conteúdo customizado
  if (customContent) {
    const customValue = customContent[`${moduleKey}${suffix}`] || customContent[moduleKey];
    if (customValue) return customValue;
  }

  // Fallback para dados padrão
  const baseKey = isPortuguese ? `${moduleKey}_pt` : moduleKey;
  return (card as Record<string, unknown>)[baseKey] as string | undefined;
};

/**
 * Lista todas as cartas que têm conteúdo customizado
 */
export const getCardsWithCustomContent = (): string[] => {
  return CUSTOM_CARD_CONTENT.map(c => c.cardId);
};

/**
 * Verifica se uma carta tem um módulo específico
 */
export const cardHasModule = (cardId: string, moduleKey: string): boolean => {
  const card = TAROT_CARDS.find(c => c.id === cardId);
  if (!card) return false;

  const customContent = getCustomContent(cardId);

  // Verifica no conteúdo customizado
  if (customContent?.[moduleKey] || customContent?.[`${moduleKey}_pt`]) {
    return true;
  }

  // Verifica nos dados padrão
  const baseCard = card as Record<string, unknown>;
  return !!(baseCard[moduleKey] || baseCard[`${moduleKey}_pt`]);
};

/**
 * Retorna estatísticas de preenchimento dos módulos
 */
export const getContentStats = (): {
  totalCards: number;
  cardsWithCustomContent: number;
  modulesCoverage: Record<string, number>;
} => {
  const totalCards = TAROT_CARDS.length;
  const cardsWithCustomContent = CUSTOM_CARD_CONTENT.length;

  const modulesCoverage: Record<string, number> = {};

  for (const def of MODULE_DEFINITIONS) {
    let count = 0;
    for (const card of TAROT_CARDS) {
      if (cardHasModule(card.id, def.key)) {
        count++;
      }
    }
    modulesCoverage[def.key] = count;
  }

  return {
    totalCards,
    cardsWithCustomContent,
    modulesCoverage,
  };
};

/**
 * Helper para criar novo módulo de definição
 */
export const createModuleDefinition = (
  key: string,
  label: string,
  label_pt: string,
  icon: string,
  color: string,
  order: number
): ModuleDefinition => ({
  key,
  label,
  label_pt,
  icon,
  color,
  order,
});
