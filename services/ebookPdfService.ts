/**
 * Servico de geracao do Ebook Premium - Jornada do Heroi
 * Estilo: Zaya Tarot (fundo degrade roxo, fonte gold gradient, layout Arquivo Arcano)
 */
import jsPDF from 'jspdf';

// ============================================================
// CONSTANTES DE LAYOUT
// ============================================================
const PW = 210; // Page width A4 mm
const PH = 297; // Page height
const M = 20;   // Margin
const CW = PW - 2 * M; // Content width

// Cores fieis ao site Zaya Tarot
// Gold gradient do hero: #fffebb â†’ #e0c080 â†’ #b88a44
const C = {
  BG_TOP:        [18, 6, 36]     as const,  // topo do degrade (mais escuro)
  BG_BOT:        [36, 16, 62]    as const,  // base do degrade (mais claro/roxo)
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
  TEXTO_MUTED:   [160, 150, 175] as const,  // #a096af  - texto secundario
  WHITE:         [255, 255, 255] as const,
};

// URLs das imagens (Rider-Waite, dominio publico)
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
// DADOS DOS 22 ARCANOS MAIORES
// ============================================================
const ARCANOS = [
  {
    numero: '0', nome: 'O Louco', arquetipo: 'O Chamado a Aventura',
    significado: 'O Louco representa o inicio da jornada, o momento de dar o primeiro passo no desconhecido. E a inocencia, a espontaneidade e a coragem de comecar sem garantias.',
    simbolos: 'O jovem a beira do precipicio carrega uma pequena trouxa - tudo o que possui. O cao branco simboliza a intuicao e a protecao. A rosa branca representa a pureza de intencao. O precipicio nao e um perigo, mas uma metafora para o salto de fe.',
    psicologia: 'Psicologicamente, o Louco representa o ego antes da diferenciacao, o estado de potencial puro. E a crianca interior que ainda nao foi condicionada pelas expectativas sociais. Espiritualmente, e o espirito livre buscando experiencia.',
    vida_real: 'Este arquetipo aparece quando voce esta prestes a comecar algo novo: um projeto, relacionamento, mudanca de carreira. E aquele momento em que voce sente que precisa dar um salto de fe, mesmo sem ter todas as respostas.',
    mensagem: 'Confie no processo. A jornada comeca com um unico passo. Nao espere estar completamente preparado - a preparacao acontece no caminho. Abrace o desconhecido com curiosidade e coragem.'
  },
  { numero: 'I', nome: 'O Mago', arquetipo: 'O Despertar do Poder Pessoal', significado: 'O Mago e o arquetipo da manifestacao consciente. Representa o momento em que percebemos que temos recursos, habilidades e o poder de transformar nossa realidade.', simbolos: 'Os quatro elementos na mesa (copa, espada, moeda e cetro) representam dominio sobre agua, ar, terra e fogo - as ferramentas necessarias para criar. O simbolo do infinito sobre sua cabeca indica consciencia ilimitada. A vara erguida conecta o ceu a terra.', psicologia: 'E a tomada de consciencia do proprio potencial. O Mago representa a fase em que saimos da passividade e reconhecemos nossa agencia no mundo. E o momento "Eu posso fazer isso acontecer".', vida_real: 'Surge quando voce percebe suas capacidades e comeca a usa-las conscientemente. Pode ser o inicio de um negocio, o desenvolvimento de uma habilidade, ou simplesmente perceber que voce tem mais controle sobre sua vida do que imaginava.', mensagem: 'Voce tem as ferramentas necessarias. O poder esta em suas maos. Comece a manifestar suas intencoes atraves da acao consciente. "Como e acima, e embaixo" - seus pensamentos criam sua realidade.' },
  { numero: 'II', nome: 'A Sacerdotisa', arquetipo: 'A Guardia do Inconsciente', significado: 'A Sacerdotisa representa o conhecimento intuitivo, os misterios ocultos e a sabedoria que vem do silencio. E o portal para o inconsciente.', simbolos: 'Sentada entre dois pilares (Boaz e Jachin - rigor e misericordia), ela guarda o veu decorado com romas, simbolo do inconsciente fertil. A lua aos seus pes representa ciclos e misterio. O pergaminho TORA em seu colo simboliza a lei divina.', psicologia: 'Representa o self feminino, a anima no sentido junguiano. E a parte de nos que sabe sem saber como sabe - a intuicao profunda. Tambem simboliza o que ainda nao esta consciente, mas esta se formando.', vida_real: 'Aparece quando precisamos parar de agir e comecar a escutar. Momentos em que a resposta nao vem da logica, mas da intuicao. Quando sonhos, sincronicidades e pressentimentos se tornam importantes.', mensagem: 'Nem tudo precisa ser explicado ou compreendido racionalmente. Confie em sua intuicao. Ha sabedoria no silencio. Algumas coisas precisam amadurecer no escuro antes de virem a luz.' },
  { numero: 'III', nome: 'A Imperatriz', arquetipo: 'A Mae Criadora', significado: 'A Imperatriz e a abundancia, a fertilidade e a criacao materializada. Representa o poder de nutrir, crescer e dar forma ao que foi semeado.', simbolos: 'Gravida, sentada em meio a natureza exuberante, ela usa uma coroa de 12 estrelas (os meses, os ciclos). O cetro simboliza seu dominio sobre o mundo material. O escudo com o simbolo de Venus representa o amor e a beleza.', psicologia: 'E o arquetipo materno em sua forma criativa - nao apenas no sentido biologico, mas em qualquer ato de nutrir e dar vida a projetos, ideias, relacionamentos. Representa a abundancia que surge quando cuidamos com amor.', vida_real: 'Manifesta-se em momentos de crescimento, prosperidade e colheita. Quando um projeto floresce, quando cuidamos de algo ou alguem e vemos os frutos, quando nos conectamos com a natureza e a sensualidade da vida.', mensagem: 'Nutra o que voce criou. A abundancia e natural quando voce cuida com amor. Conecte-se com o mundo material e seus prazeres. A criacao e um ato de amor.' },
  { numero: 'IV', nome: 'O Imperador', arquetipo: 'O Construtor de Estruturas', significado: 'O Imperador representa a ordem, a autoridade e a estrutura. E o poder de organizar, governar e estabelecer fundacoes solidas.', simbolos: 'Sentado em um trono de pedra decorado com carneiros (Aries, a forca pioneira), ele segura o cetro e o orbe - simbolos de poder temporal. As montanhas ao fundo representam realizacoes solidas e duradouras.', psicologia: 'E o principio paterno, a autoridade interna. Representa a capacidade de criar estrutura, disciplina e ordem na propria vida. E o ego diferenciado que pode dizer "nao" e estabelecer limites.', vida_real: 'Surge quando precisamos estabelecer rotinas, criar estruturas, assumir responsabilidades. Quando precisamos de disciplina para concretizar o que foi iniciado. Momentos de lideranca e tomada de decisoes estrategicas.', mensagem: 'Construa fundacoes solidas. A ordem nao e opressao - e a estrutura que permite o crescimento. Assuma sua autoridade. Lidere sua vida com responsabilidade e visao estrategica.' },
  { numero: 'V', nome: 'O Hierofante', arquetipo: 'O Mestre Espiritual', significado: 'O Hierofante e a ponte entre o divino e o humano, o portador da tradicao e da sabedoria institucionalizada. Representa o ensino, a mentoria e os sistemas de crenca.', simbolos: 'Sentado entre dois pilares (como a Sacerdotisa, mas agora no mundo externo), ele abencoa dois discipulos. As tres cruzes representam os tres mundos (material, emocional, espiritual). As chaves aos seus pes simbolizam os misterios que ele pode revelar.', psicologia: 'Representa a necessidade de integrar-se a algo maior - uma tradicao, comunidade ou sistema de crencas. E a fase em que buscamos mestres, guias e ensinamentos estruturados. Tambem pode indicar conformidade versus autenticidade.', vida_real: 'Aparece quando buscamos educacao formal, mentoria espiritual ou quando nos conectamos com tradicoes. Tambem surge quando questionamos se estamos seguindo nossas verdades ou apenas repetindo dogmas.', mensagem: 'Honre a sabedoria que veio antes de voce. Mas lembre-se: tradicoes servem para guiar, nao para aprisionar. Busque mestres, mas mantenha seu discernimento. A verdadeira espiritualidade e pessoal.' },
  { numero: 'VI', nome: 'Os Amantes', arquetipo: 'A Grande Escolha', significado: 'Os Amantes representam escolhas, relacionamentos e a integracao de opostos. E o momento de decisao consciente baseada em valores pessoais.', simbolos: 'Adao e Eva sob a bencao do Arcanjo Rafael. A arvore da vida atras de Adao e a arvore do conhecimento atras de Eva. O sol ao fundo representa consciencia. E a escolha entre instinto e consciencia.', psicologia: 'Representa a individuacao atraves da relacao. Nao e apenas sobre romance, mas sobre qualquer escolha que define quem somos. E o momento de integrar aspectos opostos da personalidade - masculino/feminino, consciente/inconsciente.', vida_real: 'Surge em momentos de decisoes importantes que definirao seu caminho. Pode ser uma escolha de relacionamento, carreira ou valores. E quando voce precisa decidir baseado no que e verdadeiro para voce, nao no que e esperado.', mensagem: 'Faca escolhas conscientes alinhadas com seus valores. Relacionamentos exigem integracao de opostos. Voce e formado tanto pela luz quanto pela sombra - aceite ambos.' },
  { numero: 'VII', nome: 'O Carro', arquetipo: 'A Vitoria Atraves da Determinacao', significado: 'O Carro representa a conquista atraves da forca de vontade, o movimento dirigido e a superacao de conflitos internos.', simbolos: 'Um guerreiro em sua carruagem, puxada por duas esfinges (uma branca, uma preta - forcas opostas). O cetro representa dominio, a armadura estrelar mostra protecao espiritual. O dossel de estrelas representa a influencia celestial.', psicologia: 'E o ego fortalecido que pode direcionar impulsos conflitantes. Representa a capacidade de manter-se focado apesar das distracoes. E disciplina interna transformada em progresso externo.', vida_real: 'Aparece quando voce precisa avancar apesar das dificuldades. Quando forcas opostas dentro de voce precisam ser harmonizadas para seguir em frente. Momentos de determinacao e foco.', mensagem: 'Mantenha o foco. Voce tem controle sobre a direcao de sua vida. Forcas opostas dentro de voce nao precisam estar em conflito - podem trabalhar juntas. Avance com determinacao.' },
  { numero: 'VIII', nome: 'A Forca', arquetipo: 'A Coragem Compassiva', significado: 'A Forca representa o poder que vem da compaixao, nao da dominacao. E a coragem de enfrentar o que e selvagem dentro de nos com gentileza.', simbolos: 'Uma mulher fechando suavemente a boca de um leao. O simbolo do infinito sobre sua cabeca mostra consciencia ilimitada. A corrente de flores indica que o controle vem do amor, nao da forca bruta.', psicologia: 'Representa a integracao dos instintos atraves da compaixao. Nao e reprimir a natureza animal, mas integra-la com consciencia. E forca verdadeira - aquela que vem da aceitacao e do amor-proprio.', vida_real: 'Surge quando voce precisa enfrentar seus medos, vicios ou aspectos selvagens da personalidade. Quando a raiva, o medo ou o desejo surgem e voce escolhe nao reprimi-los, mas integra-los com consciencia.', mensagem: 'Verdadeira forca e gentil. Voce nao precisa dominar seus instintos - precisa entende-los e integra-los. Coragem nao e ausencia de medo, mas a capacidade de agir apesar dele.' },
  { numero: 'IX', nome: 'O Eremita', arquetipo: 'A Busca Interior', significado: 'O Eremita representa o retiro necessario, a busca interior e a sabedoria que vem da solidao. E o momento de virar-se para dentro.', simbolos: 'Um velho sabio no topo de uma montanha, segurando uma lanterna com uma estrela de seis pontas. O cajado representa apoio e autoridade espiritual. A neve representa purificacao.', psicologia: 'E o processo de individuacao que exige afastamento do coletivo. Representa a necessidade de solidao para encontrar respostas. E o momento de parar de buscar validacao externa e olhar para dentro.', vida_real: 'Aparece quando voce precisa de tempo sozinho para refletir. Momentos de retiro, meditacao, autoanalise. Quando as respostas nao virao de livros ou pessoas, mas do silencio e da reflexao.', mensagem: 'Nem toda jornada e social. Ã€s vezes voce precisa se afastar para se encontrar. A sabedoria vem do silencio. Ilumine seu proprio caminho antes de tentar iluminar o dos outros.' },
  { numero: 'X', nome: 'A Roda da Fortuna', arquetipo: 'Os Ciclos Inevitaveis', significado: 'A Roda da Fortuna representa os ciclos da vida, a impermanencia e o destino que esta alem do controle individual.', simbolos: 'Uma roda girando, com simbolos alquimicos e hebraicos. Criaturas dos evangelhos nos cantos representam os elementos fixos. Anubis sobe, Set desce - o que sobe, desce.', psicologia: 'Representa a aceitacao da impermanencia. E o reconhecimento de que ha forcas alem do nosso controle. Tambem simboliza sincronicidades e o momento de reconhecer padroes ciclicos na vida.', vida_real: 'Surge em momentos de grande mudanca - para melhor ou pior. Quando circunstancias externas mudam dramaticamente. Quando voce percebe padroes repetitivos em sua vida.', mensagem: 'Tudo e impermanente. O que esta embaixo hoje pode estar em cima amanha. Nao se apegue a sorte nem desespere no azar. Ha um ritmo maior na vida - aprenda a fluir com ele.' },
  { numero: 'XI', nome: 'A Justica', arquetipo: 'O Equilibrio e a Responsabilidade', significado: 'A Justica representa causa e efeito, responsabilidade pessoal e a busca por equilibrio. E o momento de colher o que foi plantado.', simbolos: 'Uma figura segurando uma espada (discernimento) e uma balanca (equilibrio). Os pilares representam a lei universal. O quadrado no peito simboliza a fundacao terrena da justica.', psicologia: 'Representa a confrontacao com as consequencias de nossas escolhas. E o superego maduro - nao punitivo, mas equilibrado. Reconhecimento de que somos responsaveis por nossas vidas.', vida_real: 'Aparece quando voce enfrenta consequencias de acoes passadas. Momentos de decisoes importantes, contratos, acordos. Quando voce precisa ser honesto sobre sua parte em situacoes.', mensagem: 'Voce e responsavel por suas escolhas. Justica nao e apenas sobre o que voce recebe, mas sobre integridade em suas acoes. Busque equilibrio. O universo responde a energia que voce emite.' },
  { numero: 'XII', nome: 'O Enforcado', arquetipo: 'O Sacrificio Necessario', significado: 'O Enforcado representa a suspensao voluntaria, a mudanca de perspectiva e o sacrificio que traz iluminacao.', simbolos: 'Um homem pendurado de cabeca para baixo em uma arvore viva, mas sereno. O halo ao redor da cabeca indica iluminacao. Pendurado por uma perna, a outra forma um "4" - estabilidade no caos.', psicologia: 'Representa o momento de parar de lutar e se render. E a fase em que a perspectiva antiga precisa ser invertida. O sacrificio do ego menor para o despertar do self maior.', vida_real: 'Surge quando voce esta preso em uma situacao sem solucao aparente. Quando lutar so piora as coisas. Momentos de espera forcada, crises existenciais. Quando voce precisa ver tudo de um angulo diferente.', mensagem: 'Ã€s vezes, parar e a acao mais poderosa. Nem tudo pode ser resolvido pela forca. Mudancas de perspectiva vem da suspensao do conhecido. O que parece sacrificio pode ser libertacao.' },
  { numero: 'XIII', nome: 'A Morte', arquetipo: 'A Transformacao Inevitavel', significado: 'A Morte nao e o fim, mas a transformacao profunda. Representa o que precisa morrer para que o novo nasca.', simbolos: 'Um esqueleto cavaleiro com uma bandeira branca (pureza) e uma rosa (vida apos a morte). O sol nascente entre os pilares ao fundo. Pessoas de todas as classes sociais caem - a morte nao discrimina.', psicologia: 'Representa o fim de identidades, crencas ou padroes que nao servem mais. E a morte psicologica necessaria para o renascimento. O luto pelo que foi, abrindo espaco para o que vira.', vida_real: 'Aparece em finais definitivos - termino de relacionamentos, perda de empregos, mudancas de identidade. Quando uma fase da vida termina completamente. Momentos de transformacao radical.', mensagem: 'Fim nao e fracasso. Algumas coisas precisam morrer para que voce possa crescer. Solte o que ja nao serve. A transformacao pode ser dolorosa, mas e necessaria. Confie no ciclo.' },
  { numero: 'XIV', nome: 'A Temperanca', arquetipo: 'A Alquimia da Alma', significado: 'A Temperanca representa equilibrio, paciencia e a integracao harmoniosa de opostos. E o processo de refinamento.', simbolos: 'Um anjo com um pe na agua e outro na terra, misturando liquidos entre duas tacas. O triangulo no peito representa fogo, a coroa quadrada representa terra. Ãris (mensageira) no fundo.', psicologia: 'Apos a morte (transformacao), vem a temperanca (integracao). E o processo de equilibrar extremos, de encontrar o meio-termo. Representa a alquimia interior - transformar chumbo em ouro.', vida_real: 'Surge em periodos de cura apos crises. Quando voce precisa de paciencia para integrar mudancas. Momentos de buscar equilibrio entre trabalho e vida, razao e emocao, material e espiritual.', mensagem: 'Paciencia e a virtude do sabio. A verdadeira mudanca e gradual. Equilibre seus opostos internos. A cura acontece gota a gota. Confie no processo de refinamento.' },
  { numero: 'XV', nome: 'O Diabo', arquetipo: 'A Sombra e o Aprisionamento', significado: 'O Diabo representa nossas prisoes autoimposas, vicios, medos e a sombra que negamos. E o que nos mantem acorrentados.', simbolos: 'Uma figura demoniaca com casal acorrentado - mas as correntes sao frouxas. Chifres e asas representam a natureza animal. O pentagrama invertido simboliza priorizacao do material sobre o espiritual.', psicologia: 'E o confronto com a sombra junguiana - os aspectos que negamos em nos mesmos. Representa compulsoes, vicios, relacionamentos toxicos. O que mais tememos reconhecer em nos.', vida_real: 'Aparece em vicios, padroes destrutivos, relacionamentos codependentes. Quando voce se sente preso mas e, em parte, cumplice de sua prisao. Momentos de enfrentar a sombra.', mensagem: 'Voce tem mais liberdade do que pensa. Suas correntes sao, em grande parte, autoimposas. Enfrente sua sombra - o que voce nega, controla voce. Vicios sao sintomas, nao causas. Liberte-se.' },
  { numero: 'XVI', nome: 'A Torre', arquetipo: 'A Destruicao Necessaria', significado: 'A Torre representa o colapso de estruturas falsas, revelacoes subitas e a destruicao que precede a reconstrucao.', simbolos: 'Uma torre sendo destruida por um raio, figuras caindo. A coroa no topo cai - ilusoes de controle. O raio vem do ceu - e uma intervencao do divino/destino.', psicologia: 'Representa o colapso do ego inflado, a destruicao de ilusoes. E o momento em que estruturas mentais falsas sao demolidas. Pode ser traumatico, mas e libertador.', vida_real: 'Surge em crises subitas, revelacoes chocantes, perdas inesperadas. Quando tudo que voce construiu sobre fundacoes falsas desmorona. Momentos de colapso que forcam reconstrucao.', mensagem: 'Ã€s vezes, o universo destroi o que voce construiu porque estava sobre fundacoes falsas. Nao e punicao - e libertacao. O que e verdadeiro sobrevive. Reconstrua sobre a verdade.' },
  { numero: 'XVII', nome: 'A Estrela', arquetipo: 'A Esperanca Renovada', significado: 'A Estrela representa esperanca, inspiracao e renovacao apos a crise. E a cura e a conexao com algo maior.', simbolos: 'Uma mulher nua despejando agua em um rio e na terra. Oito estrelas - luz eterna. O passaro representa pensamentos elevados. A nudez simboliza vulnerabilidade autentica e pureza.', psicologia: 'Apos a destruicao da Torre, vem a esperanca da Estrela. E o momento de cura, de reconexao com o self autentico. Representa inspiracao e fe renovadas.', vida_real: 'Aparece em periodos de recuperacao apos crises. Quando voce sente esperanca novamente. Momentos de inspiracao, de sentir-se guiado. Quando a cura verdadeira comeca.', mensagem: 'Sempre ha esperanca. Apos a escuridao, vem a luz. Voce esta sendo guiado. Cure-se. Conecte-se com algo maior que voce. O universo conspira a seu favor.' },
  { numero: 'XVIII', nome: 'A Lua', arquetipo: 'A Jornada pelo Inconsciente', significado: 'A Lua representa ilusao, medo, o inconsciente profundo e a jornada atraves da escuridao psiquica.', simbolos: 'Dois caes uivando para a lua, um caminho entre duas torres levando ao desconhecido. Um lagostim emerge da agua. A lua goteja - nutricao do psiquico.', psicologia: 'Representa a descida ao inconsciente profundo. Medos, ilusoes, memorias reprimidas. E a noite escura da alma. O territorio entre o conhecido e o desconhecido.', vida_real: 'Surge em periodos de confusao, ansiedade, quando voce nao confia em suas percepcoes. Pesadelos, medos irracionais. Quando tudo parece incerto e ameacador.', mensagem: 'Nem tudo e o que parece. Seus medos podem ser ilusoes. Atravesse a noite com coragem - ha sabedoria na escuridao. O que voce teme pode ser um guia. Continue caminhando.' },
  { numero: 'XIX', nome: 'O Sol', arquetipo: 'A Iluminacao e a Alegria', significado: 'O Sol representa clareza, vitalidade, sucesso e a alegria simples de existir. E a luz apos a escuridao.', simbolos: 'Um sol radiante, uma crianca nua em um cavalo branco. Girassois voltados para a luz. A bandeira vermelha representa vitalidade. Tudo esta claro e iluminado.', psicologia: 'Apos atravessar a Lua, voce emerge no Sol - consciencia clara, ego saudavel, alegria autentica. Representa o self integrado brilhando.', vida_real: 'Aparece em momentos de sucesso, clareza, alegria. Quando tudo faz sentido. Quando voce se sente vivo, vital, autentico. Momentos de celebracao merecida.', mensagem: 'Voce merece celebrar. A vida pode ser simples e alegre. Voce atravessou a escuridao e emergiu mais forte. Brilhe. Compartilhe sua luz. A clareza chegou.' },
  { numero: 'XX', nome: 'O Julgamento', arquetipo: 'O Despertar e o Chamado', significado: 'O Julgamento representa o despertar final, a avaliacao honesta de si mesmo e o chamado para um proposito maior.', simbolos: 'Um anjo tocando trombeta, pessoas surgindo de caixoes com bracos abertos. Montanhas ao fundo. Cruz na bandeira - morte e ressurreicao. E o chamado final para despertar.', psicologia: 'Representa a integracao de todas as experiencias da jornada. E o momento de avaliar honestamente quem voce se tornou. O chamado para viver seu proposito autentico.', vida_real: 'Surge em momentos de grande clareza sobre seu proposito. Quando voce ouve um "chamado" inegavel. Momentos de renascimento, de deixar o passado morto e abracar nova vida.', mensagem: 'E hora de despertar completamente. Avalie sua jornada com honestidade. Perdoe-se. Responda ao chamado de sua alma. Voce renasceu. Viva de acordo com sua verdade.' },
  { numero: 'XXI', nome: 'O Mundo', arquetipo: 'A Completude e a Realizacao', significado: 'O Mundo representa a completude, a integracao total e a realizacao. E o fim de um ciclo e o inicio de outro em um nivel superior.', simbolos: 'Uma figura dancante, nua, em uma grinalda de louros. Os quatro evangelhos nos cantos - integracao total dos elementos. As fitas formam um infinito. Tudo esta completo.', psicologia: 'E a individuacao completa no sentido junguiano. O self integrado dancando. Todas as partes reconciliadas. A jornada completa - mas nao o fim definitivo.', vida_real: 'Aparece em momentos de conclusao significativa. Quando um ciclo grande se fecha. Quando voce alcanca uma meta importante. A sensacao de "cheguei" - sabendo que novos ciclos virao.', mensagem: 'Voce completou a jornada. Celebre sua realizacao. Mas lembre-se: o fim e sempre um novo comeco. O Mundo leva de volta ao Louco. A danca continua eternamente.' },
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

// Fundo degrade roxo (escuro no topo â†’ mais roxo embaixo)
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

// Header padrao de todas as paginas internas
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

// Footer padrao
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

// Nova pagina base
function newPage(doc: jsPDF, pg: number) {
  doc.addPage();
  bg(doc);
  header(doc);
  footer(doc, pg);
}

// Box com borda dourada a esquerda (estilo card do site)
function drawSectionBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  // Fundo sutil
  doc.setFillColor(C.SURFACE[0], C.SURFACE[1], C.SURFACE[2]);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  // Borda exterior roxa sutil
  sc(doc, C.BORDER, 'd');
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');
  // Barra dourada a esquerda
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
// ORBITA DOURADA (ornamento decorativo da capa)
// ============================================================
function drawGoldOrbit(doc: jsPDF, cx: number, cy: number, rx: number, ry: number) {
  // Elipse dourada fina (orbita)
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.5);
  doc.ellipse(cx, cy, rx, ry, 'S');
  // Segunda orbita mais sutil
  doc.setGState(doc.GState({ opacity: 0.4 }));
  sc(doc, C.GOLD, 'd');
  doc.setLineWidth(0.3);
  doc.ellipse(cx, cy, rx + 6, ry + 3, 'S');
  doc.setGState(doc.GState({ opacity: 1 }));
  // Pequeno ponto dourado no centro
  sc(doc, C.GOLD, 'f');
  doc.circle(cx, cy, 2, 'F');
  // 4 pontos orbitais
  sc(doc, C.GOLD_DEEP, 'f');
  doc.circle(cx - rx, cy, 1, 'F');
  doc.circle(cx + rx, cy, 1, 'F');
  doc.circle(cx, cy - ry, 1, 'F');
  doc.circle(cx, cy + ry, 1, 'F');
}

