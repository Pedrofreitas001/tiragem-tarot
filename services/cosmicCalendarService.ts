// Cosmic Calendar Service - Moon Phases, Planetary Hours, and Cosmic Events

export interface MoonPhase {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  illumination: number; // 0-100
  name: string;
  name_pt: string;
  description: string;
  description_pt: string;
  icon: string;
  energy: string;
  energy_pt: string;
  rituals: string[];
  rituals_pt: string[];
}

export interface PlanetaryHour {
  planet: string;
  planet_pt: string;
  startTime: Date;
  endTime: Date;
  qualities: string[];
  qualities_pt: string[];
  color: string;
  icon: string;
}

export interface ZodiacSign {
  sign: string;
  sign_pt: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  element_pt: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  ruling_planet: string;
  ruling_planet_pt: string;
  qualities: string[];
  qualities_pt: string[];
  icon: string;
}

export interface CosmicDay {
  date: Date;
  moonPhase: MoonPhase;
  zodiacSun: ZodiacSign;
  planetaryRuler: PlanetaryHour;
  cosmicEnergy: number; // 1-10
  bestFor: string[];
  bestFor_pt: string[];
  avoid: string[];
  avoid_pt: string[];
}

// Moon phase data
const MOON_PHASES: Record<MoonPhase['phase'], Omit<MoonPhase, 'phase' | 'illumination'>> = {
  new: {
    name: 'New Moon',
    name_pt: 'Lua Nova',
    description: 'A time of new beginnings and setting intentions',
    description_pt: 'Um momento de novos começos e definição de intenções',
    icon: 'dark_mode',
    energy: 'Introspection, Planning',
    energy_pt: 'Introspecção, Planejamento',
    rituals: ['Set intentions', 'Start new projects', 'Meditation', 'Journaling'],
    rituals_pt: ['Definir intenções', 'Iniciar novos projetos', 'Meditação', 'Escrita reflexiva']
  },
  waxing_crescent: {
    name: 'Waxing Crescent',
    name_pt: 'Lua Crescente',
    description: 'Building momentum and taking initial action',
    description_pt: 'Construindo impulso e tomando ações iniciais',
    icon: 'brightness_3',
    energy: 'Growth, Initiative',
    energy_pt: 'Crescimento, Iniciativa',
    rituals: ['Take action on goals', 'Build foundations', 'Learn new skills'],
    rituals_pt: ['Agir em direção aos objetivos', 'Construir fundações', 'Aprender novas habilidades']
  },
  first_quarter: {
    name: 'First Quarter',
    name_pt: 'Quarto Crescente',
    description: 'Overcoming challenges and making decisions',
    description_pt: 'Superando desafios e tomando decisões',
    icon: 'brightness_2',
    energy: 'Decision, Action',
    energy_pt: 'Decisão, Ação',
    rituals: ['Make important decisions', 'Overcome obstacles', 'Assert yourself'],
    rituals_pt: ['Tomar decisões importantes', 'Superar obstáculos', 'Impor-se']
  },
  waxing_gibbous: {
    name: 'Waxing Gibbous',
    name_pt: 'Gibosa Crescente',
    description: 'Refinement and adjustment before completion',
    description_pt: 'Refinamento e ajuste antes da conclusão',
    icon: 'brightness_1',
    energy: 'Refinement, Patience',
    energy_pt: 'Refinamento, Paciência',
    rituals: ['Edit and refine work', 'Practice patience', 'Trust the process'],
    rituals_pt: ['Editar e refinar trabalhos', 'Praticar paciência', 'Confiar no processo']
  },
  full: {
    name: 'Full Moon',
    name_pt: 'Lua Cheia',
    description: 'Peak energy, manifestation and celebration',
    description_pt: 'Energia máxima, manifestação e celebração',
    icon: 'light_mode',
    energy: 'Manifestation, Celebration',
    energy_pt: 'Manifestação, Celebração',
    rituals: ['Celebrate achievements', 'Release what no longer serves', 'Charge crystals', 'Full moon rituals'],
    rituals_pt: ['Celebrar conquistas', 'Liberar o que não serve mais', 'Carregar cristais', 'Rituais de lua cheia']
  },
  waning_gibbous: {
    name: 'Waning Gibbous',
    name_pt: 'Gibosa Minguante',
    description: 'Gratitude and sharing wisdom',
    description_pt: 'Gratidão e compartilhamento de sabedoria',
    icon: 'nights_stay',
    energy: 'Gratitude, Teaching',
    energy_pt: 'Gratidão, Ensino',
    rituals: ['Express gratitude', 'Share knowledge', 'Mentor others'],
    rituals_pt: ['Expressar gratidão', 'Compartilhar conhecimento', 'Orientar outros']
  },
  last_quarter: {
    name: 'Last Quarter',
    name_pt: 'Quarto Minguante',
    description: 'Release, forgiveness and letting go',
    description_pt: 'Liberação, perdão e deixar ir',
    icon: 'bedtime',
    energy: 'Release, Forgiveness',
    energy_pt: 'Liberação, Perdão',
    rituals: ['Forgive and release', 'Break bad habits', 'Clean and declutter'],
    rituals_pt: ['Perdoar e liberar', 'Quebrar maus hábitos', 'Limpar e organizar']
  },
  waning_crescent: {
    name: 'Waning Crescent',
    name_pt: 'Lua Balsâmica',
    description: 'Rest, reflection and preparation for renewal',
    description_pt: 'Descanso, reflexão e preparação para renovação',
    icon: 'mode_night',
    energy: 'Rest, Surrender',
    energy_pt: 'Descanso, Entrega',
    rituals: ['Rest and recuperate', 'Reflect on the cycle', 'Prepare for new beginnings'],
    rituals_pt: ['Descansar e recuperar', 'Refletir sobre o ciclo', 'Preparar para novos começos']
  }
};

