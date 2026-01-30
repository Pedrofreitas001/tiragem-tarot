export enum ArcanaType {
  MAJOR = 'Major Arcana',
  MINOR = 'Minor Arcana'
}

export enum Suit {
  WANDS = 'Wands',
  CUPS = 'Cups',
  SWORDS = 'Swords',
  PENTACLES = 'Pentacles',
  NONE = 'None' // For Major Arcana
}

export interface TarotCard {
  id: string;
  name: string;
  name_pt?: string;
  slug?: string;
  slug_pt?: string;
  number: number;
  arcana: ArcanaType;
  suit: Suit;
  description: string;
  imageSeed?: string; // Kept for fallbacks or effects
  imageUrl: string;  // Direct link to the card image
}

export interface SpreadPosition {
  index: number;
  name: string;
  description: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ReadingSession {
  spread: Spread;
  cards: TarotCard[];
  reversedIndices: number[]; // Track which cards are reversed
  question: string;
  date: string;
}

export interface ReadingAnalysis {
  synthesis: string;
  cards: {
    index: number;
    name: string;
    interpretation: string;
    keywords: string[];
  }[];
  advice: string;
}

// New Types for Lore and History
export interface CardLore {
  keywords: string[];
  generalMeaning: string;
  love: string;
  career: string;
  advice: string;
  reversed: string;
  description?: string;
}

export interface HistoryItem {
  id: number;
  date: string;
  spreadName: string;
  typeBadge: string; // e.g., 'AMOR', 'DIÁRIA'
  typeColor: string; // Tailwind color class stub
  previewCards: string[]; // URLs
  notes: string;
}
