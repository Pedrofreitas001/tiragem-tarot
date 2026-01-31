import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { SPREADS, generateDeck, getStaticLore } from './constants';
import { Spread, TarotCard, ReadingSession, ReadingAnalysis, Suit, ArcanaType, CardLore } from './types';
import { getGeminiInterpretation, getStructuredSynthesis, StructuredSynthesis, isGeminiConfigured, AnySynthesis, convertToLegacySynthesis } from './services/geminiService';
import StarsBackground from './components/StarsBackground';
import { MinimalStarsBackground } from './components/MinimalStarsBackground';
import { fetchCardByName, ApiTarotCard, preloadCards } from './services/tarotApiService';
import { saveReadingToSupabase, deleteReadingFromSupabase, saveReadingWithSummary, fetchReadingsFromSupabase, saveGuestReading, getGuestReading, clearGuestReading, transferGuestReadingToUser, formatReadingSummary, extractSummaryFromSynthesis } from './services/readingsService';
import { LanguageProvider, useLanguage, LanguageToggle } from './contexts/LanguageContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { PaywallModal, usePaywall } from './components/PaywallModal';
import WhatsAppModal from './components/WhatsAppModal';
import { JourneySection } from './components/journey';
import HeroJourneyStories from './components/journey/HeroJourneyStories';
import { DailyCard } from './components/DailyCard';
import { HistoryFiltered } from './components/HistoryFiltered';
import { SideBySideExample } from './components/Charts/SideBySideExample';
import { PRODUCTS, getProductBySlug } from './data/products';
import { Product, ProductVariant, ProductCategory } from './types/product';
import Spreads from './pages/Spreads';
import Checkout from './pages/Checkout';
import Settings from './pages/Settings';
import { getCardName, getCardBySlug } from './tarotData';
import { calculateNumerologyProfile, calculateUniversalDay, NumerologyProfile, NumerologyNumber } from './services/numerologyService';
import { getCosmicDay, getMoonPhase, getElementColor, CosmicDay, MoonPhase } from './services/cosmicCalendarService';
import { TAROT_CARDS } from './tarotData';

// Extended CardLore with API description
interface ExtendedCardLore extends CardLore {
    apiDescription?: string;
    apiMeaningUp?: string;
    apiMeaningRev?: string;
}

// Preload API cards on app start
preloadCards();

// --- Helper Functions ---
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/300x520/1c1022/9311d4?text=Tarot";
    e.currentTarget.onerror = null;
};