// ============================================================
// CAPA
// ============================================================
function drawCover(doc: jsPDF) {
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
  doc.text('Um ebook exclusivo por', PW / 2, 55, { align: 'center' });

  // ZAYA TAROT grande e centralizado
  doc.setFontSize(36);
  sc(doc, C.WHITE, 't');
  doc.setFont('times', 'bold');
  doc.text('ZAYA TAROT', PW / 2, 72, { align: 'center' });

  doc.setFontSize(11);
  sc(doc, C.ROXO_CLARO, 't');
  doc.setFont('times', 'italic');
  doc.text('Sabedoria ancestral para o caminho moderno', PW / 2, 82, { align: 'center' });

  // Linhas douradas
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.6);
  doc.line(55, 88, PW - 55, 88);
  doc.setLineWidth(0.2);
  doc.line(65, 90, PW - 65, 90);

  // Orbita dourada centralizada
  drawGoldOrbit(doc, PW / 2, 130, 45, 25);

  // Titulo principal
  doc.setFontSize(42);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Jornada do Heroi', PW / 2, 178, { align: 'center' });

  // Subtitulo
  doc.setFontSize(15);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'normal');
  doc.text('Os 22 Arcanos Maiores do Tarot', PW / 2, 190, { align: 'center' });

  // Descricao
  doc.setFontSize(12);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'italic');
  doc.text('Uma jornada de autoconhecimento atraves', PW / 2, 210, { align: 'center' });
  doc.text('dos arquetipos ancestrais do Tarot', PW / 2, 219, { align: 'center' });

  // Separador
  sc(doc, C.GOLD_DEEP, 'd');
  doc.setLineWidth(0.3);
  doc.line(55, 228, PW - 55, 228);

  // Arquivo Arcano
  doc.setFontSize(11);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'bold');
  doc.text('ARQUIVO ARCANO', PW / 2, 238, { align: 'center' });

  doc.setFontSize(9);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('Material exclusivo para desenvolvimento pessoal e espiritual', PW / 2, 246, { align: 'center' });

  // Footer
  doc.setFontSize(7);
  sc(doc, C.ROXO_MEDIO, 't');
  doc.text('zayatarot.com', PW / 2, PH - 18, { align: 'center' });
}

