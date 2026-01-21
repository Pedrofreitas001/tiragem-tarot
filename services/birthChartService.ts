// Birth Chart / Natal Chart Service
// Simplified astrological calculations based on birth date and time

export interface Planet {
  name: string;
  name_pt: string;
  sign: ZodiacInfo;
  house: number;
  description: string;
  description_pt: string;
  icon: string;
}

export interface ZodiacInfo {
  sign: string;
  sign_pt: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  element_pt: string;
  modality: 'cardinal' | 'fixed' | 'mutable';
  modality_pt: string;
  ruling_planet: string;
  ruling_planet_pt: string;
  icon: string;
}

export interface House {
  number: number;
  sign: ZodiacInfo;
  name: string;
  name_pt: string;
  meaning: string;
  meaning_pt: string;
}

export interface BirthChart {
  sunSign: ZodiacInfo;
  moonSign: ZodiacInfo;
  risingSign: ZodiacInfo;
  planets: Planet[];
  houses: House[];
  elements: { fire: number; earth: number; air: number; water: number };
  modalities: { cardinal: number; fixed: number; mutable: number };
  dominantElement: string;
  dominantModality: string;
}

// Zodiac signs data
const ZODIAC_SIGNS: ZodiacInfo[] = [
  { sign: 'Aries', sign_pt: 'Áries', element: 'fire', element_pt: 'Fogo', modality: 'cardinal', modality_pt: 'Cardinal', ruling_planet: 'Mars', ruling_planet_pt: 'Marte', icon: '♈' },
  { sign: 'Taurus', sign_pt: 'Touro', element: 'earth', element_pt: 'Terra', modality: 'fixed', modality_pt: 'Fixo', ruling_planet: 'Venus', ruling_planet_pt: 'Vênus', icon: '♉' },
  { sign: 'Gemini', sign_pt: 'Gêmeos', element: 'air', element_pt: 'Ar', modality: 'mutable', modality_pt: 'Mutável', ruling_planet: 'Mercury', ruling_planet_pt: 'Mercúrio', icon: '♊' },
  { sign: 'Cancer', sign_pt: 'Câncer', element: 'water', element_pt: 'Água', modality: 'cardinal', modality_pt: 'Cardinal', ruling_planet: 'Moon', ruling_planet_pt: 'Lua', icon: '♋' },
  { sign: 'Leo', sign_pt: 'Leão', element: 'fire', element_pt: 'Fogo', modality: 'fixed', modality_pt: 'Fixo', ruling_planet: 'Sun', ruling_planet_pt: 'Sol', icon: '♌' },
  { sign: 'Virgo', sign_pt: 'Virgem', element: 'earth', element_pt: 'Terra', modality: 'mutable', modality_pt: 'Mutável', ruling_planet: 'Mercury', ruling_planet_pt: 'Mercúrio', icon: '♍' },
  { sign: 'Libra', sign_pt: 'Libra', element: 'air', element_pt: 'Ar', modality: 'cardinal', modality_pt: 'Cardinal', ruling_planet: 'Venus', ruling_planet_pt: 'Vênus', icon: '♎' },
  { sign: 'Scorpio', sign_pt: 'Escorpião', element: 'water', element_pt: 'Água', modality: 'fixed', modality_pt: 'Fixo', ruling_planet: 'Pluto', ruling_planet_pt: 'Plutão', icon: '♏' },
  { sign: 'Sagittarius', sign_pt: 'Sagitário', element: 'fire', element_pt: 'Fogo', modality: 'mutable', modality_pt: 'Mutável', ruling_planet: 'Jupiter', ruling_planet_pt: 'Júpiter', icon: '♐' },
  { sign: 'Capricorn', sign_pt: 'Capricórnio', element: 'earth', element_pt: 'Terra', modality: 'cardinal', modality_pt: 'Cardinal', ruling_planet: 'Saturn', ruling_planet_pt: 'Saturno', icon: '♑' },
  { sign: 'Aquarius', sign_pt: 'Aquário', element: 'air', element_pt: 'Ar', modality: 'fixed', modality_pt: 'Fixo', ruling_planet: 'Uranus', ruling_planet_pt: 'Urano', icon: '♒' },
  { sign: 'Pisces', sign_pt: 'Peixes', element: 'water', element_pt: 'Água', modality: 'mutable', modality_pt: 'Mutável', ruling_planet: 'Neptune', ruling_planet_pt: 'Netuno', icon: '♓' }
];

