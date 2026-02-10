import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { UserMenu } from '../components/UserMenu';
import { AuthModal } from '../components/AuthModal';
import { MinimalStarsBackground } from '../components/MinimalStarsBackground';
import { ZODIAC_SIGNS, ZODIAC_ORDER, ELEMENT_COLORS, ZodiacSign } from '../data/zodiacData';

// Header Component
const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

    const exploreRoute = isPortuguese ? '/arquivo-arcano' : '/arcane-archive';

    return (
        <>
            <header className="flex justify-center w-full bg-background-dark/95 backdrop-blur-md sticky top-0 z-40 border-b border-border-dark">
                <div className="flex flex-col w-full max-w-[1200px]">
                    <div className="flex items-center justify-between whitespace-nowrap px-4 py-3 lg:px-10 lg:py-4">
                        <div className="flex items-center text-white cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Zaya Tarot</h2>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isActive('/') && location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
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
                                {isPortuguese ? 'Interpretação' : 'Interpretation'}
                            </button>
                            <button onClick={() => navigate(exploreRoute)} className={`text-sm font-medium transition-colors ${(isActive('/explore') || isActive(exploreRoute)) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.cardMeanings}
                            </button>
                            <button onClick={() => navigate('/history')} className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.history}
                            </button>
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

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden border-t border-border-dark p-4 space-y-2 animate-fade-in">
                            <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.home}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/jogos-de-tarot' : '/spreads'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.tarot}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/carta-do-dia' : '/daily-card'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{isPortuguese ? 'Carta do Dia' : 'Daily Card'}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/tarot-por-signo' : '/tarot-by-sign'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{isPortuguese ? 'Tarot por Signo' : 'Tarot by Sign'}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/interpretacao' : '/interpretation'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{isPortuguese ? 'Interpretação' : 'Interpretation'}</button>
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
                            <button onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')} className="text-gray-400 text-sm hover:text-primary text-left transition-colors">{t.footer.cardLibrary}</button>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">{t.footer.support}</h4>
                        <div className="flex flex-col gap-2">
                            <span className="text-gray-400 text-sm">{t.footer.help}</span>
                            <span className="text-gray-400 text-sm">{t.footer.contact}</span>
                        </div>
                    </div>
                </div>
                <div className="border-t border-border-dark pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-xs">© 2025 Zaya Tarot. {t.footer.copyright}</p>
                </div>
            </div>
        </footer>
    );
};

export const TarotPorSignoIndex = () => {
    const navigate = useNavigate();
    const { isPortuguese } = useLanguage();
    const { profile, isGuest } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Se usuário logado tem signo, redireciona automaticamente
    useEffect(() => {
        if (!isGuest && profile?.zodiac_sign) {
            const route = isPortuguese
                ? `/tarot-por-signo/${profile.zodiac_sign}`
                : `/tarot-by-sign/${profile.zodiac_sign}`;
            navigate(route, { replace: true });
        }
    }, [profile, isGuest, navigate, isPortuguese]);

    const handleSignClick = (sign: ZodiacSign) => {
        const route = isPortuguese
            ? `/tarot-por-signo/${sign}`
            : `/tarot-by-sign/${sign}`;
        navigate(route);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{
            backgroundColor: '#1a1628',
            backgroundAttachment: 'fixed'
        }}>
            <style>{`
                .text-gradient-gold {
                    background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
            <MinimalStarsBackground />
            <Header />

            <main className="flex-grow flex flex-col items-center justify-start relative py-8 md:py-12">
                <div className="container mx-auto px-4 relative z-10">
                    {/* Hero Section */}
                    <div className="text-center mb-8 max-w-3xl mx-auto">
                        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-wide text-gradient-gold drop-shadow-lg mb-4">
                            {isPortuguese ? 'Tarot por Signo' : 'Tarot by Sign'}
                        </h1>
                        <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed">
                            {isPortuguese
                                ? 'Escolha seu signo e descubra as energias do tarot personalizadas para você hoje.'
                                : 'Choose your sign and discover the personalized tarot energies for you today.'}
                        </p>
                    </div>

                    {/* Grid organizado por elementos */}
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Fogo */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <span className="text-orange-400 text-lg">🔥</span>
                                </div>
                                <h2 className="text-orange-400 font-semibold text-lg">
                                    {isPortuguese ? 'Fogo' : 'Fire'}
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(['aries', 'leao', 'sagitario'] as ZodiacSign[]).map((sign) => {
                                    const signData = ZODIAC_SIGNS[sign];
                                    return (
                                        <button
                                            key={sign}
                                            onClick={() => handleSignClick(sign)}
                                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/15 to-red-500/10 border border-orange-500/20 p-5 text-center transition-all duration-300 hover:border-orange-400/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10"
                                        >
                                            <div className="relative z-10">
                                                <span className="text-2xl mb-2 block">{signData.symbol}</span>
                                                <h3 className="text-white text-base font-semibold mb-1">
                                                    {isPortuguese ? signData.name.pt : signData.name.en}
                                                </h3>
                                                <p className="text-gray-400 text-xs">
                                                    {signData.dateRange.start.replace('-', '/')} - {signData.dateRange.end.replace('-', '/')}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Terra */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <span className="text-emerald-400 text-lg">🌍</span>
                                </div>
                                <h2 className="text-emerald-400 font-semibold text-lg">
                                    {isPortuguese ? 'Terra' : 'Earth'}
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(['touro', 'virgem', 'capricornio'] as ZodiacSign[]).map((sign) => {
                                    const signData = ZODIAC_SIGNS[sign];
                                    return (
                                        <button
                                            key={sign}
                                            onClick={() => handleSignClick(sign)}
                                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/10 border border-emerald-500/20 p-5 text-center transition-all duration-300 hover:border-emerald-400/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10"
                                        >
                                            <div className="relative z-10">
                                                <span className="text-2xl mb-2 block">{signData.symbol}</span>
                                                <h3 className="text-white text-base font-semibold mb-1">
                                                    {isPortuguese ? signData.name.pt : signData.name.en}
                                                </h3>
                                                <p className="text-gray-400 text-xs">
                                                    {signData.dateRange.start.replace('-', '/')} - {signData.dateRange.end.replace('-', '/')}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ar */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                    <span className="text-cyan-400 text-lg">💨</span>
                                </div>
                                <h2 className="text-cyan-400 font-semibold text-lg">
                                    {isPortuguese ? 'Ar' : 'Air'}
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(['gemeos', 'libra', 'aquario'] as ZodiacSign[]).map((sign) => {
                                    const signData = ZODIAC_SIGNS[sign];
                                    return (
                                        <button
                                            key={sign}
                                            onClick={() => handleSignClick(sign)}
                                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/20 p-5 text-center transition-all duration-300 hover:border-cyan-400/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
                                        >
                                            <div className="relative z-10">
                                                <span className="text-2xl mb-2 block">{signData.symbol}</span>
                                                <h3 className="text-white text-base font-semibold mb-1">
                                                    {isPortuguese ? signData.name.pt : signData.name.en}
                                                </h3>
                                                <p className="text-gray-400 text-xs">
                                                    {signData.dateRange.start.replace('-', '/')} - {signData.dateRange.end.replace('-', '/')}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Água */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-blue-400 text-lg">💧</span>
                                </div>
                                <h2 className="text-blue-400 font-semibold text-lg">
                                    {isPortuguese ? 'Água' : 'Water'}
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(['cancer', 'escorpiao', 'peixes'] as ZodiacSign[]).map((sign) => {
                                    const signData = ZODIAC_SIGNS[sign];
                                    return (
                                        <button
                                            key={sign}
                                            onClick={() => handleSignClick(sign)}
                                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 border border-blue-500/20 p-5 text-center transition-all duration-300 hover:border-blue-400/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
                                        >
                                            <div className="relative z-10">
                                                <span className="text-2xl mb-2 block">{signData.symbol}</span>
                                                <h3 className="text-white text-base font-semibold mb-1">
                                                    {isPortuguese ? signData.name.pt : signData.name.en}
                                                </h3>
                                                <p className="text-gray-400 text-xs">
                                                    {signData.dateRange.start.replace('-', '/')} - {signData.dateRange.end.replace('-', '/')}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* CTA para criar conta */}
                    {isGuest && (
                        <div className="max-w-md mx-auto mt-8 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                            <p className="text-gray-300 text-sm mb-3">
                                {isPortuguese
                                    ? 'Crie sua conta para acessar automaticamente o tarot do seu signo.'
                                    : 'Create your account to automatically access your sign\'s tarot.'}
                            </p>
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                {isPortuguese ? 'Criar Conta' : 'Create Account'}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

export default TarotPorSignoIndex;
