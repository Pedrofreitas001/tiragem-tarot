import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { TAROT_CARDS } from '../tarotData';
import { getCardName } from '../tarotData';
import { useState } from 'react';
import { UserMenu } from './UserMenu';
import { AuthModal } from './AuthModal';
import { PaywallModal } from './PaywallModal';
import { MinimalStarsBackground } from './MinimalStarsBackground';

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
            width: 440px; height: 440px;
            border: 1.2px solid rgba(224, 192, 128, 0.4);
            border-left-color: rgba(224, 192, 128, 0.8);
            border-right-color: rgba(224, 192, 128, 0.8);
            box-shadow: 0 0 20px rgba(224, 192, 128, 0.3), inset 0 0 15px rgba(224, 192, 128, 0.15);
            animation: spin-slow 40s linear infinite;
        }
        .ring-5 {
            width: 320px; height: 320px;
            border: 1px solid rgba(224, 192, 128, 0.35);
            border-top-color: rgba(224, 192, 128, 0.7);
            border-bottom-color: rgba(224, 192, 128, 0.7);
            box-shadow: 0 0 15px rgba(224, 192, 128, 0.25), inset 0 0 10px rgba(224, 192, 128, 0.1);
            animation: spin-reverse 30s linear infinite;
        }
        @media (max-width: 768px) {
            .ring-4 {
                width: 360px; height: 360px;
            }
            .ring-5 {
                width: 260px; height: 260px;
            }
        }
        @media (max-width: 640px) {
            .ring-4 {
                width: 330px; height: 330px;
            }
            .ring-5 {
                width: 240px; height: 240px;
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

            <main className="flex-grow flex flex-col items-center justify-center relative py-8 overflow-hidden">
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

                        {/* Right Column - Card Display + Info Below */}
                        <div className="flex flex-col items-center lg:order-last order-last">
                            <div className="relative w-full flex items-center justify-center">
                                <div className="relative md:w-[500px] md:h-[500px] w-[380px] h-[380px] flex items-center justify-center group perspective-1000">
                                    {/* Background Circles */}

                                    {/* Circle Behind */}
                                    <div className="ring-absolute ring-4 z-10" style={{ top: '5%', left: '6%' }}></div>

                                    {/* Inner Circle */}
                                    <div className="ring-absolute ring-5 z-10" style={{ top: '5%', left: '6%' }}></div>

                                    {/* Card Image */}
                                    <div className="relative md:w-[200px] md:h-[310px] w-[152px] h-[236px] z-20 card-float transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-1">
                                        <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-[0.02] rounded-xl group-hover:opacity-[0.05] transition-opacity duration-500"></div>
                                        <img
                                            alt={cardName}
                                            className="w-full h-full object-cover rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-yellow-500/40 relative z-30"
                                            src={dailyCard.imageUrl}
                                            onError={handleImageError}
                                        />
                                        <div className="absolute -inset-[1px] rounded-xl border border-yellow-500/30 z-40 pointer-events-none"></div>
                                        <div className="absolute -inset-[6px] rounded-xl border border-yellow-500/10 z-30 pointer-events-none"></div>
                                    </div>

                                    {/* Decorative elements */}
                                    <div className="absolute top-1/2 right-[-40px] text-yellow-500/50 text-xs">●</div>
                                </div>
                            </div>

                            {/* Card Name and Arcano Below Image */}
                            <div className="space-y-3 -mt-4 text-center w-full z-20">
                                <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wider drop-shadow-md">
                                    {cardName}
                                </h2>
                                <div className="flex justify-center py-2">
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900 to-purple-950 border border-purple-700/30 shadow-lg">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                        <span className="text-[10px] md:text-xs font-bold text-gray-200 uppercase tracking-[0.2em]">
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

                        {/* Reflexão */}
                        <div className="relative h-full">
                            <div className="relative h-full bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/10 flex-shrink-0">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">psychology</span>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Reflexão' : 'Reflection'}
                                        </h3>
                                        <div className="w-8 h-px bg-gradient-to-r from-yellow-500/40 to-transparent mt-2" />
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
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/10 flex-shrink-0">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">explore</span>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Orientação' : 'Guidance'}
                                        </h3>
                                        <div className="w-8 h-px bg-gradient-to-r from-yellow-500/40 to-transparent mt-2" />
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-loose font-light flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {advice}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* WhatsApp Form Section - Daily Destiny with 2-Step Form */}
            <section className="relative py-12 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0B061A]">
                <style>{`
                    .glass-card {
                        background: rgba(255, 255, 255, 0.04);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.08);
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
                    .material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .cosmic-glow {
                        filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.7));
                    }
                    #step2-trigger:checked ~ .step-1-content { display: none; }
                    #step2-trigger:checked ~ .step-2-content { display: block; }
                    #step2-trigger:not(:checked) ~ .step-2-content { display: none; }
                    #step2-trigger:checked ~ .progress-container .step-2-indicator { background-color: #A855F7; }
                    #step2-trigger:checked ~ .progress-container .step-line { background-color: #A855F7; }
                `}</style>
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Column - Phone Mockup */}
                        <div className="hidden lg:flex justify-center items-center relative">
                            <div className="absolute w-[100px] h-[1200px] bg-primary/20 blur-[120px] rounded-full"></div>
                            <div className="relative w-[50px] h-[1100px] bg-gray-950 rounded-[3rem] border-8 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-gray-900 rounded-b-2xl z-20"></div>
                                <div className="h-full flex flex-col bg-[#0b141a]">
                                    <div className="bg-[#202c33] p-5 pt-10 flex items-center gap-2 border-b border-white/5">
                                        <div>
                                            <h4 className="text-white text-base font-semibold">
                                                {isPortuguese ? 'Oráculo Digital' : 'Digital Oracle'}
                                            </h4>
                                            <p className="text-emerald-500 text-[11px]">online</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-5 space-y-5 overflow-y-auto">
                                        <div className="max-w-[90%] bg-[#202c33] rounded-lg rounded-tl-none p-4 shadow-sm border border-white/5">
                                            <div className="relative rounded overflow-hidden mb-3">
                                                <img alt="Tarot Card" className="w-full h-72 object-cover" src={dailyCard.imageUrl} onError={handleImageError} />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 text-center border-t border-white/10">
                                                    <span className="font-display text-yellow-400 text-sm tracking-widest uppercase">{cardName}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-200 text-sm leading-relaxed">
                                                {meaning}
                                            </p>
                                            <span className="block text-[10px] text-gray-400 text-right mt-2">08:00</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#202c33] p-4 flex items-center gap-3">
                                        <div className="flex-1 bg-[#2a3942] rounded-full h-12 px-5 flex items-center border border-white/5">
                                            <span className="text-gray-400 text-sm">
                                                {isPortuguese ? 'Mensagem...' : 'Message...'}
                                            </span>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-md">
                                            <span className="material-icons text-white text-lg">mic</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Form with 2 Steps */}
                        <div className="w-full">
                            <div className="max-w-xl mx-auto lg:mx-0">
                                <header className="mb-8 text-center lg:text-left">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary font-medium text-xs mb-4 tracking-[0.2em] uppercase border border-primary/30 backdrop-blur-md">
                                        {isPortuguese ? 'Conexão Celestial' : 'Celestial Connection'}
                                    </span>
                                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                                        {isPortuguese ? 'Desperte seu' : 'Awaken Your'} <br />
                                        <span className="text-primary cosmic-glow italic">{isPortuguese ? 'Destino Diário' : 'Daily Destiny'}</span>
                                    </h1>
                                    <p className="text-gray-300 text-lg max-w-md mx-auto lg:mx-0">
                                        {isPortuguese
                                            ? 'Receba orientações ancestrais e insights poderosos diretamente no seu WhatsApp através de um mapa estelar personalizado.'
                                            : 'Receive ancestral guidance and powerful insights directly on your WhatsApp through a personalized star map.'}
                                    </p>
                                </header>

                                <form className="space-y-8 relative">
                                    <input className="hidden peer" id="step2-trigger" type="checkbox" />

                                    <div className="progress-container flex items-center justify-between max-w-[200px] mx-auto lg:mx-0 mb-8 relative">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10 border-2 border-primary shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                            <span className="text-xs font-bold text-white">1</span>
                                        </div>
                                        <div className="step-line flex-1 h-[2px] bg-white/10 mx-2 transition-colors duration-300"></div>
                                        <div className="step-2-indicator w-8 h-8 rounded-full bg-white/5 flex items-center justify-center z-10 border-2 border-white/10 transition-all duration-300">
                                            <span className="text-xs font-bold text-gray-400">2</span>
                                        </div>
                                    </div>

                                    <div className="step-1-content space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                                                    {isPortuguese ? 'Nome Completo' : 'Full Name'}
                                                </label>
                                                <div className="relative group">
                                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">person</span>
                                                    <input
                                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-0 focus:outline-none glow-border transition-all text-white placeholder:text-gray-600"
                                                        placeholder={isPortuguese ? 'Seu nome místico' : 'Your mystical name'}
                                                        type="text"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                                                    WhatsApp
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 border-r border-white/10 pr-2">
                                                        <span className="text-xs font-medium text-gray-400">+55</span>
                                                    </div>
                                                    <input
                                                        className="w-full pl-16 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-0 focus:outline-none glow-border transition-all text-white placeholder:text-gray-600"
                                                        placeholder={isPortuguese ? '(00) 00000-0000' : '(000) 000-0000'}
                                                        type="tel"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <label className="w-full cursor-pointer relative group overflow-hidden bg-white/5 text-white font-bold py-5 rounded-2xl border border-white/10 flex items-center justify-center gap-2 text-lg uppercase tracking-widest hover:bg-white/10 transition-all" htmlFor="step2-trigger">
                                            {isPortuguese ? 'Próximo Passo' : 'Next Step'}
                                            <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </label>
                                    </div>

                                    <div className="step-2-content space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                                                {isPortuguese ? 'Frequência das Mensagens' : 'Message Frequency'}
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <label className="frequency-card cursor-pointer group">
                                                    <input defaultChecked className="hidden" name="freq" type="radio" value="diario" />
                                                    <div className="glass-card flex flex-col items-center justify-center p-6 rounded-2xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                        <span className="material-symbols-outlined text-3xl mb-3 text-yellow-400 group-hover:scale-110 transition-transform">sunny</span>
                                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">
                                                            {isPortuguese ? 'Diário' : 'Daily'}
                                                        </span>
                                                    </div>
                                                </label>
                                                <label className="frequency-card cursor-pointer group">
                                                    <input className="hidden" name="freq" type="radio" value="semanal" />
                                                    <div className="glass-card flex flex-col items-center justify-center p-6 rounded-2xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                        <span className="material-symbols-outlined text-3xl mb-3 text-primary group-hover:scale-110 transition-transform">auto_awesome</span>
                                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">
                                                            {isPortuguese ? 'Semanal' : 'Weekly'}
                                                        </span>
                                                    </div>
                                                </label>
                                                <label className="frequency-card cursor-pointer group">
                                                    <input className="hidden" name="freq" type="radio" value="mensal" />
                                                    <div className="glass-card flex flex-col items-center justify-center p-6 rounded-2xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                        <span className="material-symbols-outlined text-3xl mb-3 text-blue-400 group-hover:scale-110 transition-transform">nightlight</span>
                                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">
                                                            {isPortuguese ? 'Mensal' : 'Monthly'}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            className="w-full relative group overflow-hidden bg-primary text-white font-bold py-5 rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all active:scale-[0.98]"
                                            type="submit"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2 text-lg uppercase tracking-widest">
                                                {isPortuguese ? 'Começar a Receber' : 'Start Receiving'}
                                                <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </button>

                                        <label className="block text-center cursor-pointer text-xs text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest" htmlFor="step2-trigger">
                                            {isPortuguese ? 'Voltar para Dados Pessoais' : 'Back to Personal Data'}
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-[0.1em] pt-4">
                                        <span className="material-symbols-outlined text-[14px]">lock</span>
                                        <p>{isPortuguese ? 'Dados criptografados e protegidos' : 'Encrypted and secure data'}</p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="readings"
                onLogin={() => {
                    setShowPaywall(false);
                    setShowAuthModal(true);
                }}
                onCheckout={() => navigate('/checkout')}
            />
        </div>
    );
};
