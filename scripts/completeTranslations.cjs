#!/usr/bin/env node
/**
 * Script completo de tradução para todas as cartas de tarot
 * Adiciona campos _pt para description, love, career, advice
 */

const fs = require('fs');
const path = require('path');

// Traduções para TODAS as cartas (incluindo as menores com IDs corretos)
const translations = {
  // ============ ARCANOS MAIORES (22) - já traduzidos, mas incluídos para completude ============
  "maj_0": {
    description_pt: "Um jovem está à beira de um penhasco, prestes a dar um passo no desconhecido. Ele carrega uma pequena bolsa e uma rosa branca, simbolizando pureza. Um pequeno cão a seus pés representa lealdade e proteção.",
    love_pt: "Um novo romance está no horizonte. Esteja aberto a conexões inesperadas. Se em um relacionamento, traga de volta a espontaneidade e aventura.",
    career_pt: "Hora de um novo caminho ou projeto profissional. Não pense demais - confie em seus instintos e dê o salto.",
    advice_pt: "Abrace o desconhecido com o coração aberto. Às vezes as melhores aventuras começam com um único passo na incerteza."
  },
  "maj_1": {
    description_pt: "Uma figura está com uma mão apontando para o céu e outra para a terra, canalizando energia divina. Em sua mesa estão os símbolos dos quatro naipes - representando domínio sobre todos os elementos.",
    love_pt: "Tome iniciativa no amor. Você tem o charme e a habilidade para atrair o que deseja. Seja autêntico.",
    career_pt: "Você tem tudo necessário para o sucesso. Use suas habilidades e força de vontade para alcançar seus objetivos. Grande potencial à frente.",
    advice_pt: "Você tem os recursos que precisa. Canalize sua energia e aja agora com confiança."
  },
  "maj_2": {
    description_pt: "Uma mulher serena senta entre dois pilares - um preto, um branco - representando dualidade. Ela segura um pergaminho de conhecimento esotérico, parcialmente escondido por seu manto.",
    love_pt: "Ouça sua intuição sobre relacionamentos. Pode haver aspectos ocultos a explorar. Confie em seus pressentimentos.",
    career_pt: "Informações ocultas podem vir à luz. Use sua intuição nas decisões. Pesquise e reflita antes de agir.",
    advice_pt: "Fique quieto e ouça sua voz interior. As respostas já estão dentro de você - você só precisa silenciar o ruído para ouvi-las."
  },
  "maj_3": {
    description_pt: "Uma mulher majestosa senta em um jardim exuberante, cercada pela abundância da natureza. Ela usa uma coroa de estrelas e segura um cetro, representando sua conexão com a terra e o céu.",
    love_pt: "O amor floresce. Fertilidade, sensualidade e conexão emocional profunda. Um relacionamento nutritivo.",
    career_pt: "Projetos criativos prosperam. Abundância no trabalho. Bom momento para iniciar negócios ou expandir os existentes.",
    advice_pt: "Conecte-se com a natureza e seu lado criativo. Nutra a si mesmo e seus projetos - a abundância seguirá."
  },
  "maj_4": {
    description_pt: "Um governante poderoso senta em um trono de pedra adornado com cabeças de carneiro, simbolizando Áries. Ele segura um cetro ankh e um orbe, representando vida e poder mundano.",
    love_pt: "Um relacionamento estável e comprometido. Pode indicar um parceiro protetor. Equilibre autoridade com compaixão.",
    career_pt: "Oportunidades de liderança. Hora de estabelecer estrutura e assumir o comando. Sucesso através da disciplina.",
    advice_pt: "Crie ordem a partir do caos. Estabeleça limites claros e mantenha-os. Lidere com sabedoria, não apenas com poder."
  },
  "maj_5": {
    description_pt: "Uma figura religiosa senta entre dois pilares, abençoando dois seguidores. Ele usa uma coroa tripla e segura uma cruz papal, representando sua autoridade espiritual.",
    love_pt: "Valores tradicionais de relacionamento. Pode indicar casamento ou compromisso. Crenças compartilhadas fortalecem laços.",
    career_pt: "Seguir caminhos estabelecidos leva ao sucesso. Busque mentoria. Educação e credenciais importam.",
    advice_pt: "Considere quais tradições te servem e quais te prendem. Busque sabedoria de professores, mas forme suas próprias crenças."
  },
  "maj_6": {
    description_pt: "Um homem e uma mulher estão sob um anjo, representando bênção divina. A Árvore do Conhecimento e a Árvore da Vida aparecem atrás deles, simbolizando a escolha entre tentação e paraíso.",
    love_pt: "Conexão profunda de almas. Amor verdadeiro e parceria. Uma escolha significativa de relacionamento pode surgir.",
    career_pt: "Parcerias e colaborações prosperam. Escolha trabalhos que se alinhem com seus valores.",
    advice_pt: "Siga seu coração, mas use sua cabeça. Faça escolhas que honrem tanto seus desejos quanto sua integridade."
  },
  "maj_7": {
    description_pt: "Um guerreiro está em uma carruagem puxada por duas esfinges - uma preta, uma branca. Ele usa armadura decorada com luas e estrelas, usando força de vontade em vez de rédeas para guiar seu caminho.",
    love_pt: "Assuma o controle da sua vida amorosa. Persiga o que você quer com confiança. Equilibre emoções com ação.",
    career_pt: "Vitória através da determinação. Mantenha-se focado nos objetivos apesar dos obstáculos. O sucesso está ao alcance.",
    advice_pt: "Aproveite sua força interior e concentre sua vontade. Você pode superar qualquer obstáculo com determinação e equilíbrio."
  },
  "maj_8": {
    description_pt: "Uma mulher gentilmente mantém aberta a mandíbula de um leão, mostrando domínio sobre forças primitivas através do amor em vez da violência. O símbolo do infinito paira sobre sua cabeça.",
    love_pt: "Paciência e compaixão fortalecem relacionamentos. Enfrente desafios com força gentil.",
    career_pt: "Perseverança leva ao sucesso. Lide com situações difíceis com graça e confiança.",
    advice_pt: "A verdadeira força vem de dentro - da paciência, compaixão e autodomínio. Enfrente seus medos com um coração gentil."
  },
  "maj_9": {
    description_pt: "Um velho está sozinho no pico de uma montanha, segurando uma lanterna com uma estrela de seis pontas. Seu cajado representa conhecimento adquirido através da experiência.",
    love_pt: "Tempo para autorreflexão sobre o que você realmente quer no amor. A solidão pode trazer clareza.",
    career_pt: "Recue e avalie seu caminho. Busque conselhos sábios. Às vezes o afastamento leva ao avanço.",
    advice_pt: "Reserve tempo para solidão e reflexão. A luz da sabedoria brilha mais forte no silêncio da sua própria alma."
  },
  "maj_10": {
    description_pt: "Uma grande roda gira, com criaturas míticas subindo e descendo. A esfinge senta no topo, representando sabedoria em meio à mudança constante.",
    love_pt: "Um ponto de virada no amor. O destino pode trazer conexões ou mudanças inesperadas.",
    career_pt: "Mudança está chegando - provavelmente positiva. Surfe na onda da oportunidade. A sorte favorece os preparados.",
    advice_pt: "A vida se move em ciclos. Aceite que a mudança é constante e posicione-se para se beneficiar da roda girando."
  },
  "maj_11": {
    description_pt: "Uma figura senta entre pilares, segurando balanças em uma mão e uma espada na outra, representando julgamento equilibrado e ação rápida.",
    love_pt: "Justiça nos relacionamentos. O karma desempenha um papel - trate os outros como deseja ser tratado.",
    career_pt: "Questões legais podem surgir. Aja com integridade. Negociações justas levam ao sucesso.",
    advice_pt: "Seja honesto consigo mesmo e com os outros. Assuma responsabilidade por suas ações, pois toda causa tem seu efeito."
  },
  "maj_12": {
    description_pt: "Um homem pendurado de cabeça para baixo em uma cruz em forma de T, seu rosto sereno apesar de sua posição. Uma auréola circunda sua cabeça, sugerindo iluminação através da rendição.",
    love_pt: "Deixe ir as expectativas. Uma nova perspectiva sobre relacionamentos traz clareza.",
    career_pt: "Pause e reavalie. Sacrifício pode ser necessário para ganhos futuros. Não force o progresso.",
    advice_pt: "Às vezes a melhor ação é a inação. Renda sua necessidade de controle e veja sua situação de um novo ângulo."
  },
  "maj_13": {
    description_pt: "Uma figura esquelética a cavalo carrega uma bandeira preta com uma flor branca. Pessoas de todas as classes - rei, donzela, criança - caem diante dele, mostrando que a transformação não poupa ninguém.",
    love_pt: "Fim de uma fase do relacionamento - não necessariamente do relacionamento em si. A transformação traz renovação.",
    career_pt: "Grande mudança ou fim de carreira. Não resista - a transformação leva a novas oportunidades.",
    advice_pt: "Abrace os finais como necessários para novos começos. O que morre abre espaço para o que está nascendo."
  },
  "maj_14": {
    description_pt: "Um anjo derrama água entre dois cálices, representando o fluxo entre consciente e subconsciente. Um pé repousa na terra, outro na água, mostrando equilíbrio entre os reinos.",
    love_pt: "Equilíbrio nos relacionamentos. Paciência e moderação levam à harmonia. Misture diferenças com graça.",
    career_pt: "Equilíbrio trabalho-vida é fundamental. Resultados estáveis vêm da moderação e paciência.",
    advice_pt: "Encontre o meio-termo em todas as coisas. Misture os opostos em harmonia e deixe a paciência guiar suas ações."
  },
  "maj_15": {
    description_pt: "Uma figura demoníaca senta em um trono, com um homem e uma mulher acorrentados abaixo. Olhe de perto - as correntes estão frouxas e podem ser removidas.",
    love_pt: "Examine padrões de dependência em relacionamentos. Libertação é possível se você escolher.",
    career_pt: "Sentindo-se preso no trabalho? Reconheça o que realmente o prende e você pode se libertar.",
    advice_pt: "Suas correntes são mais frouxas do que parecem. Reconheça os apegos que o prendem para encontrar verdadeira liberdade."
  },
  "maj_16": {
    description_pt: "Um raio atinge uma torre, enviando coroas e figuras caindo. Chamas irrompem das janelas enquanto estruturas construídas sobre bases falsas desmoronam.",
    love_pt: "Revelações podem abalar a base do relacionamento. A verdade liberta, mesmo quando dói.",
    career_pt: "Ruptura repentina. Estruturas desmoronando podem abrir espaço para bases mais fortes.",
    advice_pt: "Às vezes a destruição é necessária para reconstruir corretamente. Deixe o que não serve cair."
  },
  "maj_17": {
    description_pt: "Uma mulher nua se ajoelha junto à água, derramando água de duas jarras. Acima dela, oito estrelas brilham - uma grande estrela central e sete menores.",
    love_pt: "Esperança renovada no amor. Cura de feridas passadas. Abertura para novas possibilidades.",
    career_pt: "Após dificuldades, a esperança retorna. Inspiração e oportunidades estão florescendo.",
    advice_pt: "Tenha fé. Após a tempestade vem a calma. A esperança é sua estrela guia através da escuridão."
  },
  "maj_18": {
    description_pt: "Uma lua cheia olha para baixo com expressão inquietante. Um lagostim emerge de uma piscina, enquanto um cão e um lobo uivam. Duas torres guardam o caminho adiante.",
    love_pt: "Emoções podem obscurecer a realidade. Medos e inseguranças precisam ser confrontados.",
    career_pt: "Confusão ou engano no trabalho. Confie em sua intuição para navegar pela incerteza.",
    advice_pt: "Nem tudo é o que parece. Caminhe com cuidado através das ilusões e confie em sua orientação interior."
  },
  "maj_19": {
    description_pt: "Um sol radiante brilha sobre uma criança feliz montada em um cavalo branco. Girassóis florescem atrás de um muro, virando-se para a luz.",
    love_pt: "Alegria e felicidade em relacionamentos. Sucesso no amor. Celebração e calor.",
    career_pt: "Sucesso, reconhecimento e realização. Sua energia positiva atrai oportunidades.",
    advice_pt: "Deixe sua luz brilhar. Sucesso e felicidade estão aqui - aproveite o momento com gratidão."
  },
  "maj_20": {
    description_pt: "Um anjo toca trombeta enquanto figuras se levantam de túmulos, braços erguidos em direção ao céu. Montanhas ao fundo representam os limites absolutos.",
    love_pt: "Um chamado para renovar relacionamentos. Julgamento claro sobre questões do coração.",
    career_pt: "Hora de avaliação honesta. Seu chamado verdadeiro está se revelando.",
    advice_pt: "Atenda ao chamado. É hora de avaliar sua vida honestamente e abraçar seu propósito maior."
  },
  "maj_21": {
    description_pt: "Uma figura dançante, envolta em um lenço flutuante, está dentro de uma guirlanda de louros. Nos quatro cantos estão os símbolos dos evangelistas - leão, touro, águia e anjo.",
    love_pt: "Completude e união. Relacionamentos alcançam um estado de harmonia e realização.",
    career_pt: "Conquistas máximas. Conclusão bem-sucedida de ciclos. Integração de todas as lições.",
    advice_pt: "Você completou um ciclo importante. Celebre suas conquistas enquanto se prepara para a próxima jornada."
  },

  // ============ ARCANOS MENORES - PAUS (14) ============
  "min_wands_1": {
    description_pt: "Uma mão emerge de uma nuvem segurando um bastão florescendo, simbolizando novas oportunidades e energia criativa prestes a desabrochar.",
    love_pt: "Nova paixão e excitação. Um relacionamento cheio de energia e potencial está começando.",
    career_pt: "Nova oportunidade de carreira ou projeto criativo. Energia empreendedora. Hora de começar.",
    advice_pt: "Agarre esta nova oportunidade com entusiasmo. A faísca da inspiração está em suas mãos."
  },
  "min_wands_2": {
    description_pt: "Uma figura olha para o mar de um castelo, segurando um globo. Dois bastões estão fixados, representando escolhas e planejamento para o futuro.",
    love_pt: "Decisões sobre relacionamentos. Planejando o futuro juntos. Considere suas opções com cuidado.",
    career_pt: "Avaliando oportunidades de carreira. Parcerias de negócios. Planejamento de longo prazo.",
    advice_pt: "Você está em uma encruzilhada. Considere cuidadosamente suas opções antes de avançar."
  },
  "min_wands_3": {
    description_pt: "Uma figura de costas olha para o horizonte, com navios navegando ao longe. Três bastões representam a expansão e exploração de novas oportunidades.",
    love_pt: "Expansão em relacionamentos. Viagens ou aventuras juntos. Horizontes se ampliando.",
    career_pt: "Oportunidades de expansão. Comércio exterior ou viagens de negócios. Visão de longo prazo.",
    advice_pt: "Olhe além do horizonte imediato. Oportunidades de crescimento esperam por aqueles que se aventuram."
  },
  "min_wands_4": {
    description_pt: "Quatro bastões decorados com guirlandas formam um dossel. Uma celebração acontece com figuras dançando e erguendo buquês em alegria.",
    love_pt: "Celebração no amor. Marcos importantes - noivado, casamento, aniversário. Harmonia doméstica.",
    career_pt: "Celebração de conquistas profissionais. Reconhecimento pelo trabalho duro. Marcos atingidos.",
    advice_pt: "Pause para celebrar suas conquistas. A alegria compartilhada multiplica as bênçãos."
  },
  "min_wands_5": {
    description_pt: "Cinco figuras brandem bastões em aparente conflito. Porém, olhe mais de perto - pode ser competição saudável ou debate construtivo.",
    love_pt: "Conflitos ou desentendimentos. Competição por atenção. Resolva diferenças através do diálogo.",
    career_pt: "Competição no trabalho. Conflitos de equipe. Canalize a energia competitiva produtivamente.",
    advice_pt: "O conflito nem sempre é negativo. Use esta energia para crescimento e clareza de propósito."
  },
  "min_wands_6": {
    description_pt: "Uma figura coroada de louros cavalga um cavalo branco em procissão triunfal, com pessoas celebrando e acenando bastões em apoio.",
    love_pt: "Vitória no amor. Reconhecimento público do relacionamento. Sucesso após esforços.",
    career_pt: "Reconhecimento e aclamação. Promoção ou prêmio. Liderança bem-sucedida reconhecida.",
    advice_pt: "Aproveite seu momento de glória com graça. O sucesso é mais doce quando compartilhado."
  },
  "min_wands_7": {
    description_pt: "Uma figura solitária em terreno elevado defende sua posição contra seis bastões que se aproximam de baixo. A batalha é difícil, mas a posição é vantajosa.",
    love_pt: "Defendendo seu relacionamento. Mantendo sua posição. Persistência diante de desafios.",
    career_pt: "Defendendo sua posição ou projeto. Competição acirrada. Mantenha-se firme em suas convicções.",
    advice_pt: "Você tem a vantagem do terreno elevado. Defenda o que é seu com determinação."
  },
  "min_wands_8": {
    description_pt: "Oito bastões voam pelo ar sobre uma paisagem aberta, todos apontando na mesma direção, simbolizando movimento rápido e comunicação.",
    love_pt: "Relacionamento avançando rapidamente. Comunicação fluindo. Viagem relacionada ao amor.",
    career_pt: "Progresso rápido. Notícias chegando. Viagens de negócios. Projetos ganhando velocidade.",
    advice_pt: "A velocidade está a seu favor. Aja rapidamente enquanto o momento está contigo."
  },
  "min_wands_9": {
    description_pt: "Uma figura ferida mas determinada se apoia em um bastão, com oito outros enfileirados atrás. Exausta mas não derrotada, ela permanece vigilante.",
    love_pt: "Exaustão emocional em relacionamentos. Resiliência após desafios. Mantenha a guarda enquanto se recupera.",
    career_pt: "Esgotamento profissional. Última linha de defesa. Persistência apesar do cansaço.",
    advice_pt: "Você passou por muito e ainda está de pé. Descanse brevemente, mas não baixe a guarda."
  },
  "min_wands_10": {
    description_pt: "Uma figura carrega dez bastões com dificuldade, curvada sob o peso enquanto caminha em direção a uma vila distante.",
    love_pt: "Sobrecarga em relacionamentos. Assumindo responsabilidades demais. Hora de compartilhar o peso.",
    career_pt: "Excesso de trabalho e responsabilidades. Delegue ou reorganize prioridades.",
    advice_pt: "Você assumiu demais. Considere o que pode delegar ou deixar ir para não desabar."
  },
  "min_wands_11": {
    description_pt: "Um jovem entusiasmado segura um bastão florescendo, olhando para ele com curiosidade e admiração. Sua roupa decorada com salamandras indica elemento fogo.",
    love_pt: "Notícias excitantes sobre amor. Entusiasmo juvenil em relacionamentos. Nova paixão despertando.",
    career_pt: "Novas ideias e inspiração. Mensagens sobre oportunidades. Energia criativa renovada.",
    advice_pt: "Abrace seu entusiasmo e curiosidade. Novas mensagens trazem oportunidades emocionantes."
  },
  "min_wands_12": {
    description_pt: "Um cavaleiro ardente avança em seu cavalo, bastão erguido, pronto para a ação. Salamandras adornam sua armadura e manto amarelo.",
    love_pt: "Paixão ardente e ação rápida no amor. Aventura romântica. Alguém apaixonado se aproximando.",
    career_pt: "Ação decisiva e rápida. Mudanças de carreira. Energia empreendedora em movimento.",
    advice_pt: "Aja com paixão e determinação. Este é o momento de avançar audaciosamente."
  },
  "min_wands_13": {
    description_pt: "Uma rainha confiante senta em seu trono com um bastão florescendo, rodeada por girassóis e um gato preto. Ela irradia calor e carisma.",
    love_pt: "Mulher apaixonada e magnética no amor. Confiança atraente. Calor e generosidade.",
    career_pt: "Liderança carismática. Sucesso através de criatividade e paixão. Empreendedorismo feminino.",
    advice_pt: "Lidere com confiança e calor. Sua energia positiva inspira e atrai sucesso."
  },
  "min_wands_14": {
    description_pt: "Um rei poderoso senta em seu trono com salamandras decorando sua coroa e manto. Ele segura um bastão florescendo com autoridade natural.",
    love_pt: "Liderança apaixonada em relacionamentos. Parceiro confiante e inspirador. Energia masculina forte.",
    career_pt: "Liderança visionária. Empreendedor de sucesso. Inspiração para outros através do exemplo.",
    advice_pt: "Lidere com visão e inspiração. Sua paixão e determinação guiam outros ao sucesso."
  },

  // ============ ARCANOS MENORES - COPAS (14) ============
  "min_cups_1": {
    description_pt: "Uma mão emerge de uma nuvem segurando um cálice transbordante. Uma pomba mergulha para colocar uma hóstia no cálice, enquanto a água flui para um lago de lótus.",
    love_pt: "Novo amor transbordando. Abertura emocional. Começo de um relacionamento profundo.",
    career_pt: "Nova oportunidade que traz satisfação emocional. Criatividade fluindo. Intuição guiando.",
    advice_pt: "Abra seu coração para receber. Uma nova bênção emocional está sendo oferecida a você."
  },
  "min_cups_2": {
    description_pt: "Um homem e uma mulher trocam cálices sob o símbolo de um leão alado - o caduceu de Hermes. Eles selam um acordo de amor e respeito mútuo.",
    love_pt: "União de almas. Parceria equilibrada. Amor mútuo e respeito. Possível noivado.",
    career_pt: "Parcerias harmoniosas. Acordos mutuamente benéficos. Colaboração criativa.",
    advice_pt: "Valorize as conexões baseadas em respeito mútuo. A verdadeira parceria requer dar e receber."
  },
  "min_cups_3": {
    description_pt: "Três mulheres erguem seus cálices em celebração, dançando entre frutas e flores. Celebração de amizade e alegria compartilhada.",
    love_pt: "Celebração com amigos e família. Amizades que nutrem o amor. Alegria comunitária.",
    career_pt: "Celebração de conquistas em equipe. Colaboração bem-sucedida. Networking frutífero.",
    advice_pt: "Celebre com aqueles que ama. A alegria multiplicada é alegria compartilhada."
  },
  "min_cups_4": {
    description_pt: "Uma figura sentada sob uma árvore contempla três cálices à sua frente, ignorando um quarto oferecido de uma nuvem. Descontentamento com o que tem.",
    love_pt: "Insatisfação em relacionamentos. Ignorando oportunidades de amor. Foco no que falta.",
    career_pt: "Descontentamento profissional. Ignorando oportunidades. Apatia ou tédio.",
    advice_pt: "Olhe para o que está sendo oferecido antes de se lamentar pelo que não tem."
  },
  "min_cups_5": {
    description_pt: "Uma figura enlutada olha para três cálices derramados, ignorando dois que ainda estão de pé atrás. Uma ponte leva a uma casa distante.",
    love_pt: "Luto por perdas amorosas. Focando na dor em vez das possibilidades restantes.",
    career_pt: "Desapontamento profissional. Perda de oportunidades. Mas nem tudo está perdido.",
    advice_pt: "Reconheça sua perda, mas não ignore o que resta. A ponte para o futuro ainda existe."
  },
  "min_cups_6": {
    description_pt: "Uma criança oferece um cálice cheio de flores a outra criança. A cena evoca nostalgia, inocência e memórias doces do passado.",
    love_pt: "Nostalgia em relacionamentos. Reconexão com amores do passado. Inocência emocional.",
    career_pt: "Memórias do passado influenciando o presente. Ofertas generosas. Gentileza no trabalho.",
    advice_pt: "Honre o passado sem se prender a ele. A inocência e generosidade ainda têm seu lugar."
  },
  "min_cups_7": {
    description_pt: "Uma figura em silhueta contempla sete cálices flutuando em nuvens, cada um contendo visões diferentes - riqueza, beleza, vitória, fantasias.",
    love_pt: "Fantasias românticas. Múltiplas opções amorosas. Cuidado com ilusões no amor.",
    career_pt: "Muitas opções de carreira. Sonhar acordado sobre possibilidades. Hora de escolher.",
    advice_pt: "Sonhos são importantes, mas eventualmente você deve escolher uma realidade para perseguir."
  },
  "min_cups_8": {
    description_pt: "Uma figura de costas caminha para longe de oito cálices empilhados, dirigindo-se às montanhas sob uma lua eclipsada. Abandonando o que já não serve.",
    love_pt: "Deixando um relacionamento para trás. Buscando algo mais profundo. Jornada emocional solitária.",
    career_pt: "Abandonando uma carreira estabelecida. Buscando maior significado. Mudança radical.",
    advice_pt: "Às vezes precisamos deixar para trás o que construímos para encontrar o que realmente buscamos."
  },
  "min_cups_9": {
    description_pt: "Uma figura satisfeita senta de braços cruzados, sorrindo, enquanto nove cálices se curvam em arco atrás dela. O cálice da satisfação.",
    love_pt: "Satisfação emocional completa. Desejos do coração realizados. Contentamento no amor.",
    career_pt: "Realização profissional. Satisfação com conquistas. Desejos de carreira atendidos.",
    advice_pt: "Aprecie o momento de satisfação. Seus desejos se realizaram - permita-se sentir a alegria."
  },
  "min_cups_10": {
    description_pt: "Uma família feliz sob um arco-íris de dez cálices. Crianças brincam enquanto o casal abraçado contempla sua casa e felicidade doméstica.",
    love_pt: "Felicidade familiar completa. Harmonia doméstica. Amor realizado em sua plenitude.",
    career_pt: "Realização em equilíbrio com vida pessoal. Sucesso que traz felicidade genuína.",
    advice_pt: "Esta é a imagem da felicidade emocional completa. Aprecie e nutra o que você construiu."
  },
  "min_cups_11": {
    description_pt: "Um jovem sonhador olha para um peixe que salta de seu cálice, fascinado pela mensagem que ele traz. Vestido de azul, flores adornam sua túnica.",
    love_pt: "Mensagens de amor chegando. Jovem romântico. Sonhos e intuição sobre relacionamentos.",
    career_pt: "Notícias sobre oportunidades criativas. Intuição sobre novos caminhos. Inspiração artística.",
    advice_pt: "Preste atenção às mensagens do coração e da intuição. Algo significativo está sendo revelado."
  },
  "min_cups_12": {
    description_pt: "Um cavaleiro de armadura segue em frente em seu cavalo branco, cálice erguido cuidadosamente. Ele é o mensageiro do amor e dos sonhos.",
    love_pt: "Proposta romântica a caminho. Cavaleiro em armadura brilhante. Convites amorosos.",
    career_pt: "Oportunidades criativas se aproximando. Ofertas que seguem o coração. Projetos artísticos.",
    advice_pt: "O amor ou a oportunidade criativa está vindo até você. Esteja aberto para receber."
  },
  "min_cups_13": {
    description_pt: "Uma rainha contemplativa senta em seu trono à beira da água, segurando um cálice ornamentado. Ela é altamente intuitiva e emocionalmente profunda.",
    love_pt: "Mulher emocionalmente madura e intuitiva. Profundidade emocional. Nutrição amorosa.",
    career_pt: "Liderança intuitiva. Profissões de cuidado e cura. Criatividade guiada pela emoção.",
    advice_pt: "Confie em sua intuição profunda. A sabedoria emocional é um dom a ser honrado."
  },
  "min_cups_14": {
    description_pt: "Um rei maduro senta em seu trono no meio do mar agitado, calmo apesar das águas turbulentas. Ele domina o reino das emoções com equilíbrio.",
    love_pt: "Homem emocionalmente maduro e equilibrado. Companheiro estável. Sabedoria emocional.",
    career_pt: "Liderança emocionalmente inteligente. Profissões artísticas ou de cuidado. Diplomacia.",
    advice_pt: "Domine suas emoções sem reprimi-las. A verdadeira força emocional está no equilíbrio."
  },

  // ============ ARCANOS MENORES - ESPADAS (14) ============
  "min_swords_1": {
    description_pt: "Uma mão emerge de uma nuvem segurando uma espada vertical coroada por uma coroa e ramos de oliveira e palma. Clareza mental e verdade.",
    love_pt: "Clareza em relacionamentos. Verdades sendo reveladas. Comunicação direta e honesta.",
    career_pt: "Novas ideias e clareza mental. Avanço intelectual. Vitória através da razão.",
    advice_pt: "A verdade é sua espada. Use-a com sabedoria para cortar através da confusão e ilusão."
  },
  "min_swords_2": {
    description_pt: "Uma figura vendada senta à beira do mar, equilibrando duas espadas cruzadas sobre os ombros. Indecisão e negação de ver a verdade.",
    love_pt: "Negando verdades sobre relacionamentos. Decisão difícil sendo evitada. Impasse emocional.",
    career_pt: "Indecisão profissional. Evitando enfrentar realidades. Impasse que precisa de resolução.",
    advice_pt: "Remova a venda. A indecisão vem de se recusar a ver o que está claro."
  },
  "min_swords_3": {
    description_pt: "Três espadas perfuram um coração sob nuvens de tempestade e chuva. O símbolo clássico da dor emocional, traição e sofrimento.",
    love_pt: "Dor de coração. Traição ou separação. Luto necessário para a cura.",
    career_pt: "Decepção profissional. Traição no trabalho. Dor necessária para crescimento.",
    advice_pt: "A dor é real e deve ser sentida. Através do luto vem eventualmente a cura."
  },
  "min_swords_4": {
    description_pt: "Uma figura repousa em um túmulo dentro de uma igreja, três espadas na parede e uma sob ela. Descanso necessário após batalha mental.",
    love_pt: "Retiro de relacionamentos para recuperação. Pausa necessária. Contemplação solitária.",
    career_pt: "Descanso e recuperação necessários. Pausa antes da próxima fase. Restauração mental.",
    advice_pt: "O descanso não é fraqueza. Você precisa desta pausa para se recuperar e reunir forças."
  },
  "min_swords_5": {
    description_pt: "Uma figura triunfante segura três espadas enquanto duas jazem no chão. Duas figuras derrotadas se afastam. Vitória a qualquer custo.",
    love_pt: "Conflito destrutivo. Vitória vazia em discussões. Comunicação agressiva causando danos.",
    career_pt: "Competição desleal. Conflitos no trabalho. Vitória que custa demais.",
    advice_pt: "Considere se esta vitória vale o preço. Às vezes ganhar significa perder o que importa."
  },
  "min_swords_6": {
    description_pt: "Uma figura conduz um barco com uma mulher e criança como passageiros, seis espadas fincadas na proa. Transição difícil mas necessária.",
    love_pt: "Transição em relacionamentos. Deixando dificuldades para trás. Movimento em direção à cura.",
    career_pt: "Mudança de emprego ou carreira. Deixando ambiente tóxico. Transição necessária.",
    advice_pt: "Às vezes precisamos deixar as águas turbulentas. A travessia é difícil, mas o destino vale a pena."
  },
  "min_swords_7": {
    description_pt: "Uma figura furtiva se afasta de um acampamento carregando cinco espadas, deixando duas para trás. Estratégia, mas também potencial engano.",
    love_pt: "Desonestidade em relacionamentos. Segredos sendo mantidos. Estratégias ocultas.",
    career_pt: "Táticas astutas no trabalho. Potencial traição. Cuidado com politicagem.",
    advice_pt: "A astúcia tem seu lugar, mas considere se seus métodos são verdadeiramente honrados."
  },
  "min_swords_8": {
    description_pt: "Uma figura vendada e amarrada está cercada por oito espadas fincadas no chão. Aprisionada, mas note - as amarras estão frouxas.",
    love_pt: "Sentindo-se preso em relacionamento. Mas a prisão é mais mental que real. Libertação possível.",
    career_pt: "Sentindo-se encurralado no trabalho. Limitações autoinfligidas. A saída existe.",
    advice_pt: "Suas restrições são mais mentais que reais. Quando perceber isso, poderá se libertar."
  },
  "min_swords_9": {
    description_pt: "Uma figura senta na cama, cabeça nas mãos em desespero. Nove espadas pairam ameaçadoramente acima. Pesadelos e ansiedade profunda.",
    love_pt: "Ansiedade sobre relacionamentos. Pesadelos e medos. Os piores cenários na mente.",
    career_pt: "Preocupação excessiva sobre trabalho. Insônia por ansiedade. Pensamentos catastróficos.",
    advice_pt: "A noite é mais escura antes do amanhecer. Muitos de seus medos são piores que a realidade."
  },
  "min_swords_10": {
    description_pt: "Uma figura jaz de bruços com dez espadas cravadas nas costas. O céu escuro começa a clarear no horizonte. O fim absoluto.",
    love_pt: "Fim doloroso de relacionamento. Traição completa. Mas o sol nascerá novamente.",
    career_pt: "Fim de carreira ou projeto. Derrota total. Mas desta morte virá renascimento.",
    advice_pt: "Este é o fundo do poço - e isso significa que só há um caminho: para cima."
  },
  "min_swords_11": {
    description_pt: "Um jovem vigilante segura sua espada em posição defensiva, observando com olhos penetrantes. Alerta mental, mas talvez excessivamente cauteloso.",
    love_pt: "Comunicação cautelosa. Jovem intelectual. Mensagens ou conversas importantes chegando.",
    career_pt: "Notícias ou ideias chegando. Vigilância necessária. Aprendizado intelectual.",
    advice_pt: "Mantenha-se alerta e curioso. Informações importantes estão a caminho."
  },
  "min_swords_12": {
    description_pt: "Um cavaleiro avança velozmente em seu cavalo, espada erguida contra o vento. Determinado, rápido, mas potencialmente imprudente.",
    love_pt: "Comunicação rápida e direta. Ação mental decisiva. Cuidado com palavras cortantes.",
    career_pt: "Ação rápida em direção a objetivos. Mudanças repentinas. Assertividade intelectual.",
    advice_pt: "A velocidade tem valor, mas não deixe a pressa comprometer sua precisão ou compaixão."
  },
  "min_swords_13": {
    description_pt: "Uma rainha austera senta em seu trono entre nuvens, espada erguida. Ela representa a verdade sem adornos e a mente clara.",
    love_pt: "Mulher intelectualmente forte. Comunicação direta. Verdade sobre emoção.",
    career_pt: "Liderança racional. Clareza de pensamento. Decisões baseadas em fatos.",
    advice_pt: "Honre a verdade acima do conforto. Sua clareza mental é um dom para ser usado."
  },
  "min_swords_14": {
    description_pt: "Um rei severo senta em seu trono, espada erguida na mão direita. Borboletas e anjos adornam seu trono, mostrando que a razão pode ser elevada.",
    love_pt: "Homem intelectualmente poderoso. Comunicação clara. Autoridade baseada em verdade.",
    career_pt: "Autoridade intelectual. Liderança baseada em lógica. Tomada de decisão clara.",
    advice_pt: "Use o poder da mente com sabedoria e justiça. A verdade é sua coroa."
  },

  // ============ ARCANOS MENORES - OUROS/PENTÁCULOS (14) ============
  "min_pentacles_1": {
    description_pt: "Uma mão emerge de uma nuvem oferecendo uma moeda dourada sobre um jardim florescente. O portal para a abundância material.",
    love_pt: "Novo relacionamento com base sólida. Presente material. Fundação estável para o amor.",
    career_pt: "Nova oportunidade financeira. Começo de prosperidade. Semente de abundância plantada.",
    advice_pt: "Uma oportunidade material está sendo oferecida. Plante esta semente com cuidado para colher abundância."
  },
  "min_pentacles_2": {
    description_pt: "Um jovem malabarista equilibra duas moedas conectadas por um símbolo do infinito. Equilibrando múltiplas responsabilidades ou decisões financeiras.",
    love_pt: "Equilibrando relacionamento com outras responsabilidades. Decisões sobre prioridades.",
    career_pt: "Malabarismo financeiro. Múltiplos projetos. Adaptabilidade necessária.",
    advice_pt: "A vida exige equilíbrio. Você pode lidar com múltiplas responsabilidades, mas não perca o foco."
  },
  "min_pentacles_3": {
    description_pt: "Um artesão trabalha em um projeto arquitetônico enquanto duas figuras observam. Maestria em ofício. Trabalho reconhecido.",
    love_pt: "Construindo relacionamento com habilidade e dedicação. Parceria que cria algo duradouro.",
    career_pt: "Reconhecimento profissional. Trabalho em equipe bem-sucedido. Maestria sendo desenvolvida.",
    advice_pt: "Domine seu ofício através da prática dedicada. A excelência atrai reconhecimento."
  },
  "min_pentacles_4": {
    description_pt: "Uma figura agarra-se a quatro moedas, uma sob cada pé e uma em cada mão. Uma moeda adorna sua coroa. Possessividade e medo de perda.",
    love_pt: "Possessividade em relacionamentos. Medo de perder o parceiro. Segurança em excesso.",
    career_pt: "Segurança financeira, mas resistência a compartilhar ou investir. Avareza.",
    advice_pt: "A segurança é importante, mas segurar com força demais pode sufocar o crescimento."
  },
  "min_pentacles_5": {
    description_pt: "Duas figuras empobrecidas caminham na neve diante de uma igreja iluminada, ignorando a ajuda disponível. Dificuldades materiais e isolamento.",
    love_pt: "Dificuldades afetando relacionamento. Sentindo-se excluído. Mas ajuda está disponível.",
    career_pt: "Dificuldades financeiras. Perda de emprego. Porém, recursos existem para quem busca.",
    advice_pt: "No mais escuro momento, lembre-se de que ajuda existe. Não deixe o orgulho impedir você de buscá-la."
  },
  "min_pentacles_6": {
    description_pt: "Um mercador próspero distribui moedas para pessoas necessitadas que se ajoelham diante dele. Generosidade e equilíbrio de dar e receber.",
    love_pt: "Generosidade em relacionamentos. Dar e receber em equilíbrio. Apoio mútuo.",
    career_pt: "Sucesso financeiro compartilhado. Filantropia. Investimento em outros.",
    advice_pt: "A verdadeira prosperidade inclui generosidade. Compartilhe suas bênçãos com gratidão."
  },
  "min_pentacles_7": {
    description_pt: "Um fazendeiro contempla pensativamente sua colheita de sete moedas em um arbusto. Avaliando resultados. Paciência com investimentos.",
    love_pt: "Avaliando o relacionamento. Paciência necessária. Os frutos do amor amadurecendo.",
    career_pt: "Avaliando investimentos e progresso. Paciência com resultados. Crescimento gradual.",
    advice_pt: "Às vezes a melhor ação é observar e esperar. Seus esforços estão amadurecendo."
  },
  "min_pentacles_8": {
    description_pt: "Um artesão diligentemente trabalha em mais uma moeda, com sete já completadas. Dedicação ao ofício e trabalho meticuloso.",
    love_pt: "Construindo relacionamento com dedicação e atenção aos detalhes. Trabalho em progresso.",
    career_pt: "Desenvolvimento de habilidades. Trabalho meticuloso sendo recompensado. Aprendizado contínuo.",
    advice_pt: "A maestria vem da prática dedicada. Continue aprimorando seu ofício com paciência."
  },
  "min_pentacles_9": {
    description_pt: "Uma mulher elegante está em um jardim abundante, um falcão em sua mão enluvada. Nove moedas a cercam. Independência e luxo conquistado.",
    love_pt: "Independência e autossuficiência. Amor-próprio. Relacionamento a partir de escolha, não necessidade.",
    career_pt: "Sucesso financeiro independente. Luxo merecido. Autodisciplina recompensada.",
    advice_pt: "Você construiu sua abundância através de disciplina. Aprecie os frutos do seu trabalho."
  },
  "min_pentacles_10": {
    description_pt: "Uma família multigeracional reúne-se sob um arco decorado com moedas. Propriedade, cães e servos indicam prosperidade estabelecida. Legado.",
    love_pt: "Família próspera e estável. Legado de amor. Tradições e valores passados adiante.",
    career_pt: "Riqueza geracional. Negócio familiar. Segurança financeira de longo prazo. Herança.",
    advice_pt: "Pense no legado que está construindo. A verdadeira riqueza é o que você passa adiante."
  },
  "min_pentacles_11": {
    description_pt: "Um jovem estudioso examina uma moeda com fascínio, de pé em um campo verde. Aprendizado prático e novos começos materiais.",
    love_pt: "Jovem estável e confiável. Mensagens sobre questões práticas. Relacionamento em formação.",
    career_pt: "Novas oportunidades de aprendizado. Começo de carreira. Estudos ou treinamento.",
    advice_pt: "Esteja aberto para aprender. Novos conhecimentos práticos estão abrindo portas."
  },
  "min_pentacles_12": {
    description_pt: "Um cavaleiro paciente em um cavalo estável contempla uma moeda em sua mão. Metódico e confiável, ele avança com determinação constante.",
    love_pt: "Parceiro confiável e estável se aproximando. Progresso constante em relacionamentos.",
    career_pt: "Progresso profissional estável. Trabalho duro trazendo resultados. Confiabilidade.",
    advice_pt: "O progresso pode ser lento, mas é seguro. A consistência vence a corrida."
  },
  "min_pentacles_13": {
    description_pt: "Uma rainha serena senta em um trono decorado com natureza, segurando uma moeda em seu colo. Cercada por abundância natural e flores.",
    love_pt: "Mulher próspera e nutritiva. Segurança material e emocional. Abundância compartilhada.",
    career_pt: "Sucesso através de praticidade e nutrição. Negócios florescendo. Gestão sábia.",
    advice_pt: "Nutra seus recursos como um jardim. Com cuidado constante, a abundância floresce."
  },
  "min_pentacles_14": {
    description_pt: "Um rei próspero senta em um trono decorado com touros, cercado por videiras e moedas. Ele representa a máxima segurança material e sucesso.",
    love_pt: "Parceiro financeiramente seguro e generoso. Estabilidade e provisão. Compromisso sólido.",
    career_pt: "Máximo sucesso financeiro. Liderança empresarial. Riqueza através de sabedoria prática.",
    advice_pt: "Você dominou o mundo material. Use sua posição para criar segurança e abundância para outros."
  }
};

