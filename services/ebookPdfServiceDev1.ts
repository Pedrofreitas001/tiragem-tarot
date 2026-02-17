/**
 * Servico de geracao do Ebook Premium - Jornada do Heroi (DESENVOLVIMENTO-1)
 * Versao enriquecida com conteudo aprofundado, reflexoes e integracao Zaya Tarot
 * Original preservado em ebookPdfService.ts
 */
import jsPDF from 'jspdf';

// ============================================================
// CONSTANTES DE LAYOUT
// ============================================================
const PW = 210;
const PH = 297;
const M = 20;
const CW = PW - 2 * M;

const C = {
  BG_TOP:        [18, 6, 36]     as const,
  BG_BOT:        [36, 16, 62]    as const,
  SURFACE:       [26, 19, 32]    as const,
  CARD_BG:       [30, 22, 40]    as const,
  BORDER:        [135, 95, 175]  as const,
  BORDER_GOLD:   [184, 138, 68]  as const,
  GOLD:          [224, 192, 128] as const,
  GOLD_LIGHT:    [255, 254, 187] as const,
  GOLD_DEEP:     [184, 138, 68]  as const,
  ROXO_CLARO:    [167, 127, 212] as const,
  ROXO_MEDIO:    [91, 58, 143]   as const,
  TEXTO:         [220, 215, 230] as const,
  TEXTO_MUTED:   [160, 150, 175] as const,
  WHITE:         [255, 255, 255] as const,
};

const IMG_BASE = 'https://www.sacred-texts.com/tarot/pkt/img';
const CARD_IMAGES: Record<string, string> = {
  'O Louco': `${IMG_BASE}/ar00.jpg`, 'O Mago': `${IMG_BASE}/ar01.jpg`,
  'A Sacerdotisa': `${IMG_BASE}/ar02.jpg`, 'A Imperatriz': `${IMG_BASE}/ar03.jpg`,
  'O Imperador': `${IMG_BASE}/ar04.jpg`, 'O Hierofante': `${IMG_BASE}/ar05.jpg`,
  'Os Amantes': `${IMG_BASE}/ar06.jpg`, 'O Carro': `${IMG_BASE}/ar07.jpg`,
  'A Forca': `${IMG_BASE}/ar08.jpg`, 'O Eremita': `${IMG_BASE}/ar09.jpg`,
  'A Roda da Fortuna': `${IMG_BASE}/ar10.jpg`, 'A Justica': `${IMG_BASE}/ar11.jpg`,
  'O Enforcado': `${IMG_BASE}/ar12.jpg`, 'A Morte': `${IMG_BASE}/ar13.jpg`,
  'A Temperanca': `${IMG_BASE}/ar14.jpg`, 'O Diabo': `${IMG_BASE}/ar15.jpg`,
  'A Torre': `${IMG_BASE}/ar16.jpg`, 'A Estrela': `${IMG_BASE}/ar17.jpg`,
  'A Lua': `${IMG_BASE}/ar18.jpg`, 'O Sol': `${IMG_BASE}/ar19.jpg`,
  'O Julgamento': `${IMG_BASE}/ar20.jpg`, 'O Mundo': `${IMG_BASE}/ar21.jpg`,
};

