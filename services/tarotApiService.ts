// Tarot API Service - https://tarotapi.dev/api/v1
// Using the Render.com server as fallback

const API_BASE_URL = 'https://tarotapi.dev/api/v1';
const FALLBACK_URL = 'https://tarot-api-3hv5.onrender.com/api/v1';

export interface ApiTarotCard {
  name_short: string;
  name: string;
  value: string;
  value_int: number;
  type: 'major' | 'minor';
  suit?: string;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
}

export interface ApiResponse {
  nhits: number;
  cards: ApiTarotCard[];
}

// Cache for API responses
let cachedCards: ApiTarotCard[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Fetch helper with fallback
async function fetchWithFallback(endpoint: string): Promise<Response> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    if (response.ok) return response;
    throw new Error('Primary API failed');
  } catch {
    // Try fallback server
    return fetch(`${FALLBACK_URL}${endpoint}`, {
      signal: AbortSignal.timeout(8000) // 8 second timeout for fallback
    });
  }
}

// Get all cards from API
export async function fetchAllCards(): Promise<ApiTarotCard[]> {
  // Check cache
  const now = Date.now();
  if (cachedCards && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedCards;
  }

  try {
    const response = await fetchWithFallback('/cards');
    if (!response.ok) throw new Error('API request failed');

    const data: ApiResponse = await response.json();
    cachedCards = data.cards;
    cacheTimestamp = now;
    return data.cards;
  } catch (error) {
    console.error('Failed to fetch tarot cards from API:', error);
    return cachedCards || []; // Return cached data if available
  }
}

// Get random cards from API
export async function fetchRandomCards(count: number = 3): Promise<ApiTarotCard[]> {
  try {
    const response = await fetchWithFallback(`/cards/random?n=${count}`);
    if (!response.ok) throw new Error('API request failed');

    const data: ApiResponse = await response.json();
    return data.cards;
  } catch (error) {
    console.error('Failed to fetch random cards from API:', error);
    return [];
  }
}

// Get card by name (most reliable method)
export async function fetchCardByName(name: string): Promise<ApiTarotCard | null> {
  const cards = await fetchAllCards();

  // Normalize name for comparison
  const normalizedName = name.toLowerCase().trim();

  // Try exact match first
  let found = cards.find(c => c.name.toLowerCase() === normalizedName);
  if (found) return found;

  // Try partial match
  found = cards.find(c => c.name.toLowerCase().includes(normalizedName) ||
                          normalizedName.includes(c.name.toLowerCase()));
  if (found) return found;

  // Handle variations in naming (e.g., "Ace of Wands" vs "The Ace of Wands")
  const withoutThe = normalizedName.replace(/^the\s+/, '');
  found = cards.find(c => c.name.toLowerCase().includes(withoutThe));

  return found || null;
}

// Get cards by suit
export async function fetchCardsBySuit(suit: 'wands' | 'cups' | 'swords' | 'pentacles'): Promise<ApiTarotCard[]> {
  try {
    const response = await fetchWithFallback(`/cards/suits/${suit}`);
    if (!response.ok) throw new Error('API request failed');

    const data: ApiResponse = await response.json();
    return data.cards;
  } catch (error) {
    console.error(`Failed to fetch ${suit} cards from API:`, error);
    return [];
  }
}

// Get major arcana cards
export async function fetchMajorArcana(): Promise<ApiTarotCard[]> {
  try {
    const response = await fetchWithFallback('/cards/search?type=major');
    if (!response.ok) throw new Error('API request failed');

    const data: ApiResponse = await response.json();
    return data.cards;
  } catch (error) {
    console.error('Failed to fetch major arcana from API:', error);
    return [];
  }
}

// Search cards
export async function searchCards(query: string): Promise<ApiTarotCard[]> {
  try {
    const response = await fetchWithFallback(`/cards/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('API request failed');

    const data: ApiResponse = await response.json();
    return data.cards;
  } catch (error) {
    console.error('Failed to search cards:', error);
    return [];
  }
}

// Convert API card data to CardLore format
export function apiCardToLore(apiCard: ApiTarotCard): {
  keywords: string[];
  generalMeaning: string;
  love: string;
  career: string;
  advice: string;
  reversed: string;
  description: string;
} {
  // Extract keywords from meaning_up (first few words/phrases)
  const keywords = apiCard.meaning_up
    .split(',')
    .slice(0, 4)
    .map(k => k.trim())
    .filter(k => k.length > 0 && k.length < 30);

  return {
    keywords,
    generalMeaning: apiCard.meaning_up,
    love: `Esta carta em questões de amor sugere: ${apiCard.meaning_up.split('.')[0]}.`,
    career: `No trabalho e carreira: ${apiCard.meaning_up.split('.')[0]}.`,
    advice: apiCard.desc ? apiCard.desc.slice(0, 200) + '...' : apiCard.meaning_up,
    reversed: apiCard.meaning_rev,
    description: apiCard.desc
  };
}

// Preload cards on module import (lazy)
let preloadPromise: Promise<void> | null = null;
export function preloadCards(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = fetchAllCards().then(() => {});
  }
  return preloadPromise;
}

export default {
  fetchAllCards,
  fetchRandomCards,
  fetchCardByName,
  fetchCardsBySuit,
  fetchMajorArcana,
  searchCards,
  apiCardToLore,
  preloadCards
};
