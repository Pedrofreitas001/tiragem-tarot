/**
 * Serviço de geração do Ebook Premium - Jornada do Herói
 * Estilo: Zaya Tarot (fundo roxo liso, fonte gold gradient, layout Arquivo Arcano)
 */
import jsPDF from 'jspdf';

// ============================================================
// CONSTANTES DE LAYOUT
// ============================================================
const PW = 210; // Page width A4 mm
const PH = 297; // Page height
const M = 20;   // Margin
const CW = PW - 2 * M; // Content width

// Cores fiéis ao site Zaya Tarot
// Gold gradient do hero: #fffebb → #e0c080 → #b88a44
const C = {
  BG:            [26, 10, 46]    as const,  // #1a0a2e  - fundo roxo liso
  SURFACE:       [26, 19, 32]    as const,  // #1a1320  - cards/boxes
  CARD_BG:       [30, 22, 40]    as const,  // #1e1628  - box sutil
  BORDER:        [135, 95, 175]  as const,  // #875faf  - bordas do site
  BORDER_GOLD:   [184, 138, 68]  as const,  // #b88a44  - borda dourada
  GOLD:          [224, 192, 128] as const,  // #e0c080  - gold principal (mid gradient)
  GOLD_LIGHT:    [255, 254, 187] as const,  // #fffebb  - gold claro (top gradient)
  GOLD_DEEP:     [184, 138, 68]  as const,  // #b88a44  - gold profundo (bottom gradient)
  ROXO_CLARO:    [167, 127, 212] as const,  // #a77fd4  - roxo claro/badge
  ROXO_MEDIO:    [91, 58, 143]   as const,  // #5B3A8F
  TEXTO:         [220, 215, 230] as const,  // #dcd7e6  - texto principal
  TEXTO_MUTED:   [160, 150, 175] as const,  // #a096af  - texto secundário
  WHITE:         [255, 255, 255] as const,
};

// URLs das imagens (Rider-Waite, domínio público)
const IMG_BASE = 'https://www.sacred-texts.com/tarot/pkt/img';
const CARD_IMAGES: Record<string, string> = {
  'O Louco': `${IMG_BASE}/ar00.jpg`, 'O Mago': `${IMG_BASE}/ar01.jpg`,
  'A Sacerdotisa': `${IMG_BASE}/ar02.jpg`, 'A Imperatriz': `${IMG_BASE}/ar03.jpg`,
  'O Imperador': `${IMG_BASE}/ar04.jpg`, 'O Hierofante': `${IMG_BASE}/ar05.jpg`,
  'Os Amantes': `${IMG_BASE}/ar06.jpg`, 'O Carro': `${IMG_BASE}/ar07.jpg`,
  'A Força': `${IMG_BASE}/ar08.jpg`, 'O Eremita': `${IMG_BASE}/ar09.jpg`,
  'A Roda da Fortuna': `${IMG_BASE}/ar10.jpg`, 'A Justiça': `${IMG_BASE}/ar11.jpg`,
  'O Enforcado': `${IMG_BASE}/ar12.jpg`, 'A Morte': `${IMG_BASE}/ar13.jpg`,
  'A Temperança': `${IMG_BASE}/ar14.jpg`, 'O Diabo': `${IMG_BASE}/ar15.jpg`,
  'A Torre': `${IMG_BASE}/ar16.jpg`, 'A Estrela': `${IMG_BASE}/ar17.jpg`,
  'A Lua': `${IMG_BASE}/ar18.jpg`, 'O Sol': `${IMG_BASE}/ar19.jpg`,
  'O Julgamento': `${IMG_BASE}/ar20.jpg`, 'O Mundo': `${IMG_BASE}/ar21.jpg`,
};

