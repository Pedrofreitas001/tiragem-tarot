import React, { useState, useEffect, useRef } from 'react';
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

// 1. Navigation Header
const Header = () => {
  const navigate = useNavigate();
  return (
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md supports-[backdrop-filter]:bg-background-dark/60">
        <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <span className="material-symbols-outlined text-[20px]">style</span>
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight font-display">Tarot</h2>
          </div>
          <nav className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <div className="flex items-center gap-1 bg-surface-dark/50 p-1 rounded-full border border-white/5">
                <button onClick={() => navigate('/')} className="px-4 py-1.5 rounded-full text-sm font-medium text-white bg-white/10 shadow-sm transition-all hover:bg-white/15">Tiragem</button>
                <button onClick={() => navigate('/history')} className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors">Histórico</button>
                <button onClick={() => navigate('/explore')} className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors">Baralhos</button>
            </div>
          </nav>
        </div>
      </header>
  );
};

// --- Pages ---

// 1. Card Details Page (Encyclopedia) - Now Static
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
                        <span onClick={() => navigate('/explore')} className="cursor-pointer hover:text-primary">Guia</span>
                        <span>/</span>
                        <span className="text-white font-bold">{card.name}</span>
                    </div>
                    <button onClick={() => navigate('/explore')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-dark hover:bg-white/5 transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-base">arrow_back</span> Voltar
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
                                            Significado Geral
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-lg bg-surface-dark/50 p-6 rounded-2xl border border-white/5">{lore.generalMeaning}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="size-10 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">favorite</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Amor</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.love}</p>
                                        </div>
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="size-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">work</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Carreira</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.career}</p>
                                        </div>
                                        <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors md:col-span-2">
                                            <div className="size-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">lightbulb</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Conselho</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{lore.advice}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                        <h4 className="text-red-400 font-bold text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">rotate_right</span>
                                            Invertida
                                        </h4>
                                        <p className="text-gray-400 text-sm">{lore.reversed}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-400">Carregando informações...</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// 2. History Page
