/**
 * ESTRUTURA PARA TEXTOS CUSTOMIZADOS DAS CARTAS DE TAROT
 * ======================================================
 *
 * Este arquivo permite que você adicione conteúdo personalizado para cada carta.
 * Você pode criar QUALQUER módulo que quiser - não está limitado aos existentes.
 *
 * COMO USAR:
 * 1. Copie o template de uma carta
 * 2. Preencha os textos em PT e EN
 * 3. Adicione novos módulos conforme necessário
 * 4. O sistema automaticamente mesclará com os dados existentes
 *
 * MÓDULOS EXISTENTES (já no tarotData.ts):
 * - love / love_pt (Amor)
 * - career / career_pt (Carreira)
 * - advice / advice_pt (Conselho)
 *
 * MÓDULOS SUGERIDOS PARA CRIAR:
 * - spirituality / spirituality_pt (Espiritualidade)
 * - health / health_pt (Saúde)
 * - finances / finances_pt (Finanças)
 * - family / family_pt (Família)
 * - creativity / creativity_pt (Criatividade)
 * - shadow / shadow_pt (Sombra/Aspecto Negativo)
 * - meditation / meditation_pt (Meditação)
 * - affirmation / affirmation_pt (Afirmação)
 * - crystals / crystals_pt (Cristais Associados)
 * - timing / timing_pt (Timing/Momento)
 * - yes_no / yes_no_pt (Sim ou Não)
 * - daily_message / daily_message_pt (Mensagem do Dia)
 *
 * Você pode criar QUALQUER módulo adicional que precisar!
 */

// Interface flexível que aceita qualquer módulo customizado
export interface CustomCardContent {
  cardId: string; // ID da carta (ex: "maj_0" para O Louco)

  // Módulos padrão (opcionais - só preencha se quiser sobrescrever)
  love?: string;
  love_pt?: string;
  career?: string;
  career_pt?: string;
  advice?: string;
  advice_pt?: string;

  // Módulos customizados - adicione quantos quiser!
  // Use o padrão: nomeModulo (inglês) e nomeModulo_pt (português)
  [key: string]: string | undefined;
}

// Lista de todos os IDs de cartas para referência
export const CARD_IDS = {
  // ARCANOS MAIORES (22 cartas)
  major: [
    'maj_0',   // O Louco / The Fool
    'maj_1',   // O Mago / The Magician
    'maj_2',   // A Sacerdotisa / The High Priestess
    'maj_3',   // A Imperatriz / The Empress
    'maj_4',   // O Imperador / The Emperor
    'maj_5',   // O Hierofante / The Hierophant
    'maj_6',   // Os Enamorados / The Lovers
    'maj_7',   // O Carro / The Chariot
    'maj_8',   // A Força / Strength
    'maj_9',   // O Eremita / The Hermit
    'maj_10',  // A Roda da Fortuna / Wheel of Fortune
    'maj_11',  // A Justiça / Justice
    'maj_12',  // O Enforcado / The Hanged Man
    'maj_13',  // A Morte / Death
    'maj_14',  // A Temperança / Temperance
    'maj_15',  // O Diabo / The Devil
    'maj_16',  // A Torre / The Tower
    'maj_17',  // A Estrela / The Star
    'maj_18',  // A Lua / The Moon
    'maj_19',  // O Sol / The Sun
    'maj_20',  // O Julgamento / Judgement
    'maj_21',  // O Mundo / The World
  ],

  // ARCANOS MENORES - COPAS (14 cartas)
  cups: [
    'cups_ace', 'cups_2', 'cups_3', 'cups_4', 'cups_5', 'cups_6', 'cups_7',
    'cups_8', 'cups_9', 'cups_10', 'cups_page', 'cups_knight', 'cups_queen', 'cups_king'
  ],

  // ARCANOS MENORES - OUROS (14 cartas)
  pentacles: [
    'pent_ace', 'pent_2', 'pent_3', 'pent_4', 'pent_5', 'pent_6', 'pent_7',
    'pent_8', 'pent_9', 'pent_10', 'pent_page', 'pent_knight', 'pent_queen', 'pent_king'
  ],

  // ARCANOS MENORES - ESPADAS (14 cartas)
  swords: [
    'swords_ace', 'swords_2', 'swords_3', 'swords_4', 'swords_5', 'swords_6', 'swords_7',
    'swords_8', 'swords_9', 'swords_10', 'swords_page', 'swords_knight', 'swords_queen', 'swords_king'
  ],

  // ARCANOS MENORES - PAUS (14 cartas)
  wands: [
    'wands_ace', 'wands_2', 'wands_3', 'wands_4', 'wands_5', 'wands_6', 'wands_7',
    'wands_8', 'wands_9', 'wands_10', 'wands_page', 'wands_knight', 'wands_queen', 'wands_king'
  ],
};

