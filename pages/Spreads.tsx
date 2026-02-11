import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { SPREADS } from '../constants';
import { Spread } from '../types';
import { UserMenu } from '../components/UserMenu';
import { PaywallModal, usePaywall } from '../components/PaywallModal';
import { AuthModal } from '../components/AuthModal';

// Inline components since they're in App.tsx
import { useAuth } from '../contexts/AuthContext';
// ...existing code...
const Header = ({ onLoginClick }: { onLoginClick: () => void }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const { profile } = useAuth();
    const isAdmin = Boolean(profile?.is_admin);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;
    const exploreRoute = isPortuguese ? '/arquivo-arcano' : '/arcane-archive';

    return (
        <>
            <header className="flex justify-center w-full bg-background-dark/95 backdrop-blur-md sticky top-0 z-40 border-b border-border-dark">
                <div className="flex flex-col w-full max-w-[1200px]">
                    <div className="flex items-center justify-between whitespace-nowrap px-4 py-3 lg:px-10 lg:py-4">
                        <div className="flex items-center text-white cursor-pointer" onClick={() => navigate('/')}>
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Zaya Tarot</h2>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t.nav.home}
                            </button>
                            <button onClick={() => navigate(isPortuguese ? '/jogos-de-tarot' : '/spreads')} className="text-sm font-medium text-white">
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
                            {isAdmin && (
                                <button onClick={() => navigate('/admin')} className={`text-sm font-medium transition-colors ${isActive('/admin') ? 'text-yellow-400' : 'text-yellow-500/70 hover:text-yellow-400'}`}>
                                    Admin
                                </button>
                            )}
                        </nav>

                        <div className="flex items-center gap-4 sm:gap-6">
                            <LanguageToggle />

                            <UserMenu onLoginClick={onLoginClick} />

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-1.5 sm:p-2 rounded-lg"
                            >
                                <span className="material-symbols-outlined text-white text-xl sm:text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden border-t border-border-dark p-4 space-y-2 animate-fade-in">
                            <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.home}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/jogos-de-tarot' : '/spreads'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-white font-medium">{t.nav.tarot}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/carta-do-dia' : '/daily-card'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{isPortuguese ? 'Carta do Dia' : 'Daily Card'}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/tarot-por-signo' : '/tarot-by-sign'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{isPortuguese ? 'Tarot por Signo' : 'Tarot by Sign'}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/interpretacao' : '/interpretation'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{isPortuguese ? 'Interpretação' : 'Interpretation'}</button>
                            <button onClick={() => { navigate(exploreRoute); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.cardMeanings}</button>
                            <button onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5">{t.nav.history}</button>
                        </nav>
                    )}
                </div>
            </header>
        </>
    );
};

const CartDrawer = () => null;
const StarsBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ willChange: 'transform' }}>
            {Array(30).fill(0).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-white/30 rounded-full"
                    style={{
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        opacity: Math.random() * 0.7 + 0.3
                    }}
                />
            ))}
        </div>
    );
};

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
                            <button onClick={() => navigate('/')} className="text-gray-400 text-sm text-left transition-colors">{t.footer.readings}</button>
                            <button onClick={() => navigate(exploreRoute)} className="text-gray-400 text-sm text-left transition-colors">{t.footer.cardLibrary}</button>
                            <button onClick={() => navigate('/history')} className="text-gray-400 text-sm text-left transition-colors">{t.footer.history}</button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">{t.footer.shop}</h4>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => navigate('/shop')} className="text-gray-400 text-sm text-left transition-colors">{t.footer.products}</button>
                            <button onClick={() => navigate('/shop')} className="text-gray-400 text-sm text-left transition-colors">{t.footer.cart}</button>
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

