import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { SPREADS, generateDeck, getStaticLore } from './constants';
import { Spread, TarotCard, ReadingSession, ReadingAnalysis, Suit, ArcanaType, CardLore, HistoryItem } from './types';
import { getGeminiInterpretation } from './services/geminiService';

// --- Helper Functions ---
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/300x520/1c1022/9311d4?text=Tarot";
    e.currentTarget.onerror = null;
};

// --- Components ---

// Navigation Header
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="flex justify-center w-full bg-background-dark/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border-dark">
      <div className="flex flex-col w-full max-w-[1200px]">
        <div className="flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-10">
          <div className="flex items-center gap-4 text-white cursor-pointer" onClick={() => navigate('/')}>
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
            </div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Mystic Tarot</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <button
                onClick={() => navigate('/')}
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              >
                New Reading
              </button>
              <button
                onClick={() => navigate('/history')}
                className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              >
                History
              </button>
              <button
                onClick={() => navigate('/explore')}
                className={`text-sm font-medium transition-colors ${isActive('/explore') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Card Meanings
              </button>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-primary/90 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Log In</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Footer Component
const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="flex justify-center w-full bg-background-dark border-t border-border-dark py-10 mt-auto">
      <div className="flex flex-col w-full max-w-[1200px] px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <span className="font-bold text-lg">Mystic Tarot</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs">Connecting you with your inner wisdom through the ancient art of Tarot.</p>
          </div>
          <div className="flex gap-8 flex-wrap">
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm">Explore</h4>
              <button onClick={() => navigate('/')} className="text-gray-400 text-sm hover:text-white text-left">Readings</button>
              <button onClick={() => navigate('/explore')} className="text-gray-400 text-sm hover:text-white text-left">Card Library</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm">Support</h4>
              <span className="text-gray-400 text-sm">Help Center</span>
              <span className="text-gray-400 text-sm">Privacy Policy</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border-dark mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">© 2025 Mystic Tarot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Pages ---

// Card Details Page
const CardDetails = () => {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState<TarotCard | null>(null);
    const [lore, setLore] = useState<CardLore | null>(null);

    useEffect(() => {
        const deck = generateDeck();
        const foundCard = deck.find(c => c.id === cardId);

        if (foundCard) {
            setCard(foundCard);
            const staticData = getStaticLore(foundCard);
            setLore(staticData);
        } else {
            navigate('/explore');
        }
    }, [cardId, navigate]);

    if (!card) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white">
            <Header />
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span onClick={() => navigate('/explore')} className="cursor-pointer hover:text-primary">Guide</span>
                        <span>/</span>
                        <span className="text-white font-bold">{card.name}</span>
                    </div>
                    <button onClick={() => navigate('/explore')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-dark hover:bg-white/5 transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-base">arrow_back</span> Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 flex flex-col items-center sticky top-24 self-start">
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
                            <h1 className="text-4xl md:text-5xl font-black leading-tight text-white mb-2">{card.name}</h1>
                        </div>

                        {lore ? (
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
                                            General Meaning
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-lg bg-surface-dark/50 p-6 rounded-2xl border border-white/5">{lore.generalMeaning}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="size-10 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">favorite</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Love</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.love}</p>
                                        </div>
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="size-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">work</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Career</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.career}</p>
                                        </div>
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors md:col-span-2">
                                            <div className="size-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">lightbulb</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Advice</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.advice}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                        <h4 className="text-red-400 font-bold text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">rotate_right</span>
                                            Reversed
                                        </h4>
                                        <p className="text-gray-400 text-sm">{lore.reversed}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-400">Loading information...</p>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// History Page
const History = () => {
    const navigate = useNavigate();

    const mockHistory: HistoryItem[] = [
        {
            id: 1,
            date: 'Today, 9:00 AM',
            spreadName: 'Daily Draw',
            typeBadge: 'DAILY',
            typeColor: 'text-primary bg-primary/10',
            previewCards: ['https://www.sacred-texts.com/tarot/pkt/img/ar00.jpg'],
            notes: "New beginnings, innocence, spontaneity. A free spirit ready to explore..."
        },
        {
            id: 2,
            date: 'Yesterday',
            spreadName: 'Yes/No Question',
            typeBadge: 'YES/NO',
            typeColor: 'text-blue-400 bg-blue-500/10',
            previewCards: ['https://www.sacred-texts.com/tarot/pkt/img/ar18.jpg'],
            notes: "Illusion, fear, anxiety. Trust your intuition over your fears."
        },
        {
            id: 3,
            date: 'Oct 24',
            spreadName: 'Love Spread',
            typeBadge: 'LOVE',
            typeColor: 'text-pink-400 bg-pink-500/10',
            previewCards: ['https://www.sacred-texts.com/tarot/pkt/img/ca.jpg'],
            notes: "New feelings, spirituality, intuition. Love is flowing into your life."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white">
            <Header />
            <main className="flex-1 justify-center w-full bg-[#130e15] py-12 border-t border-border-dark">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10">
                    <div className="flex items-center justify-between px-4 pb-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Your Journey</h2>
                            <p className="text-gray-400 text-sm">Review your most recent spiritual insights.</p>
                        </div>
                        <button onClick={() => navigate('/')} className="text-primary hover:text-purple-400 text-sm font-bold flex items-center gap-1">
                            New Reading <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                        {mockHistory.map((item) => (
                            <div key={item.id} className="bg-card-dark rounded-lg overflow-hidden border border-border-dark group cursor-pointer hover:border-primary/30 transition-all">
                                <div
                                    className="h-32 w-full bg-cover bg-center relative"
                                    style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("${item.previewCards[0]}")`}}
                                >
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wide backdrop-blur-sm">
                                        {item.typeBadge}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-xs text-gray-500 mb-1">{item.date}</div>
                                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">{item.spreadName}</h3>
                                    <p className="text-gray-400 text-xs line-clamp-2">{item.notes}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-card-dark/50 rounded-lg border border-dashed border-border-dark flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]">
                            <div className="size-10 rounded-full bg-background-dark flex items-center justify-center text-gray-500 mb-3">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <p className="text-white font-medium text-sm mb-1">Log in to save history</p>
                            <p className="text-gray-500 text-xs mb-3">Track your cards over time.</p>
                            <button className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">
                                Sign In
                            </button>
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
    const [deck] = useState<TarotCard[]>(generateDeck());
    const [filter, setFilter] = useState<'ALL' | 'MAJOR' | Suit>('ALL');

    const filteredDeck = deck.filter(card => {
        if (filter === 'ALL') return true;
        if (filter === 'MAJOR') return card.arcana === ArcanaType.MAJOR;
        return card.suit === filter;
    });

    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            <Header />
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12">
                <div className="mb-10">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors">
                        <span className="material-symbols-outlined text-base">arrow_back</span> Back
                    </button>
                    <h1 className="text-4xl font-black text-white mb-2">Card Meanings</h1>
                    <p className="text-gray-400">Discover the symbolism and meaning of each of the 78 cards.</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>All</button>
                    <button onClick={() => setFilter('MAJOR')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'MAJOR' ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>Major Arcana</button>
                    {Object.values(Suit).filter(s => s !== Suit.NONE).map(suit => (
                        <button key={suit} onClick={() => setFilter(suit)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === suit ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>
                            {suit}
                        </button>
                    ))}
                </div>

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
                                <p className="text-xs text-primary font-bold uppercase mb-0.5">{card.arcana === ArcanaType.MAJOR ? 'Major' : card.suit}</p>
                                <p className="text-white text-sm font-bold leading-tight">{card.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    )
}

// Home Page with Hero Section
const Home = () => {
  const navigate = useNavigate();

  const handleSelectSpread = (spread: Spread) => {
    navigate('/session', { state: { spread } });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark animate-fade-in-up">
      <Header />

      {/* Hero Section */}
      <div className="flex flex-1 justify-center w-full">
        <div className="flex flex-col w-full max-w-[1200px] px-4 md:px-10 py-8">
          <div className="@container">
            <div className="@[480px]:p-0">
              <div
                className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-8 text-center relative overflow-hidden"
                style={{backgroundImage: `linear-gradient(rgba(22, 17, 24, 0.4), rgba(22, 17, 24, 0.8)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA2TIRpcbzYJwZ7gJlMqXD_YNfWI-TQGEojTCziKCmE7UGO93qv9KGu3OGWnKKnmRI0e3-1VwE6y1a8HBB4kBHJhEdrau9VXalcfwhTuEblYOuSzPFUz4dqTFqdzYSE7Ljn5J1qBb33G5VgoRHkRp3O3a7l9LpwkRMimZ12CjD6K_UpNIEF7EE8B8QtngE8UY0rDKgouA8Hl6zw9lQP4_v7wIHB2YX8Picvv_kS1ecbCjwrBYT3_MKC0VdwrTZrFhkAn5eCfEyNKshH")`}}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>

                <div className="relative z-10 flex flex-col gap-4 max-w-2xl items-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-primary/20 border border-primary/30 px-4 py-1.5 backdrop-blur-md mb-2">
                    <span className="text-xs font-medium text-purple-200 tracking-wide uppercase">Your Path Awaits</span>
                  </div>

                  <h1 className="text-white text-5xl md:text-6xl font-black leading-tight tracking-[-0.033em] drop-shadow-lg">
                    Reveal Your Destiny
                  </h1>

                  <h2 className="text-gray-200 text-lg md:text-xl font-normal leading-relaxed max-w-lg drop-shadow-md">
                    Unlock the ancient wisdom of the cards. Explore detailed meanings, track your spiritual journey, and find clarity in the chaos.
                  </h2>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleSelectSpread(SPREADS[0])}
                      className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary hover:bg-purple-600 transition-all text-white text-base font-bold shadow-[0_0_20px_rgba(147,17,212,0.4)]"
                    >
                      Start Reading
                    </button>
                    <button
                      onClick={() => navigate('/explore')}
                      className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all text-white text-base font-bold"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Offerings Section */}
      <div className="flex flex-1 justify-center w-full py-8">
        <div className="flex flex-col w-full max-w-[1200px] px-4 md:px-10">
          <div className="flex flex-col gap-2 px-4 pb-6">
            <h2 className="text-white text-3xl font-bold leading-tight tracking-[-0.015em]">Choose Your Reading</h2>
            <p className="text-gray-400">Select a spread to begin your consultation with the universe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-10">
            {SPREADS.map((spread, index) => (
              <div
                key={spread.id}
                onClick={() => handleSelectSpread(spread)}
                className="stagger-item group flex flex-1 gap-5 rounded-xl border border-border-dark bg-card-dark p-6 flex-col hover:border-primary/50 transition-all hover:shadow-[0_0_15px_rgba(147,17,212,0.15)] cursor-pointer"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[28px]">
                    {spread.id === 'three_card' ? 'light_mode' : spread.id === 'celtic_cross' ? 'grid_view' : 'favorite'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-white text-xl font-bold leading-tight">{spread.name}</h2>
                  <p className="text-[#b09db9] text-sm leading-relaxed">{spread.description}</p>
                </div>
                <div className="mt-auto pt-4 flex items-center text-primary text-sm font-bold uppercase tracking-wider">
                  Start <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Session Page - Card Selection with Flip Animation
const Session = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const spread = (location.state as any)?.spread as Spread;

  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<{card: TarotCard, flipped: boolean}[]>([]);
  const [question, setQuestion] = useState("");
  const [isShuffling, setIsShuffling] = useState(true);

  useEffect(() => {
    if (!spread) {
      navigate('/');
      return;
    }

    const newDeck = generateDeck();

    // Fisher-Yates Shuffle
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

    // Flip animation after a small delay
    setTimeout(() => {
      setSelectedCards(prev =>
        prev.map((item, idx) =>
          idx === newSelection.length - 1 ? { ...item, flipped: true } : item
        )
      );
    }, 300);

    // Auto navigate if done
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

      {/* Top Controls */}
      <div className="flex-none px-6 pt-6 pb-2 md:px-12 md:pt-10">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6 max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Reading Session</h1>
            <p className="text-[#b09db9] text-base font-normal leading-relaxed">Focus on your question. The cards will reveal what is hidden.</p>
          </div>
        </div>

        {/* Spread Selector Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar max-w-[1200px] mx-auto">
          {SPREADS.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate('/session', { state: { spread: s } })}
              className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 border transition-colors ${
                spread.id === s.id
                  ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(147,17,212,0.2)]'
                  : 'bg-surface-highlight hover:bg-[#3d2b45] border-border-dark text-white/70 hover:text-white'
              }`}
            >
              {spread.id === s.id && <span className="material-symbols-outlined text-lg">grid_view</span>}
              <p className="text-sm font-medium leading-normal">{s.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Cards Display */}
      {selectedCards.length > 0 && (
        <div className="px-4 md:px-12 py-4 max-w-[1200px] mx-auto w-full">
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
            {Array(spread.cardCount).fill(null).map((_, idx) => {
              const selected = selectedCards[idx];
              const positionName = spread.positions[idx]?.name || `Card ${idx + 1}`;

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden ${
                    selected
                      ? 'shadow-[0_0_30px_rgba(147,17,212,0.4)] border-2 border-primary'
                      : 'border-2 border-dashed border-border-dark bg-surface-dark/50'
                  }`}>
                    {selected ? (
                      <div className={`card-flip w-full h-full ${selected.flipped ? 'flipped' : ''}`}>
                        {/* Card Back */}
                        <div className="card-front absolute inset-0 bg-gradient-to-br from-surface-dark to-black flex items-center justify-center">
                          <div className="size-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
                            <span className="material-symbols-outlined text-primary text-2xl">style</span>
                          </div>
                        </div>
                        {/* Card Front */}
                        <div className="card-back absolute inset-0">
                          <img
                            src={selected.card.imageUrl}
                            alt={selected.card.name}
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
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

      {/* Main Area: Deck Display */}
      <main className="flex-1 relative flex items-center justify-center w-full bg-[#0f0b13] py-8 px-4 min-h-[300px] md:min-h-[400px]">
        {isShuffling ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              <span className="material-symbols-outlined text-6xl text-primary animate-spin">cached</span>
            </div>
            <p className="text-white font-display text-2xl animate-pulse tracking-wide">Shuffling...</p>
          </div>
        ) : (
          <div className="relative w-full max-w-[95%] h-56 md:h-72 flex items-center justify-center perspective-1000 overflow-visible">
            {deck.map((card, index) => {
              const isSelected = selectedCards.some(c => c.card.id === card.id);
              const totalCards = deck.length;
              const leftPos = (index / (totalCards - 1)) * 92;

              return (
                <div
                  key={card.id}
                  onClick={() => !isSelected && handleCardClick(card)}
                  className={`
                    absolute top-4
                    w-14 sm:w-16 md:w-20 lg:w-24 aspect-[2/3.4]
                    rounded-lg border border-white/20
                    bg-gradient-to-br from-surface-dark to-black
                    shadow-xl cursor-pointer
                    transition-all duration-300 ease-out origin-bottom
                    ${isSelected
                      ? 'opacity-0 -translate-y-20 scale-50 pointer-events-none'
                      : 'hover:z-[100] hover:-translate-y-6 hover:scale-105 hover:border-primary hover:shadow-[0_0_20px_rgba(147,17,212,0.4)]'
                    }
                  `}
                  style={{
                    left: `${leftPos}%`,
                    zIndex: isSelected ? -1 : index,
                    transform: isSelected ? undefined : `rotate(${(index - totalCards/2) * 0.3}deg)`,
                  }}
                >
                  <div className="absolute inset-0 rounded-lg overflow-hidden bg-surface-dark">
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-6 md:size-10 rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-primary text-xs md:text-lg">style</span>
                      </div>
                    </div>
                    <div className="absolute inset-1 border border-white/5 rounded"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div className="bg-surface-dark border-t border-white/5 py-4 text-center">
        <p className="text-gray-400 text-sm font-medium tracking-wide">
          {selectedCards.length === 0 ? "The deck is ready. Follow your intuition." :
           selectedCards.length < spread.cardCount ? `Choose card number ${selectedCards.length + 1}.` :
           "Processing your reading..."}
        </p>
      </div>
    </div>
  );
};

// Results Page - Centered Card Layout
const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as any;

    const [analysis, setAnalysis] = useState<ReadingAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCardIndex, setActiveCardIndex] = useState(1); // Middle card by default

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
                date: new Date().toLocaleDateString('pt-BR')
            };

            const result = await getGeminiInterpretation(session);
            setAnalysis(result);
            setIsLoading(false);
        };

        fetchInterpretation();
    }, [state, navigate]);

    if (!state?.spread) return null;

    const { spread, cards } = state;
    const activeCard = cards[activeCardIndex];
    const activeInterpretation = analysis?.cards?.[activeCardIndex];
    const activeLore = activeCard ? getStaticLore(activeCard) : null;

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white font-display overflow-x-hidden animate-fade-in-up">
            <Header />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Panel: Cards Display */}
                <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
                    {/* Heading */}
                    <div className="flex-none px-6 pt-6 pb-2 md:px-12 md:pt-10">
                        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
                            <div className="flex flex-col gap-2 max-w-2xl">
                                <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Your Reading</h1>
                                <p className="text-[#b09db9] text-base font-normal leading-relaxed">{spread.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* The Cards */}
                    <div className="flex-1 px-4 md:px-12 py-4 flex flex-col justify-center items-center min-h-[400px]">
                        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12 perspective-1000">
                            {cards.map((card: TarotCard, idx: number) => {
                                const isActive = idx === activeCardIndex;
                                const position = spread.positions[idx];

                                return (
                                    <div
                                        key={card.id}
                                        onClick={() => setActiveCardIndex(idx)}
                                        className={`flex flex-col items-center gap-4 group cursor-pointer ${isActive ? '-mt-0 sm:-mt-8' : ''}`}
                                    >
                                        <div className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl card-glow transition-all ${
                                            isActive
                                                ? 'shadow-[0_0_30px_rgba(147,17,212,0.25)] border-2 border-primary/50 ring-4 ring-primary/10'
                                                : 'border border-white/10'
                                        }`}>
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                                style={{backgroundImage: `url("${card.imageUrl}")`}}
                                            ></div>
                                            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent ${isActive ? 'opacity-80' : 'opacity-60'}`}></div>
                                            <div className={`absolute ${isActive ? 'bottom-6' : 'bottom-4'} left-0 right-0 text-center`}>
                                                <span className="uppercase tracking-widest text-xs font-bold text-primary mb-1 block">{position?.name}</span>
                                                <h3 className={`text-white font-bold ${isActive ? 'text-2xl' : 'text-xl'}`}>{card.name}</h3>
                                            </div>
                                            {isActive && (
                                                <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                    Focus Card
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-none p-6 md:p-8 flex justify-center w-full bg-gradient-to-t from-background-dark to-transparent">
                        <div className="flex flex-wrap gap-4 justify-center w-full max-w-lg">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold tracking-wide shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-xl">cached</span>
                                <span>New Reading</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Right Panel: Sidebar / Interpretation */}
                <aside className="hidden lg:flex w-[400px] flex-col border-l border-border-dark bg-surface-dark overflow-y-auto">
                    <div className="p-8 flex flex-col gap-8">
                        {/* Interpretation Header */}
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Interpretation</span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight mb-2">{activeCard?.name}</h2>
                            {activeLore && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {activeLore.keywords.slice(0, 3).map((kw, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-primary/20 text-primary-hover text-xs font-bold border border-primary/30">{kw}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Main Text */}
                        <div className="space-y-4 text-gray-300 leading-relaxed font-light text-lg">
                            {isLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-white/10 rounded w-full"></div>
                                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                                    <div className="h-4 bg-white/10 rounded w-4/6"></div>
                                    <p className="text-primary text-xs mt-2">Analyzing the cards...</p>
                                </div>
                            ) : (
                                <>
                                    <p>{activeInterpretation?.interpretation || activeLore?.generalMeaning}</p>

                                    <div className="p-4 bg-surface-highlight rounded-lg border border-border-dark mt-4">
                                        <p className="text-sm italic text-white/80">
                                            "{activeLore?.advice}"
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Synthesis */}
                        {!isLoading && analysis && (
                            <div className="pt-6 border-t border-border-dark">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Overall Synthesis</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{analysis.synthesis}</p>
                                <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-primary text-sm font-medium">{analysis.advice}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Mobile Interpretation (shown below cards on mobile) */}
            <div className="lg:hidden bg-surface-dark border-t border-border-dark p-6">
                <div className="flex items-center gap-2 text-primary mb-3">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Interpretation</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-3">{activeCard?.name}</h2>
                {isLoading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-white/10 rounded w-full"></div>
                        <div className="h-3 bg-white/10 rounded w-5/6"></div>
                    </div>
                ) : (
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {activeInterpretation?.interpretation || activeLore?.generalMeaning}
                    </p>
                )}
            </div>
        </div>
    );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:cardId" element={<CardDetails />} />
        <Route path="/session" element={<Session />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
};

export default App;
