/**
 * Card Texts Loader
 * =================
 *
 * Este módulo carrega os textos do arquivo JSON e os converte
 * para o formato usado pelo sistema de conteúdo customizado.
 *
 * COMO FUNCIONA:
 * 1. Carrega cardTexts.json
 * 2. Converte para o formato CustomCardContent
 * 3. Exporta para uso no cardContentService
 */

import cardTextsJson from './cardTexts.json';
import { CustomCardContent, MODULE_DEFINITIONS, ModuleDefinition } from './customCardContent';

// Type definitions for the JSON structure
interface JsonModuleContent {
  en: string;
  pt: string;
}

interface JsonCardData {
  name: string;
  modules: Record<string, JsonModuleContent>;
}

interface CardTextsJson {
  _instructions: unknown;
  cards: Record<string, JsonCardData>;
  _template: unknown;
}

/**
 * Carrega e converte os textos do JSON para CustomCardContent
 */
export const loadCardTextsFromJson = (): CustomCardContent[] => {
  const json = cardTextsJson as CardTextsJson;
  const result: CustomCardContent[] = [];

  // Itera sobre cada carta no JSON
  for (const [cardId, cardData] of Object.entries(json.cards)) {
    if (!cardData.modules) continue;

    const customContent: CustomCardContent = {
      cardId,
    };

    // Converte cada módulo
    for (const [moduleKey, moduleContent] of Object.entries(cardData.modules)) {
      if (moduleContent.en && moduleContent.en.trim()) {
        customContent[moduleKey] = moduleContent.en;
      }
      if (moduleContent.pt && moduleContent.pt.trim()) {
        customContent[`${moduleKey}_pt`] = moduleContent.pt;
      }
    }

    // Só adiciona se tiver algum conteúdo além do cardId
    if (Object.keys(customContent).length > 1) {
      result.push(customContent);
    }
  }

  return result;
};

/**
 * Mescla conteúdo do JSON com conteúdo do TypeScript
 * O TypeScript tem prioridade (permite sobrescrita manual)
 */
export const mergeCardContent = (
  tsContent: CustomCardContent[],
  jsonContent: CustomCardContent[]
): CustomCardContent[] => {
  const merged = new Map<string, CustomCardContent>();

  // Primeiro, adiciona conteúdo do JSON
  for (const content of jsonContent) {
    merged.set(content.cardId, { ...content });
  }

  // Depois, mescla/sobrescreve com conteúdo do TS
  for (const content of tsContent) {
    const existing = merged.get(content.cardId);
    if (existing) {
      merged.set(content.cardId, { ...existing, ...content });
    } else {
      merged.set(content.cardId, { ...content });
    }
  }

  return Array.from(merged.values());
};

/**
 * Detecta novos módulos no JSON e os registra automaticamente
 */
export const detectAndRegisterModules = (): void => {
  const json = cardTextsJson as CardTextsJson;
  const existingKeys = new Set(MODULE_DEFINITIONS.map(m => m.key));

  for (const cardData of Object.values(json.cards)) {
    if (!cardData.modules) continue;

    for (const moduleKey of Object.keys(cardData.modules)) {
      if (!existingKeys.has(moduleKey)) {
        // Cria definição padrão para módulo novo
        const newModule: ModuleDefinition = {
          key: moduleKey,
          label: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1).replace(/_/g, ' '),
          label_pt: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1).replace(/_/g, ' '),
          icon: 'article', // ícone padrão
          color: 'gray',    // cor padrão
          order: MODULE_DEFINITIONS.length + 1,
        };

        MODULE_DEFINITIONS.push(newModule);
        existingKeys.add(moduleKey);

        console.log(`[CardTexts] Novo módulo detectado e registrado: ${moduleKey}`);
      }
    }
  }
};

/**
 * Inicializa o sistema de textos customizados
 * Chame esta função no início da aplicação
 */
export const initializeCardTexts = (): CustomCardContent[] => {
  // Detecta e registra novos módulos
  detectAndRegisterModules();

  // Carrega do JSON
  return loadCardTextsFromJson();
};

// Exporta os textos carregados
export const JSON_CARD_CONTENT = loadCardTextsFromJson();
