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
                            <button onClick={() => navigate(exploreRoute)} className={`text-sm font-medium transition-colors ${(isActive('/explore') || isActive(exploreRoute)) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.cardMeanings}
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
                            <button onClick={() => { navigate(exploreRoute); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.cardMeanings}</button>
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

    // Agrupar signos por elemento
    const signsByElement = {
        fire: ZODIAC_ORDER.filter(s => ZODIAC_SIGNS[s].element === 'fire'),
        earth: ZODIAC_ORDER.filter(s => ZODIAC_SIGNS[s].element === 'earth'),
        air: ZODIAC_ORDER.filter(s => ZODIAC_SIGNS[s].element === 'air'),
        water: ZODIAC_ORDER.filter(s => ZODIAC_SIGNS[s].element === 'water'),
    };

    const elementNames = {
        fire: { pt: 'Fogo', en: 'Fire', icon: 'local_fire_department' },
        earth: { pt: 'Terra', en: 'Earth', icon: 'landscape' },
        air: { pt: 'Ar', en: 'Air', icon: 'air' },
        water: { pt: 'Água', en: 'Water', icon: 'water_drop' },
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

            <main className="flex-grow flex flex-col items-center justify-start relative py-12 md:py-20">
                <div className="container mx-auto px-4 relative z-10">
                    {/* Hero Section */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide text-gradient-gold drop-shadow-lg mb-6">
                            {isPortuguese ? 'Tarot por Signo' : 'Tarot by Sign'}
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-8">
                            {isPortuguese
                                ? 'Escolha seu signo e descubra as energias do tarot personalizadas para você hoje.'
                                : 'Choose your sign and discover the personalized tarot energies for you today.'}
                        </p>

                        {/* CTA para criar conta */}
                        {isGuest && (
                            <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-12">
                                <p className="text-gray-300 text-sm mb-4">
                                    {isPortuguese
                                        ? 'Crie sua conta e informe sua data de nascimento para acessar automaticamente o tarot do seu signo.'
                                        : 'Create your account and enter your birth date to automatically access your sign\'s tarot.'}
                                </p>
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {isPortuguese ? 'Criar Conta' : 'Create Account'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Signos por Elemento */}
                    <div className="max-w-5xl mx-auto space-y-12">
                        {(['fire', 'earth', 'air', 'water'] as const).map((element) => {
                            const colors = ELEMENT_COLORS[element];
                            const elementName = elementNames[element];
                            const signs = signsByElement[element];

                            return (
                                <div key={element} className="space-y-4">
                                    {/* Título do Elemento */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${colors.bg} border border-white/10`}>
                                            <span className={`material-symbols-outlined ${colors.primary}`}>{elementName.icon}</span>
                                        </div>
                                        <h2 className={`text-xl font-medium ${colors.primary}`}>
                                            {isPortuguese ? elementName.pt : elementName.en}
                                        </h2>
                                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                                    </div>

                                    {/* Grid de Signos */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {signs.map((sign) => {
                                            const signData = ZODIAC_SIGNS[sign];

                                            return (
                                                <button
                                                    key={sign}
                                                    onClick={() => handleSignClick(sign)}
                                                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} border border-white/10 p-6 text-left transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-${element === 'fire' ? 'orange' : element === 'earth' ? 'emerald' : element === 'air' ? 'cyan' : 'blue'}-500/10 hover:-translate-y-1`}
                                                >
                                                    {/* Background Glow */}
                                                    <div className={`absolute -top-12 -right-12 w-32 h-32 ${colors.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <span className="text-4xl">{signData.symbol}</span>
                                                            <div>
                                                                <h3 className="text-white text-lg font-medium">
                                                                    {isPortuguese ? signData.name.pt : signData.name.en}
                                                                </h3>
                                                                <p className="text-gray-500 text-xs">
                                                                    {signData.dateRange.start.replace('-', '/')} - {signData.dateRange.end.replace('-', '/')}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 mt-4">
                                                            {(isPortuguese ? signData.keywords.pt : signData.keywords.en).slice(0, 2).map((keyword, i) => (
                                                                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                                                                    {keyword}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                                            <span className="text-xs text-gray-500">
                                                                {isPortuguese ? `Regente: ${signData.ruler}` : `Ruler: ${signData.ruler}`}
                                                            </span>
                                                            <span className={`material-symbols-outlined ${colors.primary} text-sm opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                                arrow_forward
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            <Footer />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

export default TarotPorSignoIndex;
