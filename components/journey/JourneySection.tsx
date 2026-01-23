/**
 * JourneySection - Seção principal da Jornada Arquetípica
 *
 * CONCEITO: "A Espiral do Louco"
 *
 * Esta seção é o coração emocional do app. Seu objetivo não é vender,
 * mas criar vínculo. Quando o usuário vê sua jornada mapeada, ele sente:
 *
 * 1. "Eu já comecei algo aqui" → Sunk cost emocional
 * 2. "Há um caminho à frente" → Antecipação sem ansiedade
 * 3. "O app me conhece" → Personalização simbólica
 * 4. "Isso é diferente" → Distinção de apps genéricos
 *
 * A seção NÃO menciona preços, planos ou upgrade. Ela apenas revela
 * que existe profundidade - e que o usuário está nela.
 *
 * ESTRUTURA:
 * - Header ritualístico (frase + contexto)
 * - Mapa visual da jornada (espiral de arcanos)
 * - Indicadores de progresso (sutis, não gamificados)
 * - Microcopy emocional (frases que ressoam)
 * - CTA contemplativo (não comercial)
 */

import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJourneyProgress, ArcanaMarker } from '../../hooks/useJourneyProgress';
import JourneyMap from './JourneyMap';

interface JourneySectionProps {
  onStartReading?: () => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({ onStartReading }) => {
  const { isPortuguese } = useLanguage();
  const { isGuest, tier } = useAuth();
  const navigate = useNavigate();
  const journey = useJourneyProgress();
  const [selectedMarker, setSelectedMarker] = useState<ArcanaMarker | null>(null);

  // Textos localizados
  const t = {
    // Header
    title: isPortuguese ? 'Sua Travessia' : 'Your Crossing',
    subtitle: isPortuguese
      ? 'Cada tiragem é um passo. Cada carta, um espelho.'
      : 'Each reading is a step. Each card, a mirror.',

    // Status da jornada
    journeyStarted: isPortuguese ? 'Jornada Iniciada' : 'Journey Initiated',
    journeyAwaits: isPortuguese ? 'A Jornada Aguarda' : 'The Journey Awaits',

    // Contadores
    arcanasCrossed: isPortuguese ? 'arcanos atravessados' : 'arcana crossed',
    readingsTotal: isPortuguese ? 'revelações' : 'revelations',
    daysOnPath: isPortuguese ? 'dias no caminho' : 'days on the path',

    // Próximo marco
    nextThreshold: isPortuguese ? 'Próximo limiar' : 'Next threshold',
    readingsAway: isPortuguese ? 'revelações distante' : 'revelations away',

    // Microcopy baseado em estado
    emptyState: isPortuguese
      ? 'O Louco aguarda no precipício. Um passo, e a jornada começa.'
      : 'The Fool awaits at the precipice. One step, and the journey begins.',
    earlyJourney: isPortuguese
      ? 'Os primeiros símbolos começam a tomar forma.'
      : 'The first symbols begin to take shape.',
    midJourney: isPortuguese
      ? 'Você está tecendo uma tapeçaria de significados.'
      : 'You are weaving a tapestry of meanings.',
    deepJourney: isPortuguese
      ? 'Os arcanos mais profundos reconhecem sua presença.'
      : 'The deeper arcana recognize your presence.',

    // CTAs (não comerciais)
    beginCrossing: isPortuguese ? 'Iniciar a Travessia' : 'Begin the Crossing',
    continueJourney: isPortuguese ? 'Continuar a Jornada' : 'Continue the Journey',
    deeperPath: isPortuguese ? 'Aprofundar o Caminho' : 'Deepen the Path',
    exploreArchive: isPortuguese ? 'Explorar o Arquivo Arcano' : 'Explore the Arcane Archive',

    // Padrões
    patternsEmerging: isPortuguese ? 'Padrões emergindo' : 'Patterns emerging',
    noPatterns: isPortuguese ? 'Padrões ainda não revelados' : 'Patterns not yet revealed',
  };

  // Mensagem dinâmica baseada no progresso
  const getDynamicMessage = () => {
    if (journey.totalReadings === 0) return t.emptyState;
    if (journey.totalReadings < 5) return t.earlyJourney;
    if (journey.totalReadings < 20) return t.midJourney;
    return t.deepJourney;
  };

  // CTA dinâmico
  const getCTAText = () => {
    if (journey.totalReadings === 0) return t.beginCrossing;
    if (journey.totalReadings < 10) return t.continueJourney;
    return t.deeperPath;
  };

  // Handler do CTA
  const handleCTAClick = () => {
    if (onStartReading) {
      onStartReading();
    } else {
      navigate('/');
    }
  };

  // Renderizar indicador do marco atual
  const renderCurrentMarker = () => {
    const current = journey.unlockedMarkers[journey.currentMarkerIndex];
    if (!current) return null;

    return (
      <div className="text-center mb-8">
        <p
          className="text-[#a77fd4] text-xs uppercase tracking-[0.2em] mb-2"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {isPortuguese ? 'Você está em' : "You are at"}
        </p>
        <h3
          className="text-white text-xl md:text-2xl font-normal mb-1"
          style={{ fontFamily: "'Crimson Text', serif" }}
        >
          {isPortuguese ? current.name : current.nameEn}
        </h3>
        <p
          className="text-gray-400 text-sm italic"
          style={{ fontFamily: "'Crimson Text', serif" }}
        >
          {isPortuguese ? current.essence : current.essenceEn}
        </p>
      </div>
    );
  };

  // Renderizar estatísticas sutis
  const renderStats = () => {
    if (journey.totalReadings === 0) return null;

    return (
      <div className="flex justify-center gap-8 md:gap-12 mb-8">
        <div className="text-center">
          <p
            className="text-2xl md:text-3xl text-white font-light"
            style={{ fontFamily: "'Crimson Text', serif" }}
          >
            {journey.unlockedMarkers.length}
          </p>
          <p
            className="text-gray-500 text-xs uppercase tracking-wider"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t.arcanasCrossed}
          </p>
        </div>

        <div className="w-px bg-gradient-to-b from-transparent via-[#875faf]/30 to-transparent" />

        <div className="text-center">
          <p
            className="text-2xl md:text-3xl text-white font-light"
            style={{ fontFamily: "'Crimson Text', serif" }}
          >
            {journey.totalReadings}
          </p>
          <p
            className="text-gray-500 text-xs uppercase tracking-wider"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t.readingsTotal}
          </p>
        </div>

        {journey.daysSinceStart > 0 && (
          <>
            <div className="w-px bg-gradient-to-b from-transparent via-[#875faf]/30 to-transparent" />

            <div className="text-center">
              <p
                className="text-2xl md:text-3xl text-white font-light"
                style={{ fontFamily: "'Crimson Text', serif" }}
              >
                {journey.daysSinceStart}
              </p>
              <p
                className="text-gray-500 text-xs uppercase tracking-wider"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {t.daysOnPath}
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  // Renderizar próximo marco
  const renderNextMarker = () => {
    if (!journey.nextMarker) return null;

    return (
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#875faf]/10 border border-[#875faf]/20 rounded-full">
          <span className="text-[#a77fd4] text-xs uppercase tracking-wider">
            {t.nextThreshold}:
          </span>
          <span
            className="text-white text-sm"
            style={{ fontFamily: "'Crimson Text', serif" }}
          >
            {isPortuguese ? journey.nextMarker.name : journey.nextMarker.nameEn}
          </span>
          <span className="text-gray-500 text-xs">
            ({journey.readingsToNext} {t.readingsAway})
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0a14] to-transparent" />

      {/* Elementos decorativos */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#875faf]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#a77fd4]/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header ritualístico */}
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-[#875faf] text-xs uppercase tracking-[0.3em] mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {journey.totalReadings > 0 ? t.journeyStarted : t.journeyAwaits}
          </p>

          <h2
            className="text-3xl md:text-5xl text-white font-normal mb-4"
            style={{ fontFamily: "'Crimson Text', serif" }}
          >
            {t.title}
          </h2>

          <p
            className="text-gray-400 text-base md:text-lg font-light max-w-md mx-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t.subtitle}
          </p>
        </div>

        {/* Marco atual (se existir) */}
        {journey.totalReadings > 0 && renderCurrentMarker()}

        {/* Mapa da jornada */}
        <div className="mb-12">
          <JourneyMap
            markers={journey.allMarkers}
            currentIndex={journey.currentMarkerIndex}
            isPortuguese={isPortuguese}
            onMarkerClick={setSelectedMarker}
          />
        </div>

        {/* Estatísticas */}
        {renderStats()}

        {/* Mensagem contextual */}
        <div className="text-center mb-10">
          <p
            className="text-gray-300 text-sm md:text-base font-light italic max-w-lg mx-auto"
            style={{ fontFamily: "'Crimson Text', serif", lineHeight: 1.8 }}
          >
            "{isPortuguese ? journey.contextMessage : journey.contextMessageEn}"
          </p>
        </div>

        {/* Próximo marco */}
        {journey.totalReadings > 0 && renderNextMarker()}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button
            onClick={handleCTAClick}
            className="group px-8 py-4 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-sm text-white text-sm font-medium tracking-wide transition-all duration-300 shadow-lg shadow-[#875faf]/20"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="flex items-center gap-2">
              {getCTAText()}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
          </button>

          <button
            onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')}
            className="px-8 py-4 bg-transparent border border-white/10 hover:border-[#875faf]/40 rounded-sm text-gray-400 hover:text-white text-sm font-light tracking-wide transition-all duration-300"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t.exploreArchive}
          </button>
        </div>

        {/* Barra de progresso minimalista (fundo da seção) */}
        <div className="mt-16 max-w-xs mx-auto">
          <div className="h-px bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#875faf] to-[#a77fd4] transition-all duration-1000 ease-out"
              style={{ width: `${journey.totalProgress}%` }}
            />
          </div>
          <p
            className="text-center text-gray-600 text-xs mt-2 uppercase tracking-wider"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isPortuguese ? 'Espiral' : 'Spiral'} {Math.round(journey.totalProgress)}%
          </p>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