// ============================================================
// DADOS ENRIQUECIDOS DOS 22 ARCANOS
// ============================================================
const ARCANOS = [
  {
    numero: '0', nome: 'O Louco', arquetipo: 'O Chamado a Aventura',
    essencia: 'O Louco representa o potencial puro — o momento anterior a qualquer escolha definitiva. E a inocencia que precede o aprendizado e o salto de fe que inicia toda grande jornada.',
    simbolos: 'O jovem a beira do precipicio carrega apenas o essencial. O cao ao seu lado representa o instinto que guia sem impedir. A rosa branca em sua mao simboliza a pureza de intencao que acompanha quem ousa comecar sem garantias.',
    psicologia: 'Este arquetipo representa o estado de potencial nao diferenciado — a mente antes do condicionamento social. Psicologicamente, e o convite a abandonar o conhecido e confiar no processo de descoberta que so se revela no movimento.',
    revelacao: 'Este arquetipo se revela quando voce sente um impulso de mudar sem saber exatamente para onde. Aparece nas vesperas de novas fases, em decisoes que parecem arriscadas mas que algo interno aprova com entusiasmo.',
    integracao: 'A mensagem do Louco e: o caminho se forma enquanto voce caminha. Nao e necessario ter todas as respostas antes de comecar — a coragem de dar o primeiro passo ja e o mapa para o que vem a seguir.',
    reflexao: [
      'O que voce tem adiado comecar por nao se sentir completamente pronto?',
      'Em que area da sua vida voce sente o chamado para um novo capitulo?',
      'O que voce faria se soubesse que pode confiar no processo mesmo sem ver o final?',
    ],
    exploracao: 'Em um caderno de anotacoes, escreva algo que voce sempre quis comecar. Nao planeje — apenas descreva a sensacao de ja ter dado esse primeiro passo. Observe o que surge quando voce imagina a si mesmo em movimento.',
    afirmacao: 'Eu confio na jornada que se revela enquanto avanço. O caminho se forma ao caminhar.',
    sinais: 'Oportunidades que surgem de forma inesperada. Encontros casuais que abrem portas. A sensacao persistente de que e agora ou nunca.',
    incorporacao: 'Permita-se comecar algo sem saber o final. Converse com alguem que ja deu um salto parecido. Anote os impulsos que surgem ao longo do dia — eles sao dados da sua intuicao.',
  },
  {
    numero: 'I', nome: 'O Mago', arquetipo: 'O Despertar do Poder Pessoal',
    essencia: 'O Mago e o arquetipo da manifestacao consciente. Representa o momento em que reconhecemos que temos recursos, habilidades e o poder de transformar nossa realidade atraves da intencao e da acao.',
    simbolos: 'Os quatro elementos na mesa — copa, espada, moeda e cetro — representam dominio sobre as dimensoes da vida. O simbolo do infinito sobre sua cabeca indica consciencia ilimitada. A vara erguida conecta o ceu a terra: o pensamento se torna acao.',
    psicologia: 'E a tomada de consciencia do proprio potencial. O Mago representa a fase em que saimos da passividade e reconhecemos nossa agencia. E o momento em que percebemos: eu tenho o que preciso para criar o que desejo.',
    revelacao: 'Surge quando voce percebe suas capacidades e comeca a usa-las de forma direcionada. Pode ser o inicio de um projeto, o desenvolvimento de uma habilidade, ou simplesmente o reconhecimento de que voce tem mais recursos do que imaginava.',
    integracao: 'Voce tem as ferramentas necessarias. O poder esta em suas maos. Comece a manifestar suas intencoes atraves da acao consciente — cada passo deliberado e uma forma de magia real.',
    reflexao: [
      'Quais habilidades voce possui mas ainda nao esta usando plenamente?',
      'O que voce poderia criar se acreditasse completamente no seu proprio potencial?',
      'Em que momento voce ja sentiu que podia transformar uma situacao com seus proprios recursos?',
    ],
    exploracao: 'Faca uma lista dos seus talentos, experiencias e recursos disponiveis agora. Olhe para ela e pergunte: como isso pode me ajudar no que desejo criar? Muitas vezes, ja temos mais do que precisamos para comecar.',
    afirmacao: 'Eu tenho o que preciso para criar o que desejo. Meu potencial ja esta disponivel — basta direciona-lo com intencao.',
    sinais: 'Momentos em que voce percebe que tem mais recursos do que imaginava. Situacoes em que sua competencia surge de forma natural e fluida.',
    incorporacao: 'Identifique um objetivo e mapeie concretamente o que voce ja possui para alcanca-lo. A acao consciente — por menor que seja — e o inicio de qualquer realizacao.',
  },
  {
    numero: 'II', nome: 'A Sacerdotisa', arquetipo: 'A Guardia do Inconsciente',
    essencia: 'A Sacerdotisa representa o conhecimento intuitivo, os misterios que residem no silencio e a sabedoria que nao pode ser explicada — apenas sentida. E o portal para as camadas mais profundas de si mesmo.',
    simbolos: 'Sentada entre dois pilares — rigor e misericordia — ela guarda o veu decorado com romas, simbolo do inconsciente fertil. A lua aos seus pes representa ciclos e misterio. O pergaminho em seu colo sugere que ha conhecimento que nao cabe em palavras.',
    psicologia: 'Representa a intuicao profunda — a parte de nos que sabe sem saber como sabe. Junguianamente, e a dimensao do inconsciente que se forma na quietude. Simboliza o que ainda nao esta consciente, mas esta madurando no escuro.',
    revelacao: 'Aparece quando precisamos parar de agir e comecar a escutar. Momentos em que a resposta nao vem da logica, mas de um pressentimento que insiste em surgir, de sonhos que permanecem durante o dia.',
    integracao: 'Nem tudo precisa ser explicado. Confie no que voce sabe antes de conseguir articular em palavras. Ha uma sabedoria que amadurece no silencio — e ela nao se revela quando voce esta ocupado demais para ouvir.',
    reflexao: [
      'Que situacao em sua vida esta pedindo silencio ao inves de mais acao?',
      'Qual e aquela coisa que voce sabe internamente mas ainda nao reconheceu completamente?',
      'O que seus pressentimentos recentes estao tentando comunicar?',
    ],
    exploracao: 'Reserve 10 minutos em silencio, longe de telas e ruido. Feche os olhos e pergunte internamente: o que eu ja sei mas finjo nao saber? Escreva o que surgir sem censurar ou julgar.',
    afirmacao: 'Eu confio no que sei antes de conseguir explicar. Minha intuicao e uma forma legítima e poderosa de conhecimento.',
    sinais: 'Pressentimentos que se confirmam. Sonhos recorrentes com mensagens claras. A sensacao retrospectiva de "eu sabia" apos um evento.',
    incorporacao: 'Pratique parar antes de agir por impulso. Pergunte: o que minha intuicao diz sobre isso? Anote o que surge — com o tempo, voce começa a reconhecer o padrao da sua propria sabedoria interna.',
  },
  {
    numero: 'III', nome: 'A Imperatriz', arquetipo: 'A Mae Criadora',
    essencia: 'A Imperatriz e a abundancia, a fertilidade e a criacao materializada. Representa o poder de nutrir, de dar forma ao que foi semeado, e de perceber que crescimento e o resultado natural do cuidado genuino.',
    simbolos: 'Gravida e serena em meio a natureza exuberante, ela usa uma coroa de doze estrelas representando os ciclos. O escudo com o simbolo de Venus indica que o amor e a beleza sao forcas criadoras. Tudo ao seu redor floresce porque ela cuida.',
    psicologia: 'E o arquetipo criativo em sua dimensao mais plena — nao apenas no sentido biologico, mas em qualquer ato de nutrir e dar vida. Representa a abundancia que surge naturalmente quando cuidamos de algo com amor e atencao.',
    revelacao: 'Manifesta-se em momentos de crescimento organico, de colheita de algo que foi regado com cuidado. Quando um projeto floresce, quando uma relacao se aprofunda, quando nos conectamos com o prazer simples de existir e criar.',
    integracao: 'Nutra o que voce criou. A abundancia e natural quando voce cuida com intencao e amor. Conecte-se com o que e fertil em sua vida — e dedique atencao real a isso.',
    reflexao: [
      'O que voce esta nutrindo em sua vida agora — projetos, pessoas, ideias?',
      'Em que areas voce se sente fertil, criativo e expansivo?',
      'Onde voce poderia dar mais cuidado ao que esta tentando crescer?',
    ],
    exploracao: 'Identifique algo que esta crescendo em sua vida — um projeto, relacao ou habilidade. Escreva tres atitudes concretas que podem nutri-lo nesta semana. Sem grandes gestos — apenas cuidado consistente.',
    afirmacao: 'Eu nutro o que amo e o que amo floresce. A abundancia cresce onde ha cuidado genuino e presenca.',
    sinais: 'Projetos que ganham vida propria. Relacoes que se aprofundam de forma natural. Momentos de criatividade e fluxo espontaneo.',
    incorporacao: 'Identifique o que precisa de mais atencao e cuidado em sua vida. Voce nao precisa forcar o crescimento — apenas criar as condicoes para que ele aconteca.',
  },
  {
    numero: 'IV', nome: 'O Imperador', arquetipo: 'O Construtor de Estruturas',
    essencia: 'O Imperador representa a ordem, a autoridade responsavel e a estrutura que permite o crescimento. E o poder de organizar, estabelecer fundacoes solidas e assumir a direcao da propria vida.',
    simbolos: 'Sentado em um trono de pedra decorado com carneiros — simbolo da forca pioneira — ele segura o cetro e o orbe como sinais de dominio consciente. As montanhas ao fundo representam realizacoes duradouras construidas sobre terreno firme.',
    psicologia: 'E o principio paterno no seu sentido mais maduro: a capacidade de criar estrutura, disciplina e ordem interna. Representa o ego diferenciado que pode estabelecer limites, dizer nao quando necessario e liderar a propria vida com visao.',
    revelacao: 'Surge quando precisamos criar rotinas, assumir responsabilidades ou tomar decisoes estrategicas. Quando o caos pede organizacao e a vida requer que voce assuma a liderança — de voce mesmo, antes de qualquer outra coisa.',
    integracao: 'Construa fundacoes solidas. A ordem nao e rigidez — e a estrutura que permite o crescimento sustentavel. Assuma sua autoridade interna e lidere sua vida com responsabilidade e clareza de direcao.',
    reflexao: [
      'Que estrutura ou rotina sua vida esta pedindo agora?',
      'Em que areas voce tem sido mais reativo do que estrategico?',
      'Onde voce precisa assumir mais responsabilidade ou liderança — começando por voce mesmo?',
    ],
    exploracao: 'Escolha uma area da sua vida que parece desconexa ou sem direcao. Escreva tres estruturas ou habitos que, se implementados, trariam mais clareza e progresso. Comece pelo mais simples.',
    afirmacao: 'Eu assumo a responsabilidade pela direcao da minha vida. Estrutura e disciplina sao formas de cuidado comigo mesmo.',
    sinais: 'Momentos em que a vida pede mais organizacao. Situacoes que exigem decisoes firmes. A necessidade de estabelecer limites claros e funcionais.',
    incorporacao: 'Liste suas prioridades reais — o que precisa de estrutura e direcao. Comece pelo mais simples e construa consistencia. Pequenas estruturas diarias criam grandes transformacoes ao longo do tempo.',
  },
  {
    numero: 'V', nome: 'O Hierofante', arquetipo: 'O Mestre Espiritual',
    essencia: 'O Hierofante e a ponte entre o coletivo e o individual, o portador de sistemas de sabedoria e tradicao. Representa o ensino, a mentoria e a questao profunda: entre o que me foi ensinado e o que e verdadeiramente meu?',
    simbolos: 'Sentado entre dois pilares e abencando dois discipulos, ele representa a transmissao de conhecimento. As chaves aos seus pes simbolizam os misterios que a tradicao pode revelar — mas que cada um precisa viver por conta propria.',
    psicologia: 'Representa a fase em que buscamos mestres, guias e sistemas de crenca estruturados. Tambem pode indicar o momento de questionar: estou seguindo uma tradicao por escolha consciente ou por condicao? Ha diferenca significativa entre os dois.',
    revelacao: 'Aparece quando buscamos educacao, mentoria ou pertencimento a algo maior. Tambem surge quando questionamos se estamos seguindo nossas proprias verdades ou apenas repetindo o que foi aprendido sem reflexao.',
    integracao: 'Honre a sabedoria que veio antes de voce. Mas lembre-se: tradicoes servem para guiar, nao para aprisionar. A espiritualidade mais autentica e sempre pessoal.',
    reflexao: [
      'Que sistemas de crenca voce herdou e ainda carrega sem ter questionado?',
      'Onde voce busca orientacao externa quando poderia confiar mais em sua propria perspectiva?',
      'Qual e a diferenca, para voce, entre seguir uma tradicao por escolha e seguir por obrigacao?',
    ],
    exploracao: 'Escreva tres valores que guiam sua vida. Para cada um, pergunte: esse valor e verdadeiramente meu ou foi adotado sem reflexao? Como essa distincao muda sua relacao com ele?',
    afirmacao: 'Eu honro a sabedoria que me chegou e escolho o que ressoa com minha propria verdade. Meu caminho e meu.',
    sinais: 'Momentos de questionamento sobre crenças herdadas. Busca por orientacao ou mentoria. Sentir-se entre a voz coletiva e a voz propria.',
    incorporacao: 'Identifique uma crenca que voce carrega ha muito tempo e pergunte se ela ainda serve a quem voce e hoje. A revisao consciente de crenças e um dos atos mais maduros de autoconhecimento.',
  },
  {
    numero: 'VI', nome: 'Os Amantes', arquetipo: 'A Grande Escolha',
    essencia: 'Os Amantes representam escolhas conscientes, a integracao de opostos e a necessidade de decidir com base em valores pessoais autenticos — nao no que e esperado, mas no que e verdadeiro.',
    simbolos: 'Adao e Eva sob a bencao do arcanjo, entre a arvore da vida e a arvore do conhecimento. E a escolha entre o instinto e a consciencia, entre o que e seguro e o que e verdadeiro. O sol ao fundo representa clareza que so vem com a decisao.',
    psicologia: 'Representa a individuacao atraves da relacao e da escolha. Nao e apenas sobre romance — e sobre qualquer decisao que define quem somos. E o momento de integrar aspectos opostos da personalidade em vez de escolher apenas um lado.',
    revelacao: 'Surge em momentos de decisoes que definirao seu caminho. Pode ser uma escolha de relacao, carreira ou valores. E quando voce precisa decidir baseado no que e verdadeiro para voce, nao no que e esperado pelos outros.',
    integracao: 'Faca escolhas conscientes alinhadas com seus valores mais profundos. Voce e formado tanto pela luz quanto pela sombra — aceitar ambas e o comeco da integridade real.',
    reflexao: [
      'Que escolha importante voce tem evitado enfrentar completamente?',
      'Em que area da sua vida ha conflito entre o que voce quer e o que e esperado de voce?',
      'Que aspectos de si mesmo voce ainda nao integrou ou aceitou plenamente?',
    ],
    exploracao: 'Diante de uma decisao que voce tem adiado, escreva os dois caminhos possiveis com honestidade. O que cada escolha revela sobre seus valores reais? A clareza nao e sobre o que parece certo — e sobre o que e verdadeiro.',
    afirmacao: 'Eu faco escolhas conscientes alinhadas com minha verdade mais profunda. Minha vida reflete quem eu escolho ser.',
    sinais: 'Decisoes que pedem mais do que racionalidade. Conflito entre desejo e dever. Relacoes que espelham aspectos de si mesmo nao integrados.',
    incorporacao: 'Quando enfrentar uma escolha dificil, faca a pergunta: isso me aproxima de quem quero ser? Muitas vezes, a resposta ja existe dentro de voce — ela so precisa de espaco para ser ouvida.',
  },
  {
    numero: 'VII', nome: 'O Carro', arquetipo: 'A Vitoria Atraves da Determinacao',
    essencia: 'O Carro representa a conquista atraves da vontade direcionada e da habilidade de coordenar forcas internas opostas em prol de um objetivo. E o movimento deliberado que supera obstaculos atraves do foco.',
    simbolos: 'Um guerreiro em sua carruagem puxada por duas esfinges — uma branca, uma preta — representando forcas opostas que precisam ser harmonizadas, nao dominadas. O dossel de estrelas mostra que ha algo maior guiando o caminho.',
    psicologia: 'E o ego fortalecido que pode direcionar impulsos conflitantes. Representa a capacidade de manter foco apesar das distracoes internas. E disciplina interna transformada em progresso externo — sem reprimir, mas direcionando.',
    revelacao: 'Aparece quando voce precisa avancar apesar das dificuldades. Quando forcas opostas dentro de voce precisam ser harmonizadas para seguir em frente. Momentos em que a determinacao e mais importante do que a certeza.',
    integracao: 'Mantenha o foco. Forcas opostas dentro de voce nao precisam estar em conflito — podem trabalhar juntas. A determinacao que dirige sem suprimir e o que transforma intenção em resultado.',
    reflexao: [
      'Em que area da sua vida voce esta avancando mesmo diante de obstaculos e resistencias?',
      'Que forcas internas opostas voce precisa alinhar para seguir em frente com mais efetividade?',
      'O que voce precisa de foco e determinacao para concretizar agora?',
    ],
    exploracao: 'Identifique algo que voce esta postergando por sentir forcas internas em conflito. Escreva os dois lados desse conflito e o que seria necessario para move-los na mesma direcao.',
    afirmacao: 'Eu dirijo minha jornada com intencao e foco. Minha determinacao transforma obstaculos em degraus.',
    sinais: 'Periodos de avanco acelerado com esforco visivel. Situacoes que exigem foco e disciplina sustentada. A sensacao de estar se movendo mesmo quando o caminho oferece resistencia.',
    incorporacao: 'Defina um objetivo especifico e um plano simples de acao. A clareza sobre onde voce quer chegar e o primeiro passo para chegar la — mesmo que o caminho mude no percurso.',
  },
  {
    numero: 'VIII', nome: 'A Forca', arquetipo: 'A Coragem Compassiva',
    essencia: 'A Forca representa o poder que emerge da compaixao, nao da dominacao. E a coragem de enfrentar o que e intenso dentro de nos — medos, instintos, emocoes brutas — com gentileza e presenca ao inves de supressao.',
    simbolos: 'Uma mulher fechando suavemente a boca de um leao — nao pela forca muscular, mas pela conexao. O simbolo do infinito sobre sua cabeca mostra que essa forma de poder e inesgotavel. A corrente de flores indica que o controle vem do amor.',
    psicologia: 'Representa a integracao dos instintos atraves da compaixao. Nao e reprimir a natureza intensa da vida emocional, mas entende-la e integra-la com consciencia. Verdadeira forca — aquela que vem da aceitacao de si mesmo.',
    revelacao: 'Surge quando voce precisa enfrentar medos, padroes intensos ou aspectos de si mesmo que costuma evitar. Quando a raiva, o medo ou o desejo surgem e voce escolhe entende-los ao inves de reagir ou reprimir.',
    integracao: 'Verdadeira forca e gentil. Voce nao precisa dominar o que sente — precisa compreende-lo. Coragem nao e ausencia de medo, mas a capacidade de agir com clareza apesar dele.',
    reflexao: [
      'Que aspecto de si mesmo voce tem tentado controlar ao inves de compreender?',
      'Onde voce poderia ser mais gentil consigo mesmo diante dos seus proprios medos ou impulsos?',
      'Qual e a diferenca, para voce, entre forca que domina e forca que acolhe?',
    ],
    exploracao: 'Pense em um padrao ou emocao que voce costuma reprimir. Escreva sobre ele com curiosidade — nao com julgamento. O que essa parte de voce esta tentando comunicar ou proteger?',
    afirmacao: 'Eu me relaciono com minha intensidade com compaixao. Minha verdadeira forca emerge quando me aceito completamente.',
    sinais: 'Situacoes que testam paciencia e autoconhecimento. Momentos em que emocoes intensas surgem inesperadamente. A necessidade de agir com calma quando o impulso seria reagir.',
    incorporacao: 'Quando surgir um impulso ou emocao intensa, pause antes de reagir. Pergunte: o que esse sentimento esta me dizendo? A escuta de si mesmo e mais poderosa do que a supressao.',
  },
  {
    numero: 'IX', nome: 'O Eremita', arquetipo: 'A Busca Interior',
    essencia: 'O Eremita representa o retiro necessario, a busca por respostas no silencio interno e a sabedoria que emerge quando paramos de procurar fora o que so pode ser encontrado dentro.',
    simbolos: 'Um velho sabio no topo de uma montanha — sozinho, mas sereno — segura uma lanterna que ilumina apenas o passo seguinte. O cajado representa apoio e discernimento. A neve ao redor indica pureza alcanpada pela travessia.',
    psicologia: 'E o processo de individuacao que exige afastamento temporario do coletivo. Representa a necessidade de solidao para encontrar respostas autenticas. E o momento de parar de buscar validacao externa e encontrar a propria bussola interna.',
    revelacao: 'Aparece quando voce precisa de tempo consigo mesmo para refletir com profundidade. Momentos em que as respostas nao virao de livros, pessoas ou redes sociais — mas do silencio e da observacao cuidadosa.',
    integracao: 'Nem toda jornada e social. As vezes voce precisa se afastar para se encontrar. A sabedoria emerge do silencio. Ilumine seu proprio caminho antes de buscar a luz de outros.',
    reflexao: [
      'O que voce descobriria se passasse um tempo real em silencio e sem distracao?',
      'Que resposta interna voce tem buscado fora de voce mesmo?',
      'Quando foi a ultima vez que voce se deu permissao para simplesmente ser, sem produzir ou justificar?',
    ],
    exploracao: 'Desconecte-se de telas e conversas por pelo menos uma hora. Observe o que surgir — pensamentos, imagens, sentimentos. Escreva sem filtros. O silencio e um espaco de criacao, nao de vazio.',
    afirmacao: 'Eu encontro clareza no silencio. A sabedoria que busco reside em mim — e emerge quando crio espaco para ouvi-la.',
    sinais: 'Desejo de recolhimento ou solidao. Cansaco social sem razao aparente. Perguntas existenciais que surgem com insistencia e pedem espaco.',
    incorporacao: 'Crie momentos de silencio genuino na sua rotina — nao como fuga, mas como encontro consigo mesmo. Comece com 10 minutos e observe o que muda.',
  },
  {
    numero: 'X', nome: 'A Roda da Fortuna', arquetipo: 'Os Ciclos Inevitaveis',
    essencia: 'A Roda da Fortuna representa os ciclos da vida, a impermanencia de todas as fases e o ritmo que existe alem do controle individual. E o convite a reconhecer padroes e a fluir com o que nao pode ser controlado.',
    simbolos: 'Uma roda girando com simbolos de transformacao. Anubis sobe enquanto Set desce — o que sobe, desce; o que cai, sobe novamente. As quatro criaturas nos cantos representam a estabilidade que existe dentro do movimento.',
    psicologia: 'Representa a aceitacao da impermanencia. E o reconhecimento de que ha forcas e ciclos que existem alem do nosso controle. Tambem simboliza sincronicidades e padroes que se repetem como convites a consciencia.',
    revelacao: 'Surge em momentos de grande mudanca — esperada ou nao. Quando circunstancias externas se reorganizam de forma inesperada. Quando voce percebe padroes ciclicos em sua historia pessoal.',
    integracao: 'Tudo e impermanente. O que esta embaixo hoje pode estar em cima amanha. Nao se apegue a sorte nem desespere no azar — ha um ritmo maior na vida que convida a fluir, nao a resistir.',
    reflexao: [
      'Que ciclo parece estar chegando ao fim — ou ao comeco — na sua vida agora?',
      'Como voce costuma reagir quando as circunstancias mudam sem o seu controle?',
      'O que os padroes que se repetem na sua historia estao tentando te ensinar?',
    ],
    exploracao: 'Pense em uma mudanca recente que chegou sem convite. Escreva o que essa mudanca pode estar abrindo espaco para. As vezes o fim de um ciclo so e reconhecido como tal depois — quando ja se pode ver o que ele preparou.',
    afirmacao: 'Eu fluo com os ciclos da minha vida. O que chega e o que parte fazem parte de um ritmo que nao preciso controlar.',
    sinais: 'Mudancas imprevistas em areas importantes. Coincidencias significativas que pedem atencao. A sensacao de que algo esta se reorganizando de forma que voce nao pode controlar.',
    incorporacao: 'Reflita sobre os padroes que se repetem em sua historia pessoal. O que cada ciclo tem tentado mostrar? A consciencia dos ciclos transforma a experiencia de vitima em participante consciente.',
  },
  {
    numero: 'XI', nome: 'A Justica', arquetipo: 'O Equilibrio e a Responsabilidade',
    essencia: 'A Justica representa causa e efeito, responsabilidade pessoal autentica e a busca por equilibrio. E o momento de reconhecer que nossas escolhas criam nossa realidade — e que a honestidade com si mesmo e o inicio de qualquer equilibrio real.',
    simbolos: 'Uma figura serena segurando uma espada — discernimento — e uma balanca — equilibrio. A espada e reta porque a verdade nao tem curvatura. A balanca pesa com imparcialidade o que foi semeado e o que foi colhido.',
    psicologia: 'Representa a confrontacao madura com as consequencias das proprias escolhas. E o superego equilibrado — nao punitivo, mas honesto. O reconhecimento de que somos responsaveis pelo que construimos em nossa vida.',
    revelacao: 'Aparece quando voce enfrenta consequencias de acoes passadas. Momentos de decisoes que exigem integridade. Quando voce precisa ser honesto sobre seu papel em situacoes que envolvem outras pessoas.',
    integracao: 'Voce e responsavel por suas escolhas. Justica nao e apenas o que voce recebe — e integridade no que voce faz. Busque equilibrio. O universo responde com o que voce emite.',
    reflexao: [
      'Que consequencia de uma escolha passada voce ainda esta integrando ou resistindo?',
      'Onde voce poderia ser mais honesto consigo mesmo sobre seu papel em uma situacao atual?',
      'O que equilibrio real significaria em sua vida neste momento?',
    ],
    exploracao: 'Pense em uma situacao de conflito ou insatisfacao em sua vida. Escreva com honestidade: qual e sua parte nessa dinamica? Nao como autoculpa — mas como autenticidade. A responsabilidade honesta liberta.',
    afirmacao: 'Eu assumo minhas escolhas com integridade. O equilibrio que busco começa pela honestidade comigo mesmo.',
    sinais: 'Situacoes que pedem decisoes claras e imparciais. Consequencias de acoes passadas tornando-se visiveis. A necessidade de honestidade antes da resolucao.',
    incorporacao: 'Pratique a honestidade interna antes da externa. Em cada situacao dificil, pergunte: estou agindo com integridade aqui? A autenticidade e a base de qualquer equilibrio duradouro.',
  },
  {
    numero: 'XII', nome: 'O Enforcado', arquetipo: 'O Sacrificio Necessario',
    essencia: 'O Enforcado representa a suspensao voluntaria, a mudanca de perspectiva radical e o que emerge quando paramos de lutar e nos permitimos ver a situacao de um angulo completamente diferente.',
    simbolos: 'Um homem pendurado de cabeca para baixo em uma arvore viva — e, no entanto, sereno. O halo ao redor da cabeca indica illuminacao alcanpada pela inversao. Ele escolheu essa posicao; nao e vitima — e um observador corajoso.',
    psicologia: 'Representa o momento de parar de resistir e se render a uma perspectiva nova. E a fase em que a visao antiga precisa ser invertida para que algo mais verdadeiro emerja. O sacrificio do ego menor para o despertar do self mais profundo.',
    revelacao: 'Surge quando voce esta em uma situacao sem solucao aparente. Quando lutar so piora as coisas. Momentos de espera forcada, crises existenciais, ou quando e necessario ver tudo de um angulo completamente diferente.',
    integracao: 'As vezes, parar e a acao mais poderosa. Nem tudo pode ser resolvido pela forca da vontade. Mudancas de perspectiva vem da suspensao do habitual. O que parece sacrificio pode ser a porta da libertacao.',
    reflexao: [
      'O que aconteceria se voce parasse de tentar resolver uma situacao e simplesmente a observasse?',
      'Que perspectiva radicalmente diferente poderia mudar sua relacao com um problema atual?',
      'O que voce tem perdido ao insistir em ver as coisas apenas da forma que ja conhece?',
    ],
    exploracao: 'Escolha uma situacao em que voce tem lutado muito. Por um dia, nao tome nenhuma acao direta em relacao a ela. Observe o que surge quando voce para de forcar. O que aparece quando voce nao esta tentando controlar?',
    afirmacao: 'Eu confio no processo mesmo quando nao entendo. A pausa tambem e uma forma de movimento.',
    sinais: 'Situacoes em que nada parece avancar apesar do esforco. Sensacao de estar travado ou em espera. Convites inesperados para mudar a perspectiva.',
    incorporacao: 'Pratique o nao-fazer intencional. A rendição nao e derrota — e sabedoria suficiente para reconhecer quando parar de lutar e comecar a observar.',
  },
  {
    numero: 'XIII', nome: 'A Morte', arquetipo: 'A Transformacao Inevitavel',
    essencia: 'A Morte nao e o fim — e a transformacao mais profunda. Representa o que precisa encerrar para que o novo possa nascer. E o coragem de deixar ir o que ja nao reflete quem voce e.',
    simbolos: 'Um esqueleto cavaleiro com uma bandeira branca — pureza e nova possibilidade — e uma rosa, simbolo de vida que persiste apos o fim. O sol nascente entre os pilares ao fundo: a escuridao da transicao sempre precede uma nova aurora.',
    psicologia: 'Representa o fim de identidades, crenças ou padroes que nao servem mais ao crescimento. E a morte psicologica necessaria para o renascimento. O luto pelo que foi, criando espaco para o que pode vir a ser.',
    revelacao: 'Aparece em finais significativos — terminos de relacionamentos, mudancas de identidade, encerramento de fases. Quando uma fase da vida se fecha de forma definitiva e o que vem depois ainda nao tem forma clara.',
    integracao: 'Fim nao e fracasso. Algumas coisas precisam terminar para que voce possa crescer. Solte o que ja nao te serve. A transformacao pode ser dolorosa — mas e necessaria e, no final, libertadora.',
    reflexao: [
      'O que precisa terminar em sua vida para que algo novo possa verdadeiramente nascer?',
      'Que identidade ou papel voce carrega mas que ja nao reflete quem voce e hoje?',
      'O que voce tem mantido vivo por medo do vazio que virá com o encerramento?',
    ],
    exploracao: 'Escreva sobre algo que voce sabe que precisa deixar ir — um padrao, uma relacao, uma versao de si mesmo. Nao como drama — como reconhecimento honesto. O que voce carregaria para o proximo capitulo?',
    afirmacao: 'Eu solto o que ja nao me serve. Todo fim cria o espaco para um novo começo.',
    sinais: 'Fechamentos definitivos em areas importantes. Transformacoes profundas de identidade. A sensacao de que algo ja nao cabe mais na vida que voce esta construindo.',
    incorporacao: 'Identifique algo que voce sabe que precisa terminar mas ainda segura. Pergunte: o que me impede de deixar ir? A resposta muitas vezes revela o proximo passo da sua jornada.',
  },
  {
    numero: 'XIV', nome: 'A Temperanca', arquetipo: 'A Alquimia da Alma',
    essencia: 'A Temperanca representa o equilibrio como processo — a paciencia de integrar opostos ao longo do tempo e o refinamento que emerge quando paramos de forcar e confiamos no ritmo natural de transformacao.',
    simbolos: 'Um anjo com um pe na agua e outro na terra, misturando liquidos entre duas tacas de forma fluida. O triangulo no peito representa o fogo interno. A iris ao fundo e a mensageira do caminho que surge entre os extremos.',
    psicologia: 'Apos a transformacao da Morte, vem a integracao da Temperanca. E o processo de equilibrar extremos internos, de encontrar o meio-fecundo. Representa a alquimia interior — a transformacao lenta e profunda que nao pode ser apressada.',
    revelacao: 'Surge em periodos de cura gradual apos crises. Quando voce precisa de paciencia para integrar mudancas. Momentos de busca por equilibrio entre demandas opostas — trabalho e vida, razao e emocao.',
    integracao: 'Paciencia e a virtude do sabio. A verdadeira transformacao e gradual. Equilibre seus opostos internos. A cura acontece gota a gota — e isso nao e uma fraqueza, e um processo.',
    reflexao: [
      'Onde voce precisa de mais equilibrio entre extremos na sua vida agora?',
      'O que significa paciencia para voce — e como voce a pratica ou evita?',
      'Que processo de cura ou integracao esta acontecendo em voce neste momento?',
    ],
    exploracao: 'Identifique uma area da sua vida onde voce tende a agir nos extremos — tudo ou nada, rapido demais ou procrastinando. Escreva como seria encontrar um meio-termo mais sustentavel e o que isso exigiria de voce.',
    afirmacao: 'Eu confio no ritmo do meu processo. A transformacao verdadeira e gradual e profunda.',
    sinais: 'Periodos de cura real apos turbulencia. Necessidade genuina de equilíbrio. Momentos de integracao lenta — quando as coisas comecam a se encaixar de forma organica.',
    incorporacao: 'Escolha uma area de extremo em sua vida e experimente o meio-termo por uma semana. A moderacao nao e fraqueza — e precisao. Observe o que muda quando voce para de forcar.',
  },
  {
    numero: 'XV', nome: 'O Diabo', arquetipo: 'A Sombra e o Aprisionamento',
    essencia: 'O Diabo representa nossas prisoes autoimposas — padroes compulsivos, medos que controlam, aspectos de nos mesmos que negamos. E o convite a olhar com honestidade para o que nos mantem acorrentados.',
    simbolos: 'Uma figura demoniaca com um casal acorrentado — mas as correntes sao frouxas o suficiente para serem removidas. Eles poderiam sair, mas escolhem ficar. Essa e a mensagem central: a prisao que mais nos aprisiona e a que construimos nos mesmos.',
    psicologia: 'E o confronto com a sombra junguiana — os aspectos que negamos em nos mesmos. Representa compulsoes, vicios, padroes destrutivos. O que mais tememos reconhecer em nos frequentemente e o que mais nos controla.',
    revelacao: 'Aparece em padroes que se repetem mesmo contra nossa vontade. Em relacoes ou situacoes que drenam mas das quais e dificil sair. Quando voce percebe que e, em parte, cumplice de sua propria limitacao.',
    integracao: 'Voce tem mais liberdade do que pensa. Suas correntes sao, em grande parte, autoimposas. Enfrente sua sombra — o que voce nega, controla voce. A consciencia e o inicio da libertacao.',
    reflexao: [
      'Que padrao em voce mesmo voce reconhece mas tem dificuldade de assumir completamente?',
      'O que voce faz de forma compulsiva mesmo sabendo que nao te serve mais?',
      'Onde voce cede responsabilidade pelas suas proprias escolhas?',
    ],
    exploracao: 'Escreva sobre um padrao ou habito que te prende — sem julgamento. O que ele te oferece? Qual necessidade ele satisfaz de forma que nao e ideal? Compreender a funcao de um padrao e o primeiro passo real para transforma-lo.',
    afirmacao: 'Eu reconheço meus padroes sem me definir por eles. Minha consciencia e o inicio da minha liberdade.',
    sinais: 'Padroes que se repetem mesmo contra sua vontade. A sensacao de ser controlado por algo que voce nao entende completamente. Relacoes ou situacoes que drenam mas tem uma atração difficil de explicar.',
    incorporacao: 'Identifique um padrao limitante e observe-o com curiosidade ao inves de vergonha. O que voce aprenderia sobre si mesmo se o entendesse em vez de lutar contra ele?',
  },
  {
    numero: 'XVI', nome: 'A Torre', arquetipo: 'A Destruicao Necessaria',
    essencia: 'A Torre representa o colapso de estruturas que foram construidas sobre fundacoes falsas. E a revelacao subita e a destruicao que precede uma reconstrucao mais autentica — dolorosa, mas necessaria.',
    simbolos: 'Uma torre sendo atingida por um raio, com figuras caindo e a coroa no topo tombando. A coroa representa as ilusoes de controle e de seguranca permanente. O raio e uma forca que vem de fora — o destino, a verdade, o inesperado.',
    psicologia: 'Representa o colapso de estruturas mentais falsas e do ego inflado. E o momento em que ilusoes sao demolidas de forma subita. Pode ser traumatico — mas o que e verdadeiro sempre sobrevive ao que e falso.',
    revelacao: 'Surge em crises subitas, revelacoes chocantes, perdas inesperadas. Quando tudo que foi construido sobre premissas falsas come a desmoronar. Momentos de colapso que, no final, forcam uma reconstrucao mais solida.',
    integracao: 'As vezes o universo destroi o que voce construiu porque estava sobre fundacoes falsas. Nao e punicao — e libertacao. O que e verdadeiro sobrevive. Reconstrua sobre a honestidade.',
    reflexao: [
      'Que estrutura na sua vida esta sendo desafiada agora — e o que ela pode estar revelando?',
      'Como voce costuma reagir quando algo muda de forma repentina e fora do seu controle?',
      'O que uma revelacao recente ou inesperada abriu para voce — mesmo que de forma dificil?',
    ],
    exploracao: 'Pense em algo que desabou em sua vida — recentemente ou no passado. Escreva o que ficou de pe. O que essa experiencia revelou que era essencial e o que era apenas aparencia?',
    afirmacao: 'Eu confio na reconstrucao que emerge apos a queda. O que e real permanece; o que e falso se dissolve.',
    sinais: 'Crises subitas ou revelacoes inesperadas. Colapso de situacoes que pareciam estáveis. A sensacao de que tudo mudou de uma vez — sem pedir permissao.',
    incorporacao: 'Apos uma crise, pergunte: o que eu posso construir sobre fundacoes mais verdadeiras? A destruicao nao e o fim da historia — e o espaco para uma versao mais autentica dela.',
  },
  {
    numero: 'XVII', nome: 'A Estrela', arquetipo: 'A Esperanca Renovada',
    essencia: 'A Estrela representa esperanca, inspiracao genuina e renovacao apos a crise. E a luz que permanece apos a escuridao — suave, constante e capaz de nutrir o que a tempestade nao conseguiu destruir.',
    simbolos: 'Uma mulher nua despejando agua em um rio e na terra — nutrindo o que existe. Oito estrelas brilham no ceu: luz que nao falha. A nudez simboliza autenticidade vulneravel. O passaro representa pensamentos que se elevam naturalmente quando o peso diminui.',
    psicologia: 'Apos a destruicao da Torre, vem a esperanca da Estrela. E o momento de reconexao com o self autentico, de inspiracao renovada e de fe que nao precisa ser justificada — apenas vivida.',
    revelacao: 'Aparece em periodos de recuperacao apos crises. Quando voce volta a sentir esperanca. Momentos de inspiracao, de sentir-se guiado por algo mais amplo, quando a cura verdadeira começa de forma silenciosa.',
    integracao: 'Sempre ha esperanca. Apos a escuridao, a luz retorna. Voce esta sendo guiado mesmo quando nao ve o caminho completo. Cuide-se. Conecte-se com o que e maior do que voce.',
    reflexao: [
      'O que te alimenta de esperanca mesmo nos momentos mais dificeis?',
      'Que feridas em voce estao em processo de cura agora — mesmo que sutilmente?',
      'O que sua versao mais esperancosa diria para a versao de voce que mais precisou de amparo?',
    ],
    exploracao: 'Escreva uma carta para voce mesmo em um momento dificil do passado. O que voce diria agora que teria ajudado entao? Esse ato de cuidado retroativo tem um efeito real de cura no presente.',
    afirmacao: 'Eu me permito receber cuidado e esperanca. A cura acontece quando paro de resistir ao que me nutre.',
    sinais: 'Periodos de recuperacao real apos turbulencia. Inspiracao genuina surgindo de forma inesperada. A sensacao de ser amprado ou guiado mesmo sem entender como.',
    incorporacao: 'Identifique o que genuinamente te nutre e te renova — e inclua isso de forma consciente na sua rotina. A esperanca nao e passiva: ela se cultiva com escolhas pequenas e consistentes.',
  },
  {
    numero: 'XVIII', nome: 'A Lua', arquetipo: 'A Jornada pelo Inconsciente',
    essencia: 'A Lua representa o territorio da ilusao, do medo e do inconsciente profundo. E a jornada atraves da escuridao psiquica — o espaco entre o que voce sabe conscientemente e o que ainda esta se formando nas camadas mais profundas.',
    simbolos: 'Dois caes uivando para a lua, um caminho entre duas torres que desaparece no horizonte. Um lagostim emerge da agua — simbolo do que vem do profundo. A lua goteja, alimentando o que ainda nao tem forma clara.',
    psicologia: 'Representa a descida ao inconsciente profundo — medos, ilusoes, memorias que nao foram integradas. E a noite escura da alma: o territorio entre o conhecido e o que ainda nao pode ser visto com clareza.',
    revelacao: 'Surge em periodos de confusao, ansiedade ou quando voce nao confia nas proprias percepcoes. Pesadelos, medos sem causa aparente. Quando tudo parece incerto e as fronteiras do real parecem menos solidas.',
    integracao: 'Nem tudo e o que parece. Seus medos podem ser ilusoes — ou guias disfarçados. Atravesse a noite com curiosidade. O que voce teme pode ser um mensageiro. Continue caminhando.',
    reflexao: [
      'Que medos ou incertezas estao presentes em voce agora?',
      'O que voce percebe que pode ser uma historia que conta a si mesmo — mas que nao e completamente real?',
      'O que esta nas sombras da sua consciencia pedindo para ser reconhecido?',
    ],
    exploracao: 'Antes de dormir, escreva o que te causa ansiedade ou confusao neste momento — nao para resolver, mas para nomear. Dar nome ao que nos perturba ja diminui seu poder sobre nos.',
    afirmacao: 'Eu caminho pela incerteza com curiosidade ao inves de medo. A escuridao tambem tem algo a me ensinar.',
    sinais: 'Periodos de confusao, ansiedade ou percepcao distorcida. Medos que surgem sem causa aparente. Sonhos intensos ou reveladores que persistem durante o dia.',
    incorporacao: 'Quando sentir confusao ou medo, nao tente eliminar imediatamente. Pergunte: o que essa experiencia esta mostrando? As respostas vem pela escuta cuidadosa, nao pela fuga.',
  },
  {
    numero: 'XIX', nome: 'O Sol', arquetipo: 'A Iluminacao e a Alegria',
    essencia: 'O Sol representa clareza, vitalidade e a alegria simples de existir completamente. E a luz apos a escuridao — consciente, integrada, celebrada sem desculpas.',
    simbolos: 'Um sol radiante, uma crianca nua em um cavalo branco — pura vitalidade sem autoconciencia. Girassois voltados para a luz. Tudo esta claro e iluminado. A bandeira vermelha representa a vitalidade que move sem queimar.',
    psicologia: 'Apos atravessar a Lua, voce emerge no Sol — consciencia clara, ego saudavel, alegria autentica. Representa o self integrado: quando todas as partes de voce trabalham juntas em vez de em conflito.',
    revelacao: 'Aparece em momentos de sucesso, clareza e alegria genuina. Quando as coisas fazem sentido de forma natural. Quando voce se sente vivo, presente e autentico em quem e.',
    integracao: 'Voce merece celebrar. A vida pode ser simples e luminosa. Voce atravessou a escuridao e emergiu mais claro. Brilhe. Compartilhe sua luz. A clareza chegou.',
    reflexao: [
      'O que te traz alegria genuina — nao prazer momentaneo, mas uma alegria que permanece?',
      'Em que aspecto da sua vida voce se sente mais vivo, inteiro e autentico?',
      'O que voce ja conquistou que merece ser verdadeiramente celebrado?',
    ],
    exploracao: 'Escreva sobre tres momentos em que voce se sentiu completamente voce mesmo — vivo, claro, presente. O que havia em comum nessas experiencias? Essa e a direcao da sua alegria autentica.',
    afirmacao: 'Eu me permito brilhar sem desculpas. Minha alegria e uma contribuicao genuina ao mundo.',
    sinais: 'Periodos de clareza, sucesso e alegria real. Sensacao de estar no caminho certo. Conexao com a propria vitalidade e autenticidade sem esforco.',
    incorporacao: 'Identifique o que genuinamente te faz sentir vivo e faca mais disso — conscientemente e sem culpa. A alegria autentica e um indicador de alinhamento com quem voce realmente e.',
  },
  {
    numero: 'XX', nome: 'O Julgamento', arquetipo: 'O Despertar e o Chamado',
    essencia: 'O Julgamento representa o despertar final, a avaliacao honesta de si mesmo e o chamado inegavel para viver de acordo com um proposito mais profundo e autentico.',
    simbolos: 'Um anjo tocando uma trombeta, pessoas surgindo de caixoes com bracos abertos — nao como ressurreicao mistica, mas como metafora de quem acorda para a propria vida. Montanhas ao fundo: o caminho ainda existe, agora com mais clareza.',
    psicologia: 'Representa a integracao de todas as experiencias da jornada em uma perspectiva mais ampla. E o momento de avaliar honestamente quem voce se tornou — e o chamado para viver de acordo com a versao mais verdadeira de si mesmo.',
    revelacao: 'Surge em momentos de grande clareza sobre proposito ou direcao. Quando um chamado interno se torna impossivel de ignorar. Momentos de renascimento — quando o passado e integrado e um novo capitulo se abre.',
    integracao: 'E hora de despertar mais completamente. Avalie sua jornada com honestidade. Perdoe-se pelo caminho que foi necessario. Responda ao chamado da sua propria evolucao.',
    reflexao: [
      'Que chamado interno voce tem ouvido — e adiado atender?',
      'O que precisaria ser perdoado — em voce mesmo ou na sua historia — para que voce avance com mais leveza?',
      'Quem voce e agora, alem de quem voce foi e do que passou?',
    ],
    exploracao: 'Escreva sobre quem voce foi e quem voce esta se tornando. Que partes do passado voce pode reconhecer e integrar — em vez de carregar? O reconhecimento honesto de uma jornada e uma forma de despertar.',
    afirmacao: 'Eu respondo ao chamado da minha propria evolucao. Meu passado me formou; meu presente me define.',
    sinais: 'Momentos de grande clareza sobre direcao e proposito. Renovacao profunda apos periodos de crise. A sensacao inegavel de que chegou a hora de algo.',
    incorporacao: 'Pergunte-se: o que minha vida esta tentando me dizer que eu ainda nao ouvi completamente? Acolher esse chamado nao exige grandes gestos — começa com a decisao de escutar com mais atencao.',
  },
  {
    numero: 'XXI', nome: 'O Mundo', arquetipo: 'A Completude e a Realizacao',
    essencia: 'O Mundo representa a completude — nao como fim definitivo, mas como a realizacao de um ciclo inteiro. E a danca da pessoa integrada: todas as partes reconciliadas, todos os aprendizados incorporados.',
    simbolos: 'Uma figura dancando em uma grinalda de louros — vitoria e celebracao. As quatro criaturas nos cantos representam a integracao total dos elementos da experiencia. As fitas formam um infinito: a completude nao e parada — e o fundamento de um novo comeco.',
    psicologia: 'E a individuacao no seu sentido mais pleno — o self integrado que dança. Todas as partes reconciliadas, todos os aspectos reconhecidos. A jornada completa — mas nao o fim definitivo. O Mundo leva sempre de volta ao Louco.',
    revelacao: 'Aparece em momentos de conclusao significativa, quando um ciclo grande se fecha de forma real. Quando voce alcanca uma meta importante e sente que chegou em algum lugar verdadeiro. A sensacao de plenitude — passageira mas real.',
    integracao: 'Voce completou um ciclo. Celebre sua realizacao com consciencia. Mas lembre-se: o fim e sempre um novo comeco. A danca continua — em um nivel superior de compreensao.',
    reflexao: [
      'Que ciclo importante da sua vida esta chegando — ou ja chegou — a uma completude real?',
      'O que voce aprendeu nessa jornada que nao sabia ou nao compreendia no inicio?',
      'Como voce celebra suas conquistas — ou por que nao o faz?',
    ],
    exploracao: 'Olhe para um capitulo que esta se fechando em sua vida. Escreva o que voce carrega como aprendizado, o que voce deixa para tras e o que leva para o proximo ciclo. Essa revisao e uma forma de honrar o caminho percorrido.',
    afirmacao: 'Eu celebro o que percorri e acolho o novo ciclo que comeca. A completude e sempre o fundamento de algo maior.',
    sinais: 'Conclusao de ciclos significativos com sensacao de plenitude. Momentos de realizacao real. A sensacao de ter chegado em algum lugar importante — e de estar pronto para o que vem.',
    incorporacao: 'Celebre suas conquistas de forma consciente — mesmo as pequenas. A gratidao pelo caminho percorrido nao e vaidade; e o combustivel do proximo ciclo que ja esta se formando.',
  },
];