const History = () => {
    // Mock Data based on the provided HTML
    const mockHistory: HistoryItem[] = [
        {
            id: 1,
            date: '23 Out 2023',
            spreadName: 'Passado, Presente, Futuro',
            typeBadge: '3 CARTAS',
            typeColor: 'text-primary bg-primary/10',
            previewCards: [
                'https://www.sacred-texts.com/tarot/pkt/img/maj00.jpg',
                'https://www.sacred-texts.com/tarot/pkt/img/maj01.jpg',
                'https://www.sacred-texts.com/tarot/pkt/img/maj02.jpg'
            ],
            notes: "Senti uma energia forte de mudança..."
        },
        {
            id: 2,
            date: '15 Out 2023',
            spreadName: 'Tiragem do Dia',
            typeBadge: 'DIÁRIA',
            typeColor: 'text-blue-400 bg-blue-500/10',
            previewCards: [
                'https://www.sacred-texts.com/tarot/pkt/img/sw02.jpg'
            ],
            notes: "Preciso focar mais no trabalho e evitar..."
        },
        {
            id: 3,
            date: '01 Out 2023',
            spreadName: 'Cruz Celta',
            typeBadge: 'COMPLEXA',
            typeColor: 'text-amber-500 bg-amber-500/10',
            previewCards: [
                'https://www.sacred-texts.com/tarot/pkt/img/maj16.jpg',
                'https://www.sacred-texts.com/tarot/pkt/img/w10.jpg',
            ],
            notes: "Mês complicado pela frente. A carta da Torre..."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white">
            <Header />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Heading */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Histórico</h1>
                        <p className="text-gray-400 text-lg">Seu diário de leituras e reflexões.</p>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined">add</span>
                        Nova Tiragem
                    </button>
                </div>

                {/* Toolbar */}
                <div className="mb-8">
                    <div className="bg-surface-dark rounded-xl p-4 border border-border-dark flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-primary/50 group text-gray-300">
                                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform text-lg">calendar_today</span>
                                <span className="text-sm font-medium">Data</span>
                                <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-primary/50 group text-gray-300">
                                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform text-lg">filter_list</span>
                                <span className="text-sm font-medium">Tipo</span>
                                <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                            </button>
                        </div>
                        <div className="flex items-center bg-black/20 rounded-lg px-3 py-2 w-full sm:w-64 border border-transparent focus-within:border-primary transition-colors">
                            <span className="material-symbols-outlined text-gray-400">search</span>
                            <input className="bg-transparent border-none text-sm w-full focus:outline-none ml-2 text-white placeholder-gray-500" placeholder="Buscar nas anotações..." type="text"/>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-border-dark bg-surface-dark shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-dark bg-white/5 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                                <th className="px-6 py-4 w-40">Data</th>
                                <th className="px-6 py-4 w-60">Tipo</th>
                                <th className="px-6 py-4 w-32 text-center">Cartas</th>
                                <th className="px-6 py-4 min-w-[200px]">Notas</th>
                                <th className="px-6 py-4 w-32 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark text-sm">
                            {mockHistory.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-gray-300 font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base opacity-50">event</span>
                                            {item.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        <span className={`${item.typeColor} px-2 py-1 rounded text-xs font-bold mr-2`}>{item.typeBadge}</span>
                                        {item.spreadName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-3 justify-center">
                                            {item.previewCards.map((url, idx) => (
                                                <div key={idx} className="size-8 rounded-full ring-2 ring-surface-dark bg-cover bg-center overflow-hidden">
                                                    <img src={url} alt="card" className="w-full h-full object-cover" onError={handleImageError} />
                                                </div>
                                            ))}
                                            {item.previewCards.length < 3 && item.previewCards.length > 1 && (
                                                <div className="size-8 rounded-full ring-2 ring-surface-dark bg-center flex items-center justify-center bg-gray-800 text-[8px] font-bold text-gray-400">
                                                    +
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 italic">
                                        "{item.notes}"
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded transition-all text-xs font-bold inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">edit_note</span>
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

// 3. Explore Page
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
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
                 <div className="mb-10">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors">
                        <span className="material-symbols-outlined text-base">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-4xl font-black text-white mb-2">Guia das Cartas</h1>
                    <p className="text-gray-400">Conheça o significado e simbolismo de cada uma das 78 cartas.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>Todas</button>
                    <button onClick={() => setFilter('MAJOR')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'MAJOR' ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>Arcanos Maiores</button>
                    {Object.values(Suit).filter(s => s !== Suit.NONE).map(suit => (
                        <button key={suit} onClick={() => setFilter(suit)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === suit ? 'bg-primary text-white' : 'bg-surface-dark text-gray-400 hover:text-white'}`}>
                            {suit}
                        </button>
                    ))}
                </div>

                {/* Grid */}
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
        </div>
    )
}

// 4. Home / Spread Selection
const Home = () => {
  const navigate = useNavigate();

  const handleSelectSpread = (spread: Spread) => {
    navigate('/session', { state: { spread } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16">
        {/* Modern Hero Section */}
        <div className="text-center mb-20 space-y-6 pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Leitura Online
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter">
                Tiragem de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Tarot</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Uma ferramenta de autoconhecimento para trazer clareza aos seus pensamentos. Escolha uma tiragem abaixo e reflita sobre o seu momento.
            </p>
        </div>

        {/* Spreads Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {SPREADS.map((spread) => (
            <div 
              key={spread.id}
              onClick={() => handleSelectSpread(spread)}
              className="group relative bg-surface-dark/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 cursor-pointer hover:border-primary/50 hover:bg-surface-dark hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                  <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">style</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${spread.difficulty === 'Beginner' ? 'text-green-400 border-green-400/20 bg-green-400/5' : spread.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' : 'text-red-400 border-red-400/20 bg-red-400/5'}`}>
                    {spread.difficulty === 'Beginner' ? 'Iniciante' : spread.difficulty === 'Intermediate' ? 'Intermediário' : 'Avançado'}
                  </span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{spread.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 h-10">{spread.description}</p>
              
              <div className="flex items-center text-white/50 text-sm font-bold tracking-wide uppercase group-hover:text-white transition-colors">
                Começar <span className="material-symbols-outlined text-sm ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>

        {/* Explore Section - Restored to Previous Design */}
        <div className="rounded-3xl bg-gradient-to-r from-surface-dark to-[#1a1120] border border-white/5 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                    <h2 className="text-3xl font-bold text-white mb-4">Explore as Cartas do Tarot</h2>
                    <p className="text-gray-400 mb-6 text-lg">
                        Mergulhe na sabedoria antiga do baralho Rider-Waite. Estude o simbolismo, as cores e os arquétipos de cada carta antes de sua leitura.
                    </p>
                    <button onClick={() => navigate('/explore')} className="px-6 py-3 rounded-lg bg-white text-background-dark font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">menu_book</span>
                        Ver Enciclopédia
                    </button>
                </div>
                <div className="flex -space-x-8">
                     {[1, 2, 3, 4].map(i => (
                         <div 
                            key={i} 
                            className="w-24 h-36 rounded-lg bg-surface-dark border border-white/10 shadow-xl transform rotate-3 hover:-translate-y-4 transition-transform duration-300 bg-cover bg-center" 
                            style={{backgroundImage: `url(https://www.sacred-texts.com/tarot/pkt/img/ar0${i}.jpg)`}}
                         ></div>
                     ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

// 5. Session (Deck Selection - All Visible)
const Session = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const spread = (location.state as any)?.spread as Spread;
  
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [question, setQuestion] = useState("");
  const [isShuffling, setIsShuffling] = useState(true);
  
  useEffect(() => {
    if (!spread) {
      navigate('/');
      return;
    }

    // Generate and Shuffle Deck
    const newDeck = generateDeck();
    
    // Fisher-Yates Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    setDeck(newDeck);
    
    // Simulating shuffle animation time
    setTimeout(() => setIsShuffling(false), 1000);
  }, [spread, navigate]);

  const handleCardClick = (card: TarotCard) => {
    if (selectedCards.length >= spread.cardCount) return;
    if (selectedCards.find(c => c.id === card.id)) return;

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    // Auto navigate if done
    if (newSelection.length === spread.cardCount) {
        setTimeout(() => {
            navigate('/result', { 
                state: { 
                    spread, 
                    cards: newSelection, 
                    question 
                } 
            });
        }, 800);
    }
  };

  if (!spread) return null;

  return (
    <div className="flex flex-col h-screen bg-background-dark overflow-hidden">
      <Header />
      
      {/* Top Controls */}
      <div className="relative z-20 px-6 py-6 bg-surface-dark border-b border-border-dark shadow-lg">
        <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full">
                <label className="block text-xs font-bold uppercase text-primary mb-2 tracking-widest">Sua Questão (Opcional)</label>
                <input 
                    type="text" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Em que você está pensando agora?"
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                />
            </div>
            <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                <div className="text-right">
                    <p className="text-gray-400 text-xs uppercase">Cartas</p>
                    <p className="text-white font-bold text-xl">{selectedCards.length} / <span className="text-primary">{spread.cardCount}</span></p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Area: Overlapping Deck Display */}
      <main className="flex-1 relative flex items-center justify-center w-full bg-[#0f0b13] p-4">
        {isShuffling ? (
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                    <span className="material-symbols-outlined text-6xl text-primary animate-spin">cached</span>
                </div>
                <p className="text-white font-display text-2xl animate-pulse tracking-wide">Embaralhando...</p>
            </div>
        ) : (
            <div className="relative w-full max-w-[95%] h-64 md:h-80 flex items-center justify-center perspective-1000">
                {deck.map((card, index) => {
                    const isSelected = selectedCards.some(c => c.id === card.id);
                    const totalCards = deck.length;
                    const leftPos = (index / (totalCards - 1)) * 92; 

                    return (
                        <div 
                            key={card.id}
                            onClick={() => !isSelected && handleCardClick(card)}
                            className={`
                                absolute top-0
                                w-20 md:w-32 aspect-[2/3.4]
                                rounded-lg border border-white/20 
                                bg-gradient-to-br from-surface-dark to-black 
                                shadow-xl cursor-pointer 
                                transition-all duration-300 ease-out origin-bottom
                                ${isSelected 
                                    ? 'opacity-0 -translate-y-32 scale-50 pointer-events-none' 
                                    : 'hover:z-50 hover:-translate-y-12 hover:scale-125 hover:border-primary hover:shadow-[0_0_30px_rgba(147,17,212,0.6)]'
                                }
                            `}
                            style={{
                                left: `${leftPos}%`,
                                zIndex: index,
                                transform: isSelected ? undefined : `rotate(${(index - totalCards/2) * 0.5}deg)`, 
                            }}
                        >
                            <div className="absolute inset-0 rounded-lg overflow-hidden bg-surface-dark">
                                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-8 md:size-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-primary text-sm md:text-xl">style</span>
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
            {selectedCards.length === 0 ? "O baralho está pronto. Siga sua intuição." : 
             selectedCards.length < spread.cardCount ? `Escolha a carta número ${selectedCards.length + 1}.` :
             "Processando sua leitura..."}
        </p>
      </div>
    </div>
  );
};

// 6. Results Page
const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
                date: new Date().toLocaleDateString('pt-BR')
            };

            const result = await getGeminiInterpretation(session);
            setAnalysis(result);
            setIsLoading(false);
        };

        fetchInterpretation();
    }, [state, navigate]);

    if (!state?.spread) return null;

    const { spread, cards, question } = state;

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-slate-900 dark:text-white font-display">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="flex flex-col md:flex-row flex-wrap justify-between gap-6 mb-10 items-start md:items-end">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            <span>{new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">Sua Leitura</h1>
                        <p className="text-gray-400 text-lg font-normal leading-relaxed mt-1">{spread.name} — Foco: {question || "Geral"}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                         <button onClick={() => navigate('/')} className="flex-1 md:flex-none h-11 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-[0_0_20px_rgba(147,17,212,0.3)] transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">cached</span>
                            <span>Nova Tiragem</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-5 flex flex-col gap-8 order-2 lg:order-1">
                        <div className="bg-gradient-to-br from-primary/10 to-surface-dark border border-primary/20 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-9xl text-primary">psychology</span>
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                    Síntese
                                </h2>
                                {isLoading ? (
                                    <div className="space-y-3 animate-pulse">
                                        <div className="h-2 bg-white/10 rounded w-full"></div>
                                        <div className="h-2 bg-white/10 rounded w-5/6"></div>
                                        <div className="h-2 bg-white/10 rounded w-4/6"></div>
                                        <p className="text-primary text-xs mt-2">Analisando as cartas...</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-200 leading-relaxed text-base mb-4">
                                            {analysis?.synthesis}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-white font-bold text-sm mb-1">Conselho:</p>
                                            <p className="text-gray-300 italic text-sm">{analysis?.advice}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Mesa</h3>
                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                {cards.map((card: TarotCard, idx: number) => (
                                    <div key={card.id} className="relative aspect-[2/3.4] group cursor-pointer overflow-hidden rounded-lg border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20">
                                        <img 
                                            src={card.imageUrl} 
                                            alt={card.name}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                            <span className="text-[10px] text-primary font-bold uppercase">{spread.positions[idx]?.name}</span>
                                            <span className="text-white font-bold text-xs truncate">{card.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <h2 className="text-white text-2xl font-bold">Interpretação</h2>
                        </div>

                        {isLoading ? (
                             Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex gap-5 p-5 rounded-2xl bg-surface-dark border border-white/5 animate-pulse">
                                    <div className="w-24 h-36 bg-white/5 rounded-lg"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-white/5 rounded w-1/3"></div>
                                        <div className="h-6 bg-white/5 rounded w-1/2"></div>
                                        <div className="h-20 bg-white/5 rounded w-full"></div>
                                    </div>
                                </div>
                             ))
                        ) : (
                            analysis?.cards?.map((item, idx) => {
                                const cardInfo = cards[idx];
                                return (
                                    <article key={idx} className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-all shadow-sm hover:shadow-lg hover:shadow-black/20 group">
                                        <div className="w-full sm:w-32 aspect-[2/3.4] shrink-0 rounded-lg overflow-hidden relative shadow-md">
                                            <img 
                                                src={cardInfo.imageUrl} 
                                                alt={cardInfo.name}
                                                onError={handleImageError}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 left-2 size-6 flex items-center justify-center rounded-full bg-black/60 text-white text-xs font-bold border border-white/10">{idx + 1}</div>
                                        </div>
                                        <div className="flex flex-col flex-1 gap-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1 block">Posição: {spread.positions[idx]?.name}</span>
                                                    <h3 className="text-white text-xl font-bold">{cardInfo.name}</h3>
                                                </div>
                                                <span className="px-2 py-1 rounded bg-white/5 text-gray-400 text-xs font-medium">{cardInfo.arcana}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {item.interpretation}
                                            </p>
                                            <div className="mt-auto pt-3 border-t border-white/5 flex gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">key</span>
                                                    Palavras-chave: {item.keywords?.join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
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
