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

// Format label to ensure DD/MM format
const formatXAxisLabel = (label: string) => {
    // Ensure format is DD/MM
    if (label && label.length >= 5) {
        return label.substring(0, 5);
    }
    return label;
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
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke={colors.gridStroke} strokeDasharray="3 3" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: colors.tickFill, fontSize: 12 }} dy={5} tickFormatter={formatXAxisLabel} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.tickFill, fontSize: 12 }} tickFormatter={formatYAxis} />
                        <Bar dataKey="quantity" name={barLabel} fill={barColor} radius={[6, 6, 0, 0]} barSize={20} label={renderLabel} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CashFlowChartGeneric;