// House meanings
const HOUSE_MEANINGS = [
  { name: 'First House', name_pt: 'Casa 1', meaning: 'Self, identity, appearance', meaning_pt: 'Eu, identidade, aparência' },
  { name: 'Second House', name_pt: 'Casa 2', meaning: 'Values, possessions, money', meaning_pt: 'Valores, posses, dinheiro' },
  { name: 'Third House', name_pt: 'Casa 3', meaning: 'Communication, siblings, learning', meaning_pt: 'Comunicação, irmãos, aprendizado' },
  { name: 'Fourth House', name_pt: 'Casa 4', meaning: 'Home, family, roots', meaning_pt: 'Lar, família, raízes' },
  { name: 'Fifth House', name_pt: 'Casa 5', meaning: 'Creativity, romance, children', meaning_pt: 'Criatividade, romance, filhos' },
  { name: 'Sixth House', name_pt: 'Casa 6', meaning: 'Health, work, service', meaning_pt: 'Saúde, trabalho, serviço' },
  { name: 'Seventh House', name_pt: 'Casa 7', meaning: 'Partnerships, marriage, others', meaning_pt: 'Parcerias, casamento, outros' },
  { name: 'Eighth House', name_pt: 'Casa 8', meaning: 'Transformation, shared resources', meaning_pt: 'Transformação, recursos compartilhados' },
  { name: 'Ninth House', name_pt: 'Casa 9', meaning: 'Philosophy, travel, higher learning', meaning_pt: 'Filosofia, viagens, estudos superiores' },
  { name: 'Tenth House', name_pt: 'Casa 10', meaning: 'Career, reputation, public image', meaning_pt: 'Carreira, reputação, imagem pública' },
  { name: 'Eleventh House', name_pt: 'Casa 11', meaning: 'Friends, groups, hopes', meaning_pt: 'Amigos, grupos, esperanças' },
  { name: 'Twelfth House', name_pt: 'Casa 12', meaning: 'Subconscious, spirituality, hidden', meaning_pt: 'Subconsciente, espiritualidade, oculto' }
];

// Planet descriptions
const PLANET_DATA = {
  Sun: { name: 'Sun', name_pt: 'Sol', icon: 'light_mode', desc: 'Core identity and ego', desc_pt: 'Identidade central e ego' },
  Moon: { name: 'Moon', name_pt: 'Lua', icon: 'dark_mode', desc: 'Emotions and inner self', desc_pt: 'Emoções e eu interior' },
  Mercury: { name: 'Mercury', name_pt: 'Mercúrio', icon: 'chat', desc: 'Communication and intellect', desc_pt: 'Comunicação e intelecto' },
  Venus: { name: 'Venus', name_pt: 'Vênus', icon: 'favorite', desc: 'Love and values', desc_pt: 'Amor e valores' },
  Mars: { name: 'Mars', name_pt: 'Marte', icon: 'local_fire_department', desc: 'Action and desire', desc_pt: 'Ação e desejo' },
  Jupiter: { name: 'Jupiter', name_pt: 'Júpiter', icon: 'auto_awesome', desc: 'Expansion and luck', desc_pt: 'Expansão e sorte' },
  Saturn: { name: 'Saturn', name_pt: 'Saturno', icon: 'architecture', desc: 'Structure and discipline', desc_pt: 'Estrutura e disciplina' },
  Uranus: { name: 'Uranus', name_pt: 'Urano', icon: 'bolt', desc: 'Innovation and change', desc_pt: 'Inovação e mudança' },
  Neptune: { name: 'Neptune', name_pt: 'Netuno', icon: 'water_drop', desc: 'Dreams and intuition', desc_pt: 'Sonhos e intuição' },
  Pluto: { name: 'Pluto', name_pt: 'Plutão', icon: 'transform', desc: 'Transformation and power', desc_pt: 'Transformação e poder' }
};

// Get sun sign based on birth date
export const getSunSign = (birthDate: Date): ZodiacInfo => {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // Handle invalid dates
  if (isNaN(month) || isNaN(day)) {
    return ZODIAC_SIGNS[0]; // Default to Aries
  }

  // Simple and reliable date-based lookup
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0];  // Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1];  // Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[2];  // Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3];  // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4];  // Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5];  // Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[6]; // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[7]; // Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8]; // Sagittarius
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9];  // Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10];  // Aquarius
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_SIGNS[11];  // Pisces

  return ZODIAC_SIGNS[0]; // Default to Aries
};

