import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExecutiveDREGeneric } from './Charts/ExecutiveDREGeneric';
import { CashFlowChartGeneric } from './Charts/CashFlowChartGeneric';
import Spinner from './Spinner';

interface Reading {
    id: number;
    date: string;
    spreadName: string;
    typeBadge: string;
    typeColor: string;
    spreadId?: string;
    previewCards: string[];
    cardNames: string[];
    positions: string[];
    notes: string;
    comment: string;
    rating: number;
}

interface HistoryFilteredProps {
    readings: Reading[];
    isPortuguese: boolean;
    onSelect: (reading: Reading) => void;
    onDelete: (id: number, e: React.MouseEvent) => void;
    onFilterChange?: (filtered: Reading[]) => void;
}

// Modern animated stacked bar segment
const AnimatedBarSegment: React.FC<{
    color: string;
    percentage: number;
    count: number;
    label: string;
    delay: number;
}> = ({ color, percentage, count, label, delay }) => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className="relative overflow-hidden transition-all duration-700 ease-out group/segment cursor-pointer"
            style={{
                backgroundColor: color,
                height: animated ? `${percentage}%` : '0%',
                minHeight: percentage > 0 ? '4px' : '0px',
                transitionDelay: `${delay}ms`,
            }}
        >
            {/* Gradient overlay for depth */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/10"
            />

            {/* Hover highlight */}
            <div
                className="absolute inset-0 bg-white/0 group-hover/segment:bg-white/20 transition-all duration-200"
            />

            {/* Tooltip on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/segment:opacity-100 transition-opacity duration-200 z-10">
                <div className="bg-black/90 px-2 py-1 rounded text-white text-[10px] font-medium whitespace-nowrap shadow-lg border border-white/10">
                    {label}: {count}
                </div>
            </div>

            {/* Count label for large segments */}
            {percentage > 25 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold drop-shadow-lg opacity-80">{count}</span>
                </div>
            )}
        </div>
    );
};