// ============================================================================
// TEMPLATE VAZIO PARA COPIAR
// ============================================================================
/*
  {
    cardId: "maj_0", // Mude para o ID da carta

    // Módulos existentes (opcional - só se quiser sobrescrever)
    love: "",
    love_pt: "",
    career: "",
    career_pt: "",
    advice: "",
    advice_pt: "",

    // Seus módulos customizados
    spirituality: "",
    spirituality_pt: "",
    health: "",
    health_pt: "",
    finances: "",
    finances_pt: "",
    family: "",
    family_pt: "",
    shadow: "",
    shadow_pt: "",
    meditation: "",
    meditation_pt: "",
    affirmation: "",
    affirmation_pt: "",
    daily_message: "",
    daily_message_pt: "",
    yes_no: "",
    yes_no_pt: "",
  },
*/

// ============================================================================
// SEUS TEXTOS CUSTOMIZADOS - PREENCHA AQUI
// ============================================================================
export const CUSTOM_CARD_CONTENT: CustomCardContent[] = [
  // ========== EXEMPLO: O LOUCO ==========
  {
    cardId: "maj_0",

    // Módulos customizados
    spirituality: "The Fool represents the soul's journey before incarnation - pure potential untouched by earthly experience. This card invites you to reconnect with your spiritual innocence and trust in divine guidance.",
    spirituality_pt: "O Louco representa a jornada da alma antes da encarnação - potencial puro intocado pela experiência terrena. Esta carta convida você a reconectar com sua inocência espiritual e confiar na orientação divina.",

    health: "Time to try new approaches to wellness. Don't be afraid to explore alternative therapies or change your routine. Your body is ready for fresh energy.",
    health_pt: "Momento de experimentar novas abordagens para o bem-estar. Não tenha medo de explorar terapias alternativas ou mudar sua rotina. Seu corpo está pronto para energia renovada.",

    finances: "A leap of faith may be needed. While not reckless, be open to unconventional opportunities. Sometimes the best investments are the ones no one else sees.",
    finances_pt: "Um salto de fé pode ser necessário. Embora não imprudente, esteja aberto a oportunidades não convencionais. Às vezes os melhores investimentos são aqueles que ninguém mais vê.",

    family: "Fresh dynamics are possible within family relationships. Approach old conflicts with new eyes. Someone young may bring unexpected joy.",
    family_pt: "Novas dinâmicas são possíveis nas relações familiares. Aborde velhos conflitos com novos olhos. Alguém jovem pode trazer alegria inesperada.",

    shadow: "Beware of recklessness disguised as spontaneity. Are you running toward something or away from responsibility? Ground your adventurous spirit.",
    shadow_pt: "Cuidado com a imprudência disfarçada de espontaneidade. Você está correndo em direção a algo ou fugindo da responsabilidade? Fundamente seu espírito aventureiro.",

    meditation: "Visualize yourself standing at a cliff's edge at sunrise. Feel the wind. What would you do if you knew you couldn't fail? Step forward in your mind.",
    meditation_pt: "Visualize-se à beira de um penhasco ao nascer do sol. Sinta o vento. O que você faria se soubesse que não poderia falhar? Dê um passo à frente em sua mente.",

    affirmation: "I trust the journey. I embrace new beginnings with joy and courage.",
    affirmation_pt: "Eu confio na jornada. Eu abraço novos começos com alegria e coragem.",

    daily_message: "Today invites you to take a chance. That idea you've been hesitant about? The universe is giving you the green light.",
    daily_message_pt: "Hoje convida você a arriscar. Aquela ideia sobre a qual você hesitava? O universo está dando luz verde.",

    yes_no: "Yes, but proceed with awareness. Trust, but verify.",
    yes_no_pt: "Sim, mas prossiga com consciência. Confie, mas verifique.",

    timing: "Spring energy. New moons. The beginning of any cycle. Act when you feel the pull of possibility.",
    timing_pt: "Energia de primavera. Luas novas. O início de qualquer ciclo. Aja quando sentir o chamado da possibilidade.",

    crystals: "Clear Quartz for clarity, Turquoise for protection on the journey, Citrine for optimistic energy.",
    crystals_pt: "Quartzo Transparente para clareza, Turquesa para proteção na jornada, Citrino para energia otimista.",
  },

  // ========== EXEMPLO: O MAGO ==========
  {
    cardId: "maj_1",

    spirituality: "The Magician represents the conduit between heaven and earth. You have the power to manifest spiritual wisdom into material reality. 'As above, so below.'",
    spirituality_pt: "O Mago representa o canal entre o céu e a terra. Você tem o poder de manifestar sabedoria espiritual em realidade material. 'Assim em cima, como embaixo.'",

    health: "You have all the tools for healing. Mind-body connection is strong now. Your thoughts directly influence your physical state - use this power wisely.",
    health_pt: "Você tem todas as ferramentas para a cura. A conexão mente-corpo está forte agora. Seus pensamentos influenciam diretamente seu estado físico - use esse poder com sabedoria.",

    finances: "Manifestation energy is high. Focus clearly on your financial goals. You have the skills to increase abundance - use them consciously.",
    finances_pt: "A energia de manifestação está alta. Foque claramente em seus objetivos financeiros. Você tem as habilidades para aumentar a abundância - use-as conscientemente.",

    family: "You can be the catalyst for positive change in family dynamics. Your communication skills are heightened. Lead by example.",
    family_pt: "Você pode ser o catalisador de mudanças positivas na dinâmica familiar. Suas habilidades de comunicação estão elevadas. Lidere pelo exemplo.",

    shadow: "Manipulation and trickery lurk in the shadow of power. Are you using your gifts ethically? Beware of ego masquerading as confidence.",
    shadow_pt: "Manipulação e truques espreitam na sombra do poder. Você está usando seus dons eticamente? Cuidado com o ego disfarçado de confiança.",

    meditation: "Visualize a column of light entering through your crown and exiting through your hands. Feel yourself as a channel for universal energy.",
    meditation_pt: "Visualize uma coluna de luz entrando pela sua coroa e saindo pelas suas mãos. Sinta-se como um canal para a energia universal.",

    affirmation: "I am a powerful creator. I manifest my desires with skill and integrity.",
    affirmation_pt: "Eu sou um criador poderoso. Eu manifesto meus desejos com habilidade e integridade.",

    daily_message: "Today you have all the resources you need. Stop waiting and start creating. The power is literally in your hands.",
    daily_message_pt: "Hoje você tem todos os recursos de que precisa. Pare de esperar e comece a criar. O poder está literalmente em suas mãos.",

    yes_no: "Yes! You have the power to make it happen. Take action now.",
    yes_no_pt: "Sim! Você tem o poder de fazer acontecer. Tome uma atitude agora.",

    timing: "Mercury days (Wednesday). When you feel focused and clear. The moment of inspiration.",
    timing_pt: "Dias de Mercúrio (quarta-feira). Quando você se sentir focado e claro. O momento da inspiração.",

    crystals: "Tiger's Eye for focus, Carnelian for creative action, Lapis Lazuli for wisdom.",
    crystals_pt: "Olho de Tigre para foco, Cornalina para ação criativa, Lápis Lazúli para sabedoria.",
  },

  // ========== ADICIONE MAIS CARTAS ABAIXO ==========
  // Copie o template e preencha para cada carta que desejar

];