// ============================================================
// DADOS DOS 22 ARCANOS MAIORES
// ============================================================
const ARCANOS = [
  {
    numero: '0', nome: 'O Louco', arquetipo: 'O Chamado à Aventura',
    significado: 'O Louco representa o início da jornada, o momento de dar o primeiro passo no desconhecido. É a inocência, a espontaneidade e a coragem de começar sem garantias.',
    simbolos: 'O jovem à beira do precipício carrega uma pequena trouxa — tudo o que possui. O cão branco simboliza a intuição e a proteção. A rosa branca representa a pureza de intenção. O precipício não é um perigo, mas uma metáfora para o salto de fé.',
    psicologia: 'Psicologicamente, o Louco representa o ego antes da diferenciação, o estado de potencial puro. É a criança interior que ainda não foi condicionada pelas expectativas sociais. Espiritualmente, é o espírito livre buscando experiência.',
    vida_real: 'Este arquétipo aparece quando você está prestes a começar algo novo: um projeto, relacionamento, mudança de carreira. É aquele momento em que você sente que precisa dar um salto de fé, mesmo sem ter todas as respostas.',
    mensagem: 'Confie no processo. A jornada começa com um único passo. Não espere estar completamente preparado — a preparação acontece no caminho. Abrace o desconhecido com curiosidade e coragem.'
  },
  { numero: 'I', nome: 'O Mago', arquetipo: 'O Despertar do Poder Pessoal', significado: 'O Mago é o arquétipo da manifestação consciente. Representa o momento em que percebemos que temos recursos, habilidades e o poder de transformar nossa realidade.', simbolos: 'Os quatro elementos na mesa (copa, espada, moeda e cetro) representam domínio sobre água, ar, terra e fogo — as ferramentas necessárias para criar. O símbolo do infinito sobre sua cabeça indica consciência ilimitada. A vara erguida conecta o céu à terra.', psicologia: 'É a tomada de consciência do próprio potencial. O Mago representa a fase em que saímos da passividade e reconhecemos nossa agência no mundo. É o momento "Eu posso fazer isso acontecer".', vida_real: 'Surge quando você percebe suas capacidades e começa a usá-las conscientemente. Pode ser o início de um negócio, o desenvolvimento de uma habilidade, ou simplesmente perceber que você tem mais controle sobre sua vida do que imaginava.', mensagem: 'Você tem as ferramentas necessárias. O poder está em suas mãos. Comece a manifestar suas intenções através da ação consciente. "Como é acima, é embaixo" — seus pensamentos criam sua realidade.' },
  { numero: 'II', nome: 'A Sacerdotisa', arquetipo: 'A Guardiã do Inconsciente', significado: 'A Sacerdotisa representa o conhecimento intuitivo, os mistérios ocultos e a sabedoria que vem do silêncio. É o portal para o inconsciente.', simbolos: 'Sentada entre dois pilares (Boaz e Jachin — rigor e misericórdia), ela guarda o véu decorado com romãs, símbolo do inconsciente fértil. A lua aos seus pés representa ciclos e mistério. O pergaminho TORA em seu colo simboliza a lei divina.', psicologia: 'Representa o self feminino, a anima no sentido junguiano. É a parte de nós que sabe sem saber como sabe — a intuição profunda. Também simboliza o que ainda não está consciente, mas está se formando.', vida_real: 'Aparece quando precisamos parar de agir e começar a escutar. Momentos em que a resposta não vem da lógica, mas da intuição. Quando sonhos, sincronicidades e pressentimentos se tornam importantes.', mensagem: 'Nem tudo precisa ser explicado ou compreendido racionalmente. Confie em sua intuição. Há sabedoria no silêncio. Algumas coisas precisam amadurecer no escuro antes de virem à luz.' },
  { numero: 'III', nome: 'A Imperatriz', arquetipo: 'A Mãe Criadora', significado: 'A Imperatriz é a abundância, a fertilidade e a criação materializada. Representa o poder de nutrir, crescer e dar forma ao que foi semeado.', simbolos: 'Grávida, sentada em meio à natureza exuberante, ela usa uma coroa de 12 estrelas (os meses, os ciclos). O cetro simboliza seu domínio sobre o mundo material. O escudo com o símbolo de Vênus representa o amor e a beleza.', psicologia: 'É o arquétipo materno em sua forma criativa — não apenas no sentido biológico, mas em qualquer ato de nutrir e dar vida a projetos, ideias, relacionamentos. Representa a abundância que surge quando cuidamos com amor.', vida_real: 'Manifesta-se em momentos de crescimento, prosperidade e colheita. Quando um projeto floresce, quando cuidamos de algo ou alguém e vemos os frutos, quando nos conectamos com a natureza e a sensualidade da vida.', mensagem: 'Nutra o que você criou. A abundância é natural quando você cuida com amor. Conecte-se com o mundo material e seus prazeres. A criação é um ato de amor.' },
  { numero: 'IV', nome: 'O Imperador', arquetipo: 'O Construtor de Estruturas', significado: 'O Imperador representa a ordem, a autoridade e a estrutura. É o poder de organizar, governar e estabelecer fundações sólidas.', simbolos: 'Sentado em um trono de pedra decorado com carneiros (Áries, a força pioneira), ele segura o cetro e o orbe — símbolos de poder temporal. As montanhas ao fundo representam realizações sólidas e duradouras.', psicologia: 'É o princípio paterno, a autoridade interna. Representa a capacidade de criar estrutura, disciplina e ordem na própria vida. É o ego diferenciado que pode dizer "não" e estabelecer limites.', vida_real: 'Surge quando precisamos estabelecer rotinas, criar estruturas, assumir responsabilidades. Quando precisamos de disciplina para concretizar o que foi iniciado. Momentos de liderança e tomada de decisões estratégicas.', mensagem: 'Construa fundações sólidas. A ordem não é opressão — é a estrutura que permite o crescimento. Assuma sua autoridade. Lidere sua vida com responsabilidade e visão estratégica.' },
  { numero: 'V', nome: 'O Hierofante', arquetipo: 'O Mestre Espiritual', significado: 'O Hierofante é a ponte entre o divino e o humano, o portador da tradição e da sabedoria institucionalizada. Representa o ensino, a mentoria e os sistemas de crença.', simbolos: 'Sentado entre dois pilares (como a Sacerdotisa, mas agora no mundo externo), ele abençoa dois discípulos. As três cruzes representam os três mundos (material, emocional, espiritual). As chaves aos seus pés simbolizam os mistérios que ele pode revelar.', psicologia: 'Representa a necessidade de integrar-se a algo maior — uma tradição, comunidade ou sistema de crenças. É a fase em que buscamos mestres, guias e ensinamentos estruturados. Também pode indicar conformidade versus autenticidade.', vida_real: 'Aparece quando buscamos educação formal, mentoria espiritual ou quando nos conectamos com tradições. Também surge quando questionamos se estamos seguindo nossas verdades ou apenas repetindo dogmas.', mensagem: 'Honre a sabedoria que veio antes de você. Mas lembre-se: tradições servem para guiar, não para aprisionar. Busque mestres, mas mantenha seu discernimento. A verdadeira espiritualidade é pessoal.' },
  { numero: 'VI', nome: 'Os Amantes', arquetipo: 'A Grande Escolha', significado: 'Os Amantes representam escolhas, relacionamentos e a integração de opostos. É o momento de decisão consciente baseada em valores pessoais.', simbolos: 'Adão e Eva sob a bênção do Arcanjo Rafael. A árvore da vida atrás de Adão e a árvore do conhecimento atrás de Eva. O sol ao fundo representa consciência. É a escolha entre instinto e consciência.', psicologia: 'Representa a individuação através da relação. Não é apenas sobre romance, mas sobre qualquer escolha que define quem somos. É o momento de integrar aspectos opostos da personalidade — masculino/feminino, consciente/inconsciente.', vida_real: 'Surge em momentos de decisões importantes que definirão seu caminho. Pode ser uma escolha de relacionamento, carreira ou valores. É quando você precisa decidir baseado no que é verdadeiro para você, não no que é esperado.', mensagem: 'Faça escolhas conscientes alinhadas com seus valores. Relacionamentos exigem integração de opostos. Você é formado tanto pela luz quanto pela sombra — aceite ambos.' },
  { numero: 'VII', nome: 'O Carro', arquetipo: 'A Vitória Através da Determinação', significado: 'O Carro representa a conquista através da força de vontade, o movimento dirigido e a superação de conflitos internos.', simbolos: 'Um guerreiro em sua carruagem, puxada por duas esfinges (uma branca, uma preta — forças opostas). O cetro representa domínio, a armadura estrelar mostra proteção espiritual. O dossel de estrelas representa a influência celestial.', psicologia: 'É o ego fortalecido que pode direcionar impulsos conflitantes. Representa a capacidade de manter-se focado apesar das distrações. É disciplina interna transformada em progresso externo.', vida_real: 'Aparece quando você precisa avançar apesar das dificuldades. Quando forças opostas dentro de você precisam ser harmonizadas para seguir em frente. Momentos de determinação e foco.', mensagem: 'Mantenha o foco. Você tem controle sobre a direção de sua vida. Forças opostas dentro de você não precisam estar em conflito — podem trabalhar juntas. Avance com determinação.' },
  { numero: 'VIII', nome: 'A Força', arquetipo: 'A Coragem Compassiva', significado: 'A Força representa o poder que vem da compaixão, não da dominação. É a coragem de enfrentar o que é selvagem dentro de nós com gentileza.', simbolos: 'Uma mulher fechando suavemente a boca de um leão. O símbolo do infinito sobre sua cabeça mostra consciência ilimitada. A corrente de flores indica que o controle vem do amor, não da força bruta.', psicologia: 'Representa a integração dos instintos através da compaixão. Não é reprimir a natureza animal, mas integrá-la com consciência. É força verdadeira — aquela que vem da aceitação e do amor-próprio.', vida_real: 'Surge quando você precisa enfrentar seus medos, vícios ou aspectos selvagens da personalidade. Quando a raiva, o medo ou o desejo surgem e você escolhe não reprimi-los, mas integrá-los com consciência.', mensagem: 'Verdadeira força é gentil. Você não precisa dominar seus instintos — precisa entendê-los e integrá-los. Coragem não é ausência de medo, mas a capacidade de agir apesar dele.' },
  { numero: 'IX', nome: 'O Eremita', arquetipo: 'A Busca Interior', significado: 'O Eremita representa o retiro necessário, a busca interior e a sabedoria que vem da solidão. É o momento de virar-se para dentro.', simbolos: 'Um velho sábio no topo de uma montanha, segurando uma lanterna com uma estrela de seis pontas. O cajado representa apoio e autoridade espiritual. A neve representa purificação.', psicologia: 'É o processo de individuação que exige afastamento do coletivo. Representa a necessidade de solidão para encontrar respostas. É o momento de parar de buscar validação externa e olhar para dentro.', vida_real: 'Aparece quando você precisa de tempo sozinho para refletir. Momentos de retiro, meditação, autoanálise. Quando as respostas não virão de livros ou pessoas, mas do silêncio e da reflexão.', mensagem: 'Nem toda jornada é social. Às vezes você precisa se afastar para se encontrar. A sabedoria vem do silêncio. Ilumine seu próprio caminho antes de tentar iluminar o dos outros.' },
  { numero: 'X', nome: 'A Roda da Fortuna', arquetipo: 'Os Ciclos Inevitáveis', significado: 'A Roda da Fortuna representa os ciclos da vida, a impermanência e o destino que está além do controle individual.', simbolos: 'Uma roda girando, com símbolos alquímicos e hebraicos. Criaturas dos evangelhos nos cantos representam os elementos fixos. Anúbis sobe, Set desce — o que sobe, desce.', psicologia: 'Representa a aceitação da impermanência. É o reconhecimento de que há forças além do nosso controle. Também simboliza sincronicidades e o momento de reconhecer padrões cíclicos na vida.', vida_real: 'Surge em momentos de grande mudança — para melhor ou pior. Quando circunstâncias externas mudam dramaticamente. Quando você percebe padrões repetitivos em sua vida.', mensagem: 'Tudo é impermanente. O que está embaixo hoje pode estar em cima amanhã. Não se apegue à sorte nem desespere no azar. Há um ritmo maior na vida — aprenda a fluir com ele.' },
  { numero: 'XI', nome: 'A Justiça', arquetipo: 'O Equilíbrio e a Responsabilidade', significado: 'A Justiça representa causa e efeito, responsabilidade pessoal e a busca por equilíbrio. É o momento de colher o que foi plantado.', simbolos: 'Uma figura segurando uma espada (discernimento) e uma balança (equilíbrio). Os pilares representam a lei universal. O quadrado no peito simboliza a fundação terrena da justiça.', psicologia: 'Representa a confrontação com as consequências de nossas escolhas. É o superego maduro — não punitivo, mas equilibrado. Reconhecimento de que somos responsáveis por nossas vidas.', vida_real: 'Aparece quando você enfrenta consequências de ações passadas. Momentos de decisões importantes, contratos, acordos. Quando você precisa ser honesto sobre sua parte em situações.', mensagem: 'Você é responsável por suas escolhas. Justiça não é apenas sobre o que você recebe, mas sobre integridade em suas ações. Busque equilíbrio. O universo responde à energia que você emite.' },
  { numero: 'XII', nome: 'O Enforcado', arquetipo: 'O Sacrifício Necessário', significado: 'O Enforcado representa a suspensão voluntária, a mudança de perspectiva e o sacrifício que traz iluminação.', simbolos: 'Um homem pendurado de cabeça para baixo em uma árvore viva, mas sereno. O halo ao redor da cabeça indica iluminação. Pendurado por uma perna, a outra forma um "4" — estabilidade no caos.', psicologia: 'Representa o momento de parar de lutar e se render. É a fase em que a perspectiva antiga precisa ser invertida. O sacrifício do ego menor para o despertar do self maior.', vida_real: 'Surge quando você está preso em uma situação sem solução aparente. Quando lutar só piora as coisas. Momentos de espera forçada, crises existenciais. Quando você precisa ver tudo de um ângulo diferente.', mensagem: 'Às vezes, parar é a ação mais poderosa. Nem tudo pode ser resolvido pela força. Mudanças de perspectiva vêm da suspensão do conhecido. O que parece sacrifício pode ser libertação.' },
  { numero: 'XIII', nome: 'A Morte', arquetipo: 'A Transformação Inevitável', significado: 'A Morte não é o fim, mas a transformação profunda. Representa o que precisa morrer para que o novo nasça.', simbolos: 'Um esqueleto cavaleiro com uma bandeira branca (pureza) e uma rosa (vida após a morte). O sol nascente entre os pilares ao fundo. Pessoas de todas as classes sociais caem — a morte não discrimina.', psicologia: 'Representa o fim de identidades, crenças ou padrões que não servem mais. É a morte psicológica necessária para o renascimento. O luto pelo que foi, abrindo espaço para o que virá.', vida_real: 'Aparece em finais definitivos — término de relacionamentos, perda de empregos, mudanças de identidade. Quando uma fase da vida termina completamente. Momentos de transformação radical.', mensagem: 'Fim não é fracasso. Algumas coisas precisam morrer para que você possa crescer. Solte o que já não serve. A transformação pode ser dolorosa, mas é necessária. Confie no ciclo.' },
  { numero: 'XIV', nome: 'A Temperança', arquetipo: 'A Alquimia da Alma', significado: 'A Temperança representa equilíbrio, paciência e a integração harmoniosa de opostos. É o processo de refinamento.', simbolos: 'Um anjo com um pé na água e outro na terra, misturando líquidos entre duas taças. O triângulo no peito representa fogo, a coroa quadrada representa terra. Íris (mensageira) no fundo.', psicologia: 'Após a morte (transformação), vem a temperança (integração). É o processo de equilibrar extremos, de encontrar o meio-termo. Representa a alquimia interior — transformar chumbo em ouro.', vida_real: 'Surge em períodos de cura após crises. Quando você precisa de paciência para integrar mudanças. Momentos de buscar equilíbrio entre trabalho e vida, razão e emoção, material e espiritual.', mensagem: 'Paciência é a virtude do sábio. A verdadeira mudança é gradual. Equilibre seus opostos internos. A cura acontece gota a gota. Confie no processo de refinamento.' },
  { numero: 'XV', nome: 'O Diabo', arquetipo: 'A Sombra e o Aprisionamento', significado: 'O Diabo representa nossas prisões autoimposas, vícios, medos e a sombra que negamos. É o que nos mantém acorrentados.', simbolos: 'Uma figura demoníaca com casal acorrentado — mas as correntes são frouxas. Chifres e asas representam a natureza animal. O pentagrama invertido simboliza priorização do material sobre o espiritual.', psicologia: 'É o confronto com a sombra junguiana — os aspectos que negamos em nós mesmos. Representa compulsões, vícios, relacionamentos tóxicos. O que mais tememos reconhecer em nós.', vida_real: 'Aparece em vícios, padrões destrutivos, relacionamentos codependentes. Quando você se sente preso mas é, em parte, cúmplice de sua prisão. Momentos de enfrentar a sombra.', mensagem: 'Você tem mais liberdade do que pensa. Suas correntes são, em grande parte, autoimposas. Enfrente sua sombra — o que você nega, controla você. Vícios são sintomas, não causas. Liberte-se.' },
  { numero: 'XVI', nome: 'A Torre', arquetipo: 'A Destruição Necessária', significado: 'A Torre representa o colapso de estruturas falsas, revelações súbitas e a destruição que precede a reconstrução.', simbolos: 'Uma torre sendo destruída por um raio, figuras caindo. A coroa no topo cai — ilusões de controle. O raio vem do céu — é uma intervenção do divino/destino.', psicologia: 'Representa o colapso do ego inflado, a destruição de ilusões. É o momento em que estruturas mentais falsas são demolidas. Pode ser traumático, mas é libertador.', vida_real: 'Surge em crises súbitas, revelações chocantes, perdas inesperadas. Quando tudo que você construiu sobre fundações falsas desmorona. Momentos de colapso que forçam reconstrução.', mensagem: 'Às vezes, o universo destrói o que você construiu porque estava sobre fundações falsas. Não é punição — é libertação. O que é verdadeiro sobrevive. Reconstrua sobre a verdade.' },
  { numero: 'XVII', nome: 'A Estrela', arquetipo: 'A Esperança Renovada', significado: 'A Estrela representa esperança, inspiração e renovação após a crise. É a cura e a conexão com algo maior.', simbolos: 'Uma mulher nua despejando água em um rio e na terra. Oito estrelas — luz eterna. O pássaro representa pensamentos elevados. A nudez simboliza vulnerabilidade autêntica e pureza.', psicologia: 'Após a destruição da Torre, vem a esperança da Estrela. É o momento de cura, de reconexão com o self autêntico. Representa inspiração e fé renovadas.', vida_real: 'Aparece em períodos de recuperação após crises. Quando você sente esperança novamente. Momentos de inspiração, de sentir-se guiado. Quando a cura verdadeira começa.', mensagem: 'Sempre há esperança. Após a escuridão, vem a luz. Você está sendo guiado. Cure-se. Conecte-se com algo maior que você. O universo conspira a seu favor.' },
  { numero: 'XVIII', nome: 'A Lua', arquetipo: 'A Jornada pelo Inconsciente', significado: 'A Lua representa ilusão, medo, o inconsciente profundo e a jornada através da escuridão psíquica.', simbolos: 'Dois cães uivando para a lua, um caminho entre duas torres levando ao desconhecido. Um lagostim emerge da água. A lua goteja — nutrição do psíquico.', psicologia: 'Representa a descida ao inconsciente profundo. Medos, ilusões, memórias reprimidas. É a noite escura da alma. O território entre o conhecido e o desconhecido.', vida_real: 'Surge em períodos de confusão, ansiedade, quando você não confia em suas percepções. Pesadelos, medos irracionais. Quando tudo parece incerto e ameaçador.', mensagem: 'Nem tudo é o que parece. Seus medos podem ser ilusões. Atravesse a noite com coragem — há sabedoria na escuridão. O que você teme pode ser um guia. Continue caminhando.' },
  { numero: 'XIX', nome: 'O Sol', arquetipo: 'A Iluminação e a Alegria', significado: 'O Sol representa clareza, vitalidade, sucesso e a alegria simples de existir. É a luz após a escuridão.', simbolos: 'Um sol radiante, uma criança nua em um cavalo branco. Girassóis voltados para a luz. A bandeira vermelha representa vitalidade. Tudo está claro e iluminado.', psicologia: 'Após atravessar a Lua, você emerge no Sol — consciência clara, ego saudável, alegria autêntica. Representa o self integrado brilhando.', vida_real: 'Aparece em momentos de sucesso, clareza, alegria. Quando tudo faz sentido. Quando você se sente vivo, vital, autêntico. Momentos de celebração merecida.', mensagem: 'Você merece celebrar. A vida pode ser simples e alegre. Você atravessou a escuridão e emergiu mais forte. Brilhe. Compartilhe sua luz. A clareza chegou.' },
  { numero: 'XX', nome: 'O Julgamento', arquetipo: 'O Despertar e o Chamado', significado: 'O Julgamento representa o despertar final, a avaliação honesta de si mesmo e o chamado para um propósito maior.', simbolos: 'Um anjo tocando trombeta, pessoas surgindo de caixões com braços abertos. Montanhas ao fundo. Cruz na bandeira — morte e ressurreição. É o chamado final para despertar.', psicologia: 'Representa a integração de todas as experiências da jornada. É o momento de avaliar honestamente quem você se tornou. O chamado para viver seu propósito autêntico.', vida_real: 'Surge em momentos de grande clareza sobre seu propósito. Quando você ouve um "chamado" inegável. Momentos de renascimento, de deixar o passado morto e abraçar nova vida.', mensagem: 'É hora de despertar completamente. Avalie sua jornada com honestidade. Perdoe-se. Responda ao chamado de sua alma. Você renasceu. Viva de acordo com sua verdade.' },
  { numero: 'XXI', nome: 'O Mundo', arquetipo: 'A Completude e a Realização', significado: 'O Mundo representa a completude, a integração total e a realização. É o fim de um ciclo e o início de outro em um nível superior.', simbolos: 'Uma figura dançante, nua, em uma grinalda de louros. Os quatro evangelhos nos cantos — integração total dos elementos. As fitas formam um infinito. Tudo está completo.', psicologia: 'É a individuação completa no sentido junguiano. O self integrado dançando. Todas as partes reconciliadas. A jornada completa — mas não o fim definitivo.', vida_real: 'Aparece em momentos de conclusão significativa. Quando um ciclo grande se fecha. Quando você alcança uma meta importante. A sensação de "cheguei" — sabendo que novos ciclos virão.', mensagem: 'Você completou a jornada. Celebre sua realização. Mas lembre-se: o fim é sempre um novo começo. O Mundo leva de volta ao Louco. A dança continua eternamente.' },
];

