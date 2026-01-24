import React from 'react';
import ExecutiveDREGeneric from './ExecutiveDREGeneric';
import CashFlowChartGeneric from './CashFlowChartGeneric';

// Exemplo com dados de Tarô
const dreItems = [
    { label: 'Arcanos Maiores', value: 45, color: '#875faf' },
    { label: 'Copas', value: 32, color: '#3b82f6' },
    { label: 'Ouros', value: 28, color: '#fbbf24' },
    { label: 'Espadas', value: 25, color: '#60a5fa' },
    { label: 'Paus', value: 22, color: '#4ade80' },
];

const chartData = [
    { label: 'Segun.', inflow: 8, outflow: 2 },
    { label: 'Terça', inflow: 12, outflow: 3 },
    { label: 'Quarta', inflow: 15, outflow: 5 },
    { label: 'Quinta', inflow: 18, outflow: 4 },
    { label: 'Sexta', inflow: 22, outflow: 6 },
    { label: 'Sábado', inflow: 25, outflow: 7 },
    { label: 'Domingo', inflow: 20, outflow: 5 },
];

export const SideBySideExample: React.FC = () => (
    <div className="flex gap-6 p-6 bg-background-dark min-h-screen">
        <div className="flex-1">
            <ExecutiveDREGeneric
                items={dreItems}
                title="Visão Executiva (Tarô)"
                dark={true}
            />
        </div>
        <div className="flex-1">
            <CashFlowChartGeneric
                data={chartData}
                title="Fluxo de Leituras"
                dark={true}
                inflowColor="#4ade80"
                outflowColor="#f472b6"
                inflowLabel="Cartas Diretas"
                outflowLabel="Cartas Invertidas"
            />
        </div>
    </div>
);

export default SideBySideExample;
