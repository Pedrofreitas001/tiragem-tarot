import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TAROT_CARDS } from '../../tarotData';

/**
 * Hook customizado para detectar quando um elemento entra na viewport
 * Triggers animações quando o elemento fica visível durante scroll
 */
const useIntersection = (ref: React.RefObject<HTMLElement | null>) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref]);

    return isVisible;
};

interface FireballStepProps {
    title: string;
    desc: string;
    card: any;
    isLast?: boolean;
    align?: 'left' | 'right';
}

/**
 * Componente de passo com bola de fogo animada
 * Baseado no FireballStep fornecido pelo usuário
 */
const FireballStep: React.FC<FireballStepProps> = ({ title, desc, card, isLast, align = 'left' }) => {
    const stepRef = useRef<HTMLDivElement>(null);
    const isVisible = useIntersection(stepRef);

    return (
        <div
            ref={stepRef}
            className={`relative flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                } ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
            {/* Coluna da Bola de Fogo */}
            <div className="flex flex-col items-center flex-shrink-0 relative">
                <div className="relative group">
                    {/* Efeito de Brilho Dourado */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-r from-yellow-300/40 via-amber-400/40 to-yellow-500/40 blur-xl rounded-full transition-all duration-1000 ${isVisible ? 'scale-125 opacity-70' : 'scale-0 opacity-0'
                            }`}
                    ></div>

                    {/* Bola Dourada - sem borda */}
                    <div
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                            boxShadow: isVisible
                                ? '0 0 24px rgba(251, 191, 36, 0.6), 0 0 12px rgba(245, 158, 11, 0.4), inset 0 0 16px rgba(255, 255, 255, 0.3)'
                                : 'none',
                        }}
                    >
                        {/* Efeito interno dourado */}
                        <div
                            className={`absolute inset-1.5 rounded-full bg-gradient-to-t from-amber-500/30 via-yellow-300/50 to-white/60 ${isVisible ? 'animate-pulse' : ''}`}
                        ></div>
                    </div>
                </div>

                {/* Linha de Conexão dourada */}
                {!isLast && (
                    <div className="relative w-0.5 h-12 md:h-16 mt-2 overflow-hidden bg-gradient-to-b from-yellow-400/10 to-transparent">
                        <div
                            className={`absolute top-0 left-0 w-full bg-gradient-to-b from-yellow-400/70 via-amber-500/50 to-transparent transition-all duration-[1500ms] ease-in-out ${isVisible ? 'h-full' : 'h-0'}`}
                        ></div>
                    </div>
                )}
            </div>

            {/* Coluna do Conteúdo - Carta ao lado dos textos */}
            <div
                className={`flex-1 pt-2 pb-6 transition-all duration-1000 delay-300 ${isVisible
                    ? 'opacity-100 translate-x-0'
                    : `opacity-0 ${align === 'right' ? 'translate-x-12' : '-translate-x-12'}`
                    } flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
            >
                {/* Mini Carta do Arcano */}
                {card && (
                    <div
                        className={`flex-shrink-0 transition-all duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                    >
                        <div className="rounded-lg overflow-hidden border-2 border-yellow-400/30 shadow-xl">
                            <img
                                src={card.imageUrl}
                                alt={card.name}
                                className="w-24 h-36 md:w-32 md:h-48 object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://placehold.co/100x150/1c1022/9311d4?text=Card';
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Textos ao lado da carta */}
                <div className={`flex flex-col justify-center ${align === 'right' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} items-center text-center`}>
                    {/* Título do Arcano */}
                    <h3 className="text-xl md:text-2xl font-bold text-gradient-gold drop-shadow-lg mb-2" style={{ fontFamily: 'Crimson Text, serif', letterSpacing: '-0.02em', fontWeight: 700 }}>
                        {title}
                    </h3>

                    {/* Descrição */}
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md font-medium opacity-90">
                        {desc}
                    </p>
                </div>
            </div>

            {/* Espaçador para Layout Alternado */}
            <div className="hidden lg:block flex-1"></div>
        </div>
    );
};

/**
 * Componente principal - Sessão interativa da Jornada do Herói com bolas de fogo
 */
