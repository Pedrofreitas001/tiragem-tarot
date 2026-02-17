import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { TAROT_CARDS } from '../tarotData';
import { getCardName } from '../tarotData';
import React, { useState, useEffect } from 'react';
import { UserMenu } from './UserMenu';
import { AuthModal } from './AuthModal';
import { PaywallModal } from './PaywallModal';
import { MinimalStarsBackground } from './MinimalStarsBackground';
import { getDailyCardSynthesis, DailyCardSynthesis } from '../services/geminiService';
import { WhatsAppShowcaseSection } from './WhatsAppShowcaseSection';
import { SEO } from './SEO';

// Header Component
import { useAuth } from '../contexts/AuthContext';
// ...existing code...
const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const { profile } = useAuth();
    const isAdmin = Boolean(profile?.is_admin);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const exploreRoute = isPortuguese ? '/arquivo-arcano' : '/arcane-archive';

    return (
        <>
            <header className="flex justify-center w-full bg-background-dark/95 backdrop-blur-md sticky top-0 z-40 border-b border-border-dark">
                <div className="flex w-full max-w-[1200px]">
                    <div className="flex items-center justify-between whitespace-nowrap w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:px-10 lg:py-4 gap-2">
                        <div className="flex items-center text-white cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Zaya Tarot</h2>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.home}
                            </button>
                            <button onClick={() => navigate(isPortuguese ? '/jogos-de-tarot' : '/spreads')} className="text-sm font-medium transition-colors text-gray-400 hover:text-white">
                                {t.nav.tarot}
                            </button>
                            <button onClick={() => navigate(isPortuguese ? '/carta-do-dia' : '/daily-card')} className={`text-sm font-medium transition-colors ${(isActive('/carta-do-dia') || isActive('/daily-card')) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {isPortuguese ? 'Carta do Dia' : 'Daily Card'}
                            </button>
                            <button onClick={() => navigate(isPortuguese ? '/tarot-por-signo' : '/tarot-by-sign')} className={`text-sm font-medium transition-colors ${(isActive('/tarot-por-signo') || isActive('/tarot-by-sign')) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {isPortuguese ? 'Tarot por Signo' : 'Tarot by Sign'}
                            </button>
                            <button onClick={() => navigate(isPortuguese ? '/interpretacao' : '/interpretation')} className={`text-sm font-medium transition-colors ${(isActive('/interpretacao') || isActive('/interpretation')) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {isPortuguese ? 'Interpretacao' : 'Interpretation'}
                            </button>
                            <button onClick={() => navigate(exploreRoute)} className={`text-sm font-medium transition-colors ${(isActive('/explore') || isActive(exploreRoute)) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.cardMeanings}
                            </button>
                            <button onClick={() => navigate('/history')} className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.history}
                            </button>
                            {isAdmin && (
                                <button onClick={() => navigate('/admin')} className={`text-sm font-medium transition-colors ${isActive('/admin') ? 'text-yellow-400' : 'text-yellow-500/70 hover:text-yellow-400'}`}>
                                    Admin
                                </button>
                            )}
                        </nav>

                        <div className="flex items-center gap-4 sm:gap-6">
                            <LanguageToggle />

                            <UserMenu onLoginClick={() => setShowAuthModal(true)} />

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined text-white text-xl sm:text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                </div>
            </header>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <nav className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-background-dark/98 backdrop-blur-xl border-l border-border-dark flex flex-col animate-slide-in-right">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
                            <span className="text-white font-bold text-base">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                                <span className="material-symbols-outlined text-gray-400 text-xl">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2 px-3">
                            {[
                                { icon: 'home', label: t.nav.home, path: '/', active: isActive('/') },
                                { icon: 'style', label: t.nav.tarot, path: isPortuguese ? '/jogos-de-tarot' : '/spreads', active: isActive(isPortuguese ? '/jogos-de-tarot' : '/spreads') },
                                { icon: 'today', label: isPortuguese ? 'Carta do Dia' : 'Daily Card', path: isPortuguese ? '/carta-do-dia' : '/daily-card', active: isActive('/carta-do-dia') || isActive('/daily-card') },
                                { icon: 'stars', label: isPortuguese ? 'Tarot por Signo' : 'Tarot by Sign', path: isPortuguese ? '/tarot-por-signo' : '/tarot-by-sign', active: isActive('/tarot-por-signo') || isActive('/tarot-by-sign') },
                                { icon: 'menu_book', label: isPortuguese ? 'Interpretacao' : 'Interpretation', path: isPortuguese ? '/interpretacao' : '/interpretation', active: isActive('/interpretacao') || isActive('/interpretation') },
                                { icon: 'auto_stories', label: t.nav.cardMeanings, path: exploreRoute, active: isActive('/explore') || isActive(exploreRoute) },
                                { icon: 'history', label: t.nav.history, path: '/history', active: isActive('/history') },
                            ].map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${item.active ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                            {isAdmin && (
                                <button
                                    onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-yellow-500/70 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                    Admin
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
};

// Footer Component
const Footer = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();

    const exploreRoute = isPortuguese ? '/arquivo-arcano' : '/arcane-archive';

    return (
        <footer className="flex justify-center w-full bg-[#0d090f] border-t border-border-dark py-12 mt-auto">
            <div className="flex flex-col w-full max-w-[1200px] px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 text-white mb-4">
                            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                            </div>
                            <span className="font-bold text-lg">Zaya Tarot</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">{t.footer.description}</p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">{t.footer.explore}</h4>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => navigate('/')} className="text-gray-400 text-sm hover:text-primary text-left transition-colors">{t.footer.readings}</button>
                            <button onClick={() => navigate(exploreRoute)} className="text-gray-400 text-sm hover:text-primary text-left transition-colors">{t.footer.cardLibrary}</button>
                            <button onClick={() => navigate('/history')} className="text-gray-400 text-sm hover:text-primary text-left transition-colors">{t.footer.history}</button>
                        </div>
                    </div>


                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">{t.footer.support}</h4>
                        <div className="flex flex-col gap-2">
                            <span className="text-gray-400 text-sm">{t.footer.help}</span>
                            <span className="text-gray-400 text-sm">{t.footer.contact}</span>
                            <span className="text-gray-400 text-sm">{t.footer.privacy}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border-dark pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-xs">© 2025 Zaya Tarot. {t.footer.copyright}</p>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-xs">Secure payments via</span>
                        <span className="text-green-500 font-bold text-sm">Mercado Pago</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export const DailyCard = () => {
    const { isPortuguese } = useLanguage();
    const navigate = useNavigate();
    const [showPaywall, setShowPaywall] = useState(false);
    const [aiSynthesis, setAiSynthesis] = useState<DailyCardSynthesis | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // CSS para orbitas planetarias - estaticas e estilos dos botoes
    const orbitStyles = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        @keyframes twinkle {
            0% { opacity: 0.15; }
            100% { opacity: 0.25; }
        }
        .mystic-bg {
            background-color: #1e0b2b;
            background-image: 
                radial-gradient(at 50% 0%, #2d1b4e 0%, transparent 70%),
                radial-gradient(at 50% 100%, #120a1a 0%, transparent 70%);
            position: relative;
        }
        .dot-grid {
            background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
            background-size: 30px 30px;
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
        }
        .stardust {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                radial-gradient(white 1px, transparent 1px),
                radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px);
            background-size: 100px 100px, 60px 60px;
            background-position: 0 0, 30px 30px;
            opacity: 0.2;
            animation: twinkle 5s infinite alternate;
        }
        .text-gradient-gold {
            background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .ring-absolute {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            pointer-events: none;
        }
        .ring-1 {
            width: 110%; height: 106%; border: 1px solid rgba(224, 192, 128, 0.3);
            box-shadow: 0 0 15px rgba(224, 192, 128, 0.2);
        }
        .ring-2 {
            width: 500px; height: 500px;
            border: 1px dashed rgba(224, 192, 128, 0.15);
            animation: spin-reverse 80s linear infinite;
        }
        .ring-3 {
            width: 650px; height: 650px;
            border: 1px solid rgba(255, 255, 255, 0.03);
            box-shadow: inset 0 0 30px rgba(123, 82, 171, 0.1);
        }
        .ring-4 {
            width: 380px; height: 380px;
            border: 1.2px solid rgba(224, 192, 128, 0.4);
            border-left-color: rgba(224, 192, 128, 0.8);
            border-right-color: rgba(224, 192, 128, 0.8);
            box-shadow: 0 0 20px rgba(224, 192, 128, 0.3), inset 0 0 15px rgba(224, 192, 128, 0.15);
            animation: spin-slow 40s linear infinite;
        }
        .ring-5 {
            width: 300px; height: 300px;
            border: 1px solid rgba(224, 192, 128, 0.35);
            border-top-color: rgba(224, 192, 128, 0.7);
            border-bottom-color: rgba(224, 192, 128, 0.7);
            box-shadow: 0 0 15px rgba(224, 192, 128, 0.25), inset 0 0 10px rgba(224, 192, 128, 0.1);
            animation: spin-reverse 30s linear infinite;
        }
        .ring-6 {
            width: 460px; height: 460px;
            border: 1px dashed rgba(224, 192, 128, 0.2);
            box-shadow: 0 0 25px rgba(224, 192, 128, 0.1);
            animation: spin-reverse 60s linear infinite;
        }
        @media (max-width: 768px) {
            .ring-4 {
                width: 320px; height: 320px;
            }
            .ring-5 {
                width: 250px; height: 250px;
            }
            .ring-6 {
                width: 380px; height: 380px;
            }
        }
        @media (max-width: 640px) {
            .ring-4 {
                width: 280px; height: 280px;
            }
            .ring-5 {
                width: 220px; height: 220px;
            }
            .ring-6 {
                width: 340px; height: 340px;
            }
        }
        .constellation-glow {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 800px; height: 800px;
            background: radial-gradient(circle, rgba(123, 82, 171, 0.15) 0%, rgba(94, 58, 138, 0.05) 40%, transparent 70%);
            z-index: 0;
            filter: blur(40px);
        }
        .card-float {
            animation: float 6s ease-in-out infinite;
        }
        .hero-cta-primary {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-cta-primary:hover {
            transform: translateY(-2px);
            background-color: rgba(135, 95, 175, 0.95);
        }
        .hero-cta-secondary {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-cta-secondary:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.2);
            background-color: rgba(255, 255, 255, 0.03);
        }
        .spin-slow {
            animation: spin 60s linear infinite;
        }
        .spin-reverse-slow {
            animation: spin-reverse 80s linear infinite;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .static-ring-container {
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            transform: translateY(-40px);
        }
        /* Chama Amarela Brilhante e Suave */
        .golden-flame {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            filter: blur(60px);
        }
        .flame-core {
            width: 280px; height: 400px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(ellipse at center bottom,
                rgba(255, 200, 50, 0.25) 0%,
                rgba(255, 180, 40, 0.15) 25%,
                rgba(255, 150, 30, 0.08) 50%,
                transparent 70%);
            animation: flame-flicker 3s ease-in-out infinite;
        }
        .flame-glow {
            width: 400px; height: 500px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(ellipse at center,
                rgba(255, 215, 0, 0.12) 0%,
                rgba(255, 180, 50, 0.06) 40%,
                transparent 70%);
            animation: flame-pulse 4s ease-in-out infinite;
        }
        .flame-outer {
            width: 500px; height: 600px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(ellipse at center,
                rgba(255, 200, 80, 0.05) 0%,
                rgba(255, 165, 0, 0.02) 50%,
                transparent 70%);
        }
        @keyframes flame-flicker {
            0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
            25% { opacity: 0.7; transform: translate(-50%, -51%) scale(1.02); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
            75% { opacity: 0.65; transform: translate(-50%, -49%) scale(1.01); }
        }
        @keyframes flame-pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.7; }
        }
        .card-breathing {
            animation: float-subtle 6s ease-in-out infinite;
        }
        @keyframes float-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        @media (max-width: 768px) {
            .flame-core {
                width: 200px; height: 300px;
            }
            .flame-glow {
                width: 300px; height: 380px;
            }
            .flame-outer {
                width: 380px; height: 450px;
            }
        }
    `;

    // Carta do dia coletiva - mesma para todos no dia
    const getDailyCard = () => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        const cardIndex = dayOfYear % TAROT_CARDS.length;
        return TAROT_CARDS[cardIndex];
    };

    const dailyCard = getDailyCard();
    const cardName = getCardName(dailyCard.id, isPortuguese);
    const meaning = isPortuguese ? dailyCard.meaning_up_pt : dailyCard.meaning_up;
    const keywords = isPortuguese ? dailyCard.keywords_pt : dailyCard.keywords;
    const advice = isPortuguese ? dailyCard.advice_pt : dailyCard.advice;
    const description = isPortuguese ? dailyCard.description_pt : dailyCard.description;
    const seoTitle = isPortuguese
        ? `Carta do Dia Tarot no WhatsApp: ${cardName}`
        : `Daily Tarot Card on WhatsApp: ${cardName}`;
    const seoDescription = isPortuguese
        ? `Receba sua carta do dia do Tarot no WhatsApp. Hoje: ${cardName}. Veja a interpretacao completa, mensagem coletiva, mantra diario e conselho espiritual.`
        : `Get your daily tarot card on WhatsApp. Today: ${cardName}. See the full interpretation, collective message, daily mantra and spiritual guidance.`;
    const seoPath = isPortuguese ? '/carta-do-dia' : '/daily-card';
    const seoStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seoTitle,
        description: seoDescription,
        url: `https://www.zayatarot.com${seoPath}`,
        inLanguage: isPortuguese ? 'pt-BR' : 'en'
    };
    const normalizedSynthesis = aiSynthesis ? {
        mensagem_coletiva: (aiSynthesis as any).mensagem_coletiva,
        vibracao_universal: (aiSynthesis as any).vibracao_universal ?? (aiSynthesis as any)['vibração_universal'],
        consciencia_coletiva: (aiSynthesis as any).consciencia_coletiva ?? (aiSynthesis as any)['consciência_coletiva'],
        movimento_planetario: (aiSynthesis as any).movimento_planetario ?? (aiSynthesis as any)['movimento_planetário'],
        energia_emocional: (aiSynthesis as any).energia_emocional,
        significado_carta: (aiSynthesis as any).significado_carta,
        mantra_diario: (aiSynthesis as any).mantra_diario ?? (aiSynthesis as any)['mantra_diário'],
        reflexao_coletiva: (aiSynthesis as any).reflexao_coletiva ?? (aiSynthesis as any)['reflexão_coletiva'],
    } : null;

    // Buscar sintese da IA automaticamente
    useEffect(() => {
        const fetchAISynthesis = async () => {
            setIsLoadingAI(true);
            try {
                const synthesis = await getDailyCardSynthesis(
                    { name: dailyCard.name, name_pt: dailyCard.name_pt, id: dailyCard.id },
                    isPortuguese
                );
                if (synthesis) {
                    setAiSynthesis(synthesis);
                }
            } catch (error) {
                console.error('Erro ao buscar sintese IA:', error);
            } finally {
                setIsLoadingAI(false);
            }
        };

        fetchAISynthesis();
    }, [dailyCard.id, isPortuguese]);

    // Definir modulos dinamicos
    const getDynamicModules = () => {
        if (!normalizedSynthesis) return [];

        return [
            {
                title: isPortuguese ? 'Consciencia Coletiva' : 'Collective Consciousness',
                content: normalizedSynthesis.consciencia_coletiva,
                color: 'purple',
                borderColor: 'border-purple-500/20',
                dotColor: 'bg-purple-500/30 border-purple-400/50',
                textColor: 'text-white',
                contentColor: 'text-purple-50'
            },
            {
                title: isPortuguese ? 'Energia Emocional' : 'Emotional Energy',
                content: normalizedSynthesis.energia_emocional,
                color: 'pink',
                borderColor: 'border-pink-500/20',
                dotColor: 'bg-pink-500/30 border-pink-400/50',
                textColor: 'text-white',
                contentColor: 'text-pink-50'
            },
            {
                title: isPortuguese ? 'Movimento Planetario' : 'Planetary Movement',
                content: normalizedSynthesis.movimento_planetario,
                color: 'cyan',
                borderColor: 'border-cyan-500/20',
                dotColor: 'bg-cyan-500/30 border-cyan-400/50',
                textColor: 'text-white',
                contentColor: 'text-cyan-50'
            }
        ];
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "https://placehold.co/300x520/1c1022/9311d4?text=Tarot";
        e.currentTarget.onerror = null;
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{
            backgroundColor: '#1a1628',
            backgroundAttachment: 'fixed'
        }}>
            <SEO
                title={seoTitle}
                description={seoDescription}
                path={seoPath}
                image={dailyCard.imageUrl}
                structuredData={seoStructuredData}
            />
            <style>{orbitStyles}</style>
            <MinimalStarsBackground />
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center relative py-8">
                <div className="dot-grid z-0"></div>
                <div className="stardust z-0"></div>
                <div className="constellation-glow z-0"></div>

                <div className="container mx-auto px-4 relative z-10 pb-24">
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start max-w-6xl mx-auto">

                        {/* Left Column - Title, Buttons */}
                        <div className="flex flex-col justify-center text-left lg:order-first order-first pt-8 lg:pt-32">
                            {/* Title Section */}
                            <div className="mb-6 relative">
                                <h1 className="font-serif text-5xl md:text-6xl font-medium tracking-wide text-gradient-gold drop-shadow-lg">
                                    {isPortuguese ? 'Carta do Dia' : 'Card of the Day'}
                                </h1>
                            </div>

                            {/* Description and Buttons */}
                            <div className="space-y-4 mb-8 z-20">
                                <div className="w-24 h-[1px] bg-gradient-to-r from-yellow-500/40 to-transparent my-3"></div>
                                <p className="text-gray-300 text-base font-light leading-relaxed max-w-lg">
                                    {meaning}
                                </p>
                            </div>

                            {/* Buttons Section */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button
                                    onClick={() => setShowPaywall(true)}
                                    className="group relative px-6 py-3 bg-purple-600 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(123,82,171,0.3)] transition-all hover:shadow-[0_0_30px_rgba(123,82,171,0.6)] hover:-translate-y-1 text-sm"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                                    <span className="relative z-10 text-white font-bold tracking-wide flex items-center justify-center gap-2">
                                        {isPortuguese ? 'Acesse o Arquivo Completo' : 'Access Full Archive'}
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')}
                                    className="group px-6 py-3 bg-transparent border border-yellow-500/40 rounded-lg transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:-translate-y-1 text-sm"
                                >
                                    <span className="text-yellow-300 font-medium tracking-wide flex items-center justify-center gap-2 group-hover:text-yellow-400">
                                        {isPortuguese ? 'Baralho de Tarot Completo' : 'Complete Tarot Deck'}
                                        <span className="material-symbols-outlined text-sm">style</span>
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Golden Halo Card Display */}
                        <div className="flex flex-col items-center justify-center lg:order-last order-last relative pt-28 pb-12 lg:pt-20 lg:pb-0">

                            {/* Golden Flame Background */}
                            <div className="static-ring-container">
                                <div className="golden-flame flame-outer"></div>
                                <div className="golden-flame flame-glow"></div>
                                <div className="golden-flame flame-core"></div>
                            </div>

                            {/* Main Card Container */}
                            <div className="relative z-10 group card-breathing">
                                <div className="relative md:w-[220px] md:h-[345px] w-[170px] h-[265px] transition-transform duration-500 group-hover:scale-[1.02]">

                                    {/* Gold Glow Behind */}
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700" />

                                    {/* Glass Border */}
                                    <div className="absolute -inset-[2px] bg-gradient-to-b from-yellow-500/40 via-purple-500/10 to-transparent rounded-2xl z-0" />

                                    {/* Card Image */}
                                    <img
                                        alt={cardName}
                                        className="w-full h-full object-cover rounded-2xl shadow-2xl relative z-10"
                                        src={dailyCard.imageUrl}
                                        onError={handleImageError}
                                    />

                                    {/* Premium Sheen */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/40 rounded-2xl z-20 pointer-events-none mix-blend-overlay" />
                                </div>
                            </div>

                            {/* Card Name Floating Below */}
                            <div className="mt-20 lg:mt-14 text-center relative z-20">
                                <h2 className="font-serif text-2xl md:text-4xl text-white tracking-widest drop-shadow-lg">
                                    {cardName}
                                </h2>
                                <div className="flex justify-center mt-3">
                                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/40 border border-yellow-500/30 backdrop-blur-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_10px_orange]"></div>
                                        <span className="text-xs md:text-sm font-medium text-yellow-100/90 uppercase tracking-[0.2em]">
                                            {dailyCard.arcana === 'major' ? (isPortuguese ? 'Arcano Maior' : 'Major Arcana') : (isPortuguese ? 'Arcano Menor' : 'Minor Arcana')}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Energias do Dia - Layout da Sintese */}
            <section className="relative py-8 md:py-12 px-4 md:px-6 lg:px-8">
                {/* Container Premium com background claro */}
                <div className="max-w-7xl mx-auto relative">
                    {/* Card container com glassmorphism premium */}
                    <div
                        className="relative rounded-3xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(60, 50, 80, 0.95) 0%, rgba(45, 38, 65, 0.98) 50%, rgba(55, 45, 75, 0.95) 100%)',
                            boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Borda dourada sutil no topo */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />

                        {/* Decoracao de cantos - topo esquerdo */}
                        <div className="absolute top-4 left-4 w-12 h-12 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
                            <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-yellow-500/50 to-transparent" />
                        </div>

                        {/* Decoracao de cantos - topo direito */}
                        <div className="absolute top-4 right-4 w-12 h-12 pointer-events-none">
                            <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-yellow-500/50 to-transparent" />
                            <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-yellow-500/50 to-transparent" />
                        </div>

                        {/* Decoracao de cantos - baixo esquerdo */}
                        <div className="absolute bottom-4 left-4 w-12 h-12 pointer-events-none">
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
                            <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-yellow-500/50 to-transparent" />
                        </div>

                        {/* Decoracao de cantos - baixo direito */}
                        <div className="absolute bottom-4 right-4 w-12 h-12 pointer-events-none">
                            <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-yellow-500/50 to-transparent" />
                            <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-yellow-500/50 to-transparent" />
                        </div>

                        {/* Glow sutil central */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(255, 215, 150, 0.06) 0%, transparent 70%)'
                            }}
                        />

                        {/* Conteudo com padding */}
                        <div className="relative z-10 px-6 md:px-8 lg:px-10 py-6 md:py-8">
                            {/* Section Title */}
                            <div className="text-center mb-6 md:mb-8">
                                <h2 className="text-white text-3xl md:text-4xl font-light mb-3" style={{ fontFamily: "'Crimson Text', serif", letterSpacing: '0.02em' }}>
                                    {isPortuguese ? 'Energias do Dia' : 'Daily Energies'}
                                </h2>
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto opacity-60" />
                            </div>

                            {/* AI Loading State */}
                            {isLoadingAI ? (
                                <div className="flex flex-col items-center justify-center gap-4 py-20">
                                    <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                                    <p className="text-gray-400 text-sm">{isPortuguese ? 'Consultando os astros...' : 'Consulting the stars...'}</p>
                                </div>
                            ) : (
                                <div className="space-y-8 lg:space-y-10 max-w-5xl mx-auto">
                                    {/* Hero Header: Texto a esquerda, Carta a direita */}
                                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                                        {/* Lado Esquerdo - Vibracao Universal e Mensagem */}
                                        <div className="flex-1 flex flex-col justify-center text-center lg:text-left space-y-6">
                                            {/* Vibracao Universal - Titulo Principal */}
                                            {normalizedSynthesis?.vibracao_universal && (
                                                <div>
                                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight" style={{
                                                        fontFamily: "'Crimson Text', serif",
                                                        background: 'linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        backgroundClip: 'text',
                                                    }}>
                                                        {normalizedSynthesis.vibracao_universal}
                                                    </h3>
                                                </div>
                                            )}

                                            {/* Divisor decorativo */}
                                            <div className="flex items-center justify-center lg:justify-start gap-3">
                                                <div className="w-12 h-px bg-gradient-to-r from-yellow-500/60 to-transparent"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                                                <div className="w-8 h-px bg-yellow-500/30"></div>
                                            </div>

                                            {/* Mensagem Coletiva - Subtexto */}
                                            <div className="max-w-2xl lg:max-w-none">
                                                {normalizedSynthesis?.mensagem_coletiva && normalizedSynthesis.mensagem_coletiva.includes('.') ? (
                                                    <p className="text-gray-200 text-lg md:text-xl lg:text-2xl leading-relaxed font-light" style={{
                                                        fontFamily: "'Crimson Text', serif"
                                                    }}>
                                                        {normalizedSynthesis.mensagem_coletiva.split(/\.\s+/).slice(1).join('. ').trim()}
                                                    </p>
                                                ) : (
                                                    <p className="text-gray-200 text-lg md:text-xl lg:text-2xl leading-relaxed font-light" style={{
                                                        fontFamily: "'Crimson Text', serif"
                                                    }}>
                                                        {`"${meaning}"`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Lado Direito - Carta em Miniatura */}
                                        <div className="flex-shrink-0 flex items-center justify-center">
                                            <div className="relative group">
                                                {/* Card container */}
                                                <div className="relative rounded-xl p-3">
                                                    <img
                                                        src={dailyCard.imageUrl}
                                                        alt={cardName}
                                                        onError={handleImageError}
                                                        className="w-32 h-52 md:w-40 md:h-64 object-cover rounded-lg border border-white/10 transition-transform duration-300 group-hover:scale-[1.02] shadow-lg"
                                                    />
                                                    <div className="mt-3 text-center">
                                                        <p className="text-white text-sm md:text-base font-medium" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                            {cardName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Separador mistico */}
                                    <div className="flex items-center justify-center gap-3 py-4">
                                        <div className="w-16 h-px bg-gradient-to-r from-transparent to-yellow-500/30"></div>
                                        <span className="material-symbols-outlined text-yellow-400/40 text-sm">auto_awesome</span>
                                        <div className="w-16 h-px bg-gradient-to-l from-transparent to-yellow-500/30"></div>
                                    </div>

                                    {/* Sobre a Carta - Significado */}
                                    {normalizedSynthesis?.significado_carta && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-symbols-outlined text-yellow-400 text-base">auto_awesome</span>
                                                <span className="text-white text-xs font-semibold uppercase tracking-wider">
                                                    {isPortuguese ? 'Sobre a Carta' : 'About the Card'}
                                                </span>
                                            </div>
                                            <p className="text-gray-200 text-sm leading-relaxed">
                                                {normalizedSynthesis.significado_carta}
                                            </p>
                                        </div>
                                    )}

                                    {/* Modulos - Lista Vertical */}
                                    {aiSynthesis && getDynamicModules().length > 0 && (
                                        <div className="space-y-4">
                                            {getDynamicModules().map((module, index) => (
                                                <div key={index} className={`relative pl-5 border-l-2 ${module.borderColor}`}>
                                                    <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full ${module.dotColor} border-2`}></div>
                                                    <span className={`${module.textColor} text-xs font-semibold uppercase tracking-wider`}>
                                                        {module.title}
                                                    </span>
                                                    <p className={`${module.contentColor} text-sm leading-relaxed mt-1 ${module.color === 'cyan' ? 'italic' : ''}`}>
                                                        {module.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}



                                    {/* Mantra Diario - Destaque Especial */}
                                    {normalizedSynthesis?.mantra_diario && (
                                        <div className="mt-10 text-center space-y-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-12 h-px bg-gradient-to-r from-transparent to-yellow-500/30"></div>
                                                <span className="material-symbols-outlined text-yellow-400/50 text-lg">self_improvement</span>
                                                <div className="w-12 h-px bg-gradient-to-l from-transparent to-yellow-500/30"></div>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-yellow-500/10 blur-xl rounded-2xl"></div>
                                                <div className="relative bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6">
                                                    <p className="text-yellow-100 text-2xl md:text-3xl font-medium leading-relaxed max-w-2xl mx-auto" style={{
                                                        fontFamily: "'Crimson Text', serif",
                                                        background: 'linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        backgroundClip: 'text',
                                                    }}>
                                                        "{normalizedSynthesis.mantra_diario}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reflexao Final - se houver IA */}
                                    {normalizedSynthesis?.reflexao_coletiva && (
                                        <div className="mt-10 text-center space-y-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-12 h-px bg-gradient-to-r from-transparent to-purple-500/30"></div>
                                                <span className="material-symbols-outlined text-purple-400/50 text-lg">psychology</span>
                                                <div className="w-12 h-px bg-gradient-to-l from-transparent to-purple-500/30"></div>
                                            </div>
                                            <p className="text-purple-100 text-xl md:text-2xl font-medium italic leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                {normalizedSynthesis.reflexao_coletiva}
                                            </p>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

                        {/* WhatsApp Daily Card Subscription Section */}
            <WhatsAppShowcaseSection
                isPortuguese={isPortuguese}
                showForm={true}
                onPrimaryAction={() => setShowPaywall(true)}
                className="bg-gradient-to-b from-background-dark via-purple-950/10 to-background-dark"
            />

            <Footer />
            {/* Modals */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="whatsapp"
                onLogin={() => {
                    setShowPaywall(false);
                    setShowAuthModal(true);
                }}
            />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};