// Estimate moon sign (simplified - would need ephemeris for accuracy)
export const getMoonSign = (birthDate: Date): ZodiacInfo => {
  // Handle invalid dates
  if (!birthDate || isNaN(birthDate.getTime())) {
    return ZODIAC_SIGNS[0];
  }

  // The moon moves through all 12 signs in ~28 days (~2.3 days per sign)
  // This is a simplified calculation
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const year = birthDate.getFullYear();

  // Use a simple hash based on date to distribute moon signs
  const moonCycle = 27.3; // days
  const offset = ((year - 2000) * 365 + dayOfYear) % moonCycle;
  const signIndex = Math.floor((offset / moonCycle) * 12) % 12;

  // Ensure valid index
  const safeIndex = Math.abs(signIndex) % 12;
  return ZODIAC_SIGNS[safeIndex] || ZODIAC_SIGNS[0];
};

// Calculate rising sign (ascendant) based on birth time
export const getRisingSign = (birthDate: Date, birthHour: number): ZodiacInfo => {
  // Handle invalid dates
  if (!birthDate || isNaN(birthDate.getTime())) {
    return ZODIAC_SIGNS[0];
  }

  // The ascendant changes every ~2 hours
  // Simplified calculation: sun sign at birth + offset based on time
  const sunSign = getSunSign(birthDate);
  const sunSignIndex = ZODIAC_SIGNS.findIndex(z => z.sign === sunSign.sign);

  // Each 2 hours shifts the rising sign by 1
  const safeHour = isNaN(birthHour) ? 12 : birthHour;
  const hourOffset = Math.floor(safeHour / 2);

  // At sunrise (~6am), rising = sun sign. Adjust from there
  const risingIndex = ((sunSignIndex >= 0 ? sunSignIndex : 0) + hourOffset - 3 + 12) % 12;

  return ZODIAC_SIGNS[risingIndex] || ZODIAC_SIGNS[0];
};

// Calculate simplified planetary positions
const calculatePlanetPositions = (birthDate: Date): Planet[] => {
  const planets: Planet[] = [];
  const sunSign = getSunSign(birthDate);
  const sunSignIndex = ZODIAC_SIGNS.findIndex(z => z.sign === sunSign.sign);

  // Ensure valid index
  const safeIndex = sunSignIndex >= 0 ? sunSignIndex : 0;
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const year = birthDate.getFullYear();

  // Simplified planetary positions based on birth date (deterministic, no random)
  // In reality, this would require ephemeris data
  const planetOffsets: Record<string, number> = {
    Sun: 0,
    Moon: Math.floor((dayOfYear * 12) / 365) % 12, // Approximate moon position
    Mercury: ((dayOfYear % 88) * 12 / 88) | 0, // Mercury orbit ~88 days
    Venus: ((dayOfYear % 225) * 12 / 225) | 0, // Venus orbit ~225 days
    Mars: ((dayOfYear % 687) * 12 / 687) | 0, // Mars orbit ~687 days
    Jupiter: Math.floor(year / 12) % 12, // ~12 years per cycle
    Saturn: Math.floor(year / 2.5) % 12, // ~29 years per cycle
    Uranus: Math.floor(year / 7) % 12,   // ~84 years per cycle
    Neptune: Math.floor(year / 14) % 12, // ~165 years per cycle
    Pluto: Math.floor(year / 20) % 12    // ~248 years per cycle
  };

  Object.entries(PLANET_DATA).forEach(([key, data], index) => {
    const signIndex = (safeIndex + (planetOffsets[key] || 0) + 12) % 12;
    const finalSign = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
    planets.push({
      name: data.name,
      name_pt: data.name_pt,
      sign: finalSign,
      house: (index % 12) + 1,
      description: data.desc,
      description_pt: data.desc_pt,
      icon: data.icon
    });
  });

  return planets;
};

// Calculate houses
const calculateHouses = (risingSign: ZodiacInfo): House[] => {
  const risingIndex = ZODIAC_SIGNS.findIndex(z => z.sign === risingSign.sign);

  return HOUSE_MEANINGS.map((house, index) => ({
    number: index + 1,
    sign: ZODIAC_SIGNS[(risingIndex + index) % 12],
    name: house.name,
    name_pt: house.name_pt,
    meaning: house.meaning,
    meaning_pt: house.meaning_pt
  }));
};

