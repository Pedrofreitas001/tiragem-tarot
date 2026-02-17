import { useNavigate } from 'react-router-dom';

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
  const toPremium = () => navigate('/checkout');
  const toEbook   = () => navigate('/checkout');

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
            <div className="relative flex justify-center mt-3 sm:mt-0 lg:justify-end lg:-translate-x-14 translate-y-16 sm:translate-y-12 md:translate-y-8 lg:translate-y-16 order-1 lg:order-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">

            {/* ── Left: Features (same card style as home "Por que o Tarot?") ── */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/35 bg-gradient-to-br from-[#2b1c3f]/90 via-[#1f1331]/90 to-[#2b1c3f]/90 shadow-[0_20px_42px_rgba(8,4,18,0.42)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/35 to-transparent" />
              <span className="absolute left-3 top-2 text-[11px] text-[#d4af37]/75 pointer-events-none select-none">✦</span>
              <span className="absolute right-3 top-2 text-[11px] text-[#d4af37]/55 pointer-events-none select-none">✦</span>
              <span className="absolute left-3 bottom-2 text-[11px] text-[#d4af37]/55 pointer-events-none select-none">✦</span>
              <span className="absolute right-3 bottom-2 text-[11px] text-[#d4af37]/75 pointer-events-none select-none">✦</span>
              <div className="relative z-10 px-6 md:px-8 py-10 space-y-0">
                {[
                  { icon: 'psychology',  title: 'Os 22 Arquetipos em Profundidade',    desc: 'Teoria, simbolismo RWS, dimensão psicológica e integração na jornada — para cada um dos 22 Arcanos Maiores.' },
                  { icon: 'edit_note',   title: 'Exercícios de Reflexão e Integração', desc: 'Perguntas profundas, afirmações arquetípicas e caminhos de incorporação. Sem rituais, sem esoterismo pesado.' },
                  { icon: 'explore',     title: 'A Tiragem da Jornada do Herói',       desc: '7 posições que mapeiam a jornada presente: chamado, obstáculo, recurso, caminho, sombra, dom e horizonte.' },
                  { icon: 'location_on', title: 'Localizando-se na Jornada',           desc: 'Método reflexivo para identificar em qual arquétipo você está vivendo agora — sem fórmulas, sem numerologia.' },
                ].map((f, i, arr) => (
                  <div key={f.title}>
                    <div className="flex gap-4 items-start py-6">
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/35 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#d4af37] text-sm">{f.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-[#f3e6c3] font-semibold mb-1 leading-snug" style={{fontFamily:"'Crimson Text', serif", fontSize:'1.05rem'}}>{f.title}</h3>
                        <p className="text-[#e6d8ba]/80 text-sm leading-relaxed font-light">{f.desc}</p>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-px mx-4" style={{background:'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)'}} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Condensed TOC ── */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/25 bg-gradient-to-b from-[#2b1c3f]/80 via-[#1f1331]/80 to-[#2b1c3f]/80 shadow-[0_20px_42px_rgba(8,4,18,0.38)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/25 to-transparent" />
              <span className="absolute left-3 top-2 text-[11px] text-[#d4af37]/55 pointer-events-none select-none">✦</span>
              <span className="absolute right-3 bottom-2 text-[11px] text-[#d4af37]/55 pointer-events-none select-none">✦</span>

              <div className="relative z-10 px-6 py-8">
                <h3 className="text-[#f3e6c3] font-semibold mb-1 tracking-wide" style={{fontFamily:"'Crimson Text', serif", fontSize:'1.1rem'}}>Índice do conteúdo</h3>
                <p className="text-[#d8c8a0]/45 text-xs mb-6">53 páginas · PDF de alta qualidade</p>

                <div className="space-y-0">
                  {[
                    { label: 'Capa',                                           pg: '1',      dim: false },
                    { label: 'Este Livro Chegou até Você por uma Razão',       pg: '2',      dim: false },
                    { label: 'Quatro Formas de Habitar Este Livro',            pg: '3',      dim: false },
                    { label: 'Sumário',                                        pg: '4',      dim: false },
                    { label: 'Os 22 Arcanos Maiores',                         pg: '5 – 48', dim: false, heading: true },
                    { label: '  O Louco — O Chamado à Aventura',              pg: '5–6',    dim: true  },
                    { label: '  O Mago — O Poder Pessoal',                    pg: '7–8',    dim: true  },
                    { label: '  A Sacerdotisa — O Mistério Interior',         pg: '9–10',   dim: true  },
                    { label: '  A Imperatriz — A Mãe Criadora',               pg: '11–12',  dim: true  },
                    { label: '  O Imperador — A Estrutura do Poder',          pg: '13–14',  dim: true  },
                    { label: '  O Hierofante — A Tradição Sagrada',           pg: '15–16',  dim: true  },
                    { label: '  Os Amantes — A Escolha do Coração',           pg: '17–18',  dim: true  },
                    { label: '  O Carro — A Vitória pela Vontade',            pg: '19–20',  dim: true  },
                    { label: '  A Força — O Poder do Interior',               pg: '21–22',  dim: true  },
                    { label: '  O Eremita — A Sabedoria Solitária',           pg: '23–24',  dim: true  },
                    { label: '  A Roda da Fortuna — O Ciclo da Mudança',      pg: '25–26',  dim: true  },
                    { label: '  A Justiça — O Equilíbrio das Ações',          pg: '27–28',  dim: true  },
                    { label: '  O Enforcado — A Pausa Transformadora',        pg: '29–30',  dim: true  },
                    { label: '  A Morte — A Grande Transformação',            pg: '31–32',  dim: true  },
                    { label: '  A Temperança — A Arte do Equilíbrio',         pg: '33–34',  dim: true  },
                    { label: '  O Diabo — As Correntes da Ilusão',            pg: '35–36',  dim: true  },
                    { label: '  A Torre — A Ruptura Necessária',              pg: '37–38',  dim: true  },
                    { label: '  A Estrela — A Esperança Renovada',            pg: '39–40',  dim: true  },
                    { label: '  A Lua — As Profundezas do Inconsciente',      pg: '41–42',  dim: true  },
                    { label: '  O Sol — A Alegria da Consciência',            pg: '43–44',  dim: true  },
                    { label: '  O Julgamento — O Chamado ao Renascimento',    pg: '45–46',  dim: true  },
                    { label: '  O Mundo — A Plenitude Integrada',             pg: '47–48',  dim: true  },
                    { label: 'A Tiragem da Jornada do Herói',                 pg: '49',     dim: false },
                    { label: 'Localizando-se na Jornada',                     pg: '50',     dim: false },
                    { label: 'Tarot como Ferramenta de Consciência',          pg: '51',     dim: false },
                    { label: 'Quando o Livro se Fecha',                       pg: '52',     dim: false },
                    { label: 'O Mundo — E Além  (Conclusão)',                 pg: '53',     dim: false },
                  ].map((item, i, arr) => (
                    <div
                      key={i}
                      className={[
                        'flex items-start justify-between py-1.5 gap-2',
                        i < arr.length - 1 ? 'border-b border-[#d4af37]/8' : '',
                        (item as any).heading ? 'pt-3' : '',
                      ].join(' ')}
                    >
                      <span className={[
                        'text-xs leading-snug flex-1 min-w-0',
                        (item as any).heading ? 'text-[#f3e6c3] font-semibold' : item.dim ? 'text-[#d8c8a0]/40 text-[11px]' : 'text-[#d8c8a0]/75',
                      ].join(' ')}>
                        {item.label}
                      </span>
                      <span className="text-[#d4af37]/35 text-[10px] flex-shrink-0 font-mono tabular-nums">{item.pg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DENTRO DO E-BOOK (page previews)
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 md:px-6 bg-[#1a1628] overflow-hidden">
        <div className="absolute -right-40 top-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-purple-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-purple-700/8 to-transparent blur-3xl pointer-events-none" />
        {/* stars */}
        <div className="absolute top-[15%] left-[10%]  w-[2px] h-[2px] rounded-full bg-white/25 pointer-events-none" />
        <div className="absolute top-[25%] right-[8%]  w-[1.5px] h-[1.5px] rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute top-[65%] left-[6%]   w-[1px]  h-[1px]  rounded-full bg-white/28 pointer-events-none" />
        <div className="absolute top-[75%] right-[20%] w-[2px] h-[2px] rounded-full bg-white/18 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-gradient-gold tracking-tight leading-tight mb-4" style={{fontFamily:"'Crimson Text', serif"}}>
              Dentro do e-book
            </h2>
            <p className="text-gray-400 text-base max-w-md mx-auto font-light leading-relaxed">
              Um design pensado para imersão — cada página como um convite à reflexão silenciosa.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { component: <PagePreviewTheory />,     label: 'Teoria do Arcano' },
              { component: <PagePreviewReflection />, label: 'Reflexão e Integração' },
              { component: <PagePreviewSpread />,     label: 'Tiragem da Jornada' },
              { component: <PagePreviewConclusion />, label: 'Conclusão' },
            ].map(({ component, label }) => (
              <div key={label}>
                {component}
                <p className="text-center text-gray-500 text-xs mt-2.5 tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING — exact same style as home "Escolha seu plano"
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-20 md:py-24 px-4 md:px-6 bg-[#110e1a] overflow-hidden">
        <div className="absolute -left-28 top-10 w-[440px] h-[440px] rounded-full bg-gradient-to-br from-purple-500/14 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -right-20 bottom-8 w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-yellow-500/10 to-transparent blur-3xl pointer-events-none" />
        {/* stars */}
        <div className="absolute top-[10%] left-[7%]   w-[2px] h-[2px] rounded-full bg-white/28 pointer-events-none" />
        <div className="absolute top-[18%] right-[10%] w-[1.5px] h-[1.5px] rounded-full bg-white/22 pointer-events-none" />
        <div className="absolute top-[50%] left-[3%]   w-[2px] h-[2px] rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute top-[60%] right-[5%]  w-[1px]  h-[1px]  rounded-full bg-white/26 pointer-events-none" />
        <div className="absolute bottom-[18%] left-[14%] w-[2px] h-[2px] rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute bottom-[24%] right-[16%] w-[1px] h-[1px] rounded-full bg-white/26 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-gradient-gold tracking-tight leading-tight" style={{fontFamily:"'Crimson Text', serif"}}>
              Duas formas de acessar
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mt-4 font-light">
              Escolha o que faz mais sentido para sua jornada agora e avance para o checkout quando estiver pronto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* ── Ebook avulso ── */}
            <article
              className="rounded-2xl border border-yellow-500/25 bg-gradient-to-b from-[#221637] to-[#170f26] hover:border-yellow-500/45 p-6 md:p-7 transition-all cursor-pointer"
              onClick={toEbook}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white text-2xl font-bold" style={{fontFamily:"'Crimson Text', serif"}}>E-book</h3>
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/12 border border-yellow-500/28 text-yellow-300 text-xs uppercase tracking-wide">
                  R$ 24,90
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-5 font-light leading-relaxed">
                Jornada do Herói · acesso vitalício · download imediato
              </p>
              <ul className="space-y-3 text-sm mb-8">
                {[
                  '53 páginas em PDF de alta qualidade',
                  '22 arquetipos com teoria profunda',
                  '22 páginas de reflexão e exercícios',
                  'A Tiragem da Jornada do Herói',
                  'Localizando-se na Jornada',
                  'Tarot como ferramenta de consciência',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-gray-300">
                    <span className="material-symbols-outlined text-yellow-400 text-base mt-0.5">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={toEbook}
                className="w-full py-3.5 bg-gradient-to-r from-[#ffe066] to-[#ffd700] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#ffe066]/30 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Comprar E-book · R$ 24,90
              </button>
            </article>

            {/* ── Premium ── */}
            <article
              className="rounded-2xl border border-yellow-500/60 bg-gradient-to-b from-[#2c1f0f] via-[#1f1630] to-[#140f1f] shadow-[0_0_34px_rgba(212,175,55,0.24)] p-6 md:p-7 transition-all cursor-pointer"
              onClick={toPremium}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white text-2xl font-bold" style={{fontFamily:"'Crimson Text', serif"}}>Plano Premium</h3>
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/35 text-yellow-300 text-xs uppercase tracking-wide">
                  Premium
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-5 font-light leading-relaxed">
                R$ 19,90/mês · cancele quando quiser
              </p>
              <ul className="space-y-3 text-sm mb-8">
                {[
                  'Ebook Jornada do Herói incluso',
                  'Tiragens personalizadas com IA',
                  'Carta do Dia no WhatsApp',
                  'Arquivo Arcano — todas as 78 cartas',
                  'Histórico da sua jornada',
                  'Novos conteúdos mensais',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-gray-200">
                    <span className="material-symbols-outlined text-yellow-400 text-base mt-0.5">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={toPremium}
                className="w-full py-3.5 bg-gradient-to-r from-[#ffe066] to-[#ffd700] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#ffe066]/40 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">arrow_forward</span>
                Assinar Premium · R$ 19,90/mês
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ── footer mini ── */}
      <div className="py-8 px-4 text-center border-t border-white/5 bg-[#0e0b18]">
        <p className="text-gray-600 text-xs">
          <span className="text-gradient-gold font-medium" style={{fontFamily:"'Crimson Text', serif"}}>Zaya Tarot</span>
          {' '}· Sabedoria ancestral para o caminho moderno
        </p>
      </div>
    </div>
  );
}
