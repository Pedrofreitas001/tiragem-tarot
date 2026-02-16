import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://zayatarot.com';

const ROUTES = [
  { path: '/', title: 'Tiragem de Tarot Online Gratis | Leitura de Cartas', description: 'Descubra seu destino com tiragem de tarot online gratis. Leitura de cartas profissional com interpretacoes detalhadas.' },
  { path: '/jogos-de-tarot', title: 'Jogos de Tarot', description: 'Explore diferentes jogos de tarot: Tres Cartas, Cruz Celta, Tarot do Amor, Sim/Nao e mais.' },
  { path: '/spreads', title: 'Tarot Spreads', description: 'Explore different tarot spreads: Three Card, Celtic Cross, Love Check, Yes/No and more.' },
  { path: '/carta-do-dia', title: 'Carta do Dia - Tarot Diario', description: 'Descubra a carta de tarot do dia com orientacao e interpretacao completa.' },
  { path: '/daily-card', title: 'Daily Tarot Card', description: 'Discover your daily tarot card with complete interpretation and guidance.' },
  { path: '/tarot-por-signo', title: 'Tarot por Signo', description: 'Leitura de tarot personalizada para cada signo do zodiaco.' },
  { path: '/tarot-by-sign', title: 'Tarot by Zodiac Sign', description: 'Personalized tarot reading for each zodiac sign.' },
  { path: '/interpretacao', title: 'Interpretacao de Tarot', description: 'Guia completo de interpretacao de tarot com orientacoes detalhadas.' },
  { path: '/interpretation', title: 'Tarot Interpretation', description: 'Complete tarot interpretation guide with detailed insights.' },
  { path: '/arquivo-arcano', title: 'Arquivo Arcano - Todas as Cartas de Tarot', description: 'Explore todas as 78 cartas do tarot com significado e simbolismo.' },
  { path: '/arcane-archive', title: 'Arcane Archive - All Tarot Cards', description: 'Explore all 78 tarot cards with meaning and symbolism.' }
];

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