// ============================================================
// HELPERS (identicos ao original)
// ============================================================

type RGB = readonly [number, number, number];
const sc = (doc: jsPDF, c: RGB, t: 'f' | 't' | 'd') => {
  if (t === 'f') doc.setFillColor(c[0], c[1], c[2]);
  else if (t === 't') doc.setTextColor(c[0], c[1], c[2]);
  else doc.setDrawColor(c[0], c[1], c[2]);
};

function bg(doc: jsPDF) {
  const steps = 40;
  const stripH = PH / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(C.BG_TOP[0] + (C.BG_BOT[0] - C.BG_TOP[0]) * t);
    const g = Math.round(C.BG_TOP[1] + (C.BG_BOT[1] - C.BG_TOP[1]) * t);
    const b = Math.round(C.BG_TOP[2] + (C.BG_BOT[2] - C.BG_TOP[2]) * t);
    doc.setFillColor(r, g, b);
    doc.rect(0, i * stripH, PW, stripH + 0.5, 'F');
  }
}

function header(doc: jsPDF) {
  doc.setFontSize(8);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('ZAYA TAROT', M, 17);
  doc.setFont('times', 'normal');
  sc(doc, C.TEXTO_MUTED, 't');
  doc.text('Arquivo Arcano  |  Jornada do Heroi', PW - M, 17, { align: 'right' });
  sc(doc, C.BORDER_GOLD, 'd');
  doc.setLineWidth(0.4);
  doc.line(M, 20, PW - M, 20);
}

