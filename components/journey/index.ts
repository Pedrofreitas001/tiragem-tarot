/**
 * Journey Components - A Jornada do Louco
 *
 * Experiência visual e narrativa imersiva que mostra o progresso
 * do usuário através dos 22 Arcanos Maiores do Tarot.
 *
 * Features:
 * - Carrossel horizontal com imagens das cartas
 * - Modal de detalhes com narrativa completa
 * - Textos da jornada do Louco para cada arcano
 * - Estados visuais: unlocked, current, next, locked
 */

export { default as JourneySection } from './JourneySection';
export { ArcanaNode } from './ArcanaNode';
export { useJourneyProgress, ARCANA_JOURNEY } from '../../hooks/useJourneyProgress';
export type { ArcanaMarker, JourneyProgress } from '../../hooks/useJourneyProgress';
