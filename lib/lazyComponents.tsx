import React, { lazy, Suspense } from 'react';

// Lazy load heavy components
export const DailyCard = lazy(() => import('../components/DailyCard'));
export const HistoryFiltered = lazy(() => import('../components/HistoryFiltered').then(m => ({ default: m.HistoryFiltered })));
export const JourneySection = lazy(() => import('../components/journey'));
export const SideBySideExample = lazy(() => import('../components/Charts/SideBySideExample'));

// Loading skeleton for lazy components
export const LazyLoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background-dark via-[#1a1628] to-background-dark">
        <div className="text-center">
            <div className="mb-6 flex justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
    </div>
);

// Wrapper component for lazy routes
export const LazyComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Suspense fallback={<LazyLoadingFallback />}>
        {children}
    </Suspense>
);