// Zodiac signs data
const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    sign: 'Aries', sign_pt: 'Áries', element: 'fire', element_pt: 'Fogo',
    startDate: { month: 3, day: 21 }, endDate: { month: 4, day: 19 },
    ruling_planet: 'Mars', ruling_planet_pt: 'Marte',
    qualities: ['Courageous', 'Energetic', 'Pioneering'], qualities_pt: ['Corajoso', 'Energético', 'Pioneiro'],
    icon: '♈'
  },
  {
    sign: 'Taurus', sign_pt: 'Touro', element: 'earth', element_pt: 'Terra',
    startDate: { month: 4, day: 20 }, endDate: { month: 5, day: 20 },
    ruling_planet: 'Venus', ruling_planet_pt: 'Vênus',
    qualities: ['Patient', 'Reliable', 'Sensual'], qualities_pt: ['Paciente', 'Confiável', 'Sensual'],
    icon: '♉'
  },
  {
    sign: 'Gemini', sign_pt: 'Gêmeos', element: 'air', element_pt: 'Ar',
    startDate: { month: 5, day: 21 }, endDate: { month: 6, day: 20 },
    ruling_planet: 'Mercury', ruling_planet_pt: 'Mercúrio',
    qualities: ['Curious', 'Adaptable', 'Communicative'], qualities_pt: ['Curioso', 'Adaptável', 'Comunicativo'],
    icon: '♊'
  },
  {
    sign: 'Cancer', sign_pt: 'Câncer', element: 'water', element_pt: 'Água',
    startDate: { month: 6, day: 21 }, endDate: { month: 7, day: 22 },
    ruling_planet: 'Moon', ruling_planet_pt: 'Lua',
    qualities: ['Nurturing', 'Intuitive', 'Protective'], qualities_pt: ['Protetor', 'Intuitivo', 'Cuidadoso'],
    icon: '♋'
  },
  {
    sign: 'Leo', sign_pt: 'Leão', element: 'fire', element_pt: 'Fogo',
    startDate: { month: 7, day: 23 }, endDate: { month: 8, day: 22 },
    ruling_planet: 'Sun', ruling_planet_pt: 'Sol',
    qualities: ['Creative', 'Generous', 'Dramatic'], qualities_pt: ['Criativo', 'Generoso', 'Dramático'],
    icon: '♌'
  },
  {
    sign: 'Virgo', sign_pt: 'Virgem', element: 'earth', element_pt: 'Terra',
    startDate: { month: 8, day: 23 }, endDate: { month: 9, day: 22 },
    ruling_planet: 'Mercury', ruling_planet_pt: 'Mercúrio',
    qualities: ['Analytical', 'Practical', 'Helpful'], qualities_pt: ['Analítico', 'Prático', 'Prestativo'],
    icon: '♍'
  },
  {
    sign: 'Libra', sign_pt: 'Libra', element: 'air', element_pt: 'Ar',
    startDate: { month: 9, day: 23 }, endDate: { month: 10, day: 22 },
    ruling_planet: 'Venus', ruling_planet_pt: 'Vênus',
    qualities: ['Diplomatic', 'Harmonious', 'Fair'], qualities_pt: ['Diplomático', 'Harmonioso', 'Justo'],
    icon: '♎'
  },
  {
    sign: 'Scorpio', sign_pt: 'Escorpião', element: 'water', element_pt: 'Água',
    startDate: { month: 10, day: 23 }, endDate: { month: 11, day: 21 },
    ruling_planet: 'Pluto', ruling_planet_pt: 'Plutão',
    qualities: ['Intense', 'Transformative', 'Passionate'], qualities_pt: ['Intenso', 'Transformador', 'Apaixonado'],
    icon: '♏'
  },
  {
    sign: 'Sagittarius', sign_pt: 'Sagitário', element: 'fire', element_pt: 'Fogo',
    startDate: { month: 11, day: 22 }, endDate: { month: 12, day: 21 },
    ruling_planet: 'Jupiter', ruling_planet_pt: 'Júpiter',
    qualities: ['Adventurous', 'Optimistic', 'Philosophical'], qualities_pt: ['Aventureiro', 'Otimista', 'Filosófico'],
    icon: '♐'
  },
  {
    sign: 'Capricorn', sign_pt: 'Capricórnio', element: 'earth', element_pt: 'Terra',
    startDate: { month: 12, day: 22 }, endDate: { month: 1, day: 19 },
    ruling_planet: 'Saturn', ruling_planet_pt: 'Saturno',
    qualities: ['Ambitious', 'Disciplined', 'Responsible'], qualities_pt: ['Ambicioso', 'Disciplinado', 'Responsável'],
    icon: '♑'
  },
  {
    sign: 'Aquarius', sign_pt: 'Aquário', element: 'air', element_pt: 'Ar',
    startDate: { month: 1, day: 20 }, endDate: { month: 2, day: 18 },
    ruling_planet: 'Uranus', ruling_planet_pt: 'Urano',
    qualities: ['Innovative', 'Humanitarian', 'Independent'], qualities_pt: ['Inovador', 'Humanitário', 'Independente'],
    icon: '♒'
  },
  {
    sign: 'Pisces', sign_pt: 'Peixes', element: 'water', element_pt: 'Água',
    startDate: { month: 2, day: 19 }, endDate: { month: 3, day: 20 },
    ruling_planet: 'Neptune', ruling_planet_pt: 'Netuno',
    qualities: ['Compassionate', 'Artistic', 'Intuitive'], qualities_pt: ['Compassivo', 'Artístico', 'Intuitivo'],
    icon: '♓'
  }
];