export const HistoryFiltered: React.FC<HistoryFilteredProps> = React.memo(({
    readings,
    isPortuguese,
    onSelect,
    onDelete,
    onFilterChange,
}) => {
    // Filter states
    const [selectedSpreadTypes, setSelectedSpreadTypes] = useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [expandFilters, setExpandFilters] = useState<boolean>(false);
    const [expandAnalysis, setExpandAnalysis] = useState<boolean>(false);
    const chartRef = useRef<HTMLDivElement>(null);

    // Spread options based on actual spread names in history
    const medievalToneClasses = [
        'bg-[#d4af37]/15 border-[#d4af37]/35 text-[#f3e6c3]',
        'bg-[#875faf]/20 border-[#b792dd]/35 text-[#efe4ff]',
        'bg-[#5c3f84]/20 border-[#a77fd4]/35 text-[#e8d7ff]',
        'bg-[#6a4b2a]/20 border-[#d4af37]/30 text-[#f2e5c3]',
        'bg-[#3b2b59]/25 border-[#875faf]/35 text-[#d9c2f3]',
    ];

    const spreadTypeOptions = useMemo(() => {
        const baseSpreadNames = isPortuguese
            ? ['Três Cartas', 'Cruz Celta', 'Relacionamento', 'Sim ou Não', 'Carta do Dia']
            : ['Three Cards', 'Celtic Cross', 'Love Relationship', 'Yes/No', 'Card of the Day'];

        const uniqueSpreadNames = Array.from(
            new Set(
                [...baseSpreadNames, ...readings
                    .map((reading) => reading.spreadName?.trim() || reading.typeBadge?.trim() || '')
                    .filter(Boolean)]
            )
        );

        return uniqueSpreadNames.map((name, idx) => ({
            key: name,
            label: name,
            color: medievalToneClasses[idx % medievalToneClasses.length],
            chartColor: ['#d4af37', '#b794f4', '#a77fd4', '#f0b84f', '#8f67bd'][idx % 5],
        }));
    }, [readings, isPortuguese]);

    // Toggle filter
    const toggleSpreadType = (key: string) => {
        const newSet = new Set(selectedSpreadTypes);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setSelectedSpreadTypes(newSet);
    };

    // Filter readings - APPLIED TO ALL READINGS
    const filteredReadings = useMemo(() => {
        return readings.filter((reading) => {
            const readingSpreadName = reading.spreadName?.trim() || reading.typeBadge?.trim() || '';
            if (selectedSpreadTypes.size > 0 && !selectedSpreadTypes.has(readingSpreadName)) {
                return false;
            }

            // Year and Month filter
            if (selectedYear !== null || selectedMonth !== null) {
                try {
                    const readingDate = new Date(reading.date);
                    const readingYear = readingDate.getFullYear();
                    const readingMonth = readingDate.getMonth() + 1;

                    if (selectedYear !== null && readingYear !== selectedYear) {
                        return false;
                    }
                    if (selectedMonth !== null && readingMonth !== selectedMonth) {
                        return false;
                    }
                } catch (e) {
                    // If date parsing fails, include the reading
                }
            }

            // Date range filter
            if (dateRange.from || dateRange.to) {
                try {
                    const readingDate = new Date(reading.date);
                    if (dateRange.from) {
                        const fromDate = new Date(dateRange.from);
                        if (readingDate < fromDate) return false;
                    }
                    if (dateRange.to) {
                        const toDate = new Date(dateRange.to);
                        toDate.setHours(23, 59, 59);
                        if (readingDate > toDate) return false;
                    }
                } catch (e) {
                    // If date parsing fails, include the reading
                }
            }

            return true;
        });
    }, [readings, selectedSpreadTypes, dateRange, selectedYear, selectedMonth]);

    // Notify parent component of filtered readings using useEffect
    useEffect(() => {
        onFilterChange?.(filteredReadings);
    }, [filteredReadings, onFilterChange]);

    // Calculate frequency data for chart (grouped by day only, by spread name)
    const frequencyData = useMemo(() => {
        if (filteredReadings.length === 0) return [];

        const dayMap: Record<string, Record<string, number>> = {};

        // Group readings by day ONLY (no time)
        filteredReadings.forEach((reading) => {
            try {
                // Parse date - extract just the day part (DD/MM format)
                let dateStr = '';
                if (reading.date.includes('/')) {
                    // Format: "23/01, 15:32" or "23/01/2024" - extract just DD/MM
                    const datePart = reading.date.split(',')[0].trim();
                    // Get only DD/MM (first 5 chars)
                    dateStr = datePart.length >= 5 ? datePart.substring(0, 5) : datePart;
                } else if (reading.date.includes('T')) {
                    // ISO format - convert to DD/MM
                    const d = new Date(reading.date);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    dateStr = `${day}/${month}`;
                } else {
                    // Fallback - try to extract DD/MM
                    dateStr = reading.date.substring(0, 5);
                }

                if (!dayMap[dateStr]) {
                    dayMap[dateStr] = {};
                }

                // Get canonical spread tag to group variations together
                const spreadType = reading.spreadName?.trim() || reading.typeBadge || 'Unknown';
                if (!dayMap[dateStr][spreadType]) {
                    dayMap[dateStr][spreadType] = 0;
                }
                dayMap[dateStr][spreadType]++;
            } catch (e) {
                // Silently skip parsing errors
            }
        });

        // Sort by date and return last 7 days (most recent on the right)
        return Object.entries(dayMap)
            .sort(([dateA], [dateB]) => {
                try {
                    const a = new Date(dateA.replace(/(\d{2})\/(\d{2})/, '$2/$1'));
                    const b = new Date(dateB.replace(/(\d{2})\/(\d{2})/, '$2/$1'));
                    return b.getTime() - a.getTime(); // Reversed: newest first
                } catch {
                    return 0;
                }
            })
            .slice(0, 7) // Take first 7 (most recent)
            .reverse() // Reverse to show oldest on left, newest on right
            .map(([day, types]) => ({
                day,
                total: Object.values(types).reduce((a, b) => a + b, 0),
                breakdown: types,
            }));
    }, [filteredReadings]);

    // Chart navigation and aggregation
    const [chartMonthOffset, setChartMonthOffset] = useState(0);
    const [chartAggregation, setChartAggregation] = useState<'daily' | 'monthly'>('daily');
    const [chartsReady, setChartsReady] = useState(false);

    // Check if data spans multiple months
    const hasMultipleMonths = useMemo(() => {
        const months = new Set<string>();
        filteredReadings.forEach(r => {
            try {
                if (r.date.includes('T')) {
                    const d = new Date(r.date);
                    months.add(`${d.getFullYear()}-${d.getMonth()}`);
                } else if (r.date.includes('/')) {
                    const parts = r.date.split(',')[0].trim().split('/');
                    if (parts.length >= 2) months.add(`${parts[2] || new Date().getFullYear()}-${parts[1]}`);
                }
            } catch { }
        });
        return months.size > 1;
    }, [filteredReadings]);

    // Monthly aggregation data
    const monthlyFrequencyData = useMemo(() => {
        if (filteredReadings.length === 0) return [];
        const shortMonthNames = isPortuguese
            ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthMap: Record<string, { types: Record<string, number>, sort: number }> = {};
        filteredReadings.forEach(reading => {
            try {
                let d: Date;
                if (reading.date.includes('T')) {
                    d = new Date(reading.date);
                } else if (reading.date.includes('/')) {
                    const parts = reading.date.split(',')[0].trim().split('/');
                    d = new Date(parseInt(parts[2] || String(new Date().getFullYear())), parseInt(parts[1]) - 1, parseInt(parts[0]));
                } else return;
                const key = `${shortMonthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
                const sort = d.getFullYear() * 12 + d.getMonth();
                if (!monthMap[key]) monthMap[key] = { types: {}, sort };
                const spreadType = reading.spreadName?.trim() || reading.typeBadge || 'Unknown';
                monthMap[key].types[spreadType] = (monthMap[key].types[spreadType] || 0) + 1;
            } catch { }
        });
        return Object.entries(monthMap)
            .sort(([, a], [, b]) => a.sort - b.sort)
            .map(([month, data]) => ({
                day: month,
                total: Object.values(data.types).reduce((a, b) => a + b, 0),
                breakdown: data.types,
            }));
    }, [filteredReadings, isPortuguese]);

    // Paginated daily frequency data with month scroll
    const navigableDailyData = useMemo(() => {
        if (frequencyData.length === 0) return { data: [], totalPages: 0, currentPage: 0 };
        const pageSize = 7;
        const totalPages = Math.ceil(frequencyData.length / pageSize);
        // chartMonthOffset: 0 = latest page, -1 = previous, etc.
        const page = Math.max(0, Math.min(totalPages - 1 + chartMonthOffset, totalPages - 1));
        // frequencyData is already sorted oldest→newest, so page 0 = oldest
        const latestPage = totalPages - 1;
        const targetPage = latestPage + chartMonthOffset;
        const clampedPage = Math.max(0, Math.min(targetPage, latestPage));
        const start = clampedPage * pageSize;
        return { data: frequencyData.slice(start, start + pageSize), totalPages, currentPage: clampedPage };
    }, [frequencyData, chartMonthOffset]);

    // Reset offset on filter change
    useEffect(() => { setChartMonthOffset(0); }, [filteredReadings]);

    // Loading animation delay
    useEffect(() => {
        setChartsReady(false);
        const timer = setTimeout(() => setChartsReady(true), 500);
        return () => clearTimeout(timer);
    }, [filteredReadings]);

    const activeChartData = chartAggregation === 'monthly' ? monthlyFrequencyData : navigableDailyData.data;

    // Loading state
    const isLoading = !readings || (Array.isArray(readings) && readings.length === 0 && filteredReadings.length === 0);

    // Chart skeleton
    const ChartSkeleton = () => (
        <div className="h-[350px] bg-gradient-to-r from-[#2b1c3f]/90 via-[#1e1330]/90 to-[#2b1c3f]/90 rounded-2xl border border-[#d4af37]/25 p-6 shadow-[0_8px_24px_rgba(8,4,18,0.35)]">
            <div className="h-4 w-28 bg-[#d4af37]/20 rounded mb-6 mx-auto animate-pulse" />
            <div className="flex items-end justify-center gap-4 h-[250px] pt-4">
                {[40, 65, 50, 80, 35, 55, 70].map((h, i) => (
                    <div key={i} className="w-5 rounded-t bg-[#d4af37]/15 animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Top Toggles */}
            <div className="flex flex-row flex-wrap items-center gap-3">
                <button
                    onClick={() => setExpandFilters(!expandFilters)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d4af37]/35 bg-gradient-to-r from-[#2b1c3f]/95 via-[#1e1330]/95 to-[#2b1c3f]/95 text-[#f3e6c3] hover:border-[#d4af37]/60 transition-all duration-200 font-medium text-sm shadow-[0_8px_24px_rgba(8,4,18,0.35)]"
                >
                    {isPortuguese ? 'Filtros' : 'Filters'}
                    <span className={`transition-transform duration-200 ${expandFilters ? 'rotate-180' : ''}`}>▼</span>
                </button>

                <button
                    onClick={() => setExpandAnalysis(!expandAnalysis)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d4af37]/35 bg-gradient-to-r from-[#2b1c3f]/95 via-[#1e1330]/95 to-[#2b1c3f]/95 text-[#f3e6c3] hover:border-[#d4af37]/60 transition-all duration-200 font-medium text-sm shadow-[0_8px_24px_rgba(8,4,18,0.35)]"
                >
                    {isPortuguese ? 'Analise de Leituras' : 'Reading Analysis'}
                    <span className={`transition-transform duration-200 ${expandAnalysis ? 'rotate-180' : ''}`}>▼</span>
                </button>
            </div>
            {/* Filters Section - Expandable */}
            {expandFilters && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-[#2b1c3f]/90 via-[#1e1330]/90 to-[#2b1c3f]/90 rounded-lg border border-[#d4af37]/30 animate-in fade-in duration-200 shadow-[0_8px_24px_rgba(8,4,18,0.35)]">
                    <h3 className="text-[#f3e6c3] font-semibold text-sm uppercase tracking-widest opacity-90">
                        {isPortuguese ? 'Filtros' : 'Filters'}
                    </h3>

                    {/* Spread Type Filters */}
                    <div className="flex flex-wrap gap-2">
                        {spreadTypeOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => toggleSpreadType(option.key)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${selectedSpreadTypes.has(option.key)
                                    ? option.color + ' scale-105 shadow-lg'
                                    : 'bg-[#140d22]/45 border-[#d4af37]/15 text-[#c8b894] hover:border-[#d4af37]/35 hover:text-[#f3e6c3]'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Filters - Pill Style */}
                    <div className="space-y-4 pt-2">
                        {/* Year Selector */}
                        <div>
                            <label className="block text-xs text-[#d8c8a0]/75 mb-3 uppercase tracking-wider font-semibold">
                                {isPortuguese ? 'Ano' : 'Year'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedYear(null)}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${selectedYear === null
                                        ? 'bg-[#875faf]/70 border-[#d4af37]/35 text-[#f3e6c3] shadow-lg scale-105'
                                        : 'bg-[#140d22]/45 border-[#d4af37]/15 text-[#d8c8a0] hover:border-[#d4af37]/35 hover:bg-[#1b122b]/60'
                                        }`}
                                >
                                    {isPortuguese ? 'Todos' : 'All'}
                                </button>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${selectedYear === year
                                            ? 'bg-[#875faf]/70 border-[#d4af37]/35 text-[#f3e6c3] shadow-lg scale-105'
                                            : 'bg-[#140d22]/45 border-[#d4af37]/15 text-[#d8c8a0] hover:border-[#d4af37]/35 hover:bg-[#1b122b]/60'
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Month Selector */}
                        <div>
                            <label className="block text-xs text-[#d8c8a0]/75 mb-3 uppercase tracking-wider font-semibold">
                                {isPortuguese ? 'Mês' : 'Month'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedMonth(null)}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${selectedMonth === null
                                        ? 'bg-[#875faf]/70 border-[#d4af37]/35 text-[#f3e6c3] shadow-lg scale-105'
                                        : 'bg-[#140d22]/45 border-[#d4af37]/15 text-[#d8c8a0] hover:border-[#d4af37]/35 hover:bg-[#1b122b]/60'
                                        }`}
                                >
                                    {isPortuguese ? 'Todos' : 'All'}
                                </button>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                                    const monthNames = isPortuguese
                                        ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
                                        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                    const shortMonth = isPortuguese
                                        ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                                        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                                    return (
                                        <button
                                            key={month}
                                            onClick={() => setSelectedMonth(month)}
                                            title={monthNames[month - 1]}
                                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${selectedMonth === month
                                                ? 'bg-[#875faf]/70 border-[#d4af37]/35 text-[#f3e6c3] shadow-lg scale-105'
                                                : 'bg-[#140d22]/45 border-[#d4af37]/15 text-[#d8c8a0] hover:border-[#d4af37]/35 hover:bg-[#1b122b]/60'
                                                }`}
                                        >
                                            {shortMonth[month - 1]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Clear filters button */}
                    {(selectedSpreadTypes.size > 0 || dateRange.from || dateRange.to) && (
                        <button
                            onClick={() => {
                                setSelectedSpreadTypes(new Set());
                                setDateRange({ from: '', to: '' });
                            }}
                            className="text-xs text-[#d8c8a0]/75 hover:text-[#f3e6c3] transition-colors"
                        >
                            {isPortuguese ? '← Limpar filtros' : '← Clear filters'}
                        </button>
                    )}
                </div>
            )}

            {/* Charts - Expandable */}
            {expandAnalysis && (
            <div className="space-y-4 p-4 bg-gradient-to-r from-[#2b1c3f]/90 via-[#1e1330]/90 to-[#2b1c3f]/90 rounded-lg border border-[#d4af37]/30 animate-in fade-in duration-200 shadow-[0_8px_24px_rgba(8,4,18,0.35)]">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="text-[#f3e6c3] font-semibold text-sm uppercase tracking-widest opacity-90">
                        {isPortuguese ? 'Análise de Leituras' : 'Reading Analysis'}
                    </h3>

                    {/* Aggregation toggle - show only when multiple months */}
                    {hasMultipleMonths && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-[#2b1c3f]/95 via-[#1e1330]/95 to-[#2b1c3f]/95 rounded-lg border border-[#d4af37]/25 p-0.5">
                            <button
                                onClick={() => { setChartAggregation('daily'); setChartMonthOffset(0); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartAggregation === 'daily' ? 'bg-[#875faf]/80 text-[#f3e6c3] border border-[#d4af37]/30' : 'text-[#d8c8a0]/70 hover:text-[#f3e6c3]'}`}
                            >
                                {isPortuguese ? 'Diário' : 'Daily'}
                            </button>
                            <button
                                onClick={() => setChartAggregation('monthly')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartAggregation === 'monthly' ? 'bg-[#875faf]/80 text-[#f3e6c3] border border-[#d4af37]/30' : 'text-[#d8c8a0]/70 hover:text-[#f3e6c3]'}`}
                            >
                                {isPortuguese ? 'Mensal' : 'Monthly'}
                            </button>
                        </div>
                    )}
                </div>

                {(isLoading || !chartsReady) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </div>
                ) : frequencyData.length === 0 ? (
                    <div className="text-center text-[#d8c8a0]/75 py-8">
                        {isPortuguese ? 'Nenhuma leitura encontrada' : 'No readings found'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-500" style={{ opacity: chartsReady ? 1 : 0 }}>
                        {/* DRE Chart - Categories Distribution */}
                        {(() => {
                            const dreItems = spreadTypeOptions.map((option) => {
                                const total = activeChartData.reduce((sum, day) => sum + (day.breakdown[option.key] || 0), 0);
                                return {
                                    label: option.label,
                                    value: total,
                                    color: option.chartColor,
                                };
                            });

                            return (
                                <div className="h-[350px] overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-gradient-to-r from-[#2b1c3f]/88 via-[#1e1330]/90 to-[#2b1c3f]/88 shadow-[0_8px_24px_rgba(8,4,18,0.35)]">
                                    <ExecutiveDREGeneric
                                        items={dreItems}
                                        title={<span className="text-gradient-gold bg-clip-text text-transparent flex justify-center text-center w-full">{isPortuguese ? 'Visão Geral' : 'General View'}</span>}
                                        dark={true}
                                    />
                                </div>
                            );
                        })()}

                        {/* Cards Quantity Chart - Daily/Monthly Count */}
                        <div className="h-[350px] overflow-hidden relative rounded-2xl border border-[#d4af37]/25 bg-gradient-to-r from-[#2b1c3f]/88 via-[#1e1330]/90 to-[#2b1c3f]/88 shadow-[0_8px_24px_rgba(8,4,18,0.35)]">
                            {/* Month navigation arrows for daily view */}
                            {chartAggregation === 'daily' && navigableDailyData.totalPages > 1 && (
                                <div className="absolute top-2 right-4 z-10 flex items-center gap-2">
                                    <button
                                        onClick={() => setChartMonthOffset(prev => Math.max(prev - 1, -(navigableDailyData.totalPages - 1)))}
                                        disabled={navigableDailyData.currentPage <= 0}
                                        className="p-1 rounded-md bg-[#140d22]/50 border border-[#d4af37]/25 text-[#d8c8a0]/70 hover:text-[#f3e6c3] disabled:opacity-30 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    <span className="text-[#d8c8a0]/70 text-[10px]">
                                        {navigableDailyData.currentPage + 1}/{navigableDailyData.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setChartMonthOffset(prev => Math.min(prev + 1, 0))}
                                        disabled={chartMonthOffset >= 0}
                                        className="p-1 rounded-md bg-[#140d22]/50 border border-[#d4af37]/25 text-[#d8c8a0]/70 hover:text-[#f3e6c3] disabled:opacity-30 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            )}
                            {(() => {
                                const chartData = activeChartData.map((day) => ({
                                    label: day.day,
                                    quantity: day.total,
                                }));

                                return (
                                    <CashFlowChartGeneric
                                        data={chartData}
                                        title={<span className="text-gradient-gold bg-clip-text text-transparent flex justify-center text-center w-full">{chartAggregation === 'monthly' ? (isPortuguese ? 'Jogadas por Mês' : 'Spreads per Month') : (isPortuguese ? 'Jogadas por Dia' : 'Spreads per Day')}</span>}
                                        dark={true}
                                        barColor="#b555ef"
                                        barLabel={isPortuguese ? 'Jogadas' : 'Spreads'}
                                    />
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
            )}

            {/* Results summary */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">
                    {isPortuguese
                        ? `${filteredReadings.length} de ${readings.length} tiragens`
                        : `${filteredReadings.length} of ${readings.length} readings`
                    }
                </span>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.readings === nextProps.readings &&
        prevProps.isPortuguese === nextProps.isPortuguese;
});


