import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { DailyCardSynthesis } from '../services/geminiService';
import { TarotCardData } from '../tarotData';

interface CardImageExportProps {
    card: TarotCardData;
    cardName: string;
    aiSynthesis: DailyCardSynthesis | null;
    isPortuguese: boolean;
}

export const CardImageExport = ({ card, aiSynthesis, isPortuguese }: CardImageExportProps) => {
    const imageRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Pré-carregar imagem como base64 quando o modal abrir
    useEffect(() => {
        if (showPreview && card.imageUrl && !imageBase64) {
            loadImageAsBase64(card.imageUrl)
                .then(setImageBase64)
                .catch(err => console.error('Erro ao carregar imagem:', err));
        }
    }, [showPreview, card.imageUrl, imageBase64]);

    // Função para converter imagem para base64 (resolve problema de CORS)
    const loadImageAsBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            // Timeout para evitar espera infinita
            const timeout = setTimeout(() => {
                reject(new Error('Timeout ao carregar imagem'));
            }, 10000);

            img.onload = () => {
                clearTimeout(timeout);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                } else {
                    reject(new Error('Não foi possível obter contexto do canvas'));
                }
            };
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Erro ao carregar imagem'));
            };

            // Usar proxy CORS para resolver problema de cross-origin
            const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=640&fit=cover&output=jpg`;
            img.src = proxyUrl;
        });
    };

    const getFormattedDate = () => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        return today.toLocaleDateString('pt-BR', options);
    };

    // Nome da carta sempre em português
    const cardNamePt = card.name_pt || card.name;

    const handleExport = async () => {
        if (!imageRef.current) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(imageRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#1a1628',
                logging: false,
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
                    <div className="bg-[#1a1628] rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
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

                        {/* Preview da Imagem - Layout Premium WhatsApp */}
                        <div className="p-3">
                            <div
                                ref={imageRef}
                                className="w-full rounded-xl overflow-hidden"
                                style={{
                                    background: 'linear-gradient(180deg, #1e0b2b 0%, #2d1b4e 40%, #1a1628 100%)',
                                    minHeight: '550px',
                                }}
                            >
                                {/* Container Principal */}
                                <div className="flex flex-col p-4">
                                    {/* Topo: Logo + Data */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-yellow-400 text-sm">auto_awesome</span>
                                            <span className="text-white font-bold text-xs">Zaya Tarot</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-[9px] uppercase tracking-wider">Carta do Dia</p>
                                            <p className="text-gray-300 text-[10px]">{getFormattedDate()}</p>
                                        </div>
                                    </div>

                                    {/* Imagem da Carta */}
                                    <div className="flex justify-center mb-3">
                                        {imageBase64 ? (
                                            <img
                                                src={imageBase64}
                                                alt={cardNamePt}
                                                className="w-[120px] h-[190px] object-cover rounded-lg shadow-2xl border-2 border-yellow-500/30"
                                            />
                                        ) : (
                                            <div className="w-[120px] h-[190px] bg-purple-900/50 rounded-lg flex items-center justify-center border-2 border-yellow-500/30">
                                                <div className="w-5 h-5 border-2 border-yellow-500/50 border-t-yellow-500 rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nome da Carta */}
                                    <h2
                                        className="text-lg font-bold text-white text-center mb-1"
                                        style={{ fontFamily: "'Crimson Text', serif" }}
                                    >
                                        {cardNamePt}
                                    </h2>

                                    {/* Vibração Universal */}
                                    {aiSynthesis?.vibração_universal && (
                                        <p
                                            className="text-sm font-medium italic text-center mb-3"
                                            style={{
                                                color: '#d4af37',
                                                fontFamily: "'Crimson Text', serif",
                                            }}
                                        >
                                            "{aiSynthesis.vibração_universal.length > 50
                                                ? aiSynthesis.vibração_universal.substring(0, 50) + '...'
                                                : aiSynthesis.vibração_universal}"
                                        </p>
                                    )}

                                    {/* Significado da Carta - limitado a 180 caracteres */}
                                    {aiSynthesis?.significado_carta && (
                                        <div className="bg-white/5 rounded-lg px-3 py-2 mb-2">
                                            <p className="text-gray-300 text-[10px] leading-snug text-center">
                                                {aiSynthesis.significado_carta.length > 180
                                                    ? aiSynthesis.significado_carta.substring(0, 180) + '...'
                                                    : aiSynthesis.significado_carta}
                                            </p>
                                        </div>
                                    )}

                                    {/* Energia - limitado a 150 caracteres */}
                                    {aiSynthesis?.energia_emocional && (
                                        <div className="flex items-start gap-2 px-1 mb-3">
                                            <span
                                                className="text-[9px] mt-0.5"
                                                style={{ color: '#d4af37' }}
                                            >
                                                ●
                                            </span>
                                            <div>
                                                <span
                                                    className="text-[9px] font-semibold uppercase tracking-wide"
                                                    style={{ color: '#d4af37' }}
                                                >
                                                    Energia
                                                </span>
                                                <p className="text-gray-300 text-[9px] leading-snug mt-0.5">
                                                    {aiSynthesis.energia_emocional.length > 150
                                                        ? aiSynthesis.energia_emocional.substring(0, 150) + '...'
                                                        : aiSynthesis.energia_emocional}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Linha decorativa */}
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent my-2"></div>

                                    {/* Mantra do Dia */}
                                    {aiSynthesis?.mantra_diário && (
                                        <>
                                            <p
                                                className="text-[9px] font-semibold uppercase tracking-wide mb-2 text-center"
                                                style={{ color: '#d4af37' }}
                                            >
                                                Mantra do Dia
                                            </p>
                                            <div className="bg-white/5 rounded-lg px-3 py-3 border border-yellow-500/20 flex items-center justify-center">
                                                <p
                                                    className="text-[11px] font-medium text-center italic"
                                                    style={{
                                                        fontFamily: "'Crimson Text', serif",
                                                        color: '#d4af37'
                                                    }}
                                                >
                                                    "{aiSynthesis.mantra_diário.length > 80
                                                        ? aiSynthesis.mantra_diário.substring(0, 80) + '...'
                                                        : aiSynthesis.mantra_diário}"
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {/* Rodapé com site */}
                                    <div className="mt-2 text-center">
                                        <p className="text-gray-500 text-[8px] tracking-wider">
                                            zayatarot.com
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
                                disabled={isExporting || !imageBase64}
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