// Planetary rulers for days of the week
const DAY_RULERS = [
  { planet: 'Sun', planet_pt: 'Sol', qualities: ['Vitality', 'Success', 'Leadership'], qualities_pt: ['Vitalidade', 'Sucesso', 'Liderança'], color: '#FFD700', icon: 'light_mode' },
  { planet: 'Moon', planet_pt: 'Lua', qualities: ['Emotions', 'Intuition', 'Home'], qualities_pt: ['Emoções', 'Intuição', 'Lar'], color: '#C0C0C0', icon: 'dark_mode' },
  { planet: 'Mars', planet_pt: 'Marte', qualities: ['Action', 'Courage', 'Energy'], qualities_pt: ['Ação', 'Coragem', 'Energia'], color: '#FF4500', icon: 'local_fire_department' },
  { planet: 'Mercury', planet_pt: 'Mercúrio', qualities: ['Communication', 'Travel', 'Learning'], qualities_pt: ['Comunicação', 'Viagem', 'Aprendizado'], color: '#8B4513', icon: 'chat' },
  { planet: 'Jupiter', planet_pt: 'Júpiter', qualities: ['Expansion', 'Luck', 'Wisdom'], qualities_pt: ['Expansão', 'Sorte', 'Sabedoria'], color: '#4169E1', icon: 'auto_awesome' },
  { planet: 'Venus', planet_pt: 'Vênus', qualities: ['Love', 'Beauty', 'Harmony'], qualities_pt: ['Amor', 'Beleza', 'Harmonia'], color: '#FF69B4', icon: 'favorite' },
  { planet: 'Saturn', planet_pt: 'Saturno', qualities: ['Discipline', 'Structure', 'Responsibility'], qualities_pt: ['Disciplina', 'Estrutura', 'Responsabilidade'], color: '#2F4F4F', icon: 'architecture' }
];