// ============================================================
// HELPERS
// ============================================================

type RGB = readonly [number, number, number];
const sc = (doc: jsPDF, c: RGB, t: 'f' | 't' | 'd') => {
  if (t === 'f') doc.setFillColor(c[0], c[1], c[2]);
  else if (t === 't') doc.setTextColor(c[0], c[1], c[2]);
  else doc.setDrawColor(c[0], c[1], c[2]);
};

// Fundo roxo liso (flat, sem gradiente)
function bg(doc: jsPDF) {
  sc(doc, C.BG, 'f');
  doc.rect(0, 0, PW, PH, 'F');
}

// Header padrão de todas as páginas internas
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

// Footer padrão
function footer(doc: jsPDF, pg: number) {
  sc(doc, C.BORDER, 'd');
  doc.setLineWidth(0.15);
  doc.line(M + 30, PH - 16, PW - M - 30, PH - 16);
  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text(`${pg}`, PW / 2, PH - 11, { align: 'center' });
  doc.setFontSize(7);
  doc.text('zayatarot.com', PW / 2, PH - 7, { align: 'center' });
}

// Nova página base
function newPage(doc: jsPDF, pg: number) {
  doc.addPage();
  bg(doc);
  header(doc);
  footer(doc, pg);
}

// Box com borda dourada à esquerda (estilo card do site)
function drawSectionBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  // Fundo sutil
  doc.setFillColor(C.SURFACE[0], C.SURFACE[1], C.SURFACE[2]);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  // Borda exterior roxa sutil
  sc(doc, C.BORDER, 'd');
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');
  // Barra dourada à esquerda
  sc(doc, C.BORDER_GOLD, 'f');
  doc.rect(x, y + 2, 1.2, h - 4, 'F');
}

