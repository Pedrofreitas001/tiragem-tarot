/**
 * Journey Components - Módulo de Jornada Arquetípica
 *
 * Este módulo implementa a experiência de "Espiral do Louco",
 * uma visualização simbólica da jornada do usuário através
 * dos 22 Arcanos Maiores do Tarot.
 *
 * Componentes:
 * - JourneySection: Seção principal, pronta para integrar na página
 * - JourneyMap: Visualização em arco/espiral dos marcos
 * - ArcanaNode: Nó individual representando um Arcano Maior
 *
 * Hook:
 * - useJourneyProgress: Calcula progresso e fornece dados da jornada
 */

export { JourneySection } from './JourneySection';
export { JourneyMap } from './JourneyMap';
export { ArcanaNode } from './ArcanaNode';
export { useJourneyProgress, ARCANA_JOURNEY } from '../../hooks/useJourneyProgress';
export type { ArcanaMarker, JourneyProgress } from '../../hooks/useJourneyProgress';
