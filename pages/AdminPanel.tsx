import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useAdmin } from '../hooks/useAdmin';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { TAROT_CARDS, TarotCardData } from '../tarotData';
import { getDailyCardSynthesis, DailyCardSynthesis } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { generateEbookPdf, getEbookInfo, type EbookProgressCallback } from '../services/ebookPdfService';
import { generateEbookPdfDev1, getEbookInfoDev1 } from '../services/ebookPdfServiceDev1';

// Tipos para estatísticas
interface AdminStats {
    totalUsers: number;
    premiumUsers: number;
    whatsappSubscriptions: number;
    totalReadings: number;
    newUsersWeek: number;
    newUsersMonth: number;
    activeSubscriptions: number;
    readingsWeek: number;
    conversionRate: string;
    generatedAt: string;
}

type AdminTab = 'images' | 'stats' | 'ebook';

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
    const { session } = useAuth();
    const navigate = useNavigate();

    // Estados - Tabs
    const [activeTab, setActiveTab] = useState<AdminTab>('stats');

    // Estados - Imagens
    const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
    const [generatingType, setGeneratingType] = useState<'daily' | 'signo' | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0, message: '' });
    const [aiSynthesis, setAiSynthesis] = useState<DailyCardSynthesis | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Estados - Estatísticas
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);

    // Estados - Ebook Original
    const [ebookGenerating, setEbookGenerating] = useState(false);
    const [ebookProgress, setEbookProgress] = useState({ current: 0, total: 0, message: '' });
    const [ebookBlob, setEbookBlob] = useState<Blob | null>(null);
    const [ebookError, setEbookError] = useState<string | null>(null);

    // Estados - Ebook Desenvolvimento-1
    const [ebookGeneratingDev1, setEbookGeneratingDev1] = useState(false);
    const [ebookProgressDev1, setEbookProgressDev1] = useState({ current: 0, total: 0, message: '' });
    const [ebookBlobDev1, setEbookBlobDev1] = useState<Blob | null>(null);
    const [ebookErrorDev1, setEbookErrorDev1] = useState<string | null>(null);

    // Ref para o canvas de renderização
    const canvasRef = useRef<HTMLDivElement>(null);

    // Carregar estatísticas
    const loadStats = async () => {
        if (!session?.access_token) return;

        setStatsLoading(true);
        setStatsError(null);

        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao carregar estatísticas');
            }

            setStats(data.stats);
        } catch (error: any) {
            console.error('Erro ao carregar stats:', error);
            setStatsError(error.message || 'Erro ao carregar estatísticas');
        } finally {
            setStatsLoading(false);
        }
    };

    // Carregar stats quando mudar para aba de estatísticas
    useEffect(() => {
        if (activeTab === 'stats' && isAdmin && !stats && !statsLoading) {
            loadStats();
        }
    }, [activeTab, isAdmin, session]);

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

    // Gerar Ebook PDF
    const handleGenerateEbook = async () => {
        setEbookGenerating(true);
        setEbookError(null);
        setEbookBlob(null);

        try {
            const blob = await generateEbookPdf((current, total, message) => {
                setEbookProgress({ current, total, message });
            });
            setEbookBlob(blob);
        } catch (error: any) {
            console.error('Erro ao gerar ebook:', error);
            setEbookError(error.message || 'Erro ao gerar o ebook');
        } finally {
            setEbookGenerating(false);
        }
    };

    // Download do Ebook
    const handleDownloadEbook = () => {
        if (!ebookBlob) return;
        const info = getEbookInfo();
        const url = URL.createObjectURL(ebookBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = info.fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Gerar Ebook Desenvolvimento-1
    const handleGenerateEbookDev1 = async () => {
        setEbookGeneratingDev1(true);
        setEbookErrorDev1(null);
        setEbookBlobDev1(null);
        try {
            const blob = await generateEbookPdfDev1((current, total, message) => {
                setEbookProgressDev1({ current, total, message });
            });
            setEbookBlobDev1(blob);
        } catch (error: any) {
            console.error('Erro ao gerar ebook dev1:', error);
            setEbookErrorDev1(error.message || 'Erro ao gerar o ebook Desenvolvimento-1');
        } finally {
            setEbookGeneratingDev1(false);
        }
    };

    // Download do Ebook Desenvolvimento-1
    const handleDownloadEbookDev1 = () => {
        if (!ebookBlobDev1) return;
        const info = getEbookInfoDev1();
        const url = URL.createObjectURL(ebookBlobDev1);
        const link = document.createElement('a');
        link.href = url;
        link.download = info.fileName;
        link.click();
        URL.revokeObjectURL(url);
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
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 lg:py-3 flex items-center justify-between">
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
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
                        <p className="text-gray-400">Gestão e análise do Zaya Tarot</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'stats'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">analytics</span>
                            Estatísticas
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'images'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">image</span>
                            Gerador de Imagens
                        </button>
                        <button
                            onClick={() => setActiveTab('ebook')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'ebook'
                                    ? 'bg-gradient-to-r from-purple-600 to-yellow-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">menu_book</span>
                            Ebook Premium
                        </button>
                    </div>

                    {/* Tab Content: Estatísticas */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            {/* Header com botão refresh */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">Visão Geral</h2>
                                <button
                                    onClick={loadStats}
                                    disabled={statsLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <span className={`material-symbols-outlined text-lg ${statsLoading ? 'animate-spin' : ''}`}>
                                        refresh
                                    </span>
                                    Atualizar
                                </button>
                            </div>

                            {/* Erro */}
                            {statsError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                    {statsError}
                                </div>
                            )}

                            {/* Loading */}
                            {statsLoading && !stats && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                </div>
                            )}

                            {/* Stats Cards */}
                            {stats && (
                                <>
                                    {/* Principais métricas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Total de Usuários */}
                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-2xl text-purple-400">group</span>
                                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Total</span>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers.toLocaleString()}</p>
                                            <p className="text-sm text-gray-400">Usuários cadastrados</p>
                                        </div>

                                        {/* Usuários Premium */}
                                        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-5 border border-yellow-500/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-2xl text-yellow-400">workspace_premium</span>
                                                <span className="text-xs text-yellow-400/70 bg-yellow-500/10 px-2 py-1 rounded">Premium</span>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">{stats.premiumUsers.toLocaleString()}</p>
                                            <p className="text-sm text-gray-400">Assinantes ativos</p>
                                        </div>

                                        {/* WhatsApp */}
                                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-5 border border-green-500/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-2xl text-green-400">chat</span>
                                                <span className="text-xs text-green-400/70 bg-green-500/10 px-2 py-1 rounded">WhatsApp</span>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">{stats.whatsappSubscriptions.toLocaleString()}</p>
                                            <p className="text-sm text-gray-400">Inscrições ativas</p>
                                        </div>

                                        {/* Taxa de Conversão */}
                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-2xl text-blue-400">trending_up</span>
                                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Conversão</span>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">{stats.conversionRate}%</p>
                                            <p className="text-sm text-gray-400">Free → Premium</p>
                                        </div>
                                    </div>

                                    {/* Métricas secundárias */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Novos usuários (7 dias) */}
                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="material-symbols-outlined text-xl text-purple-400">person_add</span>
                                                <span className="text-sm text-gray-400">Novos usuários (7 dias)</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{stats.newUsersWeek.toLocaleString()}</p>
                                        </div>

                                        {/* Novos usuários (30 dias) */}
                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="material-symbols-outlined text-xl text-purple-400">calendar_month</span>
                                                <span className="text-sm text-gray-400">Novos usuários (30 dias)</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{stats.newUsersMonth.toLocaleString()}</p>
                                        </div>

                                        {/* Total de leituras */}
                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="material-symbols-outlined text-xl text-purple-400">auto_awesome</span>
                                                <span className="text-sm text-gray-400">Total de leituras</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{stats.totalReadings.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Info de atualização */}
                                    <div className="text-center text-xs text-gray-500">
                                        Última atualização: {new Date(stats.generatedAt).toLocaleString('pt-BR')}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Gerador de Imagens */}
                    {activeTab === 'images' && (
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
                                                        className="w-[120px] h-[190px] object-cover rounded-lg shadow-2xl border-2 border-yellow-500/30"
                                                    />
                                                ) : (
                                                    <div className="w-[120px] h-[190px] bg-purple-900/50 rounded-lg flex items-center justify-center border-2 border-yellow-500/30">
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
                                                        className="text-[9px] font-semibold uppercase tracking-wide mb-2 text-center"
                                                        style={{ color: '#d4af37' }}
                                                    >
                                                        Mantra do Dia
                                                    </p>
                                                    <div className="bg-white/5 rounded-lg px-3 py-3 border border-yellow-500/20 flex items-center justify-center">
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
                    )}
                    {/* Tab Content: Ebook Premium */}
                    {activeTab === 'ebook' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Coluna 1: Cards de Geração */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Card ORIGINAL */}
                                <div className="bg-gradient-to-br from-purple-900/30 to-yellow-900/10 rounded-xl p-6 border border-yellow-500/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-yellow-500 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-3xl text-white">menu_book</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                    {getEbookInfo().title}
                                                </h2>
                                                <span className="px-2 py-0.5 text-xs font-bold bg-gray-600/50 text-gray-300 rounded-full border border-gray-500/30">ORIGINAL</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4">
                                                {getEbookInfo().description}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                                                {getEbookInfo().features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-yellow-400 text-xs">&#10022;</span>
                                                        <span className="text-gray-300 text-xs">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={handleGenerateEbook}
                                                    disabled={ebookGenerating}
                                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-yellow-600 hover:from-purple-500 hover:to-yellow-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                                                >
                                                    {ebookGenerating ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Gerando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined">auto_awesome</span>
                                                            Gerar Original
                                                        </>
                                                    )}
                                                </button>
                                                {ebookBlob && (
                                                    <button
                                                        onClick={handleDownloadEbook}
                                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/20"
                                                    >
                                                        <span className="material-symbols-outlined">download</span>
                                                        Baixar Original ({(ebookBlob.size / 1024 / 1024).toFixed(1)} MB)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progresso Original */}
                                {ebookProgress.total > 0 && (
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-white text-sm font-medium">
                                                {ebookGenerating ? 'Gerando ebook original...' : 'Original gerado!'}
                                            </span>
                                            <span className="text-gray-400 text-sm">{ebookProgress.current}/{ebookProgress.total}</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                                            <div className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-yellow-500"
                                                style={{ width: `${(ebookProgress.current / ebookProgress.total) * 100}%` }} />
                                        </div>
                                        <p className="text-gray-400 text-xs">{ebookProgress.message}</p>
                                    </div>
                                )}
                                {ebookError && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-3">
                                        <span className="material-symbols-outlined">error</span>
                                        {ebookError}
                                    </div>
                                )}
                                {ebookBlob && !ebookGenerating && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                                        <div>
                                            <p className="text-green-400 font-medium">Original gerado com sucesso!</p>
                                            <p className="text-green-400/70 text-sm">Tamanho: {(ebookBlob.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                )}

                                {/* Card DESENVOLVIMENTO-1 */}
                                <div className="bg-gradient-to-br from-yellow-900/20 to-purple-900/20 rounded-xl p-6 border border-yellow-400/30">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-3xl text-white">science</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                    {getEbookInfoDev1().title}
                                                </h2>
                                                <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-400/30">DEV-1</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4">
                                                {getEbookInfoDev1().description}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                                                {getEbookInfoDev1().features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-yellow-300 text-xs">&#10022;</span>
                                                        <span className="text-gray-300 text-xs">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-yellow-400/60 text-xs mb-4 italic">
                                                Versão em desenvolvimento — conteúdo enriquecido para teste e validação.
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={handleGenerateEbookDev1}
                                                    disabled={ebookGeneratingDev1}
                                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                                                >
                                                    {ebookGeneratingDev1 ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Gerando Dev-1...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined">science</span>
                                                            Gerar Desenvolvimento-1
                                                        </>
                                                    )}
                                                </button>
                                                {ebookBlobDev1 && (
                                                    <button
                                                        onClick={handleDownloadEbookDev1}
                                                        className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-yellow-500/20"
                                                    >
                                                        <span className="material-symbols-outlined">download</span>
                                                        Baixar Dev-1 ({(ebookBlobDev1.size / 1024 / 1024).toFixed(1)} MB)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progresso Dev1 */}
                                {ebookProgressDev1.total > 0 && (
                                    <div className="bg-white/5 rounded-xl p-5 border border-yellow-400/10">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-white text-sm font-medium">
                                                {ebookGeneratingDev1 ? 'Gerando Desenvolvimento-1...' : 'Dev-1 gerado!'}
                                            </span>
                                            <span className="text-gray-400 text-sm">{ebookProgressDev1.current}/{ebookProgressDev1.total}</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                                            <div className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-500"
                                                style={{ width: `${(ebookProgressDev1.current / ebookProgressDev1.total) * 100}%` }} />
                                        </div>
                                        <p className="text-gray-400 text-xs">{ebookProgressDev1.message}</p>
                                    </div>
                                )}
                                {ebookErrorDev1 && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-3">
                                        <span className="material-symbols-outlined">error</span>
                                        {ebookErrorDev1}
                                    </div>
                                )}
                                {ebookBlobDev1 && !ebookGeneratingDev1 && (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
                                        <span className="material-symbols-outlined text-yellow-400">check_circle</span>
                                        <div>
                                            <p className="text-yellow-400 font-medium">Desenvolvimento-1 gerado com sucesso!</p>
                                            <p className="text-yellow-400/70 text-sm">Tamanho: {(ebookBlobDev1.size / 1024 / 1024).toFixed(2)} MB — ~53 páginas</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Coluna 2: Preview */}
                            <div className="space-y-6">
                                {/* Preview visual do ebook */}
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>

                                    {/* Mockup da capa */}
                                    <div
                                        className="rounded-lg overflow-hidden mx-auto shadow-2xl shadow-purple-500/20"
                                        style={{
                                            width: '200px',
                                            height: '280px',
                                            background: 'linear-gradient(180deg, #2D1B4E 0%, #161118 100%)',
                                            border: '1px solid rgba(212, 175, 55, 0.3)',
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                            <p className="text-[8px] text-purple-300/70 uppercase tracking-widest mb-1">Zaya Tarot</p>
                                            <h4
                                                className="text-base font-bold mb-0.5"
                                                style={{ color: '#D4AF37', fontFamily: "'Crimson Text', serif" }}
                                            >
                                                JORNADA
                                            </h4>
                                            <h4
                                                className="text-base font-bold mb-2"
                                                style={{ color: '#D4AF37', fontFamily: "'Crimson Text', serif" }}
                                            >
                                                DO HERÓI
                                            </h4>
                                            <div className="w-16 h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent mb-2"></div>
                                            <p className="text-[8px] text-yellow-100/60" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                Os 22 Arcanos Maiores
                                            </p>
                                            {/* Mini cards */}
                                            <div className="flex gap-0.5 mt-3 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-5 h-8 rounded-sm"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #5B3A8F 0%, #2D1B4E 100%)',
                                                            border: '0.5px solid rgba(212, 175, 55, 0.4)',
                                                            transform: `rotate(${(i - 2) * 8}deg)`,
                                                            boxShadow: '0 2px 8px rgba(147, 17, 212, 0.3)',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="w-8 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent mt-2 mb-1"></div>
                                            <p className="text-[6px] text-purple-300/50 uppercase tracking-wider">Arquivo Arcano</p>
                                        </div>
                                    </div>

                                    {/* Info do arquivo */}
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Formato</span>
                                            <span className="text-white">PDF (A4)</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Original</span>
                                            <span className="text-white">~30 páginas</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-yellow-400">Dev-1</span>
                                            <span className="text-yellow-300">~53 páginas</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Conteúdo</span>
                                            <span className="text-white">22 Arcanos Maiores</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Imagens</span>
                                            <span className="text-white">Rider-Waite-Smith</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info infoproduto */}
                                <div className="bg-gradient-to-br from-yellow-500/5 to-purple-500/5 rounded-xl p-5 border border-yellow-500/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-yellow-400">workspace_premium</span>
                                        <h3 className="text-sm font-semibold text-yellow-400">Infoproduto Premium</h3>
                                    </div>
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        O <strong className="text-gray-300">Original</strong> é o produto estável atual.
                                        O <strong className="text-yellow-300">Dev-1</strong> é a versão enriquecida em teste:
                                        intro narrativa, reflexões por arcano, tiragem, localização na jornada e integração Zaya Tarot.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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