// Escreve texto com word-wrap, retorna y final
function wrapText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lh: number): number {
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    doc.text(line, x, y);
    y += lh;
  }
  return y;
}

// Calcula altura de texto wrapped
function textHeight(doc: jsPDF, text: string, maxW: number, lh: number): number {
  return doc.splitTextToSize(text, maxW).length * lh;
}

// Divider decorativo
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

// Carrega imagem como base64 via proxy
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

// ============================================================
// MOCKUP: Deck em arco (C virado para baixo)
// ============================================================
async function createDeckMockup(imgs: Map<string, string>): Promise<string> {
  const cv = document.createElement('canvas');
  cv.width = 900; cv.height = 420;
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, 900, 420);

  // Glow roxo ao fundo
  const g1 = ctx.createRadialGradient(450, 350, 40, 450, 350, 380);
  g1.addColorStop(0, 'rgba(147, 17, 212, 0.45)');
  g1.addColorStop(0.4, 'rgba(91, 58, 143, 0.2)');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 900, 420);

  // 7 cartas distribuidas num arco (C invertido = abertura para baixo)
  // Ponto de pivô: centro superior, cartas se abrem para baixo formando um leque
  const names = ['O Hierofante', 'O Mago', 'A Sacerdotisa', 'O Louco', 'A Imperatriz', 'O Imperador', 'Os Amantes'];
  const cardW = 88, cardH = 140;
  const cx = 450, pivotY = -80; // pivô acima do canvas
  const radius = 330;
  const totalArc = 70; // graus totais do arco
  const startAngle = 90 - totalArc / 2; // centrado em 90° (para baixo)

  for (let i = 0; i < names.length; i++) {
    const imgData = imgs.get(names[i]);
    if (!imgData) continue;

    const img = new (window.Image || Image)();
    await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); img.src = imgData; });
    if (!img.width) continue;

    const angle = startAngle + (totalArc / (names.length - 1)) * i;
    const rad = (angle * Math.PI) / 180;
    const posX = cx + Math.cos(rad) * radius;
    const posY = pivotY + Math.sin(rad) * radius;
    const rotation = angle - 90; // rotação tangencial

    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Sombra roxa
    ctx.shadowColor = 'rgba(147, 17, 212, 0.6)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Borda dourada
    ctx.fillStyle = '#b88a44';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2 - 2.5, -cardH / 2 - 2.5, cardW + 5, cardH + 5, 5);
    ctx.fill();

    // Imagem
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 3);
    ctx.clip();
    ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
    ctx.restore();
  }

  return cv.toDataURL('image/png', 0.95);
}

