import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { SPREADS, generateDeck, getStaticLore } from './constants';
import { Spread, TarotCard, ReadingSession, ReadingAnalysis, Suit, ArcanaType, CardLore } from './types';
import { getGeminiInterpretation } from './services/geminiService';
import { fetchCardByName, ApiTarotCard, preloadCards } from './services/tarotApiService';
import { LanguageProvider, useLanguage, LanguageToggle } from './contexts/LanguageContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { PRODUCTS, getProductBySlug } from './data/products';
import { Product, ProductVariant, ProductCategory } from './types/product';
import { calculateNumerologyProfile, calculateUniversalDay, NumerologyProfile, NumerologyNumber } from './services/numerologyService';
import { getCosmicDay, getMoonPhase, getElementColor, CosmicDay, MoonPhase } from './services/cosmicCalendarService';

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
                        <button
                            onClick={() => { toggleCart(false); navigate('/shop'); }}
                            className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-bold transition-colors"
                        >
                            {t.cart.continueShopping}
                        </button>
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
                )}
            </div>
        </>
    );
};

// Navigation Header
const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { toggleCart, getItemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;
    const itemCount = getItemCount();

    return (
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
                            {t.nav.newReading}
                        </button>
                        <button onClick={() => navigate('/explore')} className={`text-sm font-medium transition-colors ${isActive('/explore') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
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
                        <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.newReading}</button>
                        <button onClick={() => { navigate('/explore'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.cardMeanings}</button>
                        <button onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.history}</button>
                        <button onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.shop}</button>
                    </nav>
                )}
            </div>
        </header>
    );
};

// Footer Component
const Footer = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

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
                            <button onClick={() => navigate('/explore')} className="text-gray-400 text-sm hover:text-primary text-left transition-colors">{t.footer.cardLibrary}</button>
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

// --- Pages ---

// Home Page - Modern Mystical Design
const Home = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();

    const handleSelectSpread = (spread: Spread) => {
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
        <div className="relative flex min-h-screen w-full flex-col" style={{
            backgroundColor: '#1a1225',
            backgroundAttachment: 'fixed'
        }}>
            <Header />
            <CartDrawer />

            {/* Optimized Stars Background - Fixed position */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ willChange: 'transform' }}>
                {/* Subtle stars with better distribution */}
                <div className="absolute w-0.5 h-0.5 bg-white/70 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.8)]" style={{ top: '8%', left: '12%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.6)]" style={{ top: '18%', left: '78%' }} />
                <div className="absolute w-1 h-1 bg-white/80 rounded-full shadow-[0_0_3px_rgba(255,255,255,0.9)]" style={{ top: '14%', left: '42%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/60 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.7)]" style={{ top: '28%', left: '22%' }} />
                <div className="absolute w-1 h-1 bg-white/90 rounded-full shadow-[0_0_3px_rgba(255,255,255,1)]" style={{ top: '24%', left: '68%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/55 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.6)]" style={{ top: '38%', left: '8%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/75 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.8)]" style={{ top: '33%', left: '88%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/65 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.7)]" style={{ top: '48%', left: '3%' }} />
                <div className="absolute w-1 h-1 bg-white/85 rounded-full shadow-[0_0_3px_rgba(255,255,255,0.9)]" style={{ top: '43%', left: '93%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/45 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.5)]" style={{ top: '58%', left: '18%' }} />
                <div className="absolute w-1 h-1 bg-white/95 rounded-full shadow-[0_0_3px_rgba(255,255,255,1)]" style={{ top: '53%', left: '72%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/60 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.7)]" style={{ top: '68%', left: '32%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/70 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.8)]" style={{ top: '63%', left: '82%' }} />
                <div className="absolute w-1 h-1 bg-white/80 rounded-full shadow-[0_0_3px_rgba(255,255,255,0.9)]" style={{ top: '78%', left: '48%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.6)]" style={{ top: '73%', left: '13%' }} />
                <div className="absolute w-0.5 h-0.5 bg-white/65 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.7)]" style={{ top: '83%', left: '62%' }} />
                <div className="absolute w-0.5 h-0.5 bg-purple-300/60 rounded-full shadow-[0_0_2px_rgba(216,180,254,0.7)]" style={{ top: '11%', left: '52%' }} />
                <div className="absolute w-0.5 h-0.5 bg-purple-300/50 rounded-full shadow-[0_0_2px_rgba(216,180,254,0.6)]" style={{ top: '21%', left: '38%' }} />
                <div className="absolute w-1 h-1 bg-purple-300/70 rounded-full shadow-[0_0_3px_rgba(216,180,254,0.8)]" style={{ top: '36%', left: '58%' }} />
                <div className="absolute w-0.5 h-0.5 bg-purple-300/55 rounded-full shadow-[0_0_2px_rgba(216,180,254,0.6)]" style={{ top: '46%', left: '28%' }} />
            </div>

            {/* Hero Section - Clean & Modern */}
            <section className="relative z-10 min-h-[85vh] flex items-center justify-center overflow-hidden">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .glow-button {
                        box-shadow: 0 0 15px rgba(147, 17, 212, 0.3);
                    }
                `}} />

                {/* Subtle circular borders */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] w-[700px] h-[700px] border border-white/[0.02] rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] w-[900px] h-[900px] border border-white/[0.015] rounded-full" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center -mt-12">
                    <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                        {isPortuguese ? 'Revele seu destino com o Tarot' : 'Reveal your destiny with Tarot'}
                    </h1>

                    <p className="text-lg md:text-xl text-[#c4b5cc] font-normal leading-relaxed max-w-2xl mx-auto mb-10" style={{ fontFamily: "'Crimson Text', serif" }}>
                        {isPortuguese
                            ? 'Leitura de Tarot grátis com interpretação personalizada. Onde a sabedoria ancestral encontra a tecnologia moderna.'
                            : 'Free Tarot reading with personalized interpretation. Where ancient wisdom meets modern technology.'}
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <button
                            onClick={() => handleSelectSpread(SPREADS[0])}
                            className="glow-button group flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 px-10 py-4 rounded-full transition-all"
                        >
                            <span className="text-sm font-bold uppercase tracking-widest">{t.home.startReading}</span>
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">auto_mode</span>
                        </button>
                        <button
                            onClick={() => navigate('/explore')}
                            className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-4 rounded-full transition-all"
                        >
                            <span className="text-sm font-bold uppercase tracking-widest">{t.home.exploreCards}</span>
                            <span className="material-symbols-outlined text-lg">history_edu</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Spread Selection - Premium Cards Style */}
            <section className="py-16 md:py-24 px-4 md:px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="text-center md:text-left mb-10 md:mb-14 px-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: "'Crimson Text', serif" }}>{t.home.chooseReading}</h2>
                        <p className="text-gray-400 text-lg max-w-xl">{t.home.chooseReadingSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-2">
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
                                    className="group relative flex flex-col h-[340px] md:h-[380px] rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition-transform duration-500 hover:-translate-y-1 border border-border-dark hover:border-primary/50"
                                >
                                    {/* Background Image with subtle Zoom */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${spreadImages[spread.id]}')` }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent group-hover:via-background-dark/30 transition-colors duration-500" />

                                    {/* Content */}
                                    <div className="relative z-10 mt-auto p-6 md:p-8 flex flex-col justify-end">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-md bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                                    {spread.cardCount} {isPortuguese ? 'cartas' : 'cards'}
                                                </span>
                                            </div>

                                            <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                                                {translation.name}
                                            </h3>

                                            <p className="text-gray-300 text-sm md:text-base leading-relaxed opacity-90">
                                                {translation.description}
                                            </p>

                                            <div className="mt-3 flex items-center text-primary group-hover:text-white text-sm font-bold uppercase tracking-[0.15em] transition-colors">
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

            {/* Cosmic Mandala Animation Section */}
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
                                        {/* Outer Orbits - Expanded */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/10 rounded-full orbit-rotate"></div>
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-primary/20 rounded-full border-dashed orbit-rotate" style={{ animationDirection: 'reverse', animationDuration: '180s' }}></div>

                                        {/* The Mandala Body - Larger */}
                                        <div className="relative w-96 h-96 mx-auto rounded-full bg-background-dark/60 backdrop-blur-xl border border-white/20 flex items-center justify-center mandala-glow">
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

            {/* Shop CTA */}
            < section className="relative z-10 py-24 md:py-32 px-6" >
                <div className="max-w-[800px] mx-auto text-center">
                    <div className="bg-gradient-to-br from-surface-dark to-card-dark rounded-2xl p-8 md:p-12 border border-border-dark">
                        <span className="material-symbols-outlined text-5xl text-primary mb-4">storefront</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Crimson Text', serif" }}>{t.home.featuredProducts}</h2>
                        <p className="text-gray-400 mb-6">{t.home.featuredProductsSubtitle}</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover rounded-xl text-white font-bold transition-all"
                        >
                            {t.nav.shop}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </section >

            <Footer />
        </div >
    );
};

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { addItem } = useCart();

    const name = isPortuguese ? product.name : product.name_en;
    const shortDesc = isPortuguese ? product.shortDescription : product.shortDescription_en;

    return (
        <div className="group bg-card-dark rounded-xl overflow-hidden border border-border-dark hover:border-primary/30 transition-all hover:shadow-[0_0_20px_rgba(147,17,212,0.1)]">
            <div
                className="relative aspect-square overflow-hidden cursor-pointer"
                onClick={() => navigate(`/shop/${product.slug}`)}
            >
                <img
                    src={product.images[0]}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.tags.length > 0 && (
                    <div className="absolute top-3 left-3 flex gap-2">
                        {product.tags.includes('bestseller') && (
                            <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md uppercase">{t.shop.bestseller}</span>
                        )}
                        {product.tags.includes('new') && (
                            <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md uppercase">{t.shop.new}</span>
                        )}
                        {product.tags.includes('sale') && (
                            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md uppercase">{t.shop.sale}</span>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3
                    className="text-white font-bold text-sm mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/shop/${product.slug}`)}
                >
                    {name}
                </h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{shortDesc}</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-white font-bold">{formatPrice(product.price, t.common.currency)}</span>
                        {product.compareAtPrice && (
                            <span className="text-gray-500 text-xs line-through">{formatPrice(product.compareAtPrice, t.common.currency)}</span>
                        )}
                    </div>

                    {!product.variants ? (
                        <button
                            onClick={() => addItem(product)}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(`/shop/${product.slug}`)}
                            className="text-primary text-xs font-bold hover:underline"
                        >
                            {t.product.selectVariant}
                        </button>
                    )}
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
        <div className="flex flex-col min-h-screen bg-background-dark">
            <Header />
            <CartDrawer />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>{t.shop.title}</h1>
                    <p className="text-gray-400">{t.shop.subtitle}</p>
                </div>

                <div className="flex gap-8">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl"
                    >
                        <span className="material-symbols-outlined">tune</span>
                    </button>

                    {/* Sidebar Filters */}
                    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } lg:translate-x-0 fixed lg:relative top-0 left-0 h-full lg:h-auto w-72 lg:w-64 bg-surface-dark lg:bg-transparent border-r border-border-dark lg:border-0 p-6 lg:p-0 transition-transform duration-300 z-40 overflow-y-auto`}>

                        {/* Close button mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="space-y-6">
                            {/* Categories */}
                            <div className="bg-surface-dark lg:bg-surface-dark p-4 rounded-xl border border-border-dark">
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">
                                    {isPortuguese ? 'Categorias' : 'Categories'}
                                </h3>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.key}
                                            onClick={() => setFilter(cat.key)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filter === cat.key
                                                    ? 'bg-primary text-white'
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
                            <div className="bg-surface-dark p-4 rounded-xl border border-border-dark">
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">
                                    {isPortuguese ? 'Faixa de Preço' : 'Price Range'}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span>{formatPrice(priceRange[0], t.common.currency)}</span>
                                        <span>-</span>
                                        <span>{formatPrice(priceRange[1], t.common.currency)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                        className="w-full accent-primary"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="bg-surface-dark p-4 rounded-xl border border-border-dark">
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">
                                    {isPortuguese ? 'Filtros' : 'Filters'}
                                </h3>
                                <div className="space-y-2">
                                    {availableTags.map(tag => (
                                        <label
                                            key={tag.key}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTags.includes(tag.key)}
                                                onChange={() => toggleTag(tag.key)}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <span className={`text-sm font-medium ${selectedTags.includes(tag.key) ? tag.color : 'text-gray-400 group-hover:text-white'}`}>
                                                {tag.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Filters */}
                            <button
                                onClick={resetFilters}
                                className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors border border-border-dark"
                            >
                                {isPortuguese ? 'Limpar Filtros' : 'Reset Filters'}
                            </button>
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
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-400 text-sm">
                                {filteredProducts.length} {isPortuguese ? 'produtos' : 'products'}
                            </p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 rounded-lg bg-surface-dark text-gray-300 border border-border-dark text-sm"
                            >
                                <option value="featured">{t.shop.sortOptions.featured}</option>
                                <option value="price_low">{t.shop.sortOptions.priceLow}</option>
                                <option value="price_high">{t.shop.sortOptions.priceHigh}</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inventory_2</span>
                                <p className="text-gray-400">{isPortuguese ? 'Nenhum produto encontrado' : 'No products found'}</p>
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
                                        <img src={img} alt="" className="w-full h-full object-cover" />
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

// Checkout Page
const Checkout = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { items, getSubtotal, clearCart, getItemKey } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);

    if (items.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-background-dark">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">shopping_cart</span>
                    <p className="text-gray-400 mb-4">{t.cart.empty}</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-bold"
                    >
                        {t.cart.continueShopping}
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        clearCart();
        setIsProcessing(false);
        alert(isPortuguese ? 'Pedido realizado com sucesso! (Simulação)' : 'Order placed successfully! (Simulation)');
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            <Header />
            <CartDrawer />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
                <h1 className="text-3xl font-black text-white mb-8" style={{ fontFamily: "'Crimson Text', serif" }}>{t.checkout.title}</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact */}
                        <div className="bg-card-dark rounded-xl p-6 border border-border-dark">
                            <h2 className="text-white font-bold mb-4">{t.checkout.contactInfo}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="email" required placeholder={t.checkout.email} className="w-full px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                <input type="tel" required placeholder={t.checkout.phone} className="w-full px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-card-dark rounded-xl p-6 border border-border-dark">
                            <h2 className="text-white font-bold mb-4">{t.checkout.shippingAddress}</h2>
                            <div className="space-y-4">
                                <input type="text" required placeholder={t.checkout.fullName} className="w-full px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="text" required placeholder={t.checkout.zipCode} className="px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                    <input type="text" required placeholder={t.checkout.address} className="col-span-2 px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <input type="text" required placeholder={t.checkout.number} className="px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                    <input type="text" placeholder={t.checkout.complement} className="px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                    <input type="text" required placeholder={t.checkout.city} className="px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                    <input type="text" required placeholder={t.checkout.state} className="px-4 py-3 rounded-lg bg-surface-dark border border-border-dark text-white placeholder-gray-500 focus:border-primary focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="bg-card-dark rounded-xl p-6 border border-border-dark">
                            <h2 className="text-white font-bold mb-4">{t.checkout.paymentMethod}</h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-lg bg-surface-dark border border-primary cursor-pointer">
                                    <input type="radio" name="payment" value="pix" defaultChecked className="w-4 h-4 text-primary" />
                                    <span className="material-symbols-outlined text-green-400">qr_code_2</span>
                                    <span className="text-white font-medium">{t.checkout.pix}</span>
                                    <span className="ml-auto text-green-400 text-xs font-bold">5% OFF</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-lg bg-surface-dark border border-border-dark cursor-pointer hover:border-white/20">
                                    <input type="radio" name="payment" value="credit" className="w-4 h-4 text-primary" />
                                    <span className="material-symbols-outlined text-blue-400">credit_card</span>
                                    <span className="text-white font-medium">{t.checkout.creditCard}</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-lg bg-surface-dark border border-border-dark cursor-pointer hover:border-white/20">
                                    <input type="radio" name="payment" value="boleto" className="w-4 h-4 text-primary" />
                                    <span className="material-symbols-outlined text-yellow-400">receipt</span>
                                    <span className="text-white font-medium">{t.checkout.boleto}</span>
                                </label>
                            </div>
                            <p className="text-gray-500 text-xs mt-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500 text-sm">lock</span>
                                {t.checkout.mercadoPago}
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card-dark rounded-xl p-6 border border-border-dark sticky top-24">
                            <h2 className="text-white font-bold mb-4">{t.checkout.orderSummary}</h2>

                            <div className="space-y-4 mb-6">
                                {items.map(item => {
                                    const name = isPortuguese ? item.product.name : item.product.name_en;
                                    const price = item.variant?.price ?? item.product.price;
                                    return (
                                        <div key={getItemKey(item)} className="flex gap-3">
                                            <img src={item.product.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{name}</p>
                                                <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                                <p className="text-primary font-bold text-sm">{formatPrice(price * item.quantity, t.common.currency)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-border-dark pt-4 space-y-3">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>{t.cart.subtotal}</span>
                                    <span>{formatPrice(getSubtotal(), t.common.currency)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>{t.cart.shipping}</span>
                                    <span>{t.cart.shippingCalculate}</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-border-dark">
                                    <span>{t.cart.total}</span>
                                    <span className="text-primary">{formatPrice(getSubtotal(), t.common.currency)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full mt-6 py-4 bg-primary hover:bg-primary-hover disabled:bg-gray-700 rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        {t.checkout.processing}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">lock</span>
                                        {t.checkout.placeOrder}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
};

// Card Details Page
const CardDetails = () => {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const [card, setCard] = useState<TarotCard | null>(null);
    const [lore, setLore] = useState<ExtendedCardLore | null>(null);
    const [isLoadingApi, setIsLoadingApi] = useState(true);

    useEffect(() => {
        const deck = generateDeck();
        const foundCard = deck.find(c => c.id === cardId);

        if (foundCard) {
            setCard(foundCard);
            const staticData = getStaticLore(foundCard);
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
            navigate('/explore');
        }
    }, [cardId, navigate]);

    if (!card) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white">
            <Header />
            <CartDrawer />
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span onClick={() => navigate('/explore')} className="cursor-pointer hover:text-primary">{t.explore.title}</span>
                        <span>/</span>
                        <span className="text-white font-bold">{card.name}</span>
                    </div>
                    <button onClick={() => navigate('/explore')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-dark hover:bg-white/5 transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-base">arrow_back</span> {t.cardDetails.back}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <div className="relative w-full max-w-[350px] aspect-[2/3.4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                            <img src={card.imageUrl} alt={card.name} onError={handleImageError} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                    {card.arcana} {card.suit !== Suit.NONE && `• ${card.suit}`}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black leading-tight text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>{card.name}</h1>
                        </div>

                        {lore && (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    {lore.keywords.map((kw, i) => (
                                        <div key={i} className="px-4 py-2 rounded-lg bg-surface-dark border border-white/5 text-sm font-medium text-gray-300 hover:border-primary/30 transition-colors">
                                            {kw}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-white mb-3">
                                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                            {t.cardDetails.upright}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-lg bg-surface-dark/50 p-6 rounded-2xl border border-white/5">{lore.generalMeaning}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="size-10 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">favorite</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">{t.cardDetails.love}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.love}</p>
                                        </div>
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="size-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">work</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">{t.cardDetails.career}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.career}</p>
                                        </div>
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors md:col-span-2">
                                            <div className="size-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">lightbulb</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">{t.cardDetails.advice}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.advice}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                        <h4 className="text-red-400 font-bold text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">rotate_right</span>
                                            {t.cardDetails.reversed}
                                        </h4>
                                        <p className="text-gray-400 text-sm">{lore.apiMeaningRev || lore.reversed}</p>
                                    </div>

                                    {lore.apiDescription ? (
                                        <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-2xl">
                                            <h4 className="text-primary font-bold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">menu_book</span>
                                                {t.cardDetails.historicalSymbolism}
                                            </h4>
                                            <p className="text-gray-300 text-sm leading-relaxed italic">{lore.apiDescription}</p>
                                        </div>
                                    ) : isLoadingApi ? (
                                        <div className="p-6 bg-surface-dark/50 border border-white/5 rounded-2xl animate-pulse">
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
                        <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide mb-2 ${reading.typeColor}`}>
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

                    {/* Synthesis */}
                    {reading.notes && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                {isPortuguese ? 'Síntese da Leitura' : 'Reading Synthesis'}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed bg-surface-dark p-4 rounded-xl">
                                {reading.notes}
                            </p>
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
                                    <span className={`material-symbols-outlined text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'
                                        }`}>
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
    const [selectedReading, setSelectedReading] = useState<any | null>(null);

    const [savedReadings, setSavedReadings] = useState<any[]>(() => {
        try {
            const saved = localStorage.getItem('tarot-history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const deleteReading = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedReadings.filter(r => r.id !== id);
        setSavedReadings(updated);
        localStorage.setItem('tarot-history', JSON.stringify(updated));
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
        <div className="flex flex-col min-h-screen bg-background-dark text-white">
            <Header />
            <CartDrawer />

            {/* Modal */}
            {selectedReading && (
                <ReadingModal
                    reading={selectedReading}
                    onClose={() => setSelectedReading(null)}
                    onUpdate={updateReading}
                    isPortuguese={isPortuguese}
                />
            )}

            <main className="flex-1 justify-center w-full py-12">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-white text-3xl font-bold" style={{ fontFamily: "'Crimson Text', serif" }}>{t.history.title}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t.history.subtitle}</p>
                        </div>
                        <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-lg">add</span>
                            {t.nav.newReading}
                        </button>
                    </div>

                    {savedReadings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">history</span>
                            <h3 className="text-xl font-bold text-white mb-2">{t.history.noHistory}</h3>
                            <p className="text-gray-400 mb-6">{t.history.startFirst}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-xl text-white font-bold transition-colors"
                            >
                                {t.home.startReading}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {savedReadings.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-card-dark rounded-xl border border-border-dark hover:border-primary/30 transition-all overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Cards Preview */}
                                        <div className="flex gap-2 p-4 md:p-5 bg-surface-dark/50 overflow-x-auto">
                                            {item.previewCards?.slice(0, 5).map((cardUrl: string, idx: number) => (
                                                <div key={idx} className="flex-shrink-0 w-14 md:w-16">
                                                    <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-md">
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
                                                <div className="flex-shrink-0 w-14 md:w-16 flex items-center justify-center">
                                                    <span className="text-gray-500 text-sm">+{item.previewCards.length - 5}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${item.typeColor}`}>
                                                        {item.typeBadge}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">{item.date}</span>
                                                </div>
                                                <h3 className="text-white font-bold text-lg mb-1">{item.spreadName}</h3>

                                                {/* Rating */}
                                                <div className="mb-2">
                                                    {renderStars(item.rating)}
                                                </div>

                                                {/* Comment Preview */}
                                                {item.comment ? (
                                                    <p className="text-gray-400 text-sm line-clamp-2 italic">"{item.comment}"</p>
                                                ) : (
                                                    <p className="text-gray-600 text-sm italic">
                                                        {isPortuguese ? 'Sem anotações' : 'No notes'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 md:flex-col">
                                                <button
                                                    onClick={() => setSelectedReading(item)}
                                                    className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                    {isPortuguese ? 'Ver' : 'View'}
                                                </button>
                                                <button
                                                    onClick={(e) => deleteReading(item.id, e)}
                                                    className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
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
                        <div className="flex items-center justify-center gap-2 mb-2">
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
        <div className="flex flex-col min-h-screen bg-background-dark text-white">
            <Header />
            <CartDrawer />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-10 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold mb-6">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        {t.cosmic.title}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>{t.cosmic.title}</h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">{t.cosmic.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Today's Cosmic Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Moon Phase Card */}
                        <div className="bg-gradient-to-br from-indigo-900/50 to-surface-dark rounded-2xl border border-indigo-500/30 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center relative overflow-hidden">
                                    <span className="material-symbols-outlined text-6xl text-indigo-900">{moonPhase.icon}</span>
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
                        <div className="grid md:grid-cols-2 gap-4">
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
                    <div className="space-y-6">
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
                        <div className="bg-card-dark rounded-xl border border-border-dark p-4">
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
                                        >
                                            <span className="font-medium">{day.getDate()}</span>
                                            <span className="material-symbols-outlined text-[10px] opacity-50">{dayMoon.icon}</span>
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
    const [deck] = useState<TarotCard[]>(generateDeck());
    const [filter, setFilter] = useState<'ALL' | 'MAJOR' | Suit>('ALL');

    const filteredDeck = deck.filter(card => {
        if (filter === 'ALL') return true;
        if (filter === 'MAJOR') return card.arcana === ArcanaType.MAJOR;
        return card.suit === filter;
    });

    const filterLabels: Record<string, string> = {
        'ALL': t.explore.filters.all,
        'MAJOR': t.explore.filters.major,
        'Wands': t.explore.filters.wands,
        'Cups': t.explore.filters.cups,
        'Swords': t.explore.filters.swords,
        'Pentacles': t.explore.filters.pentacles,
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            <Header />
            <CartDrawer />
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12">
                <div className="mb-10">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors">
                        <span className="material-symbols-outlined text-base">arrow_back</span> {t.cardDetails.back}
                    </button>
                    <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>{t.explore.title}</h1>
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

                <p className="text-gray-500 text-sm mb-6">{filteredDeck.length} {t.explore.cards}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filteredDeck.map(card => (
                        <div
                            key={card.id}
                            onClick={() => navigate(`/explore/${card.id}`)}
                            className="group relative aspect-[2/3.4] rounded-lg overflow-hidden border border-white/5 bg-surface-dark hover:border-primary/50 transition-all hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-primary/20"
                        >
                            <img
                                src={card.imageUrl}
                                alt={card.name}
                                onError={handleImageError}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                            <div className="absolute bottom-0 left-0 p-3">
                                <p className="text-xs text-primary font-bold uppercase mb-0.5">{card.arcana === ArcanaType.MAJOR ? (isPortuguese ? 'Maior' : 'Major') : card.suit}</p>
                                <p className="text-white text-sm font-bold leading-tight">{card.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Session Page
const Session = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const spread = (location.state as any)?.spread as Spread;

    const [deck, setDeck] = useState<TarotCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<{ card: TarotCard, flipped: boolean }[]>([]);
    const [question, setQuestion] = useState("");
    const [isShuffling, setIsShuffling] = useState(true);

    useEffect(() => {
        if (!spread) {
            navigate('/');
            return;
        }

        const newDeck = generateDeck();
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }

        setDeck(newDeck);
        setTimeout(() => setIsShuffling(false), 1000);
    }, [spread, navigate]);

    const handleCardClick = (card: TarotCard) => {
        if (selectedCards.length >= spread.cardCount) return;
        if (selectedCards.find(c => c.card.id === card.id)) return;

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
            setTimeout(() => {
                navigate('/result', {
                    state: {
                        spread,
                        cards: newSelection.map(s => s.card),
                        question
                    }
                });
            }, 1500);
        }
    };

    if (!spread) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background-dark overflow-x-hidden">
            <Header />
            <CartDrawer />

            <div className="flex-none px-6 pt-6 pb-2 md:px-12 md:pt-10">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-6 max-w-[1200px] mx-auto">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <h1 className="text-white text-3xl md:text-4xl font-black" style={{ fontFamily: "'Crimson Text', serif" }}>{t.session.title}</h1>
                        <p className="text-gray-400">{t.session.subtitle}</p>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar max-w-[1200px] mx-auto">
                    {SPREADS.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => navigate('/session', { state: { spread: s } })}
                            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 border transition-colors ${spread.id === s.id
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface-highlight hover:bg-[#3d2b45] border-border-dark text-white/70 hover:text-white'
                                }`}
                        >
                            <p className="text-sm font-medium">{s.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {selectedCards.length > 0 && (
                <div className="px-4 md:px-12 py-4 max-w-[1200px] mx-auto w-full">
                    <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
                        {Array(spread.cardCount).fill(null).map((_, idx) => {
                            const selected = selectedCards[idx];
                            const positionName = spread.positions[idx]?.name || `Card ${idx + 1}`;

                            return (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <div className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden ${selected
                                        ? 'shadow-[0_0_30px_rgba(147,17,212,0.4)] border-2 border-primary'
                                        : 'border-2 border-dashed border-border-dark bg-surface-dark/50'
                                        }`}>
                                        {selected ? (
                                            <div className={`card-flip w-full h-full ${selected.flipped ? 'flipped' : ''}`}>
                                                <div className="card-front absolute inset-0 bg-gradient-to-br from-surface-dark to-black flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary text-2xl">style</span>
                                                </div>
                                                <div className="card-back absolute inset-0">
                                                    <img src={selected.card.imageUrl} alt={selected.card.name} onError={handleImageError} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                    <div className="absolute bottom-3 left-0 right-0 text-center">
                                                        <h3 className="text-white font-bold text-sm md:text-base">{selected.card.name}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-600 text-4xl font-bold">{idx + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="uppercase tracking-widest text-xs font-bold text-primary">{positionName}</span>
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
                                    key={card.id}
                                    onClick={() => !isSelected && handleCardClick(card)}
                                    className={`absolute w-14 sm:w-16 md:w-20 lg:w-24 aspect-[2/3.4] rounded-lg border border-white/20 bg-gradient-to-br from-surface-dark to-black shadow-xl cursor-pointer transition-all duration-300 ease-out origin-center ${isSelected ? 'opacity-0 -translate-y-20 scale-50 pointer-events-none' : 'hover:z-[100] hover:-translate-y-6 hover:scale-105 hover:border-primary hover:shadow-[0_0_20px_rgba(147,17,212,0.4)]'
                                        }`}
                                    style={{
                                        left: `${xPos}%`,
                                        top: `${yPos}%`,
                                        transform: isSelected ? undefined : `translate(-50%, -50%) rotate(${rotation}deg)`,
                                        zIndex: isSelected ? -1 : index,
                                    }}
                                >
                                    <div className="absolute inset-0 rounded-lg overflow-hidden bg-surface-dark flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary/50 text-xs md:text-lg">style</span>
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
    const state = location.state as any;

    const [analysis, setAnalysis] = useState<ReadingAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!state?.spread || !state?.cards) {
            navigate('/');
            return;
        }

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

            const result = await getGeminiInterpretation(session);
            setAnalysis(result);
            setIsLoading(false);

            // Save to history
            try {
                const historyItem = {
                    id: Date.now(),
                    date: new Date().toLocaleString(isPortuguese ? 'pt-BR' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    spreadName: state.spread.name,
                    typeBadge: state.spread.cardCount === 3 ? (isPortuguese ? 'RÁPIDA' : 'QUICK') :
                        state.spread.cardCount === 10 ? (isPortuguese ? 'COMPLETA' : 'FULL') :
                            (isPortuguese ? 'AMOR' : 'LOVE'),
                    typeColor: state.spread.cardCount === 3 ? 'text-primary bg-primary/10' :
                        state.spread.cardCount === 10 ? 'text-blue-400 bg-blue-500/10' :
                            'text-pink-400 bg-pink-500/10',
                    previewCards: state.cards.map((c: TarotCard) => c.imageUrl),
                    cardNames: state.cards.map((c: TarotCard) => c.name),
                    positions: state.spread.positions.map((p: any) => p.name),
                    notes: result?.synthesis || '',
                    comment: '',
                    rating: 0
                };

                const existing = JSON.parse(localStorage.getItem('tarot-history') || '[]');
                const updated = [historyItem, ...existing].slice(0, 20); // Keep last 20
                localStorage.setItem('tarot-history', JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to save to history:', e);
            }
        };

        fetchInterpretation();
    }, [state, navigate, isPortuguese]);

    if (!state?.spread) return null;

    const { spread, cards } = state;

    const getArcanaType = (card: TarotCard): string => {
        return card.arcana === ArcanaType.MAJOR
            ? (isPortuguese ? 'Arcano Maior' : 'Major Arcana')
            : (isPortuguese ? 'Arcano Menor' : 'Minor Arcana');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white">
            <Header />
            <CartDrawer />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
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
                                ) : (
                                    <>
                                        <p className="text-gray-200 leading-relaxed text-base mb-4">
                                            {analysis?.synthesis}
                                        </p>
                                        {analysis?.advice && (
                                            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                                                <p className="text-primary text-sm font-medium flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-lg mt-0.5">tips_and_updates</span>
                                                    {analysis.advice}
                                                </p>
                                            </div>
                                        )}
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
                                            <div
                                                className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                                                style={{ backgroundImage: `url("${card.imageUrl}")` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 md:p-3">
                                                <span className="text-[10px] text-primary font-bold uppercase truncate">{idx + 1}. {position?.name}</span>
                                                <span className="text-white font-bold text-xs md:text-sm truncate">{card.name}</span>
                                            </div>
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
                            const cardLore = getStaticLore(card);

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
                                                <h3 className="text-white text-xl font-bold">{card.name}</h3>
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

            <Footer />
        </div>
    );
};

const App = () => {
    return (
        <LanguageProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/explore/:cardId" element={<CardDetails />} />
                        <Route path="/session" element={<Session />} />
                        <Route path="/result" element={<Result />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/numerology" element={<Numerology />} />
                        <Route path="/cosmic" element={<CosmicCalendar />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/shop/:slug" element={<ProductDetail />} />
                        <Route path="/checkout" element={<Checkout />} />
                    </Routes>
                </Router>
            </CartProvider>
        </LanguageProvider>
    );
};

export default App;
