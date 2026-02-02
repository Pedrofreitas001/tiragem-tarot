// Dados dos 12 signos do zodíaco
export type ZodiacSign =
  | 'aries' | 'touro' | 'gemeos' | 'cancer'
  | 'leao' | 'virgem' | 'libra' | 'escorpiao'
  | 'sagitario' | 'capricornio' | 'aquario' | 'peixes';

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

export interface ZodiacSignData {
  slug: ZodiacSign;
  name: { pt: string; en: string };
  symbol: string;
  element: ZodiacElement;
  dateRange: { start: string; end: string }; // MM-DD format
  ruler: string;
  keywords: { pt: string[]; en: string[] };
  seo: {
    title: { pt: string; en: string };
    description: { pt: string; en: string };
  };
}

export const ZODIAC_SIGNS: Record<ZodiacSign, ZodiacSignData> = {
  aries: {
    slug: 'aries',
    name: { pt: 'Áries', en: 'Aries' },
    symbol: '♈',
    element: 'fire',
    dateRange: { start: '03-21', end: '04-19' },
    ruler: 'Marte',
    keywords: {
      pt: ['iniciativa', 'coragem', 'pioneirismo', 'energia'],
      en: ['initiative', 'courage', 'pioneering', 'energy']
    },
    seo: {
      title: {
        pt: 'Tarot para Áries Hoje | Tiragem Personalizada',
        en: 'Tarot for Aries Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Áries hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Aries today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  touro: {
    slug: 'touro',
    name: { pt: 'Touro', en: 'Taurus' },
    symbol: '♉',
    element: 'earth',
    dateRange: { start: '04-20', end: '05-20' },
    ruler: 'Vênus',
    keywords: {
      pt: ['estabilidade', 'persistência', 'sensualidade', 'praticidade'],
      en: ['stability', 'persistence', 'sensuality', 'practicality']
    },
    seo: {
      title: {
        pt: 'Tarot para Touro Hoje | Tiragem Personalizada',
        en: 'Tarot for Taurus Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Touro hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Taurus today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  gemeos: {
    slug: 'gemeos',
    name: { pt: 'Gêmeos', en: 'Gemini' },
    symbol: '♊',
    element: 'air',
    dateRange: { start: '05-21', end: '06-20' },
    ruler: 'Mercúrio',
    keywords: {
      pt: ['comunicação', 'versatilidade', 'curiosidade', 'adaptabilidade'],
      en: ['communication', 'versatility', 'curiosity', 'adaptability']
    },
    seo: {
      title: {
        pt: 'Tarot para Gêmeos Hoje | Tiragem Personalizada',
        en: 'Tarot for Gemini Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Gêmeos hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Gemini today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  cancer: {
    slug: 'cancer',
    name: { pt: 'Câncer', en: 'Cancer' },
    symbol: '♋',
    element: 'water',
    dateRange: { start: '06-21', end: '07-22' },
    ruler: 'Lua',
    keywords: {
      pt: ['emoção', 'proteção', 'intuição', 'família'],
      en: ['emotion', 'protection', 'intuition', 'family']
    },
    seo: {
      title: {
        pt: 'Tarot para Câncer Hoje | Tiragem Personalizada',
        en: 'Tarot for Cancer Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Câncer hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Cancer today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  leao: {
    slug: 'leao',
    name: { pt: 'Leão', en: 'Leo' },
    symbol: '♌',
    element: 'fire',
    dateRange: { start: '07-23', end: '08-22' },
    ruler: 'Sol',
    keywords: {
      pt: ['liderança', 'criatividade', 'generosidade', 'autoexpressão'],
      en: ['leadership', 'creativity', 'generosity', 'self-expression']
    },
    seo: {
      title: {
        pt: 'Tarot para Leão Hoje | Tiragem Personalizada',
        en: 'Tarot for Leo Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Leão hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Leo today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  virgem: {
    slug: 'virgem',
    name: { pt: 'Virgem', en: 'Virgo' },
    symbol: '♍',
    element: 'earth',
    dateRange: { start: '08-23', end: '09-22' },
    ruler: 'Mercúrio',
    keywords: {
      pt: ['análise', 'serviço', 'perfeição', 'organização'],
      en: ['analysis', 'service', 'perfection', 'organization']
    },
    seo: {
      title: {
        pt: 'Tarot para Virgem Hoje | Tiragem Personalizada',
        en: 'Tarot for Virgo Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Virgem hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Virgo today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  libra: {
    slug: 'libra',
    name: { pt: 'Libra', en: 'Libra' },
    symbol: '♎',
    element: 'air',
    dateRange: { start: '09-23', end: '10-22' },
    ruler: 'Vênus',
    keywords: {
      pt: ['equilíbrio', 'harmonia', 'justiça', 'relacionamentos'],
      en: ['balance', 'harmony', 'justice', 'relationships']
    },
    seo: {
      title: {
        pt: 'Tarot para Libra Hoje | Tiragem Personalizada',
        en: 'Tarot for Libra Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Libra hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Libra today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  escorpiao: {
    slug: 'escorpiao',
    name: { pt: 'Escorpião', en: 'Scorpio' },
    symbol: '♏',
    element: 'water',
    dateRange: { start: '10-23', end: '11-21' },
    ruler: 'Plutão',
    keywords: {
      pt: ['transformação', 'intensidade', 'poder', 'profundidade'],
      en: ['transformation', 'intensity', 'power', 'depth']
    },
    seo: {
      title: {
        pt: 'Tarot para Escorpião Hoje | Tiragem Personalizada',
        en: 'Tarot for Scorpio Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Escorpião hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Scorpio today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  sagitario: {
    slug: 'sagitario',
    name: { pt: 'Sagitário', en: 'Sagittarius' },
    symbol: '♐',
    element: 'fire',
    dateRange: { start: '11-22', end: '12-21' },
    ruler: 'Júpiter',
    keywords: {
      pt: ['expansão', 'aventura', 'otimismo', 'sabedoria'],
      en: ['expansion', 'adventure', 'optimism', 'wisdom']
    },
    seo: {
      title: {
        pt: 'Tarot para Sagitário Hoje | Tiragem Personalizada',
        en: 'Tarot for Sagittarius Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Sagitário hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Sagittarius today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  capricornio: {
    slug: 'capricornio',
    name: { pt: 'Capricórnio', en: 'Capricorn' },
    symbol: '♑',
    element: 'earth',
    dateRange: { start: '12-22', end: '01-19' },
    ruler: 'Saturno',
    keywords: {
      pt: ['ambição', 'disciplina', 'responsabilidade', 'estrutura'],
      en: ['ambition', 'discipline', 'responsibility', 'structure']
    },
    seo: {
      title: {
        pt: 'Tarot para Capricórnio Hoje | Tiragem Personalizada',
        en: 'Tarot for Capricorn Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Capricórnio hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Capricorn today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  aquario: {
    slug: 'aquario',
    name: { pt: 'Aquário', en: 'Aquarius' },
    symbol: '♒',
    element: 'air',
    dateRange: { start: '01-20', end: '02-18' },
    ruler: 'Urano',
    keywords: {
      pt: ['inovação', 'liberdade', 'originalidade', 'humanitarismo'],
      en: ['innovation', 'freedom', 'originality', 'humanitarianism']
    },
    seo: {
      title: {
        pt: 'Tarot para Aquário Hoje | Tiragem Personalizada',
        en: 'Tarot for Aquarius Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Aquário hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Aquarius today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  },
  peixes: {
    slug: 'peixes',
    name: { pt: 'Peixes', en: 'Pisces' },
    symbol: '♓',
    element: 'water',
    dateRange: { start: '02-19', end: '03-20' },
    ruler: 'Netuno',
    keywords: {
      pt: ['intuição', 'compaixão', 'espiritualidade', 'imaginação'],
      en: ['intuition', 'compassion', 'spirituality', 'imagination']
    },
    seo: {
      title: {
        pt: 'Tarot para Peixes Hoje | Tiragem Personalizada',
        en: 'Tarot for Pisces Today | Personalized Reading'
      },
      description: {
        pt: 'Descubra as energias do tarot para Peixes hoje. Tiragem de 3 cartas com interpretação personalizada para seu signo.',
        en: 'Discover tarot energies for Pisces today. 3-card reading with personalized interpretation for your sign.'
      }
    }
  }
};

export const ZODIAC_ORDER: ZodiacSign[] = [
  'aries', 'touro', 'gemeos', 'cancer',
  'leao', 'virgem', 'libra', 'escorpiao',
  'sagitario', 'capricornio', 'aquario', 'peixes'
];

// Mapeamento de elemento para cores
export const ELEMENT_COLORS: Record<ZodiacElement, { primary: string; gradient: string; bg: string }> = {
  fire: {
    primary: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/10',
    bg: 'bg-orange-500/10'
  },
  earth: {
    primary: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-green-500/10',
    bg: 'bg-emerald-500/10'
  },
  air: {
    primary: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    bg: 'bg-cyan-500/10'
  },
  water: {
    primary: 'text-blue-400',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    bg: 'bg-blue-500/10'
  }
};