// ============================================================
// CAPA
// ============================================================
function drawCover(doc: jsPDF, mockup: string | null) {
  bg(doc);

  // Borda decorativa fina
  sc(doc, C.BORDER, 'd');
  doc.setLineWidth(0.3);
  doc.rect(12, 12, PW - 24, PH - 24);
  // Cantos dourados
  const cn = 14, cs = 10;
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.5);
  doc.line(cn, cn, cn + cs, cn); doc.line(cn, cn, cn, cn + cs);
  doc.line(PW - cn, cn, PW - cn - cs, cn); doc.line(PW - cn, cn, PW - cn, cn + cs);
  doc.line(cn, PH - cn, cn + cs, PH - cn); doc.line(cn, PH - cn, cn, PH - cn - cs);
  doc.line(PW - cn, PH - cn, PW - cn - cs, PH - cn); doc.line(PW - cn, PH - cn, PW - cn, PH - cn - cs);

  // Branding topo
  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'italic');
  doc.text('Um ebook exclusivo por', PW / 2, 36, { align: 'center' });

  doc.setFontSize(18);
  sc(doc, C.WHITE, 't');
  doc.setFont('times', 'bold');
  doc.text('ZAYA TAROT', PW / 2, 47, { align: 'center' });

  // Linhas douradas
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.6);
  doc.line(65, 52, PW - 65, 52);
  doc.setLineWidth(0.2);
  doc.line(75, 54, PW - 75, 54);

  // Titulo principal - estilo gold do hero (Crimson Text = times serif)
  doc.setFontSize(42);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Jornada do Heroi', PW / 2, 74, { align: 'center' });

  // Subtitulo
  doc.setFontSize(15);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'normal');
  doc.text('Os 22 Arcanos Maiores do Tarot', PW / 2, 86, { align: 'center' });

  // Mockup de cartas
  if (mockup) {
    try { doc.addImage(mockup, 'PNG', 10, 95, 190, 89); } catch (_) { /* fallback */ }
  }

  // Descricao
  doc.setFontSize(12);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'italic');
  doc.text('Uma jornada de autoconhecimento atraves', PW / 2, 198, { align: 'center' });
  doc.text('dos arquetipos ancestrais do Tarot', PW / 2, 207, { align: 'center' });

  // Separador
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.3);
  doc.line(55, 216, PW - 55, 216);

  // Arquivo Arcano
  doc.setFontSize(11);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('ARQUIVO ARCANO', PW / 2, 226, { align: 'center' });

  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('Material exclusivo para desenvolvimento pessoal e espiritual', PW / 2, 234, { align: 'center' });

  // Footer
  doc.setFontSize(7);
  sc(doc, C.ROXO_MEDIO, 't');
  doc.text('zayatarot.com', PW / 2, PH - 18, { align: 'center' });
}

