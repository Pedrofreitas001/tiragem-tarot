import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from 'recharts';

interface Row {
    label: string;
    quantity?: number;
    [k: string]: any;
}

interface Props {
    data: Row[];
    title?: string;
    dark?: boolean;
    barColor?: string;
    barLabel?: string;
}

const formatYAxis = (value: number) => {
    if (value >= 100) return `${value}`;
    return `${value}`;
};

// Dictionary to map month numbers to full names
const MONTH_DICT: Record<number, string> = {
    1: 'Janeiro',
    2: 'Fevereiro',
    3: 'Março',
    4: 'Abril',
    5: 'Maio',
    6: 'Junho',
    7: 'Julho',
    8: 'Agosto',
    9: 'Setembro',
    10: 'Outubro',
    11: 'Novembro',
    12: 'Dezembro',
};

// Format label to show only day (DD)
const formatDayLabel = (label: string) => {
    if (!label) return label;

    // Extract day from DD/MM format
    if (label.includes('/')) {
        return label.split('/')[0];
    }

    // Extract day from "DD de" format (Portuguese)
    if (label.includes(' de')) {
        return label.split(' ')[0];
    }

    // Extract just the numbers
    const match = label.match(/\d+/);
    if (match) {
        return match[0];
    }

    return label;
};

// Extract month from label and convert to abbreviated name
const getMonth = (label: string): string => {
    if (!label) return '';

    // From DD/MM format
    if (label.includes('/')) {
        const parts = label.split('/');
        if (parts.length >= 2) {
            const monthNum = parseInt(parts[1]);
            return MONTH_DICT[monthNum] || '';
        }
    }

    // From "DD de Month" format (e.g., "29 de")
    if (label.includes(' de')) {
        // If it's just "DD de", we need to infer the month from context
        // For now, return empty and let the component handle it
        return '';
    }

    return '';
};

// Custom label component for bar values
const renderLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
        <text x={x + width / 2} y={y - 5} fill="#b555ef" textAnchor="middle" fontSize="12" fontWeight="bold">
            {value}
        </text>
    );
};

export const CashFlowChartGeneric: React.FC<Props> = ({
    data,
    title = 'Cartas por Dia',
    dark = false,
    barColor = '#b555ef',
    barLabel = 'Cartas',
}) => {
    const isDark = dark;
    const colors = {
        gridStroke: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
        tickFill: isDark ? '#9ca3af' : '#1a1a1a',
    };

    return (
        <div className={`${isDark ? 'bg-card-dark border-border-dark' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg flex flex-col h-full w-full overflow-hidden`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-base`}>{title}</h3>
            </div>
            <div className="flex-1 w-full min-h-0 flex flex-col overflow-x-auto">
                <div className="flex-1 min-h-0 min-w-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 5 }} barCategoryGap="10%">
                            <CartesianGrid vertical={false} stroke={colors.gridStroke} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: colors.tickFill, fontSize: 11 }}
                                dy={5}
                                tickFormatter={formatDayLabel}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.tickFill, fontSize: 12 }} tickFormatter={formatYAxis} />
                            <Bar dataKey="quantity" name={barLabel} fill={barColor} radius={[6, 6, 0, 0]} barSize={20} label={renderLabel} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Month labels row - centered */}
                <div className="flex justify-center items-center h-10 mt-2 min-w-[400px]">
                    {(() => {
                        // Get unique months
                        const months = data.map((item) => {
                            let month = getMonth(item.label);
                            if (!month && item.label.includes('de')) {
                                const currentMonth = new Date().getMonth() + 1;
                                month = MONTH_DICT[currentMonth] || '';
                            }
                            return month;
                        });

                        // Get unique months only
                        const uniqueMonths = Array.from(new Set(months)).filter(m => m);

                        return uniqueMonths.map((month, idx) => (
                            <span
                                key={idx}
                                className="text-sm font-semibold px-4"
                                style={{ color: colors.tickFill, opacity: 0.8 }}
                            >
                                {month}
                            </span>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );
};

export default CashFlowChartGeneric;