// ============================================================
// PAGINA 2: Jornada do Heroi + Citacao Jung (centralizado)
// ============================================================
function drawJornadaPage(doc: jsPDF) {
  newPage(doc, 2);

  const cy = PH / 2; // centro vertical da pagina

  // Titulo centralizado
  doc.setFontSize(30);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('A Jornada do Heroi', PW / 2, cy - 50, { align: 'center' });

  doc.setFontSize(14);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'normal');
  doc.text('no Tarot', PW / 2, cy - 38, { align: 'center' });

  // Divider
  divider(doc, cy - 28);

  // Texto introdutorio
  doc.setFontSize(12);
  sc(doc, C.TEXTO, 't');
  doc.setFont('times', 'italic');
  const intro1 = 'Os 22 Arcanos Maiores representam uma jornada completa';
  const intro2 = 'de desenvolvimento humano - o mito universal do Heroi,';
  const intro3 = 'codificado nos simbolos ancestrais do Tarot.';
  doc.text(intro1, PW / 2, cy - 14, { align: 'center' });
  doc.text(intro2, PW / 2, cy - 7, { align: 'center' });
  doc.text(intro3, PW / 2, cy, { align: 'center' });

  // Divider
  divider(doc, cy + 14);

  // Citacao Jung
  doc.setFontSize(16);
  sc(doc, C.GOLD_LIGHT, 't');
  doc.setFont('times', 'italic');
  doc.text('"O privilegio de uma vida e', PW / 2, cy + 34, { align: 'center' });
  doc.text('tornar-se quem voce realmente e."', PW / 2, cy + 44, { align: 'center' });

  doc.setFontSize(12);
  sc(doc, C.TEXTO_MUTED, 't');
  doc.setFont('times', 'normal');
  doc.text('- Carl Gustav Jung', PW / 2, cy + 56, { align: 'center' });
}