// ============================================================
// INTRODUÇÃO
// ============================================================
function drawIntro(doc: jsPDF): number {
  newPage(doc, 2);
  let y = 30;

  // Titulo
  doc.setFontSize(26);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('A Jornada do Heroi no Tarot', PW / 2, y, { align: 'center' });
  y += 6;
  y = divider(doc, y) + 4;

  const intros = [
    'Os 22 Arcanos Maiores do Tarot sao muito mais do que simples cartas de adivinhacao. Eles representam uma jornada completa de desenvolvimento humano — desde o Louco, que da o primeiro passo no desconhecido, ate o Mundo, que danca na completude da realizacao.',
    'Esta e a Jornada do Heroi, o mito universal descrito por Joseph Campbell, mas codificado nos simbolos ancestrais do Tarot. Cada arcano representa um estagio arquetipico — desafios, realizacoes, provacoes e revelacoes que todos nos enfrentamos em nossa evolucao pessoal e espiritual.',
    'Neste ebook, voce descobrira como cada uma das 22 cartas reflete aspectos profundos de sua propria jornada. Nao importa onde voce esteja agora — em algum ponto, voce ja viveu ou vivera cada um desses arquetipos. O Tarot e um mapa da consciencia humana.',
    'Prepare-se para uma jornada de autoconhecimento. Cada arcano oferece nao apenas conhecimento simbolico, mas insights praticos sobre como esses arquetipos aparecem em sua vida cotidiana — e como voce pode trabalhar conscientemente com eles.',
  ];

  doc.setFontSize(12);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  for (const t of intros) {
    y = wrapText(doc, t, M + 4, y, CW - 8, 5.8);
    y += 4;
  }

  y += 2;
  y = divider(doc, y) + 5;

  // Citacao Jung
  doc.setFontSize(14);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'italic');
  doc.text('"O privilegio de uma vida e', PW / 2, y, { align: 'center' });
  y += 7;
  doc.text('tornar-se quem voce realmente e."', PW / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(11);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('— Carl Gustav Jung', PW / 2, y, { align: 'center' });
  y += 10;

  y = divider(doc, y) + 6;

  // Sumario
  doc.setFontSize(18);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Os 22 Portais da Consciencia', PW / 2, y, { align: 'center' });
  y += 9;

  doc.setFontSize(10);
  const c1 = M + 6, c2 = PW / 2 + 4;

  for (let i = 0; i < ARCANOS.length; i++) {
    const a = ARCANOS[i];
    const x = i < 11 ? c1 : c2;
    const ry = i < 11 ? y + i * 6.5 : y + (i - 11) * 6.5;

    sc(doc, C.GOLD_DEEP, 't');
    doc.setFont('times', 'bold');
    doc.text(`${a.numero}`, x, ry);

    sc(doc, C.TEXTO, 't');
    doc.setFont('times', 'normal');
    doc.text(`${a.nome}  —  ${a.arquetipo}`, x + 14, ry);
  }

  return 3;
}