const formatPrice = (price: number, currency: string) => {
    if (currency === 'R$') {
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    return `$${(price / 5).toFixed(2)}`;
};

// --- Components ---

// Cart Drawer
const CartDrawer = () => {
    const { t, isPortuguese } = useLanguage();
    const { items, isOpen, toggleCart, removeItem, updateQuantity, getSubtotal, getItemKey } = useCart();
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => toggleCart(false)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card-dark/95 backdrop-blur-md border-l border-border-dark/80 z-50 flex flex-col animate-slide-in-right">
                <div className="flex items-center justify-between p-6 border-b border-border-dark">
                    <h2 className="text-xl font-bold text-white">{t.cart.title}</h2>
                    <button onClick={() => toggleCart(false)} className="text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">shopping_cart</span>
                        <p className="text-gray-400 mb-4">{t.cart.empty}</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.map(item => {
                                const price = item.variant?.price ?? item.product.price;
                                const name = isPortuguese ? item.product.name : item.product.name_en;
                                const variantName = item.variant ? (isPortuguese ? item.variant.name : item.variant.name_en) : null;

                                return (
                                    <div key={getItemKey(item)} className="flex gap-4 bg-surface-dark rounded-lg p-3">
                                        <img
                                            src={item.product.images[0]}
                                            alt={name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium text-sm truncate">{name}</h3>
                                            {variantName && <p className="text-gray-500 text-xs">{variantName}</p>}
                                            <p className="text-primary font-bold mt-1">{formatPrice(price, t.common.currency)}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                                                    className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 text-sm"
                                                >-</button>
                                                <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                                                    className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 text-sm"
                                                >+</button>
                                                <button
                                                    onClick={() => removeItem(item.product.id, item.variant?.id)}
                                                    className="ml-auto text-red-400 hover:text-red-300 text-xs"
                                                >
                                                    {t.cart.remove}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-border-dark p-6 space-y-4">
                            <div className="flex justify-between text-gray-400">
                                <span>{t.cart.subtotal}</span>
                                <span className="text-white font-bold">{formatPrice(getSubtotal(), t.common.currency)}</span>
                            </div>
                            <button
                                onClick={() => { toggleCart(false); navigate('/checkout'); }}
                                className="w-full py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-bold transition-colors"
                            >
                                {t.cart.checkout}
                            </button>
                        </div>
                    </>
                )
                }
            </div >
        </>
    );
};

// Navigation Header
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
                    <div className="flex items-center justify-between whitespace-nowrap px-2 py-2 sm:px-4 sm:py-3 lg:px-10 lg:py-4 gap-2">
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

// --- Pages ---

// Home Page - Modern Mystical Design
const Home = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { checkAccess, readingsRemaining } = usePaywall();
    const [showPaywall, setShowPaywall] = useState(false);
    const [showPaywallForm, setShowPaywallForm] = useState(false);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showJourneyStories, setShowJourneyStories] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const { user, incrementReadingCount, tier, isGuest } = useAuth();
    const { isPortuguese: langIsPortuguese } = useLanguage();
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('premium');
    const [whatsappSubscribed, setWhatsappSubscribed] = useState(false);

    // Carregar status da inscrição do WhatsApp
    useEffect(() => {
        const loadWhatsAppStatus = async () => {
            if (!user) {
                setWhatsappSubscribed(false);
                return;
            }

            try {
                const { supabase } = await import('./lib/supabase');
                if (!supabase) return;

                const { data } = await (supabase as any)
                    .from('whatsapp_subscriptions')
                    .select('is_active')
                    .eq('user_id', user.id)
                    .single();

                setWhatsappSubscribed(data?.is_active || false);
            } catch (err) {
                console.error('Error loading WhatsApp status:', err);
            }
        };

        loadWhatsAppStatus();
    }, [user]);

    // Carta do dia coletiva - mesma para todos no dia
    const getDailyCard = () => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        const cardIndex = dayOfYear % TAROT_CARDS.length;
        return TAROT_CARDS[cardIndex];
    };

    const dailyCard = getDailyCard();
    const cardName = getCardName(dailyCard.id, isPortuguese);

    const handleSelectSpread = async (spread: Spread) => {
        // Navigate directly to session, paywall check moved to first card click
        navigate('/session', { state: { spread } });
    };

    const spreadIcons: Record<string, string> = {
        'three_card': 'token',
        'celtic_cross': 'grid_view',
        'love_check': 'favorite',
        'yes_no': 'help',
        'card_of_day': 'wb_sunny',
    };

    const getSpreadTranslation = (spreadId: string) => {
        switch (spreadId) {
            case 'three_card': return t.spreads.threeCard;
            case 'celtic_cross': return t.spreads.celticCross;
            case 'love_check': return t.spreads.loveRelationship;
            case 'yes_no': return t.spreads.yesNo;
            case 'card_of_day': return t.spreads.cardOfDay;
            default: return { name: '', description: '', difficulty: '' };
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{
            backgroundColor: '#1a1628',
            backgroundAttachment: 'fixed'
        }}>
            <Header />
            <CartDrawer />

            {/* <MinimalStarsBackground /> */}

            {/* Hero Section - Editorial Premium */}
            <section className="relative z-10 min-h-[90vh] flex items-center justify-center overflow-hidden py-16">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes rotate-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes rotate-reverse {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(-360deg); }
                    }
                    @keyframes pulse-subtle {
                        0%, 100% { opacity: 0.4; }
                        50% { opacity: 0.6; }
                    }
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .arcane-ring-outer {
                        animation: rotate-slow 30s linear infinite;
                    }
                    .arcane-ring-middle {
                        animation: rotate-reverse 25s linear infinite;
                    }
                    .arcane-ring-inner {
                        animation: rotate-slow 20s linear infinite;
                    }
                    .arcane-center {
                        animation: pulse-subtle 4s ease-in-out infinite;
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.6s ease-out forwards;
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
                    .text-gradient-gold {
                        background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                `}} />

                <div className="relative z-10 max-w-[1200px] mx-auto px-8 lg:px-12 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                        {/* Left Column - Content (Mobile: appears after orbit) */}
                        <div className="space-y-8 lg:pr-8 order-2 lg:order-1 text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-gradient-gold w-full" style={{ fontFamily: "'Crimson Text', serif" }}>
                                {isPortuguese ? 'Observe o que se revela no Tarot' : 'Discover what the Tarot reveals'}
                            </h1>

                            <p className="text-sm sm:text-base md:text-lg text-gray-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
                                {isPortuguese
                                    ? 'Um Tarot digital para registrar padrões, refletir escolhas e acompanhar sua jornada simbólica.'
                                    : 'A digital Tarot to record patterns, reflect on choices, and track your symbolic journey.'}
                            </p>

                            <div className="flex md:flex-row gap-4 pt-4 justify-center lg:justify-start items-center lg:items-start">
                                <button
                                    onClick={() => handleSelectSpread(SPREADS[0])}
                                    className="group relative px-12 py-3 min-w-[200px] bg-purple-600 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(123,82,171,0.3)] transition-all hover:shadow-[0_0_30px_rgba(123,82,171,0.6)] hover:-translate-y-1 text-xs"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                                    <span className="relative z-10 text-white font-bold tracking-wide flex items-center justify-center gap-2">
                                        {isPortuguese ? 'Abrir Tarot' : 'Open Tarot'}
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')}
                                    className="group px-6 py-3 bg-transparent border border-yellow-500/40 rounded-lg transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:-translate-y-1 text-xs"
                                >
                                    <span className="text-yellow-300 font-medium tracking-wide flex items-center justify-center gap-2 group-hover:text-yellow-400">
                                        {isPortuguese ? 'Explorar o Arquivo Arcano' : 'Explore the Arcane Archive'}
                                        <span className="material-symbols-outlined text-sm">style</span>
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Arcane Symbol (Mobile: appears first) */}
                        <div className="flex items-center justify-center md:justify-center lg:justify-end order-1 lg:order-2 pr-0 lg:pr-12">
                            <div className="relative w-[300px] h-[300px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] lg:w-[440px] lg:h-[440px]">
                                {/* Outer Ring */}
                                <svg className="arcane-ring-outer absolute inset-0 w-full h-full" viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="220" cy="220" r="200" stroke="rgba(135, 95, 175, 0.45)" strokeWidth="1" fill="none" />
                                    <circle cx="220" cy="40" r="3" fill="rgba(135, 95, 175, 0.7)" />
                                    <circle cx="220" cy="400" r="3" fill="rgba(135, 95, 175, 0.7)" />
                                    <circle cx="40" cy="220" r="3" fill="rgba(135, 95, 175, 0.7)" />
                                    <circle cx="400" cy="220" r="3" fill="rgba(135, 95, 175, 0.7)" />
                                    <path d="M 220,20 L 220,50" stroke="rgba(135, 95, 175, 0.6)" strokeWidth="1" />
                                    <path d="M 220,390 L 220,420" stroke="rgba(135, 95, 175, 0.6)" strokeWidth="1" />
                                    <path d="M 20,220 L 50,220" stroke="rgba(135, 95, 175, 0.6)" strokeWidth="1" />
                                    <path d="M 390,220 L 420,220" stroke="rgba(135, 95, 175, 0.6)" strokeWidth="1" />
                                </svg>

                                {/* Middle Ring */}
                                <svg className="arcane-ring-middle absolute inset-0 w-full h-full" viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="220" cy="220" r="140" stroke="rgba(135, 95, 175, 0.38)" strokeWidth="1" fill="none" />
                                    <circle cx="220" cy="80" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
                                    <circle cx="220" cy="360" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
                                    <circle cx="80" cy="220" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
                                    <circle cx="360" cy="220" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
                                    <circle cx="130" cy="130" r="2" fill="rgba(135, 95, 175, 0.55)" />
                                    <circle cx="310" cy="130" r="2" fill="rgba(135, 95, 175, 0.55)" />
                                    <circle cx="130" cy="310" r="2" fill="rgba(135, 95, 175, 0.55)" />
                                    <circle cx="310" cy="310" r="2" fill="rgba(135, 95, 175, 0.55)" />
                                </svg>

                                {/* Inner Ring */}
                                <svg className="arcane-ring-inner absolute inset-0 w-full h-full" viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="220" cy="220" r="80" stroke="rgba(135, 95, 175, 0.5)" strokeWidth="1.5" fill="none" />
                                </svg>

                                {/* Center Symbol */}
                                <div className="arcane-center absolute inset-0 flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="6" cy="6" r="4" fill="rgba(135, 95, 175, 0.5)" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Interactive Stats Banner */}
            <section className="mt-24 md:mt-32 py-3 md:py-4 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute inset-0 border-y border-transparent"></div>
                {/* Glassmorphism background */}
                <div className="absolute inset-0 z-0 bg-white/10 backdrop-blur-sm border border-white/10" style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.01)' }}></div>
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 md:gap-8">
                        <div className="text-center group">
                            <div className="text-2xl md:text-3xl font-bold text-gradient-gold mb-0.5 transition-transform duration-300 group-hover:scale-110" style={{ fontFamily: "'Crimson Text', serif" }}>
                                1.247
                            </div>
                            <div className="text-gray-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm">{isPortuguese ? 'Jornadas Ativas' : 'Active Journeys'}</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-2xl md:text-3xl font-bold text-gradient-gold mb-0.5 transition-transform duration-300 group-hover:scale-110" style={{ fontFamily: "'Crimson Text', serif" }}>
                                8.432
                            </div>
                            <div className="text-gray-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm">{isPortuguese ? 'Leituras Realizadas' : 'Readings Performed'}</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-2xl md:text-3xl font-bold text-gradient-gold mb-0.5 transition-transform duration-300 group-hover:scale-110" style={{ fontFamily: "'Crimson Text', serif" }}>
                                78
                            </div>
                            <div className="text-gray-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm">{isPortuguese ? 'Arcanos Disponíveis' : 'Available Arcana'}</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-2xl md:text-3xl font-bold text-gradient-gold mb-0.5 transition-transform duration-300 group-hover:scale-110" style={{ fontFamily: "'Crimson Text', serif" }}>
                                24/7
                            </div>
                            <div className="text-gray-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm">{isPortuguese ? 'Disponível Sempre' : 'Always Available'}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spread Selection - Premium Cards Style */}
            <section id="spreads" className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 relative">
                <div className="max-w-[1200px] mx-auto relative">
                    {/* Cosmic Flame Background - Positioned lower */}
                    <div className="absolute -right-40 top-20 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-3xl pointer-events-none"></div>
                    <div className="absolute -right-32 top-32 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-pink-500/15 to-transparent blur-3xl pointer-events-none"></div>

                    {/* Subtle Star Dots */}
                    <div className="absolute top-12 left-8 w-1 h-1 rounded-full bg-white/40 pointer-events-none"></div>
                    <div className="absolute top-24 right-12 w-1 h-1 rounded-full bg-white/35 pointer-events-none"></div>
                    <div className="absolute bottom-32 left-1/4 w-1 h-1 rounded-full bg-white/38 pointer-events-none"></div>
                    <div className="absolute top-32 right-1/3 w-1 h-1 rounded-full bg-white/32 pointer-events-none"></div>
                    <div className="absolute bottom-20 right-20 w-1 h-1 rounded-full bg-white/40 pointer-events-none"></div>
                    <div className="absolute top-40 left-1/2 w-1 h-1 rounded-full bg-white/30 pointer-events-none"></div>
                    <div className="absolute bottom-40 left-12 w-1 h-1 rounded-full bg-white/35 pointer-events-none"></div>
                    <div className="absolute top-48 right-1/4 w-1 h-1 rounded-full bg-white/33 pointer-events-none"></div>
                    <div className="absolute bottom-16 left-2/3 w-1 h-1 rounded-full bg-white/38 pointer-events-none"></div>
                    <div className="absolute top-20 left-1/3 w-1 h-1 rounded-full bg-white/36 pointer-events-none"></div>
                    <div className="absolute bottom-28 right-1/2 w-1 h-1 rounded-full bg-white/34 pointer-events-none"></div>
                    <div className="absolute top-56 right-8 w-1 h-1 rounded-full bg-white/32 pointer-events-none"></div>
                    <div className="absolute top-16 right-1/2 w-1 h-1 rounded-full bg-white/37 pointer-events-none"></div>
                    <div className="absolute bottom-24 left-1/3 w-1 h-1 rounded-full bg-white/31 pointer-events-none"></div>
                    <div className="absolute top-36 left-1/4 w-1 h-1 rounded-full bg-white/39 pointer-events-none"></div>
                    <div className="absolute bottom-36 right-1/4 w-1 h-1 rounded-full bg-white/35 pointer-events-none"></div>
                    <div className="absolute top-44 right-40 w-1 h-1 rounded-full bg-white/33 pointer-events-none"></div>
                    <div className="absolute bottom-12 left-1/2 w-1 h-1 rounded-full bg-white/37 pointer-events-none"></div>
                    <div className="absolute top-28 left-2/3 w-1 h-1 rounded-full bg-white/34 pointer-events-none"></div>
                    <div className="absolute bottom-44 right-1/3 w-1 h-1 rounded-full bg-white/36 pointer-events-none"></div>
                    <div className="absolute top-52 left-1/2 w-1 h-1 rounded-full bg-white/32 pointer-events-none"></div>
                    <div className="absolute bottom-8 right-1/3 w-1 h-1 rounded-full bg-white/38 pointer-events-none"></div>
                    <div className="absolute top-14 right-1/4 w-1 h-1 rounded-full bg-white/35 pointer-events-none"></div>
                    <div className="absolute bottom-48 left-1/2 w-1 h-1 rounded-full bg-white/33 pointer-events-none"></div>

                    <div className="text-center md:text-left mb-10 md:mb-14 px-2">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gradient-gold mb-4 tracking-tight leading-tight" style={{ fontFamily: "'Crimson Text', serif" }}>{t.home.chooseReading}</h2>
                        <p className="text-gray-400 text-lg md:text-xl max-w-xl font-light" style={{ fontFamily: "'Inter', sans-serif" }}>{t.home.chooseReadingSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-2 relative z-10">
                        {SPREADS.map((spread) => {
                            const translation = getSpreadTranslation(spread.id);
                            const spreadImages: Record<string, string> = {
                                'three_card': '/images/spreads/three_card.png',
                                'celtic_cross': '/images/spreads/celtic_cross.png',
                                'love_check': '/images/spreads/love_check.png',
                                'yes_no': '/images/spreads/yes_no.png',
                                'card_of_day': '/images/spreads/card_of_day.png',
                            };
                            return (
                                <div
                                    key={spread.id}
                                    onClick={() => handleSelectSpread(spread)}
                                    className="group relative flex flex-col h-[300px] md:h-[340px] rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition-transform duration-500 hover:-translate-y-1 border border-[#875faf]/30 hover:border-[#a77fd4]/60"
                                >
                                    {/* Background Image with subtle Zoom */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${spreadImages[spread.id]}')` }}
                                    />

                                    {/* Gradient Overlay - Dark red to purple */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d14] via-[#1a0f1e]/90 to-transparent group-hover:via-[#1a0f1e]/70 transition-colors duration-500" />

                                    {/* Content */}
                                    <div className="relative z-10 mt-auto p-6 md:p-8 flex flex-col justify-end">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-[#875faf] to-[#a77fd4] backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-lg shadow-purple-900/30">
                                                    {spread.cardCount} {isPortuguese ? 'cartas' : 'cards'}
                                                </span>
                                            </div>

                                            <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                                                {translation.name}
                                            </h3>

                                            <p className="text-gray-300 text-sm md:text-base leading-relaxed opacity-90">
                                                {translation.description}
                                            </p>

                                            <div className="mt-3 flex items-center text-[#a77fd4] group-hover:text-white text-sm font-bold uppercase tracking-[0.15em] transition-colors">
                                                {t.home.start}
                                                <span className="material-symbols-outlined text-[18px] ml-2 transform group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Presentation Section */}
            <section className="relative z-10 py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-background-dark via-purple-950/5 to-background-dark overflow-hidden">
                {/* Decorative Stars */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Around Image - Top */}
                    <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-50" style={{ top: '24%', left: '25%' }}></div>
                    <div className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-45" style={{ top: '26%', left: '30%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60" style={{ top: '22%', left: '35%' }}></div>

                    {/* Around Image - Bottom */}
                    <div className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-55" style={{ top: '62%', left: '26%' }}></div>
                    <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-40" style={{ top: '65%', left: '32%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-50" style={{ top: '60%', left: '38%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60" style={{ top: '68%', left: '25%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-50" style={{ top: '70%', left: '31%' }}></div>
                    <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-45" style={{ top: '72%', left: '36%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-55" style={{ top: '76%', left: '28%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-50" style={{ top: '78%', left: '33%' }}></div>
                    <div className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-40" style={{ top: '80%', left: '27%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60" style={{ top: '84%', left: '30%' }}></div>
                    <div className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-50" style={{ top: '86%', left: '35%' }}></div>
                    <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-45" style={{ top: '88%', left: '26%' }}></div>
                </div>
                <div className="max-w-[1400px] mx-auto relative z-10">
                    {/* Header - Above Grid */}
                    <header className="space-y-4 mb-6 lg:mb-8 md:text-left px-2">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gradient-gold tracking-tight leading-tight" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {isPortuguese ? 'Descubra o Poder do Tarot' : 'Discover the Power of Tarot'}
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {isPortuguese
                                ? 'Uma experiência completa de autoconhecimento com tecnologia e sabedoria ancestral'
                                : 'A complete self-discovery experience with technology and ancestral wisdom'}
                        </p>
                    </header>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-start">

                        {/* LEFT COLUMN - Banner Image */}
                        <div className="flex justify-center items-center order-1 lg:order-1 min-h-[450px] lg:min-h-[520px] mt-6 md:mt-8 lg:mt-16 -translate-y-4 md:-translate-y-6 lg:-translate-y-10 relative overflow-visible mb-10 md:mb-16 lg:mb-0">
                            {/* Cosmic Flame Background - Golden */}
                            <div className="absolute inset-0 flex justify-center items-center pointer-events-none -inset-20">
                                <div className="absolute w-[300px] lg:w-[480px] h-[300px] lg:h-[480px] bg-gradient-to-r from-yellow-600/30 via-amber-500/25 to-yellow-400/15 rounded-full blur-3xl" style={{ marginTop: '80px' }}></div>
                                <div className="absolute w-[200px] lg:w-[320px] h-[200px] lg:h-[320px] bg-gradient-to-t from-amber-500/25 via-yellow-500/15 to-transparent rounded-full blur-2xl" style={{ marginTop: '100px' }}></div>
                            </div>
                            <div className="w-full max-w-2xl relative z-10">
                                <div className="border-2 border-yellow-500 rounded-lg overflow-hidden">
                                    <img
                                        src="/banner_1.png"
                                        alt="Tarot Banner"
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Content */}
                        <div className="flex flex-col space-y-8 order-2 lg:order-2 mt-16 md:mt-8 lg:mt-16 -translate-y-24 md:-translate-y-4 lg:translate-y-0">
                            {/* Features Grid - 2 columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-[#1a1230]/75 to-[#12091a]/75 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-5 flex flex-col">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="material-symbols-outlined text-yellow-500 text-lg flex-shrink-0">all_inclusive</span>
                                        <h3 className="text-white text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Tiragens Ilimitadas' : 'Unlimited Readings'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-100 text-sm leading-relaxed font-light">
                                        {isPortuguese
                                            ? 'Realize quantas tiragens desejar, sem restrições'
                                            : 'Perform as many readings as you wish'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#1a1230]/75 to-[#12091a]/75 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-5 flex flex-col">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="material-symbols-outlined text-yellow-500 text-lg flex-shrink-0">psychology</span>
                                        <h3 className="text-white text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Síntese com IA' : 'AI Synthesis'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-100 text-sm leading-relaxed font-light">
                                        {isPortuguese
                                            ? 'Interpretações profundas com IA avançada'
                                            : 'Deep interpretations with advanced AI'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#1a1230]/75 to-[#12091a]/75 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-5 flex flex-col">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="material-symbols-outlined text-yellow-500 text-lg flex-shrink-0">collections_bookmark</span>
                                        <h3 className="text-white text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Biblioteca Completa' : 'Complete Library'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-100 text-sm leading-relaxed font-light">
                                        {isPortuguese
                                            ? '78 cartas com ilustrações originais'
                                            : '78 cards with original illustrations'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#1a1230]/75 to-[#12091a]/75 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-5 flex flex-col">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="material-symbols-outlined text-yellow-500 text-lg flex-shrink-0">chat</span>
                                        <h3 className="text-white text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Carta do Dia' : 'Daily Card'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-100 text-sm leading-relaxed font-light">
                                        {isPortuguese
                                            ? 'Mensagens no WhatsApp diariamente'
                                            : 'Daily WhatsApp messages'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#1a1230]/75 to-[#12091a]/75 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-5 flex flex-col">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="material-symbols-outlined text-yellow-500 text-lg flex-shrink-0">history</span>
                                        <h3 className="text-white text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Histórico' : 'History'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-100 text-sm leading-relaxed font-light">
                                        {isPortuguese
                                            ? 'Acompanhe sua jornada espiritual'
                                            : 'Track your spiritual journey'}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#1a1230]/75 to-[#12091a]/75 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-5 flex flex-col">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="material-symbols-outlined text-yellow-500 text-lg flex-shrink-0">diamond</span>
                                        <h3 className="text-white text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                            {isPortuguese ? 'Premium' : 'Premium'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-100 text-sm leading-relaxed font-light">
                                        {isPortuguese
                                            ? 'Recursos exclusivos e premium'
                                            : 'Exclusive premium features'}
                                    </p>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-6 pt-4 w-full">
                                <button
                                    onClick={() => { navigate('/spreads'); window.scrollTo(0, 0); }}
                                    className="group relative w-full px-8 py-3.5 bg-purple-600 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(123,82,171,0.3)] transition-all hover:shadow-[0_0_30px_rgba(123,82,171,0.6)] hover:-translate-y-1"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                                    <span className="relative z-10 text-white font-bold tracking-wide flex items-center justify-center gap-2 text-sm">
                                        {isPortuguese ? 'Acessar o Tarot' : 'Access Tarot'}
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                </button>
                                {isGuest && (
                                    <button
                                        onClick={() => { setAuthModalMode('register'); setShowAuthModal(true); }}
                                        className="group w-full px-8 py-3.5 bg-transparent border border-yellow-500/40 rounded-lg transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:-translate-y-1"
                                    >
                                        <span className="text-yellow-300 font-medium tracking-wide flex items-center justify-center gap-2 group-hover:text-yellow-400 text-sm">
                                            {isPortuguese ? 'Criar Conta' : 'Create Account'}
                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                        </span>
                                    </button>
                                )}
                                {!isGuest && tier === 'free' && (
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="group w-full px-8 py-3.5 bg-transparent border border-yellow-500/40 rounded-lg transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:-translate-y-1"
                                    >
                                        <span className="text-yellow-300 font-medium tracking-wide flex items-center justify-center gap-2 group-hover:text-yellow-400 text-sm">
                                            {isPortuguese ? 'Assinar Premium' : 'Subscribe Premium'}
                                            <span className="material-symbols-outlined text-sm">star</span>
                                        </span>
                                    </button>
                                )}
                                {!isGuest && tier !== 'free' && (
                                    <button
                                        onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
                                        className="group w-full px-8 py-3.5 bg-transparent border border-yellow-500/40 rounded-lg transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:-translate-y-1"
                                    >
                                        <span className="text-yellow-300 font-medium tracking-wide flex items-center justify-center gap-2 group-hover:text-yellow-400 text-sm">
                                            {isPortuguese ? 'Assinar Premium' : 'Subscribe Premium'}
                                            <span className="material-symbols-outlined text-sm">star</span>
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WhatsApp Daily Card Subscription Section */}
            <section className="relative z-10 py-20 md:py-28 px-4 md:px-6 bg-gradient-to-b from-background-dark via-purple-950/5 to-background-dark pb-32 md:pb-48 lg:pb-64">
                <style>{`
                    .home-glass-card {
                        background: rgba(255, 255, 255, 0.04);
                        backdrop-filter: blur(24px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .home-glow-border:focus-within {
                        border-color: #A855F7;
                        box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
                    }
                    .home-frequency-card input:checked + div {
                        border-color: #A855F7;
                        background: rgba(168, 85, 247, 0.15);
                        box-shadow: 0 0 25px rgba(168, 85, 247, 0.25);
                    }
                    .text-gradient-gold-home {
                        background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                `}</style>

                <div className="max-w-6xl mx-auto">
                    {/* Feature Presentation Header */}
                    <div className="text-left mb-14 md:mb-20 px-2">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gradient-gold-home mb-6 tracking-tight leading-tight" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {isPortuguese ? 'Carta do Dia no WhatsApp' : 'Daily Card on WhatsApp'}
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {isPortuguese
                                ? 'Receba diariamente uma mensagem personalizada com orientações do tarot diretamente no seu celular.'
                                : 'Receive daily personalized tarot guidance messages directly on your phone.'}
                        </p>
                    </div>

                    {/* Form Card + Feature Circles */}
                    <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 lg:gap-10 relative">
                        {/* Cosmic Flame Background - menos intenso e mais baixo */}
                        <div className="absolute -left-40 -top-36 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-500/15 to-transparent blur-3xl pointer-events-none"></div>
                        <div className="absolute -left-32 -top-28 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-pink-500/11 to-transparent blur-3xl pointer-events-none"></div>

                        {/* Form Card - Left Side */}
                        <div className="home-glass-card w-full lg:flex-1 rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] relative flex flex-col lg:flex-row items-stretch">
                            {/* Form Content */}
                            <div className="flex-1 p-6 lg:p-12 order-2 lg:order-1">
                                <header className="mb-6 text-center lg:text-left">
                                    <h3 className="font-display text-2xl md:text-3xl text-white mb-4 leading-tight">
                                        {isPortuguese ? 'Cadastre-se Agora' : 'Sign Up Now'}
                                    </h3>
                                    <p className="text-gray-400 text-sm max-w-lg">
                                        {isPortuguese
                                            ? 'Preencha seus dados e comece a receber orientações místicas.'
                                            : 'Fill in your details and start receiving mystic guidance.'}
                                    </p>
                                </header>

                                <form action="#" className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-semibold text-gray-400 ml-1 uppercase tracking-widest">
                                                {isPortuguese ? 'Nome Completo' : 'Full Name'}
                                            </label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors text-lg">person</span>
                                                <input
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-0 focus:outline-none home-glow-border transition-all text-white placeholder:text-gray-600 text-sm"
                                                    placeholder={isPortuguese ? 'Seu nome' : 'Your name'}
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-semibold text-gray-400 ml-1 uppercase tracking-widest">WhatsApp</label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 border-r border-white/10 pr-2">
                                                    <img alt="Brasil Flag" className="w-4 h-auto rounded-sm opacity-80" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/32px-Flag_of_Brazil.svg.png" />
                                                </div>
                                                <input
                                                    className="w-full pl-14 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-0 focus:outline-none home-glow-border transition-all text-white placeholder:text-gray-600 text-sm"
                                                    placeholder="+55 (00) 00000-0000"
                                                    type="tel"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-gray-400 ml-1 uppercase tracking-widest">
                                            {isPortuguese ? 'Estado' : 'State'}
                                        </label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors text-lg">location_on</span>
                                            <select
                                                className="w-full pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-0 focus:outline-none home-glow-border transition-all text-white appearance-none cursor-pointer text-sm"
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
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-lg">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-gray-400 ml-1 uppercase tracking-widest">
                                            {isPortuguese ? 'Melhor Período' : 'Best Period'}
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <label className="home-frequency-card cursor-pointer group">
                                                <input defaultChecked className="hidden" name="home-freq" type="radio" value="manha" />
                                                <div className="home-glass-card flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                    <span className="material-symbols-outlined text-lg mb-1 text-yellow-500 group-hover:scale-110 transition-transform">sunny</span>
                                                    <span className="text-[9px] font-bold text-gray-200 uppercase tracking-wider">
                                                        {isPortuguese ? 'Manhã' : 'Morning'}
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="home-frequency-card cursor-pointer group">
                                                <input className="hidden" name="home-freq" type="radio" value="tarde" />
                                                <div className="home-glass-card flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                    <span className="material-symbols-outlined text-lg mb-1 text-primary group-hover:scale-110 transition-transform">routine</span>
                                                    <span className="text-[9px] font-bold text-gray-200 uppercase tracking-wider">
                                                        {isPortuguese ? 'Tarde' : 'Afternoon'}
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="home-frequency-card cursor-pointer group">
                                                <input className="hidden" name="home-freq" type="radio" value="noite" />
                                                <div className="home-glass-card flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                                                    <span className="material-symbols-outlined text-lg mb-1 text-blue-400 group-hover:scale-110 transition-transform">nightlight</span>
                                                    <span className="text-[9px] font-bold text-gray-200 uppercase tracking-wider">
                                                        {isPortuguese ? 'Noite' : 'Night'}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-start gap-2.5 cursor-pointer group">
                                            <div className="relative flex-shrink-0 mt-0.5">
                                                <input type="checkbox" className="peer sr-only" required />
                                                <div className="w-4 h-4 rounded border-2 border-white/20 bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center group-hover:border-primary/50">
                                                    <span className="material-symbols-outlined text-white opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontSize: '12px' }}>check</span>
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                                {isPortuguese
                                                    ? 'Concordo em receber mensagens via WhatsApp.'
                                                    : 'I agree to receive messages via WhatsApp.'}
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();

                                                // Usuários FREE: mostrar modal de upgrade para premium
                                                if (tier === 'free') {
                                                    setShowPaywallForm(true);
                                                    return;
                                                }

                                                // Usuários PREMIUM: abrir modal de configuração do WhatsApp
                                                if (tier === 'premium') {
                                                    setShowWhatsAppModal(true);
                                                    return;
                                                }

                                                // Guests/não logados: criar conta
                                                setShowPaywallForm(true);
                                            }}
                                            className="w-full sm:w-auto flex-1 relative group overflow-hidden bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-[0.98]"
                                            type="button"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                                {tier === 'premium'
                                                    ? (whatsappSubscribed
                                                        ? (isPortuguese ? 'Inscrito' : 'Subscribed')
                                                        : (isPortuguese ? 'Não Cadastrado' : 'Not Registered'))
                                                    : (isPortuguese ? 'Começar a Receber' : 'Start Receiving')}
                                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                                                    {tier === 'premium' ? 'settings' : 'arrow_forward'}
                                                </span>
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </button>
                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 uppercase tracking-[0.15em]">
                                            <span className="material-symbols-outlined text-[12px]">lock</span>
                                            <p>{isPortuguese ? 'Dados protegidos' : 'Protected data'}</p>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* iPhone Mockup - WhatsApp Style */}
                            <div className="lg:w-[380px] bg-white/[0.02] border-l border-white/5 flex items-center justify-center p-3 sm:p-6 lg:p-10 order-1 lg:order-2 relative overflow-hidden">
                                <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                                <div className="relative z-10">
                                    {/* iPhone Frame */}
                                    <div className="relative w-[140px] sm:w-[180px] md:w-[220px] h-[295px] sm:h-[380px] md:h-[460px] bg-black rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-[5px] sm:p-[6px] lg:p-[8px] shadow-[0_0_50px_rgba(168,85,247,0.25),0_20px_40px_rgba(0,0,0,0.5)]">
                                        {/* Dynamic Island */}
                                        <div className="absolute top-1 sm:top-1.5 md:top-2 left-1/2 -translate-x-1/2 w-12 sm:w-16 md:w-20 h-2.5 sm:h-3.5 md:h-5 bg-black rounded-full z-10"></div>

                                        {/* Screen */}
                                        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-[#0b141a] flex flex-col">
                                            {/* Status Bar */}
                                            <div className="h-6 bg-[#0b141a] flex items-center justify-between px-4 pt-1 flex-shrink-0">
                                                <span className="text-white text-[9px] font-semibold">9:41</span>
                                                <div className="flex items-center gap-[2px] sm:gap-[3px]">
                                                    <svg className="w-[9px] sm:w-[12px] h-[7px] sm:h-[9px] text-white" viewBox="0 0 18 12" fill="currentColor">
                                                        <rect x="0" y="8" width="3" height="4" rx="0.5" />
                                                        <rect x="4" y="5" width="3" height="7" rx="0.5" />
                                                        <rect x="8" y="2" width="3" height="10" rx="0.5" />
                                                        <rect x="12" y="0" width="3" height="12" rx="0.5" />
                                                    </svg>
                                                    <div className="flex items-center">
                                                        <div className="w-[16px] sm:w-[20px] h-[7px] sm:h-[9px] border border-white rounded-[2px] flex items-center p-[1px]">
                                                            <div className="w-[10px] sm:w-[14px] h-[3px] sm:h-[5px] bg-white rounded-[1px]"></div>
                                                        </div>
                                                        <div className="w-[1px] h-[2px] sm:h-[3px] bg-white rounded-r ml-[1px]"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* WhatsApp Header */}
                                            <div className="bg-[#1f2c34] px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                                <svg className="w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                <div className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-[6px] sm:text-[8px] md:text-[10px]">auto_awesome</span>
                                                </div>
                                                <div className="flex-1 ml-0.5 sm:ml-1">
                                                    <h4 className="text-white text-[7px] sm:text-[9px] md:text-[10px] font-medium leading-tight">Mystic Tarot</h4>
                                                    <p className="text-emerald-400 text-[6px] sm:text-[7px] md:text-[8px]">online</p>
                                                </div>
                                                <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
                                                    <svg className="w-1.5 sm:w-2 md:w-3 h-1.5 sm:h-2 md:h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17 12c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm3 7h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2zM18 6c0-1.1-.9-2-2-2H8C5.79 4 4 5.79 4 8v10c0 1.1.9 2 2 2h5c0-.73.1-1.43.28-2.1-.34.06-.69.1-1.05.1-2.79 0-5.06-2.27-5.06-5.06 0-1.51.66-2.86 1.71-3.78L12 3.97l5.12 5.19c.5.44.88 1 1.09 1.62.55-.5 1.17-.91 1.85-1.22C20.02 8.42 20 7.22 20 6h-2z" />
                                                    </svg>
                                                    <svg className="w-1.5 sm:w-2 md:w-3 h-1.5 sm:h-2 md:h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Chat Background Pattern - flex-1 to fill remaining space */}
                                            <div className="flex-1 relative overflow-hidden" style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                                backgroundColor: '#0b141a'
                                            }}>
                                                <div className="absolute inset-0 p-1.5 sm:p-2 overflow-hidden flex flex-col items-start">
                                                    {/* Message Bubble - Vertical Layout */}
                                                    <div className="max-w-[95%] bg-[#1f2c34] rounded-lg rounded-tl-none shadow-lg overflow-hidden">
                                                        {/* Card Image - Smaller */}
                                                        <div className="p-1 sm:p-1.5 md:p-2">
                                                            <div className="relative rounded-md overflow-hidden">
                                                                <img
                                                                    alt="Sacerdotisa"
                                                                    className="w-16 sm:w-24 md:w-32 h-20 sm:h-32 md:h-44 object-cover object-center"
                                                                    src="/sarcedo.jpg"
                                                                    onError={handleImageError}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Message Text - Below Image */}
                                                        <div className="px-1 sm:px-1.5 md:px-2 pb-1 sm:pb-1.5 md:pb-2">
                                                            <p className="text-white/90 text-[5px] sm:text-[6px] md:text-[8px] leading-relaxed font-normal">
                                                                <span className="font-semibold text-yellow-400 text-[6px] sm:text-[7px] md:text-[9px]">{cardName}</span>
                                                                <br /><br />
                                                                {isPortuguese
                                                                    ? 'Bom dia! Sua carta de hoje traz uma mensagem especial sobre novos caminhos.'
                                                                    : 'Good morning! Your card today brings a special message about new paths.'}
                                                            </p>
                                                            <div className="flex items-center justify-end gap-0.5 mt-0.5">
                                                                <span className="text-[3px] md:text-[7px] text-gray-400">08:00</span>
                                                                <svg className="w-1 md:w-3 h-1 md:h-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Input Bar - at very bottom */}
                                            <div className="bg-[#1f2c34] px-1.5 py-1.5 sm:px-2 sm:py-1.5 md:px-2 md:py-1.5 flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                                                <svg className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                                </svg>
                                                <div className="flex-1 bg-[#2a3942] rounded-full h-5 sm:h-6 md:h-7 px-2 sm:px-2.5 md:px-3 flex items-center min-w-0">
                                                    <span className="text-gray-500 text-[6px] sm:text-[8px] md:text-[10px] truncate">
                                                        {isPortuguese ? 'Mensagem' : 'Message'}
                                                    </span>
                                                </div>
                                                <svg className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Home Indicator */}
                                        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 text-primary/20 block md:block">
                                    <span className="material-symbols-outlined text-3xl sm:text-4xl md:text-5xl">stars</span>
                                </div>
                                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 text-yellow-500/20 block md:block">
                                    <span className="material-symbols-outlined text-4xl sm:text-5xl md:text-6xl">auto_awesome</span>
                                </div>
                            </div>
                        </div>

                        {/* Circular Cards - Right Side */}
                        <div className="hidden lg:flex flex-col items-center gap-4 md:gap-5 lg:gap-6 mt-12 lg:mt-20">
                            {/* Card 1 - Circular */}
                            <div className="flex flex-col items-center gap-3 group">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#1a1230]/60 to-[#12091a]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/20 group-hover:scale-105">
                                    <span className="material-symbols-outlined text-yellow-500 text-3xl">auto_awesome</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white text-xs md:text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                        {isPortuguese ? 'Personalizada' : 'Personalized'}
                                    </h3>
                                </div>
                            </div>

                            {/* Card 2 - Circular */}
                            <div className="flex flex-col items-center gap-3 group">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#1a1230]/60 to-[#12091a]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/20 group-hover:scale-105">
                                    <span className="material-symbols-outlined text-yellow-500 text-3xl">schedule</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white text-xs md:text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                        {isPortuguese ? 'Horário Ideal' : 'Ideal Time'}
                                    </h3>
                                </div>
                            </div>

                            {/* Card 3 - Circular */}
                            <div className="flex flex-col items-center gap-3 group">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#1a1230]/60 to-[#12091a]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/20 group-hover:scale-105">
                                    <span className="material-symbols-outlined text-yellow-500 text-3xl">chat</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white text-xs md:text-sm font-medium tracking-wider uppercase opacity-90" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                        {isPortuguese ? 'WhatsApp' : 'WhatsApp'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Journey Section - A Jornada do Herói */}
            <div className="relative">
                <JourneySection
                    onStartReading={() => handleSelectSpread(SPREADS[0])}
                    onOpenAuthModal={() => setShowAuthModal(true)}
                    showJourneyButton={!showJourneyStories}
                    onToggleJourney={() => setShowJourneyStories(true)}
                />

                {/* Sessão interativa de histórias da jornada */}
                {showJourneyStories && <HeroJourneyStories />}
            </div>

            {/* Cosmic Mandala Animation Section - HIDDEN (kept for future use) */}
            <div style={{ display: 'none' }}>
                <section className="relative z-10 py-12 md:py-20 px-4 md:px-6 bg-gradient-to-b from-background-dark via-purple-950/20 to-background-dark">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="text-center md:text-left mb-10 md:mb-14 px-2">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: "'Crimson Text', serif" }}>{isPortuguese ? 'Calendário Lunar' : 'Lunar Calendar'}</h2>
                            <p className="text-gray-400 text-lg max-w-xl">{isPortuguese ? 'Acompanhe as fases da lua e planeje seus rituais' : 'Track moon phases and plan your rituals'}</p>
                        </div>
                        {(() => {
                            const currentDate = new Date();
                            const cosmicDay = getCosmicDay(currentDate);
                            const { moonPhase, zodiacSun, planetaryRuler, bestFor, bestFor_pt, avoid, avoid_pt } = cosmicDay;

                            const monthNames = isPortuguese
                                ? ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
                                : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

                            // Calendar generation
                            const year = currentDate.getFullYear();
                            const month = currentDate.getMonth();
                            const firstDay = new Date(year, month, 1);
                            const lastDay = new Date(year, month + 1, 0);
                            const daysInMonth = lastDay.getDate();
                            const startingDayOfWeek = firstDay.getDay();

                            const calendarMonthNames = isPortuguese
                                ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
                                : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                            const dayNames = isPortuguese
                                ? ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
                                : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

                            const getMoonPhaseForDay = (day: number) => {
                                const dateToCheck = new Date(year, month, day);
                                const lunarCycle = 29.53;
                                const newMoonDate = new Date(2024, 0, 11);
                                const daysSinceNewMoon = (dateToCheck.getTime() - newMoonDate.getTime()) / (1000 * 60 * 60 * 24);
                                const lunarDay = (daysSinceNewMoon % lunarCycle) / lunarCycle;

                                if (lunarDay < 0.125 || lunarDay > 0.875) return { phase: 'new', icon: '🌑', pt: 'Nova' };
                                if (lunarDay < 0.375) return { phase: 'waxing', icon: '🌒', pt: 'Crescente' };
                                if (lunarDay < 0.625) return { phase: 'full', icon: '🌕', pt: 'Cheia' };
                                return { phase: 'waning', icon: '🌘', pt: 'Minguante' };
                            };

                            // Calculate lunar cycle progress (0-1 = full cycle from new moon)
                            // Cycle: Nova(bottom) → Crescente(right) → Cheia(top) → Minguante(left) → Nova
                            const getLunarCycleProgress = () => {
                                const lunarCycle = 29.53;
                                const newMoonDate = new Date(2024, 0, 11);
                                const daysSinceNewMoon = (currentDate.getTime() - newMoonDate.getTime()) / (1000 * 60 * 60 * 24);
                                const lunarDay = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle / lunarCycle;
                                return lunarDay; // 0 = new moon, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
                            };

                            const lunarCycleProgress = getLunarCycleProgress();

                            const calendarDays = [];
                            for (let i = 0; i < startingDayOfWeek; i++) {
                                calendarDays.push(null);
                            }
                            for (let i = 1; i <= daysInMonth; i++) {
                                calendarDays.push(i);
                            }

                            return (
                                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                                    {/* LEFT: Calendar */}
                                    <div className="mb-12 lg:mb-0">
                                        <div className="glass-widget rounded-2xl p-4 border border-primary/30 text-sm bg-surface-dark/60">
                                            {/* Calendar Header - Month Only */}
                                            <div className="text-center mb-4">
                                                <h3 className="text-base md:text-lg font-bold text-white">{calendarMonthNames[month]} {year}</h3>
                                            </div>

                                            {/* Day Names */}
                                            <div className="grid grid-cols-7 gap-1 mb-3">
                                                {dayNames.map(day => (
                                                    <div key={day} className="text-center text-[10px] font-bold text-[#ad92c9] uppercase tracking-widest py-0.5">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar Days */}
                                            <div className="grid grid-cols-7 gap-1 mb-3">
                                                {calendarDays.map((day, idx) => {
                                                    if (day === null) {
                                                        return <div key={`empty-${idx}`} className="aspect-square"></div>;
                                                    }

                                                    const moonPhaseData = getMoonPhaseForDay(day);
                                                    const isToday = day === currentDate.getDate();
                                                    const isFull = moonPhaseData.phase === 'full';
                                                    const isNew = moonPhaseData.phase === 'new';

                                                    return (
                                                        <div
                                                            key={day}
                                                            className={`aspect-square rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-xs ${isToday
                                                                ? 'bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary'
                                                                : isFull
                                                                    ? 'bg-white/10 hover:bg-white/15'
                                                                    : isNew
                                                                        ? 'bg-zinc-900/40 hover:bg-zinc-800/40'
                                                                        : 'bg-white/5 hover:bg-white/10'
                                                                } group border border-white/10 hover:border-primary/30`}
                                                        >
                                                            <span className="text-base group-hover:scale-110 transition-transform">
                                                                {moonPhaseData.phase === 'full' && '🌕'}
                                                                {moonPhaseData.phase === 'new' && '🌑'}
                                                                {moonPhaseData.phase === 'waxing' && '🌒'}
                                                                {moonPhaseData.phase === 'waning' && '🌘'}
                                                            </span>
                                                            <span className={`text-[8px] font-bold ${isToday ? 'text-white' : 'text-white/70'} group-hover:text-white`}>
                                                                {day}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Legend */}
                                            <div className="pt-2 border-t border-white/10">
                                                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm">🌕</span>
                                                        <span className="text-white/70">{isPortuguese ? 'Cheia' : 'Full'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm">🌑</span>
                                                        <span className="text-white/70">{isPortuguese ? 'Nova' : 'New'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm">🌒</span>
                                                        <span className="text-white/70">{isPortuguese ? 'Cresc.' : 'Wax.'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm">🌘</span>
                                                        <span className="text-white/70">{isPortuguese ? 'Ling.' : 'Wan.'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: Mandala */}
                                    <div className="flex items-center justify-center mt-8 lg:mt-0 lg:pl-8 lg:pt-24">
                                        <style>{`
                                        .cosmic-gradient { background: radial-gradient(circle at center, #2e1a47 0%, #191022 100%); }
                                        .mandala-glow { box-shadow: 0 0 60px 10px rgba(147, 17, 212, 0.3); }
                                        .glass-widget { background: rgba(54, 35, 72, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(173, 146, 201, 0.2); }
                                        .orbit-rotate { animation: spin 120s linear infinite; }
                                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                                        .moon-glow-full { 
                                            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1)) 
                                                   drop-shadow(0 0 40px rgba(255, 255, 255, 0.9)) 
                                                   drop-shadow(0 0 60px rgba(255, 255, 255, 0.6)); 
                                            transform: scale(1.15);
                                        }
                                        .moon-glow-new { 
                                            filter: drop-shadow(0 0 15px rgba(173, 146, 201, 1)) 
                                                   drop-shadow(0 0 30px rgba(173, 146, 201, 0.8)) 
                                                   drop-shadow(0 0 45px rgba(173, 146, 201, 0.5)); 
                                            transform: scale(1.15);
                                        }
                                        .moon-glow-phase { 
                                            filter: drop-shadow(0 0 15px rgba(173, 146, 201, 1)) 
                                                   drop-shadow(0 0 30px rgba(173, 146, 201, 0.9)) 
                                                   drop-shadow(0 0 45px rgba(173, 146, 201, 0.6)); 
                                            transform: scale(1.15);
                                        }
                                    `}</style>

                                        <div className="relative w-full max-w-3xl mx-auto">
                                            {/* Outer Orbits - Responsive */}
                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] max-w-[550px] aspect-square border border-primary/10 rounded-full orbit-rotate"></div>
                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[82vw] sm:w-[75vw] max-w-[460px] aspect-square border border-primary/20 rounded-full border-dashed orbit-rotate" style={{ animationDirection: 'reverse', animationDuration: '180s' }}></div>

                                            {/* The Mandala Body - Responsive */}
                                            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto rounded-full bg-background-dark/60 backdrop-blur-xl border border-white/20 flex items-center justify-center mandala-glow">
                                                {/* Progress Arc - Shows lunar cycle progress from New Moon */}
                                                {/* Cycle: Nova(bottom) → Crescente(right) → Cheia(top) → Minguante(left) → Nova */}
                                                {/* Path starts at bottom, sweep-flag=1 for clockwise in SVG = counter-clockwise on screen */}
                                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                                    {/* Background track */}
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="49"
                                                        fill="none"
                                                        stroke="rgba(173, 146, 201, 0.08)"
                                                        strokeWidth="1.5"
                                                    />
                                                    {/* Progress arc: bottom → right → top → left (counter-clockwise on screen) */}
                                                    <path
                                                        d="M 50 99 A 49 49 0 1 1 50.01 99"
                                                        fill="none"
                                                        stroke="rgba(173, 146, 201, 0.6)"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        pathLength="100"
                                                        strokeDasharray={`${lunarCycleProgress * 100} 100`}
                                                    />
                                                </svg>

                                                {/* SVG Mandala Detail */}
                                                <svg className="absolute inset-0 p-4 w-full h-full stroke-primary fill-none opacity-50" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="48" strokeWidth="0.2"></circle>
                                                    <circle cx="50" cy="50" r="40" strokeDasharray="1 2" strokeWidth="0.1"></circle>
                                                    <path d="M50 2 L50 98 M2 50 L98 50 M15.5 15.5 L84.5 84.5 M15.5 84.5 L84.5 15.5" strokeWidth="0.1"></path>
                                                </svg>

                                                {/* Moon Phases Ring - Larger */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {/* Full Moon - Top */}
                                                    <div className={`absolute -top-20 flex flex-col items-center transition-all duration-300 ${moonPhase.phase === 'full' ? 'opacity-100' : 'opacity-40 scale-95'}`}>
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl ${moonPhase.phase === 'full' ? 'moon-glow-full' : ''}`}>
                                                            🌕
                                                        </div>
                                                        <span className={`text-[9px] mt-2 uppercase tracking-tighter font-bold ${moonPhase.phase === 'full' ? 'text-white' : 'text-white/40'}`}>{isPortuguese ? 'Cheia' : 'Full'}</span>
                                                    </div>
                                                    {/* New Moon - Bottom */}
                                                    <div className={`absolute -bottom-20 flex flex-col items-center transition-all duration-300 ${moonPhase.phase === 'new' ? 'opacity-100' : 'opacity-40 scale-95'}`}>
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl ${moonPhase.phase === 'new' ? 'moon-glow-new' : ''}`}>
                                                            🌑
                                                        </div>
                                                        <span className={`text-[9px] mt-2 uppercase tracking-tighter font-bold ${moonPhase.phase === 'new' ? 'text-[#ad92c9]' : 'text-[#ad92c9]/40'}`}>{isPortuguese ? 'Nova' : 'New'}</span>
                                                    </div>
                                                    {/* Waxing - Right */}
                                                    <div className={`absolute -right-20 flex flex-col items-center transition-all duration-300 ${['waxing_crescent', 'first_quarter', 'waxing_gibbous'].includes(moonPhase.phase) ? 'opacity-100' : 'opacity-40 scale-95'}`}>
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl ${['waxing_crescent', 'first_quarter', 'waxing_gibbous'].includes(moonPhase.phase) ? 'moon-glow-phase' : ''}`}>
                                                            🌒
                                                        </div>
                                                        <span className={`text-[9px] mt-2 uppercase tracking-tighter font-bold ${['waxing_crescent', 'first_quarter', 'waxing_gibbous'].includes(moonPhase.phase) ? 'text-[#ad92c9]' : 'text-[#ad92c9]/40'}`}>{isPortuguese ? 'Cresc.' : 'Wax.'}</span>
                                                    </div>
                                                    {/* Waning - Left */}
                                                    <div className={`absolute -left-20 flex flex-col items-center transition-all duration-300 ${['waning_gibbous', 'last_quarter', 'waning_crescent'].includes(moonPhase.phase) ? 'opacity-100' : 'opacity-40 scale-95'}`}>
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl ${['waning_gibbous', 'last_quarter', 'waning_crescent'].includes(moonPhase.phase) ? 'moon-glow-phase' : ''}`}>
                                                            🌘
                                                        </div>
                                                        <span className={`text-[9px] mt-2 uppercase tracking-tighter font-bold ${['waning_gibbous', 'last_quarter', 'waning_crescent'].includes(moonPhase.phase) ? 'text-[#ad92c9]' : 'text-[#ad92c9]/40'}`}>{isPortuguese ? 'Ling.' : 'Wan.'}</span>
                                                    </div>
                                                </div>

                                                {/* Inner Core */}
                                                <div className="text-center z-30">
                                                    <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Crimson Text', serif" }}>{currentDate.getDate()} {monthNames[currentDate.getMonth()]}</h2>
                                                    <p className="text-primary text-sm md:text-base font-medium tracking-[0.1em] uppercase">{isPortuguese ? 'Lua em' : 'Moon in'} {isPortuguese ? zodiacSun.sign_pt : zodiacSun.sign}</p>
                                                    <div className="mt-3 flex justify-center gap-2">
                                                        <div className="px-3 py-1 bg-primary/20 rounded-full border border-primary/30 text-[8px] font-bold text-white uppercase tracking-widest">{isPortuguese ? moonPhase.name_pt : moonPhase.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </section>
            </div>

            <Footer />

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="readings"
                onLogin={() => {
                    setShowPaywall(false);
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                }}
                onRegister={() => {
                    setShowPaywall(false);
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                }}
                onCheckout={() => navigate('/checkout')}
            />

            {/* Paywall Modal for Form */}
            <PaywallModal
                isOpen={showPaywallForm}
                onClose={() => setShowPaywallForm(false)}
                feature="whatsapp"
                onLogin={() => {
                    setShowPaywallForm(false);
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                }}
                onRegister={() => {
                    setShowPaywallForm(false);
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                }}
                onCheckout={() => navigate('/checkout')}
            />

            {/* WhatsApp Configuration Modal */}
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => {
                    setShowWhatsAppModal(false);
                    // Recarregar status após fechar
                    const loadStatus = async () => {
                        if (!user) return;
                        try {
                            const { supabase } = await import('./lib/supabase');
                            if (!supabase) return;
                            const { data } = await (supabase as any)
                                .from('whatsapp_subscriptions')
                                .select('is_active')
                                .eq('user_id', user.id)
                                .single();
                            setWhatsappSubscribed(data?.is_active || false);
                        } catch (err) {
                            console.error('Error reloading WhatsApp status:', err);
                        }
                    };
                    loadStatus();
                }}
            />

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
        </div >
    );
};

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { addItem } = useCart();
    const [isHovered, setIsHovered] = React.useState(false);

    const name = isPortuguese ? product.name : product.name_en;
    const shortDesc = isPortuguese ? product.shortDescription : product.shortDescription_en;

    return (
        <div
            className="group relative h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Card Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/2 to-white/0 rounded-2xl border border-white/10 transition-all duration-300"
                style={{
                    boxShadow: isHovered ? '0 20px 50px rgba(167, 127, 212, 0.2), 0 0 40px rgba(135, 95, 175, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
            />

            <div className="relative h-full overflow-hidden rounded-2xl flex flex-col">
                {/* Image Section */}
                <div
                    className="relative aspect-square overflow-hidden cursor-pointer bg-gradient-to-b from-white/10 to-transparent"
                    onClick={() => navigate(`/shop/${product.slug}`)}
                >
                    {/* Image with overlay */}
                    <img
                        src={product.images[0]}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23875faf%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage%3C/text%3E%3C/svg%3E';
                        }}
                    />

                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-[#1a1628]/80 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Floating badges */}
                    {product.tags.length > 0 && (
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                            {product.tags.includes('bestseller') && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-[#875faf] to-[#a77fd4] text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-lg backdrop-blur-sm border border-white/20">
                                    ⭐ {t.shop.bestseller}
                                </div>
                            )}
                            {product.tags.includes('new') && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-lg backdrop-blur-sm border border-white/20">
                                    ✨ {t.shop.new}
                                </div>
                            )}
                            {product.tags.includes('sale') && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-lg backdrop-blur-sm border border-white/20">
                                    🔥 {t.shop.sale}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Floating action on hover */}
                    {isHovered && (
                        <div className="absolute inset-0 flex items-center justify-center animate-fadeIn">
                            <button
                                onClick={() => navigate(`/shop/${product.slug}`)}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#875faf] to-[#a77fd4] text-white font-bold rounded-lg shadow-2xl hover:shadow-purple-900/50 transition-all hover:scale-105"
                            >
                                {t.product.viewDetails}
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                    {/* Title and Description */}
                    <div>
                        <h3
                            className="text-white font-bold text-sm mb-2 cursor-pointer hover:text-[#a77fd4] transition-colors line-clamp-2"
                            onClick={() => navigate(`/shop/${product.slug}`)}
                        >
                            {name}
                        </h3>
                        <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">{shortDesc}</p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

                    {/* Footer with Price and Action */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-white font-bold text-base">{formatPrice(product.price, t.common.currency)}</span>
                            {product.compareAtPrice && (
                                <span className="text-gray-500 text-xs line-through">{formatPrice(product.compareAtPrice, t.common.currency)}</span>
                            )}
                        </div>

                        {!product.variants ? (
                            <button
                                onClick={() => addItem(product)}
                                className="p-2.5 rounded-lg bg-gradient-to-r from-[#875faf]/20 to-[#a77fd4]/20 hover:from-[#875faf] hover:to-[#a77fd4] text-[#a77fd4] hover:text-white transition-all border border-[#875faf]/30 hover:border-[#a77fd4] shadow-lg hover:shadow-purple-900/30"
                            >
                                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/shop/${product.slug}`)}
                                className="text-[#a77fd4] text-xs font-bold hover:text-[#875faf] transition-colors group-hover:underline"
                            >
                                {t.product.selectVariant}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Shop Page
const Shop = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const [filter, setFilter] = useState<ProductCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high'>('featured');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const categories: Array<{ key: ProductCategory | 'all'; label: string; icon: string }> = [
        { key: 'all', label: t.shop.categories.all, icon: 'apps' },
        { key: 'candles', label: t.shop.categories.candles, icon: 'candle' },
        { key: 'incense', label: t.shop.categories.incense, icon: 'air' },
        { key: 'aromatherapy', label: t.shop.categories.aromatherapy, icon: 'spa' },
        { key: 'tarotDecks', label: t.shop.categories.tarotDecks, icon: 'style' },
        { key: 'crystals', label: t.shop.categories.crystals, icon: 'diamond' },
        { key: 'kits', label: t.shop.categories.kits, icon: 'inventory_2' },
    ];

    const availableTags = [
        { key: 'bestseller', label: t.shop.bestseller, color: 'text-primary' },
        { key: 'new', label: t.shop.new, color: 'text-green-500' },
        { key: 'sale', label: t.shop.sale, color: 'text-red-500' },
    ];

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const resetFilters = () => {
        setFilter('all');
        setPriceRange([0, 500]);
        setSelectedTags([]);
        setSortBy('featured');
    };

    let filteredProducts = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

    // Apply price range filter
    filteredProducts = filteredProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply tag filter
    if (selectedTags.length > 0) {
        filteredProducts = filteredProducts.filter(p =>
            selectedTags.some(tag => p.tags.includes(tag))
        );
    }

    if (sortBy === 'price_low') {
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
    } else {
        filteredProducts = [...filteredProducts].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return (
        <div className="relative flex flex-col min-h-screen overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            <Header />
            <CartDrawer />

            <MinimalStarsBackground />

            <main className="relative z-10 flex-1 w-full px-4 md:px-8 py-8 md:py-12">
                {/* Header Section */}
                <div className="max-w-[1600px] mx-auto mb-12">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#875faf]/20 via-[#1a1628] to-[#2d1b3d] border border-[#875faf]/30 p-6 md:p-8">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#875faf]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#a77fd4]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            <p className="text-[#a77fd4] text-sm font-bold uppercase tracking-widest mb-2">✨ {isPortuguese ? 'Coleção Mística' : 'Mystic Collection'}</p>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'Crimson Text', serif" }}>{t.shop.title}</h1>
                            <p className="text-gray-300 text-base max-w-2xl">{t.shop.subtitle}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-[#875faf] to-[#a77fd4] text-white rounded-full shadow-2xl hover:shadow-purple-900/40 transition-all"
                    >
                        <span className="material-symbols-outlined">tune</span>
                    </button>

                    {/* Sidebar Filters */}
                    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } lg:translate-x-0 fixed lg:relative top-0 left-0 h-full lg:h-auto w-72 lg:w-72 bg-[#1a1628] lg:bg-transparent border-r border-border-dark lg:border-0 p-6 lg:p-0 transition-transform duration-300 z-40 overflow-y-auto lg:sticky lg:top-0`}>

                        {/* Close button mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="space-y-6 mt-8 lg:mt-0">
                            {/* Categories */}
                            <div className="bg-gradient-to-br from-white/5 to-white/2 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-[#a77fd4]">category</span>
                                    {isPortuguese ? 'Categorias' : 'Categories'}
                                </h3>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.key}
                                            onClick={() => {
                                                setFilter(cat.key);
                                                setSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${filter === cat.key
                                                ? 'bg-gradient-to-r from-[#875faf] to-[#a77fd4] text-white shadow-lg'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-base">{cat.icon}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="bg-gradient-to-br from-white/5 to-white/2 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-[#a77fd4]">attach_money</span>
                                    {isPortuguese ? 'Faixa de Preço' : 'Price Range'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-gray-300 bg-white/5 p-2 rounded">
                                        <span>{formatPrice(priceRange[0], t.common.currency)}</span>
                                        <span className="text-gray-500">—</span>
                                        <span className="font-semibold">{formatPrice(priceRange[1], t.common.currency)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                        className="w-full accent-[#875faf] h-2"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="bg-gradient-to-br from-white/5 to-white/2 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-[#a77fd4]">local_offer</span>
                                    {isPortuguese ? 'Filtros' : 'Filters'}
                                </h3>
                                <div className="space-y-3">
                                    {availableTags.map(tag => (
                                        <label
                                            key={tag.key}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTags.includes(tag.key)}
                                                onChange={() => toggleTag(tag.key)}
                                                className="w-4 h-4 accent-[#875faf]"
                                            />
                                            <span className={`text-sm font-medium transition-colors ${selectedTags.includes(tag.key) ? tag.color + ' font-semibold' : 'text-gray-400 group-hover:text-white'}`}>
                                                {tag.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Filters */}
                            {(filter !== 'all' || selectedTags.length > 0) && (
                                <button
                                    onClick={resetFilters}
                                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-colors border border-white/20"
                                >
                                    {isPortuguese ? 'Limpar Filtros' : 'Reset Filters'}
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Overlay for mobile */}
                    {sidebarOpen && (
                        <div
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 z-30"
                        />
                    )}

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Sort and Results Count */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-white font-bold text-lg mb-1">
                                    {isPortuguese ? 'Produtos em Destaque' : 'Featured Products'}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {filteredProducts.length} {isPortuguese ? 'itens disponíveis' : 'items available'}
                                </p>
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-white/5 to-white/2 text-gray-300 border border-white/10 text-sm font-medium hover:border-white/20 transition-colors"
                            >
                                <option value="featured">{t.shop.sortOptions.featured}</option>
                                <option value="price_low">{t.shop.sortOptions.priceLow}</option>
                                <option value="price_high">{t.shop.sortOptions.priceHigh}</option>
                            </select>
                        </div>

                        {/* Products Grid - 4 columns on desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product, index) => (
                                <div key={product.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fadeIn">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-32">
                                <span className="material-symbols-outlined text-8xl text-gray-600 mb-6">inventory_2</span>
                                <p className="text-gray-400 text-lg font-medium">{isPortuguese ? 'Nenhum produto encontrado' : 'No products found'}</p>
                                <p className="text-gray-500 text-sm mt-2">{isPortuguese ? 'Tente ajustar seus filtros' : 'Try adjusting your filters'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// Product Detail Page
const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { addItem } = useCart();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    const product = slug ? getProductBySlug(slug) : null;

    useEffect(() => {
        if (product?.variants?.length) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen bg-background-dark">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">{isPortuguese ? 'Produto não encontrado' : 'Product not found'}</p>
                </div>
                <Footer />
            </div>
        );
    }

    const name = isPortuguese ? product.name : product.name_en;
    const description = isPortuguese ? product.description : product.description_en;
    const details = isPortuguese ? product.details : product.details_en;
    const howToUse = isPortuguese ? product.howToUse : product.howToUse_en;
    const variantType = isPortuguese ? product.variantType : product.variantType_en;

    const currentPrice = selectedVariant?.price ?? product.price;
    const currentStock = selectedVariant?.stock ?? product.stock;

    const handleAddToCart = () => {
        addItem(product, selectedVariant || undefined, quantity);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            <Header />
            <CartDrawer />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <button onClick={() => navigate('/shop')} className="hover:text-primary">{t.shop.title}</button>
                    <span>/</span>
                    <span className="text-white">{name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-surface-dark">
                            <img
                                src={product.images[activeImage]}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23875faf%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23875faf%22 width=%22400%22 height=%22400%22/%3E%3C/svg%3E';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <div>
                            {product.tags.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                    {product.tags.includes('bestseller') && (
                                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">{t.shop.bestseller}</span>
                                    )}
                                    {product.tags.includes('new') && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">{t.shop.new}</span>
                                    )}
                                </div>
                            )}
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>{name}</h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`material-symbols-outlined text-lg ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`}>star</span>
                                    ))}
                                </div>
                                <span className="text-gray-400 text-sm">({product.reviewCount} {t.shop.reviews})</span>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-primary">{formatPrice(currentPrice, t.common.currency)}</span>
                                {product.compareAtPrice && (
                                    <span className="text-xl text-gray-500 line-through">{formatPrice(product.compareAtPrice, t.common.currency)}</span>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed">{description}</p>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <label className="text-white font-bold text-sm mb-3 block">{variantType}</label>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map(variant => {
                                        const vName = isPortuguese ? variant.name : variant.name_en;
                                        return (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedVariant?.id === variant.id
                                                    ? 'bg-primary text-white'
                                                    : 'bg-surface-dark text-gray-300 hover:bg-white/10 border border-border-dark'
                                                    }`}
                                            >
                                                {vName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <label className="text-white font-bold text-sm mb-3 block">{t.product.quantity}</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-surface-dark text-white hover:bg-white/10 transition-colors"
                                >-</button>
                                <span className="w-12 text-center text-white font-bold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                                    className="w-10 h-10 rounded-lg bg-surface-dark text-white hover:bg-white/10 transition-colors"
                                >+</button>
                                <span className="text-gray-500 text-sm ml-4">
                                    {currentStock > 0 ? `${currentStock} ${t.shop.units} ${t.shop.inStock.toLowerCase()}` : t.shop.outOfStock}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={currentStock === 0}
                                className="flex-1 py-4 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                {t.product.addToCart}
                            </button>
                        </div>

                        {/* Details */}
                        <div className="border-t border-border-dark pt-6 space-y-4">
                            <h3 className="text-white font-bold">{t.product.details}</h3>
                            <ul className="space-y-2">
                                {details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {howToUse && (
                            <div className="border-t border-border-dark pt-6">
                                <h3 className="text-white font-bold mb-3">{t.product.howToUse}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{howToUse}</p>
                            </div>
                        )}

                        {/* Shipping */}
                        <div className="bg-surface-dark rounded-xl p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary">local_shipping</span>
                            <div>
                                <p className="text-white font-medium text-sm">{t.product.shipping}</p>
                                <p className="text-gray-400 text-xs">{t.product.shippingInfo}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// Card Details Page

const CardDetails = () => {
    const params = useParams();
    const cardId = params.cardId;
    const cardSlug = params.cardSlug;
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const [card, setCard] = useState<TarotCard | null>(null);
    const [lore, setLore] = useState<ExtendedCardLore | null>(null);
    const [isLoadingApi, setIsLoadingApi] = useState(true);

    useEffect(() => {
        const deck = generateDeck();
        let foundCard: TarotCard | undefined;

        // Prioridade: cardId (explore), depois cardSlug (arquivo-arcano/arcane-archive)
        if (cardId) {
            foundCard = deck.find(c => c.id === cardId);
            if (!foundCard) {
                const cardData = getCardBySlug(cardId);
                if (cardData) {
                    foundCard = deck.find(c => c.id === cardData.id);
                }
            }
        } else if (cardSlug) {
            const cardData = getCardBySlug(cardSlug);
            if (cardData) {
                foundCard = deck.find(c => c.id === cardData.id);
            }
        }

        if (foundCard) {
            setCard(foundCard);
            const staticData = getStaticLore(foundCard, isPortuguese);
            setLore(staticData);

            setIsLoadingApi(true);
            fetchCardByName(foundCard.name).then(apiData => {
                if (apiData) {
                    setLore(prev => prev ? {
                        ...prev,
                        apiDescription: apiData.desc,
                        apiMeaningUp: apiData.meaning_up,
                        apiMeaningRev: apiData.meaning_rev
                    } : prev);
                }
                setIsLoadingApi(false);
            }).catch(() => setIsLoadingApi(false));
        } else {
            navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive');
        }
    }, [cardId, cardSlug, navigate, isPortuguese]);

    if (!card) return null;

    return (
        <div className="relative flex flex-col min-h-screen overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            <Header />
            <CartDrawer />

            <main className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-6 py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')} className="cursor-pointer hover:text-[#875faf] transition-colors">{t.explore.title}</span>
                        <span>/</span>
                        <span className="text-white font-bold">{getCardName(card.id, isPortuguese)}</span>
                    </div>
                    <button onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#875faf]/20 border border-white/10 hover:border-[#875faf]/30 transition-all text-sm font-medium text-gray-300 hover:text-white">
                        <span className="material-symbols-outlined text-base">arrow_back</span> {t.cardDetails.back}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <div className="relative w-full max-w-[350px] aspect-[2/3.4] rounded-2xl overflow-hidden shadow-2xl shadow-[#875faf]/20 border border-[#875faf]/30 group hover:border-[#875faf]/50 transition-all">
                            <img src={card.imageUrl} alt={getCardName(card.id, isPortuguese)} onError={handleImageError} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d14] via-transparent to-transparent opacity-60 pointer-events-none"></div>
                        </div>

                        {/* Description Section - below the card image */}
                        {lore?.description && (
                            <div className="mt-6 w-full max-w-[350px] p-5 bg-[#1a1320]/60 backdrop-blur-sm border border-[#875faf]/20 rounded-xl">
                                <h4 className="text-[#a77fd4] font-bold text-xs mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">image</span>
                                    {isPortuguese ? 'Descrição Visual' : 'Visual Description'}
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed italic">{lore.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1.5 rounded-md bg-gradient-to-r from-[#875faf]/20 to-[#a77fd4]/20 text-[#a77fd4] text-[11px] font-bold uppercase tracking-wider border border-[#875faf]/30">
                                    {card.arcana === ArcanaType.MAJOR ? (isPortuguese ? 'Arcano Maior' : 'Major Arcana') : (isPortuguese ? 'Arcano Menor' : 'Minor Arcana')} {card.suit !== Suit.NONE && `• ${isPortuguese ? (card.suit === 'Wands' ? 'Paus' : card.suit === 'Cups' ? 'Copas' : card.suit === 'Swords' ? 'Espadas' : 'Ouros') : card.suit}`}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-normal leading-tight text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>{getCardName(card.id, isPortuguese)}</h1>
                        </div>

                        {lore && (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    {lore.keywords.map((kw, i) => (
                                        <div key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300 hover:border-[#875faf]/40 hover:text-white transition-all">
                                            {kw}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-white mb-3">
                                            <span className="material-symbols-outlined text-[#875faf]">auto_awesome</span>
                                            {t.cardDetails.upright}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-lg bg-[#1a1320]/60 backdrop-blur-sm p-6 rounded-xl border border-[#875faf]/20">{lore.generalMeaning}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#1a1320]/60 backdrop-blur-sm p-6 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all group">
                                            <div className="size-10 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined">favorite</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">{t.cardDetails.love}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.love}</p>
                                        </div>
                                        <div className="bg-[#1a1320]/60 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                                            <div className="size-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined">work</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">{t.cardDetails.career}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.career}</p>
                                        </div>
                                        <div className="bg-[#1a1320]/60 backdrop-blur-sm p-6 rounded-xl border border-[#875faf]/20 hover:border-[#875faf]/40 transition-all md:col-span-2 group">
                                            <div className="size-10 rounded-full bg-[#875faf]/10 text-[#a77fd4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined">lightbulb</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">{t.cardDetails.advice}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.advice}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <h4 className="text-red-400 font-bold text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">rotate_right</span>
                                            {t.cardDetails.reversed}
                                        </h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{lore.apiMeaningRev || lore.reversed}</p>
                                    </div>

                                    {lore.apiDescription ? (
                                        <div className="p-6 bg-gradient-to-br from-[#875faf]/10 to-transparent border border-[#875faf]/20 rounded-xl">
                                            <h4 className="text-[#a77fd4] font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">menu_book</span>
                                                {t.cardDetails.historicalSymbolism}
                                            </h4>
                                            <p className="text-gray-300 text-sm leading-relaxed italic">{lore.apiDescription}</p>
                                        </div>
                                    ) : isLoadingApi ? (
                                        <div className="p-6 bg-[#1a1320]/40 border border-white/5 rounded-xl animate-pulse">
                                            <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
                                            <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
                                            <div className="h-3 bg-white/10 rounded w-5/6"></div>
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Reading Detail Modal
const ReadingModal = ({
    reading,
    onClose,
    onUpdate,
    isPortuguese
}: {
    reading: any;
    onClose: () => void;
    onUpdate: (updated: any) => void;
    isPortuguese: boolean;
}) => {
    const [comment, setComment] = useState(reading.comment || '');
    const [rating, setRating] = useState(reading.rating || 0);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        const updated = { ...reading, comment, rating };
        onUpdate(updated);
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 500);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-card-dark border border-border-dark rounded-2xl z-50 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-dark">
                    <div>
                        <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${reading.typeColor}`}>
                            {reading.typeBadge}
                        </div>
                        <h2 className="text-xl font-bold text-white">{reading.spreadName}</h2>
                        <p className="text-gray-500 text-sm">{reading.date}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Cards Grid */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                            {isPortuguese ? 'Cartas da Leitura' : 'Reading Cards'}
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {reading.previewCards?.map((cardUrl: string, idx: number) => (
                                <div key={idx} className="flex flex-col">
                                    <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-lg bg-surface-dark">
                                        <img
                                            src={cardUrl}
                                            alt={`Card ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://placehold.co/300x520/1c1022/9311d4?text=Tarot";
                                            }}
                                        />
                                    </div>
                                    <p className="text-center text-[10px] text-primary font-bold uppercase mt-2 truncate">
                                        {reading.positions?.[idx] || `${isPortuguese ? 'Posição' : 'Position'} ${idx + 1}`}
                                    </p>
                                    <p className="text-center text-xs text-white font-medium truncate">
                                        {reading.cardNames?.[idx] || `${isPortuguese ? 'Carta' : 'Card'} ${idx + 1}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Synthesis - Enhanced Layout */}
                    {reading.notes && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                                {isPortuguese ? 'Síntese da Leitura' : 'Reading Synthesis'}
                            </h3>
                            <div className="bg-gradient-to-br from-purple-900/30 to-surface-dark border border-purple-500/20 rounded-xl p-5 space-y-4">
                                {/* Parse and display structured synthesis */}
                                {reading.notes.split('\n').map((line: string, idx: number) => {
                                    const trimmedLine = line.trim();
                                    if (!trimmedLine) return null;

                                    // Check for section headers
                                    if (trimmedLine.startsWith('PERGUNTA:') || trimmedLine.startsWith('QUESTION:')) {
                                        return (
                                            <div key={idx} className="flex items-start gap-3 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                                                <span className="material-symbols-outlined text-blue-400 text-lg mt-0.5">help_outline</span>
                                                <p className="text-blue-200 text-sm italic">{trimmedLine.replace(/^(PERGUNTA|QUESTION):\s*/, '').replace(/^"|"$/g, '')}</p>
                                            </div>
                                        );
                                    }
                                    if (trimmedLine.startsWith('TEMA:') || trimmedLine.startsWith('THEME:')) {
                                        return (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase">
                                                    {trimmedLine.replace(/^(TEMA|THEME):\s*/, '')}
                                                </span>
                                            </div>
                                        );
                                    }
                                    if (trimmedLine.startsWith('ENERGIA:') || trimmedLine.startsWith('ENERGY:')) {
                                        const energia = trimmedLine.replace(/^(ENERGIA|ENERGY):\s*/, '').toLowerCase();
                                        const isPositive = energia.includes('positiv') || energia.includes('favorável');
                                        return (
                                            <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isPositive ? 'bg-green-500/15 border border-green-500/20' : 'bg-orange-500/15 border border-orange-500/20'}`}>
                                                <span className={`material-symbols-outlined text-lg ${isPositive ? 'text-green-400' : 'text-orange-400'}`}>
                                                    {isPositive ? 'sentiment_satisfied' : 'warning'}
                                                </span>
                                                <span className={`text-sm font-medium ${isPositive ? 'text-green-300' : 'text-orange-300'}`}>
                                                    {trimmedLine.replace(/^(ENERGIA|ENERGY):\s*/, '')}
                                                </span>
                                            </div>
                                        );
                                    }
                                    if (trimmedLine.startsWith('RESPOSTA:') || trimmedLine.startsWith('ANSWER:')) {
                                        const answer = trimmedLine.replace(/^(RESPOSTA|ANSWER):\s*/, '');
                                        const isYes = answer.toLowerCase().includes('sim') || answer.toLowerCase().includes('yes');
                                        const isNo = answer.toLowerCase().includes('não') || answer.toLowerCase().includes('no');
                                        return (
                                            <div key={idx} className={`flex items-center justify-center gap-3 p-4 rounded-xl border ${isYes ? 'bg-green-500/20 border-green-500/30' : isNo ? 'bg-red-500/20 border-red-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
                                                <span className={`material-symbols-outlined text-3xl ${isYes ? 'text-green-400' : isNo ? 'text-red-400' : 'text-yellow-400'}`}>
                                                    {isYes ? 'check_circle' : isNo ? 'cancel' : 'help'}
                                                </span>
                                                <span className={`text-2xl font-bold ${isYes ? 'text-green-300' : isNo ? 'text-red-300' : 'text-yellow-300'}`}>
                                                    {answer}
                                                </span>
                                            </div>
                                        );
                                    }
                                    if (trimmedLine.startsWith('CONSELHO:') || trimmedLine.startsWith('ADVICE:')) {
                                        return (
                                            <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
                                                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                                                    {isPortuguese ? 'Conselho' : 'Advice'}
                                                </div>
                                                <p className="text-amber-100 text-sm">{trimmedLine.replace(/^(CONSELHO|ADVICE):\s*/, '')}</p>
                                            </div>
                                        );
                                    }
                                    if (trimmedLine.startsWith('REFLEXÃO:') || trimmedLine.startsWith('REFLECTION:')) {
                                        return (
                                            <div key={idx} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-2">
                                                    <span className="material-symbols-outlined text-sm">psychology</span>
                                                    {isPortuguese ? 'Reflexão' : 'Reflection'}
                                                </div>
                                                <p className="text-purple-200 text-sm italic">{trimmedLine.replace(/^(REFLEXÃO|REFLECTION):\s*/, '')}</p>
                                            </div>
                                        );
                                    }
                                    if (trimmedLine.startsWith('ATENÇÃO:') || trimmedLine.startsWith('ATTENTION:') || trimmedLine.startsWith('DESAFIO:') || trimmedLine.startsWith('CHALLENGE:')) {
                                        return (
                                            <div key={idx} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase mb-2">
                                                    <span className="material-symbols-outlined text-sm">warning</span>
                                                    {isPortuguese ? 'Ponto de Atenção' : 'Attention Point'}
                                                </div>
                                                <p className="text-orange-200 text-sm">{trimmedLine.replace(/^(ATENÇÃO|ATTENTION|DESAFIO|CHALLENGE):\s*/, '')}</p>
                                            </div>
                                        );
                                    }
                                    if (trimmedLine.startsWith('--- CARTAS ---') || trimmedLine.startsWith('--- CARDS ---')) {
                                        return null; // Skip this header
                                    }
                                    // Default: regular text
                                    return (
                                        <p key={idx} className="text-gray-300 text-sm leading-relaxed">
                                            {trimmedLine}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Rating */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {isPortuguese ? 'Sua Avaliação' : 'Your Rating'}
                        </h3>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <span className={`material-symbols-outlined text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                                        {star <= rating ? 'star' : 'star_outline'}
                                    </span>
                                </button>
                            ))}
                            {rating > 0 && (
                                <span className="ml-2 text-gray-400 text-sm self-center">
                                    {rating}/5
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {isPortuguese ? 'Suas Anotações' : 'Your Notes'}
                        </h3>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={isPortuguese ? 'Adicione suas reflexões sobre esta leitura...' : 'Add your reflections about this reading...'}
                            className="w-full h-32 px-4 py-3 rounded-xl bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-border-dark">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                    >
                        {isPortuguese ? 'Cancelar' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                {isPortuguese ? 'Salvando...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">save</span>
                                {isPortuguese ? 'Salvar' : 'Save'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

// History Page
const History = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { checkAccess, getHistoryLimit, isGuest, isPremium } = usePaywall();
    const { user } = useAuth();
    const [selectedReading, setSelectedReading] = useState<any | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const [filteredReadings, setFilteredReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [displayCount, setDisplayCount] = useState(9); // Mostrar 9 itens inicialmente (3x3 grid)

    // Check if a reading is unviewed (baseado em viewed_at do banco)
    const isUnviewed = (reading: any) => {
        return !reading.viewed_at;
    };

    // Handle opening a reading (marks it as viewed in Supabase)
    const handleOpenReading = async (reading: any) => {
        setSelectedReading(reading);

        // Se a leitura ainda não foi visualizada, marcar como visualizada no Supabase
        if (!reading.viewed_at && user) {
            try {
                const { supabase } = await import('./lib/supabase');
                if (!supabase) return;

                await (supabase as any)
                    .from('readings')
                    .update({ viewed_at: new Date().toISOString() })
                    .eq('id', reading.id);

                // Atualizar localmente
                setSavedReadings(prev =>
                    prev.map(r => r.id === reading.id ? { ...r, viewed_at: new Date().toISOString() } : r)
                );
                setFilteredReadings(prev =>
                    prev.map(r => r.id === reading.id ? { ...r, viewed_at: new Date().toISOString() } : r)
                );
            } catch (err) {
                console.error('Error marking reading as viewed:', err);
            }
        }
    };

    const [savedReadings, setSavedReadings] = useState<any[]>(() => {
        try {
            // Se não estiver logado, pode carregar do localStorage
            // Se estiver logado, vai carregar do Supabase
            const saved = localStorage.getItem('tarot-history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Recarregar histórico quando usuário faz login/logout
    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);

                if (user && user.id) {
                    // Usuário autenticado: carrega do Supabase com filtro por user_id
                    const readings = await fetchReadingsFromSupabase(user.id, 1000, isPortuguese);
                    setSavedReadings(readings);
                    setFilteredReadings(readings);
                } else {
                    // Usuário não autenticado: carrega do localStorage
                    // IMPORTANTE: Limpa dados do localStorage se mudou de usuário
                    const saved = localStorage.getItem('tarot-history');
                    const readings = saved ? JSON.parse(saved) : [];
                    setSavedReadings(readings);
                    setFilteredReadings(readings);
                }
            } catch (e) {
                console.error('Error loading history:', e);
                setSavedReadings([]);
                setFilteredReadings([]);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [user, isPortuguese]); // Recarrega quando user muda (login/logout) ou idioma muda

    // Limitar leituras visíveis baseado no tier
    const historyLimit = getHistoryLimit();
    const availableReadings = isPremium ? filteredReadings : filteredReadings.slice(0, historyLimit);
    const visibleReadings = availableReadings.slice(0, displayCount);
    const hasMoreToLoad = visibleReadings.length < availableReadings.length;
    const hasMoreReadings = filteredReadings.length > historyLimit && !isPremium;

    const loadMore = () => {
        setDisplayCount(prev => prev + 9); // Carregar mais 9 itens
    };

    const deleteReading = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedReadings.filter(r => r.id !== id);
        setSavedReadings(updated);
        const updatedFiltered = filteredReadings.filter(r => r.id !== id);
        setFilteredReadings(updatedFiltered);
        localStorage.setItem('tarot-history', JSON.stringify(updated));

        // Also delete from Supabase if user is logged in
        if (user) {
            await deleteReadingFromSupabase(id);
        }
    };

    const updateReading = (updated: any) => {
        const newReadings = savedReadings.map(r => r.id === updated.id ? updated : r);
        setSavedReadings(newReadings);
        localStorage.setItem('tarot-history', JSON.stringify(newReadings));
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`material-symbols-outlined text-sm ${star <= (rating || 0) ? 'text-yellow-400' : 'text-gray-600'
                        }`}>
                        {star <= (rating || 0) ? 'star' : 'star_outline'}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="relative flex flex-col min-h-screen text-white overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            <Header />
            <CartDrawer />

            <MinimalStarsBackground />

            {/* Modal */}
            {selectedReading && (
                <ReadingModal
                    reading={selectedReading}
                    onClose={() => setSelectedReading(null)}
                    onUpdate={updateReading}
                    isPortuguese={isPortuguese}
                />
            )}

            <main className="relative z-10 flex-1 justify-center w-full py-12">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                        <div>
                            <style>{`
                                .text-gradient-gold {
                                    background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                }
                                .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                }
                                .scrollbar-hide {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                            `}</style>
                            <h2 className="text-4xl md:text-5xl font-bold text-gradient-gold" style={{ fontFamily: "'Crimson Text', serif" }}>{t.history.title}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t.history.subtitle}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(isPortuguese ? '/arquivo-arcano' : '/arcane-archive')}
                                className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">auto_stories</span>
                                {t.nav.cardMeanings}
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2.5 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:shadow-lg hover:shadow-purple-900/40 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                {t.nav.newReading}
                            </button>
                        </div>
                    </div>

                    {/* Bloquear visitantes */}
                    {isGuest ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#875faf] mb-4">lock</span>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {isPortuguese ? 'Histórico Requer Conta' : 'History Requires Account'}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {isPortuguese ? 'Crie uma conta gratuita para salvar e visualizar seu histórico de tiragens.' : 'Create a free account to save and view your reading history.'}
                            </p>
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:shadow-lg hover:shadow-purple-900/40 rounded-xl text-white font-bold transition-all"
                            >
                                {isPortuguese ? 'Criar Conta Grátis' : 'Create Free Account'}
                            </button>
                        </div>
                    ) : savedReadings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">history</span>
                            <h3 className="text-xl font-bold text-white mb-2">{t.history.noHistory}</h3>
                            <p className="text-gray-400 mb-6">{t.history.startFirst}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-4 bg-[#875faf] text-white text-sm font-medium tracking-wide rounded-sm hover:bg-[#a77fd4] transition-colors"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {t.home.startReading}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Filters and Chart Section */}
                            <div className="bg-white/3 rounded-xl p-6 border border-white/5">
                                <HistoryFiltered
                                    readings={savedReadings}
                                    isPortuguese={isPortuguese}
                                    onSelect={handleOpenReading}
                                    onDelete={deleteReading}
                                    onFilterChange={setFilteredReadings}
                                />
                            </div>

                            {/* Readings Grid */}
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {visibleReadings.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleOpenReading(item)}
                                            className={`group relative bg-card-dark rounded-xl border transition-all overflow-hidden cursor-pointer hover:scale-[1.02] ${isUnviewed(item) ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-border-dark hover:border-primary/30'}`}
                                        >
                                            {/* Unviewed Badge */}
                                            {isUnviewed(item) && (
                                                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
                                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                                    <span className="text-amber-400 text-[10px] font-bold uppercase">
                                                        {isPortuguese ? 'Nova' : 'New'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Cards Preview - Horizontal Scroll */}
                                            <div className="relative flex gap-1.5 p-3 bg-surface-dark/50 overflow-x-auto scrollbar-hide">
                                                {item.previewCards?.slice(0, 5).map((cardUrl: string, idx: number) => (
                                                    <div key={idx} className="flex-shrink-0 w-12">
                                                        <div className="aspect-[2/3] rounded-md overflow-hidden border border-white/10 shadow-md">
                                                            <img
                                                                src={cardUrl}
                                                                alt={`Card ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = "https://placehold.co/300x520/1c1022/9311d4?text=?";
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {(item.previewCards?.length || 0) > 5 && (
                                                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                                                        <span className="text-gray-500 text-xs">+{item.previewCards.length - 5}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Info */}
                                            <div className="p-4 space-y-2">
                                                {/* Type and Date */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${item.typeColor}`}>
                                                        {item.typeBadge}
                                                    </span>
                                                    <span className="text-gray-500 text-[10px]">{item.date}</span>
                                                </div>

                                                {/* Spread Name */}
                                                <h3 className="text-white font-bold text-sm line-clamp-1">{item.spreadName}</h3>

                                                {/* Rating */}
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className={`material-symbols-outlined text-xs ${star <= (item.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}>
                                                            {star <= (item.rating || 0) ? 'star' : 'star_outline'}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Comment Preview */}
                                                {item.comment ? (
                                                    <p className="text-gray-400 text-xs line-clamp-2 italic">"{item.comment}"</p>
                                                ) : (
                                                    <p className="text-gray-600 text-xs italic">
                                                        {isPortuguese ? 'Sem anotações' : 'No notes'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => deleteReading(item.id, e)}
                                                className="absolute bottom-3 right-3 z-10 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 opacity-100 transition-all"
                                                title={isPortuguese ? 'Excluir leitura' : 'Delete reading'}
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {hasMoreToLoad && (
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={loadMore}
                                            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg text-white font-medium flex items-center gap-2 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                            {isPortuguese ? 'Carregar Mais' : 'Load More'}
                                        </button>
                                    </div>
                                )}

                                {/* Mostrar prompt de upgrade se houver mais leituras bloqueadas */}
                                {hasMoreReadings && (
                                    <div className="mt-6 p-6 bg-gradient-to-r from-[#875faf]/20 to-[#1a1628] border border-[#875faf]/30 rounded-xl text-center">
                                        <span className="material-symbols-outlined text-4xl text-[#a77fd4] mb-3">lock</span>
                                        <h3 className="text-white font-bold text-lg mb-2">
                                            {isPortuguese ? `+${filteredReadings.length - historyLimit} tiragens bloqueadas` : `+${filteredReadings.length - historyLimit} readings locked`}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {isPortuguese ? 'Faça upgrade para Premium para acessar todo o seu histórico.' : 'Upgrade to Premium to access your full history.'}
                                        </p>
                                        <button
                                            onClick={() => setShowPaywall(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:shadow-lg hover:shadow-purple-900/40 rounded-xl text-white font-bold transition-all"
                                        >
                                            {isPortuguese ? 'Fazer Upgrade' : 'Upgrade Now'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Modals */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="history"
                onLogin={() => {
                    setShowPaywall(false);
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                }}
                onRegister={() => {
                    setShowPaywall(false);
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                }}
                onCheckout={() => navigate('/checkout')}
            />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
        </div>
    );
};

// Numerology Page
const Numerology = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [profile, setProfile] = useState<NumerologyProfile | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [universalDay] = useState(calculateUniversalDay());

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim() || !birthDate) return;

        setIsCalculating(true);
        setTimeout(() => {
            const date = new Date(birthDate + 'T12:00:00');
            const result = calculateNumerologyProfile(fullName, date);
            setProfile(result);
            setIsCalculating(false);
        }, 800);
    };

    const resetCalculation = () => {
        setProfile(null);
        setFullName('');
        setBirthDate('');
    };

    // Premium Number Pillar Card
    const PillarCard = ({ num, title, description, icon, gradient }: { num: NumerologyNumber; title: string; description: string; icon: string; gradient: string }) => {
        const meaning = isPortuguese ? num.meaning.title_pt : num.meaning.title;
        const keywords = isPortuguese ? num.meaning.keywords_pt : num.meaning.keywords;
        const isMaster = num.masterNumber;

        return (
            <div className={`relative group rounded-2xl p-[1px] ${isMaster ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-500' : gradient} overflow-hidden`}>
                {/* Glow effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${isMaster ? 'bg-gradient-to-br from-yellow-400/50 to-orange-500/50' : 'bg-inherit'}`} />
                <div className="relative bg-[#0d0d14]/95 backdrop-blur-xl rounded-2xl p-6 h-full">
                    {/* Number display */}
                    <div className="flex justify-center mb-5">
                        <div className={`w-24 h-24 rounded-full ${isMaster ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-500' : gradient} p-[2px] shadow-lg ${isMaster ? 'shadow-yellow-500/30' : 'shadow-primary/20'}`}>
                            <div className="w-full h-full rounded-full bg-[#0d0d14] flex items-center justify-center relative">
                                <span className={`text-5xl font-black ${isMaster ? 'bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent' : 'text-white'}`}>{num.value}</span>
                                {isMaster && (
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                                        <span className="material-symbols-outlined text-black text-sm">star</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="text-center mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`material-symbols-outlined ${isMaster ? 'text-yellow-400' : 'text-primary'}`}>{icon}</span>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                        </div>
                        <p className="text-gray-500 text-xs">{description}</p>
                    </div>

                    {/* Meaning */}
                    <div className="text-center mb-4">
                        <span className={`font-semibold ${isMaster ? 'text-yellow-400' : 'text-primary'}`}>{meaning}</span>
                        {isMaster && (
                            <div className="mt-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                    {t.numerology.masterNumber}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-full text-xs ${isMaster ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300' : 'bg-white/5 border border-white/10 text-gray-300'}`}>
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Cycle Card (smaller, for temporal cycles)
    const CycleCard = ({ num, title, description, icon }: { num: NumerologyNumber; title: string; description: string; icon: string }) => {
        const meaning = isPortuguese ? num.meaning.title_pt : num.meaning.title;
        const keywords = isPortuguese ? num.meaning.keywords_pt : num.meaning.keywords;

        return (
            <div className="relative group rounded-xl bg-card-dark border border-border-dark p-5 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-start gap-4">
                    {/* Number */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${num.masterNumber ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' : 'bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20'}`}>
                        <span className="text-2xl font-black text-white">{num.value}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`material-symbols-outlined text-base ${num.masterNumber ? 'text-yellow-400' : 'text-primary'}`}>{icon}</span>
                            <h4 className="text-white font-bold">{title}</h4>
                            {num.masterNumber && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-[10px] font-bold rounded-full border border-yellow-500/30">
                                    {t.numerology.masterNumber}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-xs mb-2">{description}</p>
                        <p className={`text-sm font-semibold ${num.masterNumber ? 'text-yellow-400' : 'text-primary'}`}>{meaning}</p>
                    </div>
                </div>

                {/* Keywords */}
                <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                    {keywords.slice(0, 4).map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-surface-dark rounded-lg text-gray-400 text-xs border border-white/5">
                            {kw}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0f] text-white">
            <Header />
            <CartDrawer />

            <main className="flex-1 w-full">
                {!profile ? (
                    <>
                        {/* Hero Section with cosmic background */}
                        <div className="relative overflow-hidden">
                            {/* Background effects */}
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
                            <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-50" />
                            <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] opacity-50" />

                            <div className="relative max-w-[1200px] mx-auto px-4 md:px-10 py-16">
                                <div className="text-center mb-12">
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 rounded-full text-primary text-sm font-semibold mb-6 backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-lg">calculate</span>
                                        {isPortuguese ? 'Descubra seu destino' : 'Discover your destiny'}
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent" style={{ fontFamily: "'Crimson Text', serif" }}>
                                        {t.numerology.title}
                                    </h1>
                                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                        {t.numerology.subtitle}
                                    </p>
                                </div>

                                {/* Universal Day - Premium Design */}
                                <div className="max-w-sm mx-auto mb-12">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                                        <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0d0d14] rounded-2xl border border-white/10 p-8 text-center">
                                            <p className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">{t.numerology.results.universalDay}</p>
                                            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-purple-600/30 border-2 border-primary/50 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                                                <span className="text-6xl font-black text-white">{universalDay}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{t.numerology.results.todayEnergy}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form - Premium Design */}
                                <form onSubmit={handleCalculate} className="max-w-md mx-auto">
                                    <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#0d0d14]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
                                        <div>
                                            <label className="block text-gray-300 font-medium mb-2 text-sm">{t.numerology.form.fullName}</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder={t.numerology.form.fullNamePlaceholder}
                                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-primary/50 focus:bg-white/10 focus:outline-none transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-300 font-medium mb-2 text-sm">{t.numerology.form.birthDate}</label>
                                            <input
                                                type="date"
                                                value={birthDate}
                                                onChange={(e) => setBirthDate(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary/50 focus:bg-white/10 focus:outline-none transition-all"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isCalculating || !fullName.trim() || !birthDate}
                                            className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary-hover hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isCalculating ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                    {t.numerology.form.calculating}
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined">auto_awesome</span>
                                                    {t.numerology.form.calculate}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Results Page */}
                        <div className="relative overflow-hidden">
                            {/* Background effects */}
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
                            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />

                            <div className="relative max-w-[1200px] mx-auto px-4 md:px-10 py-12">
                                {/* Results Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
                                            <span className="material-symbols-outlined text-base">person</span>
                                            {fullName}
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent" style={{ fontFamily: "'Crimson Text', serif" }}>
                                            {t.numerology.results.title}
                                        </h1>
                                    </div>
                                    <button
                                        onClick={resetCalculation}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">refresh</span>
                                        {t.numerology.newCalculation}
                                    </button>
                                </div>

                                {/* Os Pilares Centrais (Core Pillars) */}
                                <div className="mb-14">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">award_star</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {isPortuguese ? 'Os Pilares Centrais' : 'The Core Pillars'}
                                            </h2>
                                            <p className="text-gray-500 text-sm">
                                                {isPortuguese ? 'Os três números que definem sua essência' : 'The three numbers that define your essence'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <PillarCard
                                            num={profile.lifePath}
                                            title={t.numerology.numbers.lifePath}
                                            description={t.numerology.numbers.lifePathDesc}
                                            icon="route"
                                            gradient="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500"
                                        />
                                        <PillarCard
                                            num={profile.expression}
                                            title={t.numerology.numbers.expression}
                                            description={t.numerology.numbers.expressionDesc}
                                            icon="brush"
                                            gradient="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500"
                                        />
                                        <PillarCard
                                            num={profile.soul}
                                            title={t.numerology.numbers.soul}
                                            description={t.numerology.numbers.soulDesc}
                                            icon="favorite"
                                            gradient="bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Números Complementares (Additional Numbers) */}
                                <div className="mb-14">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-amber-400">stars</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {isPortuguese ? 'Números Complementares' : 'Additional Numbers'}
                                            </h2>
                                            <p className="text-gray-500 text-sm">
                                                {isPortuguese ? 'Aspectos adicionais da sua personalidade' : 'Additional aspects of your personality'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <CycleCard
                                            num={profile.personality}
                                            title={t.numerology.numbers.personality}
                                            description={t.numerology.numbers.personalityDesc}
                                            icon="person"
                                        />
                                        <CycleCard
                                            num={profile.birthday}
                                            title={t.numerology.numbers.birthday}
                                            description={t.numerology.numbers.birthdayDesc}
                                            icon="cake"
                                        />
                                    </div>
                                </div>

                                {/* Ciclos Temporais (Time Cycles) */}
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-cyan-400">schedule</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {isPortuguese ? 'Ciclos Temporais' : 'Time Cycles'}
                                            </h2>
                                            <p className="text-gray-500 text-sm">
                                                {isPortuguese ? 'As energias que influenciam você agora' : 'The energies influencing you now'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <CycleCard
                                            num={profile.personalYear}
                                            title={t.numerology.numbers.personalYear}
                                            description={t.numerology.numbers.personalYearDesc}
                                            icon="calendar_today"
                                        />
                                        <CycleCard
                                            num={profile.personalMonth}
                                            title={t.numerology.numbers.personalMonth}
                                            description={t.numerology.numbers.personalMonthDesc}
                                            icon="date_range"
                                        />
                                        <CycleCard
                                            num={profile.personalDay}
                                            title={t.numerology.numbers.personalDay}
                                            description={t.numerology.numbers.personalDayDesc}
                                            icon="today"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

// Cosmic Calendar Page
const CosmicCalendar = () => {
    const { t, isPortuguese } = useLanguage();
    const [currentDate] = useState(new Date());
    const [cosmicDay] = useState<CosmicDay>(getCosmicDay(currentDate));
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear] = useState(currentDate.getFullYear());

    const { moonPhase, zodiacSun, planetaryRuler, cosmicEnergy, bestFor, bestFor_pt, avoid, avoid_pt } = cosmicDay;

    const getDaysInMonth = (year: number, month: number) => {
        const days: Date[] = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };

    const monthDays = getDaysInMonth(selectedYear, selectedMonth);
    const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

    const monthNames = isPortuguese
        ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const weekDays = isPortuguese ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white overflow-x-hidden">
            <Header />
            <CartDrawer />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 md:px-10 py-8 md:py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold mb-6 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        {t.cosmic.title}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>{t.cosmic.title}</h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">{t.cosmic.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
                    {/* Left Column - Today's Cosmic Info */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {/* Moon Phase Card */}
                        <div className="bg-gradient-to-br from-indigo-900/50 to-surface-dark rounded-xl md:rounded-2xl border border-indigo-500/30 p-4 md:p-8">
                            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                    <span className="material-symbols-outlined text-5xl md:text-6xl text-indigo-900">{moonPhase.icon}</span>
                                    <div
                                        className="absolute inset-0 bg-indigo-950"
                                        style={{
                                            clipPath: `inset(0 ${100 - moonPhase.illumination}% 0 0)`,
                                            opacity: 0.8
                                        }}
                                    />
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <p className="text-indigo-300 text-sm font-medium mb-1">{t.cosmic.moonPhase}</p>
                                    <h2 className="text-3xl font-black text-white mb-2">
                                        {isPortuguese ? moonPhase.name_pt : moonPhase.name}
                                    </h2>
                                    <p className="text-gray-400 mb-3">
                                        {isPortuguese ? moonPhase.description_pt : moonPhase.description}
                                    </p>
                                    <div className="flex items-center gap-4 justify-center md:justify-start">
                                        <span className="px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-300 text-sm">
                                            {t.cosmic.illumination}: {moonPhase.illumination}%
                                        </span>
                                        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm">
                                            {isPortuguese ? moonPhase.energy_pt : moonPhase.energy}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid of Day Info */}
                        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                            {/* Planetary Ruler */}
                            <div className="bg-card-dark rounded-xl border border-border-dark p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: planetaryRuler.color + '30' }}>
                                        <span className="material-symbols-outlined text-2xl" style={{ color: planetaryRuler.color }}>{planetaryRuler.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">{t.cosmic.planetaryRuler}</p>
                                        <h3 className="text-white font-bold text-lg">
                                            {isPortuguese ? planetaryRuler.planet_pt : planetaryRuler.planet}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(isPortuguese ? planetaryRuler.qualities_pt : planetaryRuler.qualities).map((q, i) => (
                                        <span key={i} className="px-2 py-1 bg-surface-dark rounded text-gray-400 text-xs">{q}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Zodiac Season */}
                            <div className="bg-card-dark rounded-xl border border-border-dark p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getElementColor(zodiacSun.element)}`}>
                                        {zodiacSun.icon}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">{t.cosmic.zodiacSeason}</p>
                                        <h3 className="text-white font-bold text-lg">
                                            {isPortuguese ? zodiacSun.sign_pt : zodiacSun.sign}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <span className={`px-2 py-1 rounded text-xs ${getElementColor(zodiacSun.element)}`}>
                                        {isPortuguese ? zodiacSun.element_pt : zodiacSun.element}
                                    </span>
                                    {(isPortuguese ? zodiacSun.qualities_pt : zodiacSun.qualities).slice(0, 2).map((q, i) => (
                                        <span key={i} className="px-2 py-1 bg-surface-dark rounded text-gray-400 text-xs">{q}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Best For */}
                            <div className="bg-card-dark rounded-xl border border-border-dark p-5">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                                    {t.cosmic.bestFor}
                                </h3>
                                <ul className="space-y-2">
                                    {(isPortuguese ? bestFor_pt : bestFor).slice(0, 4).map((item, i) => (
                                        <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Avoid */}
                            <div className="bg-card-dark rounded-xl border border-border-dark p-5">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-400">do_not_disturb</span>
                                    {t.cosmic.avoid}
                                </h3>
                                {(isPortuguese ? avoid_pt : avoid).length > 0 ? (
                                    <ul className="space-y-2">
                                        {(isPortuguese ? avoid_pt : avoid).map((item, i) => (
                                            <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm italic">
                                        {isPortuguese ? 'Dia favorável para a maioria das atividades' : 'Favorable day for most activities'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Rituals */}
                        <div className="bg-card-dark rounded-xl border border-border-dark p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">self_improvement</span>
                                {t.cosmic.rituals}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(isPortuguese ? moonPhase.rituals_pt : moonPhase.rituals).map((ritual, i) => (
                                    <span key={i} className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">
                                        {ritual}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Calendar & Energy */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Cosmic Energy */}
                        <div className="bg-gradient-to-br from-primary/20 to-surface-dark rounded-xl border border-primary/30 p-6 text-center">
                            <p className="text-gray-400 text-sm mb-2">{t.cosmic.cosmicEnergy}</p>
                            <div className="text-6xl font-black text-primary mb-2">{cosmicEnergy}</div>
                            <div className="flex justify-center gap-1">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-6 rounded-full ${i < cosmicEnergy ? 'bg-primary' : 'bg-surface-dark'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mini Calendar */}
                        <div className="bg-card-dark rounded-xl border border-border-dark p-3 md:p-4">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setSelectedMonth(m => m === 0 ? 11 : m - 1)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-gray-400">chevron_left</span>
                                </button>
                                <h3 className="text-white font-bold">{monthNames[selectedMonth]} {selectedYear}</h3>
                                <button
                                    onClick={() => setSelectedMonth(m => m === 11 ? 0 : m + 1)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {weekDays.map(day => (
                                    <div key={day} className="text-center text-gray-500 text-xs py-1">{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}
                                {monthDays.map((day) => {
                                    const dayMoon = getMoonPhase(day);
                                    const isToday = day.toDateString() === currentDate.toDateString();

                                    return (
                                        <div
                                            key={day.getDate()}
                                            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors cursor-pointer hover:bg-white/5 ${isToday ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-card-dark' : 'text-gray-400'
                                                }`}
                                            // Removed invalid style properties using undefined variables
                                            style={{} as React.CSSProperties}
                                        >
                                            <div className="absolute inset-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#2a1d34] to-[#1a0f1e] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#a77fd4]/70 text-xs md:text-lg drop-shadow-lg">style</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Today Box */}
                        <div className="bg-surface-dark rounded-xl border border-border-dark p-4 text-center">
                            <p className="text-gray-500 text-sm mb-1">{t.cosmic.today}</p>
                            <p className="text-white font-bold text-lg">
                                {currentDate.toLocaleDateString(isPortuguese ? 'pt-BR' : 'en-US', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Explore Page
const Explore = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { getArchiveLimit, isGuest, isPremium } = usePaywall();
    const [filter, setFilter] = useState<'ALL' | 'MAJOR' | Suit>('ALL');
    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    // Use TAROT_CARDS diretamente para garantir dados completos
    const deck = TAROT_CARDS;

    const filteredDeck = deck.filter(card => {
        if (filter === 'ALL') return true;
        if (filter === 'MAJOR') return card.arcana === 'major';
        return card.suit === filter;
    });

    // Limitar cartas visíveis baseado no tier
    const archiveLimit = getArchiveLimit();
    const visibleCards = isPremium ? filteredDeck : filteredDeck.slice(0, archiveLimit);
    const lockedCards = isPremium ? [] : filteredDeck.slice(archiveLimit);

    const handleCardClick = (card: TarotCard, index: number) => {
        // Visitantes não podem ver nenhuma carta
        if (isGuest) {
            setShowPaywall(true);
            return;
        }
        // Free tier pode ver apenas as primeiras 7
        if (!isPremium && index >= archiveLimit) {
            setShowPaywall(true);
            return;
        }
        const cardSlug = isPortuguese ? card.slug_pt : card.slug;
        navigate(`/${isPortuguese ? 'arquivo-arcano' : 'arcane-archive'}/${cardSlug}`);
    };

    const filterLabels: Record<string, string> = {
        'ALL': t.explore.filters.all,
        'MAJOR': t.explore.filters.major,
        'Wands': t.explore.filters.wands,
        'Cups': t.explore.filters.cups,
        'Swords': t.explore.filters.swords,
        'Pentacles': t.explore.filters.pentacles,
    };

    return (
        <div className="relative flex flex-col min-h-screen overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            <Header />
            <CartDrawer />

            <main className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-6 py-12">
                <div className="mb-10">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors">
                        <span className="material-symbols-outlined text-base">arrow_back</span> {t.cardDetails.back}
                    </button>
                    <style>{`
                        .text-gradient-gold {
                            background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }
                    `}</style>
                    <h1 className="text-4xl md:text-5xl font-black text-gradient-gold mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>{t.explore.title}</h1>
                    <p className="text-gray-400">{t.explore.subtitle}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>{filterLabels['ALL']}</button>
                    <button onClick={() => setFilter('MAJOR')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'MAJOR' ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>{filterLabels['MAJOR']}</button>
                    {Object.values(Suit).filter(s => s !== Suit.NONE).map(suit => (
                        <button key={suit} onClick={() => setFilter(suit)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === suit ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>
                            {filterLabels[suit]}
                        </button>
                    ))}
                </div>

                <p className="text-gray-500 text-sm mb-6">
                    {isPremium ? filteredDeck.length : `${Math.min(archiveLimit, filteredDeck.length)} ${isPortuguese ? 'de' : 'of'} ${filteredDeck.length}`} {t.explore.cards}
                    {!isPremium && !isGuest && (
                        <span className="text-[#a77fd4] ml-2">
                            ({isPortuguese ? `${filteredDeck.length - Math.min(archiveLimit, filteredDeck.length)} bloqueadas` : `${filteredDeck.length - Math.min(archiveLimit, filteredDeck.length)} locked`})
                        </span>
                    )}
                </p>

                {/* Visitante - mostrar aviso de bloqueio */}
                {isGuest && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-[#875faf]/20 to-[#1a1628] border border-[#875faf]/30 rounded-xl text-center">
                        <span className="material-symbols-outlined text-4xl text-[#a77fd4] mb-3">lock</span>
                        <h3 className="text-white font-bold text-lg mb-2">
                            {isPortuguese ? 'Arquivo Arcano Requer Conta' : 'Arcane Archive Requires Account'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {isPortuguese ? 'Crie uma conta gratuita para explorar os significados das cartas.' : 'Create a free account to explore card meanings.'}
                        </p>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="px-6 py-3 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:shadow-lg hover:shadow-purple-900/40 rounded-xl text-white font-bold transition-all"
                        >
                            {isPortuguese ? 'Criar Conta Grátis' : 'Create Free Account'}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filteredDeck.map((card, index) => {
                        const isLocked = !isPremium && index >= archiveLimit;
                        const isGuestLocked = isGuest;

                        return (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(card as unknown as TarotCard, index)}
                                className={`group relative aspect-[2/3.4] rounded-lg overflow-hidden border bg-surface-dark transition-all cursor-pointer shadow-lg ${isLocked || isGuestLocked
                                    ? 'border-white/5 opacity-60 hover:opacity-80'
                                    : 'border-white/5 hover:border-primary/50 hover:-translate-y-2 hover:shadow-primary/20'
                                    }`}
                            >
                                <img
                                    src={card.imageUrl}
                                    alt={card.name}
                                    loading="lazy"
                                    onError={handleImageError}
                                    className={`w-full h-full object-cover transition-opacity ${isLocked || isGuestLocked ? 'opacity-70 blur-[1px]' : 'opacity-80 group-hover:opacity-100'
                                        }`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

                                {/* Lock overlay for locked cards */}
                                {(isLocked || isGuestLocked) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-12 h-12 rounded-full bg-[#875faf]/40 flex items-center justify-center backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-2xl text-[#a77fd4]">lock</span>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 p-3">
                                    <p className="text-white font-bold text-lg leading-tight">{getCardName(card.id, isPortuguese)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Upgrade prompt */}
                {!isPremium && !isGuest && lockedCards.length > 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-[#875faf]/20 to-[#1a1628] border border-[#875faf]/30 rounded-xl text-center">
                        <span className="material-symbols-outlined text-4xl text-[#a77fd4] mb-3">auto_awesome</span>
                        <h3 className="text-white font-bold text-lg mb-2">
                            {isPortuguese ? `Desbloqueie +${lockedCards.length} cartas` : `Unlock +${lockedCards.length} cards`}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {isPortuguese ? 'Faça upgrade para Premium para acessar todas as 78 cartas do Tarot.' : 'Upgrade to Premium to access all 78 Tarot cards.'}
                        </p>
                        <button
                            onClick={() => setShowPaywall(true)}
                            className="px-6 py-3 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:shadow-lg hover:shadow-purple-900/40 rounded-xl text-white font-bold transition-all"
                        >
                            {isPortuguese ? 'Fazer Upgrade' : 'Upgrade Now'}
                        </button>
                    </div>
                )}
            </main>
            <Footer />

            {/* Modals */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="archive"
                onLogin={() => {
                    setShowPaywall(false);
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                }}
                onRegister={() => {
                    setShowPaywall(false);
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                }}
                onCheckout={() => navigate('/checkout')}
            />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />
        </div>
    );
};

// Session Page
const Session = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const { checkAccess } = usePaywall();
    const { incrementReadingCount } = useAuth();
    const spread = (location.state as any)?.spread as Spread;

    const [deck, setDeck] = useState<TarotCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<{ card: TarotCard, flipped: boolean }[]>([]);
    const [question, setQuestion] = useState("");
    const [isShuffling, setIsShuffling] = useState(true);
    const [isSpreadingCards, setIsSpreadingCards] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const isNavigatingRef = useRef(false);

    const getSpreadTranslation = (spreadId: string) => {
        switch (spreadId) {
            case 'three_card': return t.spreads.threeCard;
            case 'celtic_cross': return t.spreads.celticCross;
            case 'love_check': return t.spreads.loveRelationship;
            case 'yes_no': return t.spreads.yesNo;
            case 'card_of_day': return t.spreads.cardOfDay;
            default: return { name: '', description: '', difficulty: '' };
        }
    };

    // Função para embaralhar
    const shuffleDeck = () => {
        setIsShuffling(true);
        setSelectedCards([]);
        setIsSpreadingCards(false);

        // Efeito sonoro de embaralho
        try {
            const shuffleSound = new Audio('/sounds/shuffle.mp3');
            shuffleSound.volume = 0.3;
            shuffleSound.play().catch(() => { });
        } catch (e) { }

        // Animação de embaralhamento (múltiplas trocas rápidas)
        let shuffleCount = 0;
        const shuffleInterval = setInterval(() => {
            setDeck(prevDeck => {
                const newDeck = [...prevDeck];
                // Fazer várias trocas aleatórias
                for (let x = 0; x < 5; x++) {
                    const i = Math.floor(Math.random() * newDeck.length);
                    const j = Math.floor(Math.random() * newDeck.length);
                    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
                }
                return newDeck;
            });
            shuffleCount++;
            if (shuffleCount >= 8) {
                clearInterval(shuffleInterval);
                setTimeout(() => {
                    setIsShuffling(false);
                    setIsSpreadingCards(true);
                }, 300);
            }
        }, 150);
    };

    useEffect(() => {
        if (!spread) {
            navigate('/');
            return;
        }

        // Efeito sonoro de espalhar cartas
        try {
            const spreadSound = new Audio('/sounds/spread.mp3');
            spreadSound.volume = 0.2;
            spreadSound.play().catch(() => { });
        } catch (e) { }

        const newDeck = generateDeck();
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        setDeck(newDeck);

        setTimeout(() => {
            setIsShuffling(false);
            setIsSpreadingCards(true);
        }, 800);
    }, [spread, navigate]);

    const handleCardClick = async (card: TarotCard) => {
        if (selectedCards.length >= spread.cardCount) return;
        if (selectedCards.find(c => c.card.id === card.id)) return;

        // Check paywall access on FIRST card click
        if (selectedCards.length === 0) {
            if (!checkAccess('readings')) {
                setShowPaywall(true);
                return;
            }
            // Increment reading count only when user actually starts picking cards
            await incrementReadingCount();
        }

        // Efeito sonoro de escolha
        try {
            const pickSound = new Audio('/sounds/pick.mp3');
            pickSound.volume = 0.4;
            pickSound.play().catch(() => { });
        } catch (e) { }

        const newSelection = [...selectedCards, { card, flipped: false }];
        setSelectedCards(newSelection);

        setTimeout(() => {
            setSelectedCards(prev =>
                prev.map((item, idx) =>
                    idx === newSelection.length - 1 ? { ...item, flipped: true } : item
                )
            );
        }, 300);

        if (newSelection.length === spread.cardCount) {
            if (isNavigatingRef.current) return;
            isNavigatingRef.current = true;

            setTimeout(() => {
                navigate('/result', {
                    state: {
                        spread,
                        cards: newSelection.map(s => s.card),
                        question,
                        timestamp: Date.now() // Unique ID for this navigation session
                    }
                });
            }, 1000);
        }
    };

    if (!spread) return null;

    return (
        <div className="relative flex flex-col min-h-screen overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            <Header />
            <CartDrawer />

            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="readings"
                onLogin={() => {
                    setShowPaywall(false);
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                }}
                onRegister={() => {
                    setShowPaywall(false);
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                }}
                onCheckout={() => navigate('/checkout')}
            />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />

            <div className="relative z-10 flex-none px-6 pt-6 pb-2 md:px-12 md:pt-10">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-6 max-w-[1200px] mx-auto">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <h1 className="text-white text-3xl md:text-4xl font-black" style={{ fontFamily: "'Crimson Text', serif" }}>{t.session.title}</h1>
                        <p className="text-gray-400">{t.session.subtitle}</p>
                    </div>
                    <button
                        onClick={shuffleDeck}
                        disabled={isShuffling}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:shadow-lg hover:shadow-purple-900/40 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-lg">{isShuffling ? 'sync' : 'shuffle'}</span>
                        {isPortuguese ? 'Embaralhar' : 'Shuffle'}
                    </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar max-w-[1200px] mx-auto">
                    {SPREADS.map((s) => {
                        const spreadTranslation = getSpreadTranslation(s.id);
                        const spreadName = spreadTranslation.name || s.name;
                        return (
                            <button
                                key={s.id}
                                onClick={() => navigate('/session', { state: { spread: s } })}
                                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 border transition-colors ${spread.id === s.id
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface-highlight hover:bg-[#3d2b45] border-border-dark text-white/70 hover:text-white'
                                    }`}
                            >
                                <p className="text-sm font-medium">{spreadName}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Question Input Section */}
                <div className="max-w-[1200px] mx-auto mt-4">
                    <div className="bg-gradient-to-br from-[#1a1230]/60 to-[#12091a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/10 flex-shrink-0">
                                <span className="material-symbols-outlined text-yellow-500 text-[20px]">help</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white text-sm font-medium tracking-wider uppercase opacity-90 mb-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
                                    {isPortuguese ? 'Sua Pergunta (Opcional)' : 'Your Question (Optional)'}
                                </h3>
                                <div className="w-8 h-px bg-gradient-to-r from-yellow-500/40 to-transparent mb-3" />
                                <p className="text-gray-400 text-xs mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {isPortuguese
                                        ? 'Concentre-se em uma questão específica para receber uma orientação mais direcionada.'
                                        : 'Focus on a specific question to receive more targeted guidance.'}
                                </p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder={isPortuguese ? 'Ex: O que preciso saber sobre minha carreira neste momento?' : 'Ex: What do I need to know about my career right now?'}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-0 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all text-white placeholder:text-gray-600 text-sm"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    />
                                    {question && (
                                        <button
                                            onClick={() => setQuestion('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    )}
                                </div>
                                {question && (
                                    <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        {isPortuguese ? 'Sua pergunta será considerada na análise das cartas' : 'Your question will be considered in the card analysis'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedCards.length > 0 && (
                <div className="px-4 md:px-12 py-4 max-w-[1200px] mx-auto w-full">
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 mx-auto">
                        {Array(spread.cardCount).fill(null).map((_, idx) => {
                            const selected = selectedCards[idx];
                            const positionName = spread.positions[idx]?.name || `Card ${idx + 1}`;

                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center gap-2"
                                    style={{
                                        animation: selected ? `cardAppear 0.5s ease-out ${idx * 0.15}s both` : 'none',
                                        width: spread.cardCount >= 10 ? '90px' : spread.cardCount > 5 ? '100px' : spread.cardCount > 3 ? '120px' : '140px'
                                    }}
                                >
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                                        @keyframes cardAppear {
                                            from {
                                                opacity: 0;
                                                transform: scale(0.8);
                                            }
                                            to {
                                                opacity: 1;
                                                transform: scale(1);
                                            }
                                        }
                                        `
                                    }} />
                                    <div className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 ${selected
                                        ? 'shadow-[0_0_40px_rgba(147,17,212,0.5)] border-2 border-[#a77fd4]'
                                        : 'border-2 border-dashed border-border-dark bg-surface-dark/50'
                                        }`}>
                                        {selected ? (
                                            <div className={`card-flip w-full h-full ${selected.flipped ? 'flipped' : ''}`}>
                                                <div className="card-front absolute inset-0 bg-gradient-to-br from-surface-dark to-black flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary text-2xl">style</span>
                                                </div>
                                                <div className="card-back absolute inset-0 bg-black">
                                                    {/* Background layout decorativo */}
                                                    <div className="absolute inset-0 z-0" style={{
                                                        backgroundImage: `
                                                            linear-gradient(45deg, #a77fd4 1px, transparent 1px),
                                                            linear-gradient(-45deg, #a77fd4 1px, transparent 1px)
                                                        `,
                                                        backgroundSize: '20px 20px',
                                                        backgroundPosition: '0 0, 10px 10px',
                                                        opacity: 0.6,
                                                        pointerEvents: 'none'
                                                    }}></div>
                                                    <img src={selected.card.imageUrl} alt={getCardName(selected.card.id, isPortuguese)} onError={handleImageError} className="relative w-full h-full object-cover z-10" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                                                    <div className="absolute bottom-3 left-0 right-0 text-center z-30">
                                                        <h3 className="text-white font-bold text-[10px] md:text-xs">{getCardName(selected.card.id, isPortuguese)}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-600 text-2xl font-bold">{idx + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="uppercase tracking-widest text-[9px] md:text-[10px] font-bold text-primary text-center">
                                        {isPortuguese
                                            ? (spread.positions[idx]?.name_pt || positionName)
                                            : positionName
                                        }
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <main className="flex-1 relative flex items-center justify-center w-full bg-[#0f0b13] py-8 px-4 min-h-[300px] md:min-h-[400px]">
                {isShuffling ? (
                    <div className="flex flex-col items-center justify-center gap-6">
                        <span className="material-symbols-outlined text-6xl text-primary animate-spin">cached</span>
                        <p className="text-white text-2xl animate-pulse">{isPortuguese ? 'Embaralhando...' : 'Shuffling...'}</p>
                    </div>
                ) : (
                    <div className="relative w-full max-w-[95%] h-56 md:h-72 flex items-center justify-center perspective-1000 overflow-visible">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes cardSpread {
                                from {
                                    opacity: 0;
                                    transform: translate(-50%, -50%) rotate(0deg) scale(0.3);
                                }
                                to {
                                    opacity: 1;
                                    transform: translate(-50%, -50%) rotate(var(--card-rotation)) scale(1);
                                }
                            }
                            @keyframes cardShuffle {
                                0%, 100% {
                                    transform: translate(-50%, -50%) rotate(var(--card-rotation)) scale(1);
                                }
                                50% {
                                    transform: translate(-50%, -50%) rotate(calc(var(--card-rotation) + 10deg)) scale(1.05);
                                }
                            }
                            @keyframes cardSelected {
                                0% {
                                    opacity: 1;
                                    transform: translate(-50%, -50%) rotate(var(--card-rotation)) scale(1);
                                }
                                100% {
                                    opacity: 0;
                                    transform: translate(-50%, -50%) rotate(var(--card-rotation)) scale(0.3) translateY(-100px);
                                }
                            }
                            `
                        }} />
                        {deck.map((card, index) => {
                            const isSelected = selectedCards.some(c => c.card.id === card.id);
                            const totalCards = deck.length;

                            // Distribute cards in a 180-degree arc with tight overlap (78 cards total)
                            const angle = (index / (totalCards - 1)) * 200 - 100; // -100 to +100 degrees (200° arc)
                            const radius = 300; // Reduced radius for less curvature
                            const centerX = 50; // Center percentage
                            const centerY = 80; // Higher center to start cards higher up

                            // Calculate position on arc with much tighter spacing for 78 cards
                            const radians = (angle * Math.PI) / 180;
                            const xPos = centerX + (Math.sin(radians) * radius * 0.15); // Reduced to 0.15 for tighter overlap
                            const yPos = centerY - (Math.cos(radians) * radius * 0.18); // Reduced vertical curve

                            // Rotation follows the arc tangent
                            const rotation = angle * 0.9; // Slightly reduced rotation for smoother look

                            return (
                                <div
                                    key={`${card.id}-${index}`}
                                    data-card-id={card.id}
                                    onClick={() => {
                                        if (!isSelected) {
                                            handleCardClick(card);
                                        }
                                    }}
                                    className={`absolute w-14 sm:w-16 md:w-20 lg:w-24 aspect-[2/3.4] rounded-lg border-2 bg-gradient-to-br from-[#1a0d14] via-[#1a0f1e] to-[#0d0810] shadow-2xl cursor-pointer transition-all duration-300 ease-out origin-center ${isSelected ? 'border-[#a77fd4]/80 shadow-[0_0_40px_rgba(167,127,212,0.8)]' : 'border-[#875faf]/40 hover:z-[100] hover:-translate-y-6 hover:scale-105 hover:border-[#a77fd4] hover:shadow-[0_0_30px_rgba(147,17,212,0.6)]'
                                        }`}
                                    style={{
                                        left: `${xPos}%`,
                                        top: `${yPos}%`,
                                        zIndex: isSelected ? -10 : index,
                                        pointerEvents: isSelected ? 'none' : 'auto',
                                        '--card-rotation': `${rotation}deg`,
                                        animation: isSelected
                                            ? `cardSelected 0.6s ease-out forwards`
                                            : isSpreadingCards
                                                ? `cardSpread 0.5s ease-out ${index * 0.01}s both`
                                                : isShuffling
                                                    ? `cardShuffle 0.3s ease-in-out infinite`
                                                    : 'none',
                                    } as React.CSSProperties}
                                >
                                    <div className="absolute inset-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1020] via-[#12091a] to-[#0a0510] flex items-center justify-center">
                                        {/* Premium Gold Mystic Mandala Background */}
                                        <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid slice">
                                            <defs>
                                                <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                                                    <stop offset="0%" stopColor="#d4a850" stopOpacity="0.4" />
                                                    <stop offset="50%" stopColor="#b8942d" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#1a0f1e" stopOpacity="0" />
                                                </radialGradient>
                                                <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#f0d890" />
                                                    <stop offset="50%" stopColor="#d4a850" />
                                                    <stop offset="100%" stopColor="#a67c20" />
                                                </linearGradient>
                                            </defs>
                                            {/* Central mandala glow */}
                                            <circle cx="50" cy="75" r="42" fill="url(#goldGlow)" />
                                            {/* Outer decorative rings - gold */}
                                            <circle cx="50" cy="75" r="40" fill="none" stroke="#d4a850" strokeWidth="0.8" opacity="0.9" />
                                            <circle cx="50" cy="75" r="36" fill="none" stroke="#c9a040" strokeWidth="0.4" strokeDasharray="4 2" opacity="0.7" />
                                            <circle cx="50" cy="75" r="32" fill="none" stroke="#f0d890" strokeWidth="0.6" opacity="0.8" />
                                            <circle cx="50" cy="75" r="26" fill="none" stroke="#d4a850" strokeWidth="0.3" strokeDasharray="2 4" opacity="0.6" />
                                            <circle cx="50" cy="75" r="20" fill="none" stroke="#e8c060" strokeWidth="0.5" opacity="0.7" />
                                            <circle cx="50" cy="75" r="12" fill="none" stroke="#f0d890" strokeWidth="0.6" opacity="0.8" />
                                            {/* Cross lines - gold */}
                                            <line x1="50" y1="30" x2="50" y2="120" stroke="url(#goldLine)" strokeWidth="0.4" opacity="0.6" />
                                            <line x1="5" y1="75" x2="95" y2="75" stroke="url(#goldLine)" strokeWidth="0.4" opacity="0.6" />
                                            {/* Diagonal lines - gold */}
                                            <line x1="18" y1="43" x2="82" y2="107" stroke="#d4a850" strokeWidth="0.3" opacity="0.5" />
                                            <line x1="82" y1="43" x2="18" y2="107" stroke="#d4a850" strokeWidth="0.3" opacity="0.5" />
                                            {/* Star/diamond points - brighter gold */}
                                            <polygon points="50,33 53,40 50,37 47,40" fill="#f0d890" opacity="0.9" />
                                            <polygon points="50,117 53,110 50,113 47,110" fill="#f0d890" opacity="0.9" />
                                            <polygon points="8,75 15,78 12,75 15,72" fill="#f0d890" opacity="0.9" />
                                            <polygon points="92,75 85,78 88,75 85,72" fill="#f0d890" opacity="0.9" />
                                            {/* Corner sun decorations */}
                                            <circle cx="15" cy="18" r="10" fill="none" stroke="#d4a850" strokeWidth="0.4" opacity="0.6" />
                                            <circle cx="15" cy="18" r="6" fill="none" stroke="#f0d890" strokeWidth="0.3" opacity="0.5" />
                                            <circle cx="85" cy="18" r="10" fill="none" stroke="#d4a850" strokeWidth="0.4" opacity="0.6" />
                                            <circle cx="85" cy="18" r="6" fill="none" stroke="#f0d890" strokeWidth="0.3" opacity="0.5" />
                                            <circle cx="15" cy="132" r="10" fill="none" stroke="#d4a850" strokeWidth="0.4" opacity="0.6" />
                                            <circle cx="15" cy="132" r="6" fill="none" stroke="#f0d890" strokeWidth="0.3" opacity="0.5" />
                                            <circle cx="85" cy="132" r="10" fill="none" stroke="#d4a850" strokeWidth="0.4" opacity="0.6" />
                                            <circle cx="85" cy="132" r="6" fill="none" stroke="#f0d890" strokeWidth="0.3" opacity="0.5" />
                                            {/* Center sun symbol */}
                                            <circle cx="50" cy="75" r="6" fill="none" stroke="#f0d890" strokeWidth="0.8" opacity="0.9" />
                                            <circle cx="50" cy="75" r="3" fill="#d4a850" opacity="0.7" />
                                            {/* Small rays from center */}
                                            <line x1="50" y1="65" x2="50" y2="68" stroke="#f0d890" strokeWidth="0.5" opacity="0.8" />
                                            <line x1="50" y1="82" x2="50" y2="85" stroke="#f0d890" strokeWidth="0.5" opacity="0.8" />
                                            <line x1="40" y1="75" x2="43" y2="75" stroke="#f0d890" strokeWidth="0.5" opacity="0.8" />
                                            <line x1="57" y1="75" x2="60" y2="75" stroke="#f0d890" strokeWidth="0.5" opacity="0.8" />
                                        </svg>
                                        {/* Ornate border frames - gold */}
                                        <div className="absolute inset-[3px] rounded-md border-2 border-[#d4a850]/40"></div>
                                        <div className="absolute inset-[7px] rounded border border-[#f0d890]/25"></div>
                                        <div className="absolute inset-[10px] rounded-sm border border-[#d4a850]/15"></div>
                                        {/* Center icon */}
                                        <span className="material-symbols-outlined text-[#f0d890] text-sm md:text-xl drop-shadow-[0_0_8px_rgba(212,168,80,0.5)] z-10">auto_awesome</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <div className="bg-surface-dark border-t border-white/5 py-4 text-center">
                <p className="text-gray-400 text-sm">
                    {selectedCards.length === 0 ? t.session.focusMessage :
                        selectedCards.length < spread.cardCount ? `${t.session.cardsRemaining}: ${spread.cardCount - selectedCards.length}` :
                            t.common.loading}
                </p>
            </div>
        </div>
    );
};

// Results Page
const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const { checkAccess } = usePaywall();
    const { user } = useAuth();
    const state = location.state as any;
    const hasSavedRef = useRef(false);

    const [analysis, setAnalysis] = useState<ReadingAnalysis | null>(null);
    const [structuredSynthesis, setStructuredSynthesis] = useState<StructuredSynthesis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const fetchedRef = useRef(false); // Prevent duplicate API calls

    // Reset hasSavedRef when state changes significantly
    useEffect(() => {
        // Only reset if this is a actually a new session (different cards or different timestamp)
        hasSavedRef.current = false;
        fetchedRef.current = false;
    }, [state?.timestamp, state?.spread?.id]);

    useEffect(() => {
        if (!state?.spread || !state?.cards) {
            navigate('/');
            return;
        }

        // Prevent duplicate calls in React Strict Mode
        if (fetchedRef.current) {
            console.log("⏭️ Skipping duplicate API call");
            if (isLoading && structuredSynthesis) {
                setIsLoading(false);
            }
            return;
        }
        fetchedRef.current = true;

        const fetchInterpretation = async () => {
            const reversedIndices = state.cards
                .map((_: any, idx: number) => Math.random() < 0.2 ? idx : -1)
                .filter((idx: number) => idx !== -1);

            const session: ReadingSession = {
                spread: state.spread,
                cards: state.cards,
                reversedIndices,
                question: state.question,
                date: new Date().toLocaleDateString(isPortuguese ? 'pt-BR' : 'en-US')
            };

            // Fetch structured synthesis from Gemini (single API call)
            const rawSynthesis = isGeminiConfigured()
                ? await getStructuredSynthesis(session, isPortuguese)
                : null;

            // Converter para formato legado para compatibilidade com UI existente
            const synthesis = rawSynthesis
                ? convertToLegacySynthesis(rawSynthesis, state.spread.id)
                : null;

            setAnalysis(null); // No longer using the old analysis format
            setStructuredSynthesis(synthesis);
            setIsLoading(false);

            // Verificar se o usuário atingiu o limite de tiragens
            if (!checkAccess('readings')) {
                setShowPaywall(true);
            }

            // Save to history (both localStorage and Supabase if logged in)
            try {
                // Mapa correto de spreads com tags certas (5 spreads)
                const spreadNameMap: Record<string, { name: string; tag: string; color: string }> = {
                    'card_of_day': {
                        name: isPortuguese ? 'Carta do Dia' : 'Card of the Day',
                        tag: isPortuguese ? 'DIÁRIA' : 'DAILY',
                        color: 'text-yellow-400 bg-yellow-500/10'
                    },
                    'yes_no': {
                        name: isPortuguese ? 'Sim ou Não' : 'Yes or No',
                        tag: isPortuguese ? 'RÁPIDA' : 'QUICK',
                        color: 'text-blue-400 bg-blue-500/10'
                    },
                    'three_card': {
                        name: isPortuguese ? 'Três Cartas' : 'Three Cards',
                        tag: isPortuguese ? 'PADRÃO' : 'STANDARD',
                        color: 'text-primary bg-primary/10'
                    },
                    'love_check': {
                        name: isPortuguese ? 'Amor e Relacionamento' : 'Love & Relationship',
                        tag: isPortuguese ? 'AMOR' : 'LOVE',
                        color: 'text-pink-400 bg-pink-500/10'
                    },
                    'celtic_cross': {
                        name: isPortuguese ? 'Cruz Celta' : 'Celtic Cross',
                        tag: isPortuguese ? 'COMPLETA' : 'FULL',
                        color: 'text-green-400 bg-green-500/10'
                    }
                };

                const spreadInfo = spreadNameMap[state.spread.id] || {
                    name: state.spread.name,
                    tag: isPortuguese ? 'OUTRO' : 'OTHER',
                    color: 'text-gray-400 bg-gray-500/10'
                };

                const historyItem = {
                    id: Date.now(),
                    date: new Date().toLocaleString(isPortuguese ? 'pt-BR' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    spreadName: spreadInfo.name,
                    typeBadge: spreadInfo.tag,
                    typeColor: spreadInfo.color,
                    spreadId: state.spread.id,
                    previewCards: state.cards.map((c: TarotCard) => c.imageUrl),
                    cardNames: state.cards.map((c: TarotCard) => c.name),
                    positions: state.spread.positions.map((p: any) => p.name),
                    notes: synthesis?.sintese || '',
                    comment: '',
                    rating: 0
                };

                // Save to localStorage (always) - Only if not already saved
                if (!hasSavedRef.current) {
                    hasSavedRef.current = true;
                    const existing = JSON.parse(localStorage.getItem('tarot-history') || '[]') as any[];

                    // Create a unique signature for this reading based on cards
                    const cardSignature = state.cards.map((c: TarotCard) => c.id).sort().join(',');

                    // Check for duplicates: same cards in last 5 seconds
                    const isDuplicate = existing.some((item: any) => {
                        const existingSignature = item.cardNames?.map((name: string) => {
                            const card = TAROT_CARDS.find(c => c.name === name);
                            return card?.id;
                        }).filter(Boolean).sort().join(',');

                        return existingSignature === cardSignature &&
                            (Date.now() - item.id) < 5000;
                    });

                    if (!isDuplicate) {
                        const updated = [historyItem, ...existing].slice(0, 20); // Keep last 20
                        localStorage.setItem('tarot-history', JSON.stringify(updated));

                        // Save to Supabase if user is logged in, or to localStorage if guest
                        if (user) {
                            // Usar nova função que formata resumo completo automaticamente
                            await saveReadingWithSummary(
                                user.id,
                                state.spread.id,
                                state.cards,
                                rawSynthesis, // Passa a síntese bruta para formatação
                                state.question || '',
                                isPortuguese
                            );
                        } else {
                            // Save guest reading for later recovery
                            const summary = extractSummaryFromSynthesis(rawSynthesis, state.question);
                            const formattedSynthesis = formatReadingSummary(summary, state.spread.id, isPortuguese);
                            saveGuestReading({
                                spreadType: state.spread.id,
                                cards: state.cards,
                                question: state.question || '',
                                synthesis: formattedSynthesis,
                                rawSynthesis: rawSynthesis,
                                createdAt: new Date().toISOString()
                            });
                        }
                    }
                }
            } catch (e) {
                console.error('❌ Failed to save to history:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterpretation();
    }, [state?.spread?.id, state?.cards, state?.question, isPortuguese, user?.id]);

    if (!state?.spread) return null;

    const { spread, cards } = state;

    const getArcanaType = (card: TarotCard): string => {
        return card.arcana === ArcanaType.MAJOR
            ? (isPortuguese ? 'Arcano Maior' : 'Major Arcana')
            : (isPortuguese ? 'Arcano Menor' : 'Minor Arcana');
    };

    return (
        <div className="relative flex flex-col min-h-screen text-white overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            <Header />
            <CartDrawer />

            {/* Hide content when paywall is shown */}
            <main className={`relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 ${showPaywall ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>
                {/* Page Heading & Actions */}
                <div className="flex flex-col md:flex-row flex-wrap justify-between gap-6 mb-10 items-start md:items-end">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            <span>{new Date().toLocaleDateString(isPortuguese ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white" style={{ fontFamily: "'Crimson Text', serif" }}>{t.result.title}</h1>
                        <p className="text-gray-400 text-lg font-normal leading-relaxed mt-1">
                            {spread.name} {state.question && `— ${isPortuguese ? 'Foco' : 'Focus'}: ${state.question}`}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/history')}
                            className="flex-1 md:flex-none h-11 px-6 rounded-lg border border-white/10 bg-surface-dark hover:bg-white/5 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">history</span>
                            <span>{isPortuguese ? 'Histórico' : 'History'}</span>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 md:flex-none h-11 px-6 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-[0_0_20px_rgba(147,17,212,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">cached</span>
                            <span>{t.result.newReading}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Synthesis & Cards Grid */}
                    <div className="lg:col-span-5 flex flex-col gap-8 order-2 lg:order-1">
                        {/* Synthesis Card */}
                        <div className="bg-gradient-to-br from-primary/20 to-surface-dark border border-primary/30 rounded-xl p-6 md:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-[120px] text-primary">auto_awesome</span>
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">psychology</span>
                                    {t.result.synthesis}
                                </h2>
                                {isLoading ? (
                                    <div className="space-y-3 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-full"></div>
                                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                                        <div className="h-4 bg-white/10 rounded w-4/5"></div>
                                        <p className="text-primary text-xs mt-4">{t.result.loading}</p>
                                    </div>
                                ) : structuredSynthesis ? (
                                    <>
                                        {/* Tema Central */}
                                        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                                            <span className="text-[#a77fd4] text-xs font-bold uppercase tracking-wider">{isPortuguese ? 'Tema Central' : 'Central Theme'}</span>
                                            <p className="text-white font-medium mt-1">{structuredSynthesis.tema_central}</p>
                                        </div>

                                        {/* Pergunta do Consulente e Resposta */}
                                        {state?.question && state.question.trim() && (
                                            <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <span className="material-symbols-outlined text-yellow-500 text-lg mt-0.5">help</span>
                                                    <div>
                                                        <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">{isPortuguese ? 'Sua Pergunta' : 'Your Question'}</span>
                                                        <p className="text-white font-medium mt-1">"{state.question}"</p>
                                                    </div>
                                                </div>
                                                {structuredSynthesis.resposta_pergunta && (
                                                    <div className="mt-3 pt-3 border-t border-yellow-500/20">
                                                        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">{isPortuguese ? 'O que as Cartas Revelam' : 'What the Cards Reveal'}</span>
                                                        <p className="text-gray-200 mt-1 leading-relaxed">{structuredSynthesis.resposta_pergunta}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Síntese Principal */}
                                        <p className="text-gray-200 leading-relaxed text-base mb-4">
                                            {structuredSynthesis.sintese}
                                        </p>

                                        {/* Conexões */}
                                        {structuredSynthesis.conexoes && structuredSynthesis.conexoes.length > 0 && (
                                            <div className="mb-4">
                                                <span className="text-[#a77fd4] text-xs font-bold uppercase tracking-wider">{isPortuguese ? 'Conexões entre as Cartas' : 'Card Connections'}</span>
                                                <ul className="mt-2 space-y-1">
                                                    {structuredSynthesis.conexoes.map((conexao, i) => (
                                                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                            <span className="text-[#875faf] mt-0.5">•</span>
                                                            {conexao}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Elementos em Destaque */}
                                        {structuredSynthesis.elementos_destaque && structuredSynthesis.elementos_destaque.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {structuredSynthesis.elementos_destaque.map((elemento, i) => (
                                                    <span key={i} className="px-2 py-1 rounded-md bg-[#875faf]/20 text-[#a77fd4] text-xs">
                                                        {elemento}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pergunta Reflexiva */}
                                        <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                                            <p className="text-primary text-sm font-medium flex items-start gap-2">
                                                <span className="material-symbols-outlined text-lg mt-0.5">lightbulb</span>
                                                {structuredSynthesis.pergunta_reflexiva}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-200 leading-relaxed text-base mb-4">
                                            {isPortuguese ? 'Configure a chave da API Gemini para obter sínteses personalizadas.' : 'Configure the Gemini API key to get personalized syntheses.'}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Visual Cards Grid */}
                        <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">
                                {isPortuguese ? 'Mesa de Cartas' : 'Card Spread'}
                            </h3>
                            <div className={`grid gap-3 ${cards.length <= 3 ? 'grid-cols-3' : cards.length <= 5 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                                {cards.map((card: TarotCard, idx: number) => {
                                    const position = spread.positions[idx];
                                    return (
                                        <div key={card.id} className="relative group cursor-pointer overflow-hidden rounded-lg border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20 aspect-[2/3]">
                                            {showPaywall ? (
                                                // Placeholder when paywall is active
                                                <div className="w-full h-full bg-gradient-to-br from-[#1f1230] to-[#1a0f1e] flex items-center justify-center border border-[#a77fd4]/20">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-[#a77fd4]/60 text-4xl">lock</span>
                                                        <span className="text-[#a77fd4]/40 text-xs font-bold uppercase text-center px-2">{idx + 1}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Show card image when paywall is not active
                                                <>
                                                    <div
                                                        className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                                                        style={{ backgroundImage: `url("${card.imageUrl}")` }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 md:p-3">
                                                        <span className="text-[10px] text-primary font-bold uppercase truncate">{idx + 1}. {position?.name}</span>
                                                        <span className="text-white font-bold text-xs md:text-sm truncate">{getCardName(card.id, isPortuguese)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Interpretation */}
                    <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <h2 className="text-white text-2xl font-bold">{t.result.interpretation}</h2>
                        </div>

                        {/* Card Detail Items */}
                        {cards.map((card: TarotCard, idx: number) => {
                            const position = spread.positions[idx];
                            const cardInterpretation = analysis?.cards?.[idx];
                            const cardLore = getStaticLore(card, isPortuguese);

                            return (
                                <article
                                    key={card.id}
                                    className="flex flex-col sm:flex-row gap-5 p-5 rounded-xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-all shadow-sm hover:shadow-lg hover:shadow-black/20 group"
                                >
                                    {/* Card Image */}
                                    <div className="w-full sm:w-28 aspect-[2/3] shrink-0 rounded-lg overflow-hidden relative shadow-md">
                                        <div
                                            className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                            style={{ backgroundImage: `url("${card.imageUrl}")` }}
                                        />
                                        <div className="absolute top-2 left-2 size-6 flex items-center justify-center rounded-full bg-black/60 text-white text-xs font-bold border border-white/10">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    {/* Card Info */}
                                    <div className="flex flex-col flex-1 gap-3">
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1 block">
                                                    {isPortuguese ? 'Posição' : 'Position'}: {position?.name}
                                                </span>
                                                <h3 className="text-white text-xl font-bold">{getCardName(card.id, isPortuguese)}</h3>
                                            </div>
                                            <span className="px-2 py-1 rounded bg-white/5 text-gray-400 text-xs font-medium">
                                                {getArcanaType(card)}
                                            </span>
                                        </div>

                                        {/* Interpretation */}
                                        {isLoading ? (
                                            <div className="space-y-2 animate-pulse">
                                                <div className="h-3 bg-white/10 rounded w-full"></div>
                                                <div className="h-3 bg-white/10 rounded w-5/6"></div>
                                                <div className="h-3 bg-white/10 rounded w-4/5"></div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {cardInterpretation?.interpretation || cardLore?.generalMeaning}
                                            </p>
                                        )}

                                        {/* Keywords */}
                                        {cardLore?.keywords && (
                                            <div className="mt-auto pt-3 border-t border-white/5 flex flex-wrap gap-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">key</span>
                                                    {isPortuguese ? 'Palavras-chave' : 'Keywords'}:
                                                </span>
                                                {cardLore.keywords.slice(0, 3).map((kw, i) => (
                                                    <span key={i} className="text-primary">{kw}{i < 2 && cardLore.keywords[i + 1] ? ',' : ''}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Paywall Overlay & Modal */}
            {showPaywall && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            )}

            <PaywallModal
                isOpen={showPaywall}
                onClose={() => navigate('/')}
                feature="readings"
                onLogin={() => {
                    setShowPaywall(false);
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                }}
                onRegister={() => {
                    setShowPaywall(false);
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                }}
            />

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />

            {/* Apply overflow hidden when paywall is open */}
            {showPaywall && <style>{`body { overflow: hidden; }`}</style>}

            {/* Guest Conversion Banner */}
            {!user && !isLoading && structuredSynthesis && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-purple-900/95 backdrop-blur-md border-t border-purple-500/30 px-4 py-4 md:py-5">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-center md:text-left">
                            <span className="hidden md:flex w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 items-center justify-center">
                                <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
                            </span>
                            <div>
                                <p className="text-white font-bold text-lg">
                                    {isPortuguese ? 'Salve sua leitura para sempre!' : 'Save your reading forever!'}
                                </p>
                                <p className="text-purple-200 text-sm">
                                    {isPortuguese
                                        ? 'Crie uma conta grátis para acessar seu histórico e desbloquear mais recursos'
                                        : 'Create a free account to access your history and unlock more features'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setAuthModalMode('login');
                                    setShowAuthModal(true);
                                }}
                                className="px-5 py-2.5 rounded-lg border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                            >
                                {isPortuguese ? 'Entrar' : 'Sign In'}
                            </button>
                            <button
                                onClick={() => {
                                    setAuthModalMode('register');
                                    setShowAuthModal(true);
                                }}
                                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-sm font-bold hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-900/30"
                            >
                                {isPortuguese ? 'Criar Conta Grátis' : 'Create Free Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

// ========== PHYSICAL READING INTERPRETATION PAGE ==========
const Interpretacao = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { user, tier } = useAuth();
    const { checkAccess, isPremium } = usePaywall();

    // State
    const [spreadType, setSpreadType] = useState<string>('');
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [question, setQuestion] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCardSearch, setShowCardSearch] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [interpretation, setInterpretation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const [savedToHistory, setSavedToHistory] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Spread type configurations
    const spreadConfigs: Record<string, { cardCount: number; positions: string[] }> = {
        yes_no: { cardCount: 1, positions: [isPortuguese ? 'Resposta' : 'Answer'] },
        three_card: { cardCount: 3, positions: isPortuguese ? ['Passado', 'Presente', 'Futuro'] : ['Past', 'Present', 'Future'] },
        five_card: { cardCount: 5, positions: isPortuguese ? ['Centro', 'Cruzamento', 'Passado', 'Futuro', 'Resultado'] : ['Center', 'Crossing', 'Past', 'Future', 'Outcome'] },
        seven_card: { cardCount: 7, positions: isPortuguese ? ['Passado', 'Presente', 'Futuro', 'Conselho', 'Ambiente', 'Esperanças', 'Resultado'] : ['Past', 'Present', 'Future', 'Advice', 'Environment', 'Hopes', 'Outcome'] },
        celtic_cross: { cardCount: 10, positions: isPortuguese ? ['Significador', 'Cruzamento', 'Base', 'Passado', 'Coroa', 'Futuro', 'Eu', 'Ambiente', 'Esperanças/Medos', 'Resultado'] : ['Significator', 'Crossing', 'Foundation', 'Past', 'Crown', 'Future', 'Self', 'Environment', 'Hopes/Fears', 'Outcome'] },
        custom: { cardCount: 15, positions: [] }
    };

    // Filter cards based on search query
    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return TAROT_CARDS;
        const query = searchQuery.toLowerCase();
        return TAROT_CARDS.filter(card => {
            const name = isPortuguese ? card.name_pt : card.name;
            return name.toLowerCase().includes(query) ||
                card.name.toLowerCase().includes(query) ||
                card.name_pt.toLowerCase().includes(query);
        });
    }, [searchQuery, isPortuguese]);

    // Group cards by arcana/suit
    const groupedCards = useMemo(() => {
        const groups: { title: string; cards: typeof TAROT_CARDS }[] = [];

        const major = filteredCards.filter(c => c.arcana === 'major');
        if (major.length > 0) {
            groups.push({ title: (t as any).interpretation?.majorArcana || 'Major Arcana', cards: major });
        }

        const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
        const suitNames: Record<string, string> = isPortuguese
            ? { Wands: 'Paus', Cups: 'Copas', Swords: 'Espadas', Pentacles: 'Ouros' }
            : { Wands: 'Wands', Cups: 'Cups', Swords: 'Swords', Pentacles: 'Pentacles' };

        suits.forEach(suit => {
            const suitCards = filteredCards.filter(c => c.suit === suit);
            if (suitCards.length > 0) {
                groups.push({ title: suitNames[suit], cards: suitCards });
            }
        });

        return groups;
    }, [filteredCards, isPortuguese, t]);

    // Handle spread type change
    const handleSpreadTypeChange = (type: string) => {
        setSpreadType(type);
        const config = spreadConfigs[type];
        if (config) {
            setSelectedCards(Array(config.cardCount).fill(''));
        }
    };

    // Handle card selection
    const handleCardSelect = (card: typeof TAROT_CARDS[0]) => {
        if (activeCardIndex === null) return;

        const cardName = isPortuguese ? card.name_pt : card.name;
        const newCards = [...selectedCards];
        newCards[activeCardIndex] = cardName;
        setSelectedCards(newCards);
        setShowCardSearch(false);
        setSearchQuery('');
        setActiveCardIndex(null);
    };

    // Open card search for a specific position
    const openCardSearch = (index: number) => {
        setActiveCardIndex(index);
        setShowCardSearch(true);
        setSearchQuery('');
        setTimeout(() => searchInputRef.current?.focus(), 100);
    };

    // Remove card from position
    const removeCard = (index: number) => {
        const newCards = [...selectedCards];
        newCards[index] = '';
        setSelectedCards(newCards);
    };

    // Render individual card
    const renderCard = (index: number, position: string) => {
        const cardName = selectedCards[index];
        const cardData = cardName ? TAROT_CARDS.find(c => c.name === cardName || c.name_pt === cardName) : null;

        return (
            <div key={index} className="relative flex flex-col">
                <div
                    onClick={() => openCardSearch(index)}
                    className={`aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all ${cardName
                        ? 'border-2 border-primary/50'
                        : 'border-2 border-dashed border-border-dark hover:border-primary/30 bg-surface-dark/50'
                        }`}
                >
                    {cardName && cardData ? (
                        <div className="relative w-full h-full">
                            <img
                                src={cardData.imageUrl}
                                alt={cardName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/150x260/1c1022/9311d4?text=Tarot';
                                }}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
                                <span className="text-white text-[10px] text-center font-medium leading-tight block">{cardName}</span>
                            </div>
                        </div>
                    ) : cardName ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-primary/10">
                            <span className="material-symbols-outlined text-primary text-2xl mb-1">style</span>
                            <span className="text-white text-xs text-center font-medium leading-tight">{cardName}</span>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                            <span className="material-symbols-outlined text-gray-500 text-2xl mb-1">add</span>
                            <span className="text-gray-500 text-xs text-center">{position}</span>
                        </div>
                    )}
                </div>
                {cardName && (
                    <button
                        onClick={(e) => { e.stopPropagation(); removeCard(index); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors z-10"
                    >
                        <span className="material-symbols-outlined text-white text-sm">close</span>
                    </button>
                )}
                <div className="mt-2 text-center">
                    <span className="text-xs text-yellow-400 font-semibold">{position}</span>
                </div>
            </div>
        );
    };

    // Submit interpretation request
    const handleSubmit = async () => {
        const ti = (t as any).interpretation;
        if (!spreadType) {
            setError(ti?.selectSpreadType || 'Select the spread type');
            return;
        }
        { ti.title || (isPortuguese ? 'Interpretação de Tiragem' : 'Physical Reading Interpretation') }
        const filledCards = selectedCards.filter(c => c.trim() !== '');
        if (filledCards.length === 0) {
            setError(ti?.addMinCards || 'Add at least one card');
            return;
        }

        // Physical readings require premium (or at least being logged in to use AI)
        if (!checkAccess('physicalReading')) {
            setShowPaywall(true);
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/physical-reading', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadType,
                    cards: filledCards,
                    question: question.trim() || undefined,
                    isPortuguese
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get interpretation');
            }

            setInterpretation(data.interpretation);

            if (user?.id) {
                const { savePhysicalReading } = await import('./services/readingsService');
                const saved = await savePhysicalReading(user.id, {
                    spreadType,
                    cards: filledCards,
                    question: question.trim() || undefined,
                    interpretation: data.interpretation
                }, isPortuguese);

                if (saved) {
                    setSavedToHistory(true);
                }
            }
        } catch (err: any) {
            console.error('Interpretation error:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setSpreadType('');
        setSelectedCards([]);
        setQuestion('');
        setInterpretation(null);
        setError(null);
        setSavedToHistory(false);
    };

    const ti = (t as any).interpretation || {};

    return (
        <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            {/* Stars Background */}
            <MinimalStarsBackground />

            <Header />
            <CartDrawer />

            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="aiSynthesis"
                onLogin={() => {
                    setShowPaywall(false);
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                }}
                onRegister={() => {
                    setShowPaywall(false);
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                }}
                onCheckout={() => navigate('/checkout')}
            />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authModalMode} />

            {/* Hero Section - Home Page Style */}
            <section className="relative pt-12 pb-8 md:pb-10 px-6 md:px-12 overflow-hidden z-10">
                <div className="relative max-w-[1200px] z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                        {/* Left Side - Text Content */}
                        <div className="flex-1 text-left pl-4 md:pl-12 lg:pl-20">
                            {/* Text Wrapper - Moved Up */}
                            <div className="lg:-mt-12">
                                {/* Premium Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 mb-4">
                                    <span className="material-symbols-outlined text-amber-400 text-sm">auto_awesome</span>
                                    <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                                        {isPortuguese ? 'Premium' : 'Premium Feature'}
                                    </span>
                                </div>

                                {/* Golden Title */}

                                <h1
                                    className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 leading-tight whitespace-nowrap"
                                    style={{
                                        fontFamily: "'Crimson Text', serif",
                                        background: 'linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {isPortuguese ? 'Interpretação de Tiragem' : 'Reading Interpretation'}
                                </h1>

                                {/* Subtitle */}
                                <p className="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed mb-2 break-words">
                                    {(ti.subtitle || (isPortuguese ? 'Transforme sua tiragem real em uma leitura clara e objetiva com IA' : 'Transform your real spread into a clear and objective reading with AI'))}
                                </p>

                                {/* Description */}
                                <p className="text-gray-500 text-sm max-w-lg mb-4 break-words">
                                    {(ti.heroDescription || (isPortuguese
                                        ? 'Fez uma tiragem física com seu baralho? Insira as cartas que saíram e receba uma interpretação profissional.'
                                        : 'Did a physical spread with your deck? Enter the cards that came up and receive a professional interpretation.'))}
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                                <button
                                    onClick={() => document.getElementById('interpretation-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:shadow-lg hover:shadow-purple-900/40 rounded-xl text-white font-bold transition-all justify-center text-xs md:text-sm"
                                >
                                    <span className="material-symbols-outlined text-base">edit_note</span>
                                    {isPortuguese ? 'Começar Interpretação' : 'Start Interpretation'}
                                </button>
                                <button
                                    onClick={() => navigate(isPremium ? '/' : '/checkout')}
                                    className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-yellow-500/40 rounded-xl text-yellow-300 font-bold transition-all hover:bg-yellow-500/5 hover:border-yellow-500 hover:text-yellow-400 justify-center text-xs md:text-sm"
                                >
                                    <span className="material-symbols-outlined text-base">star</span>
                                    {isPortuguese ? 'Assinar Premium' : 'Subscribe Premium'}
                                </button>
                            </div>
                        </div>

                        {/* Right Side - Tarot Cards Display (fixed, usando imageUrl do TAROT_CARDS) */}
                        <div className="relative w-full lg:w-auto lg:flex-shrink-0 mt-8 md:mt-10 lg:mt-8">
                            <div className="relative w-[300px] h-[320px] md:w-[360px] md:h-[380px] mx-auto">
                                {/* Cartas fixas, usando imageUrl do TAROT_CARDS */}
                                {['maj_0', 'maj_1', 'maj_2', 'maj_3', 'maj_4'].map((id, idx) => {
                                    const card = TAROT_CARDS.find(c => c.id === id);
                                    const angle = (idx - 2) * 15;
                                    const left = 32 + (idx - 2) * 20;
                                    return card ? (
                                        <div
                                            key={id}
                                            className={`absolute w-[100px] md:w-[120px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 ${idx === 2 ? 'border-amber-500/30' : 'border-white/10'}`}
                                            style={{ left: `${left}%`, top: `${Math.abs(angle) * 0.5}%`, transform: `rotate(${angle}deg)`, zIndex: 10 + idx }}
                                        >
                                            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : null;
                                })}
                                {/* Glow effect behind cards */}
                                <div className="absolute inset-0 -z-10">
                                    <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-purple-500/20 rounded-full blur-[80px]" />
                                    <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-amber-500/15 rounded-full blur-[60px]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section id="interpretation-form" className="px-6 md:px-12 pb-20 relative">
                {/* Blue Blur Background - Behind Form Only */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
                    <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[180px]" />
                    <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-blue-700/8 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-full mx-auto relative z-10">
                    {!interpretation ? (
                        <div className="home-glass-card rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] relative p-6 md:p-10 before:absolute before:inset-0 before:bg-black/40 before:-z-10 backdrop-blur-md bg-gray-900/50">
                            <div className="relative z-10">
                                <div className="mb-16">
                                    <h2 className="text-3xl font-bold text-yellow-500 mb-3" style={{ fontFamily: "'Crimson Text', serif" }}>
                                        {ti.formTitle || 'Your Spread'}
                                    </h2>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {isPortuguese
                                            ? 'Selecione o tipo de tiragem, adicione as cartas que saíram e receba uma interpretação profunda e personalizada pela IA.'
                                            : 'Select the spread type, add the cards that came up and receive a deep and personalized interpretation by AI.'}
                                    </p>
                                </div>

                                {/* Spread Type Selector */}
                                <div className="mb-8">
                                    <label className="block text-base font-semibold text-white mb-3">
                                        {ti.spreadTypeLabel || 'Spread Type'}
                                    </label>
                                    <select
                                        value={spreadType}
                                        onChange={(e) => handleSpreadTypeChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-surface-dark/90 border-2 border-border-dark/60 hover:border-primary/50 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                                    >
                                        <option value="">{ti.selectSpreadType || 'Select spread type...'}</option>
                                        <option value="yes_no">{ti.spreadTypes?.yes_no || 'Yes or No (1 card)'}</option>
                                        <option value="three_card">{ti.spreadTypes?.three_card || '3 cards (Past / Present / Future)'}</option>
                                        <option value="five_card">{ti.spreadTypes?.five_card || '5 cards (Simple Cross)'}</option>
                                        <option value="seven_card">{ti.spreadTypes?.seven_card || '7 cards'}</option>
                                        <option value="custom">{ti.spreadTypes?.custom || 'Other (custom)'}</option>
                                    </select>
                                </div>

                                {/* Card Selection */}
                                {spreadType && (
                                    <div className="mb-8">
                                        <label className="block text-base font-semibold text-white mb-4">
                                            {ti.cardsLabel || 'Spread Cards'}
                                        </label>

                                        {/* Yes/No - 1 card centered */}
                                        {spreadType === 'yes_no' && (
                                            <div className="flex justify-center">
                                                <div className="w-28">
                                                    {renderCard(0, spreadConfigs[spreadType].positions[0])}
                                                </div>
                                            </div>
                                        )}

                                        {/* Three Card - Past | Present | Future in line */}
                                        {spreadType === 'three_card' && (
                                            <div className="flex justify-center gap-6">
                                                <div className="w-28">{renderCard(0, spreadConfigs[spreadType].positions[0])}</div>
                                                <div className="w-28">{renderCard(1, spreadConfigs[spreadType].positions[1])}</div>
                                                <div className="w-28">{renderCard(2, spreadConfigs[spreadType].positions[2])}</div>
                                            </div>
                                        )}

                                        {/* Five Card - Simple Cross Layout */}
                                        {/* Layout:     [Coroa/4]
                                                   [Passado/2] [Centro/0] [Futuro/3]
                                                        [Base/1]           */}
                                        {spreadType === 'five_card' && (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-28">{renderCard(4, spreadConfigs[spreadType].positions[4])}</div>
                                                <div className="flex justify-center gap-6">
                                                    <div className="w-28">{renderCard(2, spreadConfigs[spreadType].positions[2])}</div>
                                                    <div className="w-28">{renderCard(0, spreadConfigs[spreadType].positions[0])}</div>
                                                    <div className="w-28">{renderCard(3, spreadConfigs[spreadType].positions[3])}</div>
                                                </div>
                                                <div className="w-28">{renderCard(1, spreadConfigs[spreadType].positions[1])}</div>
                                            </div>
                                        )}

                                        {/* Seven Card - Horseshoe/Arc Layout */}
                                        {spreadType === 'seven_card' && (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex justify-center gap-4">
                                                    <div className="w-24">{renderCard(0, spreadConfigs[spreadType].positions[0])}</div>
                                                    <div className="w-24">{renderCard(1, spreadConfigs[spreadType].positions[1])}</div>
                                                    <div className="w-24">{renderCard(2, spreadConfigs[spreadType].positions[2])}</div>
                                                    <div className="w-24">{renderCard(3, spreadConfigs[spreadType].positions[3])}</div>
                                                </div>
                                                <div className="flex justify-center gap-4">
                                                    <div className="w-24">{renderCard(4, spreadConfigs[spreadType].positions[4])}</div>
                                                    <div className="w-24">{renderCard(5, spreadConfigs[spreadType].positions[5])}</div>
                                                    <div className="w-24">{renderCard(6, spreadConfigs[spreadType].positions[6])}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Celtic Cross - Custom Layout for our site */}
                                        {spreadType === 'celtic_cross' && (
                                            <div className="w-full max-w-4xl mx-auto">
                                                {/* Two sections side by side */}
                                                <div className="flex flex-col lg:flex-row justify-center items-start gap-8 lg:gap-16">

                                                    {/* Section 1: The Cross (cards 0-5) */}
                                                    <div className="flex-shrink-0">
                                                        <h4 className="text-sm text-gray-400 text-center mb-4 font-medium">{isPortuguese ? 'A Cruz' : 'The Cross'}</h4>
                                                        <div className="grid grid-cols-3 gap-3 justify-items-center" style={{ gridTemplateRows: 'auto auto auto' }}>
                                                            {/* Row 1: Crown (4) in center */}
                                                            <div className="col-start-2 w-20">{renderCard(4, spreadConfigs[spreadType].positions[4])}</div>

                                                            {/* Row 2: Past (3) - Center (0) - Future (5) */}
                                                            <div className="w-20">{renderCard(3, spreadConfigs[spreadType].positions[3])}</div>
                                                            <div className="w-20">{renderCard(0, spreadConfigs[spreadType].positions[0])}</div>
                                                            <div className="w-20">{renderCard(5, spreadConfigs[spreadType].positions[5])}</div>

                                                            {/* Row 3: Crossing (1) in center */}
                                                            <div className="col-start-2 w-20">{renderCard(1, spreadConfigs[spreadType].positions[1])}</div>

                                                            {/* Row 4: Foundation (2) in center */}
                                                            <div className="col-start-2 w-20">{renderCard(2, spreadConfigs[spreadType].positions[2])}</div>
                                                        </div>
                                                    </div>

                                                    {/* Section 2: The Staff/Pillar (cards 6-9) */}
                                                    <div className="flex-shrink-0">
                                                        <h4 className="text-sm text-gray-400 text-center mb-4 font-medium">{isPortuguese ? 'O Pilar' : 'The Staff'}</h4>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {/* Top row: Self (6) - Environment (7) */}
                                                            <div className="w-20">{renderCard(6, spreadConfigs[spreadType].positions[6])}</div>
                                                            <div className="w-20">{renderCard(7, spreadConfigs[spreadType].positions[7])}</div>

                                                            {/* Bottom row: Hopes (8) - Outcome (9) */}
                                                            <div className="w-20">{renderCard(8, spreadConfigs[spreadType].positions[8])}</div>
                                                            <div className="w-20">{renderCard(9, spreadConfigs[spreadType].positions[9])}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Custom - Flexible grid */}
                                        {spreadType === 'custom' && (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                                {selectedCards.map((cardName, index) => {
                                                    const position = `${ti.cardPosition || 'Card'} ${index + 1}`;
                                                    return <div key={index} className="w-full">{renderCard(index, position)}</div>;
                                                })}
                                                {selectedCards.length < 15 && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCards([...selectedCards, '']);
                                                            openCardSearch(selectedCards.length);
                                                        }}
                                                        className="aspect-[2/3] rounded-xl border-2 border-dashed border-border-dark hover:border-primary/30 bg-surface-dark/50 flex flex-col items-center justify-center cursor-pointer transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-gray-500 text-2xl mb-1">add_circle</span>
                                                        <span className="text-gray-500 text-xs">{ti.addCard || 'Add Card'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {spreadType !== 'custom' && spreadType !== 'yes_no' && spreadType !== 'three_card' && spreadType !== 'five_card' && spreadType !== 'seven_card' && spreadType !== 'celtic_cross' && (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                                {selectedCards.map((cardName, index) => {
                                                    const position = spreadConfigs[spreadType]?.positions?.[index] || `${ti.cardPosition || 'Card'} ${index + 1}`;
                                                    return renderCard(index, position);
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Question Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {ti.questionLabel || 'Question asked to the Tarot'}
                                    </label>
                                    <textarea
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder={ti.questionPlaceholder || 'What question did you ask during the spread?'}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-surface-dark border border-border-dark rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                                    />
                                    <p className="text-gray-500 text-xs mt-1">
                                        {ti.questionHint || 'The question helps contextualize the interpretation'}
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                                        <span className="material-symbols-outlined text-red-400">error</span>
                                        <span className="text-red-400">{error}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !spreadType || selectedCards.filter(c => c).length === 0}
                                    className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary-hover hover:to-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            {ti.interpreting || 'Interpreting...'}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                            {ti.submitButton || 'Interpret My Spread'}
                                        </>
                                    )}
                                </button>

                                {tier !== 'premium' && (
                                    <p className="text-center text-amber-400/70 text-sm mt-4 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                        {ti.premiumFeature || 'Premium Feature'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {savedToHistory && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                                    <span className="text-emerald-400">{ti.savedToHistory || 'Interpretation saved to your history!'}</span>
                                </div>
                            )}

                            {interpretation.tema_central && (
                                <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl border border-primary/30 p-6 text-center">
                                    <span className="text-primary text-sm font-medium uppercase tracking-wider">
                                        {ti.centralTheme || 'Central Theme'}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mt-2">{interpretation.tema_central}</h3>
                                </div>
                            )}

                            {interpretation.visao_geral && (
                                <div className="bg-surface-dark/80 rounded-2xl border border-border-dark p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">visibility</span>
                                        {ti.overview || 'Overview'}
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">{interpretation.visao_geral}</p>
                                </div>
                            )}

                            {interpretation.cartas && interpretation.cartas.length > 0 && (
                                <div className="bg-surface-dark/80 rounded-2xl border border-border-dark p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">style</span>
                                        {ti.cardByCard || 'Card by Card'}
                                    </h3>
                                    <div className="space-y-4">
                                        {interpretation.cartas.map((card: any, index: number) => (
                                            <div key={index} className="p-4 bg-card-dark/50 rounded-xl border border-border-dark">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                                                        {card.posicao}
                                                    </span>
                                                    <span className="text-white font-medium">{card.carta}</span>
                                                </div>
                                                <p className="text-gray-400 text-sm">{card.interpretacao}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {interpretation.sintese_final && (
                                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-400">lightbulb</span>
                                        {ti.finalSynthesis || 'Final Synthesis'}
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">{interpretation.sintese_final}</p>
                                </div>
                            )}

                            <button
                                onClick={resetForm}
                                className="w-full py-4 bg-surface-dark hover:bg-card-dark border border-border-dark text-white font-medium rounded-xl flex items-center justify-center gap-3 transition-all"
                            >
                                <span className="material-symbols-outlined">refresh</span>
                                {ti.newInterpretation || 'New Interpretation'}
                            </button>
                        </div>
                    )}
                </div>
            </section >

            {/* Card Search Modal */}
            {
                showCardSearch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-4xl max-h-[85vh] bg-card-dark rounded-2xl border border-border-dark overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-border-dark">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-400">search</span>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={ti.cardsPlaceholder || 'Search card...'}
                                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => { setShowCardSearch(false); setActiveCardIndex(null); }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-gray-400">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {groupedCards.length > 0 ? (
                                    groupedCards.map((group, groupIndex) => (
                                        <div key={groupIndex} className="mb-8 last:mb-0">
                                            <h4 className="text-sm font-medium text-primary mb-4 sticky top-0 bg-card-dark py-2 z-10">
                                                {group.title}
                                            </h4>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                                {group.cards.map((card) => {
                                                    const cardName = isPortuguese ? card.name_pt : card.name;
                                                    const isSelected = selectedCards.includes(cardName);
                                                    return (
                                                        <button
                                                            key={card.id}
                                                            onClick={() => !isSelected && handleCardSelect(card)}
                                                            disabled={isSelected}
                                                            className={`group flex flex-col items-center rounded-xl p-2 transition-all ${isSelected
                                                                ? 'opacity-40 cursor-not-allowed'
                                                                : 'hover:bg-primary/10 hover:scale-105'
                                                                }`}
                                                        >
                                                            <div className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                                                ? 'border-gray-600'
                                                                : 'border-border-dark group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(147,17,212,0.3)]'
                                                                }`}>
                                                                <img
                                                                    src={card.imageUrl}
                                                                    alt={cardName}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = 'https://placehold.co/150x260/1c1022/9311d4?text=Tarot';
                                                                    }}
                                                                />
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                        <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className={`mt-2 text-xs text-center font-medium leading-tight ${isSelected ? 'text-gray-500' : 'text-white'}`}>
                                                                {cardName}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-gray-500 text-4xl mb-2">search_off</span>
                                        <p className="text-gray-500">{ti.noCardsFound || 'No cards found'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <Footer />
        </div >
    );
};

const App = () => {
    return (
        <LanguageProvider>
            <AuthProvider>
                <CartProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />

                            {/* Spreads Page - Available in both languages */}
                            <Route path="/spreads" element={<Spreads />} />
                            <Route path="/jogos-de-tarot" element={<Spreads />} />

                            {/* Physical Reading Interpretation */}
                            <Route path="/interpretacao" element={<Interpretacao />} />
                            <Route path="/interpretation" element={<Interpretacao />} />

                            {/* Rotas em Português */}
                            <Route path="/arquivo-arcano" element={<Explore />} />
                            <Route path="/arquivo-arcano/:cardSlug" element={<CardDetails />} />

                            {/* Rotas em Inglês */}
                            <Route path="/arcane-archive" element={<Explore />} />
                            <Route path="/arcane-archive/:cardSlug" element={<CardDetails />} />

                            {/* Rotas antigas (manter compatibilidade) */}
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/explore/:cardId" element={<CardDetails />} />

                            <Route path="/session" element={<Session />} />
                            <Route path="/result" element={<Result />} />
                            <Route path="/history" element={<History />} />
                            <Route path="/numerology" element={<Numerology />} />
                            <Route path="/cosmic" element={<CosmicCalendar />} />
                            <Route path="/carta-do-dia" element={<DailyCard />} />
                            <Route path="/daily-card" element={<DailyCard />} />
                            <Route path="/charts-demo" element={<SideBySideExample />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/configuracoes" element={<Settings />} />
                        </Routes>
                    </Router>
                </CartProvider>
            </AuthProvider>
        </LanguageProvider>
    );
};

export default App;
