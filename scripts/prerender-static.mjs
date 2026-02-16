import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://zayatarot.com';

const BASE_ROUTES = [
  { path: '/', title: 'Tiragem de Tarot Online Gratis | Leitura de Cartas', description: 'Descubra seu destino com tiragem de tarot online gratis. Leitura de cartas profissional com interpretacoes detalhadas.' },
  { path: '/jogos-de-tarot', title: 'Jogos de Tarot', description: 'Explore diferentes jogos de tarot: Tres Cartas, Cruz Celta, Tarot do Amor, Sim/Nao e mais.' },
  { path: '/spreads', title: 'Tarot Spreads', description: 'Explore different tarot spreads: Three Card, Celtic Cross, Love Check, Yes/No and more.' },
  { path: '/carta-do-dia', title: 'Carta do Dia Tarot no WhatsApp', description: 'Receba sua carta do dia do Tarot no WhatsApp com interpretacao completa, mensagem coletiva, mantra diario e conselho espiritual.' },
  { path: '/daily-card', title: 'Daily Tarot Card on WhatsApp', description: 'Get your daily tarot card on WhatsApp with complete interpretation, collective message, daily mantra and spiritual guidance.' },
  { path: '/tarot-por-signo', title: 'Tarot por Signo', description: 'Leitura de tarot personalizada para cada signo do zodiaco.' },
  { path: '/tarot-by-sign', title: 'Tarot by Zodiac Sign', description: 'Personalized tarot reading for each zodiac sign.' },
  { path: '/interpretacao', title: 'Interpretacao de Tarot', description: 'Guia completo de interpretacao de tarot com orientacoes detalhadas.' },
  { path: '/interpretation', title: 'Tarot Interpretation', description: 'Complete tarot interpretation guide with detailed insights.' },
  { path: '/arquivo-arcano', title: 'Arquivo Arcano - Todas as Cartas de Tarot', description: 'Explore todas as 78 cartas do tarot com significado e simbolismo.' },
  { path: '/arcane-archive', title: 'Arcane Archive - All Tarot Cards', description: 'Explore all 78 tarot cards with meaning and symbolism.' }
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

function replaceMeta(html, { path: routePath, title, description }) {
  const url = `${BASE_URL}${routePath}`;
  const fullTitle = `${title} | Zaya Tarot`;
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${fullTitle}</title>`)
    .replace(/<meta name="description"[\s\S]*?>/i, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${fullTitle}" />`)
    .replace(/<meta property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta name="twitter:url"[\s\S]*?>/i, `<meta name="twitter:url" content="${url}" />`)
    .replace(/<meta name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${fullTitle}" />`)
    .replace(/<meta name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${description}" />`);
}

function main() {
  if (!fs.existsSync(INDEX_FILE)) {
    throw new Error(`Missing build artifact: ${INDEX_FILE}`);
  }

  const baseHtml = fs.readFileSync(INDEX_FILE, 'utf8');

  for (const route of ROUTES) {
    if (route.path === '/') continue;
    const routeDir = path.join(DIST_DIR, route.path.replace(/^\//, ''));
    ensureDir(routeDir);
    const routeHtml = replaceMeta(baseHtml, route);
    fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
  }

  console.log(`Prerendered ${ROUTES.length - 1} static routes in dist/`);
}

main();