// Calculate moon phase for a given date
export const getMoonPhase = (date: Date = new Date()): MoonPhase => {
  // Known new moon date: January 6, 2000
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
  const lunarCycle = 29.53058867; // days

  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % lunarCycle;
  const normalizedAge = lunarAge < 0 ? lunarAge + lunarCycle : lunarAge;

  // Calculate illumination (0-100)
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * normalizedAge / lunarCycle)) / 2 * 100);

  // Determine phase
  let phase: MoonPhase['phase'];
  if (normalizedAge < 1.85) phase = 'new';
  else if (normalizedAge < 7.38) phase = 'waxing_crescent';
  else if (normalizedAge < 9.23) phase = 'first_quarter';
  else if (normalizedAge < 14.77) phase = 'waxing_gibbous';
  else if (normalizedAge < 16.61) phase = 'full';
  else if (normalizedAge < 22.15) phase = 'waning_gibbous';
  else if (normalizedAge < 23.99) phase = 'last_quarter';
  else phase = 'waning_crescent';

  return {
    phase,
    illumination,
    ...MOON_PHASES[phase]
  };
};

// Get zodiac sign for a date
export const getZodiacSign = (date: Date = new Date()): ZodiacSign => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sign of ZODIAC_SIGNS) {
    const { startDate, endDate } = sign;

    // Handle Capricorn which spans year end
    if (sign.sign === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return sign;
      }
    } else if (
      (month === startDate.month && day >= startDate.day) ||
      (month === endDate.month && day <= endDate.day)
    ) {
      return sign;
    }
  }

  return ZODIAC_SIGNS[0]; // Default to Aries
};

// Get planetary ruler for a day
export const getDayRuler = (date: Date = new Date()): PlanetaryHour => {
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const ruler = DAY_RULERS[dayOfWeek];

  const startTime = new Date(date);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(23, 59, 59, 999);

  return {
    ...ruler,
    startTime,
    endTime
  };
};

