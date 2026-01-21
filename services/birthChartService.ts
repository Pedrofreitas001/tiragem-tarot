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

  const signDates = [
    { sign: 0, start: [3, 21], end: [4, 19] },   // Aries
    { sign: 1, start: [4, 20], end: [5, 20] },   // Taurus
    { sign: 2, start: [5, 21], end: [6, 20] },   // Gemini
    { sign: 3, start: [6, 21], end: [7, 22] },   // Cancer
    { sign: 4, start: [7, 23], end: [8, 22] },   // Leo
    { sign: 5, start: [8, 23], end: [9, 22] },   // Virgo
    { sign: 6, start: [9, 23], end: [10, 22] },  // Libra
    { sign: 7, start: [10, 23], end: [11, 21] }, // Scorpio
    { sign: 8, start: [11, 22], end: [12, 21] }, // Sagittarius
    { sign: 9, start: [12, 22], end: [1, 19] },  // Capricorn
    { sign: 10, start: [1, 20], end: [2, 18] },  // Aquarius
    { sign: 11, start: [2, 19], end: [3, 20] }   // Pisces
  ];

  for (const { sign, start, end } of signDates) {
    if (sign === 9) { // Capricorn spans year end
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return ZODIAC_SIGNS[sign];
      }
    } else if (
      (month === start[0] && day >= start[1]) ||
      (month === end[0] && day <= end[1])
    ) {
      return ZODIAC_SIGNS[sign];
    }
  }

  return ZODIAC_SIGNS[0];
};

// Estimate moon sign (simplified - would need ephemeris for accuracy)
export const getMoonSign = (birthDate: Date): ZodiacInfo => {
  // The moon moves through all 12 signs in ~28 days (~2.3 days per sign)
  // This is a simplified calculation
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const year = birthDate.getFullYear();

  // Use a simple hash based on date to distribute moon signs
  const moonCycle = 27.3; // days
  const offset = ((year - 2000) * 365 + dayOfYear) % moonCycle;
  const signIndex = Math.floor((offset / moonCycle) * 12) % 12;

  return ZODIAC_SIGNS[signIndex];
};

// Calculate rising sign (ascendant) based on birth time
export const getRisingSign = (birthDate: Date, birthHour: number): ZodiacInfo => {
  // The ascendant changes every ~2 hours
  // Simplified calculation: sun sign at birth + offset based on time
  const sunSignIndex = ZODIAC_SIGNS.findIndex(z => z.sign === getSunSign(birthDate).sign);

  // Each 2 hours shifts the rising sign by 1
  const hourOffset = Math.floor(birthHour / 2);

  // At sunrise (~6am), rising = sun sign. Adjust from there
  const risingIndex = (sunSignIndex + hourOffset - 3 + 12) % 12;

  return ZODIAC_SIGNS[risingIndex];
};

// Calculate simplified planetary positions
const calculatePlanetPositions = (birthDate: Date): Planet[] => {
  const planets: Planet[] = [];
  const sunSign = getSunSign(birthDate);
  const sunSignIndex = ZODIAC_SIGNS.findIndex(z => z.sign === sunSign.sign);

  // Simplified planetary positions based on birth date
  // In reality, this would require ephemeris data
  const planetOffsets: Record<string, number> = {
    Sun: 0,
    Moon: Math.floor(Math.random() * 12), // Already calculated separately
    Mercury: Math.floor(Math.random() * 3) - 1, // Usually within 1 sign of Sun
    Venus: Math.floor(Math.random() * 3) - 1,   // Usually within 2 signs of Sun
    Mars: Math.floor(Math.random() * 12),
    Jupiter: Math.floor(birthDate.getFullYear() / 12) % 12, // ~1 year per sign
    Saturn: Math.floor(birthDate.getFullYear() / 2.5) % 12, // ~2.5 years per sign
    Uranus: Math.floor(birthDate.getFullYear() / 7) % 12,   // ~7 years per sign
    Neptune: Math.floor(birthDate.getFullYear() / 14) % 12, // ~14 years per sign
    Pluto: Math.floor(birthDate.getFullYear() / 20) % 12    // ~20 years per sign
  };

  Object.entries(PLANET_DATA).forEach(([key, data], index) => {
    const signIndex = (sunSignIndex + (planetOffsets[key] || 0) + 12) % 12;
    planets.push({
      name: data.name,
      name_pt: data.name_pt,
      sign: ZODIAC_SIGNS[signIndex],
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