// ============================================================
// PÁGINA DO ARCANO (estilo Arquivo Arcano)
// ============================================================
function drawArcano(
  doc: jsPDF, arc: typeof ARCANOS[0], img: string | null, pg: number
): number {
  newPage(doc, pg);

  const maxY = PH - 22;
  let y = 28;

  // ---- TOPO: Imagem centralizada ----
  const imgW = 44, imgH = 70;

  if (img) {
    try {
      const imgX = (PW - imgW) / 2;
      // Borda dourada + sombra
      sc(doc, C.BORDER_GOLD, 'd');
      doc.setLineWidth(0.6);
      doc.roundedRect(imgX - 1, y - 1, imgW + 2, imgH + 2, 1.5, 1.5, 'S');

      // Sombra roxa simulada
      doc.setGState(doc.GState({ opacity: 0.25 }));
      doc.setFillColor(C.ROXO_MEDIO[0], C.ROXO_MEDIO[1], C.ROXO_MEDIO[2]);
      doc.roundedRect(imgX + 1.5, y + 2, imgW, imgH, 1.5, 1.5, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));

      doc.addImage(img, 'JPEG', imgX, y, imgW, imgH);
      y += imgH + 4;
    } catch (_) {
      y += 4;
    }
  }

  // ---- NOME DA CARTA (estilo gold do hero) ----
  doc.setFontSize(30);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text(arc.nome, PW / 2, y, { align: 'center' });
  y += 5;

  // Numero romano pequeno
  doc.setFontSize(12);
  sc(doc, C.GOLD_DEEP, 't');
  doc.setFont('times', 'bold');
  doc.text(`Arcano ${arc.numero}`, PW / 2, y, { align: 'center' });
  y += 5;

  // Arquetipo
  doc.setFontSize(13);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text(arc.arquetipo, PW / 2, y, { align: 'center' });
  y += 4;

  // Linha dourada separadora
  sc(doc, C.BORDER_GOLD, 'd');
  doc.setLineWidth(0.4);
  doc.line(M + 15, y, PW - M - 15, y);
  y += 7;

  // ---- SEÇÕES em boxes estilizados ----
  const sections = [
    { title: 'Significado Essencial', text: arc.significado },
    { title: 'Simbologia da Carta', text: arc.simbolos },
    { title: 'Contexto Psicologico e Espiritual', text: arc.psicologia },
    { title: 'Como Aparece na Vida Real', text: arc.vida_real },
    { title: 'Mensagem de Evolucao', text: arc.mensagem },
  ];

  const boxPadX = 5;
  const boxPadY = 4;
  const boxTextW = CW - boxPadX * 2 - 3; // -3 para a barra lateral
  const bodyLH = 5;
  const titleLH = 6;

  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];

    // Calcular altura necessaria
    const titleH = titleLH;
    const bodyH = textHeight(doc, sec.text, boxTextW, bodyLH);
    const boxH = boxPadY + titleH + 2 + bodyH + boxPadY;

    // Se não cabe, nova página
    if (y + boxH + 4 > maxY) {
      pg++;
      newPage(doc, pg);
      y = 28;

      // Continuação header
      doc.setFontSize(12);
      sc(doc, C.ROXO_CLARO, 't');
      doc.setFont('times', 'italic');
      doc.text(`${arc.nome} (continuacao)`, PW / 2, y, { align: 'center' });
      y += 8;
    }

    // Desenha box
    drawSectionBox(doc, M, y, CW, boxH);

    // Titulo da seção
    const txtX = M + boxPadX + 2;
    let ty = y + boxPadY + 4;

    doc.setFontSize(12);
    sc(doc, C.GOLD, 't');
    doc.setFont('times', 'bold');
    doc.text(sec.title, txtX, ty);
    ty += titleLH;

    // Corpo do texto
    doc.setFontSize(11);
    sc(doc, C.TEXTO, 't');
    doc.setFont('times', 'normal');
    ty = wrapText(doc, sec.text, txtX, ty, boxTextW, bodyLH);

    y += boxH + 4;
  }

  // ---- CITAÇÃO ZAYA no final (se couber) ----
  const quoteBoxH = 20;
  if (y + quoteBoxH + 4 < maxY) {
    y += 2;
    // Box dourado especial
    doc.setFillColor(C.CARD_BG[0], C.CARD_BG[1], C.CARD_BG[2]);
    doc.roundedRect(M, y, CW, quoteBoxH, 2, 2, 'F');
    sc(doc, C.GOLD_DEEP, 'd');
    doc.setLineWidth(0.4);
    doc.roundedRect(M, y, CW, quoteBoxH, 2, 2, 'S');

    doc.setFontSize(8);
    sc(doc, C.GOLD_DEEP, 't');
    doc.setFont('times', 'bold');
    doc.text('ZAYA TAROT', M + 5, y + 5);

    doc.setFontSize(10);
    sc(doc, C.GOLD_LIGHT, 't');
    doc.setFont('times', 'italic');
    const q = arc.mensagem.length > 130 ? arc.mensagem.substring(0, 130) + '...' : arc.mensagem;
    const ql = doc.splitTextToSize(`"${q}"`, CW - 10);
    doc.text(ql, M + 5, y + 11);
  }

  return pg;
}