// Calculate cosmic energy for a day (1-10)
export const getCosmicEnergy = (date: Date = new Date()): number => {
  const moonPhase = getMoonPhase(date);
  const dayRuler = getDayRuler(date);

  // Base energy from moon illumination
  let energy = Math.round(moonPhase.illumination / 10);

  // Boost for auspicious days
  if (dayRuler.planet === 'Jupiter' || dayRuler.planet === 'Venus') {
    energy = Math.min(10, energy + 2);
  }

  // Full moon and new moon are powerful
  if (moonPhase.phase === 'full' || moonPhase.phase === 'new') {
    energy = Math.min(10, energy + 1);
  }

  return Math.max(1, Math.min(10, energy));
};

// Get complete cosmic day information
export const getCosmicDay = (date: Date = new Date()): CosmicDay => {
  const moonPhase = getMoonPhase(date);
  const zodiacSun = getZodiacSign(date);
  const planetaryRuler = getDayRuler(date);
  const cosmicEnergy = getCosmicEnergy(date);

  // Generate best activities based on planetary ruler and moon phase
  const bestFor: string[] = [];
  const bestFor_pt: string[] = [];
  const avoid: string[] = [];
  const avoid_pt: string[] = [];

  // Based on day ruler
  switch (planetaryRuler.planet) {
    case 'Sun':
      bestFor.push('Leadership activities', 'Self-expression', 'Vitality practices');
      bestFor_pt.push('Atividades de liderança', 'Autoexpressão', 'Práticas de vitalidade');
      break;
    case 'Moon':
      bestFor.push('Emotional healing', 'Home activities', 'Intuitive work');
      bestFor_pt.push('Cura emocional', 'Atividades do lar', 'Trabalho intuitivo');
      break;
    case 'Mars':
      bestFor.push('Physical exercise', 'Starting projects', 'Assertive actions');
      bestFor_pt.push('Exercício físico', 'Iniciar projetos', 'Ações assertivas');
      avoid.push('Confrontations', 'Impulsive decisions');
      avoid_pt.push('Confrontações', 'Decisões impulsivas');
      break;
    case 'Mercury':
      bestFor.push('Communication', 'Writing', 'Learning', 'Short trips');
      bestFor_pt.push('Comunicação', 'Escrita', 'Aprendizado', 'Viagens curtas');
      break;
    case 'Jupiter':
      bestFor.push('Expansion', 'Legal matters', 'Education', 'Spirituality');
      bestFor_pt.push('Expansão', 'Assuntos legais', 'Educação', 'Espiritualidade');
      break;
    case 'Venus':
      bestFor.push('Romance', 'Art', 'Beauty treatments', 'Social gatherings');
      bestFor_pt.push('Romance', 'Arte', 'Tratamentos de beleza', 'Encontros sociais');
      break;
    case 'Saturn':
      bestFor.push('Discipline', 'Long-term planning', 'Organizing');
      bestFor_pt.push('Disciplina', 'Planejamento de longo prazo', 'Organização');
      avoid.push('Taking risks', 'Starting new ventures');
      avoid_pt.push('Correr riscos', 'Iniciar novos empreendimentos');
      break;
  }

  // Add moon phase activities
  bestFor.push(...moonPhase.rituals.slice(0, 2));
  bestFor_pt.push(...moonPhase.rituals_pt.slice(0, 2));

  return {
    date,
    moonPhase,
    zodiacSun,
    planetaryRuler,
    cosmicEnergy,
    bestFor,
    bestFor_pt,
    avoid,
    avoid_pt
  };
};

// Get month calendar data
export const getMonthCalendar = (year: number, month: number): CosmicDay[] => {
  const days: CosmicDay[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push(getCosmicDay(date));
  }

  return days;
};

// Get element color
export const getElementColor = (element: string): string => {
  switch (element) {
    case 'fire': return 'text-orange-400 bg-orange-500/20';
    case 'earth': return 'text-emerald-400 bg-emerald-500/20';
    case 'air': return 'text-sky-400 bg-sky-500/20';
    case 'water': return 'text-blue-400 bg-blue-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};
