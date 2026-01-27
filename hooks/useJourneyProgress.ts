/**
 * useJourneyProgress - Hook para calcular o progresso simbólico do usuário
 *
 * CONCEITO: "A Espiral do Louco"
 *
 * Na tradição do Tarot, O Louco (0) atravessa os 21 Arcanos Maiores em uma
 * jornada de transformação. Não é linear - é uma espiral ascendente onde
 * cada volta traz novos níveis de compreensão dos mesmos arquétipos.
 *
 * Cada "marco" representa um arquétipo desbloqueado através da prática.
 * Marcos futuros permanecem velados, criando mistério e antecipação.
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const IMG_BASE = "https://www.sacred-texts.com/tarot/pkt/img";

// Os 22 Arcanos Maiores como marcos da jornada
export interface ArcanaMarker {
  id: number;
  name: string;
  nameEn: string;
  symbol: string;
  imageUrl: string;
  threshold: number;
  essence: string;
  essenceEn: string;
  // Narrativa da jornada do Louco - o que acontece nesta etapa
  narrative: string;
  narrativeEn: string;
  // Revelação quando desbloqueado
  revelation: string;
  revelationEn: string;
  // Mensagem quando ainda latente
  latentMessage: string;
  latentMessageEn: string;
  // Lição arquetípica
  lesson: string;
  lessonEn: string;
}

export const ARCANA_JOURNEY: ArcanaMarker[] = [
  {
    id: 0,
    name: 'O Louco',
    nameEn: 'The Fool',
    symbol: '0',
    imageUrl: `${IMG_BASE}/ar00.jpg`,
    threshold: 0,
    essence: 'O Salto',
    essenceEn: 'The Leap',
    narrative: 'O Louco está à beira do precipício, mochila nas costas, olhar no horizonte. Não há medo, apenas a pureza do desconhecido. O cão late um aviso, mas ele dá o passo.',
    narrativeEn: 'The Fool stands at the edge of the cliff, pack on his back, eyes on the horizon. There is no fear, only the purity of the unknown. The dog barks a warning, but he takes the step.',
    revelation: 'Você deu o primeiro passo no desconhecido.',
    revelationEn: 'You took the first step into the unknown.',
    latentMessage: 'A jornada aguarda seu início.',
    latentMessageEn: 'The journey awaits your beginning.',
    lesson: 'Confiança cega no universo',
    lessonEn: 'Blind trust in the universe',
  },
  {
    id: 1,
    name: 'O Mago',
    nameEn: 'The Magician',
    symbol: 'I',
    imageUrl: `${IMG_BASE}/ar01.jpg`,
    threshold: 1,
    essence: 'A Intenção',
    essenceEn: 'The Intention',
    narrative: 'O Louco encontra O Mago, que lhe mostra os quatro elementos sobre a mesa. "Você tem tudo que precisa", diz ele. "Aponte para o céu e toque a terra. A vontade transforma."',
    narrativeEn: 'The Fool meets The Magician, who shows him the four elements on his table. "You have everything you need," he says. "Point to the sky and touch the earth. Will transforms."',
    revelation: 'Sua vontade começou a tomar forma.',
    revelationEn: 'Your will has begun to take shape.',
    latentMessage: 'O poder ainda dorme.',
    latentMessageEn: 'The power still sleeps.',
    lesson: 'Manifestar através da intenção',
    lessonEn: 'Manifest through intention',
  },
  {
    id: 2,
    name: 'A Sacerdotisa',
    nameEn: 'The High Priestess',
    symbol: 'II',
    imageUrl: `${IMG_BASE}/ar02.jpg`,
    threshold: 3,
    essence: 'O Silêncio',
    essenceEn: 'The Silence',
    narrative: 'Entre dois pilares, a Sacerdotisa guarda o véu do templo. Ela não fala. Apenas aponta para a lua crescente aos seus pés e para o pergaminho em seu colo. O Louco aprende a ouvir o silêncio.',
    narrativeEn: 'Between two pillars, the Priestess guards the temple veil. She does not speak. She only points to the crescent moon at her feet and the scroll in her lap. The Fool learns to hear the silence.',
    revelation: 'Você aprendeu a ouvir o que não é dito.',
    revelationEn: 'You learned to hear what is unspoken.',
    latentMessage: 'Os véus ainda não se abriram.',
    latentMessageEn: 'The veils have not yet parted.',
    lesson: 'Intuição e conhecimento oculto',
    lessonEn: 'Intuition and hidden knowledge',
  },
  {
    id: 3,
    name: 'A Imperatriz',
    nameEn: 'The Empress',
    symbol: 'III',
    imageUrl: `${IMG_BASE}/ar03.jpg`,
    threshold: 5,
    essence: 'A Criação',
    essenceEn: 'The Creation',
    narrative: 'O Louco entra em um jardim exuberante onde a Imperatriz reina sobre a fertilidade. Grãos de trigo crescem aos seus pés. "Tudo que você planta, cresce", ela sussurra. "Escolha bem suas sementes."',
    narrativeEn: 'The Fool enters a lush garden where the Empress reigns over fertility. Wheat grows at her feet. "Everything you plant grows," she whispers. "Choose your seeds well."',
    revelation: 'Algo novo germina em você.',
    revelationEn: 'Something new germinates within you.',
    latentMessage: 'A abundância espera ser cultivada.',
    latentMessageEn: 'Abundance waits to be cultivated.',
    lesson: 'Nutrir e criar vida',
    lessonEn: 'Nurturing and creating life',
  },
  {
    id: 4,
    name: 'O Imperador',
    nameEn: 'The Emperor',
    symbol: 'IV',
    imageUrl: `${IMG_BASE}/ar04.jpg`,
    threshold: 7,
    essence: 'A Estrutura',
    essenceEn: 'The Structure',
    narrative: 'No trono de pedra, o Imperador observa com olhos de águia. "Ordem não é prisão", ele declara. "É o esqueleto que permite ao corpo dançar." O Louco aprende que liberdade precisa de fundamentos.',
    narrativeEn: 'On the stone throne, the Emperor watches with eagle eyes. "Order is not prison," he declares. "It is the skeleton that allows the body to dance." The Fool learns that freedom needs foundations.',
    revelation: 'Você está construindo fundamentos.',
    revelationEn: 'You are building foundations.',
    latentMessage: 'A ordem ainda não se manifestou.',
    latentMessageEn: 'Order has not yet manifested.',
    lesson: 'Estrutura e autoridade interior',
    lessonEn: 'Structure and inner authority',
  },
  {
    id: 5,
    name: 'O Hierofante',
    nameEn: 'The Hierophant',
    symbol: 'V',
    imageUrl: `${IMG_BASE}/ar05.jpg`,
    threshold: 10,
    essence: 'A Tradição',
    essenceEn: 'The Tradition',
    narrative: 'No templo sagrado, o Hierofante ergue a mão em bênção. Dois acólitos ajoelham-se diante dele. "A sabedoria foi transmitida por gerações", ele ensina. "Você pode questionar, mas primeiro, aprenda."',
    narrativeEn: 'In the sacred temple, the Hierophant raises his hand in blessing. Two acolytes kneel before him. "Wisdom has been passed down for generations," he teaches. "You may question, but first, learn."',
    revelation: 'Você toca a sabedoria ancestral.',
    revelationEn: 'You touch ancestral wisdom.',
    latentMessage: 'Os ensinamentos aguardam.',
    latentMessageEn: 'The teachings await.',
    lesson: 'Respeitar a tradição antes de transcendê-la',
    lessonEn: 'Respect tradition before transcending it',
  },
  {
    id: 6,
    name: 'Os Amantes',
    nameEn: 'The Lovers',
    symbol: 'VI',
    imageUrl: `${IMG_BASE}/ar06.jpg`,
    threshold: 12,
    essence: 'A Escolha',
    essenceEn: 'The Choice',
    narrative: 'O anjo paira sobre duas figuras nuas. Atrás de um, a árvore da vida. Atrás do outro, a árvore do conhecimento. O Louco percebe: toda escolha genuína é uma renúncia. E toda renúncia, uma libertação.',
    narrativeEn: 'The angel hovers over two naked figures. Behind one, the tree of life. Behind the other, the tree of knowledge. The Fool realizes: every genuine choice is a renunciation. And every renunciation, a liberation.',
    revelation: 'Você está aprendendo a escolher.',
    revelationEn: 'You are learning to choose.',
    latentMessage: 'A encruzilhada ainda não chegou.',
    latentMessageEn: 'The crossroads has not yet come.',
    lesson: 'Escolher é aceitar consequências',
    lessonEn: 'To choose is to accept consequences',
  },
  {
    id: 7,
    name: 'O Carro',
    nameEn: 'The Chariot',
    symbol: 'VII',
    imageUrl: `${IMG_BASE}/ar07.jpg`,
    threshold: 15,
    essence: 'O Movimento',
    essenceEn: 'The Movement',
    narrative: 'Duas esfinges, uma negra e uma branca, puxam o carro do guerreiro. Elas querem direções opostas. Mas o condutor não usa rédeas — apenas a força de sua vontade as guia. O Louco domina seus instintos conflitantes.',
    narrativeEn: 'Two sphinxes, one black and one white, pull the warrior\'s chariot. They want opposite directions. But the driver uses no reins — only the force of his will guides them. The Fool masters his conflicting instincts.',
    revelation: 'Você ganhou momentum.',
    revelationEn: 'You have gained momentum.',
    latentMessage: 'As forças ainda não se alinharam.',
    latentMessageEn: 'The forces have not yet aligned.',
    lesson: 'Dominar forças opostas através da vontade',
    lessonEn: 'Master opposing forces through will',
  },
  {
    id: 8,
    name: 'A Força',
    nameEn: 'Strength',
    symbol: 'VIII',
    imageUrl: `${IMG_BASE}/ar08.jpg`,
    threshold: 18,
    essence: 'A Coragem',
    essenceEn: 'The Courage',
    narrative: 'Uma mulher fecha suavemente a mandíbula de um leão. Não há luta, não há sangue. Apenas infinita paciência e amor que desarma a besta. O Louco descobre que a verdadeira força não destrói — ela transforma.',
    narrativeEn: 'A woman gently closes a lion\'s jaw. There is no fight, no blood. Only infinite patience and love that disarms the beast. The Fool discovers that true strength does not destroy — it transforms.',
    revelation: 'Sua força interior desperta.',
    revelationEn: 'Your inner strength awakens.',
    latentMessage: 'O leão ainda não foi domado.',
    latentMessageEn: 'The lion has not yet been tamed.',
    lesson: 'Gentileza é a força suprema',
    lessonEn: 'Gentleness is the supreme strength',
  },
  {
    id: 9,
    name: 'O Eremita',
    nameEn: 'The Hermit',
    symbol: 'IX',
    imageUrl: `${IMG_BASE}/ar09.jpg`,
    threshold: 21,
    essence: 'A Introspecção',
    essenceEn: 'The Introspection',
    narrative: 'No topo da montanha, o ancião ergue sua lanterna contra a escuridão. Ele não busca — ele mostra o caminho para quem vier depois. O Louco entende que às vezes é preciso se afastar para ver claramente.',
    narrativeEn: 'At the mountain\'s peak, the elder raises his lantern against the darkness. He does not seek — he shows the way for those who come after. The Fool understands that sometimes one must withdraw to see clearly.',
    revelation: 'Você encontrou luz na solidão.',
    revelationEn: 'You found light in solitude.',
    latentMessage: 'A lanterna ainda não foi acesa.',
    latentMessageEn: 'The lantern has not yet been lit.',
    lesson: 'Solidão ilumina verdades internas',
    lessonEn: 'Solitude illuminates inner truths',
  },
  {
    id: 10,
    name: 'A Roda da Fortuna',
    nameEn: 'Wheel of Fortune',
    symbol: 'X',
    imageUrl: `${IMG_BASE}/ar10.jpg`,
    threshold: 25,
    essence: 'Os Ciclos',
    essenceEn: 'The Cycles',
    narrative: 'A grande roda gira eternamente. Criaturas sobem e descem — algumas dormem, outras lutam. No centro, a esfinge permanece imóvel. O Louco percebe: o centro do ciclone é sempre calmo.',
    narrativeEn: 'The great wheel turns eternally. Creatures rise and fall — some sleep, others struggle. At the center, the sphinx remains still. The Fool realizes: the center of the cyclone is always calm.',
    revelation: 'Você reconhece os padrões.',
    revelationEn: 'You recognize the patterns.',
    latentMessage: 'A roda ainda não girou.',
    latentMessageEn: 'The wheel has not yet turned.',
    lesson: 'Aceitar o fluxo das mudanças',
    lessonEn: 'Accept the flow of changes',
  },
  {
    id: 11,
    name: 'A Justiça',
    nameEn: 'Justice',
    symbol: 'XI',
    imageUrl: `${IMG_BASE}/ar11.jpg`,
    threshold: 30,
    essence: 'O Equilíbrio',
    essenceEn: 'The Balance',
    narrative: 'Entre pilares, a figura coroada segura a balança e a espada. Seus olhos não estão vendados — ela vê tudo. "Causa e efeito", ela proclama. "Cada ação é uma semente." O Louco aceita responsabilidade.',
    narrativeEn: 'Between pillars, the crowned figure holds scales and sword. Her eyes are not blindfolded — she sees all. "Cause and effect," she proclaims. "Every action is a seed." The Fool accepts responsibility.',
    revelation: 'Você busca a verdade.',
    revelationEn: 'You seek the truth.',
    latentMessage: 'A balança ainda não se equilibrou.',
    latentMessageEn: 'The scales have not yet balanced.',
    lesson: 'Colhemos o que plantamos',
    lessonEn: 'We reap what we sow',
  },
  {
    id: 12,
    name: 'O Enforcado',
    nameEn: 'The Hanged Man',
    symbol: 'XII',
    imageUrl: `${IMG_BASE}/ar12.jpg`,
    threshold: 35,
    essence: 'A Suspensão',
    essenceEn: 'The Suspension',
    narrative: 'Pendurado de cabeça para baixo, o homem não sofre. Uma auréola brilha ao redor de sua cabeça. Ele escolheu esta posição. O Louco aprende que às vezes a rendição é a única vitória possível.',
    narrativeEn: 'Hanging upside down, the man does not suffer. A halo glows around his head. He chose this position. The Fool learns that sometimes surrender is the only possible victory.',
    revelation: 'Você vê de uma perspectiva nova.',
    revelationEn: 'You see from a new perspective.',
    latentMessage: 'A inversão ainda não chegou.',
    latentMessageEn: 'The inversion has not yet come.',
    lesson: 'Sacrifício consciente traz iluminação',
    lessonEn: 'Conscious sacrifice brings illumination',
  },
  {
    id: 13,
    name: 'A Morte',
    nameEn: 'Death',
    symbol: 'XIII',
    imageUrl: `${IMG_BASE}/ar13.jpg`,
    threshold: 40,
    essence: 'A Transformação',
    essenceEn: 'The Transformation',
    narrative: 'O cavaleiro esquelético avança, e ninguém escapa — nem rei, nem criança. Mas atrás dele, o sol nasce entre duas torres. O Louco finalmente entende: cada morte é um nascimento disfarçado.',
    narrativeEn: 'The skeletal rider advances, and no one escapes — not king, not child. But behind him, the sun rises between two towers. The Fool finally understands: every death is a birth in disguise.',
    revelation: 'Você deixou algo morrer para renascer.',
    revelationEn: 'You let something die to be reborn.',
    latentMessage: 'O fim ainda não veio.',
    latentMessageEn: 'The end has not yet come.',
    lesson: 'Transformação exige deixar ir',
    lessonEn: 'Transformation requires letting go',
  },
  {
    id: 14,
    name: 'A Temperança',
    nameEn: 'Temperance',
    symbol: 'XIV',
    imageUrl: `${IMG_BASE}/ar14.jpg`,
    threshold: 45,
    essence: 'A Alquimia',
    essenceEn: 'The Alchemy',
    narrative: 'O anjo derrama água entre dois cálices, misturando sem derramar. Um pé na água, outro na terra. "A arte suprema", ele ensina, "é mesclar opostos sem destruir nenhum." O Louco pratica a paciência da integração.',
    narrativeEn: 'The angel pours water between two cups, mixing without spilling. One foot in water, another on land. "The supreme art," he teaches, "is to blend opposites without destroying either." The Fool practices the patience of integration.',
    revelation: 'Você está integrando opostos.',
    revelationEn: 'You are integrating opposites.',
    latentMessage: 'A mistura ainda não começou.',
    latentMessageEn: 'The blending has not yet begun.',
    lesson: 'Equilíbrio através da moderação',
    lessonEn: 'Balance through moderation',
  },
  {
    id: 15,
    name: 'O Diabo',
    nameEn: 'The Devil',
    symbol: 'XV',
    imageUrl: `${IMG_BASE}/ar15.jpg`,
    threshold: 50,
    essence: 'As Sombras',
    essenceEn: 'The Shadows',
    narrative: 'Duas figuras acorrentadas ao pedestal do Diabo. Mas olhe de perto — as correntes são frouxas. Elas poderiam escapar a qualquer momento. O Louco confronta suas próprias prisões voluntárias.',
    narrativeEn: 'Two figures chained to the Devil\'s pedestal. But look closely — the chains are loose. They could escape at any moment. The Fool confronts his own voluntary prisons.',
    revelation: 'Você reconhece suas correntes.',
    revelationEn: 'You recognize your chains.',
    latentMessage: 'As sombras ainda se escondem.',
    latentMessageEn: 'The shadows still hide.',
    lesson: 'Nossas correntes são quase sempre escolhas',
    lessonEn: 'Our chains are almost always choices',
  },
  {
    id: 16,
    name: 'A Torre',
    nameEn: 'The Tower',
    symbol: 'XVI',
    imageUrl: `${IMG_BASE}/ar16.jpg`,
    threshold: 60,
    essence: 'A Ruptura',
    essenceEn: 'The Rupture',
    narrative: 'O raio atinge a torre, e coroas caem do céu. O que parecia sólido se revela ilusão. Mas no caos, há libertação. O Louco descobre que algumas estruturas precisam cair para que a verdade emerja.',
    narrativeEn: 'Lightning strikes the tower, and crowns fall from the sky. What seemed solid reveals itself as illusion. But in chaos, there is liberation. The Fool discovers that some structures must fall for truth to emerge.',
    revelation: 'Você sobreviveu ao colapso.',
    revelationEn: 'You survived the collapse.',
    latentMessage: 'A estrutura ainda não caiu.',
    latentMessageEn: 'The structure has not yet fallen.',
    lesson: 'Destruição pode ser libertação',
    lessonEn: 'Destruction can be liberation',
  },
  {
    id: 17,
    name: 'A Estrela',
    nameEn: 'The Star',
    symbol: 'XVII',
    imageUrl: `${IMG_BASE}/ar17.jpg`,
    threshold: 70,
    essence: 'A Esperança',
    essenceEn: 'The Hope',
    narrative: 'Após a tempestade, uma mulher nua derrama água na terra e no lago. Acima dela, uma grande estrela brilha cercada de sete menores. O Louco respira. Há renovação após toda destruição.',
    narrativeEn: 'After the storm, a naked woman pours water on land and lake. Above her, a great star shines surrounded by seven smaller ones. The Fool breathes. There is renewal after every destruction.',
    revelation: 'Você encontrou renovação.',
    revelationEn: 'You found renewal.',
    latentMessage: 'A luz ainda não brilhou.',
    latentMessageEn: 'The light has not yet shone.',
    lesson: 'Esperança floresce nas ruínas',
    lessonEn: 'Hope flourishes in the ruins',
  },
  {
    id: 18,
    name: 'A Lua',
    nameEn: 'The Moon',
    symbol: 'XVIII',
    imageUrl: `${IMG_BASE}/ar18.jpg`,
    threshold: 80,
    essence: 'O Inconsciente',
    essenceEn: 'The Unconscious',
    narrative: 'O caminho serpenteia entre duas torres, guardado por um cão e um lobo. Da lagoa, um crustáceo emerge. A lua chora gotas de orvalho. O Louco entra no reino dos sonhos, onde nada é o que parece.',
    narrativeEn: 'The path winds between two towers, guarded by dog and wolf. From the pool, a crustacean emerges. The moon weeps drops of dew. The Fool enters the realm of dreams, where nothing is what it seems.',
    revelation: 'Você navega o desconhecido.',
    revelationEn: 'You navigate the unknown.',
    latentMessage: 'Os sonhos ainda não falaram.',
    latentMessageEn: 'The dreams have not yet spoken.',
    lesson: 'O inconsciente guarda verdades profundas',
    lessonEn: 'The unconscious holds deep truths',
  },
  {
    id: 19,
    name: 'O Sol',
    nameEn: 'The Sun',
    symbol: 'XIX',
    imageUrl: `${IMG_BASE}/ar19.jpg`,
    threshold: 90,
    essence: 'A Clareza',
    essenceEn: 'The Clarity',
    narrative: 'Uma criança nua cavalga um cavalo branco sob um sol radiante. Girassóis se voltam para a luz. Não há sombras aqui, não há dúvidas. O Louco redescobre a alegria simples de existir.',
    narrativeEn: 'A naked child rides a white horse under a radiant sun. Sunflowers turn toward the light. There are no shadows here, no doubts. The Fool rediscovers the simple joy of existing.',
    revelation: 'Você encontrou a luz interior.',
    revelationEn: 'You found the inner light.',
    latentMessage: 'O amanhecer ainda não chegou.',
    latentMessageEn: 'The dawn has not yet come.',
    lesson: 'A clareza dissolve a ilusão',
    lessonEn: 'Clarity dissolves illusion',
  },
  {
    id: 20,
    name: 'O Julgamento',
    nameEn: 'Judgement',
    symbol: 'XX',
    imageUrl: `${IMG_BASE}/ar20.jpg`,
    threshold: 100,
    essence: 'O Despertar',
    essenceEn: 'The Awakening',
    narrative: 'O anjo toca a trombeta, e os mortos se erguem de seus túmulos. Braços se abrem para o céu. Não é punição — é ressurreição. O Louco percebe que sempre é possível renascer enquanto há consciência.',
    narrativeEn: 'The angel sounds the trumpet, and the dead rise from their graves. Arms open to the sky. It is not punishment — it is resurrection. The Fool realizes that rebirth is always possible while there is consciousness.',
    revelation: 'Você ouviu o chamado.',
    revelationEn: 'You heard the call.',
    latentMessage: 'O chamado ainda não soou.',
    latentMessageEn: 'The call has not yet sounded.',
    lesson: 'Nunca é tarde para despertar',
    lessonEn: 'It is never too late to awaken',
  },
  {
    id: 21,
    name: 'O Mundo',
    nameEn: 'The World',
    symbol: 'XXI',
    imageUrl: `${IMG_BASE}/ar21.jpg`,
    threshold: 120,
    essence: 'A Integração',
    essenceEn: 'The Integration',
    narrative: 'A dançarina flutua dentro da guirlanda, segurando duas varas. Nos cantos, os quatro seres — leão, touro, águia, anjo — observam em silêncio. O ciclo se completa. Mas toda conclusão é também um novo começo.',
    narrativeEn: 'The dancer floats within the wreath, holding two wands. In the corners, the four beings — lion, bull, eagle, angel — watch in silence. The cycle completes. But every conclusion is also a new beginning.',
    revelation: 'Você completou um ciclo.',
    revelationEn: 'You completed a cycle.',
    latentMessage: 'A totalidade ainda não se manifestou.',
    latentMessageEn: 'Wholeness has not yet manifested.',
    lesson: 'A jornada é infinita',
    lessonEn: 'The journey is infinite',
  },
];

export interface JourneyProgress {
  totalReadings: number;
  daysSinceStart: number;
  unlockedMarkers: ArcanaMarker[];
  nextMarker: ArcanaMarker | null;
  progressToNext: number;
  readingsToNext: number;
  allMarkers: ArcanaMarker[];
  currentMarkerIndex: number;
  totalProgress: number;
  contextMessage: string;
  contextMessageEn: string;
}

export const useJourneyProgress = (): JourneyProgress => {
  const { readingsToday, profile } = useAuth();

  return useMemo(() => {
    const totalReadings = profile?.readings_today || readingsToday || 0;

    const daysSinceStart = profile?.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const unlockedMarkers = ARCANA_JOURNEY.filter(m => totalReadings >= m.threshold);
    const currentMarkerIndex = unlockedMarkers.length - 1;

    const nextMarker = ARCANA_JOURNEY.find(m => totalReadings < m.threshold) || null;

    let progressToNext = 100;
    let readingsToNext = 0;

    if (nextMarker && currentMarkerIndex >= 0) {
      const currentThreshold = ARCANA_JOURNEY[currentMarkerIndex].threshold;
      const nextThreshold = nextMarker.threshold;
      const range = nextThreshold - currentThreshold;
      const progress = totalReadings - currentThreshold;
      progressToNext = Math.min(100, (progress / range) * 100);
      readingsToNext = nextThreshold - totalReadings;
    } else if (nextMarker) {
      progressToNext = (totalReadings / nextMarker.threshold) * 100;
      readingsToNext = nextMarker.threshold - totalReadings;
    }

    const lastThreshold = ARCANA_JOURNEY[ARCANA_JOURNEY.length - 1].threshold;
    const totalProgress = Math.min(100, (totalReadings / lastThreshold) * 100);

    let contextMessage = 'Sua jornada aguarda o primeiro passo.';
    let contextMessageEn = 'Your journey awaits the first step.';

    if (totalReadings === 0) {
      contextMessage = 'O Louco olha para o abismo. Você dará o salto?';
      contextMessageEn = 'The Fool gazes into the abyss. Will you take the leap?';
    } else if (totalReadings < 5) {
      contextMessage = `Você atravessou ${totalReadings} ${totalReadings === 1 ? 'portal' : 'portais'}. A jornada apenas começou.`;
      contextMessageEn = `You crossed ${totalReadings} ${totalReadings === 1 ? 'portal' : 'portals'}. The journey has just begun.`;
    } else if (totalReadings < 15) {
      contextMessage = 'Padrões começam a emergir das sombras.';
      contextMessageEn = 'Patterns begin to emerge from the shadows.';
    } else if (totalReadings < 30) {
      contextMessage = 'Você está na metade do caminho visível. O invisível ainda aguarda.';
      contextMessageEn = 'You are halfway through the visible path. The invisible still awaits.';
    } else if (totalReadings < 50) {
      contextMessage = 'Os arcanos mais profundos começam a revelar-se.';
      contextMessageEn = 'The deeper arcana begin to reveal themselves.';
    } else if (totalReadings < 80) {
      contextMessage = 'Você caminha entre a luz e a sombra.';
      contextMessageEn = 'You walk between light and shadow.';
    } else if (totalReadings < 100) {
      contextMessage = 'O fim da espiral se aproxima. Ou seria um novo início?';
      contextMessageEn = 'The end of the spiral approaches. Or is it a new beginning?';
    } else {
      contextMessage = 'Você completou a espiral. A jornada continua em outro nível.';
      contextMessageEn = 'You completed the spiral. The journey continues on another level.';
    }

    return {
      totalReadings,
      daysSinceStart,
      unlockedMarkers,
      nextMarker,
      progressToNext,
      readingsToNext,
      allMarkers: ARCANA_JOURNEY,
      currentMarkerIndex: Math.max(0, currentMarkerIndex),
      totalProgress,
      contextMessage,
      contextMessageEn,
    };
  }, [readingsToday, profile]);
};

export default useJourneyProgress;
