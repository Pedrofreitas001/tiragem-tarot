import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { TAROT_CARDS } from '../tarotData';
import { getCardName } from '../tarotData';
import { useState } from 'react';
import { UserMenu } from './UserMenu';
import { AuthModal } from './AuthModal';
import { PaywallModal } from './PaywallModal';

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
                        <div className="flex items-center gap-3 text-white cursor-pointer" onClick={() => navigate('/')}>
                            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-[22px] text-white">auto_awesome</span>
                            </div>
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight hidden sm:block">Mystic Tarot</h2>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.home}
                            </button>
                            <button onClick={() => { navigate('/'); setTimeout(() => document.getElementById('spreads')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-sm font-medium transition-colors text-gray-400 hover:text-white">
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
                            <button onClick={() => navigate('/shop')} className={`text-sm font-medium transition-colors ${isActive('/shop') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.shop}
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
                            <button onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.shop}</button>
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
                        <h4 className="text-white font-bold text-sm mb-4">{t.footer.shop}</h4>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => navigate('/shop')} className="text-gray-400 text-sm hover:text-primary text-left transition-colors">{t.footer.products}</button>
                            <button onClick={() => navigate('/shop')} className="text-gray-400 text-sm hover:text-primary text-left transition-colors">{t.footer.cart}</button>
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

    // CSS para órbitas planetárias - estáticas e estilos dos botões
    const orbitStyles = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
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

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{
            backgroundColor: '#1a1628',
            backgroundAttachment: 'fixed'
        }}>
            <style>{orbitStyles}</style>
            <Header />

            {/* Minimal Stars Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ willChange: 'transform' }}>
                <div className="absolute w-0.5 h-0.5 bg-white/40 rounded-full" style={{ top: '12%', left: '15%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/35 rounded-full" style={{ top: '8%', left: '68%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/45 rounded-full" style={{ top: '25%', left: '42%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/30 rounded-full" style={{ top: '35%', left: '82%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/38 rounded-full" style={{ top: '48%', left: '22%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/42 rounded-full" style={{ top: '62%', left: '58%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/32 rounded-full" style={{ top: '75%', left: '35%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/36 rounded-full" style={{ top: '88%', left: '72%' }} />
            </div>

            <main className="relative z-10 flex-1 w-full">
                {/* Hero Section - Two Column Layout */}
                <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16">
                    <div className="relative z-10 max-w-[1200px] mx-auto px-8 lg:px-12 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            {/* Left Column - Title, Subtitle, Date & Buttons */}
                            <div className="space-y-8 lg:pr-8">
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight text-white" style={{ fontFamily: "'Crimson Text', serif" }}>
                                    {isPortuguese ? 'Carta do Dia' : 'Card of the Day'}
                                </h1>

                                <p className="text-base md:text-lg text-gray-400 font-light leading-relaxed max-w-xl" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
                                    {isPortuguese
                                        ? 'Uma tiragem diária para toda a comunidade com vibrações energéticas positivas.'
                                        : 'A daily reading for the entire community with positive energetic vibrations.'}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => setShowPaywall(true)}
                                        className="hero-cta-primary px-8 py-4 bg-[#875faf] text-white text-sm font-medium tracking-wide rounded-sm"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    >
                                        {isPortuguese ? 'Acesse o Arquivo Completo' : 'Access Full Archive'}
                                    </button>
                                    <button
                                        onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')}
                                        className="hero-cta-secondary px-8 py-4 bg-transparent border border-white/10 text-gray-300 text-sm font-light tracking-wide rounded-sm"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    >
                                        {isPortuguese ? 'Baralho de Tarot Completo' : 'Complete Tarot Deck'}
                                    </button>
                                </div>
                            </div>

                            {/* Right Column - Card with Orbit Circles Behind and Info Below */}
                            <div className="flex flex-col items-center justify-center lg:justify-center gap-6 mt-12">
                                {/* Planetary orbit element container */}
                                <div className="relative w-56 aspect-[2/3]">
                                    {/* Mystical symbol on top - OUTSIDE the card */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10">
                                        <span className="material-symbols-outlined text-white/70 text-2xl">auto_awesome</span>
                                    </div>

                                    {/* Orbit circles - STATIC behind the card */}
                                    <div className="absolute inset-0 -z-10 flex items-center justify-center">
                                        {/* Outer orbit circle */}
                                        <div
                                            className="absolute rounded-full border border-dashed"
                                            style={{
                                                width: '140%',
                                                height: '180%',
                                                borderColor: 'rgba(167, 127, 212, 0.25)',
                                                borderWidth: '1.5px',
                                            }}
                                        />
                                        {/* Middle orbit circle */}
                                        <div
                                            className="absolute rounded-full border border-dotted"
                                            style={{
                                                width: '115%',
                                                height: '150%',
                                                borderColor: 'rgba(139, 92, 246, 0.2)',
                                                borderWidth: '1px',
                                            }}
                                        />
                                        {/* Inner orbit circle */}
                                        <div
                                            className="absolute rounded-full border border-dashed"
                                            style={{
                                                width: '90%',
                                                height: '120%',
                                                borderColor: 'rgba(167, 127, 212, 0.18)',
                                                borderWidth: '1px',
                                            }}
                                        />
                                        {/* Center decorative circle */}
                                        <div
                                            className="absolute rounded-full border border-dotted"
                                            style={{
                                                width: '60%',
                                                height: '90%',
                                                borderColor: 'rgba(124, 58, 237, 0.12)',
                                                borderWidth: '0.75px',
                                            }}
                                        />
                                    </div>

                                    {/* Card container */}
                                    <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl shadow-purple-900/30 transition-transform duration-300">
                                        <div className="absolute inset-0 bg-primary/15 blur-[80px] -z-10 scale-110" />
                                        <img
                                            src={dailyCard.imageUrl}
                                            alt={cardName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="text-center space-y-3">
                                    <h2 className="text-white text-xl md:text-2xl font-semibold" style={{ fontFamily: "'Crimson Text', serif" }}>{cardName}</h2>
                                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-xs font-medium uppercase tracking-wider" style={{ color: '#d8b4fe' }}>
                                        {dailyCard.arcana === 'major' ? (isPortuguese ? 'Arcano Maior' : 'Major Arcana') : (isPortuguese ? 'Arcano Menor' : 'Minor Arcana')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Energias do Dia - Clean & Professional */}
                <section className="relative py-20 md:py-28 px-4 md:px-8 bg-[#0d0812] border-y border-white/5">
                    <div className="max-w-6xl mx-auto">
                        {/* Section Title */}
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-white text-3xl md:text-4xl font-light mb-3" style={{ fontFamily: "'Crimson Text', serif", letterSpacing: '0.02em' }}>
                                {isPortuguese ? 'Energias do Dia' : 'Daily Energies'}
                            </h2>
                            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-60" />
                        </div>

                        {/* Meaning Quote */}
                        <div className="mb-20 md:mb-28 text-center px-4">
                            <p className="text-gray-100 text-2xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
                                "{meaning}"
                            </p>
                        </div>

                        {/* Three Columns - Sophisticated Layout */}
                        <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto md:grid-rows-1">
                            {/* Palavras-Chave */}
                            <div className="relative h-full">
                                <div className="relative h-full bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary text-[20px]">stars</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                                {isPortuguese ? 'Palavras-Chave' : 'Keywords'}
                                            </h3>
                                            <div className="w-8 h-px bg-gradient-to-r from-primary/40 to-transparent mt-2" />
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        {keywords.slice(0, 5).map((keyword, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                                                <span className="text-gray-300 text-sm font-light leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {keyword}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reflexão */}
                            <div className="relative h-full">
                                <div className="relative h-full bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                                {isPortuguese ? 'Reflexão' : 'Reflection'}
                                            </h3>
                                            <div className="w-8 h-px bg-gradient-to-r from-primary/40 to-transparent mt-2" />
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-loose font-light flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* Orientação */}
                            <div className="relative h-full">
                                <div className="relative h-full bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                                {isPortuguese ? 'Orientação' : 'Guidance'}
                                            </h3>
                                            <div className="w-8 h-px bg-gradient-to-r from-primary/40 to-transparent mt-2" />
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-loose font-light flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {advice}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WhatsApp Form Section */}
                <section className="relative py-20 md:py-28 px-4 md:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-[#1a1230]/50 to-[#12091a]/50 backdrop-blur-sm border border-white/10 rounded-2xl p-10 md:p-14">
                            <div className="text-center mb-12">
                                <h2 className="text-white text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>
                                    {isPortuguese ? 'Receba sua Carta do Dia' : 'Receive Your Daily Card'}
                                </h2>
                                <p className="text-gray-400 text-base font-light leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {isPortuguese
                                        ? 'Receba mensagens diárias, orientações semanais e insights mensais sobre sua jornada.'
                                        : 'Receive daily messages, weekly guidance, and monthly insights about your journey.'}
                                </p>
                            </div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {isPortuguese ? 'Nome Completo' : 'Full Name'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={isPortuguese ? 'Digite seu nome' : 'Enter your name'}
                                            className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm font-light placeholder-gray-500 focus:border-primary/50 focus:bg-black/40 focus:outline-none transition-all"
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {isPortuguese ? 'E-mail' : 'Email'}
                                        </label>
                                        <input
                                            type="email"
                                            placeholder={isPortuguese ? 'seu@email.com' : 'your@email.com'}
                                            className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm font-light placeholder-gray-500 focus:border-primary/50 focus:bg-black/40 focus:outline-none transition-all"
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {isPortuguese ? 'WhatsApp' : 'WhatsApp'}
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder={isPortuguese ? '+55 (00) 00000-0000' : '+1 (000) 000-0000'}
                                            className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm font-light placeholder-gray-500 focus:border-primary/50 focus:bg-black/40 focus:outline-none transition-all"
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {isPortuguese ? 'País' : 'Country'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={isPortuguese ? 'Digite seu país' : 'Enter your country'}
                                            className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm font-light placeholder-gray-500 focus:border-primary/50 focus:bg-black/40 focus:outline-none transition-all"
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {isPortuguese ? 'Cidade' : 'City'}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={isPortuguese ? 'Digite sua cidade' : 'Enter your city'}
                                        className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm font-light placeholder-gray-500 focus:border-primary/50 focus:bg-black/40 focus:outline-none transition-all"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {isPortuguese ? 'Frequência de Recebimento' : 'Delivery Frequency'}
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <label className="relative flex items-center justify-center px-5 py-4 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-black/30 transition-all group">
                                            <input type="radio" name="frequency" value="daily" className="peer sr-only" defaultChecked />
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-400 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-sm font-light text-gray-400 peer-checked:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {isPortuguese ? 'Diário' : 'Daily'}
                                                </span>
                                            </div>
                                        </label>

                                        <label className="relative flex items-center justify-center px-5 py-4 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-black/30 transition-all group">
                                            <input type="radio" name="frequency" value="weekly" className="peer sr-only" />
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-400 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-sm font-light text-gray-400 peer-checked:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {isPortuguese ? 'Semanal' : 'Weekly'}
                                                </span>
                                            </div>
                                        </label>

                                        <label className="relative flex items-center justify-center px-5 py-4 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-black/30 transition-all group">
                                            <input type="radio" name="frequency" value="monthly" className="peer sr-only" />
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-400 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-sm font-light text-gray-400 peer-checked:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {isPortuguese ? 'Mensal' : 'Monthly'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-14 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9a6ec4] hover:to-[#b88de0] text-white font-medium text-base rounded-lg transition-all shadow-lg hover:shadow-primary/30 mt-8"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    {isPortuguese ? 'Começar a Receber' : 'Start Receiving'}
                                </button>

                                <p className="text-center text-gray-500 text-xs mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {isPortuguese ? 'Seus dados estão seguros e protegidos.' : 'Your data is safe and protected.'}
                                </p>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature="readings" />
        </div>
    );
};
