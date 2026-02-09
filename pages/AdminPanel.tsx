import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useAdmin } from '../hooks/useAdmin';
import { useLanguage } from '../contexts/LanguageContext';
import { TAROT_CARDS, TarotCardData } from '../tarotData';
import { getDailyCardSynthesis, DailyCardSynthesis } from '../services/geminiService';

// Lista de signos
const ZODIAC_SIGNS = [
    { id: 'aries', name: 'Áries', name_en: 'Aries' },
    { id: 'touro', name: 'Touro', name_en: 'Taurus' },
    { id: 'gemeos', name: 'Gêmeos', name_en: 'Gemini' },
    { id: 'cancer', name: 'Câncer', name_en: 'Cancer' },
    { id: 'leao', name: 'Leão', name_en: 'Leo' },
    { id: 'virgem', name: 'Virgem', name_en: 'Virgo' },
    { id: 'libra', name: 'Libra', name_en: 'Libra' },
    { id: 'escorpiao', name: 'Escorpião', name_en: 'Scorpio' },
    { id: 'sagitario', name: 'Sagitário', name_en: 'Sagittarius' },
    { id: 'capricornio', name: 'Capricórnio', name_en: 'Capricorn' },
    { id: 'aquario', name: 'Aquário', name_en: 'Aquarius' },
    { id: 'peixes', name: 'Peixes', name_en: 'Pisces' },
];

interface GeneratedImage {
    id: string;
    type: 'daily' | 'signo';
    cardName: string;
    signoName?: string;
    dataUrl: string;
    fileName: string;
    downloaded: boolean;
}

