import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
}

type Phase = 'plans' | 'account' | 'payment';
type Plan = 'free' | 'premium';

// Stripe configuration - will be set when credentials are provided
const STRIPE_CONFIG = {
    publishableKey: '', // Add your Stripe publishable key here
    priceId: '', // Add your Stripe price ID for the premium plan
};

export const Checkout: React.FC = () => {
    const { isPortuguese } = useLanguage();
    const { user, isGuest, signUp } = useAuth();
    const navigate = useNavigate();

    const [phase, setPhase] = useState<Phase>('plans');
    const [selectedPlan, setSelectedPlan] = useState<Plan>('free');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });

    // Scroll to top quando a fase muda
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [phase]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.fullName || !formData.email || !formData.password) {
            setError(isPortuguese ? 'Preencha todos os campos' : 'Fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            setError(isPortuguese ? 'Senha mínimo 6 caracteres' : 'Password minimum 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(isPortuguese ? 'Senhas não conferem' : 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Para FREE: cria a conta imediatamente
            if (selectedPlan === 'free') {
                const { error: signUpError } = await signUp(
                    formData.email,
                    formData.password,
                    formData.fullName
                );

                if (signUpError) {
                    setError(signUpError.message);
                } else {
                    navigate('/');
                }
            } else {
                // Para PREMIUM: apenas valida e vai pra payment (conta será criada DEPOIS do pagamento)
                setPhase('payment');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simula processamento de pagamento
            await new Promise(resolve => setTimeout(resolve, 1500));

            // AGORA cria a conta com status PREMIUM (após pagamento confirmado)
            const { error: signUpError } = await signUp(
                formData.email,
                formData.password,
                formData.fullName,
                'premium' // Tier premium após pagamento
            );

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            // Pagamento bem-sucedido e conta criada
            alert(isPortuguese ? 'Bem-vindo ao Zaya Tarot Premium! Seu acesso foi ativado.' : 'Welcome to Zaya Tarot Premium! Your access has been activated.');
            navigate('/');
        } catch (err: any) {
            setError(isPortuguese ? 'Erro no pagamento' : 'Payment error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0512] text-white flex flex-col">
            {/* Header Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0d0512]/80 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white text-lg font-bold leading-tight tracking-tight"
                    >
                        Zaya Tarot
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Voltar
                    </button>
                </div>
            </header>

            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-[#1a1628] via-[#0d0512] to-[#000000] pointer-events-none" />

            <style>{`
                .text-gradient-gold {
                    background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>

            <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen p-4 py-12 mt-16">
                {/* Premium background with gradient effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 left-0 w-96 h-96 bg-[#875faf]/8 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 right-0 w-96 h-96 bg-[#a77fd4]/8 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-[#875faf]/5 via-transparent to-transparent opacity-50 blur-3xl" />
                </div>

                {/* PLANS PHASE */}
                {phase === 'plans' && (
                    <div className="w-full max-w-6xl space-y-16 relative">
                        {/* Premium Header */}
                        <div className="text-center">
                            <h1
                                className="text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.0] tracking-tight text-gradient-gold mb-4"
                                style={{ fontFamily: "'Crimson Text', serif" }}
                            >
                                {isPortuguese ? 'Escolha o plano ideal' : 'Choose the ideal plan'}
                            </h1>
                            <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-8" style={{ fontFamily: "'Crimson Text', serif" }}>
                                {isPortuguese ? 'Para sua jornada de descobertas e evolução espiritual' : 'For your discovery journey and spiritual evolution'}
                            </p>
                            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#875faf]/10 border border-[#a77fd4]/30">
                                <span className="text-[#a77fd4] text-xs uppercase tracking-widest font-semibold">
                                    {isPortuguese ? 'Planos de Acesso' : 'Access Plans'}
                                </span>
                            </div>
                        </div>

                        {/* Plans Grid - Large Cards with Premium Design */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Free Plan Card */}
                            <button
                                onClick={() => setSelectedPlan('free')}
                                className={`group relative overflow-hidden transition-all duration-500 transform text-left rounded-3xl ${selectedPlan === 'free'
                                    ? 'scale-100 ring-2 ring-[#a77fd4]'
                                    : 'hover:scale-102 ring-2 ring-white/10 hover:ring-[#875faf]'
                                    }`}
                                style={{ minHeight: '420px' }}
                            >
                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1628]/80 via-[#2a1f3d]/60 to-[#0d0512] rounded-3xl" />

                                {/* Decorative glow */}
                                {selectedPlan === 'free' && (
                                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#875faf]/20 rounded-full blur-3xl" />
                                )}

                                {/* Border effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-[#a77fd4]/10 via-transparent to-transparent pointer-events-none rounded-3xl" />

                                {/* Content */}
                                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col rounded-3xl border border-[#a77fd4]/30 bg-gradient-to-br from-[#a77fd4]/5 via-transparent to-transparent">
                                    {/* Price Section */}
                                    <div className="mb-6">
                                        <p className="text-[#a77fd4] text-sm uppercase tracking-widest font-semibold mb-3">
                                            {isPortuguese ? 'Exploração Livre' : 'Free Exploration'}
                                        </p>
                                        <h3 className="text-5xl font-normal text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                                            {isPortuguese ? 'Gratuito' : 'Free'}
                                        </h3>
                                        <div className="text-4xl font-light text-white mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>
                                            R$ 0<span className="text-lg text-gray-400 font-normal">/sempre</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{isPortuguese ? 'Para começar sua prática' : 'To start your practice'}</p>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 space-y-4 mb-10">
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#a77fd4] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">1 {isPortuguese ? 'tirada por dia' : 'reading per day'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Acesso básico às cartas' : 'Basic card access'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#a77fd4] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">7 {isPortuguese ? 'cartas do arquivo' : 'archive cards'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Tarot tradicional' : 'Traditional tarot'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#a77fd4] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">{isPortuguese ? 'Histórico de 3 leituras' : 'History of 3 readings'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Acompanhamento básico' : 'Basic tracking'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 text-sm flex items-start gap-3 opacity-60">
                                            <span className="text-gray-600 font-bold mt-0.5 text-lg">✕</span>
                                            <div>
                                                <p className="font-medium">{isPortuguese ? 'Síntese com IA' : 'AI Synthesis'}</p>
                                                <p className="text-xs text-gray-600">{isPortuguese ? 'Interpretação avançada' : 'Advanced interpretation'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 text-sm flex items-start gap-3 opacity-60">
                                            <span className="text-gray-600 font-bold mt-0.5 text-lg">✕</span>
                                            <div>
                                                <p className="font-medium">{isPortuguese ? 'Análise de padrões' : 'Pattern Analysis'}</p>
                                                <p className="text-xs text-gray-600">{isPortuguese ? 'Insights personalizados' : 'Custom insights'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selection indicator */}
                                    {selectedPlan === 'free' && (
                                        <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#a77fd4]/20 border border-[#a77fd4]/40 text-[#a77fd4] text-xs font-semibold">
                                            ✓ {isPortuguese ? 'Selecionado' : 'Selected'}
                                        </div>
                                    )}
                                </div>
                            </button>

                            {/* Premium Plan Card */}
                            <button
                                onClick={() => setSelectedPlan('premium')}
                                className={`group relative overflow-hidden transition-all duration-500 transform text-left rounded-3xl ${selectedPlan === 'premium'
                                    ? 'scale-100 ring-2 ring-[#ffe066]'
                                    : 'hover:scale-102 ring-2 ring-white/10 hover:ring-[#ffe066]'
                                    }`}
                                style={{ minHeight: '420px' }}
                            >
                                {/* Premium Badge */}
                                <div className="absolute top-0 right-0 z-20">
                                    <div className="bg-gradient-to-r from-[#ffe066] to-[#ffd700] text-black px-6 py-2 rounded-bl-3xl font-semibold text-xs uppercase tracking-widest">
                                        ⭐ {isPortuguese ? 'Recomendado' : 'Recommended'}
                                    </div>
                                </div>

                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2a1f3d]/80 via-[#1a1628]/60 to-[#0d0512] rounded-3xl" />

                                {/* Decorative glow */}
                                {selectedPlan === 'premium' && (
                                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#ffe066]/10 rounded-full blur-3xl" />
                                )}

                                {/* Border effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-[#ffe066]/10 via-transparent to-transparent pointer-events-none rounded-3xl" />

                                {/* Content */}
                                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col rounded-3xl border border-[#ffe066]/30 bg-gradient-to-br from-[#ffe066]/5 via-transparent to-transparent">
                                    {/* Price Section */}
                                    <div className="mb-6">
                                        <p className="text-[#ffe066] text-sm uppercase tracking-widest font-semibold mb-3">
                                            {isPortuguese ? 'Arquivo Arcano' : 'Arcane Archive'}
                                        </p>
                                        <h3 className="text-5xl font-normal text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                                            {isPortuguese ? 'Premium' : 'Premium'}
                                        </h3>
                                        <div className="text-4xl font-light text-white mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>
                                            R$ 19<span className="text-lg text-gray-400 font-normal">,90/mês</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{isPortuguese ? 'Para praticantes dedicados' : 'For dedicated practitioners'}</p>
                                        <div className="mt-4 pt-4 border-t border-[#ffe066]/20 flex items-center gap-2">
                                            <span className="text-green-400 font-bold">✓</span>
                                            <p className="text-green-400 text-xs font-medium">{isPortuguese ? '7 dias de garantia. Cancele quando quiser.' : '7-day guarantee. Cancel anytime.'}</p>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 space-y-4 mb-10">
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#ffe066] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">{isPortuguese ? 'Tiragens ilimitadas' : 'Unlimited readings'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Quantas vezes quiser' : 'As many times as you want'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#ffe066] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">78 {isPortuguese ? 'cartas completas' : 'complete cards'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Tarot Rider-Waite completo' : 'Full Rider-Waite tarot'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#ffe066] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">{isPortuguese ? 'Síntese com IA' : 'AI Synthesis'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Interpretação avançada e personalizada' : 'Advanced custom interpretation'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#ffe066] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">{isPortuguese ? 'Histórico completo' : 'Full history'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Todas as suas leituras salvas' : 'All your readings saved'}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm flex items-start gap-3">
                                            <span className="text-[#ffe066] font-bold mt-0.5 text-lg">✓</span>
                                            <div>
                                                <p className="font-medium">{isPortuguese ? 'Análise de padrões' : 'Pattern Analysis'}</p>
                                                <p className="text-xs text-gray-500">{isPortuguese ? 'Descubra tendências na sua jornada' : 'Discover trends in your journey'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selection indicator */}
                                    {selectedPlan === 'premium' && (
                                        <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#ffe066]/20 border border-[#ffe066]/40 text-[#ffe066] text-xs font-semibold">
                                            ✓ {isPortuguese ? 'Selecionado' : 'Selected'}
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Continue Button */}
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={() => setPhase('account')}
                                className={`px-12 py-4 rounded-lg font-semibold transition-all text-base uppercase tracking-widest ${selectedPlan === 'premium'
                                    ? 'bg-gradient-to-r from-[#ffe066] to-[#ffd700] text-black hover:shadow-lg hover:shadow-[#ffe066]/40'
                                    : 'bg-gradient-to-r from-[#875faf] to-[#a77fd4] text-white hover:shadow-lg hover:shadow-[#875faf]/40'
                                    }`}
                                style={{ fontFamily: "'Crimson Text', serif" }}
                            >
                                {isPortuguese ? 'Continuar' : 'Continue'}
                            </button>
                        </div>

                        {/* Security & Trust Badges */}
                        <div className="flex justify-center pt-8">
                            <div className="flex flex-col items-center gap-6 max-w-3xl">
                                {/* Main Security Badges */}
                                <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
                                    <div className="flex flex-col items-center gap-1.5 group">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 transition-colors">
                                            <span className="text-2xl">🔒</span>
                                        </div>
                                        <span className="text-gray-400 text-xs text-center">{isPortuguese ? 'Pagamento 100% Seguro' : '100% Secure Payment'}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 group">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 group-hover:bg-blue-500/20 transition-colors">
                                            <span className="text-2xl">🛡️</span>
                                        </div>
                                        <span className="text-gray-400 text-xs text-center">SSL 256-bit</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 group">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 group-hover:bg-purple-500/20 transition-colors">
                                            <span className="text-2xl">✓</span>
                                        </div>
                                        <span className="text-gray-400 text-xs text-center">PCI DSS</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 group">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 group-hover:bg-yellow-500/20 transition-colors">
                                            <span className="text-2xl">⭐</span>
                                        </div>
                                        <span className="text-gray-400 text-xs text-center">{isPortuguese ? 'Garantia 7 dias' : '7-day Guarantee'}</span>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/10 w-full">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">{isPortuguese ? 'Formas de Pagamento' : 'Payment Methods'}</span>
                                    <div className="flex items-center gap-3 flex-wrap justify-center">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-[8px] text-white flex items-center justify-center font-bold">VISA</div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                                                <div className="w-3 h-3 bg-red-600 rounded-full opacity-80"></div>
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full -ml-1 opacity-80"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="w-8 h-5 bg-gradient-to-r from-green-400 to-teal-500 rounded text-[8px] text-white flex items-center justify-center font-bold">PIX</div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="w-8 h-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded text-[7px] text-white flex items-center justify-center font-bold">stripe</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Message */}
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
                                    <span>{isPortuguese ? 'Seus dados estão protegidos com criptografia de ponta a ponta' : 'Your data is protected with end-to-end encryption'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Cancel Button */}
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={() => navigate('/')}
                                className="py-2 px-6 text-gray-400 hover:text-gray-300 transition-colors text-sm border border-gray-700 rounded-xl hover:border-gray-500"
                            >
                                {isPortuguese ? 'Cancelar' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )}

                {/* OTHER PHASES - centered container */}
                {phase !== 'plans' && (
                    <div className="w-full max-w-2xl relative">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* ACCOUNT PHASE */}
                            {phase === 'account' && (
                                <form onSubmit={handleCreateAccount} className="space-y-6">
                                    {/* Progress bar */}
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#875faf]/30 border border-[#875faf]/60 text-[#a77fd4] text-sm font-bold">1</div>
                                            <span className="text-xs text-gray-400 uppercase">{isPortuguese ? 'Plano' : 'Plan'}</span>
                                        </div>
                                        <div className="flex-1 mx-4 h-px bg-gradient-to-r from-[#875faf]/60 to-transparent"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#875faf] border border-[#a77fd4] text-black text-sm font-bold">2</div>
                                            <span className="text-xs text-white uppercase">{isPortuguese ? 'Conta' : 'Account'}</span>
                                        </div>
                                        {selectedPlan === 'premium' && (
                                            <>
                                                <div className="flex-1 mx-4 h-px bg-gradient-to-r from-[#875faf]/40 to-transparent"></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 text-gray-400 text-sm font-bold">3</div>
                                                    <span className="text-xs text-gray-400 uppercase">{isPortuguese ? 'Pagamento' : 'Payment'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-[#875faf]/10 border border-[#875faf]/30 rounded-lg">
                                        <span className="text-lg">🔒</span>
                                        <p className="text-xs text-gray-300">{isPortuguese ? 'Seus dados estão seguros e criptografados' : 'Your data is safe and encrypted'}</p>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">{isPortuguese ? 'Criar sua conta' : 'Create your account'}</h2>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Nome' : 'Name'}</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-300 block mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Senha' : 'Password'}</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{isPortuguese ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Confirmar senha' : 'Confirm password'}</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                            required
                                        />
                                    </div>

                                    {selectedPlan === 'premium' && (
                                        <div>
                                            <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Telefone' : 'Phone'}</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setPhase('plans')}
                                            className="flex-1 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                                        >
                                            {isPortuguese ? 'Voltar' : 'Back'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`flex-1 py-2 rounded-lg font-bold transition-all disabled:opacity-50 ${selectedPlan === 'premium'
                                                ? 'bg-[#ffe066] text-black hover:shadow-lg hover:shadow-[#ffe066]/20'
                                                : 'bg-[#875faf] text-white hover:bg-[#9670bf]'
                                                }`}
                                        >
                                            {loading ? '...' : (selectedPlan === 'premium' ? (isPortuguese ? 'Próximo' : 'Next') : (isPortuguese ? 'Criar conta' : 'Create account'))}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* PAYMENT PHASE */}
                            {phase === 'payment' && (
                                <form onSubmit={handlePayment} className="space-y-6">
                                    {/* Progress bar */}
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-3 opacity-60">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/30 border border-green-500/60 text-green-400 text-sm font-bold">✓</div>
                                            <span className="text-xs text-gray-400 uppercase">{isPortuguese ? 'Plano' : 'Plan'}</span>
                                        </div>
                                        <div className="flex-1 mx-4 h-px bg-gradient-to-r from-green-500/60 to-green-500/30"></div>
                                        <div className="flex items-center gap-3 opacity-60">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/30 border border-green-500/60 text-green-400 text-sm font-bold">✓</div>
                                            <span className="text-xs text-gray-400 uppercase">{isPortuguese ? 'Conta' : 'Account'}</span>
                                        </div>
                                        <div className="flex-1 mx-4 h-px bg-gradient-to-r from-green-500/30 to-[#ffe066]/60"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffe066] border border-[#ffd700] text-black text-sm font-bold">3</div>
                                            <span className="text-xs text-white uppercase">{isPortuguese ? 'Pagamento' : 'Payment'}</span>
                                        </div>
                                    </div>

                                    {/* Security Header Banner */}
                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 via-green-500/5 to-emerald-500/10 border border-green-500/30 p-5">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40">
                                                    <span className="text-2xl">🔐</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-green-400 font-semibold text-sm">{isPortuguese ? 'Ambiente Seguro' : 'Secure Environment'}</h3>
                                                    <p className="text-gray-400 text-xs">{isPortuguese ? 'Transação protegida por criptografia SSL 256-bit' : 'Transaction protected by 256-bit SSL encryption'}</p>
                                                </div>
                                            </div>
                                            <div className="hidden md:flex items-center gap-3">
                                                <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-green-500/20">
                                                    <span className="material-symbols-outlined text-green-400 text-sm">verified</span>
                                                    <span className="text-xs text-green-400">PCI DSS</span>
                                                </div>
                                                <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-green-500/20">
                                                    <span className="material-symbols-outlined text-green-400 text-sm">lock</span>
                                                    <span className="text-xs text-green-400">3D Secure</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary - More Clear */}
                                    <div className="bg-gradient-to-br from-[#ffe066]/10 to-[#ffd700]/5 border border-[#ffe066]/30 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#ffe066]/20">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#ffe066]/20">
                                                <span className="text-xl">✨</span>
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">{isPortuguese ? 'Zaya Tarot Premium' : 'Zaya Tarot Premium'}</h3>
                                                <p className="text-gray-400 text-xs">{isPortuguese ? 'Acesso completo a todas as funcionalidades' : 'Full access to all features'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs">calendar_month</span>
                                                    {isPortuguese ? 'Cobrança' : 'Billing'}
                                                </span>
                                                <span className="text-white font-medium">{isPortuguese ? 'Mensal' : 'Monthly'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs">autorenew</span>
                                                    {isPortuguese ? 'Renovação' : 'Renewal'}
                                                </span>
                                                <span className="text-white font-medium">{isPortuguese ? 'Automática' : 'Automatic'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs">cancel</span>
                                                    {isPortuguese ? 'Cancelamento' : 'Cancellation'}
                                                </span>
                                                <span className="text-green-400 font-medium">{isPortuguese ? 'A qualquer momento' : 'Anytime'}</span>
                                            </div>
                                            <div className="border-t border-[#ffe066]/20 pt-4 mt-4">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="text-gray-400 text-xs block">{isPortuguese ? 'Total hoje' : 'Total today'}</span>
                                                        <span className="text-white font-bold text-2xl">R$ 19,90</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                                                            <span className="material-symbols-outlined text-xs">verified</span>
                                                            {isPortuguese ? '7 dias de garantia' : '7-day guarantee'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">payment</span>
                                            {isPortuguese ? 'Método de Pagamento' : 'Payment Method'}
                                        </h2>

                                        {/* Stripe Checkout Button - Primary */}
                                        <div className="relative">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-4 bg-gradient-to-r from-[#ffe066] to-[#ffd700] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#ffe066]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-base"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                                        {isPortuguese ? 'Processando...' : 'Processing...'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined">lock</span>
                                                        {isPortuguese ? 'Pagar com Segurança' : 'Pay Securely'}
                                                        <span className="text-black/60">R$ 19,90</span>
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-center text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
                                                <span className="material-symbols-outlined text-xs">info</span>
                                                {isPortuguese ? 'Você será redirecionado para o checkout seguro do Stripe' : 'You will be redirected to Stripe secure checkout'}
                                            </p>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="flex-1 h-px bg-white/10"></div>
                                            <span className="text-gray-500 text-xs uppercase">{isPortuguese ? 'ou pague com' : 'or pay with'}</span>
                                            <div className="flex-1 h-px bg-white/10"></div>
                                        </div>

                                        {/* Alternative Payment Methods */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                                            >
                                                <div className="w-6 h-4 bg-gradient-to-r from-green-400 to-teal-500 rounded text-[7px] text-white flex items-center justify-center font-bold">PIX</div>
                                                <span className="text-gray-300 text-sm group-hover:text-white transition-colors">PIX</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                                            >
                                                <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors text-lg">credit_card</span>
                                                <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{isPortuguese ? 'Débito' : 'Debit'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Security Features - More Visual */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-400 text-sm">shield</span>
                                            {isPortuguese ? 'Sua Proteção' : 'Your Protection'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-green-400 text-sm">verified_user</span>
                                                </div>
                                                <div>
                                                    <p className="text-white text-xs font-medium">3D Secure</p>
                                                    <p className="text-gray-500 text-xs">{isPortuguese ? 'Autenticação bancária' : 'Bank authentication'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-blue-400 text-sm">https</span>
                                                </div>
                                                <div>
                                                    <p className="text-white text-xs font-medium">SSL 256-bit</p>
                                                    <p className="text-gray-500 text-xs">{isPortuguese ? 'Criptografia total' : 'Full encryption'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-purple-400 text-sm">security</span>
                                                </div>
                                                <div>
                                                    <p className="text-white text-xs font-medium">PCI DSS</p>
                                                    <p className="text-gray-500 text-xs">{isPortuguese ? 'Nível 1' : 'Level 1'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-yellow-400 text-sm">workspace_premium</span>
                                                </div>
                                                <div>
                                                    <p className="text-white text-xs font-medium">{isPortuguese ? 'Garantia' : 'Guarantee'}</p>
                                                    <p className="text-gray-500 text-xs">{isPortuguese ? '7 dias' : '7 days'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Button */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setPhase('account')}
                                            className="flex-1 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                                            {isPortuguese ? 'Voltar' : 'Back'}
                                        </button>
                                    </div>

                                    {/* Trust Footer */}
                                    <div className="text-center pt-4 border-t border-white/5">
                                        <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-xs">lock</span>
                                            {isPortuguese
                                                ? 'Pagamento processado de forma segura pelo Stripe. Seus dados de cartão nunca são armazenados em nossos servidores.'
                                                : 'Payment processed securely by Stripe. Your card details are never stored on our servers.'}
                                        </p>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Cancel Button */}
                        <div className="flex justify-center mt-8 pt-4">
                            <button
                                onClick={() => navigate('/')}
                                className="py-2 px-6 text-gray-400 hover:text-gray-300 transition-colors text-sm border border-gray-700 rounded-xl hover:border-gray-500"
                            >
                                {isPortuguese ? 'Cancelar' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#0d0512]/50 py-8 text-gray-500 mt-auto">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-white font-bold text-sm mb-2">Zaya Tarot</h3>
                            <p className="text-xs text-gray-500">{isPortuguese ? 'Sua jornada de descoberta espiritual' : 'Your spiritual discovery journey'}</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">{isPortuguese ? 'Legal' : 'Legal'}</h4>
                            <ul className="space-y-2">
                                <li><button className="text-xs hover:text-white transition-colors">{isPortuguese ? 'Termos de Serviço' : 'Terms of Service'}</button></li>
                                <li><button className="text-xs hover:text-white transition-colors">{isPortuguese ? 'Privacidade' : 'Privacy Policy'}</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">{isPortuguese ? 'Suporte' : 'Support'}</h4>
                            <p className="text-xs">support@mysticatarot.com</p>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-600">
                        <p>© 2026 Zaya Tarot. {isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Checkout;
