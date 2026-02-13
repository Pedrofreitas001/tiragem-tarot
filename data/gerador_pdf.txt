#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, 
    Table, TableStyle, Image, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Configurações de cores
COR_ROXO_ESCURO = colors.HexColor('#2D1B4E')
COR_ROXO_MEDIO = colors.HexColor('#5B3A8F')
COR_ROXO_CLARO = colors.HexColor('#9B7EBD')
COR_DOURADO = colors.HexColor('#D4AF37')
COR_DOURADO_CLARO = colors.HexColor('#F4E4B0')
COR_TEXTO_CLARO = colors.HexColor('#E8E0F0')

def criar_estilos():
    """Cria estilos customizados para o ebook"""
    estilos = getSampleStyleSheet()
    
    # Estilo para título da capa
    estilos.add(ParagraphStyle(
        name='TituloCapa',
        parent=estilos['Title'],
        fontSize=36,
        textColor=COR_DOURADO,
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Helvetica-Bold',
        leading=42
    ))
    
    # Estilo para subtítulo da capa
    estilos.add(ParagraphStyle(
        name='SubtituloCapa',
        parent=estilos['Normal'],
        fontSize=14,
        textColor=COR_DOURADO_CLARO,
        alignment=TA_CENTER,
        spaceAfter=30,
        fontName='Helvetica',
        leading=20
    ))
    
    # Estilo para título de arcano
    estilos.add(ParagraphStyle(
        name='TituloArcano',
        parent=estilos['Heading1'],
        fontSize=24,
        textColor=COR_DOURADO,
        alignment=TA_CENTER,
        spaceAfter=10,
        fontName='Helvetica-Bold',
        leading=28
    ))
    
    # Estilo para subtítulo de arcano (arquétipo)
    estilos.add(ParagraphStyle(
        name='SubtituloArcano',
        parent=estilos['Normal'],
        fontSize=12,
        textColor=COR_ROXO_CLARO,
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Helvetica-Oblique',
        leading=16
    ))
    
    # Estilo para seções
    estilos.add(ParagraphStyle(
        name='Secao',
        parent=estilos['Heading2'],
        fontSize=14,
        textColor=COR_DOURADO,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        leading=18
    ))
    
    # Estilo para corpo de texto
    estilos.add(ParagraphStyle(
        name='CorpoTexto',
        parent=estilos['Normal'],
        fontSize=11,
        textColor=COR_TEXTO_CLARO,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        fontName='Helvetica',
        leading=16
    ))
    
    # Estilo para introdução
    estilos.add(ParagraphStyle(
        name='Introducao',
        parent=estilos['Normal'],
        fontSize=11,
        textColor=COR_TEXTO_CLARO,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        fontName='Helvetica',
        leading=16,
        firstLineIndent=20
    ))
    
    return estilos

def desenhar_fundo_mistico(c, width, height):
    """Desenha um fundo místico com gradiente simulado"""
    c.setFillColor(COR_ROXO_ESCURO)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Adiciona alguns detalhes decorativos sutis
    c.setStrokeColor(COR_ROXO_MEDIO)
    c.setLineWidth(0.5)
    
    # Linhas decorativas nos cantos
    margin = 30
    corner_size = 40
    
    # Canto superior esquerdo
    c.line(margin, height - margin, margin + corner_size, height - margin)
    c.line(margin, height - margin, margin, height - margin - corner_size)
    
    # Canto superior direito
    c.line(width - margin, height - margin, width - margin - corner_size, height - margin)
    c.line(width - margin, height - margin, width - margin, height - margin - corner_size)
    
    # Canto inferior esquerdo
    c.line(margin, margin, margin + corner_size, margin)
    c.line(margin, margin, margin, margin + corner_size)
    
    # Canto inferior direito
    c.line(width - margin, margin, width - margin - corner_size, margin)
    c.line(width - margin, margin, width - margin, margin + corner_size)

def criar_capa(c, width, height):
    """Cria a capa do ebook"""
    desenhar_fundo_mistico(c, width, height)
    
    # Estrelas decorativas
    c.setFillColor(COR_DOURADO)
    for pos in [(100, height - 100), (width - 100, height - 100), 
                (width / 2, height - 50), (100, 100), (width - 100, 100)]:
        c.circle(pos[0], pos[1], 2, fill=1, stroke=0)
    
    # Título principal
    c.setFont("Helvetica-Bold", 40)
    c.setFillColor(COR_DOURADO)
    titulo = "JORNADA DO HERÓI"
    titulo_width = c.stringWidth(titulo, "Helvetica-Bold", 40)
    c.drawString((width - titulo_width) / 2, height - 200, titulo)
    
    # Linha decorativa
    c.setStrokeColor(COR_DOURADO)
    c.setLineWidth(2)
    c.line(width / 2 - 100, height - 220, width / 2 + 100, height - 220)
    
    # Subtítulo
    c.setFont("Helvetica", 18)
    c.setFillColor(COR_DOURADO_CLARO)
    subtitulo = "OS 22 ARCANOS MAIORES DO TAROT"
    subtitulo_width = c.stringWidth(subtitulo, "Helvetica", 18)
    c.drawString((width - subtitulo_width) / 2, height - 260, subtitulo)
    
    # Descrição
    c.setFont("Helvetica-Oblique", 12)
    descricao = "Uma jornada de autoconhecimento através dos arquétipos do Tarot"
    desc_width = c.stringWidth(descricao, "Helvetica-Oblique", 12)
    c.drawString((width - desc_width) / 2, height - 320, descricao)
    
    # Símbolo decorativo central
    c.setStrokeColor(COR_ROXO_CLARO)
    c.setFillColor(COR_ROXO_CLARO)
    c.setLineWidth(1.5)
    
    # Círculo místico central
    centro_x = width / 2
    centro_y = height / 2
    c.circle(centro_x, centro_y, 80, fill=0, stroke=1)
    c.circle(centro_x, centro_y, 75, fill=0, stroke=1)
    
    # Estrela no centro
    c.setFillColor(COR_DOURADO)
    for i in range(6):
        angulo = i * 60
        import math
        x = centro_x + 60 * math.cos(math.radians(angulo))
        y = centro_y + 60 * math.sin(math.radians(angulo))
        c.circle(x, y, 3, fill=1, stroke=0)
    
    # Rodapé
    c.setFont("Helvetica", 10)
    c.setFillColor(COR_ROXO_CLARO)
    rodape = "Material educacional para desenvolvimento pessoal e espiritual"
    rodape_width = c.stringWidth(rodape, "Helvetica", 10)
    c.drawString((width - rodape_width) / 2, 50, rodape)
    
    c.showPage()

