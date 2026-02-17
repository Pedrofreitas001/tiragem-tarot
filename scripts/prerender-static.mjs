import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://www.zayatarot.com';

const BASE_ROUTES = [
  { path: '/', title: 'Tiragem de Tarot Online Gratis | Leitura de Cartas', description: 'Descubra seu destino com tiragem de tarot online gratis, leitura profissional e interpretacoes detalhadas para amor, trabalho e vida espiritual.' },
  { path: '/jogos-de-tarot', title: 'Jogos de Tarot', description: 'Explore jogos de tarot como Tres Cartas, Cruz Celta, Tarot do Amor e Sim ou Nao, com interpretacao clara e orientacao pratica para o dia.' },
  { path: '/spreads', title: 'Tarot Spreads', description: 'Explore tarot spreads like Three Card, Celtic Cross, Love Check and Yes or No, with clear interpretation and practical daily guidance.' },
  { path: '/carta-do-dia', title: 'Carta do Dia Tarot no WhatsApp', description: 'Receba sua carta do dia do Tarot no WhatsApp com interpretacao completa, mensagem coletiva, mantra diario e conselho espiritual.' },
  { path: '/daily-card', title: 'Daily Tarot Card on WhatsApp', description: 'Get your daily tarot card on WhatsApp with complete interpretation, collective message, daily mantra and spiritual guidance.' },
  { path: '/tarot-por-signo', title: 'Tarot por Signo', description: 'Leitura de tarot personalizada para cada signo do zodiaco, com previsoes e orientacoes para amor, trabalho e energia do dia.' },
  { path: '/tarot-by-sign', title: 'Tarot by Zodiac Sign', description: 'Personalized tarot reading for each zodiac sign, with practical guidance for love, career and your daily energy.' },
  { path: '/interpretacao', title: 'Interpretacao de Tarot', description: 'Guia de interpretacao de tarot com significados das cartas, exemplos praticos e orientacoes para amor, carreira e espiritualidade.' },
  { path: '/interpretation', title: 'Tarot Interpretation', description: 'Tarot interpretation guide with card meanings, practical examples and guidance for love, career and spirituality.' },
  { path: '/arquivo-arcano', title: 'Arquivo Arcano - Todas as Cartas de Tarot', description: 'Explore as cartas do tarot com significado, simbolismo e interpretacao pratica dos arcanos maiores e menores para sua jornada.' },
  { path: '/arcane-archive', title: 'Arcane Archive - All Tarot Cards', description: 'Explore tarot cards with meaning, symbolism and practical interpretation of major and minor arcana for daily guidance.' },
  { path: '/cosmic', title: 'Calendario Cosmico', description: 'Acompanhe fases da lua, energia cosmica do dia e alinhamento planetario para orientar suas escolhas.' },
  { path: '/privacidade', title: 'Politica de Privacidade', description: 'Entenda como seus dados sao coletados, usados e protegidos na plataforma Zaya Tarot.' },
  { path: '/termos', title: 'Termos de Uso', description: 'Leia os termos de uso da plataforma Zaya Tarot e as condicoes para utilizar os servicos.' },
  { path: '/privacy', title: 'Privacy Policy', description: 'Understand how your data is collected, used and protected on the Zaya Tarot platform.' },
  { path: '/terms', title: 'Terms of Use', description: 'Read the terms of use for the Zaya Tarot platform and service conditions.' }
];

const SIGNS = [
  { slug: 'aries', pt: 'Aries', en: 'Aries' },
  { slug: 'touro', pt: 'Touro', en: 'Taurus' },
  { slug: 'gemeos', pt: 'Gemeos', en: 'Gemini' },
  { slug: 'cancer', pt: 'Cancer', en: 'Cancer' },
  { slug: 'leao', pt: 'Leao', en: 'Leo' },
  { slug: 'virgem', pt: 'Virgem', en: 'Virgo' },
  { slug: 'libra', pt: 'Libra', en: 'Libra' },
  { slug: 'escorpiao', pt: 'Escorpiao', en: 'Scorpio' },
  { slug: 'sagitario', pt: 'Sagitario', en: 'Sagittarius' },
  { slug: 'capricornio', pt: 'Capricornio', en: 'Capricorn' },
  { slug: 'aquario', pt: 'Aquario', en: 'Aquarius' },
  { slug: 'peixes', pt: 'Peixes', en: 'Pisces' }
];

const MAJOR_ARCANA_ROUTES = [
  'carta-o-louco',
  'carta-o-mago',
  'carta-a-sacerdotisa',
  'carta-a-imperatriz',
  'carta-o-imperador',
  'carta-o-hierofante',
  'carta-os-enamorados',
  'carta-o-carro',
  'carta-a-forca',
  'carta-o-eremita',
  'carta-a-roda-da-fortuna',
  'carta-a-justica',
  'carta-o-enforcado',
  'carta-a-morte',
  'carta-a-temperanca',
  'carta-o-diabo',
  'carta-a-torre',
  'carta-a-estrela',
  'carta-a-lua',
  'carta-o-sol',
  'carta-o-julgamento',
  'carta-o-mundo'
];

