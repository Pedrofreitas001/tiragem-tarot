import React, { useRef, useState } from 'react';
import ArcanaNode from './ArcanaNode';
import { useLanguage } from '../../contexts/LanguageContext';
import { TAROT_CARDS } from '../../tarotData';

/**
 * JourneySection - A Espiral do Louco (Versão Imersiva)
 *
 * Uma experiência visual e narrativa que conta a história do Louco
 * atravessando os 22 Arcanos Maiores. Cada carta é um capítulo,
 */


const JourneySection: React.FC = () => {
  // Example hooks and state (replace with actual logic as needed)

  // Translation (replace with your translation logic)
  const t = {} as any;
  // Use real tarot data for major arcana (0-21)
  const arcanaList = TAROT_CARDS.filter(card => card.arcana === 'major').sort((a, b) => a.number - b.number);

  // User context (mocked for this logic)
  // You should replace this with your real user context/provider
  const { isPortuguese, userType, readingsCount, arcanaCounts } = useLanguage() as any;
  // userType: 'guest' | 'registered' | 'subscriber'
  // readingsCount: number (for registered)
  // arcanaCounts: { [arcanaId: number]: number } (for registered/subscriber)
  let top3: string[] = [];
  // UI state
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [moved, setMoved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Freeze scroll when modal is open
  React.useEffect(() => {
    if (isDetailOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isDetailOpen]);

  // Widget logic
  let cardCount = 0;
  let showPaywall = false;

  if (userType === 'guest') {
    // Always show demo Top 3 layout for guests (randomized)
    cardCount = 0;
    // Pick 3 random unique cards
    const shuffled = [...arcanaList].sort(() => 0.5 - Math.random());
    top3 = shuffled.slice(0, 3).map(card => String(card.id));
    showPaywall = true;
  } else if (userType === 'registered') {
    // Free user: limit widgets if over 3 readings
    if (readingsCount >= 3) {
      showPaywall = true;
      // Show demo data for paywalled state (randomized)
      const shuffled = [...arcanaList].sort(() => 0.5 - Math.random());
      top3 = shuffled.slice(0, 3).map(card => String(card.id));
    } else {
      // Show real data (mocked)
      if (selectedMarker && arcanaCounts) {
        cardCount = arcanaCounts[selectedMarker.id] || 0;
      }
      // Top 3 most frequent arcana (mocked)
      if (arcanaCounts) {
        top3 = Object.entries(arcanaCounts)
          .sort((a, b) => (Number(b[1]) - Number(a[1])))
          .slice(0, 3)
          .map(([id]) => String(id));
      }
    }
  } else if (userType === 'subscriber') {
    // Subscriber: always show real data
    if (selectedMarker && arcanaCounts) {
      cardCount = arcanaCounts[selectedMarker.id] || 0;
    }
    if (arcanaCounts) {
      top3 = Object.entries(arcanaCounts)
        .sort((a, b) => (Number(b[1]) - Number(a[1])))
        .slice(0, 3)
        .map(([id]) => String(id));
    }
    showPaywall = false;
  }

  // Fallback: always show 3 cards in Top 3 widget
  if (top3.length < 3) {
    const used = new Set(top3);
    const fill = arcanaList.filter(card => !used.has(card.id)).slice(0, 3 - top3.length).map(card => String(card.id));
    top3 = [...top3, ...fill];
  }

  // Dummy getNodeState and handlers
  const getNodeState = (index: number) => 'default';
  // Selecionar carta (apenas destaca)
  const handleSelectMarker = (marker: any) => {
    setSelectedMarker(marker);
  };
  // Abrir modal de detalhes
  const handleOpenDetails = (marker: any) => {
    setSelectedMarker(marker);
    setIsDetailOpen(true);
  };
  const handleCloseDetail = () => setIsDetailOpen(false);
  // Drag/scroll handlers (replace with actual logic)
  const handleMouseDown = () => { };
  const handleMouseMove = () => { };
  const handleMouseUp = () => { };
  const handleMouseLeave = () => { };
  const handleTouchStart = () => { };
  const handleTouchMove = () => { };

  return (
    <section className="relative pt-20 md:pt-28 pb-10 md:pb-16 overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#875faf]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#a77fd4]/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-white mb-2 mt-0" style={{ fontFamily: "'Crimson Text', serif" }}>
            {t.title || 'Sua jornada no Tarot'}
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto mb-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
            {t.subtitle}
          </p>
          <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto mb-6" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
            Acompanhe sua evolução e descubra quais energias mais aparecem nas suas tiragens de Tarot.
          </p>
          {/* Barra de progresso simplificada: só Louco e Mundo */}
          <div className="max-w-md mx-auto mb-8">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#875faf] via-[#a77fd4] to-[#875faf] transition-all duration-1000 ease-out relative" style={{ width: `0%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500" style={{ fontFamily: "'Crimson Text', serif" }}>
              <span>O Louco</span>
              <span>O Mundo</span>
            </div>
          </div>
        </div>
        {/* Carrossel de cartas */}
        <div className="relative mb-20 flex flex-col items-center">
          {/* Scroll container com drag */}
          <div className="relative w-full flex items-center justify-center">
            <button type="button" aria-label="Scroll left" className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#1a1628]/80 border border-[#875faf]/40 hover:border-[#a77fd4]/80 hover:bg-[#1a1628] transition-all duration-300 group shadow-xl" style={{ outline: 'none' }} onClick={() => { if (scrollRef.current) scrollRef.current.scrollBy({ left: -250, behavior: 'smooth' }); }}>
              <span className="material-symbols-outlined text-white/80 group-hover:text-white text-2xl">chevron_left</span>
            </button>
            <div
              ref={scrollRef}
              className="flex gap-3 md:gap-4 overflow-x-auto pb-8 px-6 cursor-grab active:cursor-grabbing select-none justify-center items-center"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                minHeight: 'clamp(220px, 28vw, 320px)', // aumentei o minHeight e o pb
                paddingBottom: '2.5rem' // padding extra para cartas destacadas
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              {arcanaList.map((marker, index) => (
                <div
                  key={marker.id}
                  className="flex-shrink-0 pt-4 flex items-center justify-center"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectMarker(marker)}
                >
                  <ArcanaNode
                    marker={marker}
                    state={getNodeState(index)}
                    isPortuguese={isPortuguese}
                    onDetailsClick={() => handleOpenDetails(marker)}
                    size="large"
                    guestMode={userType === 'guest'}
                    selected={selectedMarker?.id === marker.id}
                  />
                </div>
              ))}
            </div>
            <button type="button" aria-label="Scroll right" className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#1a1628]/80 border border-[#875faf]/40 hover:border-[#a77fd4]/80 hover:bg-[#1a1628] transition-all duration-300 group shadow-xl" style={{ outline: 'none' }} onClick={() => { if (scrollRef.current) scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' }); }}>
              <span className="material-symbols-outlined text-white/80 group-hover:text-white text-2xl">chevron_right</span>
            </button>
          </div>
        </div>
        {/* Instrução */}
        <p className="text-center text-gray-500 text-sm mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>{t.clickToExplore}</p>
      </div>
      {/* Widgets: contagem da carta clicada + ranking top3 */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-12 max-w-4xl mx-auto">
        {/* Contagem da carta selecionada */}
        <div className="relative bg-gradient-to-br from-[#1a1628]/80 to-[#2a1a38]/70 border border-[#a77fd4]/30 rounded-xl px-10 py-1 min-h-[90px] max-w-xl w-full overflow-hidden shadow-lg flex flex-col items-center justify-center">
          {/* Header always at top */}
          <div className="w-full flex flex-col items-center justify-center mb-1 absolute left-0 top-0 pt-2">
            <h5 className="text-lg md:text-xl text-[#ffd700] font-extrabold tracking-tight text-center drop-shadow-sm" style={{ fontFamily: "'Crimson Text', serif", letterSpacing: '0.04em' }}>
              {isPortuguese ? 'Contagem desta carta' : 'This card count'}
            </h5>
            <span className="text-xs text-gray-300 mt-1 text-center" style={{ fontFamily: "'Inter', sans-serif" }} title={isPortuguese ? 'Quantas vezes esta carta apareceu nas suas tiragens' : 'How many times this card appeared in your readings'}>
              {isPortuguese ? 'Seu histórico' : 'Your history'}
            </span>
            <div className="w-12 h-1 bg-gradient-to-r from-[#a77fd4] to-[#ffd700] rounded-full mt-2 mb-1 opacity-70" />
          </div>
          <div className={showPaywall ? 'filter blur-sm pointer-events-none select-none w-full' : 'w-full'}>
            {selectedMarker ? (
              <div className="flex flex-col items-center justify-center w-full mt-12">
                <img src={selectedMarker.imageUrl} alt={isPortuguese ? selectedMarker.name : selectedMarker.nameEn} className="w-16 h-20 md:w-20 md:h-28 rounded-lg mb-2 shadow-lg border-2 border-[#a77fd4]/40 mt-8" />
                <div className="text-white font-medium text-center" style={{ fontFamily: "'Crimson Text', serif" }}>{isPortuguese ? selectedMarker.name : selectedMarker.nameEn}</div>
                <div className="text-gray-400 text-sm mt-1 text-center">{isPortuguese ? selectedMarker.essence : selectedMarker.essenceEn}</div>
                <div className="text-3xl font-extrabold text-[#ffd700] mt-4 mb-1 drop-shadow" style={{ fontFamily: "'Crimson Text', serif" }}>{cardCount}</div>
                <div className="text-gray-500 text-xs text-center">{isPortuguese ? 'vezes aparecida' : 'times appeared'}</div>
              </div>
            ) : (
              <div className="text-gray-400 text-center mt-12">{isPortuguese ? 'Clique em uma carta para ver quantas vezes ela apareceu.' : 'Click a card to see how many times it appeared.'}</div>
            )}
          </div>
          {showPaywall && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-white/80 mb-2" style={{ filter: 'drop-shadow(0 2px 8px #0008)' }}>lock</span>
                <div className="text-center text-white">
                  <div className="text-lg font-semibold mb-1">{isPortuguese ? 'Desbloqueie com assinatura' : 'Unlock with subscription'}</div>
                  <div className="text-sm text-gray-300">{isPortuguese ? 'Assine para ver a contagem desta carta.' : 'Subscribe to see this card count.'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Ranking top3 - visível, mas bloqueado para convidados */}
        <div className="relative bg-gradient-to-br from-[#1a1628]/80 to-[#2a1a38]/70 border border-[#a77fd4]/30 rounded-xl px-16 py-2 min-h-[120px] max-w-2xl w-full overflow-hidden shadow-lg flex flex-col items-center justify-center">
          {/* Header always at top */}
          <div className="w-full flex flex-col items-center justify-center mb-1 absolute left-0 top-0 pt-2">
            <h5 className="text-lg md:text-xl text-[#ffd700] font-extrabold tracking-tight text-center drop-shadow-sm" style={{ fontFamily: "'Crimson Text', serif", letterSpacing: '0.04em' }}>
              {isPortuguese ? 'Top 3 Energias' : 'Top 3 Energies'}
            </h5>
            <span className="text-xs text-gray-300 mt-1 text-center" style={{ fontFamily: "'Inter', sans-serif" }} title={isPortuguese ? 'Baseado nas cartas que mais aparecem nas suas tiragens' : 'Based on the cards that most appear in your readings'}>
              {isPortuguese ? 'Ranking pessoal' : 'Personal ranking'}
            </span>
            <div className="w-12 h-1 bg-gradient-to-r from-[#a77fd4] to-[#ffd700] rounded-full mt-2 mb-1 opacity-70" />
          </div>
          <div className={showPaywall ? 'filter blur-sm pointer-events-none select-none' : ''}>
            <ol className="flex justify-center items-center gap-4 md:gap-7 mt-8">
              {top3.map((idx, i) => {
                const m = arcanaList.find(a => a.id === idx);
                if (!m) return null;
                return (
                  <li key={m.id} className={`flex flex-col items-center ${i === 0 ? 'z-10' : 'z-0'}`}
                    style={{ transform: i === 0 ? 'scale(1.15) translateY(-10px)' : 'scale(1)', filter: i === 0 ? 'drop-shadow(0 4px 16px #a77fd4aa)' : 'none' }}>
                    <span className={`text-base font-bold ${i === 0 ? 'text-[#ffd700]' : i === 1 ? 'text-[#a77fd4]' : 'text-[#875faf]'}`}>{i + 1}</span>
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className={`w-14 h-20 md:w-16 md:h-24 rounded-lg shadow-lg mt-1 border-2 ${i === 0 ? 'border-[#ffd700]' : i === 1 ? 'border-[#a77fd4]' : 'border-[#875faf]'} ${showPaywall ? 'grayscale opacity-70' : ''}`}
                    />
                    <span className="text-xs text-white mt-2 text-center max-w-[70px] truncate" style={{ fontFamily: "'Crimson Text', serif" }}>{isPortuguese ? m.name_pt : m.name}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          {showPaywall && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="material-symbols-outlined text-4xl text-white/80 mb-2" style={{ filter: 'drop-shadow(0 2px 8px #0008)' }}>lock</span>
              <div className="text-center text-white">
                <div className="text-lg font-semibold mb-1">{isPortuguese ? 'Desbloqueie com assinatura' : 'Unlock with subscription'}</div>
                <div className="text-sm text-gray-300">{isPortuguese ? 'Assine para ver seu top 3 de energias.' : 'Subscribe to see your top 3 energies.'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal de detalhes do Arcano */}
      {selectedMarker && isDetailOpen && (
        <>
          {/* Backdrop escuro */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
          {/* Modal centralizado */}
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a1628] to-[#0d0a14] border border-[#875faf]/40 rounded-2xl shadow-2xl transition-transform duration-300 transform opacity-100 scale-100`}>
              {/* Header com miniatura da carta */}
              <div className="p-6 pb-4">
                <div className="flex gap-5 items-start">
                  {/* Miniatura da carta */}
                  <div className="flex-shrink-0">
                    <img
                      src={selectedMarker?.imageUrl}
                      alt={isPortuguese ? selectedMarker.name : selectedMarker.nameEn}
                      className="block w-28 h-40 md:w-36 md:h-52 object-contain rounded-lg shadow-lg"
                      style={{ margin: 0 }}
                    />
                  </div>
                  {/* Info ao lado da miniatura */}
                  <div className="flex-1 pt-1">
                    <p className="text-[#a77fd4] text-xs uppercase tracking-wider mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{isPortuguese ? selectedMarker.essence : selectedMarker.essenceEn}</p>
                    <h3 className="text-white text-2xl md:text-3xl font-normal mb-3" style={{ fontFamily: "'Crimson Text', serif" }}>
                      {selectedMarker.symbol ? `${selectedMarker.symbol} · ` : ''}
                      {isPortuguese
                        ? (selectedMarker.name_pt || selectedMarker.name)
                        : (selectedMarker.name || selectedMarker.nameEn)}
                    </h3>
                    <div className="text-white/80 text-sm">
                      <div className="font-medium">{isPortuguese ? 'Quantidade' : 'Count'}: <span className="font-bold">{cardCount}</span></div>
                      <div className="text-gray-400 text-xs mt-1">{isPortuguese ? 'À partir do seu histórico' : 'From your history'}</div>
                    </div>
                  </div>
                  {/* Botão fechar */}
                  <button onClick={handleCloseDetail} className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-[#a77fd4]/40">
                    <span className="material-symbols-outlined text-white/80">close</span>
                  </button>
                </div>
              </div>
              {/* Divider */}
              <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#875faf]/30 to-transparent" />
              {/* Conteúdo: Jornada e descrição */}
              <div className="p-6 pt-4">
                <div className="mb-6">
                  <h4 className="text-[#a77fd4] text-xs uppercase tracking-wider mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {isPortuguese ? 'Jornada do Louco' : 'Fool’s Journey'}
                  </h4>
                  <p className="text-gray-300 text-base leading-relaxed mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>
                    {isPortuguese ? selectedMarker.narrative : selectedMarker.narrativeEn}
                  </p>
                  <h4 className="text-[#a77fd4] text-xs uppercase tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {isPortuguese ? 'Descrição da Carta' : 'Card Description'}
                  </h4>
                  <p className="text-white text-base leading-relaxed" style={{ fontFamily: "'Crimson Text', serif" }}>
                    {isPortuguese ? selectedMarker.description_pt : selectedMarker.description}
                  </p>
                </div>
                <div className="p-4 bg-[#875faf]/10 border border-[#875faf]/20 rounded-lg">
                  <h4 className="text-[#a77fd4] text-xs uppercase tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{t.lessonTitle}</h4>
                  <p className="text-white text-lg" style={{ fontFamily: "'Crimson Text', serif" }}>
                    "{isPortuguese ? selectedMarker.lesson : selectedMarker.lessonEn}"
                  </p>
                </div>
              </div>
            </div>
          </div>

        </>
      )}
      {/* CSS para esconder scrollbar e melhorar scroll */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default JourneySection;