// ============================================================
// PAGINA 3: Sumario - Os 22 Portais da Consciencia
// ============================================================
function drawSummaryPage(doc: jsPDF) {
  newPage(doc, 3);

  let y = 45;

  // Titulo
  doc.setFontSize(24);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('Os 22 Portais da Consciencia', PW / 2, y, { align: 'center' });
  y += 6;
  y = divider(doc, y) + 12;

  // Distribuir 11 itens por coluna usando espaco disponivel
  const bottomLimit = PH - 28; // acima do footer
  const itemH = (bottomLimit - y) / 11; // espaco por item (distribuido)
  const c1 = M + 10, c2 = PW / 2 + 8;

  doc.setFontSize(12);
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
    doc.text(`${a.nome}`, x + 16, ry);

    doc.setFontSize(9.5);
    sc(doc, C.TEXTO_MUTED, 't');
    doc.setFont('times', 'italic');
    doc.text(a.arquetipo, x + 16, ry + 5);
    doc.setFontSize(12);
  }
}

// ============================================================
// PAGINA DO ARCANO (tudo em uma unica pagina, bem distribuido)
// ============================================================
function drawArcano(
  doc: jsPDF, arc: typeof ARCANOS[0], img: string | null, pg: number
): number {
  newPage(doc, pg);

  const maxY = PH - 22; // limite inferior (footer)
  const topY = 33;      // inicio do conteudo (abaixo da linha do header em y=20)
  let y = topY;
  const textX = M + 3;
  const textW = CW - 6;

  // ---- TOPO: Nome da carta em gold ----
  doc.setFontSize(28);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text(arc.nome, PW / 2, y, { align: 'center' });
  y += 6;

  // Numero romano + Arquetipo
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

  // Linha dourada separadora
  sc(doc, C.BORDER_GOLD, 'd');
  doc.setLineWidth(0.3);
  doc.line(M + 15, y, PW - M - 15, y);
  y += 5;

  // ---- IMAGEM da carta centralizada ----
  const imgW = 42, imgH = 67;

  if (img) {
    try {
      const imgX = (PW - imgW) / 2;
      // Borda dourada
      sc(doc, C.BORDER_GOLD, 'd');
      doc.setLineWidth(0.6);
      doc.roundedRect(imgX - 1, y - 1, imgW + 2, imgH + 2, 1.5, 1.5, 'S');
      doc.addImage(img, 'JPEG', imgX, y, imgW, imgH);
      y += imgH + 5;
    } catch (_) {
      y += 5;
    }
  }

  // ---- Calcular espaco restante para distribuir secoes ----
  // Todas as 5 secoes: significado (box) + 4 paragrafos
  const sections = [
    { title: 'Significado Essencial', text: arc.significado, isBox: true },
    { title: 'Simbologia da Carta', text: arc.simbolos, isBox: false },
    { title: 'Contexto Psicologico e Espiritual', text: arc.psicologia, isBox: false },
    { title: 'Como Aparece na Vida Real', text: arc.vida_real, isBox: false },
    { title: 'Mensagem de Evolucao', text: arc.mensagem, isBox: false },
  ];

  const bodyLH = 4.8;
  const boxPadX = 5;
  const boxPadY = 3.5;
  const boxTextW = CW - boxPadX * 2 - 3;

  // Calcular altura total necessaria para todas as secoes
  let totalContentH = 0;
  const sectionHeights: number[] = [];
  for (const sec of sections) {
    doc.setFontSize(11);
    const tH = textHeight(doc, sec.text, sec.isBox ? boxTextW : textW, bodyLH);
    const secH = sec.isBox
      ? boxPadY + 5.5 + tH + boxPadY  // box: padding + title + text + padding
      : 5.5 + tH;                      // paragraph: title + text
    sectionHeights.push(secH);
    totalContentH += secH;
  }

  // Distribuir espaco restante como gap entre secoes
  const availableH = maxY - y;
  const baseGap = 4;
  const extraGap = Math.max(0, (availableH - totalContentH - baseGap * sections.length) / sections.length);
  const gap = Math.min(baseGap + extraGap, 10); // cap gap at 10mm

  // ---- Renderizar secoes ----
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];

    if (sec.isBox) {
      // Box estilizado para Significado Essencial
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
      // Paragrafo corrido com titulo dourado
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
// CONCLUSÃƒO
// ============================================================
function drawConclusion(doc: jsPDF, pg: number): number {
  pg++;
  newPage(doc, pg);
  let y = 30;

  doc.setFontSize(26);
  sc(doc, C.GOLD, 't');
  doc.setFont('times', 'normal');
  doc.text('O Mundo - E Alem', PW / 2, y, { align: 'center' });
  y += 6;
  y = divider(doc, y) + 5;

  const texts = [
    'Voce chegou ao fim da jornada - ou seria ao comeco? O Mundo, o ultimo arcano, representa completude, mas nao conclusao definitiva. A figura danca na carta, celebrando a integracao de todas as experiencias, mas a danca nunca para.',
    'A jornada pelos 22 Arcanos Maiores e ciclica. Quando voce chega ao Mundo, esta pronto para comecar novamente como o Louco - mas em um nivel superior de consciencia. Cada ciclo traz mais sabedoria, mais integracao, mais plenitude.',
    'Os arquetipos do Tarot nao sao apenas simbolos antigos - sao mapas vivos de sua propria psique. Voce pode nao estar consciente, mas provavelmente ja viveu cada uma dessas 22 etapas em algum momento de sua vida.',
    'A pergunta nao e "em qual arcano voce esta?" - porque voce pode estar em varios ao mesmo tempo. A pergunta e: "Voce esta consciente da jornada?" Porque a consciencia transforma a experiencia de vitima das circunstancias em heroi da propria historia.',
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
  doc.text('"A jornada nunca termina -', PW / 2, y, { align: 'center' });
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
  const total = 22 + 4;
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
    title: 'Jornada do Heroi - Os 22 Arcanos Maiores do Tarot',
    author: 'Zaya Tarot - Arquivo Arcano',
    creator: 'Zaya Tarot',
  });

  // 3. Capa
  drawCover(doc);

  // 4. Pagina 2: Jornada do Heroi + Jung
  step++;
  onProgress(step, total, 'Gerando introducao...');
  drawJornadaPage(doc);

  // 5. Pagina 3: Sumario
  drawSummaryPage(doc);
  let pg = 3;

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
    title: 'Jornada do Heroi - Os 22 Arcanos Maiores',
    description: 'Um ebook premium com os 22 Arcanos Maiores do Tarot, incluindo significados, simbologia, psicologia junguiana e mensagens de evolucao.',
    pages: '~30 paginas',
    features: [
      'Capa elegante com orbita dourada e branding Zaya Tarot',
      'Fundo degrade roxo premium',
      'Introducao a Jornada do Heroi',
      '22 paginas dedicadas aos Arcanos Maiores',
      'Imagens Rider-Waite-Smith em cada pagina',
      'Simbologia, psicologia e aplicacao pratica',
      'Conclusao e reflexao final',
      'Design premium com identidade Zaya Tarot',
    ],
    fileName: `zaya-tarot-jornada-do-heroi-${new Date().toISOString().split('T')[0]}.pdf`,
  };
}



