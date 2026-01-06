import { ArcanaType, CardLore, Spread, Suit, TarotCard } from './types';

// --- Deck Generation Logic ---
const MAJOR_ARCANA_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const MINOR_RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
// Codes used by sacred-texts for file naming
const MINOR_RANK_CODES = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "10", "p", "n", "q", "k"];

const getSuitPrefix = (suit: Suit): string => {
  switch (suit) {
    case Suit.WANDS: return 'w';
    case Suit.CUPS: return 'c';
    case Suit.SWORDS: return 's';
    case Suit.PENTACLES: return 'p';
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
  }
];

// --- Static Lore Database ---

const BASE_LORE: Record<string, Partial<CardLore>> = {
    // Major Arcana Examples
    "The Fool": {
        keywords: ["Início", "Inocência", "Espontaneidade", "Espírito Livre"],
        generalMeaning: "O Louco representa novos começos, ter fé no futuro, ser inexperiente, não saber o que esperar, ter sorte de principiante, improvisação e acreditar no universo.",
        love: "Um romance despreocupado e impulsivo. Pode indicar um novo amor que chega de repente.",
        career: "Novas oportunidades de trabalho, talvez algo não convencional. Hora de arriscar.",
        advice: "Dê o salto de fé. Não tenha medo do desconhecido.",
        reversed: "Imprudência, correr riscos desnecessários, ingenuidade excessiva."
    },
    "The Magician": {
        keywords: ["Manifestação", "Poder", "Habilidade", "Ação"],
        generalMeaning: "O Mago é a carta da manifestação. Ele tem todas as ferramentas (os quatro naipes) à sua disposição para fazer as coisas acontecerem.",
        love: "Tomar a iniciativa no amor. Usar seu charme e habilidade para atrair o que deseja.",
        career: "Use suas habilidades e força de vontade para realizar suas tarefas. Grande potencial de sucesso.",
        advice: "Você tem os recursos necessários. Aja agora.",
        reversed: "Manipulação, planejamento ruim, talentos latentes não usados."
    },
    // Add more specific Major Arcana definitions here...
};

// Helper to generate deterministic lore for cards not explicitly defined above
export const getStaticLore = (card: TarotCard): CardLore => {
    // 1. Check if specific lore exists
    if (BASE_LORE[card.name]) {
        return {
            keywords: BASE_LORE[card.name].keywords || [],
            generalMeaning: BASE_LORE[card.name].generalMeaning || "",
            love: BASE_LORE[card.name].love || "",
            career: BASE_LORE[card.name].career || "",
            advice: BASE_LORE[card.name].advice || "",
            reversed: BASE_LORE[card.name].reversed || ""
        };
    }

    // 2. Generate based on Suit and Number (Fallback Logic)
    let keywords: string[] = [];
    let meaning = "";
    let love = "";
    let career = "";
    
    // Element / Suit meanings
    const suitMeanings = {
        [Suit.WANDS]: { element: "Fogo", area: "paixão, inspiração e força de vontade" },
        [Suit.CUPS]: { element: "Água", area: "emoções, relacionamentos e intuição" },
        [Suit.SWORDS]: { element: "Ar", area: "intelecto, lógica e conflito" },
        [Suit.PENTACLES]: { element: "Terra", area: "dinheiro, trabalho e mundo material" },
        [Suit.NONE]: { element: "Espírito", area: "jornada da alma" }
    };
    
    const sInfo = suitMeanings[card.suit] || suitMeanings[Suit.NONE];

    // Numerology meanings
    if (card.arcana === ArcanaType.MINOR) {
        if (card.name.includes("Ace")) {
            keywords = ["Novo Início", "Potencial", "Puro " + sInfo.element];
            meaning = `O Ás de ${card.suit} representa a semente do potencial no reino de ${sInfo.area}. É um presente do universo oferecendo uma nova oportunidade.`;
            love = "Um novo começo emocional ou paixão renovada.";
            career = "Uma nova oportunidade de trabalho ou investimento financeiro.";
        } else if (card.name.includes("Two")) {
            keywords = ["Equilíbrio", "Parceria", "Dualidade"];
            meaning = `O Dois lida com o equilíbrio e a escolha no domínio de ${sInfo.area}. Pode indicar a necessidade de conciliar dois aspectos da vida.`;
            love = "Parceria, atração mútua ou uma decisão entre dois caminhos amorosos.";
            career = "Equilibrar finanças ou decidir entre duas opções de carreira.";
        } else if (card.name.includes("Three")) {
            keywords = ["Crescimento", "Colaboração", "Expansão"];
            meaning = `O Três indica o primeiro estágio de conclusão e trabalho em equipe em ${sInfo.area}.`;
            love = "Celebração com amigos ou expansão da família.";
            career = "Trabalho em equipe, colaboração e planejamento inicial dando frutos.";
        } else if (card.name.includes("Page")) {
            keywords = ["Mensageiro", "Curiosidade", "Novo Estágio"];
            meaning = `O Valete traz uma mensagem sobre ${sInfo.area}. Representa uma energia jovem e exploradora.`;
            love = "Uma mensagem de amor ou uma pessoa jovem e idealista.";
            career = "Notícias sobre trabalho, aprendizado de novas habilidades.";
        } else if (card.name.includes("Knight")) {
            keywords = ["Ação", "Movimento", "Impulso"];
            meaning = `O Cavaleiro é a ação em movimento. Ele persegue os objetivos de ${sInfo.area} com intensidade (às vezes rápido demais).`;
            love = "Um pretendente apaixonado, mas talvez inconstante ou focado na conquista.";
            career = "Mudança rápida, viagens a trabalho, muita ambição.";
        } else if (card.name.includes("Queen")) {
            keywords = ["Nutrição", "Maturidade", "Interno"];
            meaning = `A Rainha domina o reino de ${sInfo.area} com maturidade emocional e compreensão interna.`;
            love = "Uma figura feminina amorosa, segura e compassiva.";
            career = "Gerenciar recursos com sabedoria, criatividade no trabalho.";
        } else if (card.name.includes("King")) {
            keywords = ["Autoridade", "Controle", "Externo"];
            meaning = `O Rei é a autoridade máxima em ${sInfo.area}. Ele comanda com experiência e controle externo.`;
            love = "Um parceiro estável, protetor e provedor.";
            career = "Liderança, empresário de sucesso, mentor experiente.";
        } else {
             // Fallback for 4-10
            keywords = ["Evolução", "Ciclo", "Lição"];
            meaning = `Esta carta representa um estágio de desenvolvimento nas questões de ${sInfo.area}. É um momento de lidar com as realidades do elemento ${sInfo.element}.`;
            love = `Uma situação em evolução que requer atenção às emoções e ${sInfo.area}.`;
            career = `Desenvolvimentos na carreira relacionados a ${sInfo.area}.`;
        }
    } else {
        // Fallback for undefined Major Arcana
        keywords = ["Arquétipo", "Jornada", "Lição Maior"];
        meaning = "Uma carta de grande importância cármica e espiritual. Representa uma lição fundamental que a alma deve aprender.";
        love = "Um evento significativo e transformador no amor.";
        career = "Mudanças de destino na vida profissional.";
    }

    return {
        keywords,
        generalMeaning: meaning,
        love,
        career,
        advice: `Reflita sobre como a energia de ${sInfo.area} está se manifestando em sua vida agora.`,
        reversed: "A energia está bloqueada ou sendo expressa de forma negativa. Cuidado com excessos ou negligência."
    };
};