const HeroJourneyStories: React.FC = () => {
    const ctaRef = useRef<HTMLDivElement>(null);
    const isCtaVisible = useIntersection(ctaRef);
    const navigate = useNavigate();

    // Get major arcana cards
    const majorArcana = TAROT_CARDS.filter((card) => card.arcana === 'major').sort(
        (a, b) => a.number - b.number
    );

    // Map cards by their position
    const cardMap: { [key: number]: any } = {};
    majorArcana.forEach((card) => {
        cardMap[card.number] = card;
    });

    // Steps da jornada com os textos fornecidos
    const steps = [
        {
            title: 'O Louco',
            desc: 'marca o começo: o impulso de seguir sem certezas.',
            card: cardMap[0],
        },
        {
            title: 'O Mago',
            desc: 'revela o poder de criar a própria realidade.',
            card: cardMap[1],
        },
        {
            title: 'A Sacerdotisa',
            desc: 'convida à escuta interior.',
            card: cardMap[2],
        },
        {
            title: 'A Imperatriz & Imperador',
            desc: 'ensinam a construir e sustentar.',
            card: cardMap[3],
        },
        {
            title: 'Os Enamorados',
            desc: 'pedem escolhas conscientes.',
            card: cardMap[6],
        },
        {
            title: 'O Carro',
            desc: 'move a jornada adiante.',
            card: cardMap[7],
        },
        {
            title: 'Transformação & Retorno',
            desc: 'As provas surgem, as estruturas caem, algo precisa morrer para que o novo nasça.',
            card: cardMap[13],
        },
        {
            title: 'O Despertar',
            desc: 'E quando a consciência se amplia, o herói retorna transformado — inteiro, desperto, renovado.',
            card: cardMap[21],
        },
    ];

    return (
        <section className="relative pt-8 md:pt-12 pb-16 md:pb-24 px-4 md:px-8 overflow-hidden">
            {/* Background igual ao do hero */}
            <div className="absolute inset-0">
                <div className="absolute -top-40 left-0 w-96 h-96 bg-[#875faf]/8 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 right-0 w-96 h-96 bg-[#a77fd4]/8 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-[#875faf]/5 via-transparent to-transparent opacity-50 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Steps Timeline com Bolas de Fogo Alternadas */}
                <div className="relative space-y-3 md:space-y-4">
                    {steps.map((step, index) => (
                        <FireballStep
                            key={index}
                            title={step.title}
                            card={step.card}
                            desc={step.desc}
                            isLast={index === steps.length - 1}
                            align={index % 2 === 0 ? 'left' : 'right'}
                        />
                    ))}
                </div>

                {/* CTA Section - Premium Design */}
                <div
                    ref={ctaRef}
                    className={`mt-16 md:mt-20 text-center transition-all duration-1000 delay-500 ${isCtaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="relative px-8 py-6 md:px-12 md:py-8 rounded-3xl bg-gradient-to-br from-[#1a1230]/90 via-[#12091a]/90 to-[#1a1230]/90 backdrop-blur-xl border border-[#875faf]/30 shadow-2xl overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#875faf]/10 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#a77fd4]/10 rounded-full blur-3xl -z-10"></div>

                            {/* Content */}
                            <div className="relative z-10">
                                <h3 className="text-xl md:text-3xl font-bold text-gradient-gold drop-shadow-lg mb-3" style={{ fontFamily: 'Crimson Text, serif', letterSpacing: '-0.02em' }}>
                                    Descubra Sua Jornada
                                </h3>
                                <p className="text-gray-300 text-sm md:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
                                    <span className="text-white font-semibold">O Tarot não prevê o futuro.</span> Ele revela onde você está na sua jornada agora e ilumina os caminhos à sua frente.
                                </p>

                                <button
                                    onClick={() => {
                                        navigate('/spreads');
                                        window.scrollTo(0, 0);
                                    }}
                                    className="relative px-8 py-3 rounded-xl font-semibold text-white text-sm md:text-base tracking-wide transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #875faf 0%, #a77fd4 50%, #c9a5e8 100%)',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    <span className="relative flex items-center justify-center gap-3">
                                        <span className="text-xl">✨</span>
                                        Tire Sua Carta Agora
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </span>
                                </button>

                                <p className="text-gray-400 text-xs md:text-sm mt-4 opacity-70">
                                    Experiência personalizada • Interpretação completa • Gratuito
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default HeroJourneyStories;
