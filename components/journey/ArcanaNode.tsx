/**
 * ArcanaNode - Componente de nó individual na espiral da jornada
 *
 * Cada nó representa um Arcano Maior e seu estado na jornada do usuário:
 * - UNLOCKED: O usuário atravessou este arquétipo (brilhante, revelado)
 * - CURRENT: O marco atual do usuário (pulsante, destaque)
 * - NEXT: O próximo marco a ser desbloqueado (semi-revelado, convidativo)
 * - LOCKED: Ainda não alcançado (velado, misterioso)
 *
 * O design evita gamificação óbvia. É contemplativo, não competitivo.
 * O objetivo é criar sensação de profundidade, não de conquista.
 */

import React, { useState } from 'react';
import { ArcanaMarker } from '../../hooks/useJourneyProgress';

type NodeState = 'unlocked' | 'current' | 'next' | 'locked';

interface ArcanaNodeProps {
  marker: ArcanaMarker;
  state: NodeState;
  index: number;
  totalNodes: number;
  isPortuguese: boolean;
  onClick?: () => void;
}

export const ArcanaNode: React.FC<ArcanaNodeProps> = ({
  marker,
  state,
  index,
  totalNodes,
  isPortuguese,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Classes baseadas no estado
  const getNodeClasses = () => {
    const base = 'relative flex items-center justify-center transition-all duration-500 ease-out';

    switch (state) {
      case 'unlocked':
        return `${base} opacity-100`;
      case 'current':
        return `${base} opacity-100 scale-110`;
      case 'next':
        return `${base} opacity-70 hover:opacity-90`;
      case 'locked':
        return `${base} opacity-30 hover:opacity-40`;
      default:
        return base;
    }
  };

  // Estilos do círculo interno
  const getCircleStyles = () => {
    switch (state) {
      case 'unlocked':
        return 'bg-gradient-to-br from-[#875faf]/30 to-[#a77fd4]/20 border-[#a77fd4]/60';
      case 'current':
        return 'bg-gradient-to-br from-[#875faf]/40 to-[#a77fd4]/30 border-[#a77fd4] shadow-lg shadow-[#875faf]/30';
      case 'next':
        return 'bg-gradient-to-br from-[#875faf]/20 to-transparent border-[#875faf]/40 border-dashed';
      case 'locked':
        return 'bg-[#1a1628]/50 border-white/10';
      default:
        return '';
    }
  };

  // Glow effect para estados ativos
  const getGlowEffect = () => {
    if (state === 'current') {
      return (
        <div className="absolute inset-0 rounded-full bg-[#875faf]/20 blur-xl animate-pulse" />
      );
    }
    if (state === 'unlocked' && isHovered) {
      return (
        <div className="absolute inset-0 rounded-full bg-[#875faf]/10 blur-lg transition-opacity duration-300" />
      );
    }
    return null;
  };

  // Símbolo ou ícone
  const renderSymbol = () => {
    if (state === 'locked') {
      return (
        <span className="text-white/20 text-xs font-light tracking-widest">
          {marker.symbol}
        </span>
      );
    }

    return (
      <span
        className={`font-serif tracking-wider transition-all duration-300 ${
          state === 'current'
            ? 'text-white text-base'
            : state === 'unlocked'
            ? 'text-[#a77fd4] text-sm'
            : 'text-[#875faf]/60 text-xs'
        }`}
        style={{ fontFamily: "'Crimson Text', serif" }}
      >
        {marker.symbol}
      </span>
    );
  };

  // Tooltip com informações
  const renderTooltip = () => {
    if (!isHovered) return null;

    const name = isPortuguese ? marker.name : marker.nameEn;
    const essence = isPortuguese ? marker.essence : marker.essenceEn;
    const message =
      state === 'unlocked' || state === 'current'
        ? isPortuguese
          ? marker.revelation
          : marker.revelationEn
        : isPortuguese
        ? marker.latentMessage
        : marker.latentMessageEn;

    return (
      <div
        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 pointer-events-none"
        style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease' }}
      >
        <div className="bg-[#1a1628]/95 backdrop-blur-sm border border-[#875faf]/30 rounded-lg p-3 shadow-xl">
          <div className="text-center">
            <p
              className="text-[#a77fd4] text-xs font-medium uppercase tracking-wider mb-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {essence}
            </p>
            <p
              className="text-white text-sm font-medium mb-2"
              style={{ fontFamily: "'Crimson Text', serif" }}
            >
              {name}
            </p>
            <p
              className="text-gray-400 text-xs font-light leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {message}
            </p>
          </div>

          {/* Seta do tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-[#875faf]/30" />
          </div>
        </div>
      </div>
    );
  };

  // Linha conectora para o próximo nó
  const renderConnector = () => {
    if (index >= totalNodes - 1) return null;

    const isActive = state === 'unlocked' || state === 'current';

    return (
      <div
        className={`absolute w-8 h-px top-1/2 -right-8 transition-all duration-500 ${
          isActive
            ? 'bg-gradient-to-r from-[#875faf]/60 to-[#875faf]/20'
            : 'bg-gradient-to-r from-white/10 to-transparent'
        }`}
      />
    );
  };

  return (
    <div
      className={getNodeClasses()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${isPortuguese ? marker.name : marker.nameEn} - ${
        isPortuguese ? marker.essence : marker.essenceEn
      }`}
    >
      {/* Glow effect */}
      {getGlowEffect()}

      {/* Círculo principal */}
      <div
        className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${getCircleStyles()}`}
      >
        {renderSymbol()}

        {/* Indicador de "current" */}
        {state === 'current' && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#a77fd4] animate-pulse" />
        )}
      </div>

      {/* Tooltip */}
      {renderTooltip()}

      {/* Conector */}
      {renderConnector()}
    </div>
  );
};

export default ArcanaNode;
