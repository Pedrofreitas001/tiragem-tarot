import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { DailyCardSynthesis } from '../services/geminiService';
import { TarotCardData } from '../tarotData';

interface CardImageExportProps {
    card: TarotCardData;
    cardName: string;
    aiSynthesis: DailyCardSynthesis | null;
    isPortuguese: boolean;
}

export const CardImageExport = ({ card, cardName, aiSynthesis, isPortuguese }: CardImageExportProps) => {
    const imageRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const getFormattedDate = () => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        return today.toLocaleDateString(isPortuguese ? 'pt-BR' : 'en-US', options);
    };

    const handleExport = async () => {
        if (!imageRef.current) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(imageRef.current, {
                scale: 2, // Alta resolução
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#1a1628',
                logging: false,
            });

            // Converter para JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

            // Criar link de download
            const link = document.createElement('a');
            link.download = `carta-do-dia-${new Date().toISOString().split('T')[0]}.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Erro ao exportar imagem:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            {/* Botão de Download */}
            <button
                onClick={() => setShowPreview(true)}
                className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300"
            >
                <span className="material-symbols-outlined text-white text-lg">download</span>
                <span className="text-white text-sm font-medium">
                    {isPortuguese ? 'Baixar Imagem' : 'Download Image'}
                </span>
            </button>

            {/* Modal de Preview e Download */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1628] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Header do Modal */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-white font-semibold">
                                {isPortuguese ? 'Preview da Imagem' : 'Image Preview'}
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Preview da Imagem */}
                        <div className="p-4">
                            <div
                                ref={imageRef}
                                className="w-full aspect-[3/4] rounded-xl overflow-hidden"
                                style={{
                                    background: 'linear-gradient(180deg, #1e0b2b 0%, #2d1b4e 30%, #1a1628 100%)',
                                }}
                            >
                                {/* Container da Imagem para Export */}
                                <div className="h-full flex flex-col items-center justify-between p-6 text-center">
                                    {/* Topo: Logo */}
                                    <div className="flex items-center gap-2 opacity-80">
                                        <span className="material-symbols-outlined text-yellow-400 text-xl">auto_awesome</span>
                                        <span className="text-white font-bold text-lg">Zaya Tarot</span>
                                    </div>

                                    {/* Centro: Carta */}
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                                        {/* Imagem da Carta */}
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
                                            <img
                                                src={card.imageUrl}
                                                alt={cardName}
                                                className="relative w-40 h-64 object-cover rounded-lg shadow-2xl border-2 border-yellow-500/30"
                                                crossOrigin="anonymous"
                                            />
                                        </div>

                                        {/* Nome da Carta */}
                                        <h2
                                            className="text-2xl font-bold"
                                            style={{
                                                fontFamily: "'Crimson Text', serif",
                                                background: 'linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            {cardName}
                                        </h2>

                                        {/* Vibração Universal */}
                                        {aiSynthesis?.vibração_universal && (
                                            <p className="text-purple-200 text-lg font-medium italic max-w-xs">
                                                "{aiSynthesis.vibração_universal}"
                                            </p>
                                        )}

                                        {/* Significado da Carta */}
                                        {aiSynthesis?.significado_carta && (
                                            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
                                                {aiSynthesis.significado_carta}
                                            </p>
                                        )}
                                    </div>

                                    {/* Mantra */}
                                    {aiSynthesis?.mantra_diário && (
                                        <div className="bg-white/5 rounded-lg px-4 py-3 border border-yellow-500/20 max-w-xs">
                                            <p
                                                className="text-sm font-medium"
                                                style={{
                                                    fontFamily: "'Crimson Text', serif",
                                                    background: 'linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                }}
                                            >
                                                "{aiSynthesis.mantra_diário}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Data */}
                                    <div className="mt-4">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">
                                            {isPortuguese ? 'Carta do Dia' : 'Card of the Day'}
                                        </p>
                                        <p className="text-gray-300 text-sm">
                                            {getFormattedDate()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 p-4 border-t border-white/10">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            >
                                {isPortuguese ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                        {isPortuguese ? 'Exportando...' : 'Exporting...'}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">download</span>
                                        {isPortuguese ? 'Baixar JPEG' : 'Download JPEG'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