export const AdminPanel = () => {
    const { isAdmin, isLoading, user } = useAdmin();
    const { isPortuguese } = useLanguage();
    const navigate = useNavigate();

    // Estados
    const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
    const [generatingType, setGeneratingType] = useState<'daily' | 'signo' | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0, message: '' });
    const [aiSynthesis, setAiSynthesis] = useState<DailyCardSynthesis | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Ref para o canvas de renderização
    const canvasRef = useRef<HTMLDivElement>(null);

    // Verificar se é admin
    useEffect(() => {
        if (!isLoading && !isAdmin) {
            // Se não for admin e já carregou, redireciona
            if (user) {
                // Está logado mas não é admin
                navigate('/');
            }
        }
    }, [isLoading, isAdmin, user, navigate]);

    // Carregar imagem como base64
    const loadImageAsBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const timeout = setTimeout(() => reject(new Error('Timeout')), 15000);

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
                    reject(new Error('Erro ao criar canvas'));
                }
            };
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Erro ao carregar imagem'));
            };

            const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=640&fit=cover&output=jpg`;
            img.src = proxyUrl;
        });
    };

    // Formatar data
    const getFormattedDate = () => {
        const today = new Date();
        return today.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Gerar imagem a partir do canvas
    const generateImageFromCanvas = async (): Promise<string> => {
        if (!canvasRef.current) throw new Error('Canvas não encontrado');

        const canvas = await html2canvas(canvasRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#1a1628',
            logging: false,
        });

        return canvas.toDataURL('image/jpeg', 0.95);
    };

    // Gerar carta do dia
    const generateDailyCard = async () => {
        if (!selectedCard) return;

        setIsGenerating(true);
        setGeneratingType('daily');
        setCurrentProgress({ current: 0, total: 2, message: 'Carregando imagem da carta...' });

        try {
            // 1. Carregar imagem
            const base64 = await loadImageAsBase64(selectedCard.imageUrl);
            setImageBase64(base64);

            setCurrentProgress({ current: 1, total: 2, message: 'Gerando síntese com IA...' });

            // 2. Gerar síntese
            const synthesis = await getDailyCardSynthesis(
                { name: selectedCard.name, name_pt: selectedCard.name_pt, id: selectedCard.id },
                true
            );
            setAiSynthesis(synthesis);

            // Aguardar um pouco para o React renderizar
            await new Promise(resolve => setTimeout(resolve, 500));

            setCurrentProgress({ current: 2, total: 2, message: 'Capturando imagem...' });

            // 3. Gerar imagem
            const dataUrl = await generateImageFromCanvas();
            const fileName = `carta-do-dia-${selectedCard.slug_pt || selectedCard.slug}-${new Date().toISOString().split('T')[0]}.jpg`;

            setGeneratedImages(prev => [...prev, {
                id: `daily-${Date.now()}`,
                type: 'daily',
                cardName: selectedCard.name_pt,
                dataUrl,
                fileName,
                downloaded: false,
            }]);

            setCurrentProgress({ current: 2, total: 2, message: 'Imagem gerada com sucesso!' });

        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            setCurrentProgress({ current: 0, total: 0, message: `Erro: ${error}` });
        } finally {
            setIsGenerating(false);
            setGeneratingType(null);
        }
    };

    // Gerar todas as cartas do dia (78 cartas)
    const generateAllDailyCards = async () => {
        setIsGenerating(true);
        setGeneratingType('daily');
        const total = TAROT_CARDS.length;

        for (let i = 0; i < total; i++) {
            const card = TAROT_CARDS[i];
            setCurrentProgress({ current: i + 1, total, message: `Gerando ${card.name_pt}...` });

            try {
                // Carregar imagem
                const base64 = await loadImageAsBase64(card.imageUrl);
                setImageBase64(base64);
                setSelectedCard(card);

                // Gerar síntese
                const synthesis = await getDailyCardSynthesis(
                    { name: card.name, name_pt: card.name_pt, id: card.id },
                    true
                );
                setAiSynthesis(synthesis);

                await new Promise(resolve => setTimeout(resolve, 300));

                // Gerar imagem
                const dataUrl = await generateImageFromCanvas();
                const fileName = `carta-do-dia-${card.slug_pt || card.slug}-${new Date().toISOString().split('T')[0]}.jpg`;

                setGeneratedImages(prev => [...prev, {
                    id: `daily-${card.id}-${Date.now()}`,
                    type: 'daily',
                    cardName: card.name_pt,
                    dataUrl,
                    fileName,
                    downloaded: false,
                }]);

            } catch (error) {
                console.error(`Erro ao gerar ${card.name_pt}:`, error);
            }

            // Pequeno delay entre cartas
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setIsGenerating(false);
        setGeneratingType(null);
        setCurrentProgress({ current: total, total, message: 'Todas as imagens geradas!' });
    };

    // Download de uma imagem
    const downloadImage = (image: GeneratedImage) => {
        const link = document.createElement('a');
        link.download = image.fileName;
        link.href = image.dataUrl;
        link.click();

        setGeneratedImages(prev =>
            prev.map(img => img.id === image.id ? { ...img, downloaded: true } : img)
        );
    };

    // Download de todas as imagens pendentes
    const downloadAllPending = async () => {
        const pending = generatedImages.filter(img => !img.downloaded);
        for (const img of pending) {
            downloadImage(img);
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre downloads
        }
    };

    // Limpar imagens geradas
    const clearGenerated = () => {
        setGeneratedImages([]);
        setAiSynthesis(null);
        setImageBase64(null);
    };

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#16082a] to-[#0d0015] flex items-center justify-center">
                <div className="text-white text-xl">Carregando...</div>
            </div>
        );
    }

    // Não é admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#16082a] to-[#0d0015] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Acesso Negado</h1>
                    <p className="text-gray-400 mb-6">Você não tem permissão para acessar esta página.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#16082a] to-[#0d0015] flex flex-col">
            {/* Header com navegação */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-[#1a0a2e]/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white text-lg font-bold leading-tight tracking-tight hover:text-purple-400 transition-colors"
                    >
                        Zaya Tarot
                    </button>
                    <nav className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">home</span>
                            Início
                        </button>
                        <button
                            onClick={() => navigate(isPortuguese ? '/configuracoes' : '/settings')}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Configurações
                        </button>
                    </nav>
                </div>
            </header>

            <div className="flex-1 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
                    <p className="text-gray-400">Geração de imagens em lote para WhatsApp</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna 1: Seleção de Carta */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">Selecionar Carta</h2>

                        <div className="mb-4">
                            <select
                                value={selectedCard?.id || ''}
                                onChange={(e) => {
                                    const card = TAROT_CARDS.find(c => c.id === e.target.value);
                                    setSelectedCard(card || null);
                                }}
                                className="w-full bg-[#1a1628] text-white border border-white/20 rounded-lg px-4 py-3 [&>option]:bg-[#1a1628] [&>option]:text-white [&>optgroup]:bg-[#0d0015] [&>optgroup]:text-gray-400 [&>optgroup]:font-semibold"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="" className="text-gray-400">Escolha uma carta...</option>
                                <optgroup label="Arcanos Maiores">
                                    {TAROT_CARDS.filter(c => c.arcana === 'major').map(card => (
                                        <option key={card.id} value={card.id}>{card.name_pt}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Copas">
                                    {TAROT_CARDS.filter(c => c.suit === 'Cups').map(card => (
                                        <option key={card.id} value={card.id}>{card.name_pt}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Ouros">
                                    {TAROT_CARDS.filter(c => c.suit === 'Pentacles').map(card => (
                                        <option key={card.id} value={card.id}>{card.name_pt}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Espadas">
                                    {TAROT_CARDS.filter(c => c.suit === 'Swords').map(card => (
                                        <option key={card.id} value={card.id}>{card.name_pt}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Paus">
                                    {TAROT_CARDS.filter(c => c.suit === 'Wands').map(card => (
                                        <option key={card.id} value={card.id}>{card.name_pt}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {selectedCard && (
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <img
                                    src={selectedCard.imageUrl}
                                    alt={selectedCard.name_pt}
                                    className="w-24 h-40 object-cover rounded-lg mx-auto mb-2"
                                />
                                <p className="text-white font-medium">{selectedCard.name_pt}</p>
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            <button
                                onClick={generateDailyCard}
                                disabled={!selectedCard || isGenerating}
                                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating && generatingType === 'daily' ? 'Gerando...' : 'Gerar Carta do Dia'}
                            </button>

                            <button
                                onClick={generateAllDailyCards}
                                disabled={isGenerating}
                                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? 'Gerando...' : 'Gerar TODAS as 78 Cartas'}
                            </button>
                        </div>

                        {/* Progress */}
                        {currentProgress.total > 0 && (
                            <div className="mt-4 p-4 bg-white/5 rounded-lg">
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span>{currentProgress.message}</span>
                                    <span>{currentProgress.current}/{currentProgress.total}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna 2: Preview da Imagem */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>

                        {/* Canvas para geração - altura dinâmica */}
                        <div className="flex justify-center">
                            <div
                                ref={canvasRef}
                                className="w-[280px] rounded-xl overflow-hidden"
                                style={{
                                    background: 'linear-gradient(180deg, #1e0b2b 0%, #2d1b4e 40%, #1a1628 100%)',
                                    minHeight: '498px', /* 280 * 16/9 */
                                }}
                            >
                                <div className="flex flex-col p-4">
                                    {/* Header */}
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
                                                alt={selectedCard?.name_pt || 'Carta'}
                                                className="w-[140px] h-[220px] object-cover rounded-lg shadow-2xl border-2 border-yellow-500/30"
                                            />
                                        ) : (
                                            <div className="w-[140px] h-[220px] bg-purple-900/50 rounded-lg flex items-center justify-center border-2 border-yellow-500/30">
                                                <span className="text-gray-500 text-xs">Selecione</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nome da Carta */}
                                    <h2
                                        className="text-lg font-bold text-white text-center mb-1"
                                        style={{ fontFamily: "'Crimson Text', serif" }}
                                    >
                                        {selectedCard?.name_pt || 'Nome da Carta'}
                                    </h2>

                                    {/* Vibração Universal */}
                                    {aiSynthesis?.vibração_universal && (
                                        <p
                                            className="text-sm font-medium italic text-center mb-3"
                                            style={{ color: '#d4af37', fontFamily: "'Crimson Text', serif" }}
                                        >
                                            "{aiSynthesis.vibração_universal.length > 50
                                                ? aiSynthesis.vibração_universal.substring(0, 50) + '...'
                                                : aiSynthesis.vibração_universal}"
                                        </p>
                                    )}

                                    {/* Significado - limitado a 180 caracteres */}
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
                                            <span className="text-[9px] mt-0.5" style={{ color: '#d4af37' }}>●</span>
                                            <div>
                                                <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#d4af37' }}>
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

                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent my-2"></div>

                                    {/* Mantra do Dia */}
                                    {aiSynthesis?.mantra_diário && (
                                        <>
                                            <p
                                                className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-center"
                                                style={{ color: '#d4af37' }}
                                            >
                                                Mantra do Dia
                                            </p>
                                            <div className="bg-white/5 rounded-lg px-3 py-2 border border-yellow-500/20">
                                                <p
                                                    className="text-[11px] font-medium text-center italic"
                                                    style={{ fontFamily: "'Crimson Text', serif", color: '#d4af37' }}
                                                >
                                                    "{aiSynthesis.mantra_diário.length > 80
                                                        ? aiSynthesis.mantra_diário.substring(0, 80) + '...'
                                                        : aiSynthesis.mantra_diário}"
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-2 text-center">
                                        <p className="text-gray-500 text-[8px] tracking-wider">zayatarot.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 3: Imagens Geradas */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                Imagens Geradas ({generatedImages.length})
                            </h2>
                            {generatedImages.length > 0 && (
                                <button
                                    onClick={clearGenerated}
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    Limpar
                                </button>
                            )}
                        </div>

                        {generatedImages.length > 0 && (
                            <button
                                onClick={downloadAllPending}
                                className="w-full mb-4 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg"
                            >
                                Baixar Todas ({generatedImages.filter(i => !i.downloaded).length} pendentes)
                            </button>
                        )}

                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {generatedImages.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    Nenhuma imagem gerada ainda
                                </p>
                            ) : (
                                generatedImages.map(image => (
                                    <div
                                        key={image.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${image.downloaded ? 'bg-green-500/10' : 'bg-white/5'
                                            }`}
                                    >
                                        <img
                                            src={image.dataUrl}
                                            alt={image.cardName}
                                            className="w-12 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {image.cardName}
                                            </p>
                                            <p className="text-gray-400 text-xs truncate">
                                                {image.fileName}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => downloadImage(image)}
                                            className={`px-3 py-1.5 rounded text-sm font-medium ${image.downloaded
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500 text-black hover:bg-yellow-400'
                                                }`}
                                        >
                                            {image.downloaded ? '✓' : 'Baixar'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Footer */}
            <footer className="mt-auto border-t border-white/10 bg-[#0d0015]/80">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
                    <p className="text-gray-500 text-sm">© 2025 Zaya Tarot. Painel Administrativo.</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            Voltar ao Site
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};
