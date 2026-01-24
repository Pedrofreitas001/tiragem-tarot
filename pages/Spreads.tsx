import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, LanguageToggle } from '../contexts/LanguageContext';
import { SPREADS } from '../constants';
import { Spread } from '../types';
import { UserMenu } from '../components/UserMenu';
import { PaywallModal, usePaywall } from '../components/PaywallModal';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/AuthModal';

// Inline components since they're in App.tsx
const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, isPortuguese } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;
    const exploreRoute = isPortuguese ? '/arquivo-arcano' : '/arcane-archive';

    return (
        <>
            <header className="flex justify-center w-full bg-background-dark/95 backdrop-blur-md sticky top-0 z-40 border-b border-border-dark">
                <div className="flex flex-col w-full max-w-[1200px]">
                    <div className="flex items-center justify-between whitespace-nowrap px-4 py-3 lg:px-10 lg:py-4">
                        <div className="flex items-center text-white cursor-pointer" onClick={() => navigate('/')}>
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Mystic Tarot</h2>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-gray-400'}`}>
                                {t.nav.home}
                            </button>
                            <button onClick={() => navigate(isPortuguese ? '/jogos-de-tarot' : '/spreads')} className="text-sm font-medium text-white">
                                {t.nav.tarot}
                            </button>
                            <button onClick={() => navigate(isPortuguese ? '/carta-do-dia' : '/daily-card')} className={`text-sm font-medium transition-colors ${(isActive('/carta-do-dia') || isActive('/daily-card')) ? 'text-white' : 'text-gray-400'}`}>
                                {isPortuguese ? 'Carta do Dia' : 'Daily Card'}
                            </button>
                            <button onClick={() => navigate(exploreRoute)} className={`text-sm font-medium transition-colors ${(isActive('/explore') || isActive(exploreRoute)) ? 'text-white' : 'text-gray-400'}`}>
                                {t.nav.cardMeanings}
                            </button>
                            <button onClick={() => navigate('/history')} className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-400'}`}>
                                {t.nav.history}
                            </button>
                            <button onClick={() => navigate('/shop')} className={`text-sm font-medium transition-colors ${isActive('/shop') ? 'text-white' : 'text-gray-400'}`}>
                                {t.nav.shop}
                            </button>
                        </nav>

                        <div className="flex items-center gap-3">
                            <LanguageToggle />

                            <button className="p-2 rounded-lg">
                                <span className="material-symbols-outlined text-gray-300">shopping_bag</span>
                            </button>

                            <UserMenu onLoginClick={() => setShowAuthModal(true)} />

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg"
                            >
                                <span className="material-symbols-outlined text-white">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden border-t border-border-dark p-4 space-y-2">
                            <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300">{t.nav.home}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/jogos-de-tarot' : '/spreads'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-white font-medium">{t.nav.tarot}</button>
                            <button onClick={() => { navigate(isPortuguese ? '/carta-do-dia' : '/daily-card'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300">{isPortuguese ? 'Carta do Dia' : 'Daily Card'}</button>
                            <button onClick={() => { navigate(exploreRoute); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300">{t.nav.cardMeanings}</button>
                            <button onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300">{t.nav.history}</button>
                            <button onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-gray-300">{t.nav.shop}</button>
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
                            <span className="font-bold text-lg">Mystic Tarot</span>
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

const Spreads = () => {
    const navigate = useNavigate();
    const { t, isPortuguese } = useLanguage();
    const { checkAccess } = usePaywall();
    const { incrementReadingCount } = useAuth();
    const [selectedSpread, setSelectedSpread] = useState<Spread | null>(SPREADS[0]);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const spreadImages: Record<string, string> = {
        'three_card': 'images/spreads/three_card.png',
        'celtic_cross': 'images/spreads/celtic_cross.png',
        'love_check': 'images/spreads/love_check.png',
        'yes_no': 'images/spreads/yes_no.png',
        'card_of_day': 'images/spreads/card_of_day.png',
    };

    const handleStartReading = async (spread: Spread) => {
        if (!checkAccess('readings')) {
            setShowPaywall(true);
            return;
        }
        // Increment reading count when starting a new reading (works for both guests and logged in users)
        await incrementReadingCount();
        navigate('/session', { state: { spread } });
    };

    const getSpreadTranslation = (spreadId: string) => {
        const translationMap: Record<string, { name: string; description: string }> = {
            'three_card': {
                name: isPortuguese ? 'Três Cartas' : 'Three Card Spread',
                description: isPortuguese
                    ? 'Passado, Presente e Futuro. Uma leitura clássica para insights rápidos.'
                    : 'Past, Present, and Future. A classic spread for quick insights.',
            },
            'celtic_cross': {
                name: isPortuguese ? 'Cruz Celta' : 'Celtic Cross',
                description: isPortuguese
                    ? 'Uma análise profunda de uma situação específica, cobrindo influências internas e externas.'
                    : 'A deep dive into a specific situation, covering internal and external influences.',
            },
            'love_check': {
                name: isPortuguese ? 'Amor & Relacionamento' : 'Love & Relationship',
                description: isPortuguese
                    ? 'Compreenda a dinâmica entre você e um parceiro.'
                    : 'Understand the dynamics between you and a partner.',
            },
            'yes_no': {
                name: isPortuguese ? 'Sim ou Não' : 'Yes or No',
                description: isPortuguese
                    ? 'Obtenha uma resposta direta para sua pergunta com uma única carta.'
                    : 'Get a direct answer to your question with a single card.',
            },
            'card_of_day': {
                name: isPortuguese ? 'Carta do Dia' : 'Card of the Day',
                description: isPortuguese
                    ? 'Uma reflexão diária para guiar seus passos.'
                    : 'A daily reflection to guide your steps.',
            },
        };
        return translationMap[spreadId] || { name: 'Unknown', description: '' };
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
        setSelectedSpread(spread);
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
            <Header />
            <CartDrawer />
            <StarsBackground />

            <main className="relative z-10 flex-1 w-full px-4 md:px-8 py-12">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-12">
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

                    {/* Mobile Layout - Cards with Inline Details */}
                    <div className="block md:hidden">
                        <div className="space-y-6">
                            {SPREADS.map((spread) => {
                                const translation = getSpreadTranslation(spread.id);
                                const isSelected = selectedSpread?.id === spread.id;

                                return (
                                    <div key={spread.id}>
                                        {/* Spread Card */}
                                        <div
                                            onClick={() => handleSelectSpread(spread)}
                                            className={`relative p-4 rounded-2xl border-2 cursor-pointer overflow-hidden transition-all ${isSelected
                                                ? 'border-[#a77fd4] bg-gradient-to-r from-[#875faf]/25 to-[#a77fd4]/15 shadow-lg shadow-purple-900/30'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-base mb-2 ${isSelected ? 'text-[#a77fd4]' : 'text-white'}`}>
                                                        {translation.name}
                                                    </h3>
                                                    <p className={`text-xs line-clamp-2 mb-3 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                                        {translation.description}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 rounded-md text-white text-[9px] font-bold uppercase ${isSelected ? 'bg-[#a77fd4]/30 text-[#a77fd4]' : 'bg-white/10'}`}>
                                                            {spread.cardCount} {isPortuguese ? 'cartas' : 'cards'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Spread Details - Show Below Selected Card (Mobile Only) */}
                                        {isSelected && (
                                            <div className="mt-6 relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-6 flex flex-col">

                                                {/* Main Content - Two Column Layout */}
                                                <div className="relative flex flex-col lg:flex-row gap-8 flex-1">
                                                    {/* Left Part - Image, Title, Description */}
                                                    <div className="lg:w-2/5 flex flex-col items-start">
                                                        {/* Image with Premium Banner */}
                                                        <div className="mb-8 w-full max-w-[280px] relative group">
                                                            {/* Premium Background Banner */}
                                                            <div className="absolute -inset-6 bg-gradient-to-br from-[#2a1a3a] via-[#1e1628] to-[#1a1024] rounded-3xl blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                            <div className="absolute -inset-4 bg-gradient-to-t from-[#a77fd4]/20 to-transparent rounded-2xl"></div>

                                                            <img
                                                                src={spreadImages[selectedSpread.id]}
                                                                alt={getSpreadTranslation(selectedSpread.id).name}
                                                                className="relative w-full aspect-[2/3.2] object-cover rounded-2xl shadow-2xl shadow-purple-900/50 border-2 border-[#a77fd4]/30 group-hover:border-[#a77fd4]/60 transition-all duration-300"
                                                            />

                                                            {/* Overlay Accent */}
                                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#1a1024]/40 via-transparent to-transparent pointer-events-none"></div>
                                                        </div>

                                                        {/* Title and Subtitle */}
                                                        <h2 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                            {getSpreadTranslation(selectedSpread.id).name}
                                                        </h2>
                                                        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                                                            {getSpreadTranslation(selectedSpread.id).description}
                                                        </p>

                                                        {/* CTA Button */}
                                                        <button
                                                            onClick={() => handleStartReading(selectedSpread)}
                                                            className="w-full px-6 py-3 bg-gradient-to-r from-[#875faf] via-[#9968ba] to-[#a77fd4] text-white font-bold text-base rounded-xl shadow-2xl shadow-purple-900/50 active:scale-95 flex items-center justify-center gap-2 border border-[#a77fd4]/30 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">stars</span>
                                                            {isPortuguese ? 'Iniciar Leitura' : 'Start Reading'}
                                                        </button>
                                                    </div>

                                                    {/* Right Part - Positions Clean List */}
                                                    <div className="lg:w-2/5 lg:ml-8 flex flex-col">
                                                        <h3 className="text-sm font-bold text-[#e0c080] uppercase tracking-widest mb-8 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-[#e0c080]"></span>
                                                            {isPortuguese ? 'Jornada das Cartas' : 'Card Journey'}
                                                        </h3>

                                                        <div className="relative space-y-6 flex-1">
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
                                                                            <div className="absolute left-5 top-12 w-0.5 h-6 bg-gradient-to-b from-[#a77fd4]/60 to-[#a77fd4]/20"></div>
                                                                        )}

                                                                        <div className="flex items-start gap-4">
                                                                            {/* Circle Position Indicator */}
                                                                            <div className="relative flex-shrink-0 mt-1">
                                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a77fd4] to-[#875faf] flex items-center justify-center shadow-lg border-2 border-[#e0c080]/30 hover:border-[#e0c080] transition-all">
                                                                                    <span className="text-white font-bold text-sm">{position.index + 1}</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Text Content */}
                                                                            <div className="flex-1 min-w-0 py-1">
                                                                                <h4 className="text-white font-bold text-sm mb-1 hover:text-[#e0c080] transition-colors">{posTranslation.name}</h4>
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
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tablet/Desktop Layout - Sidebar + Content */}
                    <div className="hidden md:flex gap-8">
                        {/* Left Sidebar - Spread Cards */}
                        <aside className="w-80 lg:w-96 flex-shrink-0">
                            <div className="space-y-4 sticky top-24">
                                {SPREADS.map((spread) => {
                                    const translation = getSpreadTranslation(spread.id);
                                    const isSelected = selectedSpread?.id === spread.id;

                                    return (
                                        <div
                                            key={spread.id}
                                            onClick={() => handleSelectSpread(spread)}
                                            className={`relative p-5 rounded-2xl border-2 cursor-pointer overflow-hidden transition-all ${isSelected
                                                ? 'border-[#a77fd4] bg-gradient-to-r from-[#875faf]/25 to-[#a77fd4]/15 shadow-lg shadow-purple-900/30'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-[#a77fd4]' : 'text-white'}`}>
                                                        {translation.name}
                                                    </h3>
                                                    <p className={`text-sm line-clamp-2 mb-3 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                                        {translation.description}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 rounded-md text-white text-[10px] font-bold uppercase ${isSelected ? 'bg-[#a77fd4]/30 text-[#a77fd4]' : 'bg-white/10'}`}>
                                                            {spread.cardCount} {isPortuguese ? 'cartas' : 'cards'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        {/* Right Content - Spread Details */}
                        {selectedSpread && (
                            <div className="flex-1 min-h-[500px]">
                                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-10 flex flex-col">

                                    {/* Main Content - Two Column Layout */}
                                    <div className="relative flex flex-col lg:flex-row gap-8 flex-1">
                                        {/* Left Part - Image, Title, Description */}
                                        <div className="lg:w-2/5 flex flex-col items-start">
                                            {/* Image with Premium Banner */}
                                            <div className="mb-8 w-full max-w-[280px] relative group">
                                                {/* Premium Background Banner */}
                                                <div className="absolute -inset-6 bg-gradient-to-br from-[#2a1a3a] via-[#1e1628] to-[#1a1024] rounded-3xl blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="absolute -inset-4 bg-gradient-to-t from-[#a77fd4]/20 to-transparent rounded-2xl"></div>

                                                <img
                                                    src={spreadImages[selectedSpread.id]}
                                                    alt={getSpreadTranslation(selectedSpread.id).name}
                                                    className="relative w-full aspect-[2/3.2] object-cover rounded-2xl shadow-2xl shadow-purple-900/50 border-2 border-[#a77fd4]/30 group-hover:border-[#a77fd4]/60 transition-all duration-300"
                                                />

                                                {/* Overlay Accent */}
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#1a1024]/40 via-transparent to-transparent pointer-events-none"></div>
                                            </div>

                                            {/* Title and Subtitle */}
                                            <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: "'Crimson Text', serif" }}>
                                                {getSpreadTranslation(selectedSpread.id).name}
                                            </h2>
                                            <p className="text-gray-300 text-base leading-relaxed mb-8">
                                                {getSpreadTranslation(selectedSpread.id).description}
                                            </p>

                                            {/* CTA Button */}
                                            <button
                                                onClick={() => handleStartReading(selectedSpread)}
                                                className="w-full px-6 py-3 bg-gradient-to-r from-[#875faf] via-[#9968ba] to-[#a77fd4] text-white font-bold text-base rounded-xl shadow-2xl shadow-purple-900/50 active:scale-95 flex items-center justify-center gap-2 border border-[#a77fd4]/30 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-lg">stars</span>
                                                {isPortuguese ? 'Iniciar Leitura' : 'Start Reading'}
                                            </button>
                                        </div>

                                        {/* Right Part - Positions Clean List */}
                                        <div className="lg:w-2/5 lg:ml-8 flex flex-col">
                                            <h3 className="text-sm font-bold text-[#e0c080] uppercase tracking-widest mb-8 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#e0c080]"></span>
                                                {isPortuguese ? 'Jornada das Cartas' : 'Card Journey'}
                                            </h3>

                                            <div className="relative space-y-6 flex-1">
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
                                                                <div className="absolute left-5 top-12 w-0.5 h-6 bg-gradient-to-b from-[#a77fd4]/60 to-[#a77fd4]/20"></div>
                                                            )}

                                                            <div className="flex items-start gap-4">
                                                                {/* Circle Position Indicator */}
                                                                <div className="relative flex-shrink-0 mt-1">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a77fd4] to-[#875faf] flex items-center justify-center shadow-lg border-2 border-[#e0c080]/30 hover:border-[#e0c080] transition-all">
                                                                        <span className="text-white font-bold text-sm">{position.index + 1}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Text Content */}
                                                                <div className="flex-1 min-w-0 py-1">
                                                                    <h4 className="text-white font-bold text-sm mb-1 hover:text-[#e0c080] transition-colors">{posTranslation.name}</h4>
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
                    setShowAuthModal(true);
                }}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default Spreads;
