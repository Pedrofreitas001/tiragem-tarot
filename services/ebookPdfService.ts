/**
 * Serviço de geração do Ebook Premium - Jornada do Herói
 * Gera um PDF premium com os 22 Arcanos Maiores do Tarot
 * Estilo visual: Zaya Tarot (roxo escuro, dourado, fontes elegantes)
 */
import jsPDF from 'jspdf';

// ============================================================
// CONSTANTES DE LAYOUT
// ============================================================
const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 22;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Cores do site Zaya Tarot
const C = {
  BG_DARK:       [22, 17, 24]   as const,  // #161118
  ROXO_ESCURO:   [45, 27, 78]   as const,  // #2D1B4E
  ROXO_MEDIO:    [91, 58, 143]  as const,  // #5B3A8F
  ROXO_CLARO:    [155, 126, 189] as const, // #9B7EBD
  PRIMARY:       [147, 17, 212]  as const,  // #9311d4
  DOURADO:       [212, 175, 55]  as const,  // #D4AF37
  DOURADO_CLARO: [244, 228, 176] as const, // #F4E4B0
  TEXTO:         [232, 224, 240] as const,  // #E8E0F0
  SURFACE:       [28, 16, 34]    as const,  // #1c1022
  WHITE:         [255, 255, 255] as const,
  CARD_BG:       [35, 28, 39]    as const,  // #231c27
  BORDER:        [51, 40, 57]    as const,  // #332839
};

// URLs das imagens das cartas (Rider-Waite, domínio público)
const IMG_BASE = 'https://www.sacred-texts.com/tarot/pkt/img';
const CARD_IMAGES: Record<string, string> = {
  'O LOUCO':           `${IMG_BASE}/ar00.jpg`,
  'O MAGO':            `${IMG_BASE}/ar01.jpg`,
  'A SACERDOTISA':     `${IMG_BASE}/ar02.jpg`,
  'A IMPERATRIZ':      `${IMG_BASE}/ar03.jpg`,
  'O IMPERADOR':       `${IMG_BASE}/ar04.jpg`,
  'O HIEROFANTE':      `${IMG_BASE}/ar05.jpg`,
  'OS AMANTES':        `${IMG_BASE}/ar06.jpg`,
  'O CARRO':           `${IMG_BASE}/ar07.jpg`,
  'A FORÇA':           `${IMG_BASE}/ar08.jpg`,
  'O EREMITA':         `${IMG_BASE}/ar09.jpg`,
  'A RODA DA FORTUNA': `${IMG_BASE}/ar10.jpg`,
  'A JUSTIÇA':         `${IMG_BASE}/ar11.jpg`,
  'O ENFORCADO':       `${IMG_BASE}/ar12.jpg`,
  'A MORTE':           `${IMG_BASE}/ar13.jpg`,
  'A TEMPERANÇA':      `${IMG_BASE}/ar14.jpg`,
  'O DIABO':           `${IMG_BASE}/ar15.jpg`,
  'A TORRE':           `${IMG_BASE}/ar16.jpg`,
  'A ESTRELA':         `${IMG_BASE}/ar17.jpg`,
  'A LUA':             `${IMG_BASE}/ar18.jpg`,
  'O SOL':             `${IMG_BASE}/ar19.jpg`,
  'O JULGAMENTO':      `${IMG_BASE}/ar20.jpg`,
  'O MUNDO':           `${IMG_BASE}/ar21.jpg`,
};