// Calculate element and modality distribution
const calculateDistributions = (planets: Planet[]) => {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities = { cardinal: 0, fixed: 0, mutable: 0 };

  planets.forEach(planet => {
    elements[planet.sign.element]++;
    modalities[planet.sign.modality]++;
  });

  const dominantElement = Object.entries(elements).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const dominantModality = Object.entries(modalities).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return { elements, modalities, dominantElement, dominantModality };
};

// Main function to calculate birth chart
export const calculateBirthChart = (
  birthDate: Date,
  birthHour: number = 12 // Default to noon if time unknown
): BirthChart => {
  const sunSign = getSunSign(birthDate);
  const moonSign = getMoonSign(birthDate);
  const risingSign = getRisingSign(birthDate, birthHour);
  const planets = calculatePlanetPositions(birthDate);
  const houses = calculateHouses(risingSign);
  const { elements, modalities, dominantElement, dominantModality } = calculateDistributions(planets);

  return {
    sunSign,
    moonSign,
    risingSign,
    planets,
    houses,
    elements,
    modalities,
    dominantElement,
    dominantModality
  };
};

// Get element color
export const getElementColor = (element: string): string => {
  switch (element) {
    case 'fire': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'earth': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    case 'air': return 'text-sky-400 bg-sky-500/20 border-sky-500/30';
    case 'water': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

// Get sign interpretation
export const getSignInterpretation = (sign: ZodiacInfo, isPortuguese: boolean): string => {
  const interpretations: Record<string, { en: string; pt: string }> = {
    Aries: {
      en: 'Bold, pioneering energy. You approach life with courage and enthusiasm, always ready to take initiative.',
      pt: 'Energia ousada e pioneira. Você aborda a vida com coragem e entusiasmo, sempre pronto para tomar iniciativa.'
    },
    Taurus: {
      en: 'Grounded, sensual energy. You value stability, comfort, and the finer things in life.',
      pt: 'Energia centrada e sensual. Você valoriza estabilidade, conforto e as coisas boas da vida.'
    },
    Gemini: {
      en: 'Curious, adaptable energy. You thrive on communication, learning, and variety.',
      pt: 'Energia curiosa e adaptável. Você prospera com comunicação, aprendizado e variedade.'
    },
    Cancer: {
      en: 'Nurturing, intuitive energy. You are deeply connected to emotions, family, and home.',
      pt: 'Energia protetora e intuitiva. Você está profundamente conectado às emoções, família e lar.'
    },
    Leo: {
      en: 'Creative, confident energy. You shine brightest when expressing yourself and leading others.',
      pt: 'Energia criativa e confiante. Você brilha mais quando se expressa e lidera outros.'
    },
    Virgo: {
      en: 'Analytical, service-oriented energy. You excel at details, organization, and helping others.',
      pt: 'Energia analítica e de serviço. Você se destaca em detalhes, organização e ajudar outros.'
    },
    Libra: {
      en: 'Harmonious, diplomatic energy. You seek balance, beauty, and meaningful partnerships.',
      pt: 'Energia harmoniosa e diplomática. Você busca equilíbrio, beleza e parcerias significativas.'
    },
    Scorpio: {
      en: 'Intense, transformative energy. You dive deep into life\'s mysteries and embrace change.',
      pt: 'Energia intensa e transformadora. Você mergulha nos mistérios da vida e abraça a mudança.'
    },
    Sagittarius: {
      en: 'Adventurous, philosophical energy. You seek truth, freedom, and new horizons.',
      pt: 'Energia aventureira e filosófica. Você busca verdade, liberdade e novos horizontes.'
    },
    Capricorn: {
      en: 'Ambitious, disciplined energy. You build lasting achievements through patience and dedication.',
      pt: 'Energia ambiciosa e disciplinada. Você constrói conquistas duradouras com paciência e dedicação.'
    },
    Aquarius: {
      en: 'Innovative, humanitarian energy. You think ahead of your time and champion collective progress.',
      pt: 'Energia inovadora e humanitária. Você pensa à frente do seu tempo e defende o progresso coletivo.'
    },
    Pisces: {
      en: 'Intuitive, compassionate energy. You are deeply connected to the spiritual and emotional realms.',
      pt: 'Energia intuitiva e compassiva. Você está profundamente conectado aos reinos espiritual e emocional.'
    }
  };

  const interp = interpretations[sign.sign] || { en: '', pt: '' };
  return isPortuguese ? interp.pt : interp.en;
};
