import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaywall } from '../components/PaywallModal';
import { getEbookInfo } from '../services/ebookPdfService';
import { generateEbookPdfDev1 } from '../services/ebookPdfServiceDev1';

const IMG = (name: string) =>
  `https://images.weserv.nl/?url=sacred-texts.com/tarot/pkt/img/${name}`;

// ─────────────────────────────────────────────
// Mini PDF page previews
// ─────────────────────────────────────────────
function PagePreviewTheory() {
  return (
    <div className="ebook-page-frame">
      <div className="p-[5%] h-full flex flex-col">
        <div className="flex justify-between mb-[3%] opacity-35">
          <div className="w-[8%] aspect-square border-t border-l border-yellow-500" />
          <div className="w-[8%] aspect-square border-t border-r border-yellow-500" />
        </div>
        <p className="text-center text-[4.5px] text-yellow-400/45 uppercase tracking-widest mb-[3%]">ZAYA TAROT</p>
        <div className="flex-1 flex flex-col gap-[4%]">
          <div className="flex gap-[5%]">
            <div className="flex-1">
              <div className="h-[1.5px] w-[28%] bg-yellow-500/55 mb-[4%]" />
              <p className="text-[5px] text-yellow-300 font-bold uppercase tracking-wider mb-[2%]">O Louco</p>
              <p className="text-[4px] text-purple-300 italic mb-[5%]">O Chamado à Aventura</p>
              <div className="space-y-[3px]">{[100,88,100,78,100,72].map((w,i) => <div key={i} className="h-[1.5px] bg-purple-400/20 rounded" style={{width:`${w}%`}} />)}</div>
            </div>
            <div className="w-[30%] flex-shrink-0">
              <img src={IMG('ar00.jpg')} alt="" className="w-full rounded-sm border border-yellow-500/22" style={{filter:'sepia(8%) contrast(1.1)'}} />
            </div>
          </div>
          {['Essência do Arquétipo','Dimensão Psicológica','Integração na Jornada'].map(sec => (
            <div key={sec}>
              <p className="text-[3.5px] text-yellow-500/65 font-bold uppercase tracking-wider mb-[3px]">{sec}</p>
              <div className="space-y-[2.5px]">{[100,85,100,72].map((w,i) => <div key={i} className="h-[1.5px] bg-yellow-400/12 rounded" style={{width:`${w}%`}} />)}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-[3.5px] text-gray-600 mt-auto pt-[3%]">5 · zayatarot.com</p>
      </div>
    </div>
  );
}

function PagePreviewReflection() {
  return (
    <div className="ebook-page-frame">
      <div className="p-[5%] h-full flex flex-col">
        <div className="flex justify-between mb-[3%] opacity-35">
          <div className="w-[8%] aspect-square border-t border-l border-yellow-500" />
          <div className="w-[8%] aspect-square border-t border-r border-yellow-500" />
        </div>
        <p className="text-center text-[4.5px] text-yellow-400/45 uppercase tracking-widest mb-[2%]">ZAYA TAROT</p>
        <div className="flex-1 flex flex-col gap-[4%]">
          <div className="text-center">
            <p className="text-[6px] text-yellow-300 font-bold mb-[2px]">A Imperatriz</p>
            <p className="text-[4px] text-purple-300 italic mb-[3px]">Reflexão e Integração</p>
            <div className="h-px bg-yellow-500/28 mx-[10%]" />
          </div>
          <div>
            <p className="text-[3.5px] text-yellow-500/65 font-bold uppercase tracking-wider mb-[5px]">Perguntas para Reflexão</p>
            {[92,82,88].map((w,i) => (
              <div key={i} className="flex gap-[3px] mb-[4px] items-start">
                <span className="text-[3px] text-yellow-500/45 flex-shrink-0 mt-[1px]">•</span>
                <div className="h-[1.5px] bg-purple-300/18 rounded mt-[2px]" style={{width:`${w}%`}} />
              </div>
            ))}
          </div>
          <div className="mx-[2%] px-[4%] py-[4%] rounded border border-yellow-500/15 bg-yellow-500/4">
            <p className="text-[3.5px] text-yellow-500/62 font-bold mb-[4px]">Afirmação do Arquétipo</p>
            <p className="text-[3px] text-yellow-200/42 italic leading-[1.6]">"Eu nutro o que amo e o que amo floresce..."</p>
          </div>
          <div>
            <p className="text-[3.5px] text-yellow-500/65 font-bold uppercase tracking-wider mb-[3px]">Sinais da Presença</p>
            <div className="space-y-[2px]">{[100,80,92].map((w,i) => <div key={i} className="h-[1.5px] bg-purple-400/15 rounded" style={{width:`${w}%`}} />)}</div>
          </div>
          <div>
            <p className="text-[3.5px] text-yellow-500/65 font-bold uppercase tracking-wider mb-[3px]">Caminhos de Incorporação</p>
            <div className="space-y-[2px]">{[100,75,88].map((w,i) => <div key={i} className="h-[1.5px] bg-purple-400/15 rounded" style={{width:`${w}%`}} />)}</div>
          </div>
        </div>
        <p className="text-center text-[3.5px] text-gray-600 mt-auto pt-[2%]">12 · zayatarot.com</p>
      </div>
    </div>
  );
}

function PagePreviewSpread() {
  return (
    <div className="ebook-page-frame">
      <div className="p-[5%] h-full flex flex-col">
        <div className="flex justify-between mb-[3%] opacity-35">
          <div className="w-[8%] aspect-square border-t border-l border-yellow-500" />
          <div className="w-[8%] aspect-square border-t border-r border-yellow-500" />
        </div>
        <p className="text-center text-[4.5px] text-yellow-400/45 uppercase tracking-widest mb-[2%]">ZAYA TAROT</p>
        <div className="flex-1 flex flex-col gap-[3%]">
          <div className="text-center">
            <p className="text-[5.5px] text-yellow-300 font-bold mb-[2px]">A Tiragem da Jornada do Herói</p>
            <div className="h-px bg-yellow-500/28 mx-[8%] mb-[4px]" />
            <p className="text-[3.5px] text-gray-400 leading-[1.5]">7 posições que mapeiam dimensões da jornada presente</p>
          </div>
          <div className="grid grid-cols-4 gap-[3px] mt-[3%]">
            {['Chamado','Obstáculo','Recurso','Caminho'].map(l => (
              <div key={l} className="border border-yellow-500/20 rounded-[1px] p-[3px] text-center bg-yellow-500/4">
                <div className="aspect-[2/3] bg-purple-800/22 rounded-[1px] mb-[2px]" />
                <p className="text-[2.8px] text-yellow-400/50 leading-tight">{l}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-[3px] w-[75%] mx-auto">
            {['Sombra','Dom','Horizonte'].map(l => (
              <div key={l} className="border border-yellow-500/20 rounded-[1px] p-[3px] text-center bg-yellow-500/4">
                <div className="aspect-[2/3] bg-purple-800/22 rounded-[1px] mb-[2px]" />
                <p className="text-[2.8px] text-yellow-400/50 leading-tight">{l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-[2.5px] mt-[2%]">{[100,86,78,92].map((w,i) => <div key={i} className="h-[1.5px] bg-gray-500/16 rounded" style={{width:`${w}%`}} />)}</div>
        </div>
        <p className="text-center text-[3.5px] text-gray-600 mt-auto pt-[2%]">49 · zayatarot.com</p>
      </div>
    </div>
  );
}

function PagePreviewConclusion() {
  return (
    <div className="ebook-page-frame">
      <div className="p-[5%] h-full flex flex-col">
        <div className="flex justify-between mb-[3%] opacity-35">
          <div className="w-[8%] aspect-square border-t border-l border-yellow-500" />
          <div className="w-[8%] aspect-square border-t border-r border-yellow-500" />
        </div>
        <p className="text-center text-[4.5px] text-yellow-400/45 uppercase tracking-widest mb-[2%]">ZAYA TAROT</p>
        <div className="flex-1 flex flex-col gap-[4%]">
          <div className="text-center">
            <p className="text-[6.5px] text-yellow-300 font-bold mb-[2px]">O Mundo — E Além</p>
            <div className="h-px bg-yellow-500/28 mx-[12%] mb-[4px]" />
          </div>
          <div className="flex justify-center">
            <img src={IMG('ar21.jpg')} alt="" className="w-[32%] rounded-sm border border-yellow-500/22" style={{filter:'sepia(8%) contrast(1.05)'}} />
          </div>
          <div className="space-y-[2.5px]">{[100,86,100,76,100,82,100,70,88].map((w,i) => <div key={i} className="h-[1.5px] bg-purple-300/16 rounded" style={{width:`${w}%`}} />)}</div>
          <div className="mx-[4%] px-[4%] py-[3%] rounded border border-yellow-500/15 bg-yellow-500/4 text-center">
            <p className="text-[3px] text-yellow-300/50 italic leading-[1.6]">"A jornada é contínua e cíclica. O Mundo leva sempre de volta ao Louco..."</p>
          </div>
        </div>
        <p className="text-center text-[3.5px] text-gray-600 mt-auto pt-[2%]">53 · zayatarot.com</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Star dots helper
// ─────────────────────────────────────────────
const STARS = [
  { top:'8%',  left:'6%',   size:'2px',   op:'0.32' },
  { top:'12%', left:'22%',  size:'1.5px', op:'0.22' },
  { top:'6%',  left:'55%',  size:'1px',   op:'0.28' },
  { top:'9%',  right:'14%', size:'2px',   op:'0.26' },
  { top:'18%', left:'3%',   size:'1.5px', op:'0.20' },
  { top:'22%', right:'7%',  size:'1px',   op:'0.30' },
  { top:'35%', left:'12%',  size:'2px',   op:'0.24' },
  { top:'38%', right:'18%', size:'1.5px', op:'0.20' },
  { top:'48%', left:'5%',   size:'1px',   op:'0.28' },
  { top:'52%', right:'9%',  size:'2px',   op:'0.22' },
  { top:'62%', left:'18%',  size:'1.5px', op:'0.26' },
  { top:'68%', right:'22%', size:'1px',   op:'0.20' },
  { top:'75%', left:'8%',   size:'2px',   op:'0.28' },
  { top:'78%', right:'12%', size:'1.5px', op:'0.24' },
  { top:'85%', left:'28%',  size:'1px',   op:'0.22' },
  { top:'88%', right:'30%', size:'2px',   op:'0.18' },
  { top:'92%', left:'50%',  size:'1.5px', op:'0.26' },
  { top:'15%', left:'40%',  size:'1px',   op:'0.20' },
  { top:'45%', left:'60%',  size:'1.5px', op:'0.22' },
  { top:'70%', left:'45%',  size:'1px',   op:'0.24' },
];

function StarDots() {
  return (
    <>
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            top: s.top,
            left: (s as any).left,
            right: (s as any).right,
            width: s.size,
            height: s.size,
            opacity: s.op,
          }}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export function EbookLandingPage() {
  const navigate = useNavigate();
  const { isPremium } = usePaywall();
  const toPremium = () => navigate('/checkout');
  const toEbook   = () => navigate('/checkout');
  const [zoomedImg, setZoomedImg] = React.useState<string | null>(null);
  const [downloadingEbook, setDownloadingEbook] = React.useState(false);

  const handleDownloadEbook = async () => {
    try {
      setDownloadingEbook(true);
      const blob = await generateEbookPdfDev1(() => {});
      const info = getEbookInfo();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = info.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading ebook:', err);
    } finally {
      setDownloadingEbook(false);
    }
  };

  React.useEffect(() => {
    if (zoomedImg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [zoomedImg]);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: '#1a1628' }}>
      <style>{`
        .ebook-lp-mockup  { perspective: 1500px; }
        .ebook-lp-cover   {
          transform-style: preserve-3d;
          transform: rotateY(-20deg) rotateX(4deg);
          box-shadow: -20px 20px 60px rgba(0,0,0,0.6);
          transition: transform 0.35s ease;
        }
        .ebook-lp-cover:hover { transform: rotateY(-14deg) rotateX(2deg) scale(1.01); }
        .ebook-lp-page    {
          transform-style: preserve-3d;
          transform: rotateY(-20deg) rotateX(4deg);
          clip-path: inset(0 0 0 12%);
        }
        @keyframes lp-float {
          0%,100% { transform: translateY(0);    }
          50%      { transform: translateY(-12px); }
        }
        .ebook-lp-float { animation: lp-float 6s ease-in-out infinite; }
        .text-gradient-gold {
          background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ebook-page-frame {
          background: linear-gradient(160deg, #120724 0%, #1b0833 55%, #0e0520 100%);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 3px;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .ebook-page-frame:hover {
          transform: translateY(-5px) scale(1.015);
          box-shadow: 0 20px 48px rgba(0,0,0,0.65), 0 0 28px rgba(212,175,55,0.06);
        }
        @media (max-width: 640px) {
          .ebook-lp-cover       { transform: none !important; }
          .ebook-lp-cover:hover { transform: none !important; }
          .ebook-lp-float       { animation: none; }
        }
      `}</style>

      {/* ══════════════════════════════════════
          HERO — exact same bg treatment as home ebook section
      ══════════════════════════════════════ */}
      <section className="relative z-10 pt-8 pb-16 md:pb-24 lg:pb-32 px-4 md:px-6 bg-[#1a1628] overflow-hidden">
        {/* same blur orbs as home ebook */}
        <div className="absolute -left-40 top-10 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -right-32 bottom-10 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-purple-600/10 to-transparent blur-3xl pointer-events-none" />
        {/* star dots */}
        <div className="absolute top-[18%] left-[8%]  w-[2px] h-[2px] rounded-full bg-white/35 pointer-events-none" />
        <div className="absolute top-[24%] right-[12%] w-[1.5px] h-[1.5px] rounded-full bg-white/25 pointer-events-none" />
        <div className="absolute top-[78%] left-[15%]  w-[1px]  h-[1px]  rounded-full bg-white/30 pointer-events-none" />
        <div className="absolute top-[85%] right-[18%] w-[2px] h-[2px] rounded-full bg-white/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* back */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm mb-10"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Início
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-12 items-center">

            {/* ── Left ── */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              {/* badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/50 bg-yellow-500/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs uppercase tracking-[0.2em] text-yellow-300 font-bold">Arquivo Arcano · E-book</span>
              </div>

              <h1
                className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-gradient-gold w-full"
                style={{ fontFamily: "'Crimson Text', serif" }}
              >
                Jornada do Herói
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-gray-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
                Um guia de autoconhecimento que transforma o Tarot em linguagem viva. Cada arcano explorado como arquétipo da experiência humana — teoria, reflexão e exercícios que tocam onde importa.
              </p>

              {/* stats */}
              <div className="flex flex-wrap gap-x-7 gap-y-2 justify-center lg:justify-start">
                {[{n:'53',l:'páginas'},{n:'22',l:'arquetipos'},{n:'22',l:'exercícios'},{n:'1',l:'tiragem exclusiva'}].map(s => (
                  <div key={s.l} className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-gradient-gold" style={{ fontFamily: "'Crimson Text', serif" }}>{s.n}</span>
                    <span className="text-gray-500 text-xs">{s.l}</span>
                  </div>
                ))}
              </div>

              {/* CTAs — exact copy from home hero */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start items-stretch sm:items-center lg:items-start">
                <button
                  onClick={toPremium}
                  className="group relative w-full sm:w-auto px-12 py-3 min-w-[200px] bg-purple-600 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(123,82,171,0.3)] transition-all hover:shadow-[0_0_30px_rgba(123,82,171,0.6)] hover:-translate-y-1 text-xs"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity" />
                  <span className="relative z-10 text-white font-bold tracking-wide flex items-center justify-center gap-2">
                    Assinar Premium
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>
                <button
                  onClick={toEbook}
                  className="group w-full sm:w-auto px-4 py-3 md:px-6 md:py-3 bg-transparent border border-yellow-500/40 rounded-lg transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:-translate-y-1 text-[10px] md:text-xs"
                >
                  <span className="text-yellow-300 font-medium tracking-wide flex items-center justify-center gap-2 group-hover:text-yellow-400">
                    Comprar E-book · R$ 24,90
                    <span className="material-symbols-outlined text-sm">download</span>
                  </span>
                </button>
              </div>
            </div>

            {/* ── Right: 3D mockup (same as home) ── */}
            <div className="relative flex justify-center mt-0 mb-8 sm:mb-6 md:mb-4 lg:mb-0 lg:justify-end lg:-translate-x-14 translate-y-0 lg:translate-y-8 order-1 lg:order-2">
              <div className="ebook-lp-mockup w-[228px] sm:w-64 md:w-80 lg:w-96 relative ebook-lp-float overflow-hidden sm:overflow-visible pb-2 sm:pb-0">
                <div className="absolute top-3 right-3 z-30 bg-red-600 text-white text-[10px] tracking-wide px-2.5 py-1 rounded-md shadow-lg">Ebook Exclusivo</div>
                <div className="ebook-lp-cover aspect-[2/3] rounded-r-md border-l-2 sm:border-l-4 border-gray-900 relative overflow-hidden bg-gradient-to-b from-[#120724] via-[#1b0833] to-[#230b3f] mx-auto">
                  <div className="absolute inset-[8px]  border border-yellow-500/45 rounded-sm p-3 sm:p-4 flex flex-col justify-between" style={{height:'calc(100% - 16px)'}}>
                    <div className="w-full flex justify-between opacity-60">
                      <div className="w-4 h-4 border-t border-l border-yellow-500/80" />
                      <div className="w-4 h-4 border-t border-r border-yellow-500/80" />
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2 mt-3 sm:mt-6">
                      <p className="text-[9px] sm:text-[10px] italic text-white/80" style={{fontFamily:"'Crimson Text', serif"}}>Um ebook exclusivo por</p>
                      <h3 className="text-white tracking-widest text-[34px] sm:text-3xl font-semibold leading-[0.95]" style={{fontFamily:"'Crimson Text', serif"}}>ZAYA TAROT</h3>
                      <p className="text-[9px] sm:text-[10px] italic text-gradient-gold" style={{fontFamily:"'Crimson Text', serif"}}>Sabedoria ancestral para o caminho moderno</p>
                      <div className="h-px w-44 bg-yellow-500/60 mx-auto" />
                    </div>
                    <div className="flex justify-center mt-3 sm:mt-6">
                      <svg viewBox="0 0 280 120" className="w-40 sm:w-52 h-auto text-yellow-500/90">
                        <ellipse cx="140" cy="60" rx="92" ry="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <ellipse cx="140" cy="60" rx="82" ry="38" fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="140" cy="60" r="4.5" fill="currentColor" />
                        <circle cx="58"  cy="60" r="2.5" fill="currentColor" />
                        <circle cx="222" cy="60" r="2.5" fill="currentColor" />
                        <circle cx="140" cy="22" r="2.5" fill="currentColor" />
                        <circle cx="140" cy="98" r="2.5" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="text-center mt-1 sm:mt-2">
                      <h4 className="text-gradient-gold text-[38px] sm:text-5xl leading-[0.9]" style={{fontFamily:"'Crimson Text', serif"}}>Jornada do Heroi</h4>
                      <p className="text-white text-[12px] sm:text-lg mt-1 sm:mt-3" style={{fontFamily:"'Crimson Text', serif"}}>Os 22 Arcanos Maiores do Tarot</p>
                      <p className="italic text-[7px] sm:text-[10px] mt-1.5 sm:mt-6 px-4 sm:px-8 text-gradient-gold" style={{fontFamily:"'Crimson Text', serif"}}>Uma jornada de autoconhecimento através dos arquetipos ancestrais do Tarot</p>
                      <div className="h-px w-40 sm:w-44 bg-yellow-500/50 mx-auto mt-1.5 sm:mt-4" />
                      <p className="text-gradient-gold uppercase tracking-widest text-[8px] sm:text-[11px] mt-1 sm:mt-3 font-semibold" style={{fontFamily:"'Crimson Text', serif"}}>Arquivo Arcano</p>
                      <p className="text-white/70 text-[7px] sm:text-[9px] mt-0.5 sm:mt-1" style={{fontFamily:"'Crimson Text', serif"}}>Material exclusivo para desenvolvimento pessoal</p>
                    </div>
                    <div className="w-full flex justify-between opacity-60 mt-3">
                      <div className="w-4 h-4 border-b border-l border-yellow-500/80" />
                      <div className="w-4 h-4 border-b border-r border-yellow-500/80" />
                    </div>
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/60 to-transparent z-20" />
                </div>
                <div className="hidden sm:block ebook-lp-page absolute top-2 -right-8 w-[82%] h-[98%] rounded-r-md border border-gray-700/90 -z-10 bg-[#2a193d]" />
                <div className="hidden md:block ebook-lp-page absolute top-4 -right-14 w-[74%] h-[96%] rounded-r-md border border-gray-700/80 -z-20 bg-[#231533]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          O QUE VOCÊ VAI ENCONTRAR + SUMÁRIO (2 cols)
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-20 md:py-28 px-4 md:px-6 bg-[#110e1a] overflow-hidden">
        <div className="absolute -left-32 top-10 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-purple-600/14 via-purple-500/8 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -right-24 bottom-8 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-purple-500/12 via-pink-500/6 to-transparent blur-3xl pointer-events-none" />
        {/* stars */}
        <div className="absolute top-[12%] left-[4%]   w-[2px] h-[2px] rounded-full bg-white/28 pointer-events-none" />
        <div className="absolute top-[20%] right-[6%]  w-[1.5px] h-[1.5px] rounded-full bg-white/22 pointer-events-none" />
        <div className="absolute top-[55%] left-[8%]   w-[1px]  h-[1px]  rounded-full bg-white/26 pointer-events-none" />
        <div className="absolute top-[70%] right-[14%] w-[2px] h-[2px] rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute top-[40%] left-[45%]  w-[1.5px] h-[1.5px] rounded-full bg-white/18 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-gradient-gold tracking-tight leading-tight mb-4" style={{fontFamily:"'Crimson Text', serif"}}>
              O que você vai encontrar
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto font-light leading-relaxed">
              Cada arcano maior é um espelho — uma forma da vida se revelar em padrões que você já conhece.
            </p>
          </div>

          {/* Estrelas estáticas na seção */}
          <div className="absolute top-[8%] left-[12%] w-[3px] h-[3px] rounded-full bg-white/60 pointer-events-none" />
          <div className="absolute top-[15%] right-[18%] w-[2.5px] h-[2.5px] rounded-full bg-white/50 pointer-events-none" />
          <div className="absolute top-[30%] left-[3%] w-[2px] h-[2px] rounded-full bg-white/55 pointer-events-none" />
          <div className="absolute top-[45%] right-[5%] w-[3px] h-[3px] rounded-full bg-white/45 pointer-events-none" />
          <div className="absolute top-[60%] left-[20%] w-[2.5px] h-[2.5px] rounded-full bg-white/50 pointer-events-none" />
          <div className="absolute top-[75%] right-[12%] w-[2px] h-[2px] rounded-full bg-white/55 pointer-events-none" />
          <div className="absolute top-[85%] left-[8%] w-[3px] h-[3px] rounded-full bg-white/40 pointer-events-none" />
          <div className="absolute top-[22%] left-[50%] w-[2.5px] h-[2.5px] rounded-full bg-white/50 pointer-events-none" />
          <div className="absolute top-[50%] right-[30%] w-[2px] h-[2px] rounded-full bg-white/55 pointer-events-none" />
          <div className="absolute top-[68%] left-[40%] w-[3px] h-[3px] rounded-full bg-white/45 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">

            {/* ── Left: Features with subtle aesthetic icons ── */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/35 bg-gradient-to-br from-[#1a1035] via-[#1f1331] to-[#2b1c3f] shadow-[0_20px_42px_rgba(8,4,18,0.5)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/35 to-transparent" />
              <div className="absolute top-[10%] left-[5%] w-[2px] h-[2px] rounded-full bg-white/20 pointer-events-none" />
              <div className="absolute top-[25%] right-[8%] w-[1.5px] h-[1.5px] rounded-full bg-white/15 pointer-events-none" />
              <div className="absolute top-[50%] left-[3%] w-[1px] h-[1px] rounded-full bg-white/20 pointer-events-none" />
              <div className="absolute top-[75%] right-[5%] w-[2px] h-[2px] rounded-full bg-white/12 pointer-events-none" />
              <div className="absolute bottom-[15%] left-[8%] w-[1.5px] h-[1.5px] rounded-full bg-white/18 pointer-events-none" />
              <div className="relative z-10 px-5 md:px-7 py-8 space-y-0 h-full flex flex-col justify-center">
                {[
                  { icon: '☽',  title: 'Os 22 Arquetipos em Profundidade',    desc: 'Teoria, simbolismo RWS, dimensão psicológica e integração na jornada — para cada um dos 22 Arcanos Maiores.' },
                  { icon: '✧',  title: 'Exercícios de Reflexão e Integração', desc: 'Perguntas profundas, afirmações arquetípicas e caminhos de incorporação. Sem rituais, sem esoterismo pesado.' },
                  { icon: '◈',  title: 'A Tiragem da Jornada do Herói',       desc: '7 posições que mapeiam a jornada presente: chamado, obstáculo, recurso, caminho, sombra, dom e horizonte.' },
                  { icon: '⟡',  title: 'Localizando-se na Jornada',           desc: 'Método reflexivo para identificar em qual arquétipo você está vivendo agora — sem fórmulas, sem numerologia.' },
                ].map((f, i, arr) => (
                  <div key={f.title}>
                    <div className="flex gap-4 items-start py-5">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-[#d4af37]/25" style={{
                        background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
                      }}>
                        <span className="text-[#d4af37]/70 text-lg leading-none">{f.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#f3e6c3] font-bold mb-1.5 leading-snug" style={{fontFamily:"'Crimson Text', serif", fontSize:'1.08rem'}}>{f.title}</h3>
                        <p className="text-[#e6d8ba]/70 text-sm leading-relaxed font-light">{f.desc}</p>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-px mx-2" style={{background:'linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent)'}} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Aged tarot-card style TOC ── */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_42px_rgba(8,4,18,0.5)]">
              {/* Aged parchment background */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(170deg, #d4bc8b 0%, #c4a870 15%, #b89a60 30%, #c9ad78 50%, #bfa068 70%, #d0b880 90%, #c8a86e 100%)',
              }} />
              {/* Noise / grain texture overlay */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
              }} />
              {/* Deep vignette for aged look */}
              <div className="absolute inset-0 pointer-events-none" style={{
                boxShadow: 'inset 0 0 80px rgba(60, 30, 5, 0.4), inset 0 0 30px rgba(80, 50, 10, 0.2)',
              }} />
              {/* Burn marks / stain spots */}
              <div className="absolute top-[8%] right-[10%] w-16 h-16 rounded-full bg-[#8a6830]/15 blur-xl pointer-events-none" />
              <div className="absolute bottom-[12%] left-[8%] w-20 h-14 rounded-full bg-[#6b4f20]/12 blur-xl pointer-events-none" />
              {/* Ornamental double border */}
              <div className="absolute inset-3 border border-[#8a6830]/30 rounded-xl pointer-events-none" />
              <div className="absolute inset-5 border border-[#8a6830]/15 rounded-lg pointer-events-none" />
              {/* Corner ornaments */}
              <span className="absolute left-6 top-4 text-[#7a5a28]/50 text-sm pointer-events-none select-none" style={{fontFamily:"serif"}}>❧</span>
              <span className="absolute right-6 top-4 text-[#7a5a28]/50 text-sm pointer-events-none select-none rotate-180 inline-block" style={{fontFamily:"serif", transform:'scaleX(-1)'}}>❧</span>
              <span className="absolute left-6 bottom-4 text-[#7a5a28]/50 text-sm pointer-events-none select-none" style={{fontFamily:"serif", transform:'scaleY(-1)'}}>❧</span>
              <span className="absolute right-6 bottom-4 text-[#7a5a28]/50 text-sm pointer-events-none select-none" style={{fontFamily:"serif", transform:'scale(-1)'}}>❧</span>

              <div className="relative z-10 px-8 md:px-10 py-8 h-full flex flex-col justify-center">
                {/* Header with old-world style */}
                <div className="text-center mb-5 pb-3" style={{ borderBottom: '1px solid rgba(100,70,25,0.3)' }}>
                  <div className="text-[#6b4f2a]/40 text-[10px] tracking-[0.3em] uppercase mb-1">✦ ✦ ✦</div>
                  <h3 className="font-bold tracking-wider text-[#3d2510]" style={{fontFamily:"'Crimson Text', serif", fontSize:'1.25rem', letterSpacing:'0.04em'}}>
                    Índice do conteúdo
                  </h3>
                  <p className="text-[#6b4f2a]/60 text-[11px] mt-1 italic" style={{fontFamily:"'Crimson Text', serif"}}>— 53 páginas · PDF de alta qualidade —</p>
                </div>

                <div className="space-y-0">
                  {[
                    { label: 'Capa',                                           pg: '1' },
                    { label: 'Este Livro Chegou até Você por uma Razão',       pg: '2' },
                    { label: 'Quatro Formas de Habitar Este Livro',            pg: '3' },
                    { label: 'Sumário',                                        pg: '4' },
                    { label: 'Os 22 Arcanos Maiores',                         pg: '5 – 48' },
                    { label: 'A Tiragem da Jornada do Herói',                 pg: '49' },
                    { label: 'Localizando-se na Jornada',                     pg: '50' },
                    { label: 'Tarot como Ferramenta de Consciência',          pg: '51' },
                    { label: 'Quando o Livro se Fecha',                       pg: '52' },
                    { label: 'O Mundo — E Além  (Conclusão)',                 pg: '53' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-baseline gap-1 py-[6px]"
                    >
                      <span className="text-[#3d2510] text-[13px] leading-snug flex-shrink-0" style={{fontFamily:"'Crimson Text', serif"}}>
                        {item.label}
                      </span>
                      <span className="flex-1 min-w-[16px] translate-y-[-3px]" style={{
                        borderBottom: '1px dotted rgba(100,70,25,0.35)',
                      }} />
                      <span className="text-[#5a3d18] text-[13px] flex-shrink-0 font-bold tabular-nums" style={{fontFamily:"'Crimson Text', serif"}}>{item.pg}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom ornament */}
                <div className="text-center mt-5 pt-3" style={{ borderTop: '1px solid rgba(100,70,25,0.2)' }}>
                  <span className="text-[#7a5a28]/35 text-xs tracking-[0.4em]">⟡ ⟡ ⟡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DENTRO DO E-BOOK (carousel gallery)
      ══════════════════════════════════════ */}
      {(() => {
        const ebookPages = [
          { src: '/images/pdfs/pdf_3.jpg', label: 'Teoria do Arcano' },
          { src: '/images/pdfs/pdf_1.jpg', label: 'Reflexão e Integração' },
          { src: '/images/pdfs/pdf_2.jpg', label: 'Tiragem da Jornada' },
          { src: '/images/pdfs/pdf_4.jpg', label: 'Conclusão' },
        ];
        const [pageIndex, setPageIndex] = React.useState(0);
        const getPos = (idx: number) => {
          const total = ebookPages.length;
          let diff = idx - pageIndex;
          if (diff > total / 2) diff -= total;
          if (diff < -total / 2) diff += total;
          return diff;
        };
        return (
          <section className="relative z-10 py-20 md:py-28 px-4 md:px-6 bg-[#211d34] overflow-hidden">
            <div className="absolute -right-40 top-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-purple-600/12 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-purple-700/10 to-transparent blur-3xl pointer-events-none" />
            {/* Dense stars */}
            <div className="absolute inset-0 opacity-50 z-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 0.8px, transparent 0.8px)', backgroundSize: '90px 90px' }} />
            <div className="absolute top-[10%] left-[8%] w-[3px] h-[3px] rounded-full bg-white/50 pointer-events-none" />
            <div className="absolute top-[20%] right-[12%] w-[2px] h-[2px] rounded-full bg-white/40 pointer-events-none" />
            <div className="absolute top-[45%] left-[5%] w-[2.5px] h-[2.5px] rounded-full bg-white/45 pointer-events-none" />
            <div className="absolute top-[65%] right-[8%] w-[2px] h-[2px] rounded-full bg-white/35 pointer-events-none" />
            <div className="absolute top-[80%] left-[15%] w-[3px] h-[3px] rounded-full bg-white/40 pointer-events-none" />
            <div className="absolute top-[35%] right-[25%] w-[2px] h-[2px] rounded-full bg-white/30 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
              <div className="text-center mb-14 md:mb-20">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-gradient-gold tracking-tight leading-tight mb-4" style={{fontFamily:"'Crimson Text', serif"}}>
                  Dentro do e-book
                </h2>
                <p className="text-gray-400 text-base max-w-md mx-auto font-light leading-relaxed">
                  Um design pensado para imersão — cada página como um convite à reflexão silenciosa.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-32 top-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/15 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute -right-24 top-16 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-pink-500/10 to-transparent blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-[920px] mx-auto">
                  {/* Navigation arrows */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <button
                      type="button"
                      onClick={() => setPageIndex(p => (p - 1 + ebookPages.length) % ebookPages.length)}
                      className="w-10 h-10 rounded-full border border-yellow-500/40 bg-[#120a20]/80 text-yellow-300 inline-flex items-center justify-center hover:bg-[#1a102e] transition-colors"
                      aria-label="Página anterior"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <p className="text-xs text-gray-300/90">
                      Navegue pelas páginas
                    </p>
                    <button
                      type="button"
                      onClick={() => setPageIndex(p => (p + 1) % ebookPages.length)}
                      className="w-10 h-10 rounded-full border border-yellow-500/40 bg-[#120a20]/80 text-yellow-300 inline-flex items-center justify-center hover:bg-[#1a102e] transition-colors"
                      aria-label="Próxima página"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>

                  {/* Carousel */}
                  <div className="relative h-[380px] sm:h-[440px] md:h-[520px] overflow-hidden">
                    {ebookPages.map((page, idx) => {
                      const pos = getPos(idx);
                      const isCenter = pos === 0;
                      const isSide = Math.abs(pos) === 1;
                      const translatePct = pos * 44;
                      const scale = isCenter ? 1 : isSide ? 0.78 : 0.6;
                      const opacity = isCenter ? 1 : isSide ? 0.5 : 0;
                      const z = isCenter ? 30 : isSide ? 20 : 10;

                      return (
                        <div
                          key={`ebook-page-${idx}`}
                          className="absolute left-1/2 top-1/2 w-[240px] sm:w-[280px] md:w-[340px] transition-all duration-500 ease-out"
                          style={{
                            transform: `translate(-50%, -50%) translateX(${translatePct}%) scale(${scale})`,
                            opacity,
                            zIndex: z,
                            filter: isCenter ? 'none' : 'saturate(0.7) brightness(0.7)',
                          }}
                        >
                          <div
                            className={isCenter ? 'cursor-zoom-in' : 'cursor-pointer'}
                            onClick={() => {
                              if (isCenter) {
                                setZoomedImg(page.src);
                              } else {
                                setPageIndex(idx);
                              }
                            }}
                          >
                            <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                              <img
                                src={page.src}
                                alt={page.label}
                                className="w-full h-auto object-cover"
                                loading="lazy"
                              />
                            </div>
                            {isCenter && (
                              <p className="text-center text-gray-300 text-sm mt-4 tracking-wide font-medium" style={{fontFamily:"'Crimson Text', serif"}}>
                                {page.label}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dot indicators */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {ebookPages.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        onClick={() => setPageIndex(idx)}
                        className={`rounded-full transition-all duration-300 ${idx === pageIndex ? 'w-6 h-2 bg-[#d4af37]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lightbox zoom */}
            {zoomedImg && (
              <div
                className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center cursor-zoom-out p-4"
                onClick={() => setZoomedImg(null)}
              >
                <img
                  src={zoomedImg}
                  alt="Preview ampliado"
                  className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-[#d4af37]/30"
                />
              </div>
            )}
          </section>
        );
      })()}

      {/* ══════════════════════════════════════
          PRICING — Clean & Sophisticated
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 md:py-32 px-4 md:px-6 bg-[#0f0c18] overflow-hidden">
        {/* Minimal ambient glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-900/8 blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-[#d4af37]/60 text-[11px] uppercase tracking-[0.25em] mb-4">Acesso</p>
            <h2 className="text-3xl md:text-4xl font-normal text-white tracking-tight leading-tight mb-3" style={{fontFamily:"'Crimson Text', serif"}}>
              Duas formas de acessar
            </h2>
            <div className="w-12 h-px bg-[#d4af37]/30 mx-auto" />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

            {/* ── Ebook avulso ── */}
            <div
              className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#d4af37]/20 hover:bg-white/[0.04] cursor-pointer flex flex-col"
              onClick={toEbook}
            >
              <div className="mb-4">
                <h3 className="text-white text-lg font-medium tracking-tight" style={{fontFamily:"'Crimson Text', serif"}}>E-book Avulso</h3>
                <p className="text-gray-500 text-xs mt-0.5">Acesso vitalício · Download imediato</p>
                <div className="mt-3">
                  <span className="text-white text-2xl font-light" style={{fontFamily:"'Crimson Text', serif"}}>R$ 24,90</span>
                  <span className="text-gray-600 text-[10px] ml-1.5">pagamento único</span>
                </div>
              </div>

              <div className="h-px bg-white/[0.05] my-3" />

              <div className="space-y-2 mb-5 flex-1">
                {[
                  '53 páginas em PDF',
                  '22 arquetipos',
                  '22 exercícios de reflexão',
                  'Tiragem da Jornada do Herói',
                  'Localizando-se na Jornada',
                  'Tarot como consciência',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#d4af37]/40 flex-shrink-0" />
                    <span className="text-gray-400 text-[11px]">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); toEbook(); }}
                className="w-full py-2.5 border border-[#d4af37]/25 rounded-lg text-[#d4af37] text-xs font-medium tracking-wide transition-all hover:bg-[#d4af37]/10 hover:border-[#d4af37]/40 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Comprar E-book
              </button>
            </div>

            {/* ── Premium ── */}
            <div
              className="group relative rounded-xl border border-[#d4af37]/15 bg-gradient-to-b from-[#d4af37]/[0.03] to-transparent p-6 transition-all duration-300 hover:border-[#d4af37]/30 cursor-pointer flex flex-col"
              onClick={toPremium}
            >
              {/* Recommended tag */}
              <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#d4af37] rounded-full">
                <span className="text-[#0f0c18] text-[9px] font-bold uppercase tracking-[0.15em]">Recomendado</span>
              </div>

              <div className="mb-4 mt-1">
                <h3 className="text-white text-lg font-medium tracking-tight" style={{fontFamily:"'Crimson Text', serif"}}>Plano Premium</h3>
                <p className="text-gray-500 text-xs mt-0.5">Tudo do e-book + plataforma completa</p>
                <div className="mt-3">
                  <span className="text-white text-2xl font-light" style={{fontFamily:"'Crimson Text', serif"}}>R$ 19,90</span>
                  <span className="text-gray-600 text-[10px] ml-1.5">/mês · cancele quando quiser</span>
                </div>
              </div>

              <div className="h-px bg-white/[0.05] my-3" />

              <div className="space-y-2 mb-5 flex-1">
                {[
                  'E-book incluso',
                  'Tiragens com IA',
                  'Carta do Dia no WhatsApp',
                  'Arquivo Arcano · 78 cartas',
                  'Histórico da jornada',
                  'Novos conteúdos mensais',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#d4af37]/60 flex-shrink-0" />
                    <span className="text-gray-300 text-[11px]">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); isPremium ? handleDownloadEbook() : toPremium(); }}
                disabled={downloadingEbook}
                className="w-full py-2.5 bg-[#d4af37] rounded-lg text-[#0f0c18] text-xs font-bold tracking-wide transition-all hover:bg-[#e0bf4a] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {isPremium ? (downloadingEbook ? 'Gerando download...' : 'Baixar E-book') : 'Assinar Premium'}
                <span className="material-symbols-outlined text-sm">{isPremium ? 'download' : 'arrow_forward'}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
