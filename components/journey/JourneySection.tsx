/**
 * JourneySection - A Espiral do Louco (Versão Imersiva)
 *
 * Uma experiência visual e narrativa que conta a história do Louco
 * atravessando os 22 Arcanos Maiores. Cada carta é um capítulo,
 * cada clique revela a narrativa profunda.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useJourneyProgress, ArcanaMarker } from '../../hooks/useJourneyProgress';
import ArcanaNode from './ArcanaNode';

interface JourneySectionProps {
  onStartReading?: () => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({ onStartReading }) => {
  const { isPortuguese } = useLanguage();
  const navigate = useNavigate();
  const journey = useJourneyProgress();
  const [selectedMarker, setSelectedMarker] = useState<ArcanaMarker | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Textos localizados
  const t = {
    title: isPortuguese ? 'A Jornada do Louco' : "The Fool's Journey",
    subtitle: isPortuguese
      ? 'Cada tiragem é um passo na espiral. Cada carta, um espelho do seu caminho.'
      : 'Each reading is a step in the spiral. Each card, a mirror of your path.',

    yourPosition: isPortuguese ? 'Sua Posição' : 'Your Position',
    arcanasCrossed: isPortuguese ? 'arcanos atravessados' : 'arcana crossed',
    nextThreshold: isPortuguese ? 'Próximo limiar' : 'Next threshold',
    readingsAway: isPortuguese ? 'leituras' : 'readings',

    clickToExplore: isPortuguese ? 'Clique em uma carta para explorar sua história' : 'Click a card to explore its story',

    narrativeTitle: isPortuguese ? 'A História' : 'The Story',
    lessonTitle: isPortuguese ? 'A Lição' : 'The Lesson',

    close: isPortuguese ? 'Fechar' : 'Close',
    continueJourney: isPortuguese ? 'Continuar a Jornada' : 'Continue the Journey',
    beginJourney: isPortuguese ? 'Iniciar a Jornada' : 'Begin the Journey',

    lockedMessage: isPortuguese
      ? 'Este arcano ainda aguarda ser revelado através de suas tiragens.'
      : 'This arcana still awaits to be revealed through your readings.',

    theFool: isPortuguese ? 'O Louco' : 'The Fool',
    theWorld: isPortuguese ? 'O Mundo' : 'The World',
  };

  // Determinar estado do nó
  const getNodeState = (index: number): 'unlocked' | 'current' | 'next' | 'locked' => {
    if (index < journey.currentMarkerIndex) return 'unlocked';
    if (index === journey.currentMarkerIndex) return 'current';
    if (index === journey.currentMarkerIndex + 1) return 'next';
    return 'locked';
  };

  // Abrir detalhes
  const handleMarkerClick = (marker: ArcanaMarker) => {
    if (!isDragging) {
      setSelectedMarker(marker);
      setIsDetailOpen(true);
    }
  };

  // Fechar detalhes
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedMarker(null), 300);
  };

  // Scroll handlers para drag fluido
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 10);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Scroll para o marcador atual no load
  useEffect(() => {
    if (scrollRef.current && journey.currentMarkerIndex >= 0) {
      const cardWidth = 140;
      const scrollPosition = journey.currentMarkerIndex * cardWidth - (scrollRef.current.offsetWidth / 2) + cardWidth / 2;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
      }, 300);
    }
  }, [journey.currentMarkerIndex]);

  // Verificar se o marker selecionado está desbloqueado
  const isSelectedUnlocked = selectedMarker
    ? journey.allMarkers.findIndex(m => m.id === selectedMarker.id) <= journey.currentMarkerIndex
    : false;

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#875faf]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#a77fd4]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-[#875faf] text-xs uppercase tracking-[0.3em] mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t.yourPosition}: {journey.unlockedMarkers.length} {t.arcanasCrossed}
          </p>

          <h2
            className="text-3xl md:text-5xl text-white font-normal mb-4"
            style={{ fontFamily: "'Crimson Text', serif" }}
          >
            {t.title}
          </h2>

          <p
            className="text-gray-400 text-base font-light max-w-xl mx-auto mb-6"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t.subtitle}
          </p>

          {/* Barra de progresso simplificada */}
          <div className="max-w-md mx-auto mb-6">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#875faf] via-[#a77fd4] to-[#875faf] transition-all duration-1000 ease-out relative"
                style={{ width: `${journey.totalProgress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-[#a77fd4]" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500" style={{ fontFamily: "'Crimson Text', serif" }}>
              <span>{t.theFool}</span>
              <span>{t.theWorld}</span>
            </div>
          </div>
        </div>

        {/* Carrossel de cartas */}
        <div className="relative mb-10">
          {/* Gradientes de fade nas bordas */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0d0a14] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0d0a14] to-transparent z-10 pointer-events-none" />

          {/* Scroll container com drag */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto pb-4 px-10 cursor-grab active:cursor-grabbing select-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {journey.allMarkers.map((marker, index) => (
              <div key={marker.id} className="flex-shrink-0 pt-4">
                <ArcanaNode
                  marker={marker}
                  state={getNodeState(index)}
                  isPortuguese={isPortuguese}
                  onClick={() => handleMarkerClick(marker)}
                  size="large"
                />
              </div>
            ))}
          </div>

          {/* Instrução */}
          <p
            className="text-center text-gray-500 text-sm mt-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t.clickToExplore}
          </p>
        </div>

        {/* Mensagem contextual */}
        <div className="text-center mb-8">
          <p
            className="text-gray-300 text-lg md:text-xl italic max-w-2xl mx-auto"
            style={{ fontFamily: "'Crimson Text', serif", lineHeight: 1.8 }}
          >
            "{isPortuguese ? journey.contextMessage : journey.contextMessageEn}"
          </p>
        </div>

        {/* Próximo marco */}
        {journey.nextMarker && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-[#1a1628]/80 border border-[#875faf]/30 rounded-full">
              <span className="text-gray-400 text-sm">
                {t.nextThreshold}:
              </span>
              <span
                className="text-white font-medium"
                style={{ fontFamily: "'Crimson Text', serif" }}
              >
                {isPortuguese ? journey.nextMarker.name : journey.nextMarker.nameEn}
              </span>
              <span className="text-[#a77fd4] text-sm">
                {journey.readingsToNext} {t.readingsAway}
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center">
          <button
            onClick={onStartReading || (() => navigate('/'))}
            className="group px-8 py-4 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-lg text-white text-sm font-medium tracking-wide transition-all duration-300 shadow-lg shadow-[#875faf]/30"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="flex items-center gap-2">
              {journey.totalReadings === 0 ? t.beginJourney : t.continueJourney}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Modal de detalhes do Arcano */}
      {selectedMarker && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${
              isDetailOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={handleCloseDetail}
          />

          {/* Painel de detalhes com miniatura */}
          <div
            className={`fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-8 md:w-[550px] max-h-[85vh] overflow-y-auto bg-gradient-to-b from-[#1a1628] to-[#0d0a14] border border-[#875faf]/40 rounded-2xl z-50 transition-all duration-500 ${
              isDetailOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            {/* Header com miniatura da carta */}
            <div className="p-6 pb-4">
              <div className="flex gap-5">
                {/* Miniatura da carta */}
                <div className="flex-shrink-0">
                  <div className={`w-24 h-36 md:w-28 md:h-44 rounded-lg overflow-hidden border-2 ${isSelectedUnlocked ? 'border-[#875faf]/50' : 'border-white/20'} shadow-lg`}>
                    <img
                      src={selectedMarker.imageUrl}
                      alt={isPortuguese ? selectedMarker.name : selectedMarker.nameEn}
                      className={`w-full h-full object-cover ${!isSelectedUnlocked ? 'grayscale blur-[1px]' : ''}`}
                    />
                  </div>
                </div>

                {/* Info ao lado da miniatura */}
                <div className="flex-1 pt-1">
                  <p
                    className="text-[#a77fd4] text-xs uppercase tracking-wider mb-1"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {isPortuguese ? selectedMarker.essence : selectedMarker.essenceEn}
                  </p>
                  <h3
                    className="text-white text-2xl md:text-3xl font-normal mb-3"
                    style={{ fontFamily: "'Crimson Text', serif" }}
                  >
                    {selectedMarker.symbol} · {isPortuguese ? selectedMarker.name : selectedMarker.nameEn}
                  </h3>

                  {!isSelectedUnlocked && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                      <span className="material-symbols-outlined text-white/60 text-sm">lock</span>
                      <span className="text-white/60 text-xs uppercase tracking-wider">
                        {isPortuguese ? 'Bloqueado' : 'Locked'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botão fechar */}
                <button
                  onClick={handleCloseDetail}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-white/70">close</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#875faf]/30 to-transparent" />

            {/* Conteúdo */}
            <div className="p-6 pt-4">
              {isSelectedUnlocked ? (
                <>
                  {/* Narrativa */}
                  <div className="mb-5">
                    <h4
                      className="text-[#a77fd4] text-xs uppercase tracking-wider mb-3"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {t.narrativeTitle}
                    </h4>
                    <p
                      className="text-gray-300 text-base leading-relaxed"
                      style={{ fontFamily: "'Crimson Text', serif" }}
                    >
                      {isPortuguese ? selectedMarker.narrative : selectedMarker.narrativeEn}
                    </p>
                  </div>

                  {/* Lição */}
                  <div className="p-4 bg-[#875faf]/10 border border-[#875faf]/20 rounded-lg">
                    <h4
                      className="text-[#a77fd4] text-xs uppercase tracking-wider mb-2"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {t.lessonTitle}
                    </h4>
                    <p
                      className="text-white text-lg"
                      style={{ fontFamily: "'Crimson Text', serif" }}
                    >
                      "{isPortuguese ? selectedMarker.lesson : selectedMarker.lessonEn}"
                    </p>
                  </div>
                </>
              ) : (
                /* Mensagem de bloqueado */
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#875faf]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-[#875faf]">hourglass_empty</span>
                  </div>
                  <p
                    className="text-gray-400 text-base max-w-sm mx-auto"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {t.lockedMessage}
                  </p>
                  <p
                    className="text-gray-500 text-sm mt-3 italic"
                    style={{ fontFamily: "'Crimson Text', serif" }}
                  >
                    "{isPortuguese ? selectedMarker.latentMessage : selectedMarker.latentMessageEn}"
                  </p>
                </div>
              )}
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
};

export default JourneySection;
