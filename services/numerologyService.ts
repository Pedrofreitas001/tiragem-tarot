// Numerology Calculation Service

export interface NumerologyProfile {
  lifePath: NumerologyNumber;
  expression: NumerologyNumber;
  soul: NumerologyNumber;
  personality: NumerologyNumber;
  birthday: NumerologyNumber;
  personalYear: NumerologyNumber;
  personalMonth: NumerologyNumber;
  personalDay: NumerologyNumber;
}

export interface NumerologyNumber {
  value: number;
  masterNumber: boolean;
  meaning: {
    title: string;
    title_pt: string;
    description: string;
    description_pt: string;
    keywords: string[];
    keywords_pt: string[];
    strengths: string[];
    strengths_pt: string[];
    challenges: string[];
    challenges_pt: string[];
  };
}

// Letter to number mapping (Pythagorean system)
const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

// Number meanings database
const NUMBER_MEANINGS: Record<number, NumerologyNumber['meaning']> = {
  1: {
    title: 'The Leader',
    title_pt: 'O Líder',
    description: 'Number 1 represents independence, individuality, and new beginnings. You are a natural born leader with strong willpower and determination.',
    description_pt: 'O número 1 representa independência, individualidade e novos começos. Você é um líder nato com forte força de vontade e determinação.',
    keywords: ['Leadership', 'Independence', 'Originality', 'Ambition'],
    keywords_pt: ['Liderança', 'Independência', 'Originalidade', 'Ambição'],
    strengths: ['Self-motivated', 'Creative', 'Pioneering', 'Confident'],
    strengths_pt: ['Auto-motivado', 'Criativo', 'Pioneiro', 'Confiante'],
    challenges: ['Stubbornness', 'Impatience', 'Self-centeredness'],
    challenges_pt: ['Teimosia', 'Impaciência', 'Egocentrismo']
  },
  2: {
    title: 'The Diplomat',
    title_pt: 'O Diplomata',
    description: 'Number 2 embodies cooperation, balance, and sensitivity. You have a natural ability to mediate and bring harmony to relationships.',
    description_pt: 'O número 2 incorpora cooperação, equilíbrio e sensibilidade. Você tem uma habilidade natural para mediar e trazer harmonia aos relacionamentos.',
    keywords: ['Harmony', 'Partnership', 'Intuition', 'Balance'],
    keywords_pt: ['Harmonia', 'Parceria', 'Intuição', 'Equilíbrio'],
    strengths: ['Diplomatic', 'Patient', 'Supportive', 'Detail-oriented'],
    strengths_pt: ['Diplomático', 'Paciente', 'Apoiador', 'Detalhista'],
    challenges: ['Indecision', 'Over-sensitivity', 'Dependency'],
    challenges_pt: ['Indecisão', 'Hipersensibilidade', 'Dependência']
  },
  3: {
    title: 'The Communicator',
    title_pt: 'O Comunicador',
    description: 'Number 3 is associated with creativity, self-expression, and joy. You have a gift for communication and artistic expression.',
    description_pt: 'O número 3 está associado à criatividade, autoexpressão e alegria. Você tem um dom para comunicação e expressão artística.',
    keywords: ['Creativity', 'Expression', 'Joy', 'Communication'],
    keywords_pt: ['Criatividade', 'Expressão', 'Alegria', 'Comunicação'],
    strengths: ['Artistic', 'Optimistic', 'Inspiring', 'Social'],
    strengths_pt: ['Artístico', 'Otimista', 'Inspirador', 'Social'],
    challenges: ['Scattered energy', 'Superficiality', 'Moodiness'],
    challenges_pt: ['Energia dispersa', 'Superficialidade', 'Oscilação de humor']
  },
  4: {
    title: 'The Builder',
    title_pt: 'O Construtor',
    description: 'Number 4 represents stability, hard work, and practicality. You build solid foundations and achieve goals through dedication.',
    description_pt: 'O número 4 representa estabilidade, trabalho duro e praticidade. Você constrói bases sólidas e alcança objetivos através da dedicação.',
    keywords: ['Stability', 'Order', 'Dedication', 'Practicality'],
    keywords_pt: ['Estabilidade', 'Ordem', 'Dedicação', 'Praticidade'],
    strengths: ['Reliable', 'Organized', 'Determined', 'Logical'],
    strengths_pt: ['Confiável', 'Organizado', 'Determinado', 'Lógico'],
    challenges: ['Rigidity', 'Stubbornness', 'Workaholic tendencies'],
    challenges_pt: ['Rigidez', 'Teimosia', 'Tendência workaholic']
  },
  5: {
    title: 'The Adventurer',
    title_pt: 'O Aventureiro',
    description: 'Number 5 symbolizes freedom, change, and adventure. You thrive on variety and new experiences, adapting easily to change.',
    description_pt: 'O número 5 simboliza liberdade, mudança e aventura. Você prospera na variedade e em novas experiências, adaptando-se facilmente à mudança.',
    keywords: ['Freedom', 'Change', 'Adventure', 'Versatility'],
    keywords_pt: ['Liberdade', 'Mudança', 'Aventura', 'Versatilidade'],
    strengths: ['Adaptable', 'Curious', 'Resourceful', 'Progressive'],
    strengths_pt: ['Adaptável', 'Curioso', 'Engenhoso', 'Progressista'],
    challenges: ['Restlessness', 'Impulsiveness', 'Inconsistency'],
    challenges_pt: ['Inquietação', 'Impulsividade', 'Inconstância']
  },
  6: {
    title: 'The Nurturer',
    title_pt: 'O Protetor',
    description: 'Number 6 embodies responsibility, love, and domestic harmony. You are naturally caring and devoted to family and community.',
    description_pt: 'O número 6 incorpora responsabilidade, amor e harmonia doméstica. Você é naturalmente carinhoso e dedicado à família e comunidade.',
    keywords: ['Love', 'Responsibility', 'Harmony', 'Service'],
    keywords_pt: ['Amor', 'Responsabilidade', 'Harmonia', 'Serviço'],
    strengths: ['Nurturing', 'Responsible', 'Compassionate', 'Protective'],
    strengths_pt: ['Protetor', 'Responsável', 'Compassivo', 'Cuidadoso'],
    challenges: ['Self-sacrifice', 'Worry', 'Controlling behavior'],
    challenges_pt: ['Auto-sacrifício', 'Preocupação', 'Comportamento controlador']
  },
  7: {
    title: 'The Seeker',
    title_pt: 'O Buscador',
    description: 'Number 7 represents wisdom, introspection, and spiritual awakening. You seek deeper truths and have a philosophical mind.',
    description_pt: 'O número 7 representa sabedoria, introspecção e despertar espiritual. Você busca verdades mais profundas e tem uma mente filosófica.',
    keywords: ['Wisdom', 'Spirituality', 'Analysis', 'Intuition'],
    keywords_pt: ['Sabedoria', 'Espiritualidade', 'Análise', 'Intuição'],
    strengths: ['Analytical', 'Intuitive', 'Wise', 'Contemplative'],
    strengths_pt: ['Analítico', 'Intuitivo', 'Sábio', 'Contemplativo'],
    challenges: ['Isolation', 'Skepticism', 'Emotional detachment'],
    challenges_pt: ['Isolamento', 'Ceticismo', 'Distanciamento emocional']
  },
  8: {
    title: 'The Achiever',
    title_pt: 'O Realizador',
    description: 'Number 8 symbolizes abundance, power, and material success. You have strong business acumen and the ability to manifest wealth.',
    description_pt: 'O número 8 simboliza abundância, poder e sucesso material. Você tem forte visão de negócios e a capacidade de manifestar riqueza.',
    keywords: ['Success', 'Power', 'Abundance', 'Authority'],
    keywords_pt: ['Sucesso', 'Poder', 'Abundância', 'Autoridade'],
    strengths: ['Ambitious', 'Efficient', 'Authoritative', 'Business-minded'],
    strengths_pt: ['Ambicioso', 'Eficiente', 'Autoritário', 'Visionário'],
    challenges: ['Materialism', 'Workaholism', 'Impatience'],
    challenges_pt: ['Materialismo', 'Workaholismo', 'Impaciência']
  },
  9: {
    title: 'The Humanitarian',
    title_pt: 'O Humanitário',
    description: 'Number 9 represents completion, wisdom, and universal love. You have a humanitarian spirit and desire to serve others.',
    description_pt: 'O número 9 representa conclusão, sabedoria e amor universal. Você tem um espírito humanitário e desejo de servir aos outros.',
    keywords: ['Compassion', 'Completion', 'Wisdom', 'Humanitarian'],
    keywords_pt: ['Compaixão', 'Conclusão', 'Sabedoria', 'Humanitário'],
    strengths: ['Generous', 'Wise', 'Compassionate', 'Idealistic'],
    strengths_pt: ['Generoso', 'Sábio', 'Compassivo', 'Idealista'],
    challenges: ['Emotional extremes', 'Aloofness', 'Unfocused idealism'],
    challenges_pt: ['Extremos emocionais', 'Distanciamento', 'Idealismo disperso']
  },
  11: {
    title: 'The Intuitive',
    title_pt: 'O Intuitivo',
    description: 'Master Number 11 carries powerful spiritual insight and intuition. You are a visionary with the ability to inspire and enlighten others.',
    description_pt: 'O Número Mestre 11 carrega poderosa percepção espiritual e intuição. Você é um visionário com a capacidade de inspirar e iluminar os outros.',
    keywords: ['Illumination', 'Intuition', 'Vision', 'Inspiration'],
    keywords_pt: ['Iluminação', 'Intuição', 'Visão', 'Inspiração'],
    strengths: ['Highly intuitive', 'Inspirational', 'Visionary', 'Spiritual'],
    strengths_pt: ['Altamente intuitivo', 'Inspirador', 'Visionário', 'Espiritual'],
    challenges: ['Nervous tension', 'Impracticality', 'Sensitivity'],
    challenges_pt: ['Tensão nervosa', 'Impraticidade', 'Sensibilidade']
  },
  22: {
    title: 'The Master Builder',
    title_pt: 'O Mestre Construtor',
    description: 'Master Number 22 combines vision with practical ability. You can turn dreams into reality and build lasting legacies.',
    description_pt: 'O Número Mestre 22 combina visão com habilidade prática. Você pode transformar sonhos em realidade e construir legados duradouros.',
    keywords: ['Master Builder', 'Vision', 'Achievement', 'Legacy'],
    keywords_pt: ['Mestre Construtor', 'Visão', 'Realização', 'Legado'],
    strengths: ['Visionary', 'Practical', 'Powerful', 'Disciplined'],
    strengths_pt: ['Visionário', 'Prático', 'Poderoso', 'Disciplinado'],
    challenges: ['Overwhelm', 'Self-doubt', 'High expectations'],
    challenges_pt: ['Sobrecarga', 'Auto-dúvida', 'Altas expectativas']
  },
  33: {
    title: 'The Master Teacher',
    title_pt: 'O Mestre Professor',
    description: 'Master Number 33 embodies the highest form of loving service. You are a master healer and teacher with profound compassion.',
    description_pt: 'O Número Mestre 33 incorpora a mais alta forma de serviço amoroso. Você é um mestre curador e professor com profunda compaixão.',
    keywords: ['Master Teacher', 'Healing', 'Blessing', 'Service'],
    keywords_pt: ['Mestre Professor', 'Cura', 'Bênção', 'Serviço'],
    strengths: ['Highly compassionate', 'Healing', 'Selfless', 'Wise'],
    strengths_pt: ['Altamente compassivo', 'Curador', 'Altruísta', 'Sábio'],
    challenges: ['Martyrdom', 'Perfectionism', 'Emotional burden'],
    challenges_pt: ['Martírio', 'Perfeccionismo', 'Peso emocional']
  }
};

