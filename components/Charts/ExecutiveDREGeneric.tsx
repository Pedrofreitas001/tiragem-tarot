import React from 'react';

interface DreItem {
    label: string;
    value: number;
    color?: string;
}

interface Props {
    items: DreItem[];
    title?: string;
    dark?: boolean;
}

const formatValue = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return `${v}`;
};

export const ExecutiveDREGeneric: React.FC<Props> = ({ items, title = 'Visão Executiva (Tarô)', dark = false }) => {
    const isDark = dark;
    const maxValue = Math.max(...items.map(i => Math.abs(i.value)), 1);

    return (
        <div className={`${isDark ? 'bg-card-dark border-border-dark' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg flex flex-col h-full w-full`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-base`}>{title}</h3>
                <span className={`text-[9px] ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider font-bold`}>Proporcional</span>
            </div>

            <div className="flex flex-col gap-2 justify-center flex-1 pr-1">
                {items.map((item) => {
                    const absValue = Math.abs(item.value);
                    const percentage = Math.min((absValue / maxValue) * 100, 100);
                    const barClass = item.color && item.color.startsWith('#') ? '' : item.color || 'bg-primary';
                    const barStyle = item.color && item.color.startsWith('#') ? { backgroundColor: item.color } : undefined;

                    return (
                        <div key={item.label} className="flex flex-col">
                            <div className="flex justify-between items-end mb-1">
                                <span className={`text-[9px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-widest`}>{item.label}</span>
                                <span className={`text-[9px] font-black ${isDark ? 'text-white' : 'text-gray-900'} whitespace-nowrap`}>{formatValue(item.value)}</span>
                            </div>

                            <div className={`w-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-300'} rounded-full h-2 overflow-hidden border`}>
                                <div
                                    className={`${barClass} h-full rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${percentage}%`, ...(barStyle || {}) }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExecutiveDREGeneric;