function footer(doc: jsPDF, pg: number) {
  sc(doc, C.BORDER, 'd');
  doc.setLineWidth(0.15);
  doc.line(M + 30, PH - 16, PW - M - 30, PH - 16);
  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text(`${pg}`, PW / 2, PH - 11, { align: 'center' });
  doc.setFontSize(8.5);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.text('zayatarot.com', PW / 2, PH - 7, { align: 'center' });
}

function newPage(doc: jsPDF, pg: number) {
  doc.addPage();
  bg(doc);
  header(doc);
  footer(doc, pg);
}

function drawSectionBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setFillColor(C.SURFACE[0], C.SURFACE[1], C.SURFACE[2]);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  sc(doc, C.BORDER, 'd');
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');
  sc(doc, C.BORDER_GOLD, 'f');
  doc.rect(x, y + 2, 1.2, h - 4, 'F');
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lh: number): number {
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    doc.text(line, x, y);
    y += lh;
  }
  return y;
}

function textHeight(doc: jsPDF, text: string, maxW: number, lh: number): number {
  return doc.splitTextToSize(text, maxW).length * lh;
}

function divider(doc: jsPDF, y: number): number {
  const cx = PW / 2;
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.25);
  doc.line(cx - 35, y, cx - 4, y);
  doc.line(cx + 4, y, cx + 35, y);
  sc(doc, C.GOLD, 'f');
  doc.circle(cx, y, 1.2, 'F');
  return y + 5;
}