// ============================================================
// DADOS DOS 22 ARCANOS MAIORES
// ============================================================
const ARCANOS = [
  {
    numero: '0', nome: 'O LOUCO', arquetipo: 'O Chamado à Aventura',
    significado: 'O Louco representa o início da jornada, o momento de dar o primeiro passo no desconhecido. É a inocência, a espontaneidade e a coragem de começar sem garantias.',
    simbolos: 'O jovem à beira do precipício carrega uma pequena trouxa — tudo o que possui. O cão branco simboliza a intuição e a proteção. A rosa branca representa a pureza de intenção. O precipício não é um perigo, mas uma metáfora para o salto de fé.',
    psicologia: 'Psicologicamente, o Louco representa o ego antes da diferenciação, o estado de potencial puro. É a criança interior que ainda não foi condicionada pelas expectativas sociais. Espiritualmente, é o espírito livre buscando experiência.',
    vida_real: 'Este arquétipo aparece quando você está prestes a começar algo novo: um projeto, relacionamento, mudança de carreira. É aquele momento em que você sente que precisa dar um salto de fé, mesmo sem ter todas as respostas.',
    mensagem: 'Confie no processo. A jornada começa com um único passo. Não espere estar completamente preparado — a preparação acontece no caminho. Abrace o desconhecido com curiosidade e coragem.'
  },
  {
    numero: 'I', nome: 'O MAGO', arquetipo: 'O Despertar do Poder Pessoal',
    significado: 'O Mago é o arquétipo da manifestação consciente. Representa o momento em que percebemos que temos recursos, habilidades e o poder de transformar nossa realidade.',
    simbolos: 'Os quatro elementos na mesa (copa, espada, moeda e cetro) representam domínio sobre água, ar, terra e fogo — as ferramentas necessárias para criar. O símbolo do infinito sobre sua cabeça indica consciência ilimitada. A vara erguida conecta o céu à terra.',
    psicologia: 'É a tomada de consciência do próprio potencial. O Mago representa a fase em que saímos da passividade e reconhecemos nossa agência no mundo. É o momento "Eu posso fazer isso acontecer".',
    vida_real: 'Surge quando você percebe suas capacidades e começa a usá-las conscientemente. Pode ser o início de um negócio, o desenvolvimento de uma habilidade, ou simplesmente perceber que você tem mais controle sobre sua vida do que imaginava.',
    mensagem: 'Você tem as ferramentas necessárias. O poder está em suas mãos. Comece a manifestar suas intenções através da ação consciente. "Como é acima, é embaixo" — seus pensamentos criam sua realidade.'
  },
  {
    numero: 'II', nome: 'A SACERDOTISA', arquetipo: 'A Guardiã do Inconsciente',
    significado: 'A Sacerdotisa representa o conhecimento intuitivo, os mistérios ocultos e a sabedoria que vem do silêncio. É o portal para o inconsciente.',
    simbolos: 'Sentada entre dois pilares (Boaz e Jachin — rigor e misericórdia), ela guarda o véu decorado com romãs, símbolo do inconsciente fértil. A lua aos seus pés representa ciclos e mistério. O pergaminho TORA em seu colo simboliza a lei divina.',
    psicologia: 'Representa o self feminino, a anima no sentido junguiano. É a parte de nós que sabe sem saber como sabe — a intuição profunda. Também simboliza o que ainda não está consciente, mas está se formando.',
    vida_real: 'Aparece quando precisamos parar de agir e começar a escutar. Momentos em que a resposta não vem da lógica, mas da intuição. Quando sonhos, sincronicidades e pressentimentos se tornam importantes.',
    mensagem: 'Nem tudo precisa ser explicado ou compreendido racionalmente. Confie em sua intuição. Há sabedoria no silêncio. Algumas coisas precisam amadurecer no escuro antes de virem à luz.'
  },
  {
    numero: 'III', nome: 'A IMPERATRIZ', arquetipo: 'A Mãe Criadora',
    significado: 'A Imperatriz é a abundância, a fertilidade e a criação materializada. Representa o poder de nutrir, crescer e dar forma ao que foi semeado.',
    simbolos: 'Grávida, sentada em meio à natureza exuberante, ela usa uma coroa de 12 estrelas (os meses, os ciclos). O cetro simboliza seu domínio sobre o mundo material. O escudo com o símbolo de Vênus representa o amor e a beleza.',
    psicologia: 'É o arquétipo materno em sua forma criativa — não apenas no sentido biológico, mas em qualquer ato de nutrir e dar vida a projetos, ideias, relacionamentos. Representa a abundância que surge quando cuidamos com amor.',
    vida_real: 'Manifesta-se em momentos de crescimento, prosperidade e colheita. Quando um projeto floresce, quando cuidamos de algo ou alguém e vemos os frutos, quando nos conectamos com a natureza e a sensualidade da vida.',
    mensagem: 'Nutra o que você criou. A abundância é natural quando você cuida com amor. Conecte-se com o mundo material e seus prazeres. A criação é um ato de amor.'
  },
  {
    numero: 'IV', nome: 'O IMPERADOR', arquetipo: 'O Construtor de Estruturas',
    significado: 'O Imperador representa a ordem, a autoridade e a estrutura. É o poder de organizar, governar e estabelecer fundações sólidas.',
    simbolos: 'Sentado em um trono de pedra decorado com carneiros (Áries, a força pioneira), ele segura o cetro e o orbe — símbolos de poder temporal. As montanhas ao fundo representam realizações sólidas e duradouras.',
    psicologia: 'É o princípio paterno, a autoridade interna. Representa a capacidade de criar estrutura, disciplina e ordem na própria vida. É o ego diferenciado que pode dizer "não" e estabelecer limites.',
    vida_real: 'Surge quando precisamos estabelecer rotinas, criar estruturas, assumir responsabilidades. Quando precisamos de disciplina para concretizar o que foi iniciado. Momentos de liderança e tomada de decisões estratégicas.',
    mensagem: 'Construa fundações sólidas. A ordem não é opressão — é a estrutura que permite o crescimento. Assuma sua autoridade. Lidere sua vida com responsabilidade e visão estratégica.'
  },
  {
    numero: 'V', nome: 'O HIEROFANTE', arquetipo: 'O Mestre Espiritual',
    significado: 'O Hierofante é a ponte entre o divino e o humano, o portador da tradição e da sabedoria institucionalizada. Representa o ensino, a mentoria e os sistemas de crença.',
    simbolos: 'Sentado entre dois pilares (como a Sacerdotisa, mas agora no mundo externo), ele abençoa dois discípulos. As três cruzes representam os três mundos (material, emocional, espiritual). As chaves aos seus pés simbolizam os mistérios que ele pode revelar.',
    psicologia: 'Representa a necessidade de integrar-se a algo maior — uma tradição, comunidade ou sistema de crenças. É a fase em que buscamos mestres, guias e ensinamentos estruturados. Também pode indicar conformidade versus autenticidade.',
    vida_real: 'Aparece quando buscamos educação formal, mentoria espiritual ou quando nos conectamos com tradições. Também surge quando questionamos se estamos seguindo nossas verdades ou apenas repetindo dogmas.',
    mensagem: 'Honre a sabedoria que veio antes de você. Mas lembre-se: tradições servem para guiar, não para aprisionar. Busque mestres, mas mantenha seu discernimento. A verdadeira espiritualidade é pessoal.'
  },
  {
    numero: 'VI', nome: 'OS AMANTES', arquetipo: 'A Grande Escolha',
    significado: 'Os Amantes representam escolhas, relacionamentos e a integração de opostos. É o momento de decisão consciente baseada em valores pessoais.',
    simbolos: 'Adão e Eva sob a bênção do Arcanjo Rafael. A árvore da vida (12 frutos) atrás de Adão e a árvore do conhecimento (com a serpente) atrás de Eva. O sol ao fundo representa consciência. É a escolha entre instinto e consciência.',
    psicologia: 'Representa a individuação através da relação. Não é apenas sobre romance, mas sobre qualquer escolha que define quem somos. É o momento de integrar aspectos opostos da personalidade — masculino/feminino, consciente/inconsciente.',
    vida_real: 'Surge em momentos de decisões importantes que definirão seu caminho. Pode ser uma escolha de relacionamento, carreira ou valores. É quando você precisa decidir baseado no que é verdadeiro para você, não no que é esperado.',
    mensagem: 'Faça escolhas conscientes alinhadas com seus valores. Relacionamentos (com outros e consigo mesmo) exigem integração de opostos. Você é formado tanto pela luz quanto pela sombra — aceite ambos.'
  },
  {
    numero: 'VII', nome: 'O CARRO', arquetipo: 'A Vitória Através da Determinação',
    significado: 'O Carro representa a conquista através da força de vontade, o movimento dirigido e a superação de conflitos internos.',
    simbolos: 'Um guerreiro em sua carruagem, puxada por duas esfinges (uma branca, uma preta — forças opostas). O cetro representa domínio, a armadura estrelar mostra proteção espiritual. O dossel de estrelas representa a influência celestial.',
    psicologia: 'É o ego fortalecido que pode direcionar impulsos conflitantes. Representa a capacidade de manter-se focado apesar das distrações. É disciplina interna transformada em progresso externo.',
    vida_real: 'Aparece quando você precisa avançar apesar das dificuldades. Quando forças opostas dentro de você (dúvida/confiança, medo/coragem) precisam ser harmonizadas para seguir em frente. Momentos de determinação e foco.',
    mensagem: 'Mantenha o foco. Você tem controle sobre a direção de sua vida. Forças opostas dentro de você não precisam estar em conflito — podem trabalhar juntas. Avance com determinação.'
  },
  {
    numero: 'VIII', nome: 'A FORÇA', arquetipo: 'A Coragem Compassiva',
    significado: 'A Força representa o poder que vem da compaixão, não da dominação. É a coragem de enfrentar o que é selvagem dentro de nós com gentileza.',
    simbolos: 'Uma mulher fechando suavemente a boca de um leão. O símbolo do infinito sobre sua cabeça mostra consciência ilimitada. A corrente de flores indica que o controle vem do amor, não da força bruta.',
    psicologia: 'Representa a integração dos instintos através da compaixão. Não é reprimir a natureza animal, mas integrá-la com consciência. É força verdadeira — aquela que vem da aceitação e do amor-próprio.',
    vida_real: 'Surge quando você precisa enfrentar seus medos, vícios ou aspectos selvagens da personalidade. Quando a raiva, o medo ou o desejo surgem e você escolhe não reprimi-los, mas integrá-los com consciência.',
    mensagem: 'Verdadeira força é gentil. Você não precisa dominar seus instintos — precisa entendê-los e integrá-los. Coragem não é ausência de medo, mas a capacidade de agir apesar dele.'
  },
  {
    numero: 'IX', nome: 'O EREMITA', arquetipo: 'A Busca Interior',
    significado: 'O Eremita representa o retiro necessário, a busca interior e a sabedoria que vem da solidão. É o momento de virar-se para dentro.',
    simbolos: 'Um velho sábio no topo de uma montanha, segurando uma lanterna com uma estrela de seis pontas (Selo de Salomão — equilíbrio). O cajado representa apoio e autoridade espiritual. A neve representa purificação.',
    psicologia: 'É o processo de individuação que exige afastamento do coletivo. Representa a necessidade de solidão para encontrar respostas. É o momento de parar de buscar validação externa e olhar para dentro.',
    vida_real: 'Aparece quando você precisa de tempo sozinho para refletir. Momentos de retiro, meditação, autoanálise. Quando as respostas não virão de livros ou pessoas, mas do silêncio e da reflexão.',
    mensagem: 'Nem toda jornada é social. Às vezes você precisa se afastar para se encontrar. A sabedoria vem do silêncio. Ilumine seu próprio caminho antes de tentar iluminar o dos outros.'
  },
  {
    numero: 'X', nome: 'A RODA DA FORTUNA', arquetipo: 'Os Ciclos Inevitáveis',
    significado: 'A Roda da Fortuna representa os ciclos da vida, a impermanência e o destino que está além do controle individual.',
    simbolos: 'Uma roda girando, com símbolos alquímicos e hebraicos. Criaturas dos evangelhos nos cantos (touro, leão, águia, anjo) representam os elementos fixos. Anúbis sobe, Set desce — o que sobe, desce.',
    psicologia: 'Representa a aceitação da impermanência. É o reconhecimento de que há forças além do nosso controle. Também simboliza sincronicidades e o momento de reconhecer padrões cíclicos na vida.',
    vida_real: 'Surge em momentos de grande mudança — para melhor ou pior. Quando circunstâncias externas mudam dramaticamente. Quando você percebe padrões repetitivos em sua vida. Momentos de sorte ou azar significativos.',
    mensagem: 'Tudo é impermanente. O que está embaixo hoje pode estar em cima amanhã. Não se apegue à sorte nem desespere no azar. Há um ritmo maior na vida — aprenda a fluir com ele.'
  },
  {
    numero: 'XI', nome: 'A JUSTIÇA', arquetipo: 'O Equilíbrio e a Responsabilidade',
    significado: 'A Justiça representa causa e efeito, responsabilidade pessoal e a busca por equilíbrio. É o momento de colher o que foi plantado.',
    simbolos: 'Uma figura segurando uma espada (discernimento) e uma balança (equilíbrio). Os pilares representam a lei universal. O quadrado no peito simboliza a fundação terrena da justiça.',
    psicologia: 'Representa a confrontação com as consequências de nossas escolhas. É o superego maduro — não punitivo, mas equilibrado. Reconhecimento de que somos responsáveis por nossas vidas.',
    vida_real: 'Aparece quando você enfrenta consequências — positivas ou negativas — de ações passadas. Momentos de decisões importantes, contratos, acordos. Quando você precisa ser honesto sobre sua parte em situações.',
    mensagem: 'Você é responsável por suas escolhas. Justiça não é apenas sobre o que você recebe, mas sobre integridade em suas ações. Busque equilíbrio. O universo responde à energia que você emite.'
  },
  {
    numero: 'XII', nome: 'O ENFORCADO', arquetipo: 'O Sacrifício Necessário',
    significado: 'O Enforcado representa a suspensão voluntária, a mudança de perspectiva e o sacrifício que traz iluminação.',
    simbolos: 'Um homem pendurado de cabeça para baixo em uma árvore viva, mas sereno. O halo ao redor da cabeça indica iluminação. Pendurado por uma perna, a outra forma um "4" — estabilidade no caos. As mãos atrás das costas formam um triângulo invertido.',
    psicologia: 'Representa o momento de parar de lutar e se render. É a fase em que a perspectiva antiga precisa ser invertida. O sacrifício do ego menor para o despertar do self maior. Aceitação paradoxal.',
    vida_real: 'Surge quando você está preso em uma situação sem solução aparente. Quando lutar só piora as coisas. Momentos de espera forçada, doença, crises existenciais. Quando você precisa ver tudo de um ângulo diferente.',
    mensagem: 'Às vezes, parar é a ação mais poderosa. Nem tudo pode ser resolvido pela força. Mudanças de perspectiva vêm da suspensão do conhecido. O que parece sacrifício pode ser libertação.'
  },
  {
    numero: 'XIII', nome: 'A MORTE', arquetipo: 'A Transformação Inevitável',
    significado: 'A Morte não é o fim, mas a transformação profunda. Representa o que precisa morrer para que o novo nasça.',
    simbolos: 'Um esqueleto cavaleiro com uma bandeira branca (pureza) e uma rosa (vida após a morte). O sol nascente entre os pilares ao fundo. Pessoas de todas as classes sociais caem — a morte não discrimina. O rio simboliza o fluxo da vida.',
    psicologia: 'Representa o fim de identidades, crenças ou padrões que não servem mais. É a morte psicológica necessária para o renascimento. O luto pelo que foi, abrindo espaço para o que virá.',
    vida_real: 'Aparece em finais definitivos — término de relacionamentos, perda de empregos, mudanças de identidade. Quando uma fase da vida termina completamente. Momentos de transformação radical.',
    mensagem: 'Fim não é fracasso. Algumas coisas precisam morrer para que você possa crescer. Solte o que já não serve. A transformação pode ser dolorosa, mas é necessária. Confie no ciclo.'
  },
  {
    numero: 'XIV', nome: 'A TEMPERANÇA', arquetipo: 'A Alquimia da Alma',
    significado: 'A Temperança representa equilíbrio, paciência e a integração harmoniosa de opostos. É o processo de refinamento.',
    simbolos: 'Um anjo com um pé na água e outro na terra, misturando líquidos entre duas taças. O triângulo no peito representa fogo, a coroa quadrada representa terra. Íris (mensageira) no fundo — a comunicação entre mundos.',
    psicologia: 'Após a morte (transformação), vem a temperança (integração). É o processo de equilibrar extremos, de encontrar o meio-termo. Representa a alquimia interior — transformar chumbo em ouro.',
    vida_real: 'Surge em períodos de cura após crises. Quando você precisa de paciência para integrar mudanças. Momentos de buscar equilíbrio entre trabalho e vida, razão e emoção, material e espiritual.',
    mensagem: 'Paciência é a virtude do sábio. A verdadeira mudança é gradual. Equilibre seus opostos internos. A cura acontece gota a gota. Confie no processo de refinamento.'
  },
  {
    numero: 'XV', nome: 'O DIABO', arquetipo: 'A Sombra e o Aprisionamento',
    significado: 'O Diabo representa nossas prisões autoimposas, vícios, medos e a sombra que negamos. É o que nos mantém acorrentados.',
    simbolos: 'Uma figura demoníaca com casal acorrentado — mas as correntes são frouxas (podem sair quando quiserem). Chifres e asas representam a natureza animal. O pentagrama invertido simboliza priorização do material sobre o espiritual.',
    psicologia: 'É o confronto com a sombra junguiana — os aspectos que negamos em nós mesmos. Representa compulsões, vícios, relacionamentos tóxicos. O que mais tememos reconhecer em nós.',
    vida_real: 'Aparece em vícios, padrões destrutivos, relacionamentos codependentes. Quando você se sente preso mas é, em parte, cúmplice de sua prisão. Momentos de enfrentar a sombra.',
    mensagem: 'Você tem mais liberdade do que pensa. Suas correntes são, em grande parte, autoimposas. Enfrente sua sombra — o que você nega, controla você. Vícios são sintomas, não causas. Liberte-se.'
  },
  {
    numero: 'XVI', nome: 'A TORRE', arquetipo: 'A Destruição Necessária',
    significado: 'A Torre representa o colapso de estruturas falsas, revelações súbitas e a destruição que precede a reconstrução.',
    simbolos: 'Uma torre sendo destruída por um raio, figuras caindo. A coroa no topo cai — ilusões de controle. O raio vem do céu — é uma intervenção do divino/destino. As 22 chamas representam os 22 arcanos — a jornada completa.',
    psicologia: 'Representa o colapso do ego inflado, a destruição de ilusões. É o momento em que estruturas mentais falsas são demolidas. Pode ser traumático, mas é libertador.',
    vida_real: 'Surge em crises súbitas, revelações chocantes, perdas inesperadas. Quando tudo que você construiu sobre fundações falsas desmorona. Momentos de colapso que forçam reconstrução.',
    mensagem: 'Às vezes, o universo destrói o que você construiu porque estava sobre fundações falsas. Não é punição — é libertação. O que é verdadeiro sobrevive. Reconstrua sobre a verdade.'
  },
  {
    numero: 'XVII', nome: 'A ESTRELA', arquetipo: 'A Esperança Renovada',
    significado: 'A Estrela representa esperança, inspiração e renovação após a crise. É a cura e a conexão com algo maior.',
    simbolos: 'Uma mulher nua despejando água em um rio e na terra. Oito estrelas (uma grande, sete menores) — luz eterna. O pássaro representa pensamentos elevados. A nudez simboliza vulnerabilidade autêntica e pureza.',
    psicologia: 'Após a destruição da Torre, vem a esperança da Estrela. É o momento de cura, de reconexão com o self autêntico. Representa inspiração e fé renovadas.',
    vida_real: 'Aparece em períodos de recuperação após crises. Quando você sente esperança novamente. Momentos de inspiração, de sentir-se guiado. Quando a cura verdadeira começa.',
    mensagem: 'Sempre há esperança. Após a escuridão, vem a luz. Você está sendo guiado. Cure-se. Conecte-se com algo maior que você. O universo conspira a seu favor.'
  },
  {
    numero: 'XVIII', nome: 'A LUA', arquetipo: 'A Jornada pelo Inconsciente',
    significado: 'A Lua representa ilusão, medo, o inconsciente profundo e a jornada através da escuridão psíquica.',
    simbolos: 'Dois cães/lobos uivando para a lua, um caminho entre duas torres levando ao desconhecido. Um lagostim emerge da água (inconsciente). A lua goteja — nutrição do psíquico. O caminho é incerto.',
    psicologia: 'Representa a descida ao inconsciente profundo. Medos, ilusões, memórias reprimidas. É a noite escura da alma. O território entre o conhecido e o desconhecido.',
    vida_real: 'Surge em períodos de confusão, ansiedade, quando você não confia em suas percepções. Pesadelos, medos irracionais. Quando tudo parece incerto e ameaçador. A travessia necessária.',
    mensagem: 'Nem tudo é o que parece. Seus medos podem ser ilusões. Atravesse a noite com coragem — há sabedoria na escuridão. O que você teme pode ser um guia. Continue caminhando.'
  },
  {
    numero: 'XIX', nome: 'O SOL', arquetipo: 'A Iluminação e a Alegria',
    significado: 'O Sol representa clareza, vitalidade, sucesso e a alegria simples de existir. É a luz após a escuridão.',
    simbolos: 'Um sol radiante, uma criança nua em um cavalo branco (inocência recuperada). Girassóis (voltados para a luz). A bandeira vermelha representa vitalidade. Tudo está claro e iluminado.',
    psicologia: 'Após atravessar a Lua, você emerge no Sol — consciência clara, ego saudável, alegria autêntica. Representa o self integrado brilhando.',
    vida_real: 'Aparece em momentos de sucesso, clareza, alegria. Quando tudo faz sentido. Quando você se sente vivo, vital, autêntico. Momentos de celebração merecida.',
    mensagem: 'Você merece celebrar. A vida pode ser simples e alegre. Você atravessou a escuridão e emergiu mais forte. Brilhe. Compartilhe sua luz. A clareza chegou.'
  },
  {
    numero: 'XX', nome: 'O JULGAMENTO', arquetipo: 'O Despertar e o Chamado',
    significado: 'O Julgamento representa o despertar final, a avaliação honesta de si mesmo e o chamado para um propósito maior.',
    simbolos: 'Um anjo (Gabriel) tocando trombeta, pessoas surgindo de caixões com braços abertos. Montanhas ao fundo. Cruz na bandeira (morte e ressurreição). É o chamado final para despertar.',
    psicologia: 'Representa a integração de todas as experiências da jornada. É o momento de avaliar honestamente quem você se tornou. O chamado para viver seu propósito autêntico.',
    vida_real: 'Surge em momentos de grande clareza sobre seu propósito. Quando você ouve um "chamado" inegável. Momentos de renascimento, de deixar o passado morto e abraçar nova vida.',
    mensagem: 'É hora de despertar completamente. Avalie sua jornada com honestidade. Perdoe-se. Responda ao chamado de sua alma. Você renasceu. Viva de acordo com sua verdade.'
  },
  {
    numero: 'XXI', nome: 'O MUNDO', arquetipo: 'A Completude e a Realização',
    significado: 'O Mundo representa a completude, a integração total e a realização. É o fim de um ciclo e o início de outro em um nível superior.',
    simbolos: 'Uma figura dançante, nua (autêntica), em uma grinalda de louros (vitória). Os quatro evangelhos nos cantos (integração total dos elementos). As fitas formam um infinito. Tudo está completo.',
    psicologia: 'É a individuação completa no sentido junguiano. O self integrado dançando. Todas as partes reconciliadas. A jornada completa — mas não o fim definitivo.',
    vida_real: 'Aparece em momentos de conclusão significativa. Quando um ciclo grande se fecha. Quando você alcança uma meta importante. A sensação de "cheguei" — mas sabendo que novos ciclos virão.',
    mensagem: 'Você completou a jornada. Celebre sua realização. Mas lembre-se: o fim é sempre um novo começo. O Mundo leva de volta ao Louco. A dança continua eternamente.'
  },
];

