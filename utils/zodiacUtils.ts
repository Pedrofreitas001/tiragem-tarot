import { ZodiacSign, ZODIAC_SIGNS, ZODIAC_ORDER } from '../data/zodiacData';
import { TAROT_CARDS } from '../tarotData';

/**
 * Calcula o signo do zodíaco a partir de uma data de nascimento
 */
export const getZodiacSignFromBirthDate = (birthDate: Date | string): ZodiacSign => {
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const month = date.getMonth() + 1; // getMonth() retorna 0-11
  const day = date.getDate();

  // Formato MM-DD para comparação
  const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // Verificar cada signo
  for (const sign of ZODIAC_ORDER) {
    const { start, end } = ZODIAC_SIGNS[sign].dateRange;

    // Caso especial para Capricórnio (atravessa o ano)
    if (sign === 'capricornio') {
      if (mmdd >= start || mmdd <= end) {
        return sign;
      }
    } else {
      if (mmdd >= start && mmdd <= end) {
        return sign;
      }
    }
  }

  // Default para Áries (não deveria chegar aqui)
  return 'aries';
};

/**
 * Obtém o dia do ano (1-366)
 */
const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

/**
 * Gera um número pseudo-aleatório baseado em uma seed
 */
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/**
 * Obtém as 3 cartas do dia para um signo específico
 * A tiragem é determinística: mesmas cartas para todos os usuários do mesmo signo no mesmo dia
 */
export const getDailyCardsForSign = (sign: ZodiacSign): typeof TAROT_CARDS[number][] => {
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const signIndex = ZODIAC_ORDER.indexOf(sign);

  // Seed único por signo + dia + ano
  const year = today.getFullYear();
  const baseSeed = (year * 1000 + dayOfYear) * 12 + signIndex;

  // Seleciona 3 cartas únicas deterministicamente
  const selectedIndices: number[] = [];
  let attempts = 0;

  while (selectedIndices.length < 3 && attempts < 100) {
    const seed = baseSeed + attempts * 7919; // Número primo para variar
    const randomValue = seededRandom(seed);
    const cardIndex = Math.floor(randomValue * TAROT_CARDS.length);

    if (!selectedIndices.includes(cardIndex)) {
      selectedIndices.push(cardIndex);
    }
    attempts++;
  }

  return selectedIndices.map(index => TAROT_CARDS[index]);
};

/**
 * Valida se um slug é um signo válido
 */
export const isValidZodiacSign = (slug: string): slug is ZodiacSign => {
  return ZODIAC_ORDER.includes(slug as ZodiacSign);
};

/**
 * Obtém o nome do signo no idioma correto
 */
export const getSignName = (sign: ZodiacSign, isPortuguese: boolean): string => {
  return isPortuguese ? ZODIAC_SIGNS[sign].name.pt : ZODIAC_SIGNS[sign].name.en;
};

/**
 * Obtém as palavras-chave do signo no idioma correto
 */
export const getSignKeywords = (sign: ZodiacSign, isPortuguese: boolean): string[] => {
  return isPortuguese ? ZODIAC_SIGNS[sign].keywords.pt : ZODIAC_SIGNS[sign].keywords.en;
};

/**
 * Formata a data atual para exibição
 */
export const getFormattedDate = (isPortuguese: boolean): string => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return today.toLocaleDateString(isPortuguese ? 'pt-BR' : 'en-US', options);
};

/**
 * Gera a chave de cache para a síntese de um signo
 */
export const getSignSynthesisCacheKey = (sign: ZodiacSign): string => {
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return `tarot-signo-${sign}-${dateKey}`;
};