const Spreads = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { checkAccess, isPremium } = usePaywall();
    const { incrementReadingCount } = useAuth();
    const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

    const spreadImages: Record<string, string> = {
        'three_card': 'images/spreads/three_card.png',
        'celtic_cross': 'images/spreads/celtic_cross.png',
        'love_check': 'images/spreads/love_check.png',
        'yes_no': 'images/spreads/yes_no.png',
        'card_of_day': 'images/spreads/card_of_day.png',
    };

    const handleStartReading = async (spread: Spread) => {
        // Navigate directly to session, paywall check moved to first card click
        navigate('/session', { state: { spread } });
    };

    const getSpreadTranslation = (spreadId: string) => {
        const translationMap: Record<string, { name: string; description: string; spiritual: string }> = {
            'three_card': {
                name: isPortuguese ? 'Três Cartas' : 'Three Card Spread',
                description: isPortuguese
                    ? 'Passado, Presente e Futuro. Uma leitura clássica para insights rápidos.'
                    : 'Past, Present, and Future. A classic spread for quick insights.',
                spiritual: isPortuguese
                    ? 'Esta tiragem ancestral revela a tríade temporal da existência. O passado como raiz do presente, o presente como semente do futuro. Cada carta desenha um arco narrativo da sua jornada, conectando o que foi, o que é, e o que virá a ser.'
                    : 'This ancestral spread reveals the temporal triad of existence. The past as the root of the present, the present as the seed of the future. Each card draws a narrative arc of your journey, connecting what was, what is, and what will be.'
            },
            'celtic_cross': {
                name: isPortuguese ? 'Cruz Celta' : 'Celtic Cross',
                description: isPortuguese
                    ? 'Uma análise profunda de uma situação específica, cobrindo influências internas e externas.'
                    : 'A deep dive into a specific situation, covering internal and external influences.',
                spiritual: isPortuguese
                    ? 'A Cruz Celta é um portal dimensional que desvenda camadas ocultas da realidade. Cada posição mapeia um aspecto da consciência, revelando não apenas eventos, mas as forças invisíveis que moldam seu destino — das raízes do subconsciente às manifestações externas.'
                    : 'The Celtic Cross is a dimensional portal that unveils hidden layers of reality. Each position maps an aspect of consciousness, revealing not just events, but the invisible forces shaping your destiny — from subconscious roots to external manifestations.'
            },
            'love_check': {
                name: isPortuguese ? 'Amor & Relacionamento' : 'Love & Relationship',
                description: isPortuguese
                    ? 'Compreenda a dinâmica entre você e um parceiro.'
                    : 'Understand the dynamics between you and a partner.',
                spiritual: isPortuguese
                    ? 'O amor é um espelho da alma. Esta leitura ilumina a dança energética entre dois seres, revelando padrões ocultos, bloqueios emocionais e o potencial alquímico da união. Explore as correntes invisíveis que conectam corações além do tempo e espaço.'
                    : 'Love is a mirror of the soul. This reading illuminates the energetic dance between two beings, revealing hidden patterns, emotional blocks, and the alchemical potential of union. Explore the invisible currents that connect hearts beyond time and space.'
            },
            'yes_no': {
                name: isPortuguese ? 'Sim ou Não' : 'Yes or No',
                description: isPortuguese
                    ? 'Obtenha uma resposta direta para sua pergunta com uma única carta.'
                    : 'Get a direct answer to your question with a single card.',
                spiritual: isPortuguese
                    ? 'Na simplicidade reside a clareza. Uma única carta, um único momento de verdade. Esta tiragem corta ilusões e vai direto ao núcleo da questão, oferecendo a sabedoria direta do universo sem rodeios ou ambiguidades.'
                    : 'In simplicity lies clarity. A single card, a single moment of truth. This spread cuts through illusions and goes straight to the core of the matter, offering direct wisdom from the universe without detours or ambiguities.'
            },
            'card_of_day': {
                name: isPortuguese ? 'Carta do Dia' : 'Card of the Day',
                description: isPortuguese
                    ? 'Uma reflexão diária para guiar seus passos.'
                    : 'A daily reflection to guide your steps.',
                spiritual: isPortuguese
                    ? 'Cada dia é um novo capítulo na grande narrativa cósmica. Esta carta é sua bússola espiritual, revelando a energia que permeia as próximas 24 horas. Um farol de consciência para navegar as correntes invisíveis do destino diário.'
                    : 'Each day is a new chapter in the great cosmic narrative. This card is your spiritual compass, revealing the energy permeating the next 24 hours. A beacon of consciousness to navigate the invisible currents of daily destiny.'
            },
        };
        return translationMap[spreadId] || { name: 'Unknown', description: '', spiritual: '' };
    };

    const getPositionTranslation = (spreadId: string, positionIndex: number, englishName: string, englishDescription: string) => {
        const positionTranslations: Record<string, Record<number, { name: string; description: string }>> = {
            'three_card': {
                0: { name: 'O Passado', description: 'Influências do passado que afetam a situação.' },
                1: { name: 'O Presente', description: 'O estado atual dos acontecimentos.' },
                2: { name: 'O Futuro', description: 'O resultado provável se as coisas continuarem.' }
            },
            'celtic_cross': {
                0: { name: 'O Significador', description: 'O coração da questão.' },
                1: { name: 'O Cruzamento', description: 'O que se opõe ou ajuda você.' },
                2: { name: 'A Fundação', description: 'A causa raiz ou influência do subconsciente.' },
                3: { name: 'O Passado Recente', description: 'Eventos que estão passando.' },
                4: { name: 'A Coroa', description: 'Objetivos maiores ou melhor resultado.' },
                5: { name: 'O Futuro Próximo', description: 'Os próximos passos imediatos.' },
                6: { name: 'O Eu', description: 'Como você se vê.' },
                7: { name: 'O Ambiente', description: 'Como outros te veem ou veem a situação.' },
                8: { name: 'Esperanças & Medos', description: 'Estado psicológico.' },
                9: { name: 'O Resultado', description: 'O resultado final.' }
            },
            'love_check': {
                0: { name: 'Você', description: 'Seu papel no relacionamento.' },
                1: { name: 'Eles', description: 'Seu papel e sentimentos.' },
                2: { name: 'Relacionamento', description: 'O estado atual do vínculo.' },
                3: { name: 'Desafio', description: 'O que está bloqueando a harmonia.' },
                4: { name: 'Conselho', description: 'Como proceder.' }
            },
            'yes_no': {
                0: { name: 'Resposta', description: 'A resposta do universo à sua pergunta.' }
            },
            'card_of_day': {
                0: { name: 'Energia do Dia', description: 'O tema principal e lição para seu dia.' }
            }
        };

        if (isPortuguese) {
            const translation = positionTranslations[spreadId]?.[positionIndex];
            return {
                name: translation?.name || englishName,
                description: translation?.description || englishDescription
            };
        }
        return { name: englishName, description: englishDescription };
    };

    const handleSelectSpread = (spread: Spread) => {
        // Toggle: se já está selecionado, desselecionar
        if (selectedSpread?.id === spread.id) {
            setSelectedSpread(null);
        } else {
            setSelectedSpread(spread);
        }
    };

    const difficultyColor: Record<string, string> = {
        'Beginner': 'from-green-500 to-emerald-500',
        'Intermediate': 'from-yellow-500 to-orange-500',
        'Advanced': 'from-red-500 to-rose-500',
    };

    const difficultyColorPortuguese: Record<string, string> = {
        'Iniciante': 'from-green-500 to-emerald-500',
        'Intermediário': 'from-yellow-500 to-orange-500',
        'Avançado': 'from-red-500 to-rose-500',
    };

    const getDifficultyColor = (difficulty: string) => {
        if (isPortuguese) {
            return difficultyColorPortuguese[difficulty] || 'from-gray-500 to-gray-600';
        }
        return difficultyColor[difficulty] || 'from-gray-500 to-gray-600';
    };

    return (
        <div className="relative flex flex-col min-h-screen overflow-x-hidden" style={{ backgroundColor: '#1a1628' }}>
            <Header onLoginClick={() => setShowAuthModal(true)} />
            <CartDrawer />
            <StarsBackground />

            <main className="relative z-10 flex-1 w-full px-4 md:px-8 py-12">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-12 max-w-6xl mx-auto">
                        <style>{`
                            .text-gradient-gold {
                                background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                            }
                        `}</style>
                        <h1 className="text-4xl md:text-5xl font-black text-gradient-gold mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {isPortuguese ? 'Jogos de Tarot' : 'Tarot Spreads'}
                        </h1>
                        <p className="text-gray-300 text-lg max-w-2xl">
                            {isPortuguese
                                ? 'Escolha um layout de leitura e mergulhe na sabedoria ancestral das cartas.'
                                : 'Select a reading layout and immerse yourself in the ancient wisdom of the cards.'}
                        </p>
                    </div>

                    {/* Unified Layout - Mobile and Desktop */}
                    <div className="w-full">
                        <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
                            {SPREADS.map((spread) => {
                                const translation = getSpreadTranslation(spread.id);
                                const isSelected = selectedSpread?.id === spread.id;

                                return (
                                    <div key={spread.id}>
                                        {/* Spread Card */}
                                        <div
                                            onClick={() => handleSelectSpread(spread)}
                                            className={`relative p-4 md:p-6 rounded-2xl border-2 cursor-pointer overflow-hidden transition-all ${isSelected
                                                ? 'border-[#a77fd4] bg-gradient-to-r from-[#875faf]/25 to-[#a77fd4]/15 shadow-lg shadow-purple-900/30'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-base md:text-xl mb-2 ${isSelected ? 'text-[#a77fd4]' : 'text-white'}`}>
                                                        {translation.name}
                                                    </h3>
                                                    <p className={`text-xs md:text-sm line-clamp-2 mb-3 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                                        {translation.description}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-white text-[9px] md:text-[11px] font-bold uppercase ${isSelected ? 'bg-[#a77fd4]/30 text-[#a77fd4]' : 'bg-white/10'}`}>
                                                            {spread.cardCount} {isPortuguese ? 'cartas' : 'cards'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Spread Details - Show Below Selected Card */}
                                        {isSelected && (
                                            <div className="mt-6 md:mt-8 -mx-4 md:-mx-8 relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-6 md:p-8 flex flex-col">
                                                <div className="max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
                                                    {/* Spiritual Description - Full Width Premium Banner */}
                                                    <div className="relative p-5 md:p-7 rounded-2xl bg-gradient-to-br from-[#a77fd4]/10 to-[#875faf]/5 border border-[#a77fd4]/30 overflow-hidden">
                                                        {/* Decorative background elements */}
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#a77fd4]/20 to-transparent rounded-bl-full"></div>
                                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#875faf]/20 to-transparent rounded-tr-full"></div>
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#a77fd4]/5 rounded-full blur-3xl"></div>

                                                        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5 mb-3">
                                                            <div className="flex-shrink-0 w-11 h-11 md:w-13 md:h-13 rounded-full bg-gradient-to-br from-[#e0c080] to-[#b88a44] flex items-center justify-center shadow-xl">
                                                                <span className="material-symbols-outlined text-white text-xl md:text-2xl">auto_awesome</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-[#e0c080] text-xs md:text-sm font-bold uppercase tracking-widest mb-1">
                                                                    {isPortuguese ? 'Essência Espiritual' : 'Spiritual Essence'}
                                                                </h3>
                                                                <p className="text-gray-400 text-xs">
                                                                    {isPortuguese ? 'O significado ancestral deste jogo' : 'The ancestral meaning of this spread'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="relative text-gray-200 text-sm md:text-base leading-relaxed italic max-w-5xl">
                                                            {getSpreadTranslation(selectedSpread.id).spiritual}
                                                        </p>
                                                    </div>

                                                    {/* Three Column Grid - Image + Info + Positions */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                                                        {/* Column 1: Image - 3 cols */}
                                                        <div className="lg:col-span-3 flex flex-col items-center lg:items-start">
                                                            <div className="w-full max-w-[260px] relative group">
                                                                {/* Premium Background Banner */}
                                                                <div className="absolute -inset-5 bg-gradient-to-br from-[#2a1a3a] via-[#1e1628] to-[#1a1024] rounded-3xl blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                                <div className="absolute -inset-3 bg-gradient-to-t from-[#a77fd4]/20 to-transparent rounded-2xl"></div>

                                                                <img
                                                                    src={spreadImages[selectedSpread.id]}
                                                                    alt={getSpreadTranslation(selectedSpread.id).name}
                                                                    className="relative w-full aspect-[2/3.2] object-cover rounded-2xl shadow-2xl shadow-purple-900/50 border-2 border-[#a77fd4]/30 group-hover:border-[#a77fd4]/60 transition-all duration-300"
                                                                />

                                                                {/* Overlay Accent */}
                                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#1a1024]/40 via-transparent to-transparent pointer-events-none"></div>
                                                            </div>
                                                        </div>

                                                        {/* Column 2: Title + Description + Button - 4 cols */}
                                                        <div className="lg:col-span-4 flex flex-col justify-start">
                                                            <h2 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                                {getSpreadTranslation(selectedSpread.id).name}
                                                            </h2>
                                                            <p className="text-gray-300 text-sm leading-relaxed mb-5">
                                                                {getSpreadTranslation(selectedSpread.id).description}
                                                            </p>

                                                            {/* Quick Stats */}
                                                            <div className="flex flex-wrap gap-2 mb-6">
                                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                                                    <span className="material-symbols-outlined text-[#a77fd4] text-base">style</span>
                                                                    <span className="text-white text-xs font-medium">{selectedSpread.cardCount} {isPortuguese ? 'Cartas' : 'Cards'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                                                    <span className="material-symbols-outlined text-[#e0c080] text-base">schedule</span>
                                                                    <span className="text-white text-xs font-medium">{selectedSpread.cardCount * 2}-{selectedSpread.cardCount * 3} min</span>
                                                                </div>
                                                            </div>

                                                            {/* CTA Button */}
                                                            <div className="flex flex-col md:flex-row gap-2 w-full">
                                                                <button
                                                                    onClick={() => handleStartReading(selectedSpread)}
                                                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#875faf] via-[#9968ba] to-[#a77fd4] text-white font-bold text-xs rounded-lg shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 active:scale-95 flex items-center justify-center gap-2 border border-[#a77fd4]/30 transition-all group whitespace-nowrap"
                                                                >
                                                                    <span className="material-symbols-outlined text-base group-hover:rotate-180 transition-transform duration-500">stars</span>
                                                                    {isPortuguese ? 'Iniciar Leitura' : 'Start Reading'}
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(isPremium ? '/' : '/checkout')}
                                                                    className="flex-1 px-4 py-2.5 bg-transparent border border-yellow-500/40 rounded-lg text-yellow-300 font-bold text-xs shadow-lg shadow-yellow-900/10 hover:bg-yellow-500/5 hover:border-yellow-500 hover:text-yellow-400 active:scale-95 flex items-center justify-center gap-2 transition-all group whitespace-nowrap"
                                                                >
                                                                    <span className="material-symbols-outlined text-base">star</span>
                                                                    {isPortuguese ? 'Assinar Premium' : 'Subscribe Premium'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Column 3: Positions - 5 cols */}
                                                        <div className="lg:col-span-5">
                                                            <h3 className="text-xs md:text-sm font-bold text-[#e0c080] uppercase tracking-widest mb-5 flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-[#e0c080]"></span>
                                                                {isPortuguese ? 'Jornada das Cartas' : 'Card Journey'}
                                                            </h3>

                                                            <div className="relative space-y-4">
                                                                {selectedSpread.positions.map((position, idx) => {
                                                                    const posTranslation = getPositionTranslation(
                                                                        selectedSpread.id,
                                                                        position.index,
                                                                        position.name,
                                                                        position.description
                                                                    );
                                                                    const isLast = idx === selectedSpread.positions.length - 1;

                                                                    return (
                                                                        <div key={position.index} className="relative">
                                                                            {/* Vertical Line Connector */}
                                                                            {!isLast && (
                                                                                <div className="absolute left-4 top-9 w-0.5 h-4 bg-gradient-to-b from-[#a77fd4]/60 to-[#a77fd4]/20"></div>
                                                                            )}

                                                                            <div className="flex items-start gap-3">
                                                                                {/* Circle Position Indicator */}
                                                                                <div className="relative flex-shrink-0">
                                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a77fd4] to-[#875faf] flex items-center justify-center shadow-lg border-2 border-[#e0c080]/30 hover:border-[#e0c080] transition-all">
                                                                                        <span className="text-white font-bold text-xs">{position.index + 1}</span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Text Content */}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <h4 className="text-white font-bold text-xs mb-0.5 hover:text-[#e0c080] transition-colors">{posTranslation.name}</h4>
                                                                                    <p className="text-gray-400 text-xs leading-relaxed">{posTranslation.description}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

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

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode={authModalMode}
            />
        </div>
    );
};

export default Spreads;