// ============================================================
// HELPERS DE DESENHO
// ============================================================

function setColor(doc: jsPDF, color: readonly [number, number, number], type: 'fill' | 'text' | 'draw' = 'fill') {
  if (type === 'fill') doc.setFillColor(color[0], color[1], color[2]);
  else if (type === 'text') doc.setTextColor(color[0], color[1], color[2]);
  else doc.setDrawColor(color[0], color[1], color[2]);
}

function drawGradientBackground(doc: jsPDF) {
  const steps = 20;
  const stepH = PAGE_HEIGHT / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.round(C.BG_DARK[0] + (C.ROXO_ESCURO[0] - C.BG_DARK[0]) * t * 0.6);
    const g = Math.round(C.BG_DARK[1] + (C.ROXO_ESCURO[1] - C.BG_DARK[1]) * t * 0.6);
    const b = Math.round(C.BG_DARK[2] + (C.ROXO_ESCURO[2] - C.BG_DARK[2]) * t * 0.6);
    doc.setFillColor(r, g, b);
    doc.rect(0, i * stepH, PAGE_WIDTH, stepH + 0.5, 'F');
  }
}

function drawDecorativeBorder(doc: jsPDF) {
  setColor(doc, C.ROXO_MEDIO, 'draw');
  doc.setLineWidth(0.3);
  doc.rect(14, 14, PAGE_WIDTH - 28, PAGE_HEIGHT - 28);

  // Ornamentos nos cantos
  const m = 14;
  const cs = 12;
  setColor(doc, C.DOURADO, 'draw');
  doc.setLineWidth(0.5);

  // Superior esquerdo
  doc.line(m, m + cs, m, m); doc.line(m, m, m + cs, m);
  // Superior direito
  doc.line(PAGE_WIDTH - m - cs, m, PAGE_WIDTH - m, m); doc.line(PAGE_WIDTH - m, m, PAGE_WIDTH - m, m + cs);
  // Inferior esquerdo
  doc.line(m, PAGE_HEIGHT - m - cs, m, PAGE_HEIGHT - m); doc.line(m, PAGE_HEIGHT - m, m + cs, PAGE_HEIGHT - m);
  // Inferior direito
  doc.line(PAGE_WIDTH - m - cs, PAGE_HEIGHT - m, PAGE_WIDTH - m, PAGE_HEIGHT - m);
  doc.line(PAGE_WIDTH - m, PAGE_HEIGHT - m - cs, PAGE_WIDTH - m, PAGE_HEIGHT - m);
}