def criar_pagina_com_fundo(c, width, height):
    """Cria fundo para páginas internas"""
    c.setFillColor(COR_ROXO_ESCURO)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Borda sutil
    c.setStrokeColor(COR_ROXO_MEDIO)
    c.setLineWidth(0.5)
    margin = 40
    c.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)

def desenhar_pagina_fundo(canvas, doc):
    """Função callback para desenhar fundo em cada página"""
    canvas.saveState()
    
    # Fundo roxo escuro
    canvas.setFillColor(COR_ROXO_ESCURO)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    
    # Borda sutil
    canvas.setStrokeColor(COR_ROXO_MEDIO)
    canvas.setLineWidth(0.5)
    margin = 30
    canvas.rect(margin, margin, A4[0] - 2*margin, A4[1] - 2*margin, fill=0, stroke=1)
    
    # Número da página
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(COR_ROXO_CLARO)
    page_num = canvas.getPageNumber()
    text = str(page_num)
    canvas.drawCentredString(A4[0]/2, 20, text)
    
    canvas.restoreState()

# Dados dos 22 Arcanos Maiores
ARCANOS = [
    {
        'numero': '0',
        'nome': 'O LOUCO',
        'arquetipo': 'O Chamado à Aventura',
        'significado': 'O Louco representa o início da jornada, o momento de dar o primeiro passo no desconhecido. É a inocência, a espontaneidade e a coragem de começar sem garantias.',
        'simbolos': 'O jovem à beira do precipício carrega uma pequena trouxa — tudo o que possui. O cão branco simboliza a intuição e a proteção. A rosa branca representa a pureza de intenção. O precipício não é um perigo, mas uma metáfora para o salto de fé.',
        'psicologia': 'Psicologicamente, o Louco representa o ego antes da diferenciação, o estado de potencial puro. É a criança interior que ainda não foi condicionada pelas expectativas sociais. Espiritualmente, é o espírito livre buscando experiência.',
        'vida_real': 'Este arquétipo aparece quando você está prestes a começar algo novo: um projeto, relacionamento, mudança de carreira. É aquele momento em que você sente que precisa dar um salto de fé, mesmo sem ter todas as respostas.',
        'mensagem': 'Confie no processo. A jornada começa com um único passo. Não espere estar completamente preparado — a preparação acontece no caminho. Abrace o desconhecido com curiosidade e coragem.'
    },
    {
        'numero': 'I',
        'nome': 'O MAGO',
        'arquetipo': 'O Despertar do Poder Pessoal',
        'significado': 'O Mago é o arquétipo da manifestação consciente. Representa o momento em que percebemos que temos recursos, habilidades e o poder de transformar nossa realidade.',
        'simbolos': 'Os quatro elementos na mesa (copa, espada, moeda e cetro) representam domínio sobre água, ar, terra e fogo — as ferramentas necessárias para criar. O símbolo do infinito sobre sua cabeça indica consciência ilimitada. A vara erguida conecta o céu à terra.',
        'psicologia': 'É a tomada de consciência do próprio potencial. O Mago representa a fase em que saímos da passividade e reconhecemos nossa agência no mundo. É o momento "Eu posso fazer isso acontecer".',
        'vida_real': 'Surge quando você percebe suas capacidades e começa a usá-las conscientemente. Pode ser o início de um negócio, o desenvolvimento de uma habilidade, ou simplesmente perceber que você tem mais controle sobre sua vida do que imaginava.',
        'mensagem': 'Você tem as ferramentas necessárias. O poder está em suas mãos. Comece a manifestar suas intenções através da ação consciente. "Como é acima, é embaixo" — seus pensamentos criam sua realidade.'
    },
    {
        'numero': 'II',
        'nome': 'A SACERDOTISA',
        'arquetipo': 'A Guardiã do Inconsciente',
        'significado': 'A Sacerdotisa representa o conhecimento intuitivo, os mistérios ocultos e a sabedoria que vem do silêncio. É o portal para o inconsciente.',
        'simbolos': 'Sentada entre dois pilares (Boaz e Jachin — rigor e misericórdia), ela guarda o véu decorado com romãs, símbolo do inconsciente fértil. A lua aos seus pés representa ciclos e mistério. O pergaminho TORA em seu colo simboliza a lei divina.',
        'psicologia': 'Representa o self feminino, a anima no sentido junguiano. É a parte de nós que sabe sem saber como sabe — a intuição profunda. Também simboliza o que ainda não está consciente, mas está se formando.',
        'vida_real': 'Aparece quando precisamos parar de agir e começar a escutar. Momentos em que a resposta não vem da lógica, mas da intuição. Quando sonhos, sincronicidades e pressentimentos se tornam importantes.',
        'mensagem': 'Nem tudo precisa ser explicado ou compreendido racionalmente. Confie em sua intuição. Há sabedoria no silêncio. Algumas coisas precisam amadurecer no escuro antes de virem à luz.'
    },
    {
        'numero': 'III',
        'nome': 'A IMPERATRIZ',
        'arquetipo': 'A Mãe Criadora',
        'significado': 'A Imperatriz é a abundância, a fertilidade e a criação materializada. Representa o poder de nutrir, crescer e dar forma ao que foi semeado.',
        'simbolos': 'Grávida, sentada em meio à natureza exuberante, ela usa uma coroa de 12 estrelas (os meses, os ciclos). O cetro simboliza seu domínio sobre o mundo material. O escudo com o símbolo de Vênus representa o amor e a beleza.',
        'psicologia': 'É o arquétipo materno em sua forma criativa — não apenas no sentido biológico, mas em qualquer ato de nutrir e dar vida a projetos, ideias, relacionamentos. Representa a abundância que surge quando cuidamos com amor.',
        'vida_real': 'Manifesta-se em momentos de crescimento, prosperidade e colheita. Quando um projeto floresce, quando cuidamos de algo ou alguém e vemos os frutos, quando nos conectamos com a natureza e a sensualidade da vida.',
        'mensagem': 'Nutra o que você criou. A abundância é natural quando você cuida com amor. Conecte-se com o mundo material e seus prazeres. A criação é um ato de amor.'
    },
    {
        'numero': 'IV',
        'nome': 'O IMPERADOR',
        'arquetipo': 'O Construtor de Estruturas',
        'significado': 'O Imperador representa a ordem, a autoridade e a estrutura. É o poder de organizar, governar e estabelecer fundações sólidas.',
        'simbolos': 'Sentado em um trono de pedra decorado com carneiros (Áries, a força pioneira), ele segura o cetro e o orbe — símbolos de poder temporal. As montanhas ao fundo representam realizações sólidas e duradouras.',
        'psicologia': 'É o princípio paterno, a autoridade interna. Representa a capacidade de criar estrutura, disciplina e ordem na própria vida. É o ego diferenciado que pode dizer "não" e estabelecer limites.',
        'vida_real': 'Surge quando precisamos estabelecer rotinas, criar estruturas, assumir responsabilidades. Quando precisamos de disciplina para concretizar o que foi iniciado. Momentos de liderança e tomada de decisões estratégicas.',
        'mensagem': 'Construa fundações sólidas. A ordem não é opressão — é a estrutura que permite o crescimento. Assuma sua autoridade. Lidere sua vida com responsabilidade e visão estratégica.'
    },
    {
        'numero': 'V',
        'nome': 'O HIEROFANTE',
        'arquetipo': 'O Mestre Espiritual',
        'significado': 'O Hierofante é a ponte entre o divino e o humano, o portador da tradição e da sabedoria institucionalizada. Representa o ensino, a mentoria e os sistemas de crença.',
        'simbolos': 'Sentado entre dois pilares (como a Sacerdotisa, mas agora no mundo externo), ele abençoa dois discípulos. As três cruzes representam os três mundos (material, emocional, espiritual). As chaves aos seus pés simbolizam os mistérios que ele pode revelar.',
        'psicologia': 'Representa a necessidade de integrar-se a algo maior — uma tradição, comunidade ou sistema de crenças. É a fase em que buscamos mestres, guias e ensinamentos estruturados. Também pode indicar conformidade versus autenticidade.',
        'vida_real': 'Aparece quando buscamos educação formal, mentoria espiritual ou quando nos conectamos com tradições. Também surge quando questionamos se estamos seguindo nossas verdades ou apenas repetindo dogmas.',
        'mensagem': 'Honre a sabedoria que veio antes de você. Mas lembre-se: tradições servem para guiar, não para aprisionar. Busque mestres, mas mantenha seu discernimento. A verdadeira espiritualidade é pessoal.'
    },
    {
        'numero': 'VI',
        'nome': 'OS AMANTES',
        'arquetipo': 'A Grande Escolha',
        'significado': 'Os Amantes representam escolhas, relacionamentos e a integração de opostos. É o momento de decisão consciente baseada em valores pessoais.',
        'simbolos': 'Adão e Eva sob a bênção do Arcanjo Rafael. A árvore da vida (12 frutos) atrás de Adão e a árvore do conhecimento (com a serpente) atrás de Eva. O sol ao fundo representa consciência. É a escolha entre instinto e consciência.',
        'psicologia': 'Representa a individuação através da relação. Não é apenas sobre romance, mas sobre qualquer escolha que define quem somos. É o momento de integrar aspectos opostos da personalidade — masculino/feminino, consciente/inconsciente.',
        'vida_real': 'Surge em momentos de decisões importantes que definirão seu caminho. Pode ser uma escolha de relacionamento, carreira ou valores. É quando você precisa decidir baseado no que é verdadeiro para você, não no que é esperado.',
        'mensagem': 'Faça escolhas conscientes alinhadas com seus valores. Relacionamentos (com outros e consigo mesmo) exigem integração de opostos. Você é formado tanto pela luz quanto pela sombra — aceite ambos.'
    },
    {
        'numero': 'VII',
        'nome': 'O CARRO',
        'arquetipo': 'A Vitória Através da Determinação',
        'significado': 'O Carro representa a conquista através da força de vontade, o movimento dirigido e a superação de conflitos internos.',
        'simbolos': 'Um guerreiro em sua carruagem, puxada por duas esfinges (uma branca, uma preta — forças opostas). O cetro representa domínio, a armadura estrelar mostra proteção espiritual. O dossel de estrelas representa a influência celestial.',
        'psicologia': 'É o ego fortalecido que pode direcionar impulsos conflitantes. Representa a capacidade de manter-se focado apesar das distrações. É disciplina interna transformada em progresso externo.',
        'vida_real': 'Aparece quando você precisa avançar apesar das dificuldades. Quando forças opostas dentro de você (dúvida/confiança, medo/coragem) precisam ser harmonizadas para seguir em frente. Momentos de determinação e foco.',
        'mensagem': 'Mantenha o foco. Você tem controle sobre a direção de sua vida. Forças opostas dentro de você não precisam estar em conflito — podem trabalhar juntas. Avance com determinação.'
    },
    {
        'numero': 'VIII',
        'nome': 'A FORÇA',
        'arquetipo': 'A Coragem Compassiva',
        'significado': 'A Força representa o poder que vem da compaixão, não da dominação. É a coragem de enfrentar o que é selvagem dentro de nós com gentileza.',
        'simbolos': 'Uma mulher fechando suavemente a boca de um leão. O símbolo do infinito sobre sua cabeça mostra consciência ilimitada. A corrente de flores indica que o controle vem do amor, não da força bruta.',
        'psicologia': 'Representa a integração dos instintos através da compaixão. Não é reprimir a natureza animal, mas integrá-la com consciência. É força verdadeira — aquela que vem da aceitação e do amor-próprio.',
        'vida_real': 'Surge quando você precisa enfrentar seus medos, vícios ou aspectos selvagens da personalidade. Quando a raiva, o medo ou o desejo surgem e você escolhe não reprimi-los, mas integrá-los com consciência.',
        'mensagem': 'Verdadeira força é gentil. Você não precisa dominar seus instintos — precisa entendê-los e integrá-los. Coragem não é ausência de medo, mas a capacidade de agir apesar dele.'
    },
    {
        'numero': 'IX',
        'nome': 'O EREMITA',
        'arquetipo': 'A Busca Interior',
        'significado': 'O Eremita representa o retiro necessário, a busca interior e a sabedoria que vem da solidão. É o momento de virar-se para dentro.',
        'simbolos': 'Um velho sábio no topo de uma montanha, segurando uma lanterna com uma estrela de seis pontas (Selo de Salomão — equilíbrio). O cajado representa apoio e autoridade espiritual. A neve representa purificação.',
        'psicologia': 'É o processo de individuação que exige afastamento do coletivo. Representa a necessidade de solidão para encontrar respostas. É o momento de parar de buscar validação externa e olhar para dentro.',
        'vida_real': 'Aparece quando você precisa de tempo sozinho para refletir. Momentos de retiro, meditação, autoanálise. Quando as respostas não virão de livros ou pessoas, mas do silêncio e da reflexão.',
        'mensagem': 'Nem toda jornada é social. Às vezes você precisa se afastar para se encontrar. A sabedoria vem do silêncio. Ilumine seu próprio caminho antes de tentar iluminar o dos outros.'
    },
    {
        'numero': 'X',
        'nome': 'A RODA DA FORTUNA',
        'arquetipo': 'Os Ciclos Inevitáveis',
        'significado': 'A Roda da Fortuna representa os ciclos da vida, a impermanência e o destino que está além do controle individual.',
        'simbolos': 'Uma roda girando, com símbolos alquímicos e hebraicos. Criaturas dos evangelhos nos cantos (touro, leão, águia, anjo) representam os elementos fixos. Anúbis sobe, Set desce — o que sobe, desce.',
        'psicologia': 'Representa a aceitação da impermanência. É o reconhecimento de que há forças além do nosso controle. Também simboliza sincronicidades e o momento de reconhecer padrões cíclicos na vida.',
        'vida_real': 'Surge em momentos de grande mudança — para melhor ou pior. Quando circunstâncias externas mudam dramaticamente. Quando você percebe padrões repetitivos em sua vida. Momentos de sorte ou azar significativos.',
        'mensagem': 'Tudo é impermanente. O que está embaixo hoje pode estar em cima amanhã. Não se apegue à sorte nem desespere no azar. Há um ritmo maior na vida — aprenda a fluir com ele.'
    },
    {
        'numero': 'XI',
        'nome': 'A JUSTIÇA',
        'arquetipo': 'O Equilíbrio e a Responsabilidade',
        'significado': 'A Justiça representa causa e efeito, responsabilidade pessoal e a busca por equilíbrio. É o momento de colher o que foi plantado.',
        'simbolos': 'Uma figura segurando uma espada (discernimento) e uma balança (equilíbrio). Os pilares representam a lei universal. O quadrado no peito simboliza a fundação terrena da justiça.',
        'psicologia': 'Representa a confrontação com as consequências de nossas escolhas. É o superego maduro — não punitivo, mas equilibrado. Reconhecimento de que somos responsáveis por nossas vidas.',
        'vida_real': 'Aparece quando você enfrenta consequências — positivas ou negativas — de ações passadas. Momentos de decisões importantes, contratos, acordos. Quando você precisa ser honesto sobre sua parte em situações.',
        'mensagem': 'Você é responsável por suas escolhas. Justiça não é apenas sobre o que você recebe, mas sobre integridade em suas ações. Busque equilíbrio. O universo responde à energia que você emite.'
    },
    {
        'numero': 'XII',
        'nome': 'O ENFORCADO',
        'arquetipo': 'O Sacrifício Necessário',
        'significado': 'O Enforcado representa a suspensão voluntária, a mudança de perspectiva e o sacrifício que traz iluminação.',
        'simbolos': 'Um homem pendurado de cabeça para baixo em uma árvore viva, mas sereno. O halo ao redor da cabeça indica iluminação. Pendurado por uma perna, a outra forma um "4" — estabilidade no caos. As mãos atrás das costas formam um triângulo invertido.',
        'psicologia': 'Representa o momento de parar de lutar e se render. É a fase em que a perspectiva antiga precisa ser invertida. O sacrifício do ego menor para o despertar do self maior. Aceitação paradoxal.',
        'vida_real': 'Surge quando você está preso em uma situação sem solução aparente. Quando lutar só piora as coisas. Momentos de espera forçada, doença, crises existenciais. Quando você precisa ver tudo de um ângulo diferente.',
        'mensagem': 'Às vezes, parar é a ação mais poderosa. Nem tudo pode ser resolvido pela força. Mudanças de perspectiva vêm da suspensão do conhecido. O que parece sacrifício pode ser libertação.'
    },
    {
        'numero': 'XIII',
        'nome': 'A MORTE',
        'arquetipo': 'A Transformação Inevitável',
        'significado': 'A Morte não é o fim, mas a transformação profunda. Representa o que precisa morrer para que o novo nasça.',
        'simbolos': 'Um esqueleto cavaleiro com uma bandeira branca (pureza) e uma rosa (vida após a morte). O sol nascente entre os pilares ao fundo. Pessoas de todas as classes sociais caem — a morte não discrimina. O rio simboliza o fluxo da vida.',
        'psicologia': 'Representa o fim de identidades, crenças ou padrões que não servem mais. É a morte psicológica necessária para o renascimento. O luto pelo que foi, abrindo espaço para o que virá.',
        'vida_real': 'Aparece em finais definitivos — término de relacionamentos, perda de empregos, mudanças de identidade. Quando uma fase da vida termina completamente. Momentos de transformação radical.',
        'mensagem': 'Fim não é fracasso. Algumas coisas precisam morrer para que você possa crescer. Solte o que já não serve. A transformação pode ser dolorosa, mas é necessária. Confie no ciclo.'
    },
    {
        'numero': 'XIV',
        'nome': 'A TEMPERANÇA',
        'arquetipo': 'A Alquimia da Alma',
        'significado': 'A Temperança representa equilíbrio, paciência e a integração harmoniosa de opostos. É o processo de refinamento.',
        'simbolos': 'Um anjo com um pé na água e outro na terra, misturando líquidos entre duas taças. O triângulo no peito representa fogo, a coroa quadrada representa terra. Íris (mensageira) no fundo — a comunicação entre mundos.',
        'psicologia': 'Após a morte (transformação), vem a temperança (integração). É o processo de equilibrar extremos, de encontrar o meio-termo. Representa a alquimia interior — transformar chumbo em ouro.',
        'vida_real': 'Surge em períodos de cura após crises. Quando você precisa de paciência para integrar mudanças. Momentos de buscar equilíbrio entre trabalho e vida, razão e emoção, material e espiritual.',
        'mensagem': 'Paciência é a virtude do sábio. A verdadeira mudança é gradual. Equilibre seus opostos internos. A cura acontece gota a gota. Confie no processo de refinamento.'
    },
    {
        'numero': 'XV',
        'nome': 'O DIABO',
        'arquetipo': 'A Sombra e o Aprisionamento',
        'significado': 'O Diabo representa nossas prisões autoimposas, vícios, medos e a sombra que negamos. É o que nos mantém acorrentados.',
        'simbolos': 'Uma figura demoníaca com casal acorrentado — mas as correntes são frouxas (podem sair quando quiserem). Chifres e asas representam a natureza animal. O pentagrama invertido simboliza priorização do material sobre o espiritual.',
        'psicologia': 'É o confronto com a sombra junguiana — os aspectos que negamos em nós mesmos. Representa compulsões, vícios, relacionamentos tóxicos. O que mais tememos reconhecer em nós.',
        'vida_real': 'Aparece em vícios, padrões destrutivos, relacionamentos codependentes. Quando você se sente preso mas é, em parte, cúmplice de sua prisão. Momentos de enfrentar a sombra.',
        'mensagem': 'Você tem mais liberdade do que pensa. Suas correntes são, em grande parte, autoimposas. Enfrente sua sombra — o que você nega, controla você. Vícios são sintomas, não causas. Liberte-se.'
    },
    {
        'numero': 'XVI',
        'nome': 'A TORRE',
        'arquetipo': 'A Destruição Necessária',
        'significado': 'A Torre representa o colapso de estruturas falsas, revelações súbitas e a destruição que precede a reconstrução.',
        'simbolos': 'Uma torre sendo destruída por um raio, figuras caindo. A coroa no topo cai — ilusões de controle. O raio vem do céu — é uma intervenção do divino/destino. As 22 chamas representam os 22 arcanos — a jornada completa.',
        'psicologia': 'Representa o colapso do ego inflado, a destruição de ilusões. É o momento em que estruturas mentais falsas são demolidas. Pode ser traumático, mas é libertador.',
        'vida_real': 'Surge em crises súbitas, revelações chocantes, perdas inesperadas. Quando tudo que você construiu sobre fundações falsas desmorona. Momentos de colapso que forçam reconstrução.',
        'mensagem': 'Às vezes, o universo destrói o que você construiu porque estava sobre fundações falsas. Não é punição — é libertação. O que é verdadeiro sobrevive. Reconstrua sobre a verdade.'
    },
    {
        'numero': 'XVII',
        'nome': 'A ESTRELA',
        'arquetipo': 'A Esperança Renovada',
        'significado': 'A Estrela representa esperança, inspiração e renovação após a crise. É a cura e a conexão com algo maior.',
        'simbolos': 'Uma mulher nua despejando água em um rio e na terra. Oito estrelas (uma grande, sete menores) — luz eterna. O pássaro representa pensamentos elevados. A nudez simboliza vulnerabilidade autêntica e pureza.',
        'psicologia': 'Após a destruição da Torre, vem a esperança da Estrela. É o momento de cura, de reconexão com o self autêntico. Representa inspiração e fé renovadas.',
        'vida_real': 'Aparece em períodos de recuperação após crises. Quando você sente esperança novamente. Momentos de inspiração, de sentir-se guiado. Quando a cura verdadeira começa.',
        'mensagem': 'Sempre há esperança. Após a escuridão, vem a luz. Você está sendo guiado. Cure-se. Conecte-se com algo maior que você. O universo conspira a seu favor.'
    },
    {
        'numero': 'XVIII',
        'nome': 'A LUA',
        'arquetipo': 'A Jornada pelo Inconsciente',
        'significado': 'A Lua representa ilusão, medo, o inconsciente profundo e a jornada através da escuridão psíquica.',
        'simbolos': 'Dois cães/lobos uivando para a lua, um caminho entre duas torres levando ao desconhecido. Um lagostim emerge da água (inconsciente). A lua goteja — nutrição do psíquico. O caminho é incerto.',
        'psicologia': 'Representa a descida ao inconsciente profundo. Medos, ilusões, memórias reprimidas. É a noite escura da alma. O território entre o conhecido e o desconhecido.',
        'vida_real': 'Surge em períodos de confusão, ansiedade, quando você não confia em suas percepções. Pesadelos, medos irracionais. Quando tudo parece incerto e ameaçador. A travessia necessária.',
        'mensagem': 'Nem tudo é o que parece. Seus medos podem ser ilusões. Atravesse a noite com coragem — há sabedoria na escuridão. O que você teme pode ser um guia. Continue caminhando.'
    },
    {
        'numero': 'XIX',
        'nome': 'O SOL',
        'arquetipo': 'A Iluminação e a Alegria',
        'significado': 'O Sol representa clareza, vitalidade, sucesso e a alegria simples de existir. É a luz após a escuridão.',
        'simbolos': 'Um sol radiante, uma criança nua em um cavalo branco (inocência recuperada). Girassóis (voltados para a luz). A bandeira vermelha representa vitalidade. Tudo está claro e iluminado.',
        'psicologia': 'Após atravessar a Lua, você emerge no Sol — consciência clara, ego saudável, alegria autêntica. Representa o self integrado brilhando.',
        'vida_real': 'Aparece em momentos de sucesso, clareza, alegria. Quando tudo faz sentido. Quando você se sente vivo, vital, autêntico. Momentos de celebração merecida.',
        'mensagem': 'Você merece celebrar. A vida pode ser simples e alegre. Você atravessou a escuridão e emergiu mais forte. Brilhe. Compartilhe sua luz. A clareza chegou.'
    },
    {
        'numero': 'XX',
        'nome': 'O JULGAMENTO',
        'arquetipo': 'O Despertar e o Chamado',
        'significado': 'O Julgamento representa o despertar final, a avaliação honesta de si mesmo e o chamado para um propósito maior.',
        'simbolos': 'Um anjo (Gabriel) tocando trombeta, pessoas surgindo de caixões com braços abertos. Montanhas ao fundo. Cruz na bandeira (morte e ressurreição). É o chamado final para despertar.',
        'psicologia': 'Representa a integração de todas as experiências da jornada. É o momento de avaliar honestamente quem você se tornou. O chamado para viver seu propósito autêntico.',
        'vida_real': 'Surge em momentos de grande clareza sobre seu propósito. Quando você ouve um "chamado" inegável. Momentos de renascimento, de deixar o passado morto e abraçar nova vida.',
        'mensagem': 'É hora de despertar completamente. Avalie sua jornada com honestidade. Perdoe-se. Responda ao chamado de sua alma. Você renasceu. Viva de acordo com sua verdade.'
    },
    {
        'numero': 'XXI',
        'nome': 'O MUNDO',
        'arquetipo': 'A Completude e a Realização',
        'significado': 'O Mundo representa a completude, a integração total e a realização. É o fim de um ciclo e o início de outro em um nível superior.',
        'simbolos': 'Uma figura dançante, nua (autêntica), em uma grinalda de louros (vitória). Os quatro evangelhos nos cantos (integração total dos elementos). As fitas formam um infinito. Tudo está completo.',
        'psicologia': 'É a individuação completa no sentido junguiano. O self integrado dançando. Todas as partes reconciliadas. A jornada completa — mas não o fim definitivo.',
        'vida_real': 'Aparece em momentos de conclusão significativa. Quando um ciclo grande se fecha. Quando você alcança uma meta importante. A sensação de "cheguei" — mas sabendo que novos ciclos virão.',
        'mensagem': 'Você completou a jornada. Celebre sua realização. Mas lembre-se: o fim é sempre um novo começo. O Mundo leva de volta ao Louco. A dança continua eternamente.'
    }
]

