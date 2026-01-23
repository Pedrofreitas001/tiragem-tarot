/**
 * JourneyMap - Mapa visual da jornada arquetípica
 *
 * CONCEITO VISUAL: "A Espiral Ascendente"
 *
 * A jornada do Tarot não é linear - é espiral. Voltamos aos mesmos
 * arquétipos em níveis diferentes de compreensão. Este componente
 * visualiza essa espiral como um arco crescente que sugere:
 *
 * 1. Progressão sem fim definido (a espiral continua além do visível)
 * 2. Retorno transformado (os arquétipos se repetem em níveis superiores)
 * 3. Centro gravitacional (o usuário está sempre no centro de sua jornada)
 *
 * O design usa:
 * - Arco semicircular com os arcanos posicionados como constelações
 * - Linhas de conexão sutis (não óbvias, apenas sugeridas)
 * - Gradientes de opacidade indicando passado/presente/futuro
 * - Animações lentas, contemplativas (nada chamativo)
 */

import React, { useMemo } from 'react';
import { ArcanaMarker } from '../../hooks/useJourneyProgress';
import ArcanaNode from './ArcanaNode';

interface JourneyMapProps {
  markers: ArcanaMarker[];
  currentIndex: number;
  isPortuguese: boolean;
  onMarkerClick?: (marker: ArcanaMarker) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  markers,
  currentIndex,
  isPortuguese,
  onMarkerClick,
}) => {
  // Posicionar os nós em um arco
  const nodePositions = useMemo(() => {
    const visibleMarkers = markers.slice(0, 12); // Mostrar apenas os primeiros 12 para não sobrecarregar
    const totalAngle = 180; // Semicírculo
    const startAngle = 180; // Começar da esquerda
    const radius = 140; // Raio do arco em pixels
    const centerX = 180;
    const centerY = 160;

    return visibleMarkers.map((marker, index) => {
      const angle = startAngle - (index / (visibleMarkers.length - 1)) * totalAngle;
      const radian = (angle * Math.PI) / 180;
      const x = centerX + radius * Math.cos(radian);
      const y = centerY - radius * Math.sin(radian);

      return {
        marker,
        x,
        y,
        index,
      };
    });
  }, [markers]);

  // Determinar estado do nó
  const getNodeState = (index: number): 'unlocked' | 'current' | 'next' | 'locked' => {
    if (index < currentIndex) return 'unlocked';
    if (index === currentIndex) return 'current';
    if (index === currentIndex + 1) return 'next';
    return 'locked';
  };

  // Gerar path SVG para a linha de conexão
  const generateArcPath = () => {
    if (nodePositions.length < 2) return '';

    const points = nodePositions.map(p => ({ x: p.x, y: p.y }));
    let path = `M ${points[0].x} ${points[0].y}`;

    // Criar curva suave entre os pontos
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${cpX} ${prev.y - 20}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  return (
    <div className="relative w-full max-w-[360px] mx-auto">
      {/* Container do mapa */}
      <div className="relative h-[220px] md:h-[280px]">
        {/* SVG para linhas de conexão */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 360 220"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradiente para a linha do caminho */}
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#875faf" stopOpacity="0.6" />
              <stop offset={`${Math.min(100, (currentIndex / 11) * 100)}%`} stopColor="#a77fd4" stopOpacity="0.4" />
              <stop offset={`${Math.min(100, (currentIndex / 11) * 100 + 10)}%`} stopColor="#875faf" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#875faf" stopOpacity="0.05" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Linha de fundo (caminho completo, sutil) */}
          <path
            d={generateArcPath()}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 6"
            className="opacity-60"
          />

          {/* Linha de progresso (caminho percorrido) */}
          <path
            d={generateArcPath()}
            fill="none"
            stroke="#a77fd4"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray={`${(currentIndex / 11) * 500} 1000`}
            className="opacity-40"
          />

          {/* Pontos de conexão entre nós desbloqueados */}
          {nodePositions.slice(0, currentIndex + 1).map((pos, i) => (
            <circle
              key={`dot-${i}`}
              cx={pos.x}
              cy={pos.y}
              r="2"
              fill="#a77fd4"
              className="opacity-30"
            />
          ))}
        </svg>

        {/* Nós dos Arcanos */}
        {nodePositions.map((pos, i) => (
          <div
            key={pos.marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
            style={{
              left: `${(pos.x / 360) * 100}%`,
              top: `${(pos.y / 220) * 100}%`,
            }}
          >
            <ArcanaNode
              marker={pos.marker}
              state={getNodeState(i)}
              index={i}
              totalNodes={nodePositions.length}
              isPortuguese={isPortuguese}
              onClick={() => onMarkerClick?.(pos.marker)}
            />
          </div>
        ))}

        {/* Indicador de "mais além" */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[#875faf]" />
            <div className="w-1 h-1 rounded-full bg-[#875faf] opacity-60" />
            <div className="w-1 h-1 rounded-full bg-[#875faf] opacity-30" />
          </div>
        </div>

        {/* Centro místico (opcional - ponto focal) */}
        <div className="absolute left-1/2 top-[85%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 rounded-full bg-[#875faf]/20 border border-[#875faf]/30" />
          <div className="absolute inset-0 rounded-full bg-[#875faf]/10 blur-md animate-pulse" />
        </div>
      </div>

      {/* Legenda minimalista */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#a77fd4]/60" />
          <span style={{ fontFamily: "'Inter', sans-serif" }}>
            {isPortuguese ? 'Atravessado' : 'Crossed'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full border border-[#875faf]/40 border-dashed" />
          <span style={{ fontFamily: "'Inter', sans-serif" }}>
            {isPortuguese ? 'Latente' : 'Latent'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;