function drawPageHeader(doc: jsPDF) {
  // Zaya Tarot branding
  doc.setFontSize(7);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('helvetica', 'bold');
  doc.text('ZAYA TAROT', MARGIN, 20);

  doc.setFont('helvetica', 'normal');
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.text('Arquivo Arcano  |  Jornada do Herói', PAGE_WIDTH - MARGIN, 20, { align: 'right' });

  // Linha dourada decorativa
  setColor(doc, C.DOURADO, 'draw');
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 23, PAGE_WIDTH - MARGIN, 23);

  // Linha fina abaixo
  setColor(doc, C.ROXO_MEDIO, 'draw');
  doc.setLineWidth(0.15);
  doc.line(MARGIN, 24, PAGE_WIDTH - MARGIN, 24);
}

function drawPageFooter(doc: jsPDF, pageNum: number) {
  const y = PAGE_HEIGHT - 18;

  // Linha decorativa
  setColor(doc, C.ROXO_MEDIO, 'draw');
  doc.setLineWidth(0.15);
  doc.line(MARGIN + 30, y, PAGE_WIDTH - MARGIN - 30, y);

  // Número da página
  doc.setFontSize(8);
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.setFont('helvetica', 'normal');
  doc.text(`${pageNum}`, PAGE_WIDTH / 2, y + 5, { align: 'center' });

  // URL
  doc.setFontSize(6);
  setColor(doc, C.ROXO_MEDIO, 'text');
  doc.text('zayatarot.com', PAGE_WIDTH / 2, y + 9, { align: 'center' });
}