// ============================================================
// CONCLUSÃO
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
    'Voce chegou ao fim da jornada — ou seria ao comeco? O Mundo, o ultimo arcano, representa completude, mas nao conclusao definitiva. A figura danca na carta, celebrando a integracao de todas as experiencias, mas a danca nunca para.',
    'A jornada pelos 22 Arcanos Maiores e ciclica. Quando voce chega ao Mundo, esta pronto para comecar novamente como o Louco — mas em um nivel superior de consciencia. Cada ciclo traz mais sabedoria, mais integracao, mais plenitude.',
    'Os arquetipos do Tarot nao sao apenas simbolos antigos — sao mapas vivos de sua propria psique. Voce pode nao estar consciente, mas provavelmente ja viveu cada uma dessas 22 etapas em algum momento de sua vida.',
    'A pergunta nao e "em qual arcano voce esta?" — porque voce pode estar em varios ao mesmo tempo. A pergunta e: "Voce esta consciente da jornada?" Porque a consciencia transforma a experiencia de vitima das circunstancias em heroi da propria historia.',
  ];

  doc.setFontSize(12);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  for (const t of texts) {
    y = wrapText(doc, t, M + 4, y, CW - 8, 5.8);
    y += 4;
  }

  y += 2;

  // Reflexao final
  doc.setFontSize(13);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('Reflexao Final', M + 4, y);
  y += 6;

  doc.setFontSize(12);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'normal');
  y = wrapText(doc, 'Olhe para sua vida agora. Quais arcanos voce reconhece? Onde esta o chamado do Louco? Onde voce precisa da forca compassiva da carta VIII? Onde voce esta enfrentando sua Torre? E onde, talvez, voce ja danca como o Mundo?', M + 4, y, CW - 8, 5.8);
  y += 8;

  y = divider(doc, y) + 6;

  // Citacao final
  doc.setFontSize(14);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'italic');
  doc.text('"A jornada nunca termina —', PW / 2, y, { align: 'center' });
  y += 7;
  doc.text('ela apenas se transforma. Continue dancando."', PW / 2, y, { align: 'center' });
  y += 14;

  // Branding final
  doc.setFontSize(16);
  sc(doc, C.WHITE, 't');
  doc.setFont('times', 'bold');
  doc.text('ZAYA TAROT', PW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('Arquivo Arcano  |  zayatarot.com', PW / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('Que esta jornada pelos 22 Arcanos Maiores ilumine seu caminho.', PW / 2, y, { align: 'center' });

  return pg;
}

// ============================================================
// EXPORT PRINCIPAL
// ============================================================
export type EbookProgressCallback = (current: number, total: number, message: string) => void;

export async function generateEbookPdf(onProgress: EbookProgressCallback): Promise<Blob> {
  const total = 22 + 5;
  let step = 0;

  // 1. Carregar imagens
  const imgs = new Map<string, string>();
  for (const [name, url] of Object.entries(CARD_IMAGES)) {
    step++;
    onProgress(step, total, `Carregando: ${name}...`);
    try { imgs.set(name, await loadImg(url)); } catch (_) { /* skip */ }
    await new Promise(r => setTimeout(r, 80));
  }

  // 2. Mockup
  step++;
  onProgress(step, total, 'Criando mockup do deck...');
  let mockup: string | null = null;
  try { mockup = await createDeckMockup(imgs); } catch (_) { /* skip */ }

  // 3. PDF
  step++;
  onProgress(step, total, 'Gerando PDF...');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({
    title: 'Jornada do Heroi - Os 22 Arcanos Maiores do Tarot',
    author: 'Zaya Tarot - Arquivo Arcano',
    creator: 'Zaya Tarot',
  });

  // 4. Capa
  drawCover(doc, mockup);

  // 5. Introducao
  step++;
  onProgress(step, total, 'Gerando introducao...');
  let pg = drawIntro(doc);

  // 6. Arcanos
  step++;
  onProgress(step, total, 'Gerando paginas dos arcanos...');
  for (const arc of ARCANOS) {
    pg++;
    pg = drawArcano(doc, arc, imgs.get(arc.nome) || null, pg);
  }

  // 7. Conclusao
  pg = drawConclusion(doc, pg);

  onProgress(total, total, 'Ebook gerado com sucesso!');
  return doc.output('blob');
}

export function getEbookInfo() {
  return {
    title: 'Jornada do Heroi — Os 22 Arcanos Maiores',
    description: 'Um ebook premium com os 22 Arcanos Maiores do Tarot, incluindo significados, simbologia, psicologia junguiana e mensagens de evolucao.',
    pages: '~30 paginas',
    features: [
      'Capa com mockup de deck em arco e brilho roxo',
      'Introducao a Jornada do Heroi',
      '22 paginas dedicadas aos Arcanos Maiores',
      'Imagens Rider-Waite-Smith em cada pagina',
      'Simbologia, psicologia e aplicacao pratica',
      'Conclusao e reflexao final',
      'Design premium com identidade Zaya Tarot',
      'Headers e citacoes ao Zaya Tarot',
    ],
    fileName: `zaya-tarot-jornada-do-heroi-${new Date().toISOString().split('T')[0]}.pdf`,
  };
}