const SIGN_ROUTES = SIGNS.flatMap((sign) => ([
  {
    path: `/tarot-por-signo/${sign.slug}`,
    title: `Tarot para ${sign.pt} Hoje`,
    description: `Veja a leitura de tarot para ${sign.pt} hoje e receba orientacao personalizada para amor, trabalho e energia do dia.`
  },
  {
    path: `/tarot-by-sign/${sign.slug}`,
    title: `Tarot for ${sign.en} Today`,
    description: `See today's tarot reading for ${sign.en} with personalized guidance for love, career and daily energy.`
  }
]));

const ARCANA_ROUTES = MAJOR_ARCANA_ROUTES.flatMap((slug) => ([
  {
    path: `/arquivo-arcano/${slug}`,
    title: `Significado no Tarot: ${slug.replaceAll('-', ' ')}`,
    description: 'Descubra significado, simbolismo e interpretacao pratica desta carta no Tarot para amor, trabalho e espiritualidade.'
  },
  {
    path: `/arcane-archive/${slug}`,
    title: `Tarot meaning: ${slug.replaceAll('-', ' ')}`,
    description: 'Discover meaning, symbolism and practical interpretation of this tarot card for love, career and spirituality.'
  }
]));

const ROUTES = [...BASE_ROUTES, ...SIGN_ROUTES, ...ARCANA_ROUTES];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildSeoFallback(route) {
  const coreLinks = [
    '<a href="/carta-do-dia">Carta do Dia</a>',
    '<a href="/tarot-por-signo">Tarot por Signo</a>',
    '<a href="/arquivo-arcano">Arquivo Arcano</a>',
    '<a href="/jogos-de-tarot">Jogos de Tarot</a>',
    '<a href="/interpretacao">Interpretacao</a>',
    '<a href="/cosmic">Calendario Cosmico</a>'
  ].join(' | ');

  const signLinks = SIGNS
    .map((sign) => `<a href="/tarot-por-signo/${sign.slug}">${sign.pt}</a>`)
    .join(' | ');

  const arcanaLinks = MAJOR_ARCANA_ROUTES
    .map((slug) => `<a href="/arquivo-arcano/${slug}">${slug.replace('carta-', '').replaceAll('-', ' ')}</a>`)
    .join(' | ');

  return `
<noscript id="seo-fallback">
  <main style="max-width:920px;margin:0 auto;padding:24px 16px;color:#f5f5f5;background:#1a1628;font-family:Arial,sans-serif;line-height:1.6">
    <h1 style="margin:0 0 12px;font-size:32px;color:#fff">${escapeHtml(route.title)}</h1>
    <p style="margin:0 0 12px;font-size:16px">${escapeHtml(route.description)}</p>
    <p style="margin:0 0 10px;font-size:14px">Zaya Tarot oferece tiragem online, leitura por signo, carta do dia e interpretacoes completas para amor, carreira e espiritualidade. Voce pode explorar spreads, consultar o arquivo de cartas, acompanhar energia cosmica e receber orientacoes praticas para suas decisoes.</p>
    <p style="margin:0 0 12px;font-size:14px">Este conteudo foi estruturado para facilitar navegacao e indexacao, com links internos para paginas de signos e arcanos, fortalecendo a descoberta de conteudo relacionado.</p>
    <nav style="font-size:14px;margin:0 0 8px">${coreLinks}</nav>
    <div style="font-size:13px;margin:0 0 8px"><strong>Signos:</strong> ${signLinks}</div>
    <div style="font-size:13px"><strong>Arcanos:</strong> ${arcanaLinks}</div>
  </main>
</noscript>`;
}

function replaceMeta(html, route) {
  const { path: routePath, title, description } = route;
  const url = `${BASE_URL}${routePath}`;
  const fullTitle = `${title} | Zaya Tarot`;
  const replaced = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${fullTitle}</title>`)
    .replace(/<meta name="description"[\s\S]*?>/i, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${fullTitle}" />`)
    .replace(/<meta property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta name="twitter:url"[\s\S]*?>/i, `<meta name="twitter:url" content="${url}" />`)
    .replace(/<meta name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${fullTitle}" />`)
    .replace(/<meta name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${description}" />`);

  const fallback = buildSeoFallback(route);
  return replaced
    .replace(/<noscript id="seo-fallback">[\s\S]*?<\/noscript>/i, '')
    .replace('</body>', `${fallback}\n</body>`);
}

function main() {
  if (!fs.existsSync(INDEX_FILE)) {
    throw new Error(`Missing build artifact: ${INDEX_FILE}`);
  }

  const baseHtml = fs.readFileSync(INDEX_FILE, 'utf8');

  for (const route of ROUTES) {
    const routeHtml = replaceMeta(baseHtml, route);
    if (route.path === '/') {
      fs.writeFileSync(INDEX_FILE, routeHtml, 'utf8');
    } else {
      const routeDir = path.join(DIST_DIR, route.path.replace(/^\//, ''));
      ensureDir(routeDir);
      fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
    }
  }

  console.log(`Prerendered ${ROUTES.length} static routes in dist/`);
}

main();
