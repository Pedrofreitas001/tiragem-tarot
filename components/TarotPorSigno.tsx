import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getCardName } from '../tarotData';
import React, { useState, useEffect } from 'react';
import { UserMenu } from './UserMenu';
import { AuthModal } from './AuthModal';
import { PaywallModal } from './PaywallModal';
import { MinimalStarsBackground } from './MinimalStarsBackground';
import { getTarotPorSignoSynthesis, TarotPorSignoSynthesis } from '../services/geminiService';
import { ZODIAC_SIGNS, ZODIAC_ORDER, ELEMENT_COLORS, ZodiacSign } from '../data/zodiacData';
import { getDailyCardsForSign, isValidZodiacSign, getSignName, getFormattedDate } from '../utils/zodiacUtils';

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

export const TarotPorSigno = () => {
    const { signo } = useParams<{ signo: string }>();
    const navigate = useNavigate();
    const { isPortuguese } = useLanguage();
    const { tier, profile } = useAuth();
    const isPremium = tier === 'premium';

    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [aiSynthesis, setAiSynthesis] = useState<TarotPorSignoSynthesis | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    // Validar e obter signo
    const currentSign: ZodiacSign = signo && isValidZodiacSign(signo) ? signo : 'aries';
    const signData = ZODIAC_SIGNS[currentSign];
    const elementColors = ELEMENT_COLORS[signData.element];

    // Obter as 3 cartas do dia para o signo
    const dailyCards = getDailyCardsForSign(currentSign);

    // CSS para animações
    const orbitStyles = `
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .text-gradient-gold {
            background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .card-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes flame-pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        .golden-flame {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            filter: blur(60px);
        }
        .flame-core {
            width: 400px; height: 300px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(ellipse at center,
                rgba(255, 200, 50, 0.4) 0%,
                rgba(255, 180, 40, 0.25) 30%,
                transparent 60%);
            animation: flame-pulse 4s ease-in-out infinite;
        }
    `;

    // Buscar síntese da IA
    useEffect(() => {
        const fetchAISynthesis = async () => {
            setIsLoadingAI(true);
            try {
                const cardsData = dailyCards.map(card => ({
                    name: card.name,
                    id: card.id
                }));
                const synthesis = await getTarotPorSignoSynthesis(currentSign, cardsData, isPortuguese);
                if (synthesis) {
                    setAiSynthesis(synthesis);
                }
            } catch (error) {
                console.error('Erro ao buscar síntese:', error);
            } finally {
                setIsLoadingAI(false);
            }
        };

        fetchAISynthesis();
    }, [currentSign, isPortuguese]);

    // Módulos dinâmicos
    const getDynamicModules = () => {
        if (!aiSynthesis) return [];

        return [
            {
                title: isPortuguese ? 'Desafio Cósmico' : 'Cosmic Challenge',
                content: aiSynthesis.desafio_cosmico,
                color: 'purple',
                borderColor: 'border-purple-500/20',
                dotColor: 'bg-purple-500/30 border-purple-400/50',
                textColor: 'text-white',
                contentColor: 'text-purple-50'
            },
            {
                title: isPortuguese ? 'Portal de Oportunidade' : 'Opportunity Portal',
                content: aiSynthesis.portal_oportunidade,
                color: 'emerald',
                borderColor: 'border-emerald-500/20',
                dotColor: 'bg-emerald-500/30 border-emerald-400/50',
                textColor: 'text-white',
                contentColor: 'text-emerald-50'
            },
            {
                title: isPortuguese ? 'Sombra a Integrar' : 'Shadow to Integrate',
                content: aiSynthesis.sombra_a_integrar,
                color: 'indigo',
                borderColor: 'border-indigo-500/20',
                dotColor: 'bg-indigo-500/30 border-indigo-400/50',
                textColor: 'text-white',
                contentColor: 'text-indigo-50'
            },
            {
                title: isPortuguese ? 'Ação Sugerida' : 'Suggested Action',
                content: aiSynthesis.acao_sugerida,
                color: 'orange',
                borderColor: 'border-orange-500/20',
                dotColor: 'bg-orange-500/30 border-orange-400/50',
                textColor: 'text-white',
                contentColor: 'text-orange-50'
            }
        ];
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "https://placehold.co/300x520/1c1022/9311d4?text=Tarot";
        e.currentTarget.onerror = null;
    };

    const signName = getSignName(currentSign, isPortuguese);
    const formattedDate = getFormattedDate(isPortuguese);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{
            backgroundColor: '#1a1628',
            backgroundAttachment: 'fixed'
        }}>
            <style>{orbitStyles}</style>
            <MinimalStarsBackground />
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center relative py-8">
                <div className="container mx-auto px-4 relative z-10 pb-24">
                    {/* Hero Section - 3 Cartas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
                        {/* Left Column - Title */}
                        <div className="flex flex-col justify-center text-left lg:order-first order-first pt-8 lg:pt-16">
                            {/* Badge do signo */}
                            <div className="mb-4">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${elementColors.bg} border border-white/10`}>
                                    <span className={`text-sm font-medium ${elementColors.primary}`}>{signName}</span>
                                </span>
                            </div>

                            {/* Título */}
                            <div className="mb-6 relative">
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide text-gradient-gold drop-shadow-lg">
                                    {isPortuguese ? `Tarot para ${signName}` : `Tarot for ${signName}`}
                                </h1>
                            </div>

                            {/* Data */}
                            <div className="mb-6">
                                <p className="text-gray-400 text-sm uppercase tracking-wider">{formattedDate}</p>
                            </div>

                            {/* Descrição */}
                            <div className="space-y-4 mb-8 z-20">
                                <div className="w-24 h-[1px] bg-gradient-to-r from-yellow-500/40 to-transparent my-3"></div>
                                <p className="text-gray-300 text-base font-light leading-relaxed max-w-lg">
                                    {aiSynthesis?.energia_signo_hoje || (isPortuguese
                                        ? `Descubra as energias do tarot para ${signName} hoje através de uma tiragem especial de 3 cartas.`
                                        : `Discover today's tarot energies for ${signName} through a special 3-card reading.`)}
                                </p>
                            </div>

                            {/* Botões */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button
                                    onClick={() => navigate(isPortuguese ? '/tarot-por-signo' : '/tarot-by-sign')}
                                    className="group px-6 py-3 bg-transparent border border-yellow-500/40 rounded-lg transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:-translate-y-1 text-sm"
                                >
                                    <span className="text-yellow-300 font-medium tracking-wide flex items-center justify-center gap-2 group-hover:text-yellow-400">
                                        {isPortuguese ? 'Ver Outros Signos' : 'View Other Signs'}
                                        <span className="material-symbols-outlined text-sm">grid_view</span>
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Right Column - 3 Cards Display */}
                        <div className="flex flex-col items-center justify-center lg:order-last order-last relative pt-12 pb-12 lg:pt-8 lg:pb-0">
                            {/* Golden Flame Background */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="golden-flame flame-core"></div>
                            </div>

                            {/* 3 Cards Grid */}
                            <div className="relative z-10 flex items-end justify-center gap-3 md:gap-4">
                                {dailyCards.map((card, index) => {
                                    const isCenter = index === 1;
                                    const cardName = getCardName(card.id, isPortuguese);

                                    return (
                                        <div
                                            key={card.id}
                                            className={`relative group ${isCenter ? 'z-20 card-float' : 'z-10'}`}
                                            style={{
                                                transform: isCenter ? 'scale(1.1)' : 'scale(0.95)',
                                                marginTop: isCenter ? '0' : '20px'
                                            }}
                                        >
                                            {/* Card Container */}
                                            <div className={`relative ${isCenter ? 'w-[120px] h-[190px] md:w-[160px] md:h-[250px]' : 'w-[100px] h-[160px] md:w-[130px] md:h-[205px]'} transition-transform duration-500`}>
                                                {/* Glow for center card */}
                                                {isCenter && (
                                                    <div className="absolute -inset-2 bg-yellow-500/20 blur-2xl rounded-full opacity-60"></div>
                                                )}

                                                {/* Card Border */}
                                                <div className={`absolute -inset-[2px] bg-gradient-to-b ${isCenter ? 'from-yellow-500/50 via-yellow-500/20' : 'from-white/20 via-white/5'} to-transparent rounded-xl z-0`} />

                                                {/* Card Image */}
                                                <img
                                                    alt={cardName}
                                                    className="w-full h-full object-cover rounded-xl shadow-2xl relative z-10"
                                                    src={card.imageUrl}
                                                    onError={handleImageError}
                                                />
                                            </div>

                                            {/* Card Name */}
                                            <div className="mt-3 text-center">
                                                <p className={`text-xs ${isCenter ? 'text-white' : 'text-gray-400'} truncate max-w-[100px] md:max-w-[130px]`}>
                                                    {cardName}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Seção de Energias do Signo */}
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

                        {/* Decoração de cantos - topo esquerdo */}
                        <div className="absolute top-4 left-4 w-12 h-12 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
                            <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-yellow-500/50 to-transparent" />
                        </div>

                        {/* Decoração de cantos - topo direito */}
                        <div className="absolute top-4 right-4 w-12 h-12 pointer-events-none">
                            <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-yellow-500/50 to-transparent" />
                            <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-yellow-500/50 to-transparent" />
                        </div>

                        {/* Decoração de cantos - baixo esquerdo */}
                        <div className="absolute bottom-4 left-4 w-12 h-12 pointer-events-none">
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
                            <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-yellow-500/50 to-transparent" />
                        </div>

                        {/* Decoração de cantos - baixo direito */}
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

                        {/* Conteúdo com padding */}
                        <div className="relative z-10 px-6 md:px-8 lg:px-10 py-6 md:py-8">
                            {/* Section Title */}
                            <div className="text-center mb-6 md:mb-8">
                                <h2 className="text-white text-3xl md:text-4xl font-light mb-3" style={{ fontFamily: "'Crimson Text', serif", letterSpacing: '0.02em' }}>
                                    {isPortuguese ? `Energias de ${signName}` : `${signName} Energies`}
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
                                <div className="space-y-12 lg:space-y-16 max-w-6xl mx-auto">
                                    {/* Mensagem do Dia - Título Grande */}
                                    {aiSynthesis?.mensagem_do_dia && (
                                        <div className="text-center">
                                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{
                                                fontFamily: "'Crimson Text', serif",
                                                background: 'linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}>
                                                {aiSynthesis.mensagem_do_dia}
                                            </h3>
                                        </div>
                                    )}

                                    {/* Divisor decorativo */}
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-yellow-500/30"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-yellow-500/30"></div>
                                    </div>

                                    {/* Síntese Energética - FREE */}
                                    {aiSynthesis?.sintese_energetica && (
                                        <div className="max-w-3xl mx-auto text-center">
                                            <p className="text-gray-200 text-lg md:text-xl leading-relaxed font-light" style={{
                                                fontFamily: "'Crimson Text', serif"
                                            }}>
                                                {aiSynthesis.sintese_energetica}
                                            </p>
                                        </div>
                                    )}

                                    {/* Paywall para conteúdo Premium */}
                                    {!isPremium ? (
                                        <div className="relative">
                                            {/* Preview borrado */}
                                            <div className="blur-sm pointer-events-none opacity-60">
                                                {/* Módulos */}
                                                <div className="relative min-h-[200px] md:min-h-[140px] bg-white/5 rounded-xl p-6">
                                                    <p className="text-gray-400">Conteúdo premium bloqueado...</p>
                                                </div>
                                            </div>

                                            {/* Overlay com CTA */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background-dark via-background-dark/90 to-background-dark/70 rounded-xl">
                                                <div className="text-center p-4 md:p-8 w-full">
                                                    <span className="material-symbols-outlined text-3xl md:text-4xl text-yellow-500 mb-3 md:mb-4 block">lock</span>
                                                    <h3 className="text-lg md:text-xl text-white mb-2">
                                                        {isPortuguese ? 'Desbloqueie a interpretação completa' : 'Unlock complete interpretation'}
                                                    </h3>
                                                    <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6 max-w-md mx-auto px-2">
                                                        {isPortuguese
                                                            ? `Acesse a análise detalhada de cada carta para ${signName}, os módulos de orientação e seu mantra personalizado.`
                                                            : `Access detailed analysis of each card for ${signName}, guidance modules and your personalized mantra.`}
                                                    </p>
                                                    <button
                                                        onClick={() => setShowPaywall(true)}
                                                        className="px-6 md:px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/30 transition-all text-sm md:text-base"
                                                    >
                                                        {isPortuguese ? 'Desbloquear Premium' : 'Unlock Premium'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Módulos - Lista Vertical - PREMIUM */}
                                            {aiSynthesis && getDynamicModules().length > 0 && (
                                                <div className="space-y-4">
                                                    {getDynamicModules().map((module, index) => (
                                                        <div key={index} className={`relative pl-5 border-l-2 ${module.borderColor}`}>
                                                            <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full ${module.dotColor} border-2`}></div>
                                                            <span className={`${module.textColor} text-xs font-semibold uppercase tracking-wider`}>
                                                                {module.title}
                                                            </span>
                                                            <p className={`${module.contentColor} text-sm leading-relaxed mt-1`}>
                                                                {module.content}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Mantra do Signo - PREMIUM */}
                                            {aiSynthesis?.mantra_signo && (
                                                <div className="mt-10 text-center space-y-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-yellow-500/30"></div>
                                                        <span className="material-symbols-outlined text-yellow-400/50 text-lg">self_improvement</span>
                                                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-yellow-500/30"></div>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-yellow-500/10 blur-xl rounded-2xl"></div>
                                                        <div className="relative bg-gradient-to-br from-[#1a1230]/40 to-[#12091a]/40 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6">
                                                            <p className="text-2xl md:text-3xl font-medium leading-relaxed max-w-2xl mx-auto" style={{
                                                                fontFamily: "'Crimson Text', serif",
                                                                background: 'linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%)',
                                                                WebkitBackgroundClip: 'text',
                                                                WebkitTextFillColor: 'transparent',
                                                                backgroundClip: 'text',
                                                            }}>
                                                                "{aiSynthesis.mantra_signo}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Conselho Final - PREMIUM */}
                                            {aiSynthesis?.conselho_final && (
                                                <div className="mt-10 text-center space-y-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-purple-500/30"></div>
                                                        <span className="material-symbols-outlined text-purple-400/50 text-lg">psychology</span>
                                                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-purple-500/30"></div>
                                                    </div>
                                                    <p className="text-purple-100 text-xl md:text-2xl font-medium italic leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                        {aiSynthesis.conselho_final}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Outros Signos */}
            <section className="relative py-16 px-4 md:px-6 lg:px-8 bg-background-dark">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-white text-2xl font-light mb-8 text-center" style={{ fontFamily: "'Crimson Text', serif" }}>
                        {isPortuguese ? 'Explore Outros Signos' : 'Explore Other Signs'}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {ZODIAC_ORDER.map((sign) => {
                            const data = ZODIAC_SIGNS[sign];
                            const isCurrentSign = sign === currentSign;
                            const colors = ELEMENT_COLORS[data.element];

                            return (
                                <button
                                    key={sign}
                                    onClick={() => navigate(isPortuguese ? `/tarot-por-signo/${sign}` : `/tarot-by-sign/${sign}`)}
                                    className={`flex items-center justify-center p-4 rounded-xl transition-all ${isCurrentSign
                                        ? 'bg-yellow-500/20 border border-yellow-500/40'
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${isCurrentSign ? 'text-yellow-400' : 'text-gray-400'}`}>
                                        {isPortuguese ? data.name.pt : data.name.en}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <Footer />

            {/* Modals */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="tarot-signo"
                onLogin={() => {
                    setShowPaywall(false);
                    setShowAuthModal(true);
                }}
            />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

export default TarotPorSigno;
