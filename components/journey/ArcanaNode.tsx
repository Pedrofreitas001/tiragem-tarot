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

type NodeState = 'unlocked' | 'current' | 'next' | 'locked';

interface ArcanaNodeProps {
  marker: ArcanaMarker;
  state: NodeState;
  isPortuguese: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const ArcanaNode: React.FC<ArcanaNodeProps> = ({
  marker,
  state,
  isPortuguese,
  onClick,
  size = 'medium',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Tamanhos baseados na prop size
  const sizeClasses = {
    small: 'w-16 h-24 md:w-20 md:h-28',
    medium: 'w-20 h-28 md:w-24 md:h-36',
    large: 'w-28 h-40 md:w-32 md:h-48',
  };

  // Classes baseadas no estado
  const getContainerClasses = () => {
    const base = `relative ${sizeClasses[size]} rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ease-out group`;

    switch (state) {
      case 'unlocked':
        return `${base} ring-2 ring-[#875faf]/50 hover:ring-[#a77fd4] hover:scale-105`;
      case 'current':
        return `${base} ring-2 ring-[#a77fd4] scale-105 shadow-xl shadow-[#875faf]/40`;
      case 'next':
        return `${base} ring-2 ring-dashed ring-[#875faf]/40 hover:ring-[#875faf]/60 hover:scale-102`;
      case 'locked':
        return `${base} ring-1 ring-white/10 opacity-50 hover:opacity-60`;
      default:
        return base;
    }
  };

  // Overlay baseado no estado
  const getOverlay = () => {
    switch (state) {
      case 'unlocked':
        return 'bg-gradient-to-t from-black/80 via-black/20 to-transparent';
      case 'current':
        return 'bg-gradient-to-t from-[#875faf]/90 via-[#875faf]/30 to-transparent';
      case 'next':
        return 'bg-gradient-to-t from-black/90 via-black/50 to-black/30';
      case 'locked':
        return 'bg-black/60 backdrop-blur-[2px]';
      default:
        return '';
    }
  };

  const name = isPortuguese ? marker.name : marker.nameEn;
  const essence = isPortuguese ? marker.essence : marker.essenceEn;

  return (
    <div
      className={getContainerClasses()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${name} - ${essence}`}
    >
      {/* Imagem da carta */}
      {!imageError ? (
        <img
          src={marker.imageUrl}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${state === 'locked' ? 'grayscale' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback se imagem não carregar
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

      {/* Informações no rodapé */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
        <p
          className={`text-xs font-medium uppercase tracking-wider mb-0.5 transition-colors ${
            state === 'current' ? 'text-white' : 'text-[#a77fd4]'
          }`}
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