function drawSectionDivider(doc: jsPDF, y: number): number {
  setColor(doc, C.DOURADO, 'draw');
  doc.setLineWidth(0.2);
  const cx = PAGE_WIDTH / 2;
  doc.line(cx - 30, y, cx - 5, y);
  doc.line(cx + 5, y, cx + 30, y);

  // Pequeno diamante central
  setColor(doc, C.DOURADO, 'fill');
  const s = 1.5;
  doc.triangle(cx, y - s, cx + s, y, cx, y + s, 'F');
  doc.triangle(cx, y - s, cx - s, y, cx, y + s, 'F');

  return y + 6;
}

function drawStarDecoration(doc: jsPDF, x: number, y: number, size: number) {
  setColor(doc, C.DOURADO, 'fill');
  doc.circle(x, y, size, 'F');
  // Raios
  setColor(doc, C.DOURADO, 'draw');
  doc.setLineWidth(0.2);
  for (let a = 0; a < 360; a += 45) {
    const rad = (a * Math.PI) / 180;
    doc.line(
      x + Math.cos(rad) * (size + 0.5),
      y + Math.sin(rad) * (size + 0.5),
      x + Math.cos(rad) * (size + 2.5),
      y + Math.sin(rad) * (size + 2.5)
    );
  }
}

// Escreve texto quebrado e retorna nova posição Y
function writeText(
  doc: jsPDF, text: string, x: number, y: number,
  maxWidth: number, lineH: number, maxY: number
): { y: number; overflow: boolean; remaining: string } {
  const lines = doc.splitTextToSize(text, maxWidth);
  let currentY = y;
  let i = 0;

  for (; i < lines.length; i++) {
    if (currentY > maxY) {
      // Reconstruir texto restante
      const remaining = lines.slice(i).join(' ');
      return { y: currentY, overflow: true, remaining };
    }
    doc.text(lines[i], x, currentY);
    currentY += lineH;
  }

  return { y: currentY, overflow: false, remaining: '' };
}

// ============================================================
// CARREGAMENTO DE IMAGENS
// ============================================================