// Reduce a number to a single digit (or master number)
export const reduceToSingleDigit = (num: number, keepMasterNumbers = true): number => {
  // Keep master numbers 11, 22, 33 if specified
  if (keepMasterNumbers && (num === 11 || num === 22 || num === 33)) {
    return num;
  }

  while (num > 9 && !(keepMasterNumbers && (num === 11 || num === 22 || num === 33))) {
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  return num;
};

// Get letter value
const getLetterValue = (letter: string): number => {
  return LETTER_VALUES[letter.toUpperCase()] || 0;
};

// Calculate Life Path Number from birthdate
export const calculateLifePath = (birthDate: Date): number => {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();

  const dayReduced = reduceToSingleDigit(day, false);
  const monthReduced = reduceToSingleDigit(month, false);
  const yearReduced = reduceToSingleDigit(
    String(year).split('').reduce((sum, digit) => sum + parseInt(digit), 0),
    false
  );

  return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
};

// Calculate Expression Number from full name
export const calculateExpression = (fullName: string): number => {
  const letters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const sum = letters.split('').reduce((total, letter) => total + getLetterValue(letter), 0);
  return reduceToSingleDigit(sum);
};

// Calculate Soul Urge Number (vowels only)
export const calculateSoulUrge = (fullName: string): number => {
  const letters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const vowels = letters.split('').filter(letter => VOWELS.includes(letter));
  const sum = vowels.reduce((total, letter) => total + getLetterValue(letter), 0);
  return reduceToSingleDigit(sum);
};

// Calculate Personality Number (consonants only)
export const calculatePersonality = (fullName: string): number => {
  const letters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const consonants = letters.split('').filter(letter => !VOWELS.includes(letter));
  const sum = consonants.reduce((total, letter) => total + getLetterValue(letter), 0);
  return reduceToSingleDigit(sum);
};

// Calculate Birthday Number
export const calculateBirthday = (birthDate: Date): number => {
  const day = birthDate.getDate();
  return reduceToSingleDigit(day);
};

// Calculate Personal Year
export const calculatePersonalYear = (birthDate: Date, currentYear?: number): number => {
  const year = currentYear || new Date().getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const sum = reduceToSingleDigit(day, false) +
              reduceToSingleDigit(month, false) +
              reduceToSingleDigit(String(year).split('').reduce((s, d) => s + parseInt(d), 0), false);

  return reduceToSingleDigit(sum, false);
};

// Calculate Personal Month
export const calculatePersonalMonth = (birthDate: Date, currentDate?: Date): number => {
  const date = currentDate || new Date();
  const personalYear = calculatePersonalYear(birthDate, date.getFullYear());
  const currentMonth = date.getMonth() + 1;

  return reduceToSingleDigit(personalYear + currentMonth, false);
};

// Calculate Personal Day
export const calculatePersonalDay = (birthDate: Date, currentDate?: Date): number => {
  const date = currentDate || new Date();
  const personalMonth = calculatePersonalMonth(birthDate, date);
  const currentDay = date.getDate();

  return reduceToSingleDigit(personalMonth + currentDay, false);
};

// Get number meaning
export const getNumberMeaning = (num: number): NumerologyNumber['meaning'] => {
  // For numbers not in our database, reduce and get meaning
  const key = NUMBER_MEANINGS[num] ? num : reduceToSingleDigit(num, false);
  return NUMBER_MEANINGS[key] || NUMBER_MEANINGS[1];
};

// Create NumerologyNumber object
const createNumerologyNumber = (value: number): NumerologyNumber => ({
  value,
  masterNumber: value === 11 || value === 22 || value === 33,
  meaning: getNumberMeaning(value)
});

// Calculate complete numerology profile
export const calculateNumerologyProfile = (
  fullName: string,
  birthDate: Date
): NumerologyProfile => {
  return {
    lifePath: createNumerologyNumber(calculateLifePath(birthDate)),
    expression: createNumerologyNumber(calculateExpression(fullName)),
    soul: createNumerologyNumber(calculateSoulUrge(fullName)),
    personality: createNumerologyNumber(calculatePersonality(fullName)),
    birthday: createNumerologyNumber(calculateBirthday(birthDate)),
    personalYear: createNumerologyNumber(calculatePersonalYear(birthDate)),
    personalMonth: createNumerologyNumber(calculatePersonalMonth(birthDate)),
    personalDay: createNumerologyNumber(calculatePersonalDay(birthDate))
  };
};

// Daily number (universal day number)
export const calculateUniversalDay = (date?: Date): number => {
  const d = date || new Date();
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const sum = String(day).split('').reduce((s, digit) => s + parseInt(digit), 0) +
              String(month).split('').reduce((s, digit) => s + parseInt(digit), 0) +
              String(year).split('').reduce((s, digit) => s + parseInt(digit), 0);

  return reduceToSingleDigit(sum, false);
};

// Get compatibility between two life path numbers
export const getCompatibility = (num1: number, num2: number): { score: number; description: string; description_pt: string } => {
  const compatibilityMatrix: Record<string, { score: number; desc: string; desc_pt: string }> = {
    '1-1': { score: 70, desc: 'Two leaders can clash or create powerful synergy', desc_pt: 'Dois líderes podem conflitar ou criar sinergia poderosa' },
    '1-2': { score: 85, desc: 'Complementary energies, balance of power and diplomacy', desc_pt: 'Energias complementares, equilíbrio de poder e diplomacia' },
    '1-3': { score: 90, desc: 'Creative and dynamic duo with mutual admiration', desc_pt: 'Dupla criativa e dinâmica com admiração mútua' },
    '1-4': { score: 65, desc: 'Different approaches but can build something lasting', desc_pt: 'Abordagens diferentes mas podem construir algo duradouro' },
    '1-5': { score: 80, desc: 'Exciting and adventurous partnership', desc_pt: 'Parceria excitante e aventureira' },
    '1-6': { score: 75, desc: 'Good balance of ambition and nurturing', desc_pt: 'Bom equilíbrio de ambição e cuidado' },
    '1-7': { score: 70, desc: 'Intellectual connection but may lack emotional depth', desc_pt: 'Conexão intelectual mas pode faltar profundidade emocional' },
    '1-8': { score: 85, desc: 'Power couple with shared ambitions', desc_pt: 'Casal poderoso com ambições compartilhadas' },
    '1-9': { score: 75, desc: 'Visionary partnership with humanitarian goals', desc_pt: 'Parceria visionária com objetivos humanitários' },
    // Add more combinations as needed
  };

  const key1 = `${Math.min(num1, num2)}-${Math.max(num1, num2)}`;
  const key2 = `${num1}-${num2}`;

  const result = compatibilityMatrix[key1] || compatibilityMatrix[key2] || {
    score: 75,
    desc: 'Unique combination with potential for growth',
    desc_pt: 'Combinação única com potencial para crescimento'
  };

  return {
    score: result.score,
    description: result.desc,
    description_pt: result.desc_pt
  };
};