// Função para ler o arquivo
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Função para adicionar traduções que estão faltando
function addMissingTranslations(content) {
  let result = content;
  let addedCount = 0;

  for (const [cardId, trans] of Object.entries(translations)) {
    // Verificar se a carta já tem description_pt
    const hasTranslation = result.includes(`id: "${cardId}"`) &&
                          result.includes(`description_pt:`) &&
                          result.indexOf(`description_pt:`, result.indexOf(`id: "${cardId}"`)) <
                          result.indexOf(`imageUrl:`, result.indexOf(`id: "${cardId}"`));

    // Se a carta existe mas não tem tradução, adicionar
    const cardPattern = new RegExp(
      `(id: "${cardId}",[\\s\\S]*?advice: "[^"]*")\\s*(,?\\s*imageUrl:)`,
      'g'
    );

    const match = cardPattern.exec(result);
    if (match) {
      cardPattern.lastIndex = 0; // Reset

      // Verificar se já tem description_pt neste bloco específico
      const cardStart = result.indexOf(`id: "${cardId}"`);
      const imageUrlPos = result.indexOf('imageUrl:', cardStart);
      const blockBetween = result.substring(cardStart, imageUrlPos);

      if (!blockBetween.includes('description_pt:')) {
        const replacement = `$1,
    description_pt: "${trans.description_pt}",
    love_pt: "${trans.love_pt}",
    career_pt: "${trans.career_pt}",
    advice_pt: "${trans.advice_pt}"$2`;

        result = result.replace(cardPattern, replacement);
        addedCount++;
      }
    }
  }

  return { result, addedCount };
}

// Função principal
async function main() {
  console.log('🔮 Completando traduções das cartas de tarot...\n');

  const filePath = path.join(__dirname, '..', 'tarotData.ts');
  const content = readFile(filePath);
  console.log('📖 Arquivo tarotData.ts lido com sucesso');

  const { result, addedCount } = addMissingTranslations(content);

  // Salvar arquivo
  fs.writeFileSync(filePath, result);
  console.log('💾 Arquivo salvo com sucesso!\n');

  // Contar traduções finais
  const finalCount = (result.match(/description_pt:/g) || []).length;

  console.log('✅ Tradução concluída!');
  console.log(`   - Cartas com tradução: ${finalCount}/78`);
  console.log(`   - Novas traduções adicionadas: ${addedCount}`);
}

main().catch(console.error);