async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => reject(new Error('Timeout')), 20000);

    img.onload = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } else {
        reject(new Error('Canvas context error'));
      }
    };
    img.onerror = () => { clearTimeout(timeout); reject(new Error('Image load error')); };

    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=480&fit=cover&output=jpg`;
    img.src = proxyUrl;
  });
}

// Cria mockup de deck de cartas com brilho roxo para a capa
async function createCardDeckMockup(cardImages: Map<string, string>): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d')!;

  // Fundo transparente
  ctx.clearRect(0, 0, 800, 500);

  // Brilho roxo ao fundo (radial gradient)
  const glow = ctx.createRadialGradient(400, 280, 30, 400, 280, 320);
  glow.addColorStop(0, 'rgba(147, 17, 212, 0.55)');
  glow.addColorStop(0.3, 'rgba(147, 17, 212, 0.3)');
  glow.addColorStop(0.6, 'rgba(91, 58, 143, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 800, 500);

  // Segundo layer de brilho (mais concentrado, dourado)
  const glow2 = ctx.createRadialGradient(400, 300, 10, 400, 300, 180);
  glow2.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
  glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, 800, 500);

  // Desenhar 5 cartas em leque
  const cardNames = ['O MAGO', 'A SACERDOTISA', 'A IMPERATRIZ', 'O LOUCO', 'O IMPERADOR'];
  const angles = [-18, -9, 0, 9, 18];
  const cardW = 110;
  const cardH = 176;
  const centerX = 400;
  const centerY = 320;

  for (let i = 0; i < cardNames.length; i++) {
    const imgData = cardImages.get(cardNames[i]);
    if (!imgData) continue;

    const img = new (window.Image || Image)();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = imgData;
    });
    if (!img.width) continue;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((angles[i] * Math.PI) / 180);

    // Sombra roxa
    ctx.shadowColor = 'rgba(147, 17, 212, 0.7)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // Borda dourada da carta
    const bw = 3;
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2 - bw, -cardH / 2 - bw, cardW + bw * 2, cardH + bw * 2, 6);
    ctx.fill();

    // Imagem da carta
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 4);
    ctx.clip();
    ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);

    ctx.restore();
  }

  return canvas.toDataURL('image/png', 0.95);
}

// ============================================================
// PÁGINAS DO EBOOK
// ============================================================

function drawCoverPage(doc: jsPDF, mockupImage: string | null) {
  // Fundo escuro premium
  const steps = 30;
  const stepH = PAGE_HEIGHT / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    // Gradiente de cima para baixo: roxo escuro → preto
    const r = Math.round(35 - t * 15);
    const g = Math.round(20 - t * 10);
    const b = Math.round(60 - t * 30);
    doc.setFillColor(Math.max(r, 10), Math.max(g, 5), Math.max(b, 15));
    doc.rect(0, i * stepH, PAGE_WIDTH, stepH + 0.5, 'F');
  }

  drawDecorativeBorder(doc);

  // Estrelas decorativas
  const starPositions = [
    [30, 25], [180, 30], [50, 270], [160, 275],
    [25, 150], [185, 145], [105, 18], [105, 280],
  ];
  for (const [x, y] of starPositions) {
    drawStarDecoration(doc, x, y, 0.6);
  }

  // Citação Zaya no topo
  doc.setFontSize(8);
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.setFont('helvetica', 'normal');
  doc.text('Um ebook exclusivo por', PAGE_WIDTH / 2, 38, { align: 'center' });

  // Logo / Nome
  doc.setFontSize(20);
  setColor(doc, C.WHITE, 'text');
  doc.setFont('helvetica', 'bold');
  doc.text('ZAYA TAROT', PAGE_WIDTH / 2, 50, { align: 'center' });

  // Linha decorativa
  setColor(doc, C.DOURADO, 'draw');
  doc.setLineWidth(0.8);
  doc.line(60, 56, PAGE_WIDTH - 60, 56);
  doc.setLineWidth(0.3);
  doc.line(70, 58, PAGE_WIDTH - 70, 58);

  // Título principal
  doc.setFontSize(38);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('times', 'bold');
  doc.text('JORNADA', PAGE_WIDTH / 2, 78, { align: 'center' });
  doc.text('DO HERÓI', PAGE_WIDTH / 2, 92, { align: 'center' });

  // Subtítulo
  doc.setFontSize(14);
  setColor(doc, C.DOURADO_CLARO, 'text');
  doc.setFont('times', 'normal');
  doc.text('Os 22 Arcanos Maiores do Tarot', PAGE_WIDTH / 2, 104, { align: 'center' });

  // Mockup de cartas
  if (mockupImage) {
    try {
      doc.addImage(mockupImage, 'PNG', 15, 110, 180, 112);
    } catch (e) {
      console.warn('Failed to add mockup image');
    }
  }

  // Descrição
  doc.setFontSize(11);
  setColor(doc, C.TEXTO, 'text');
  doc.setFont('times', 'italic');
  doc.text('Uma jornada de autoconhecimento através', PAGE_WIDTH / 2, 235, { align: 'center' });
  doc.text('dos arquétipos ancestrais do Tarot', PAGE_WIDTH / 2, 243, { align: 'center' });

  // Linha divisória inferior
  setColor(doc, C.DOURADO, 'draw');
  doc.setLineWidth(0.3);
  doc.line(50, 252, PAGE_WIDTH - 50, 252);

  // Info Arquivo Arcano
  doc.setFontSize(10);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('helvetica', 'bold');
  doc.text('ARQUIVO ARCANO', PAGE_WIDTH / 2, 262, { align: 'center' });

  doc.setFontSize(8);
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.setFont('helvetica', 'normal');
  doc.text('Material exclusivo para desenvolvimento pessoal e espiritual', PAGE_WIDTH / 2, 269, { align: 'center' });

  // Footer
  doc.setFontSize(7);
  setColor(doc, C.ROXO_MEDIO, 'text');
  doc.text('zayatarot.com', PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: 'center' });
}

function drawIntroductionPages(doc: jsPDF): number {
  // Página de introdução
  doc.addPage();
  drawGradientBackground(doc);
  drawDecorativeBorder(doc);
  drawPageHeader(doc);
  drawPageFooter(doc, 2);

  let y = 38;

  // Título
  doc.setFontSize(24);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('times', 'bold');
  doc.text('A JORNADA DO HERÓI NO TAROT', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  y = drawSectionDivider(doc, y);
  y += 4;

  // Parágrafos de introdução
  const introTexts = [
    'Os 22 Arcanos Maiores do Tarot são muito mais do que simples cartas de adivinhação. Eles representam uma jornada completa de desenvolvimento humano — desde o Louco, que dá o primeiro passo no desconhecido, até o Mundo, que dança na completude da realização.',
    'Esta é a Jornada do Herói, o mito universal descrito por Joseph Campbell, mas codificado nos símbolos ancestrais do Tarot. Cada arcano representa um estágio arquetípico — desafios, realizações, provações e revelações que todos nós enfrentamos em nossa evolução pessoal e espiritual.',
    'Neste ebook, você descobrirá como cada uma das 22 cartas reflete aspectos profundos de sua própria jornada. Não importa onde você esteja agora — em algum ponto, você já viveu ou viverá cada um desses arquétipos. O Tarot é um mapa da consciência humana.',
    'Prepare-se para uma jornada de autoconhecimento. Cada arcano oferece não apenas conhecimento simbólico, mas insights práticos sobre como esses arquétipos aparecem em sua vida cotidiana — e como você pode trabalhar conscientemente com eles.',
  ];

  doc.setFontSize(10.5);
  setColor(doc, C.TEXTO, 'text');
  doc.setFont('times', 'normal');

  for (const text of introTexts) {
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 10);
    for (const line of lines) {
      doc.text(line, MARGIN + 5, y);
      y += 5.5;
    }
    y += 4;
  }

  y += 4;
  y = drawSectionDivider(doc, y);
  y += 6;

  // Citação Jung
  doc.setFontSize(12);
  setColor(doc, C.DOURADO_CLARO, 'text');
  doc.setFont('times', 'italic');
  doc.text('"O privilégio de uma vida é', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 7;
  doc.text('tornar-se quem você realmente é."', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.setFont('times', 'normal');
  doc.text('— Carl Gustav Jung', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  y = drawSectionDivider(doc, y);
  y += 8;

  // Sumário visual
  doc.setFontSize(16);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('times', 'bold');
  doc.text('Os 22 Portais da Consciência', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(8.5);
  doc.setFont('times', 'normal');
  setColor(doc, C.TEXTO, 'text');

  // Lista os arcanos em duas colunas
  const col1X = MARGIN + 10;
  const col2X = PAGE_WIDTH / 2 + 5;
  let colY = y;

  for (let i = 0; i < ARCANOS.length; i++) {
    const a = ARCANOS[i];
    const x = i < 11 ? col1X : col2X;
    const rowY = i < 11 ? colY + i * 6.5 : colY + (i - 11) * 6.5;

    setColor(doc, C.DOURADO, 'text');
    doc.setFont('times', 'bold');
    doc.text(`${a.numero}`, x, rowY);

    setColor(doc, C.TEXTO, 'text');
    doc.setFont('times', 'normal');
    doc.text(`${a.nome}  —  ${a.arquetipo}`, x + 12, rowY);
  }

  return 3; // próximo número de página
}

function drawArcanoPage(
  doc: jsPDF,
  arcano: typeof ARCANOS[0],
  cardImage: string | null,
  pageNum: number
): number {
  doc.addPage();
  drawGradientBackground(doc);
  drawDecorativeBorder(doc);
  drawPageHeader(doc);
  drawPageFooter(doc, pageNum);

  const maxY = PAGE_HEIGHT - 28;
  let y = 32;

  // Número do arcano (grande, decorativo)
  doc.setFontSize(50);
  doc.setFont('times', 'bold');
  setColor(doc, C.ROXO_MEDIO, 'text');
  doc.text(arcano.numero, PAGE_WIDTH - MARGIN - 5, 48, { align: 'right' });

  // Nome do arcano
  doc.setFontSize(26);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('times', 'bold');
  doc.text(arcano.nome, MARGIN + 2, y + 6);
  y += 12;

  // Arquétipo
  doc.setFontSize(12);
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.setFont('times', 'italic');
  doc.text(arcano.arquetipo, MARGIN + 2, y);
  y += 5;

  // Linha dourada
  setColor(doc, C.DOURADO, 'draw');
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;

  // Layout com imagem à esquerda e texto à direita (se tem imagem)
  const hasImage = !!cardImage;
  const imgW = 38;
  const imgH = 60;
  const textStartX = hasImage ? MARGIN + imgW + 8 : MARGIN;
  const textWidth = hasImage ? CONTENT_WIDTH - imgW - 8 : CONTENT_WIDTH;

  if (hasImage && cardImage) {
    try {
      // Borda dourada ao redor da imagem
      setColor(doc, C.DOURADO, 'draw');
      doc.setLineWidth(0.5);
      doc.rect(MARGIN - 0.5, y - 0.5, imgW + 1, imgH + 1);

      // Sombra simulada
      doc.setFillColor(C.PRIMARY[0], C.PRIMARY[1], C.PRIMARY[2]);
      doc.rect(MARGIN + 1, y + 1, imgW, imgH, 'F');
      doc.setGState(doc.GState({ opacity: 0.3 }));
      doc.rect(MARGIN + 1.5, y + 1.5, imgW, imgH, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));

      doc.addImage(cardImage, 'JPEG', MARGIN, y, imgW, imgH);

      // Label abaixo da imagem
      doc.setFontSize(7);
      setColor(doc, C.ROXO_CLARO, 'text');
      doc.setFont('helvetica', 'italic');
      doc.text('Rider-Waite-Smith', MARGIN + imgW / 2, y + imgH + 4, { align: 'center' });
    } catch (e) {
      console.warn('Failed to add card image');
    }
  }

  // Seções de conteúdo
  const sections = [
    { icon: '\u2726', title: 'Significado Essencial', text: arcano.significado },
    { icon: '\u2726', title: 'Simbologia da Carta', text: arcano.simbolos },
    { icon: '\u2726', title: 'Contexto Psicológico e Espiritual', text: arcano.psicologia },
    { icon: '\u2726', title: 'Como Aparece na Vida Real', text: arcano.vida_real },
    { icon: '\u2726', title: 'Mensagem de Evolução', text: arcano.mensagem },
  ];

  let sectionIdx = 0;
  let currentTextX = textStartX;
  let currentTextWidth = textWidth;
  const imgBottomY = hasImage ? y + imgH + 8 : 0;
  let isFirstPage = true;

  for (; sectionIdx < sections.length; sectionIdx++) {
    const section = sections[sectionIdx];

    // Após a imagem, voltar para largura completa
    if (hasImage && y >= imgBottomY && isFirstPage) {
      currentTextX = MARGIN;
      currentTextWidth = CONTENT_WIDTH;
    }

    // Verificar se precisa de nova página
    if (y + 15 > maxY) {
      // Nova página
      pageNum++;
      doc.addPage();
      drawGradientBackground(doc);
      drawDecorativeBorder(doc);
      drawPageHeader(doc);
      drawPageFooter(doc, pageNum);
      y = 32;
      currentTextX = MARGIN;
      currentTextWidth = CONTENT_WIDTH;
      isFirstPage = false;

      // Subtítulo de continuação
      doc.setFontSize(10);
      setColor(doc, C.ROXO_CLARO, 'text');
      doc.setFont('times', 'italic');
      doc.text(`${arcano.nome} (continuação)`, PAGE_WIDTH / 2, y, { align: 'center' });
      y += 8;
    }

    // Título da seção
    doc.setFontSize(11);
    setColor(doc, C.DOURADO, 'text');
    doc.setFont('helvetica', 'bold');
    doc.text(`${section.icon}  ${section.title}`, currentTextX, y);
    y += 5;

    // Texto da seção
    doc.setFontSize(9.5);
    setColor(doc, C.TEXTO, 'text');
    doc.setFont('times', 'normal');

    const result = writeText(doc, section.text, currentTextX, y, currentTextWidth, 4.5, maxY);
    y = result.y;

    if (result.overflow && result.remaining) {
      // Continuar na próxima página
      pageNum++;
      doc.addPage();
      drawGradientBackground(doc);
      drawDecorativeBorder(doc);
      drawPageHeader(doc);
      drawPageFooter(doc, pageNum);
      y = 32;
      currentTextX = MARGIN;
      currentTextWidth = CONTENT_WIDTH;
      isFirstPage = false;

      doc.setFontSize(9.5);
      setColor(doc, C.TEXTO, 'text');
      doc.setFont('times', 'normal');
      const cont = writeText(doc, result.remaining, currentTextX, y, currentTextWidth, 4.5, maxY);
      y = cont.y;
    }

    y += 3;

    // Após imagem, voltar para largura completa
    if (hasImage && y >= imgBottomY) {
      currentTextX = MARGIN;
      currentTextWidth = CONTENT_WIDTH;
    }
  }

  // Mensagem destacada no final (caixa decorativa)
  if (y + 25 < maxY) {
    y += 2;
    // Caixa com fundo sutil
    const boxH = 18;
    doc.setFillColor(C.SURFACE[0], C.SURFACE[1], C.SURFACE[2]);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxH, 2, 2, 'F');
    setColor(doc, C.DOURADO, 'draw');
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxH, 2, 2, 'S');

    doc.setFontSize(8);
    setColor(doc, C.DOURADO, 'text');
    doc.setFont('helvetica', 'bold');
    doc.text('CITAÇÃO ZAYA TAROT', MARGIN + 4, y + 5);

    doc.setFontSize(8.5);
    setColor(doc, C.DOURADO_CLARO, 'text');
    doc.setFont('times', 'italic');
    const quoteLines = doc.splitTextToSize(
      `"${arcano.mensagem.substring(0, 120)}${arcano.mensagem.length > 120 ? '...' : ''}"`,
      CONTENT_WIDTH - 8
    );
    doc.text(quoteLines, MARGIN + 4, y + 10);
  }

  return pageNum;
}

function drawConclusionPages(doc: jsPDF, pageNum: number): number {
  doc.addPage();
  pageNum++;
  drawGradientBackground(doc);
  drawDecorativeBorder(doc);
  drawPageHeader(doc);
  drawPageFooter(doc, pageNum);

  let y = 40;

  // Título
  doc.setFontSize(24);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('times', 'bold');
  doc.text('O MUNDO — E ALÉM', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  y = drawSectionDivider(doc, y);
  y += 6;

  const conclusionTexts = [
    'Você chegou ao fim da jornada — ou seria ao começo? O Mundo, o último arcano, representa completude, mas não conclusão definitiva. A figura dança na carta, celebrando a integração de todas as experiências, mas a dança nunca para.',
    'A jornada pelos 22 Arcanos Maiores é cíclica. Quando você chega ao Mundo, está pronto para começar novamente como o Louco — mas em um nível superior de consciência. Cada ciclo traz mais sabedoria, mais integração, mais plenitude.',
    'Os arquétipos do Tarot não são apenas símbolos antigos — são mapas vivos de sua própria psique. Você pode não estar consciente, mas provavelmente já viveu cada uma dessas 22 etapas em algum momento de sua vida. E continuará vivendo-as, em espirais cada vez mais profundas de compreensão.',
    'A pergunta não é "em qual arcano você está?" — porque você pode estar em vários ao mesmo tempo, em diferentes áreas da vida. A pergunta é: "Você está consciente da jornada?" Porque a consciência transforma a experiência de vítima das circunstâncias em herói da própria história.',
  ];

  doc.setFontSize(10.5);
  setColor(doc, C.TEXTO, 'text');
  doc.setFont('times', 'normal');

  for (const text of conclusionTexts) {
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 10);
    for (const line of lines) {
      doc.text(line, MARGIN + 5, y);
      y += 5.5;
    }
    y += 4;
  }

  y += 4;

  // Reflexão final
  doc.setFontSize(11);
  setColor(doc, C.DOURADO, 'text');
  doc.setFont('helvetica', 'bold');
  doc.text('Reflexão Final', MARGIN + 5, y);
  y += 6;

  doc.setFontSize(10);
  setColor(doc, C.TEXTO, 'text');
  doc.setFont('times', 'normal');
  const reflexao = 'Olhe para sua vida agora. Quais arcanos você reconhece? Onde está o chamado do Louco? Onde você precisa da força compassiva da carta VIII? Onde você está enfrentando sua Torre? E onde, talvez, você já dança como o Mundo?';
  const refLines = doc.splitTextToSize(reflexao, CONTENT_WIDTH - 10);
  for (const line of refLines) {
    doc.text(line, MARGIN + 5, y);
    y += 5.5;
  }
  y += 8;

  y = drawSectionDivider(doc, y);
  y += 8;

  // Citação final
  doc.setFontSize(12);
  setColor(doc, C.DOURADO_CLARO, 'text');
  doc.setFont('times', 'italic');
  doc.text('"A jornada nunca termina —', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 7;
  doc.text('ela apenas se transforma. Continue dançando."', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 12;

  // Assinatura Zaya Tarot
  drawStarDecoration(doc, PAGE_WIDTH / 2 - 20, y, 0.8);
  drawStarDecoration(doc, PAGE_WIDTH / 2, y, 0.8);
  drawStarDecoration(doc, PAGE_WIDTH / 2 + 20, y, 0.8);
  y += 10;

  doc.setFontSize(9);
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.setFont('times', 'italic');
  doc.text('Que esta jornada pelos 22 Arcanos Maiores ilumine seu caminho.', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  // Branding final
  doc.setFontSize(14);
  setColor(doc, C.WHITE, 'text');
  doc.setFont('helvetica', 'bold');
  doc.text('ZAYA TAROT', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(8);
  setColor(doc, C.ROXO_CLARO, 'text');
  doc.setFont('helvetica', 'normal');
  doc.text('Arquivo Arcano  |  zayatarot.com', PAGE_WIDTH / 2, y, { align: 'center' });

  return pageNum;
}

// ============================================================
// EXPORT: GERAÇÃO PRINCIPAL
// ============================================================

export type EbookProgressCallback = (current: number, total: number, message: string) => void;

export async function generateEbookPdf(onProgress: EbookProgressCallback): Promise<Blob> {
  const totalSteps = 22 + 5; // 22 imagens + 5 etapas de geração
  let step = 0;

  // 1. Carregar todas as imagens das cartas
  const cardImages = new Map<string, string>();

  for (const [name, url] of Object.entries(CARD_IMAGES)) {
    step++;
    onProgress(step, totalSteps, `Carregando: ${name}...`);
    try {
      const base64 = await loadImageAsBase64(url);
      cardImages.set(name, base64);
    } catch (e) {
      console.warn(`Falha ao carregar imagem: ${name}`, e);
    }
    // Pequeno delay para não sobrecarregar
    await new Promise(r => setTimeout(r, 100));
  }

  // 2. Criar mockup do deck para a capa
  step++;
  onProgress(step, totalSteps, 'Criando mockup do deck de cartas...');
  let mockupImage: string | null = null;
  try {
    mockupImage = await createCardDeckMockup(cardImages);
  } catch (e) {
    console.warn('Falha ao criar mockup:', e);
  }

  // 3. Inicializar PDF
  step++;
  onProgress(step, totalSteps, 'Gerando PDF...');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Metadata
  doc.setProperties({
    title: 'Jornada do Herói - Os 22 Arcanos Maiores do Tarot',
    subject: 'Ebook sobre os 22 Arcanos Maiores do Tarot',
    author: 'Zaya Tarot - Arquivo Arcano',
    creator: 'Zaya Tarot',
    keywords: 'tarot, arcanos maiores, jornada do herói, autoconhecimento',
  });

  // 4. Gerar capa
  drawCoverPage(doc, mockupImage);

  // 5. Gerar introdução
  step++;
  onProgress(step, totalSteps, 'Gerando introdução...');
  let pageNum = drawIntroductionPages(doc);

  // 6. Gerar páginas dos arcanos
  step++;
  onProgress(step, totalSteps, 'Gerando páginas dos arcanos...');

  for (let i = 0; i < ARCANOS.length; i++) {
    const arcano = ARCANOS[i];
    const cardImg = cardImages.get(arcano.nome) || null;
    pageNum++;
    pageNum = drawArcanoPage(doc, arcano, cardImg, pageNum);
  }

  // 7. Gerar conclusão
  pageNum = drawConclusionPages(doc, pageNum);

  onProgress(totalSteps, totalSteps, 'Ebook gerado com sucesso!');

  return doc.output('blob');
}

export function getEbookInfo() {
  return {
    title: 'Jornada do Herói — Os 22 Arcanos Maiores',
    description: 'Um ebook premium com os 22 Arcanos Maiores do Tarot, incluindo significados, simbologia, psicologia junguiana e mensagens de evolução.',
    pages: '~30 páginas',
    features: [
      'Capa com mockup de deck de cartas e brilho roxo',
      'Introdução à Jornada do Herói',
      '22 páginas dedicadas aos Arcanos Maiores',
      'Imagens Rider-Waite-Smith em cada página',
      'Simbologia, psicologia e aplicação prática',
      'Conclusão e reflexão final',
      'Design premium com identidade Zaya Tarot',
      'Headers e citações ao Zaya Tarot',
    ],
    fileName: `zaya-tarot-jornada-do-heroi-${new Date().toISOString().split('T')[0]}.pdf`,
  };
}