// ============================================================================
// DEFINIÇÃO DE MÓDULOS DISPONÍVEIS (para renderização dinâmica)
// ============================================================================
export interface ModuleDefinition {
  key: string;           // Chave do módulo (ex: "spirituality")
  label: string;         // Label em inglês
  label_pt: string;      // Label em português
  icon: string;          // Material icon name
  color: string;         // Tailwind color class (ex: "purple", "emerald")
  order: number;         // Ordem de exibição
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // Módulos existentes
  { key: 'love', label: 'Love', label_pt: 'Amor', icon: 'favorite', color: 'pink', order: 1 },
  { key: 'career', label: 'Career', label_pt: 'Carreira', icon: 'work', color: 'blue', order: 2 },
  { key: 'advice', label: 'Advice', label_pt: 'Conselho', icon: 'tips_and_updates', color: 'yellow', order: 3 },

  // Módulos customizados
  { key: 'spirituality', label: 'Spirituality', label_pt: 'Espiritualidade', icon: 'self_improvement', color: 'violet', order: 4 },
  { key: 'health', label: 'Health', label_pt: 'Saúde', icon: 'health_and_safety', color: 'green', order: 5 },
  { key: 'finances', label: 'Finances', label_pt: 'Finanças', icon: 'payments', color: 'emerald', order: 6 },
  { key: 'family', label: 'Family', label_pt: 'Família', icon: 'family_restroom', color: 'orange', order: 7 },
  { key: 'shadow', label: 'Shadow Aspect', label_pt: 'Aspecto Sombra', icon: 'dark_mode', color: 'slate', order: 8 },
  { key: 'meditation', label: 'Meditation', label_pt: 'Meditação', icon: 'spa', color: 'cyan', order: 9 },
  { key: 'affirmation', label: 'Affirmation', label_pt: 'Afirmação', icon: 'record_voice_over', color: 'amber', order: 10 },
  { key: 'daily_message', label: 'Daily Message', label_pt: 'Mensagem do Dia', icon: 'wb_sunny', color: 'yellow', order: 11 },
  { key: 'yes_no', label: 'Yes or No', label_pt: 'Sim ou Não', icon: 'help', color: 'indigo', order: 12 },
  { key: 'timing', label: 'Timing', label_pt: 'Momento', icon: 'schedule', color: 'purple', order: 13 },
  { key: 'crystals', label: 'Crystals', label_pt: 'Cristais', icon: 'diamond', color: 'fuchsia', order: 14 },
];

// Helper para adicionar novos módulos dinamicamente
export const addModuleDefinition = (module: ModuleDefinition) => {
  const exists = MODULE_DEFINITIONS.find(m => m.key === module.key);
  if (!exists) {
    MODULE_DEFINITIONS.push(module);
    MODULE_DEFINITIONS.sort((a, b) => a.order - b.order);
  }
};
