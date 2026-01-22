import { ArcanaType, CardLore, Spread, Suit, TarotCard } from './types';
import { TAROT_CARDS, TarotCardData } from './tarotData';

// --- Deck Generation Logic ---
const MAJOR_ARCANA_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const MINOR_RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
// Codes used by sacred-texts for file naming (format: {suit}{rank}.jpg)
// Example: waac.jpg (Ace of Wands), wa02.jpg (Two of Wands), wapa.jpg (Page of Wands)
const MINOR_RANK_CODES = ["ac", "02", "03", "04", "05", "06", "07", "08", "09", "10", "pa", "kn", "qu", "ki"];

const getSuitPrefix = (suit: Suit): string => {
  switch (suit) {
    case Suit.WANDS: return 'wa';
    case Suit.CUPS: return 'cu';
    case Suit.SWORDS: return 'sw';
    case Suit.PENTACLES: return 'pe';
    default: return '';
  }
};

export const generateDeck = (): TarotCard[] => {
  const deck: TarotCard[] = [];
  const baseUrl = "https://www.sacred-texts.com/tarot/pkt/img";

  // Generate Major Arcana
  MAJOR_ARCANA_NAMES.forEach((name, index) => {
    // ar00.jpg, ar01.jpg, etc.
    const fileIndex = index.toString().padStart(2, '0');

    deck.push({
      id: `maj_${index}`,
      name,
      number: index,
      arcana: ArcanaType.MAJOR,
      suit: Suit.NONE,
      description: "A Major Arcana card representing significant life events.",
      imageSeed: `tarot_major_${index}`,
      imageUrl: `${baseUrl}/ar${fileIndex}.jpg`
    });
  });

  // Generate Minor Arcana
  Object.values(Suit).forEach((suit) => {
    if (suit === Suit.NONE) return;

    const suitPrefix = getSuitPrefix(suit as Suit);

    MINOR_RANKS.forEach((rank, index) => {
      const rankCode = MINOR_RANK_CODES[index];

      deck.push({
        id: `min_${suit}_${index}`,
        name: `${rank} of ${suit}`,
        number: index + 1,
        arcana: ArcanaType.MINOR,
        suit: suit as Suit,
        description: `A card from the suit of ${suit}.`,
        imageSeed: `tarot_${suit}_${index}`,
        imageUrl: `${baseUrl}/${suitPrefix}${rankCode}.jpg`
      });
    });
  });

  return deck;
};

export const SPREADS: Spread[] = [
  {
    id: 'three_card',
    name: 'Three Card Spread',
    description: 'Past, Present, and Future. A classic spread for quick insights.',
    difficulty: 'Beginner',
    cardCount: 3,
    positions: [
      { index: 0, name: 'The Past', description: 'Influences from the past affecting the situation.' },
      { index: 1, name: 'The Present', description: 'The current state of affairs.' },
      { index: 2, name: 'The Future', description: 'The likely outcome if things continue.' }
    ]
  },
  {
    id: 'celtic_cross',
    name: 'Celtic Cross',
    description: 'A deep dive into a specific situation, covering internal and external influences.',
    difficulty: 'Advanced',
    cardCount: 10,
    positions: [
      { index: 0, name: 'The Significator', description: 'The heart of the matter.' },
      { index: 1, name: 'The Crossing', description: 'What opposes or helps you.' },
      { index: 2, name: 'The Foundation', description: 'Root cause or subconscious influence.' },
      { index: 3, name: 'The Recent Past', description: 'Events just passing.' },
      { index: 4, name: 'The Crown', description: 'Higher goals or best outcome.' },
      { index: 5, name: 'The Near Future', description: 'Immediate next steps.' },
      { index: 6, name: 'The Self', description: 'How you see yourself.' },
      { index: 7, name: 'The Environment', description: 'How others see you or the situation.' },
      { index: 8, name: 'Hopes & Fears', description: 'Psychological state.' },
      { index: 9, name: 'The Outcome', description: 'The final result.' }
    ]
  },
  {
    id: 'love_check',
    name: 'Love & Relationship',
    description: 'Understand the dynamics between you and a partner.',
    difficulty: 'Intermediate',
    cardCount: 5,
    positions: [
      { index: 0, name: 'You', description: 'Your role in the relationship.' },
      { index: 1, name: 'Them', description: 'Their role and feelings.' },
      { index: 2, name: 'Relationship', description: 'The current state of the bond.' },
      { index: 3, name: 'Challenge', description: 'What is blocking harmony.' },
      { index: 4, name: 'Advice', description: 'How to proceed.' }
    ]
  },
  {
    id: 'yes_no',
    name: 'Yes or No',
    description: 'Get a direct answer to your question with a single card.',
    difficulty: 'Beginner',
    cardCount: 1,
    positions: [
      { index: 0, name: 'Answer', description: 'The universe\'s response to your question.' }
    ]
  },
  {
    id: 'card_of_day',
    name: 'Card of the Day',
    description: 'Discover what energy and guidance the day holds for you.',
    difficulty: 'Beginner',
    cardCount: 1,
    positions: [
      { index: 0, name: 'Today\'s Energy', description: 'The main theme and lesson for your day.' }
    ]
  }
];

// --- Static Lore Database ---
// Now using the complete TAROT_CARDS database from tarotData.ts

// Helper function to find card data from the complete database
const findCardData = (card: TarotCard): TarotCardData | undefined => {
  return TAROT_CARDS.find(c => c.id === card.id || c.name === card.name);
};

// Helper to generate deterministic lore for cards using complete database
export const getStaticLore = (card: TarotCard, isPortuguese: boolean = true): CardLore => {
  // 1. Look up card in the complete TAROT_CARDS database
  const cardData = findCardData(card);

  if (cardData) {
    return {
      keywords: isPortuguese ? cardData.keywords_pt : cardData.keywords,
      generalMeaning: isPortuguese ? cardData.meaning_up_pt : cardData.meaning_up,
      love: cardData.love,
      career: cardData.career,
      advice: cardData.advice,
      reversed: isPortuguese ? cardData.meaning_rev_pt : cardData.meaning_rev
    };
  }

  // 2. Fallback for any cards not in database (should not happen with complete database)
  const suitMeanings = {
    [Suit.WANDS]: { element: "Fogo", area: "paixão, inspiração e força de vontade" },
    [Suit.CUPS]: { element: "Água", area: "emoções, relacionamentos e intuição" },
    [Suit.SWORDS]: { element: "Ar", area: "intelecto, lógica e conflito" },
    [Suit.PENTACLES]: { element: "Terra", area: "dinheiro, trabalho e mundo material" },
    [Suit.NONE]: { element: "Espírito", area: "jornada da alma" }
  };

  const sInfo = suitMeanings[card.suit] || suitMeanings[Suit.NONE];

  return {
    keywords: ["Evolução", "Ciclo", "Lição"],
    generalMeaning: `Esta carta representa um estágio de desenvolvimento nas questões de ${sInfo.area}. É um momento de lidar com as realidades do elemento ${sInfo.element}.`,
    love: `Uma situação em evolução que requer atenção às emoções.`,
    career: `Desenvolvimentos na carreira relacionados a ${sInfo.area}.`,
    advice: `Reflita sobre como a energia de ${sInfo.area} está se manifestando em sua vida agora.`,
    reversed: "A energia está bloqueada ou sendo expressa de forma negativa. Cuidado com excessos ou negligência."
  };
};
