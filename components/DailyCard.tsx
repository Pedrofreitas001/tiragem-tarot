import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { TAROT_CARDS } from '../tarotData';
import { getCardName } from '../tarotData';
import React, { useState, useEffect } from 'react';
import { UserMenu } from './UserMenu';
import { AuthModal } from './AuthModal';
import { PaywallModal } from './PaywallModal';
import { MinimalStarsBackground } from './MinimalStarsBackground';
import { getDailyCardSynthesis, DailyCardSynthesis } from '../services/geminiService';

// Header Component
const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const { toggleCart, getItemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const isActive = (path: string) => location.pathname === path;
    const itemCount = getItemCount();

    const exploreRoute = isPortuguese ? '/arquivo-arcano' : '/arcane-archive';

    return (
        <>
            <header className="flex justify-center w-full bg-background-dark/95 backdrop-blur-md sticky top-0 z-40 border-b border-border-dark">
                <div className="flex flex-col w-full max-w-[1200px]">
                    <div className="flex items-center justify-between whitespace-nowrap px-4 py-3 lg:px-10 lg:py-4">
                        <div className="flex items-center text-white cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Mystic Tarot</h2>
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
                            <button onClick={() => navigate(exploreRoute)} className={`text-sm font-medium transition-colors ${(isActive('/explore') || isActive(exploreRoute)) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.cardMeanings}
                            </button>
                            <button onClick={() => navigate('/history')} className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.history}
                            </button>
                        </nav>

                        <div className="flex items-center gap-3">
                            <LanguageToggle />

                            <button
                                onClick={() => toggleCart(true)}
                                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-300 hover:text-white">shopping_bag</span>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </button>

                            <UserMenu onLoginClick={() => setShowAuthModal(true)} />

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined text-white">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden border-t border-border-dark p-4 space-y-2 animate-fade-in">
                            <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.home}</button>
                            <button onClick={() => { navigate('/'); setMobileMenuOpen(false); setTimeout(() => document.getElementById('spreads')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.tarot}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/carta-do-dia' : '/daily-card'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{isPortuguese ? 'Carta do Dia' : 'Daily Card'}</button>
                            <button onClick={() => { navigate(exploreRoute); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.cardMeanings}</button>
                            <button onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.history}</button>
                        </nav>
                    )}
                </div>
            </header>
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
                            <span className="font-bold text-lg">Mystic Tarot</span>
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
                    <p className="text-gray-600 text-xs">© 2025 Mystic Tarot. {t.footer.copyright}</p>
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
    const [showAuthModal, setShowAuthModal] = useState(false); // Add this line
    // CSS para órbitas planetárias - estáticas e estilos dos botões
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
            /* overflow: hidden; Removed to prevent clipping */
            pointer-events: none;
            transform: translateY(-40px);
        }
        .static-gold-circle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
        }
        /* Circle 1: Large centralized, thin elegant border */
        .gold-c-1 {
            width: 450px; height: 450px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(255, 215, 0, 0.2);
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.1);
        }
        /* Circle 5: Very large, faint outer rim */
        .gold-c-5 {
            width: 500px; height: 500px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            border: 1px dashed rgba(255, 215, 0, 0.15);
        }
        .card-breathing {
            animation: float-subtle 6s ease-in-out infinite;
        }
        @keyframes float-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        @media (max-width: 768px) {
            .gold-c-1 {
                width: 320px; height: 320px;
            }
            .gold-c-5 {
                width: 380px; height: 380px;
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

    // Buscar síntese da IA automaticamente
    useEffect(() => {
        const fetchAISynthesis = async () => {
            setIsLoadingAI(true);
            try {
                const synthesis = await getDailyCardSynthesis(
                    { name: dailyCard.name, id: dailyCard.id },
                    isPortuguese
                );
                if (synthesis) {
                    setAiSynthesis(synthesis);
                }
            } catch (error) {
                console.error('Erro ao buscar síntese IA:', error);
            } finally {
                setIsLoadingAI(false);
            }
        };

        fetchAISynthesis();
    }, [dailyCard.id, isPortuguese]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "https://placehold.co/300x520/1c1022/9311d4?text=Tarot";
        e.currentTarget.onerror = null;
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{
            backgroundColor: '#1a1628',
            backgroundAttachment: 'fixed'
        }}>
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

                            {/* Static Golden Circles Background */}
                            <div className="static-ring-container">
                                <div className="static-gold-circle gold-c-1"></div>
                                <div className="static-gold-circle gold-c-5"></div>
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

            {/* Energias do Dia - Clean & Professional */}
            <section className="relative py-20 md:py-28 px-4 md:px-8 bg-[#0d0812] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    {/* Section Title */}
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-white text-3xl md:text-4xl font-light mb-3" style={{ fontFamily: "'Crimson Text', serif", letterSpacing: '0.02em' }}>
                            {isPortuguese ? 'Energias do Dia' : 'Daily Energies'}
                        </h2>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto opacity-60" />
                    </div>

                    {/* AI Message or Static Meaning */}
                    <div className="mb-20 md:mb-28 text-center px-4">
                        {isLoadingAI ? (
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm">{isPortuguese ? 'Consultando os astros...' : 'Consulting the stars...'}</p>
                            </div>
                        ) : aiSynthesis ? (
                            <div className="space-y-6">
                                <p className="text-gray-100 text-2xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
                                    "{aiSynthesis.mensagem}"
                                </p>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                        <span className="text-yellow-400 text-sm font-medium">{aiSynthesis.energia}</span>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-100 text-2xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
                                "{meaning}"
                            </p>
                        )}
                    </div>

                    {/* Three Columns - Sophisticated Layout */}
                    <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto md:grid-rows-1">
                        {/* Palavras-Chave */}
                        <div className="relative h-full">
                            <div className="relative h-full bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/10 flex-shrink-0">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">stars</span>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Palavras-Chave' : 'Keywords'}
                                        </h3>
                                        <div className="w-8 h-px bg-gradient-to-r from-yellow-500/40 to-transparent mt-2" />
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1">
                                    {keywords.slice(0, 5).map((keyword, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm font-light leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {keyword}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Foco do Dia (IA) ou Reflexão (estático) */}
                        <div className="relative h-full">
                            <div className="relative h-full bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/10 flex-shrink-0">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">psychology</span>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {aiSynthesis ? (isPortuguese ? 'Foco do Dia' : 'Focus Today') : (isPortuguese ? 'Reflexão' : 'Reflection')}
                                        </h3>
                                        <div className="w-8 h-px bg-gradient-to-r from-yellow-500/40 to-transparent mt-2" />
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-loose font-light flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {aiSynthesis ? aiSynthesis.foco : description}
                                </p>
                            </div>
                        </div>

                        {/* Reflexão (IA) ou Orientação (estático) */}
                        <div className="relative h-full">
                            <div className="relative h-full bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/10 flex-shrink-0">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">explore</span>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {aiSynthesis ? (isPortuguese ? 'Pergunta Reflexiva' : 'Reflective Question') : (isPortuguese ? 'Orientação' : 'Guidance')}
                                        </h3>
                                        <div className="w-8 h-px bg-gradient-to-r from-yellow-500/40 to-transparent mt-2" />
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-loose font-light flex-1 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {aiSynthesis ? aiSynthesis.reflexao : advice}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* WhatsApp Form Section - Daily Destiny */}
            <section className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-[#0d0812] via-purple-950/10 to-[#0d0812]">
                <style>{`
                    .glass-card {
                        background: rgba(255, 255, 255, 0.04);
                        backdrop-filter: blur(24px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .glow-border:focus-within {
                        border-color: #A855F7;
                        box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
                    }
                    .frequency-card input:checked + div {
                        border-color: #A855F7;
                        background: rgba(168, 85, 247, 0.15);
                        box-shadow: 0 0 25px rgba(168, 85, 247, 0.25);
                    }
                    .cosmic-glow {
                        filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.7));
                    }
                `}</style>

                <div className="max-w-6xl mx-auto">
                    {/* Feature Presentation Header */}
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4 tracking-tight" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {isPortuguese ? 'Receba sua Carta do Dia' : 'Receive Your Daily Card'}
                        </h2>
                        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10">
                            {isPortuguese
                                ? 'Comece cada dia com orientação espiritual personalizada diretamente no seu WhatsApp.'
                                : 'Start each day with personalized spiritual guidance directly on your WhatsApp.'}
                        </p>

                        {/* Feature Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-12">
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-yellow-500/20 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-yellow-500 text-xl">auto_awesome</span>
                                </div>
                                <h3 className="text-white font-semibold text-sm mb-1">{isPortuguese ? 'Interpretação Diária' : 'Daily Interpretation'}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{isPortuguese ? 'Mensagem única para seu dia' : 'Unique message for your day'}</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/10 flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                                </div>
                                <h3 className="text-white font-semibold text-sm mb-1">{isPortuguese ? 'Horário Personalizado' : 'Custom Schedule'}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{isPortuguese ? 'Escolha manhã, tarde ou noite' : 'Choose morning, afternoon or night'}</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-emerald-500 text-xl">smartphone</span>
                                </div>
                                <h3 className="text-white font-semibold text-sm mb-1">{isPortuguese ? '100% Gratuito' : '100% Free'}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{isPortuguese ? 'Sem custos, cancele quando quiser' : 'No costs, cancel anytime'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="glass-card w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] relative flex flex-col lg:flex-row items-stretch">
                        {/* Form Content */}
                        <div className="flex-1 p-6 lg:p-14 order-2 lg:order-1">
                            <header className="mb-8 text-center lg:text-left">
                                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-[10px] mb-4 tracking-[0.2em] uppercase border border-primary/30 backdrop-blur-md">
                                    {isPortuguese ? 'Conexão Celestial' : 'Celestial Connection'}
                                </span>
                                <h1 className="font-display text-3xl md:text-5xl text-white mb-6 leading-tight">
                                    {isPortuguese ? 'Desperte seu' : 'Awaken Your'} <br />
                                    <span className="text-primary cosmic-glow italic">{isPortuguese ? 'Destino Diário' : 'Daily Destiny'}</span>
                                </h1>
                                <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    {isPortuguese
                                        ? 'Receba orientações ancestrais e insights poderosos diretamente no seu WhatsApp através de um mapa estelar personalizado.'
                                        : 'Receive ancestral guidance and powerful insights directly on your WhatsApp through a personalized star map.'}
                                </p>
                            </header>

                            <form action="#" className="space-y-8">
                                {/* Name and Phone Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-widest">
                                            {isPortuguese ? 'Nome Completo' : 'Full Name'}
                                        </label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">person</span>
                                            <input
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-0 focus:outline-none glow-border transition-all text-white placeholder:text-gray-600"
                                                placeholder={isPortuguese ? 'Seu nome místico' : 'Your mystical name'}
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-widest">WhatsApp</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 border-r border-white/10 pr-2">
                                                <img alt="Brasil Flag" className="w-5 h-auto rounded-sm opacity-80" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/32px-Flag_of_Brazil.svg.png" />
                                            </div>
                                            <input
                                                className="w-full pl-16 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-0 focus:outline-none glow-border transition-all text-white placeholder:text-gray-600"
                                                placeholder="+55 (00) 00000-0000"
                                                type="tel"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* State Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-widest">
                                        {isPortuguese ? 'Estado' : 'State'}
                                    </label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">location_on</span>
                                        <select
                                            className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-0 focus:outline-none glow-border transition-all text-white appearance-none cursor-pointer"
                                            style={{ backgroundImage: 'none' }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled className="bg-[#1a1628] text-gray-400">
                                                {isPortuguese ? 'Selecione seu estado' : 'Select your state'}
                                            </option>
                                            <option value="AC" className="bg-[#1a1628]">Acre (AC)</option>
                                            <option value="AL" className="bg-[#1a1628]">Alagoas (AL)</option>
                                            <option value="AP" className="bg-[#1a1628]">Amapá (AP)</option>
                                            <option value="AM" className="bg-[#1a1628]">Amazonas (AM)</option>
                                            <option value="BA" className="bg-[#1a1628]">Bahia (BA)</option>
                                            <option value="CE" className="bg-[#1a1628]">Ceará (CE)</option>
                                            <option value="DF" className="bg-[#1a1628]">Distrito Federal (DF)</option>
                                            <option value="ES" className="bg-[#1a1628]">Espírito Santo (ES)</option>
                                            <option value="GO" className="bg-[#1a1628]">Goiás (GO)</option>
                                            <option value="MA" className="bg-[#1a1628]">Maranhão (MA)</option>
                                            <option value="MT" className="bg-[#1a1628]">Mato Grosso (MT)</option>
                                            <option value="MS" className="bg-[#1a1628]">Mato Grosso do Sul (MS)</option>
                                            <option value="MG" className="bg-[#1a1628]">Minas Gerais (MG)</option>
                                            <option value="PA" className="bg-[#1a1628]">Pará (PA)</option>
                                            <option value="PB" className="bg-[#1a1628]">Paraíba (PB)</option>
                                            <option value="PR" className="bg-[#1a1628]">Paraná (PR)</option>
                                            <option value="PE" className="bg-[#1a1628]">Pernambuco (PE)</option>
                                            <option value="PI" className="bg-[#1a1628]">Piauí (PI)</option>
                                            <option value="RJ" className="bg-[#1a1628]">Rio de Janeiro (RJ)</option>
                                            <option value="RN" className="bg-[#1a1628]">Rio Grande do Norte (RN)</option>
                                            <option value="RS" className="bg-[#1a1628]">Rio Grande do Sul (RS)</option>
                                            <option value="RO" className="bg-[#1a1628]">Rondônia (RO)</option>
                                            <option value="RR" className="bg-[#1a1628]">Roraima (RR)</option>
                                            <option value="SC" className="bg-[#1a1628]">Santa Catarina (SC)</option>
                                            <option value="SP" className="bg-[#1a1628]">São Paulo (SP)</option>
                                            <option value="SE" className="bg-[#1a1628]">Sergipe (SE)</option>
                                            <option value="TO" className="bg-[#1a1628]">Tocantins (TO)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                {/* Frequency Buttons - Smaller */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-widest">
                                        {isPortuguese ? 'Melhor Período' : 'Best Period'}
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <label className="frequency-card cursor-pointer group">
                                            <input defaultChecked className="hidden" name="freq" type="radio" value="manha" />
                                            <div className="glass-card flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                <span className="material-symbols-outlined text-2xl mb-1.5 text-yellow-500 group-hover:scale-110 transition-transform">sunny</span>
                                                <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">
                                                    {isPortuguese ? 'Manhã' : 'Morning'}
                                                </span>
                                            </div>
                                        </label>
                                        <label className="frequency-card cursor-pointer group">
                                            <input className="hidden" name="freq" type="radio" value="tarde" />
                                            <div className="glass-card flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                <span className="material-symbols-outlined text-2xl mb-1.5 text-primary group-hover:scale-110 transition-transform">routine</span>
                                                <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">
                                                    {isPortuguese ? 'Tarde' : 'Afternoon'}
                                                </span>
                                            </div>
                                        </label>
                                        <label className="frequency-card cursor-pointer group">
                                            <input className="hidden" name="freq" type="radio" value="noite" />
                                            <div className="glass-card flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                <span className="material-symbols-outlined text-2xl mb-1.5 text-blue-400 group-hover:scale-110 transition-transform">nightlight</span>
                                                <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">
                                                    {isPortuguese ? 'Noite' : 'Night'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Consent Checkbox */}
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex-shrink-0 mt-0.5">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                required
                                            />
                                            <div className="w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center group-hover:border-primary/50">
                                                <span className="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontSize: '14px' }}>check</span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                            {isPortuguese
                                                ? 'Concordo em receber mensagens de orientação mística e cartas do dia via WhatsApp. Posso cancelar a qualquer momento.'
                                                : 'I agree to receive mystic guidance messages and daily cards via WhatsApp. I can unsubscribe at any time.'}
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                                    <button
                                        className="w-full sm:w-auto flex-1 relative group overflow-hidden bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all active:scale-[0.98]"
                                        type="submit"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                                            {isPortuguese ? 'Começar a Receber' : 'Start Receiving'}
                                            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </button>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-[0.2em] px-4">
                                        <span className="material-symbols-outlined text-[16px]">lock</span>
                                        <p>{isPortuguese ? 'Dados protegidos' : 'Protected data'}</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* iPhone Mockup - WhatsApp Style */}
                        <div className="lg:w-[380px] bg-white/[0.02] border-l border-white/5 flex items-center justify-center p-6 lg:p-10 order-1 lg:order-2 relative overflow-hidden">
                            <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                            <div className="relative z-10">
                                {/* iPhone Frame */}
                                <div className="relative w-[220px] h-[460px] bg-black rounded-[2.5rem] p-[8px] shadow-[0_0_50px_rgba(168,85,247,0.25),0_20px_40px_rgba(0,0,0,0.5)]">
                                    {/* Dynamic Island */}
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30"></div>

                                    {/* Screen */}
                                    <div className="w-full h-full rounded-[2rem] overflow-hidden bg-[#0b141a] flex flex-col">
                                        {/* Status Bar */}
                                        <div className="h-6 bg-[#0b141a] flex items-center justify-between px-4 pt-1 flex-shrink-0">
                                            <span className="text-white text-[9px] font-semibold">9:41</span>
                                            <div className="flex items-center gap-[3px]">
                                                <svg className="w-[12px] h-[9px] text-white" viewBox="0 0 18 12" fill="currentColor">
                                                    <rect x="0" y="8" width="3" height="4" rx="0.5" />
                                                    <rect x="4" y="5" width="3" height="7" rx="0.5" />
                                                    <rect x="8" y="2" width="3" height="10" rx="0.5" />
                                                    <rect x="12" y="0" width="3" height="12" rx="0.5" />
                                                </svg>
                                                <div className="flex items-center">
                                                    <div className="w-[20px] h-[9px] border border-white rounded-[2px] flex items-center p-[1px]">
                                                        <div className="w-[14px] h-[5px] bg-white rounded-[1px]"></div>
                                                    </div>
                                                    <div className="w-[1px] h-[3px] bg-white rounded-r ml-[1px]"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* WhatsApp Header */}
                                        <div className="bg-[#1f2c34] px-2 py-1 flex items-center gap-1 flex-shrink-0">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-[10px]">auto_awesome</span>
                                            </div>
                                            <div className="flex-1 ml-1">
                                                <h4 className="text-white text-[10px] font-medium leading-tight">Mystic Tarot</h4>
                                                <p className="text-emerald-400 text-[8px]">online</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17 12c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm3 7h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2zM18 6c0-1.1-.9-2-2-2H8C5.79 4 4 5.79 4 8v10c0 1.1.9 2 2 2h5c0-.73.1-1.43.28-2.1-.34.06-.69.1-1.05.1-2.79 0-5.06-2.27-5.06-5.06 0-1.51.66-2.86 1.71-3.78L12 3.97l5.12 5.19c.5.44.88 1 1.09 1.62.55-.5 1.17-.91 1.85-1.22C20.02 8.42 20 7.22 20 6h-2z" />
                                                </svg>
                                                <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Chat Background Pattern - flex-1 to fill remaining space */}
                                        <div className="flex-1 relative" style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                            backgroundColor: '#0b141a'
                                        }}>
                                            <div className="absolute inset-0 p-2 overflow-hidden">
                                                {/* Message Bubble */}
                                                <div className="max-w-[95%] bg-[#1f2c34] rounded-lg rounded-tl-none shadow-lg">
                                                    {/* Card Image */}
                                                    <div className="p-1">
                                                        <div className="relative rounded-md overflow-hidden">
                                                            <img
                                                                alt={cardName}
                                                                className="w-full h-36 object-cover object-top"
                                                                src={dailyCard.imageUrl}
                                                                onError={handleImageError}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Message Text */}
                                                    <div className="px-1.5 pb-1 pt-0.5">
                                                        <p className="text-white/90 text-[9px] leading-relaxed font-normal">
                                                            <span className="font-semibold text-yellow-400">{cardName}</span>
                                                            <br /><br />
                                                            {isPortuguese
                                                                ? 'Bom dia! Sua carta de hoje traz uma mensagem especial sobre novos caminhos.'
                                                                : 'Good morning! Your card today brings a special message about new paths.'}
                                                        </p>
                                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                                            <span className="text-[7px] text-gray-400">08:00</span>
                                                            <svg className="w-3 h-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Input Bar - at very bottom */}
                                        <div className="bg-[#1f2c34] px-2 py-2 flex items-center gap-1.5 flex-shrink-0">
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                            </svg>
                                            <div className="flex-1 bg-[#2a3942] rounded-full h-7 px-2 flex items-center">
                                                <span className="text-gray-500 text-[10px]">
                                                    {isPortuguese ? 'Mensagem' : 'Message'}
                                                </span>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Home Indicator */}
                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full"></div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-8 right-8 text-primary/20 hidden lg:block">
                                <span className="material-symbols-outlined text-5xl">stars</span>
                            </div>
                            <div className="absolute bottom-8 left-8 text-yellow-500/20 hidden lg:block">
                                <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            {/* Modals */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="archive"
                onLogin={() => {
                    setShowPaywall(false);
                    setShowAuthModal(true);
                }}
            />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};
