import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExecutiveDREGeneric } from './Charts/ExecutiveDREGeneric';
import { CashFlowChartGeneric } from './Charts/CashFlowChartGeneric';

interface Reading {
    id: number;
    date: string;
    spreadName: string;
    typeBadge: string;
    typeColor: string;
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
    const chartRef = useRef<HTMLDivElement>(null);

    // Spread type options
    const spreadTypeOptions = [
        { key: 'Carta do Dia', label: isPortuguese ? 'Carta do Dia' : 'Card of the Day', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
        { key: 'Sim/Não', label: isPortuguese ? 'Sim/Não' : 'Yes/No', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
        { key: 'Três Cartas', label: isPortuguese ? 'Três Cartas' : 'Three Cards', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
        { key: 'Spread do Amor', label: isPortuguese ? 'Amor' : 'Love', color: 'bg-pink-500/10 border-pink-500/20 text-pink-400' },
        { key: 'Cruz Celta', label: isPortuguese ? 'Cruz Celta' : 'Celtic Cross', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
    ];

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
            // Spread type filter
            if (selectedSpreadTypes.size > 0 && !selectedSpreadTypes.has(reading.spreadName)) {
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

    // Calculate frequency data for chart (grouped by day only)
    // Map all spread name variations to a canonical form for grouping
    const spreadCanonicalMap: Record<string, string> = {
        // Carta do Dia variations
        'Carta do Dia': 'Carta do Dia',
        'Card of the Day': 'Carta do Dia',
        // Sim/Não variations
        'Sim/Não': 'Sim/Não',
        'Yes/No': 'Sim/Não',
        // Três Cartas variations
        'Três Cartas': 'Três Cartas',
        'Three Cards': 'Três Cartas',
        // Spread do Amor variations
        'Spread do Amor': 'Spread do Amor',
        'Love': 'Spread do Amor',
        // Cruz Celta variations
        'Cruz Celta': 'Cruz Celta',
        'Celtic Cross': 'Cruz Celta',
    };

    // Get display name based on language
    const getDisplaySpreadName = (canonicalName: string): string => {
        if (isPortuguese) {
            return canonicalName; // Already in PT
        } else {
            // Translate PT to EN
            const ptToEnMap: Record<string, string> = {
                'Carta do Dia': 'Card of the Day',
                'Sim/Não': 'Yes/No',
                'Três Cartas': 'Three Cards',
                'Spread do Amor': 'Love',
                'Cruz Celta': 'Celtic Cross',
            };
            return ptToEnMap[canonicalName] || canonicalName;
        }
    };

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

                // Get canonical spread name to group PT and EN variations together
                const spreadType = spreadCanonicalMap[reading.spreadName || 'Unknown'] || (reading.spreadName || 'Unknown');
                if (!dayMap[dateStr][spreadType]) {
                    dayMap[dateStr][spreadType] = 0;
                }
                dayMap[dateStr][spreadType]++;
            } catch (e) {
                // Silently skip parsing errors
            }
        });

        // Sort by date and return last 7 days
        return Object.entries(dayMap)
            .sort(([dateA], [dateB]) => {
                try {
                    const a = new Date(dateA.replace(/(\d{2})\/(\d{2})/, '$2/$1'));
                    const b = new Date(dateB.replace(/(\d{2})\/(\d{2})/, '$2/$1'));
                    return a.getTime() - b.getTime();
                } catch {
                    return 0;
                }
            })
            .slice(-7)
            .map(([day, types]) => ({
                day,
                total: Object.values(types).reduce((a, b) => a + b, 0),
                breakdown: types,
            }));
    }, [filteredReadings]);

    // Colors for spread types in chart
    const chartColors: Record<string, string> = {
        'Carta do Dia': '#fbbf24',
        'Card of the Day': '#fbbf24',
        'Sim/Não': '#60a5fa',
        'Yes/No': '#60a5fa',
        'Três Cartas': '#c084fc',
        'Three Cards': '#c084fc',
        'Spread do Amor': '#f472b6',
        'Love': '#f472b6',
        'Cruz Celta': '#4ade80',
        'Celtic Cross': '#4ade80',
    };

