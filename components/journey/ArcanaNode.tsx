/**
 * ArcanaNode - Cartão visual de um Arcano na jornada
 *
 * Agora com:
 * - Imagem da carta em destaque
 * - Círculos maiores e mais impactantes
 * - Hover com preview da narrativa
 * - Estados visuais distintos (unlocked/current/next/locked)
 */

import React, { useState } from 'react';
import { ArcanaMarker } from '../../hooks/useJourneyProgress';

type NodeState = 'current' | 'history' | 'future' | 'guest' | 'top';

interface ArcanaNodeProps {
  marker: ArcanaMarker;
  state: NodeState;
  isPortuguese: boolean;
  onDetailsClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  guestMode?: boolean;
  selected?: boolean;
  count?: number;
}

export const ArcanaNode: React.FC<ArcanaNodeProps> = ({
  marker,
  state,
  isPortuguese,
  onDetailsClick,
  size = 'large', // Força sempre grande
  guestMode,
  selected = false,
  count,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Tamanhos baseados na prop size
  const sizeClasses = {
    small: 'w-20 h-28 md:w-24 md:h-36',
    medium: 'w-28 h-40 md:w-32 md:h-48',
    large: 'w-36 h-52 md:w-40 md:h-60',
  };

  // Classes baseadas no novo estado
  const getContainerClasses = () => {
    const base = `relative ${sizeClasses[size]} rounded-lg overflow-hidden transition-all duration-500 ease-out group`;
    const animatedBorder = 'before:content-[""] before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-gradient-to-r before:from-[#a77fd4] before:to-[#875faf] before:animate-borderPulse before:pointer-events-none';
    let highlight = '';
    if (selected) {
      highlight = 'ring-4 ring-[#ffe066] scale-110 shadow-2xl shadow-[#ffe066]/30 z-20 grayscale-0 brightness-100';
    } else {
      highlight = 'grayscale brightness-75';
    }
    if (state === 'guest') {
      return `${base} ring-2 ring-[#22223a] hover:ring-[#a77fd4] scale-105 ${animatedBorder} ${highlight}`;
    }
    if (state === 'top') {
      return `${base} ring-4 ring-[#a77fd4] bg-[#a77fd4]/10 scale-110 shadow-xl shadow-[#a77fd4]/30 ${animatedBorder} ${highlight}`;
    }
    if (state === 'current') {
      return `${base} ring-2 ring-[#a77fd4] scale-105 shadow-xl shadow-[#875faf]/40 ${animatedBorder} ${highlight}`;
    }
    if (state === 'history') {
      return `${base} ring-2 ring-[#875faf] opacity-90 ${animatedBorder} ${highlight}`;
    }
    if (state === 'future') {
      return `${base} ring-1 ring-white/10 opacity-60 ${animatedBorder} ${highlight}`;
    }
    return base + ' ' + highlight;
  };

  // Overlay baseado no novo estado
  const getOverlay = () => {
    if (state === 'current') {
      return 'bg-gradient-to-t from-[#a77fd4]/80 via-[#a77fd4]/20 to-transparent';
    }
    if (state === 'history') {
      return 'bg-gradient-to-t from-[#875faf]/60 via-[#875faf]/10 to-transparent';
    }
    if (state === 'future') {
      return 'bg-black/40';
    }
    return '';
  };

  const name = isPortuguese ? marker.name : marker.nameEn;
  const essence = isPortuguese ? marker.essence : marker.essenceEn;

  return (
    <div
      className={getContainerClasses()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${name} - ${essence}`}
      style={{ minWidth: '128px', minHeight: '180px', maxWidth: '148px', maxHeight: '220px' }}
    >
      {/* Imagem da carta */}
      {!imageError && marker.imageUrl ? (
        <img
          src={marker.imageUrl}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${state === 'future' ? 'grayscale' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback se imagem não carregar ou não houver imagem
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1628] to-[#0d0a14] flex items-center justify-center">
          <span
            className="text-[#875faf] text-2xl font-serif"
            style={{ fontFamily: "'Crimson Text', serif" }}
          >
            {marker.symbol}
          </span>
        </div>
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 ${getOverlay()} transition-all duration-300`} />

      {/* Glow pulsante para current */}
      {state === 'current' && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-[#a77fd4] animate-pulse opacity-50" />
      )}

      {/* Lock icon para locked */}
      {state === 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="material-symbols-outlined text-white/40 text-xl">lock</span>
          </div>
        </div>
      )}

      {/* Informações no rodapé + botão mais detalhes */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-center flex flex-col items-center gap-1">
        <p
          className={`text-xs font-medium uppercase tracking-wider mb-0.5 transition-colors ${state === 'current' ? 'text-white' : 'text-[#a77fd4]'} ${selected ? 'text-[#ffe066]' : ''}`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {marker.symbol}
        </p>
        {state !== 'locked' && (
          <p
            className="text-white text-xs font-medium leading-tight truncate"
            style={{ fontFamily: "'Crimson Text', serif" }}
          >
            {name}
          </p>
        )}
        {/* Contagem */}
        {typeof count === 'number' && (
          <span className="text-[#ffe066] text-xs font-bold mt-0.5">{count}</span>
        )}
        {/* Botão mais detalhes */}
        <button
          className="mt-1 px-2 py-0.5 flex items-center gap-1 text-[11px] text-white bg-[#a77fd4] hover:bg-[#875faf] rounded-full transition-all font-semibold shadow-md border border-[#a77fd4]/60 hover:border-[#875faf]/80 drop-shadow-lg"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.04em', minWidth: 100 }}
          onClick={e => {
            e.stopPropagation();
            if (typeof onDetailsClick === 'function') onDetailsClick();
          }}
        >
          <span className="material-symbols-outlined text-xs align-middle">info</span>
          {isPortuguese ? 'mais detalhes' : 'more details'}
        </button>
      </div>

      {/* Badge de "Você está aqui" para current */}
      {state === 'current' && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#a77fd4] rounded-full">
          <span
            className="text-white text-[10px] uppercase tracking-wider font-medium"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isPortuguese ? 'Atual' : 'Current'}
          </span>
        </div>
      )}

      {/* Tooltip expandido no hover */}
      {isHovered && state !== 'locked' && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 pointer-events-none animate-fade-in">
          <div className="bg-[#1a1628]/95 backdrop-blur-md border border-[#875faf]/40 rounded-xl p-4 shadow-2xl">
            <p
              className="text-[#a77fd4] text-xs uppercase tracking-wider mb-1"
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
              className="text-gray-400 text-xs leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {isPortuguese ? marker.lesson : marker.lessonEn}
            </p>

            {/* Seta do tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-[#875faf]/40" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArcanaNode;