async function loadImg(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const t = setTimeout(() => reject(new Error('Timeout')), 20000);
    img.onload = () => {
      clearTimeout(t);
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext('2d');
      if (ctx) { ctx.drawImage(img, 0, 0); resolve(cv.toDataURL('image/jpeg', 0.92)); }
      else reject(new Error('Canvas error'));
    };
    img.onerror = () => { clearTimeout(t); reject(new Error('Load error')); };
    img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=480&fit=cover&output=jpg`;
  });
}

function drawGoldOrbit(doc: jsPDF, cx: number, cy: number, rx: number, ry: number) {
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.5);
  doc.ellipse(cx, cy, rx, ry, 'S');
  doc.setGState(doc.GState({ opacity: 0.4 }));
  sc(doc, C.GOLD, 'd');
  doc.setLineWidth(0.3);
  doc.ellipse(cx, cy, rx + 6, ry + 3, 'S');
  doc.setGState(doc.GState({ opacity: 1 }));
  sc(doc, C.GOLD, 'f');
  doc.circle(cx, cy, 2, 'F');
  sc(doc, C.GOLD_DEEP, 'f');
  doc.circle(cx - rx, cy, 1, 'F');
  doc.circle(cx + rx, cy, 1, 'F');
  doc.circle(cx, cy - ry, 1, 'F');
  doc.circle(cx, cy + ry, 1, 'F');
}

// ============================================================
// CAPA (identica ao original)
// ============================================================
function drawCover(doc: jsPDF) {
  bg(doc);
  sc(doc, C.BORDER, 'd');
  doc.setLineWidth(0.3);
  doc.rect(12, 12, PW - 24, PH - 24);
  const cn = 14, cs = 10;
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.5);
  doc.line(cn, cn, cn + cs, cn); doc.line(cn, cn, cn, cn + cs);
  doc.line(PW - cn, cn, PW - cn - cs, cn); doc.line(PW - cn, cn, PW - cn, cn + cs);
  doc.line(cn, PH - cn, cn + cs, PH - cn); doc.line(cn, PH - cn, cn, PH - cn - cs);
  doc.line(PW - cn, PH - cn, PW - cn - cs, PH - cn); doc.line(PW - cn, PH - cn, PW - cn, PH - cn - cs);
  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'italic');
  doc.text('Uma experiencia exclusiva por', PW / 2, 55, { align: 'center' });
  doc.setFontSize(36);
  sc(doc, C.WHITE, 't');
  doc.setFont('times', 'bold');
  doc.text('ZAYA TAROT', PW / 2, 72, { align: 'center' });
  doc.setFontSize(11);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('Sabedoria ancestral para o caminho moderno', PW / 2, 82, { align: 'center' });
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.6);
  doc.line(55, 88, PW - 55, 88);
  doc.setLineWidth(0.2);
  doc.line(65, 90, PW - 65, 90);
  drawGoldOrbit(doc, PW / 2, 130, 45, 25);
  doc.setFontSize(42);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Jornada do Heroi', PW / 2, 178, { align: 'center' });
  doc.setFontSize(15);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'normal');
  doc.text('Os 22 Arcanos Maiores do Tarot', PW / 2, 190, { align: 'center' });
  doc.setFontSize(12);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'italic');
  doc.text('Uma jornada de autoconhecimento atraves', PW / 2, 210, { align: 'center' });
  doc.text('dos arquetipos ancestrais do Tarot', PW / 2, 219, { align: 'center' });
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.3);
  doc.line(55, 228, PW - 55, 228);
  doc.setFontSize(11);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('ARQUIVO ARCANO', PW / 2, 238, { align: 'center' });
  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('Material exclusivo para desenvolvimento pessoal e espiritual', PW / 2, 246, { align: 'center' });
  doc.setFontSize(7);
  sc(doc, C.ROXO_MEDIO, 't');
  doc.text('zayatarot.com', PW / 2, PH - 18, { align: 'center' });
}

// ============================================================
// PG 2: INTRODUCAO NARRATIVA IMERSIVA
// ============================================================
function drawNarrativeIntro(doc: jsPDF) {
  newPage(doc, 2);
  let y = 35;

  doc.setFontSize(26);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Este Livro Chegou ate Voce', PW / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(18);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.text('por uma Razao', PW / 2, y, { align: 'center' });
  y += 6;
  y = divider(doc, y) + 6;

  const paras = [
    'Voce nao chegou a este livro por acidente. Algo dentro de voce — uma curiosidade, um desconforto, uma vontade silenciosa de entender melhor a propria historia — te trouxe ate aqui. E isso ja e o comeco de uma jornada.',
    'Os 22 Arcanos Maiores do Tarot nao sao previsoes do futuro. Sao espelhos. Cada carta reflete uma dimensao da experiencia humana — fases, sentimentos, crises, transformacoes — que todos nos atravessamos, em ordens e formas diferentes.',
    'A Jornada do Heroi, descrita pelo mitologista Joseph Campbell, e a estrutura narrativa mais universal que existe: um personagem que parte do conforto do conhecido, enfrenta obstaculos que o transformam, e retorna diferente — mais inteiro, mais consciente. Os 22 arcanos mapeiam exatamente esse percurso.',
    'Este livro nao vai te dizer o que vai acontecer. Ele vai te ajudar a ver com mais clareza o que ja esta acontecendo — e a encontrar, nas historias simbolicas de cada arcano, um espelho para a sua propria travessia.',
  ];

  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  const lh = 5.2;
  for (const p of paras) {
    y = wrapText(doc, p, M + 4, y, CW - 8, lh);
    y += 5;
  }

  y = divider(doc, y) + 5;

  doc.setFontSize(14);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'italic');
  doc.text('"O heroi e aquele que corajosamente enfrenta', PW / 2, y, { align: 'center' });
  y += 7;
  doc.text('o que a vida traz — e retorna transformado."', PW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(11);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('— Joseph Campbell', PW / 2, y, { align: 'center' });
  y += 12;

  // Instrucao sutil
  doc.setFillColor(C.SURFACE[0], C.SURFACE[1], C.SURFACE[2]);
  doc.roundedRect(M, y, CW, 22, 2, 2, 'F');
  sc(doc, C.BORDER_GOLD, 'f');
  doc.rect(M, y + 2, 1.2, 18, 'F');
  doc.setFontSize(10);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Antes de comecar:', M + 6, y + 7);
  doc.setFontSize(10);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  doc.text('Tenha um caderno de anotacoes ao lado. As reflexoes que surgirao ao longo desta', M + 6, y + 13);
  doc.text('leitura merecem um espaco para existir fora de voce.', M + 6, y + 18);
}

// ============================================================
// PG 3: COMO HABITAR ESTE LIVRO
// ============================================================
function drawHowToUsePage(doc: jsPDF) {
  newPage(doc, 3);
  let y = 35;

  doc.setFontSize(24);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Quatro Formas de Habitar Este Livro', PW / 2, y, { align: 'center' });
  y += 6;
  y = divider(doc, y) + 5;

  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  y = wrapText(doc, 'Nao ha uma unica forma correta de usar este livro. Aqui estao quatro abordagens, cada uma oferecendo uma experiencia diferente de autoconhecimento:', M + 4, y, CW - 8, 5.0);
  y += 6;

  const modos = [
    {
      num: '01',
      titulo: 'Leitura Linear — Da Inocencia a Completude',
      texto: 'Comece pelo Louco e siga ate o Mundo, acompanhando a Jornada do Heroi do inicio ao fim. Esta e a leitura da narrativa completa — o mapa inteiro antes de localizar onde voce esta.',
    },
    {
      num: '02',
      titulo: 'Abertura Intuitiva — O Espelho do Momento',
      texto: 'Feche os olhos, formule mentalmente uma questao ou simplesmente observe o que sente agora. Abra o livro em uma pagina qualquer. O arcano que surgir e um convite a reflexao — nao uma resposta definitiva.',
    },
    {
      num: '03',
      titulo: 'Arcano da Semana — Companheiro da Jornada',
      texto: 'Escolha um arcano por semana e permita que seus simbolos e perguntas acompanhem seu cotidiano. Observe o que ressoa, o que provoca, o que ilumina.',
    },
    {
      num: '04',
      titulo: 'Jornada Tematica — Aprofundamento',
      texto: 'Identifique o arquetipo que mais ressoa com sua fase atual e aprofunde-se nele. Use a pagina de reflexao para explorar esse tema com mais intencionalidade.',
    },
  ];

  for (const m of modos) {
    const boxH = 24;
    drawSectionBox(doc, M, y, CW, boxH);
    doc.setFontSize(14);
    sc(doc, C.GOLD_DEEP, 't');
    doc.setFont('times', 'bold');
    doc.text(m.num, M + 6, y + 8);
    doc.setFontSize(11);
    sc(doc, C.GOLD, 't');
    doc.setFont('times', 'bold');
    doc.text(m.titulo, M + 16, y + 8);
    doc.setFontSize(10);
    sc(doc, C.TEXTO, 't');
    doc.setFont('times', 'normal');
    const lines = doc.splitTextToSize(m.texto, CW - 20);
    let ty = y + 13;
    for (const l of lines) { doc.text(l, M + 6, ty); ty += 4.5; }
    y += boxH + 4;
  }

  y += 2;
  doc.setFontSize(10);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('A Carta do Dia da Zaya Tarot complementa qualquer uma dessas abordagens —', PW / 2, y, { align: 'center' });
  y += 5;
  doc.text('oferecendo um arcano diario para reflexao em zayatarot.com', PW / 2, y, { align: 'center' });
}

// ============================================================
// PG 4: SUMARIO ATUALIZADO
// ============================================================
function drawSummaryPageDev1(doc: jsPDF) {
  newPage(doc, 4);
  let y = 40;

  doc.setFontSize(22);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Os 22 Portais da Consciencia', PW / 2, y, { align: 'center' });
  y += 5;
  y = divider(doc, y) + 8;

  const bottomLimit = PH - 52;
  const itemH = (bottomLimit - y) / 11;
  const c1 = M + 8, c2 = PW / 2 + 5;

  doc.setFontSize(11);
  for (let i = 0; i < ARCANOS.length; i++) {
    const a = ARCANOS[i];
    const col = i < 11 ? 0 : 1;
    const row = i < 11 ? i : i - 11;
    const x = col === 0 ? c1 : c2;
    const ry = y + row * itemH;

    sc(doc, C.GOLD_DEEP, 't');
    doc.setFont('times', 'bold');
    doc.text(`${a.numero}`, x, ry);
    sc(doc, C.TEXTO, 't');
    doc.setFont('times', 'normal');
    doc.text(`${a.nome}`, x + 14, ry);
    doc.setFontSize(9);
    sc(doc, C.TEXTO_MUTED, 't');
    doc.setFont('times', 'italic');
    doc.text(a.arquetipo, x + 14, ry + 4.5);
    doc.setFontSize(11);
  }

  // Secoes adicionais no rodape do sumario
  const sy = bottomLimit + 4;
  sc(doc, C.BORDER_GOLD, 'd');
  doc.setLineWidth(0.2);
  doc.line(M, sy, PW - M, sy);
  doc.setFontSize(9);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  const addSections = [
    'Cada arcano: teoria + reflexao em paginas seguidas  (p. 5 a 48)',
    'A Tiragem da Jornada do Heroi  .................  p. 49',
    'Localizando-se na Jornada  .....................  p. 50',
    'Tarot como Ferramenta de Consciencia  .......  p. 51',
    'Quando o Livro se Fecha  .......................  p. 52',
  ];
  let asy = sy + 5;
  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  for (const s of addSections) {
    doc.text(s, PW / 2, asy, { align: 'center' });
    asy += 4.5;
  }
}

// ============================================================
// PAGINA DO ARCANO (teoria) - nomes de secao reformulados
// ============================================================
function drawArcanoV2(
  doc: jsPDF, arc: typeof ARCANOS[0], img: string | null, pg: number
): number {
  newPage(doc, pg);

  const maxY = PH - 22;
  const topY = 33;
  let y = topY;
  const textX = M + 3;
  const textW = CW - 6;

  doc.setFontSize(28);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text(arc.nome, PW / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(11);
  sc(doc, C.GOLD_DEEP, 't');
  doc.setFont('times', 'bold');
  doc.text(`Arcano ${arc.numero}`, PW / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(12);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text(arc.arquetipo, PW / 2, y, { align: 'center' });
  y += 4;

  sc(doc, C.BORDER_GOLD, 'd');
  doc.setLineWidth(0.3);
  doc.line(M + 15, y, PW - M - 15, y);
  y += 5;

  const imgW = 42, imgH = 67;
  if (img) {
    try {
      const imgX = (PW - imgW) / 2;
      sc(doc, C.BORDER_GOLD, 'd');
      doc.setLineWidth(0.6);
      doc.roundedRect(imgX - 1, y - 1, imgW + 2, imgH + 2, 1.5, 1.5, 'S');
      doc.addImage(img, 'JPEG', imgX, y, imgW, imgH);
      y += imgH + 5;
    } catch (_) { y += 5; }
  }

  const sections = [
    { title: 'Essencia do Arquetipo', text: arc.essencia, isBox: true },
    { title: 'Linguagem dos Simbolos', text: arc.simbolos, isBox: false },
    { title: 'Dimensao Psicologica', text: arc.psicologia, isBox: false },
    { title: 'Quando Este Arcano se Revela', text: arc.revelacao, isBox: false },
    { title: 'Integracao na Jornada', text: arc.integracao, isBox: false },
  ];

  const bodyLH = 4.8;
  const boxPadX = 5;
  const boxPadY = 3.5;
  const boxTextW = CW - boxPadX * 2 - 3;

  let totalContentH = 0;
  const sectionHeights: number[] = [];
  for (const sec of sections) {
    doc.setFontSize(11);
    const tH = textHeight(doc, sec.text, sec.isBox ? boxTextW : textW, bodyLH);
    const secH = sec.isBox ? boxPadY + 5.5 + tH + boxPadY : 5.5 + tH;
    sectionHeights.push(secH);
    totalContentH += secH;
  }

  const availableH = maxY - y;
  const baseGap = 4;
  const extraGap = Math.max(0, (availableH - totalContentH - baseGap * sections.length) / sections.length);
  const gap = Math.min(baseGap + extraGap, 10);

  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    if (sec.isBox) {
      const boxH = sectionHeights[si];
      drawSectionBox(doc, M, y, CW, boxH);
      const bx = M + boxPadX + 2;
      let by = y + boxPadY + 3.5;
      doc.setFontSize(12);
      sc(doc, C.GOLD, 't');
      doc.setFont('times', 'bold');
      doc.text(sec.title, bx, by);
      by += 5.5;
      doc.setFontSize(11);
      sc(doc, C.TEXTO, 't');
      doc.setFont('times', 'normal');
      wrapText(doc, sec.text, bx, by, boxTextW, bodyLH);
      y += boxH + gap;
    } else {
      doc.setFontSize(12);
      sc(doc, C.GOLD, 't');
      doc.setFont('times', 'bold');
      doc.text(sec.title, textX, y);
      y += 5.5;
      doc.setFontSize(11);
      sc(doc, C.TEXTO, 't');
      doc.setFont('times', 'normal');
      y = wrapText(doc, sec.text, textX, y, textW, bodyLH);
      y += gap;
    }
  }

  return pg;
}

// ============================================================
// PAGINA DE REFLEXAO E INTEGRACAO (pratica por arcano)
// ============================================================
function drawArcanoPratica(
  doc: jsPDF, arc: typeof ARCANOS[0], pg: number
): number {
  newPage(doc, pg);
  const textX = M + 3;
  const textW = CW - 6;
  const lh = 4.8;

  // --- Pre-calculate heights for vertical distribution ---
  doc.setFontSize(11);

  // Questions section
  let questionsBodyH = 0;
  for (const q of arc.reflexao) {
    questionsBodyH += doc.splitTextToSize('• ' + q, textW - 5).length * lh + 1;
  }
  questionsBodyH += 2;
  const questionsH = 5.5 + questionsBodyH; // header + body

  // Exploracao section
  doc.setFontSize(11);
  const exploracaoBodyH = textHeight(doc, arc.exploracao, textW, lh);
  const exploracaoH = 5.5 + exploracaoBodyH;

  // Afirmacao section (box)
  const afirmBoxInner = textHeight(doc, arc.afirmacao, CW - 12, lh) + 16;
  const afirmacaoH = afirmBoxInner;

  // Sinais + Caminhos (rendered together, last section)
  const sinaisBodyH = textHeight(doc, arc.sinais, textW, lh);
  const incorporacaoBodyH = textHeight(doc, arc.incorporacao, textW, lh);
  const sinaisCaminhosH = 5.5 + sinaisBodyH + 4 + 5.5 + incorporacaoBodyH;

  // Total section content heights (excluding dividers and gaps)
  const totalSectionsH = questionsH + exploracaoH + afirmacaoH + sinaisCaminhosH;

  // Available space from y=49 (after header separator) to bottom limit
  // Layout: halfGap | section | halfGap | divider(5) | halfGap | section | ... (7 half-gap slots)
  const yMax = PH - M - 8;
  const available = yMax - 49 - 3 * 5; // subtract 3x built-in divider offset (5mm each)
  const halfGap = Math.max(3, Math.min((available - totalSectionsH - 18) / 7, 12));
  // 18 = base internal gaps: 2(q botpad) + 3(expl botpad) + 3(afirm botpad) + 4(sinais botpad) + 6(sub-header gap)

  // --- Render ---
  let y = 33;

  // Titulo
  doc.setFontSize(22);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text(arc.nome, PW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(11);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('Reflexao e Integracao  —  ' + arc.arquetipo, PW / 2, y, { align: 'center' });
  y += 4;
  sc(doc, C.BORDER_GOLD, 'd');
  doc.setLineWidth(0.3);
  doc.line(M + 15, y, PW - M - 15, y);
  y += 5 + halfGap; // breathing room before first section

  // Perguntas para Reflexao
  doc.setFontSize(12);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Perguntas para Reflexao', textX, y);
  y += 5.5;
  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  for (const q of arc.reflexao) {
    const lines = doc.splitTextToSize('• ' + q, textW - 5);
    for (const l of lines) { doc.text(l, textX + 3, y); y += lh; }
    y += 1;
  }
  y += 1 + halfGap; // bottom breathing room before divider

  y = divider(doc, y) + halfGap; // top breathing room after divider

  // Exploracao Simbolica
  doc.setFontSize(12);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Exploracao Simbolica', textX, y);
  y += 5.5;
  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  y = wrapText(doc, arc.exploracao, textX, y, textW, lh);
  y += 2 + halfGap; // bottom breathing room before divider

  y = divider(doc, y) + halfGap; // top breathing room after divider

  // Afirmacao do Arquetipo
  drawSectionBox(doc, M, y, CW, afirmBoxInner);
  doc.setFontSize(12);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Afirmacao do Arquetipo', M + 7, y + 7);
  doc.setFontSize(11);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'italic');
  wrapText(doc, '"' + arc.afirmacao + '"', M + 7, y + 13, CW - 12, lh);
  y += afirmBoxInner + 2 + halfGap; // bottom breathing room before divider

  y = divider(doc, y) + halfGap; // top breathing room after divider

  // Sinais e Incorporacao
  doc.setFontSize(12);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Sinais da Presenca deste Arquetipo', textX, y);
  y += 5.5;
  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  y = wrapText(doc, arc.sinais, textX, y, textW, lh);
  y += 4;

  doc.setFontSize(12);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Caminhos de Incorporacao', textX, y);
  y += 5.5;
  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  wrapText(doc, arc.incorporacao, textX, y, textW, lh);

  return pg;
}

// ============================================================
// PG 49: TIRAGEM DA JORNADA DO HEROI
// ============================================================
function drawHeroSpreadPage(doc: jsPDF, pg: number) {
  newPage(doc, pg);
  let y = 35;

  doc.setFontSize(24);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('A Tiragem da Jornada do Heroi', PW / 2, y, { align: 'center' });
  y += 5;
  y = divider(doc, y) + 4;

  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'italic');
  y = wrapText(doc, 'Esta tiragem de sete posicoes e uma exploracao simbolica da sua jornada presente — nao uma previsao, mas um mapa narrativo que convida a reflexao. Use seu baralho de forma intuitiva, ou abra este livro em sete paginas aleatorias.', M + 4, y, CW - 8, 5.0);
  y += 6;

  const posicoes = [
    { n: '1', t: 'O Chamado', d: 'O que me convida a mover agora?' },
    { n: '2', t: 'O Obstaculo', d: 'O que encontro no caminho?' },
    { n: '3', t: 'O Recurso', d: 'O que tenho a minha disposicao?' },
    { n: '4', t: 'O Caminho', d: 'A direcao que emerge naturalmente.' },
    { n: '5', t: 'A Sombra', d: 'O que preciso reconhecer em mim?' },
    { n: '6', t: 'O Dom', d: 'O que posso oferecer e desenvolver?' },
    { n: '7', t: 'O Horizonte', d: 'Onde esta jornada pode me levar?' },
  ];

  // Cards em formato portrait (estilo carta de tarot): largura < altura
  const cardW = 35, cardH = 55;
  const gap = 4;

  // Primeira fileira: posicoes 1-4 (4 x 35 + 3 x 4 = 152mm, dentro de M=20 -> M+152+restante=20+152+38=210 ok)
  let rx = (PW - (4 * cardW + 3 * gap)) / 2;
  for (let i = 0; i < 4; i++) {
    const p = posicoes[i];
    drawSectionBox(doc, rx, y, cardW, cardH);
    // Numero centrado no topo do card
    doc.setFontSize(14);
    sc(doc, C.GOLD_DEEP, 't');
    doc.setFont('times', 'bold');
    doc.text(p.n, rx + cardW / 2, y + 9, { align: 'center' });
    // Linha separadora fina sob o numero
    sc(doc, C.BORDER_GOLD, 'd');
    doc.setLineWidth(0.2);
    doc.line(rx + 3, y + 12, rx + cardW - 3, y + 12);
    // Titulo
    doc.setFontSize(9.5);
    sc(doc, C.GOLD, 't');
    doc.setFont('times', 'bold');
    const tlines = doc.splitTextToSize(p.t, cardW - 6);
    let ty = y + 18;
    for (const tl of tlines) { doc.text(tl, rx + cardW / 2, ty, { align: 'center' }); ty += 4.5; }
    // Descricao
    doc.setFontSize(8);
    sc(doc, C.TEXTO_MUTED, 't');
    doc.setFont('times', 'italic');
    const dlines = doc.splitTextToSize(p.d, cardW - 6);
    let dy = ty + 2;
    for (const dl of dlines) { doc.text(dl, rx + cardW / 2, dy, { align: 'center' }); dy += 4; }
    rx += cardW + gap;
  }
  y += cardH + 6;

  // Segunda fileira: posicoes 5-7 (centradas, 3 x 35 + 2 x 4 = 113mm)
  rx = (PW - (3 * cardW + 2 * gap)) / 2;
  for (let i = 4; i < 7; i++) {
    const p = posicoes[i];
    drawSectionBox(doc, rx, y, cardW, cardH);
    doc.setFontSize(14);
    sc(doc, C.GOLD_DEEP, 't');
    doc.setFont('times', 'bold');
    doc.text(p.n, rx + cardW / 2, y + 9, { align: 'center' });
    sc(doc, C.BORDER_GOLD, 'd');
    doc.setLineWidth(0.2);
    doc.line(rx + 3, y + 12, rx + cardW - 3, y + 12);
    doc.setFontSize(9.5);
    sc(doc, C.GOLD, 't');
    doc.setFont('times', 'bold');
    const tlines = doc.splitTextToSize(p.t, cardW - 6);
    let ty = y + 18;
    for (const tl of tlines) { doc.text(tl, rx + cardW / 2, ty, { align: 'center' }); ty += 4.5; }
    doc.setFontSize(8);
    sc(doc, C.TEXTO_MUTED, 't');
    doc.setFont('times', 'italic');
    const dlines = doc.splitTextToSize(p.d, cardW - 6);
    let dy = ty + 2;
    for (const dl of dlines) { doc.text(dl, rx + cardW / 2, dy, { align: 'center' }); dy += 4; }
    rx += cardW + gap;
  }
  y += cardH + 8;

  // Instrucoes
  doc.setFontSize(11);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Como explorar esta tiragem', M + 4, y);
  y += 6;
  const instrucoes = [
    '1. Reserve um momento tranquilo e formule internamente: onde estou na minha jornada agora?',
    '2. Escolha as cartas de forma intuitiva — ou abra o livro em paginas aleatorias para cada posicao.',
    '3. Para cada posicao, leia o arcano correspondente e observe o que ressoa com sua situacao.',
    '4. Anote em seu caderno o que surgir — insights, emocoes, perguntas. Nao busque respostas definitivas.',
  ];
  doc.setFontSize(10.5);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  for (const inst of instrucoes) {
    y = wrapText(doc, inst, M + 4, y, CW - 8, 4.8);
    y += 2;
  }
}

// ============================================================
// PG 50: LOCALIZANDO-SE NA JORNADA DO HEROI
// ============================================================
function drawLocalizacaoPage(doc: jsPDF, pg: number) {
  newPage(doc, pg);
  let y = 35;

  doc.setFontSize(22);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Localizando-se na Jornada do Heroi', PW / 2, y, { align: 'center' });
  y += 5;
  y = divider(doc, y) + 4;

  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'italic');
  y = wrapText(doc, 'Voce nao esta em um unico arcano — voce pode estar em varios ao mesmo tempo. O objetivo nao e diagnosticar, mas observar. Aqui estao tres formas de identificar quais arquetipos estao mais ativos em sua jornada agora.', M + 4, y, CW - 8, 5.0);
  y += 6;

  const metodos = [
    {
      n: 'Metodo 1', t: 'Perguntas de Autoavaliacao',
      items: [
        'Como eu me sinto no geral neste momento da minha vida?',
        'Quais emocoes aparecem com mais frequencia nos meus dias?',
        'Estou em um momento de inicio, de crise, de transformacao ou de conclusao?',
        'O que me parece mais urgente ou importante agora?',
      ],
    },
    {
      n: 'Metodo 2', t: 'Revisao da Historia Recente',
      items: [
        'O que aconteceu nos ultimos 3 a 6 meses na minha vida?',
        'Quais padroes de mudanca, resistencia ou crescimento reconheco?',
        'O que comecou, terminou ou se transformou nesse periodo?',
      ],
    },
    {
      n: 'Metodo 3', t: 'Identificacao Simbolica',
      items: [
        'Leia os 22 titulos dos arquetipo no sumario.',
        'Qual ressoa mais com o que voce esta vivendo agora?',
        'Nao ha resposta certa — ha auto-percepcao.',
      ],
    },
  ];

  for (const m of metodos) {
    const boxH = 8 + m.items.length * 5.5;
    drawSectionBox(doc, M, y, CW, boxH);
    doc.setFontSize(10);
    sc(doc, C.GOLD_DEEP, 't');
    doc.setFont('times', 'bold');
    doc.text(m.n + '  —  ' + m.t, M + 6, y + 6);
    doc.setFontSize(10);
    sc(doc, C.TEXTO, 't');
    doc.setFont('times', 'normal');
    let iy = y + 11;
    for (const item of m.items) {
      doc.text('• ' + item, M + 8, iy);
      iy += 5.5;
    }
    y += boxH + 5;
  }

  y += 2;
  doc.setFontSize(10.5);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('Nao ha sistema rigido aqui — ha convidar para observar.', PW / 2, y, { align: 'center' });
  y += 5;
  sc(doc, C.TEXTO_MUTED, 't');
  doc.text('Os arcanos sao espelhos, nao diagnosticos. Confie no que ressoa.', PW / 2, y, { align: 'center' });
}

// ============================================================
// PG 51: TAROT COMO FERRAMENTA DE CONSCIENCIA + ARMADILHAS
// ============================================================
function drawDailyPracticePage(doc: jsPDF, pg: number) {
  newPage(doc, pg);
  let y = 35;

  doc.setFontSize(22);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Tarot como Ferramenta de Consciencia', PW / 2, y, { align: 'center' });
  y += 5;
  y = divider(doc, y) + 5;

  const praticas = [
    { t: 'O Espelho Diario', d: 'Uma carta por dia — nao para prever, mas para perguntar: que dimensao desta experiencia ressoa com o meu dia de hoje? Essa pergunta simples pode transformar uma imagem em insight.' },
    { t: 'Anotar para Compreender', d: 'Escreva suas reflexoes ao longo da leitura. Nao precisa ser profundo — basta ser honesto. O caderno de anotacoes e o espaco onde o invisivel ganha forma.' },
    { t: 'Ler o Cotidiano como Simbolo', d: 'Com o tempo, os arquetipos comecam a aparecer nas situacoes do dia a dia. Uma conversa dificil pode ter a energia da Torre. Um novo projeto, a energia do Louco. O tarot torna consciente o que ja estava ali.' },
  ];

  doc.setFontSize(12);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Tres Formas de Viver com os Arquetipos', M + 4, y);
  y += 6;

  doc.setFontSize(11);
  for (const p of praticas) {
    sc(doc, C.GOLD_LIGHT, 't');
    doc.setFont('times', 'bold');
    doc.text(p.t, M + 4, y);
    y += 5;
    sc(doc, C.TEXTO, 't');
    doc.setFont('times', 'normal');
    y = wrapText(doc, p.d, M + 4, y, CW - 8, 4.8);
    y += 5;
  }

  // Nota Zaya
  const notaH = 16;
  drawSectionBox(doc, M, y, CW, notaH);
  doc.setFontSize(10);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('O Arquivo Arcano da Zaya Tarot oferece leituras com inteligencia artificial para aprofundar', M + 6, y + 6);
  doc.text('sua compreensao dos arquetipos — em zayatarot.com', M + 6, y + 11);
  y += notaH + 8;

  // Armadilhas
  y = divider(doc, y) + 5;
  doc.setFontSize(14);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Armadilhas no Caminho do Estudante', M + 4, y);
  y += 7;

  const armadilhas = [
    { t: 'Buscar certeza onde ha simbolo', d: 'O Tarot oferece perspectivas, nao respostas absolutas. Quem busca certeza acaba fechado para o que o simbolo realmente tem a oferecer.' },
    { t: 'Memorizar sem sentir', d: 'Decorar significados sem conecta-los a propria experiencia cria um conhecimento vazio. O que transforma e a ressonancia pessoal, nao a teoria.' },
    { t: 'Ignorar o proprio contexto', d: 'Um mesmo arcano tem significados completamente diferentes dependendo de quem o consulta e do que esta vivendo. O contexto pessoal e sempre o mais importante.' },
  ];

  doc.setFontSize(11);
  for (const a of armadilhas) {
    sc(doc, C.GOLD_LIGHT, 't');
    doc.setFont('times', 'bold');
    doc.text('• ' + a.t, M + 4, y);
    y += 5;
    sc(doc, C.TEXTO, 't');
    doc.setFont('times', 'normal');
    y = wrapText(doc, a.d, M + 8, y, CW - 12, 4.8);
    y += 4;
  }
}

// ============================================================
// PG 52: QUANDO O LIVRO SE FECHA E A JORNADA CONTINUA
// ============================================================
function drawContinueJourneyPage(doc: jsPDF, pg: number) {
  newPage(doc, pg);
  let y = 35;

  doc.setFontSize(22);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Quando o Livro se Fecha', PW / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(15);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.text('e a Jornada Continua', PW / 2, y, { align: 'center' });
  y += 5;
  y = divider(doc, y) + 5;

  const paras = [
    'Voce chegou ao final deste livro — mas a Jornada do Heroi nao tem fim. Ela tem ciclos. O Mundo leva sempre de volta ao Louco, em um nivel mais profundo de consciencia. O que voce aprendeu aqui e o mapa — mas o territorio e a sua vida sendo vivida.',
    'O Tarot e uma linguagem que se torna mais rica quanto mais voce a usa. Nao porque voce aprende mais definicoes, mas porque começa a reconhecer os arquetipos nas situacoes do dia a dia — nos desafios, nas relacoes, nas decisoes que parecem pequenas mas que moldam quem voce e.',
    'A carta do dia nao e uma previsao. E um convite a reflexao: que dimensao da minha experiencia esse arquetipo ilumina hoje? Com o tempo, essa pergunta simples se torna uma forma de habitar a propria vida com mais consciencia.',
  ];

  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  const lh = 5.2;
  for (const p of paras) {
    y = wrapText(doc, p, M + 4, y, CW - 8, lh);
    y += 5;
  }

  y = divider(doc, y) + 5;

  // Card Zaya Tarot — calculate height dynamically
  const desc = 'Para quem quer continuar a exploracao dos arquetipos de forma personalizada e continua, a Zaya Tarot oferece uma experiencia moderna de acompanhamento espiritual:';
  const features = [
    'Tiragens personalizadas com analise de inteligencia artificial',
    'Carta do Dia entregue no WhatsApp — um arquetipo para cada amanhecer',
    'Historico da sua jornada — acompanhe sua evolucao ao longo do tempo',
    'Arquivo Arcano — aprofundamento em cada um dos 22 arquetipos',
  ];

  doc.setFontSize(10.5);
  const descLines = doc.splitTextToSize(desc, CW - 16).length;
  const cardH = 10 + descLines * 4.8 + 4 + features.length * 5.5 + 10; // title + desc + gap + features + url

  doc.setFillColor(C.SURFACE[0], C.SURFACE[1], C.SURFACE[2]);
  doc.roundedRect(M, y, CW, cardH, 3, 3, 'F');
  sc(doc, C.BORDER_GOLD, 'd');
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y, CW, cardH, 3, 3, 'S');

  doc.setFontSize(14);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('ZAYA TAROT — A Continuacao da Jornada', PW / 2, y + 10, { align: 'center' });

  doc.setFontSize(10.5);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  let dy = y + 17;
  dy = wrapText(doc, desc, M + 8, dy, CW - 16, 4.8);
  dy += 4;

  doc.setFontSize(10);
  for (const f of features) {
    doc.text('->  ' + f, M + 8, dy);
    dy += 5.5;
  }

  doc.setFontSize(11);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('zayatarot.com', PW / 2, dy + 4, { align: 'center' });
}

// ============================================================
// CONCLUSAO APRIMORADA
// ============================================================
function drawConclusion(doc: jsPDF, pg: number): number {
  pg++;
  newPage(doc, pg);
  let y = 30;

  doc.setFontSize(26);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('O Mundo — E Alem', PW / 2, y, { align: 'center' });
  y += 6;
  y = divider(doc, y) + 5;

  const texts = [
    'Voce chegou ao fim da jornada — ou seria ao comeco de um novo ciclo? O Mundo, o ultimo arcano, representa completude, mas nao conclusao definitiva. A figura danca na carta, celebrando a integracao de todas as experiencias, mas a danca nunca para — ela evolui.',
    'A jornada pelos 22 Arcanos Maiores e ciclica por natureza. Quando voce chega ao Mundo, esta pronto para retornar ao Louco — mas em um nivel mais profundo de consciencia. Cada ciclo traz mais sabedoria, mais integracao, mais plenitude.',
    'Os arquetipos do Tarot nao sao apenas simbolos antigos — sao mapas vivos da experiencia humana. Voce pode nao ter percebido, mas provavelmente ja atravessou cada uma dessas 22 fases em algum momento da sua historia.',
    'A questao nao e em qual arcano voce esta — e se voce esta consciente da jornada. Porque a consciencia transforma a experiencia de quem reage ao que acontece em quem participa ativamente da propria historia.',
  ];

  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  for (const t of texts) {
    y = wrapText(doc, t, M + 4, y, CW - 8, 5.2);
    y += 2;
  }

  doc.setFontSize(12);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Uma Ultima Reflexao', M + 4, y);
  y += 5;

  doc.setFontSize(11);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  y = wrapText(doc, 'Olhe para sua vida agora. Quais arquetipos voce reconhece? Onde esta o chamado do Louco? Onde voce precisa da forca gentil da carta VIII? Onde voce esta em meio a sua propria Torre? E onde, talvez, voce ja danca como o Mundo?', M + 4, y, CW - 8, 5.2);
  y += 4;

  y = divider(doc, y) + 4;

  doc.setFontSize(13);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'italic');
  doc.text('"A jornada nunca termina —', PW / 2, y, { align: 'center' });
  y += 6;
  doc.text('ela apenas se aprofunda."', PW / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(15);
  sc(doc, C.WHITE, 't');
  doc.setFont('times', 'bold');
  doc.text('ZAYA TAROT', PW / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('Arquivo Arcano  |  zayatarot.com', PW / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(9);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('Que esta jornada pelos 22 Arcanos ilumine seu caminho — e que o caminho continue.', PW / 2, y, { align: 'center' });

  return pg;
}

// ============================================================
// EXPORT PRINCIPAL
// ============================================================
export type EbookProgressCallback = (current: number, total: number, message: string) => void;

export async function generateEbookPdfDev1(onProgress: EbookProgressCallback): Promise<Blob> {
  const total = 22 + 6;
  let step = 0;

  // 1. Carregar imagens
  const imgs = new Map<string, string>();
  for (const [name, url] of Object.entries(CARD_IMAGES)) {
    step++;
    onProgress(step, total, `Carregando: ${name}...`);
    try { imgs.set(name, await loadImg(url)); } catch (_) { /* skip */ }
    await new Promise(r => setTimeout(r, 80));
  }

  // 2. PDF
  step++;
  onProgress(step, total, 'Gerando PDF...');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({
    title: 'Jornada do Heroi - Os 22 Arcanos Maiores (Desenvolvimento-1)',
    author: 'Zaya Tarot - Arquivo Arcano',
    creator: 'Zaya Tarot',
  });

  // 3. Capa
  drawCover(doc);

  // 4. Intro narrativa (Pg 2)
  step++;
  onProgress(step, total, 'Gerando introducao narrativa...');
  drawNarrativeIntro(doc);

  // 5. Como Habitar (Pg 3)
  drawHowToUsePage(doc);

  // 6. Sumario (Pg 4)
  drawSummaryPageDev1(doc);

  let pg = 4;

  // 7+8. Arcanos intercalados: teoria (pg impar) + reflexao (pg par) por arcano
  step++;
  onProgress(step, total, 'Gerando paginas dos arcanos...');
  for (const arc of ARCANOS) {
    pg++;
    pg = drawArcanoV2(doc, arc, imgs.get(arc.nome) || null, pg);
    pg++;
    pg = drawArcanoPratica(doc, arc, pg);
  }

  // 9. Tiragem (Pg 49)
  pg++;
  drawHeroSpreadPage(doc, pg);

  // 10. Localizacao (Pg 50)
  pg++;
  drawLocalizacaoPage(doc, pg);

  // 11. Pratica diaria (Pg 51)
  pg++;
  drawDailyPracticePage(doc, pg);

  // 12. Continuacao (Pg 52)
  pg++;
  drawContinueJourneyPage(doc, pg);

  // 13. Conclusao
  pg = drawConclusion(doc, pg);

  onProgress(total, total, 'Ebook Desenvolvimento-1 gerado com sucesso!');
  return doc.output('blob');
}

export function getEbookInfoDev1() {
  return {
    title: 'Jornada do Heroi — Os 22 Arcanos Maiores',
    description: 'Versao Desenvolvimento-1: conteudo enriquecido com reflexoes, exploracao simbolica, secoes adicionais e integracao Zaya Tarot.',
    pages: '~53 paginas',
    features: [
      'Introducao narrativa imersiva — "Este Livro Chegou ate Voce"',
      'Quatro formas de habitar o livro como experiencia',
      '22 paginas de teoria com secoes reformuladas',
      '22 paginas de Reflexao e Integracao por arcano',
      'Perguntas de reflexao, exploracao simbolica e afirmacoes',
      'Tiragem da Jornada do Heroi (7 posicoes)',
      'Localizando-se na Jornada — 3 metodos reflexivos',
      'Tarot como Ferramenta de Consciencia e Armadilhas',
      'Quando o Livro se Fecha — integracao natural Zaya Tarot',
    ],
    fileName: `zaya-tarot-jornada-heroi-dev1-${new Date().toISOString().split('T')[0]}.pdf`,
  };
}