def criar_conteudo():
    """Cria o conteúdo do ebook"""
    estilos = criar_estilos()
    story = []
    
    # Introdução
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("A JORNADA DO HERÓI NO TAROT", estilos['TituloArcano']))
    story.append(Spacer(1, 0.3*inch))
    
    intro_texto = """
    Os 22 Arcanos Maiores do Tarot são muito mais do que simples cartas de adivinhação. 
    Eles representam uma jornada completa de desenvolvimento humano — desde o Louco, 
    que dá o primeiro passo no desconhecido, até o Mundo, que dança na completude da realização.
    """
    story.append(Paragraph(intro_texto, estilos['Introducao']))
    story.append(Spacer(1, 0.2*inch))
    
    intro_texto2 = """
    Esta é a Jornada do Herói, o mito universal descrito por Joseph Campbell, mas codificado 
    nos símbolos ancestrais do Tarot. Cada arcano representa um estágio arquetípico — 
    desafios, realizações, provações e revelações que todos nós enfrentamos em nossa 
    evolução pessoal e espiritual.
    """
    story.append(Paragraph(intro_texto2, estilos['Introducao']))
    story.append(Spacer(1, 0.2*inch))
    
    intro_texto3 = """
    Neste ebook, você descobrirá como cada uma das 22 cartas reflete aspectos profundos 
    de sua própria jornada. Não importa onde você esteja agora — em algum ponto, você já 
    viveu ou viverá cada um desses arquétipos. O Tarot é um mapa da consciência humana.
    """
    story.append(Paragraph(intro_texto3, estilos['Introducao']))
    story.append(Spacer(1, 0.2*inch))
    
    intro_texto4 = """
    Prepare-se para uma jornada de autoconhecimento. Cada arcano oferece não apenas 
    conhecimento simbólico, mas insights práticos sobre como esses arquétipos aparecem 
    em sua vida cotidiana — e como você pode trabalhar conscientemente com eles.
    """
    story.append(Paragraph(intro_texto4, estilos['Introducao']))
    story.append(Spacer(1, 0.3*inch))
    
    citacao = """
    <i>"O privilégio de uma vida é tornar-se quem você realmente é."</i><br/>
    — Carl Jung
    """
    story.append(Paragraph(citacao, estilos['SubtituloCapa']))
    
    story.append(PageBreak())
    
    # Criar páginas para cada arcano
    for i, arcano in enumerate(ARCANOS):
        # Título do Arcano
        titulo = f"{arcano['numero']} — {arcano['nome']}"
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(titulo, estilos['TituloArcano']))
        
        # Arquétipo
        story.append(Paragraph(arcano['arquetipo'], estilos['SubtituloArcano']))
        story.append(Spacer(1, 0.2*inch))
        
        # Significado Essencial
        story.append(Paragraph("✦ Significado Essencial", estilos['Secao']))
        story.append(Paragraph(arcano['significado'], estilos['CorpoTexto']))
        story.append(Spacer(1, 0.15*inch))
        
        # Simbologia
        story.append(Paragraph("✦ Simbologia da Carta", estilos['Secao']))
        story.append(Paragraph(arcano['simbolos'], estilos['CorpoTexto']))
        story.append(Spacer(1, 0.15*inch))
        
        # Contexto Psicológico
        story.append(Paragraph("✦ Contexto Psicológico e Espiritual", estilos['Secao']))
        story.append(Paragraph(arcano['psicologia'], estilos['CorpoTexto']))
        story.append(Spacer(1, 0.15*inch))
        
        # Vida Real
        story.append(Paragraph("✦ Como Aparece na Vida Real", estilos['Secao']))
        story.append(Paragraph(arcano['vida_real'], estilos['CorpoTexto']))
        story.append(Spacer(1, 0.15*inch))
        
        # Mensagem
        story.append(Paragraph("✦ Mensagem de Evolução", estilos['Secao']))
        story.append(Paragraph(arcano['mensagem'], estilos['CorpoTexto']))
        
        # Quebra de página para próximo arcano
        if i < len(ARCANOS) - 1:
            story.append(PageBreak())
    
    # Conclusão
    story.append(PageBreak())
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("O MUNDO — E ALÉM", estilos['TituloArcano']))
    story.append(Spacer(1, 0.3*inch))
    
    conclusao1 = """
    Você chegou ao fim da jornada — ou seria ao começo? O Mundo, o último arcano, 
    representa completude, mas não conclusão definitiva. A figura dança na carta, 
    celebrando a integração de todas as experiências, mas a dança nunca para.
    """
    story.append(Paragraph(conclusao1, estilos['Introducao']))
    story.append(Spacer(1, 0.2*inch))
    
    conclusao2 = """
    A jornada pelos 22 Arcanos Maiores é cíclica. Quando você chega ao Mundo, 
    está pronto para começar novamente como o Louco — mas em um nível superior 
    de consciência. Cada ciclo traz mais sabedoria, mais integração, mais plenitude.
    """
    story.append(Paragraph(conclusao2, estilos['Introducao']))
    story.append(Spacer(1, 0.2*inch))
    
    conclusao3 = """
    Os arquétipos do Tarot não são apenas símbolos antigos — são mapas vivos de sua 
    própria psique. Você pode não estar consciente, mas provavelmente já viveu cada 
    uma dessas 22 etapas em algum momento de sua vida. E continuará vivendo-as, 
    em espirais cada vez mais profundas de compreensão.
    """
    story.append(Paragraph(conclusao3, estilos['Introducao']))
    story.append(Spacer(1, 0.2*inch))
    
    conclusao4 = """
    A pergunta não é "em qual arcano você está?" — porque você pode estar em vários 
    ao mesmo tempo, em diferentes áreas da vida. A pergunta é: "Você está consciente 
    da jornada?" Porque a consciência transforma a experiência de vítima das circunstâncias 
    em herói da própria história.
    """
    story.append(Paragraph(conclusao4, estilos['Introducao']))
    story.append(Spacer(1, 0.3*inch))
    
    reflexao = """
    <b>Reflexão Final:</b> Olhe para sua vida agora. Quais arcanos você reconhece? 
    Onde está o chamado do Louco? Onde você precisa da força compassiva da carta VIII? 
    Onde você está enfrentando sua Torre? E onde, talvez, você já dança como o Mundo?
    """
    story.append(Paragraph(reflexao, estilos['CorpoTexto']))
    story.append(Spacer(1, 0.3*inch))
    
    despedida = """
    A jornada nunca termina — ela apenas se transforma. Continue dançando.
    """
    story.append(Paragraph(despedida, estilos['SubtituloArcano']))
    story.append(Spacer(1, 0.5*inch))
    
    assinatura = """
    ✦✦✦<br/><br/>
    <i>Que esta jornada pelos 22 Arcanos Maiores ilumine seu caminho.</i>
    """
    story.append(Paragraph(assinatura, estilos['SubtituloCapa']))
    
    return story