    const maxFrequency = Math.max(...frequencyData.map(d => d.total), 1);

    return (
        <div className="space-y-8">
            {/* Filters Toggle Button */}
            <div>
                <button
                    onClick={() => setExpandFilters(!expandFilters)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 transition-all duration-200 font-medium text-sm"
                >
                    <span>⚙️</span>
                    {isPortuguese ? 'Filtros' : 'Filters'}
                    <span className={`transition-transform duration-200 ${expandFilters ? 'rotate-180' : ''}`}>▼</span>
                </button>
            </div>

            {/* Filters Section - Expandable */}
            {expandFilters && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10 animate-in fade-in duration-200">
                    <h3 className="text-white font-semibold text-sm uppercase tracking-widest opacity-70">
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
                                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
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
                            <label className="block text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                                {isPortuguese ? 'Ano' : 'Year'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedYear(null)}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${selectedYear === null
                                        ? 'bg-[#875faf] border-[#875faf] text-white shadow-lg scale-105'
                                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    {isPortuguese ? 'Todos' : 'All'}
                                </button>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${selectedYear === year
                                            ? 'bg-[#875faf] border-[#875faf] text-white shadow-lg scale-105'
                                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Month Selector */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                                {isPortuguese ? 'Mês' : 'Month'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedMonth(null)}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${selectedMonth === null
                                        ? 'bg-[#875faf] border-[#875faf] text-white shadow-lg scale-105'
                                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
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
                                                ? 'bg-[#875faf] border-[#875faf] text-white shadow-lg scale-105'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
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
                            className="text-xs text-gray-400 hover:text-[#a77fd4] transition-colors"
                        >
                            {isPortuguese ? '← Limpar filtros' : '← Clear filters'}
                        </button>
                    )}
                </div>
            )}

            {/* New Charts - Dashboard Style - Side by Side */}
            <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm uppercase tracking-widest opacity-70">
                    {isPortuguese ? 'Análise de Leituras' : 'Reading Analysis'}
                </h3>

                {frequencyData.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        {isPortuguese ? 'Nenhuma leitura encontrada' : 'No readings found'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* DRE Chart - Categories Distribution */}
                        {(() => {
                            const dreItems = spreadTypeOptions.map((option) => {
                                const total = frequencyData.reduce((sum, day) => sum + (day.breakdown[option.key] || 0), 0);
                                const colorMap: Record<string, string> = {
                                    'Carta do Dia': '#fbbf24',
                                    'Card of the Day': '#fbbf24',
                                    'Sim/Não': '#60a5fa',
                                    'Yes/No': '#60a5fa',
                                    'Três Cartas': '#c084fc',
                                    'Three Cards': '#c084fc',
                                    'Spread do Amor': '#f472b6',
                                    'Love': '#f472b6',
                                    'Cruz Celta': '#4ade80',
                                    'Celtic Cross': '#4ade80',
                                };
                                return {
                                    label: option.label,
                                    value: total,
                                    color: colorMap[option.key] || '#a77fd4',
                                };
                            });

                            return (
                                <div className="h-[250px] overflow-hidden">
                                    <ExecutiveDREGeneric
                                        items={dreItems}
                                        title={isPortuguese ? 'Visão Executiva' : 'Executive View'}
                                        dark={true}
                                    />
                                </div>
                            );
                        })()}

                        {/* Cards Quantity Chart - Daily Count */}
                        {(() => {
                            const chartData = frequencyData.map((day) => ({
                                label: day.day,
                                quantity: day.total,
                            }));

                            return (
                                <div className="h-[250px] overflow-hidden">
                                    <CashFlowChartGeneric
                                        data={chartData}
                                        title={isPortuguese ? 'Jogadas por Dia' : 'Spreads per Day'}
                                        dark={true}
                                        barColor="#b555ef"
                                        barLabel={isPortuguese ? 'Jogadas' : 'Spreads'}
                                    />
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

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
    // Custom comparison for memo - return true if props are equal (skip render)
    return prevProps.readings === nextProps.readings &&
        prevProps.isPortuguese === nextProps.isPortuguese;
});