def main():
    """Função principal"""
    print("🎨 Gerando ebook: Jornada do Herói - Os 22 Arcanos Maiores...")
    
    # Criar capa separadamente
    filename_final = "/mnt/user-data/outputs/jornada_heroi_arcanos_maiores.pdf"
    c = canvas.Canvas(filename_final, pagesize=A4)
    width, height = A4
    
    # Criar capa
    criar_capa(c, width, height)
    c.save()
    
    print("✓ Capa criada")
    
    # Criar conteúdo principal
    temp_content = "/home/claude/temp_content.pdf"
    doc = SimpleDocTemplate(
        temp_content,
        pagesize=A4,
        rightMargin=1.2*inch,
        leftMargin=1.2*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )
    
    story = criar_conteudo()
    doc.build(story, onFirstPage=desenhar_pagina_fundo, onLaterPages=desenhar_pagina_fundo)
    
    print("✓ Conteúdo criado")
    
    # Combinar capa com conteúdo
    from pypdf import PdfWriter, PdfReader
    
    writer = PdfWriter()
    
    # Adicionar capa
    reader_capa = PdfReader(filename_final)
    writer.add_page(reader_capa.pages[0])
    
    # Adicionar conteúdo
    reader_content = PdfReader(temp_content)
    for page in reader_content.pages:
        writer.add_page(page)
    
    # Salvar PDF final
    with open(filename_final, "wb") as output:
        writer.write(output)
    
    # Limpar arquivo temporário
    import os
    os.remove(temp_content)
    
    print(f"✓ Ebook completo gerado: {filename_final}")
    print(f"📄 Total de páginas: {len(reader_content.pages) + 1}")
    print("\n🎯 Características do ebook:")
    print("  • Capa com design místico (roxo, dourado)")
    print("  • Introdução à Jornada do Herói")
    print("  • 22 páginas dedicadas aos Arcanos Maiores")
    print("  • Conclusão e reflexão final")
    print("  • Identidade visual coesa em todo o documento")
    print("  • Tamanho: A4 (aprox. 30 páginas)")

if __name__ == "__main__":
    main()