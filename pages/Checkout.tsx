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
            alert(isPortuguese ? 'Bem-vindo ao Mystic Tarot Premium! Seu acesso foi ativado.' : 'Welcome to Mystic Tarot Premium! Your access has been activated.');
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
                        Mystic Tarot
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

                        {/* Security Badges */}
                        <div className="flex justify-center pt-8">
                            <div className="flex flex-col items-center gap-4 max-w-2xl">
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <span className="text-lg">🔒</span>
                                        <span>{isPortuguese ? 'Pagamento seguro' : 'Secure payment'}</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-600"></div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <span className="text-lg">🛡️</span>
                                        <span>SSL {isPortuguese ? 'Criptografado' : 'Encrypted'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap justify-center">
                                    <span className="text-gray-500 text-xs">{isPortuguese ? 'Aceitamos:' : 'We accept:'}</span>
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 border border-gray-600 rounded text-xs text-gray-400">Visa</div>
                                        <div className="px-2 py-1 border border-gray-600 rounded text-xs text-gray-400">Mastercard</div>
                                        <div className="px-2 py-1 border border-gray-600 rounded text-xs text-gray-400">PIX</div>
                                    </div>
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
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffe066]/30 border border-[#ffe066]/60 text-[#ffe066] text-sm font-bold">✓</div>
                                            <span className="text-xs text-gray-400 uppercase">{isPortuguese ? 'Plano' : 'Plan'}</span>
                                        </div>
                                        <div className="flex-1 mx-4 h-px bg-gradient-to-r from-[#ffe066]/60 to-transparent"></div>
                                        <div className="flex items-center gap-3 opacity-60">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffe066]/30 border border-[#ffe066]/60 text-[#ffe066] text-sm font-bold">✓</div>
                                            <span className="text-xs text-gray-400 uppercase">{isPortuguese ? 'Conta' : 'Account'}</span>
                                        </div>
                                        <div className="flex-1 mx-4 h-px bg-gradient-to-r from-[#ffe066]/60 to-transparent"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffe066] border border-[#ffd700] text-black text-sm font-bold">3</div>
                                            <span className="text-xs text-white uppercase">{isPortuguese ? 'Pagamento' : 'Payment'}</span>
                                        </div>
                                    </div>

                                    {/* Security Banner */}
                                    <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg">
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-2xl mb-2">🔒</span>
                                            <p className="text-xs text-green-400 font-medium">{isPortuguese ? 'Criptografado' : 'Encrypted'}</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center border-l border-r border-green-500/20">
                                            <span className="text-2xl mb-2">🛡️</span>
                                            <p className="text-xs text-green-400 font-medium">{isPortuguese ? 'PCI DSS' : 'PCI DSS'}</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-2xl mb-2">✓</span>
                                            <p className="text-xs text-green-400 font-medium">{isPortuguese ? 'Verificado' : 'Verified'}</p>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-gradient-to-br from-[#ffe066]/10 to-[#ffd700]/5 border border-[#ffe066]/30 rounded-lg p-6">
                                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                            <span className="text-lg">📋</span>
                                            {isPortuguese ? 'Resumo da Assinatura' : 'Subscription Summary'}
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">{isPortuguese ? 'Plano' : 'Plan'}</span>
                                                <span className="text-white font-medium">{isPortuguese ? 'Premium Arcano' : 'Premium Arcane'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">{isPortuguese ? 'Frequência' : 'Frequency'}</span>
                                                <span className="text-white font-medium">{isPortuguese ? 'Mensal' : 'Monthly'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">{isPortuguese ? 'Renovação' : 'Renewal'}</span>
                                                <span className="text-white font-medium">{isPortuguese ? 'Automática' : 'Automatic'}</span>
                                            </div>
                                            <div className="border-t border-[#ffe066]/20 pt-3 flex justify-between">
                                                <span className="text-white font-bold">{isPortuguese ? 'Primeiro Mês' : 'First Month'}</span>
                                                <span className="text-[#ffe066] font-bold text-lg">R$ 19,90</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">{isPortuguese ? 'Informações de Pagamento' : 'Payment Information'}</h2>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                                        <div className="flex justify-between mb-2 text-sm">
                                            <span className="text-gray-300">Premium Mensal</span>
                                            <span className="font-bold">R$ 19,90</span>
                                        </div>
                                        <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                                            <span>{isPortuguese ? 'Total' : 'Total'}</span>
                                            <span>R$ 19,90</span>
                                        </div>
                                    </div>

                                    {/* Card Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <span className="text-lg">💳</span>
                                            {isPortuguese ? 'Cartão de Crédito' : 'Credit Card'}
                                        </h3>

                                        <div className="relative">
                                            <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Número do cartão' : 'Card number'}</label>
                                            <input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#ffe066] outline-none transition-colors placeholder:text-gray-600"
                                                maxLength={19}
                                            />
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <span>🔒</span>
                                                {isPortuguese ? 'Dados do cartão não são armazenados' : 'Card data is not stored'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Vencimento' : 'Expiry'}</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#ffe066] outline-none transition-colors placeholder:text-gray-600"
                                                    maxLength={5}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-300 block mb-2">
                                                    CVV
                                                    <span className="text-gray-500 text-xs ml-1 cursor-help" title={isPortuguese ? '3 dígitos no verso do cartão' : '3 digits on the back of the card'}>?</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="000"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#ffe066] outline-none transition-colors placeholder:text-gray-600"
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <span className="text-lg">📱</span>
                                            {isPortuguese ? 'Outros Métodos' : 'Other Methods'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" className="py-2 px-3 border border-gray-600 rounded-lg text-xs hover:bg-white/5 transition-colors">Débito</button>
                                            <button type="button" className="py-2 px-3 border border-gray-600 rounded-lg text-xs hover:bg-white/5 transition-colors">PIX</button>
                                        </div>
                                    </div>

                                    {/* Safety Info */}
                                    <div className="border-t border-white/10 pt-6 space-y-2">
                                        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{isPortuguese ? 'Sua Segurança' : 'Your Security'}:</h3>
                                        <ul className="space-y-2 text-xs text-gray-400">
                                            <li className="flex items-start gap-2">
                                                <span className="text-green-400 mt-0.5">✓</span>
                                                <span>{isPortuguese ? 'Verificação de segurança 3D Secure' : '3D Secure verification'}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-green-400 mt-0.5">✓</span>
                                                <span>{isPortuguese ? 'Certificado SSL 256-bit' : '256-bit SSL certificate'}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-green-400 mt-0.5">✓</span>
                                                <span>{isPortuguese ? 'Conformidade com PCI DSS nível 1' : 'PCI DSS Level 1 compliance'}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-green-400 mt-0.5">✓</span>
                                                <span>{isPortuguese ? 'Seu cartão não é armazenado' : 'Your card is not stored'}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setPhase('account')}
                                            className="flex-1 py-3 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors font-medium"
                                        >
                                            {isPortuguese ? 'Voltar' : 'Back'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 bg-gradient-to-r from-[#ffe066] to-[#ffd700] text-black rounded-lg font-bold hover:shadow-lg hover:shadow-[#ffe066]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="animate-spin">⏳</span>
                                                    {isPortuguese ? 'Processando...' : 'Processing...'}
                                                </>
                                            ) : (
                                                <>
                                                    <span>🔒</span>
                                                    {isPortuguese ? 'Pagar com Segurança' : 'Pay Securely'}
                                                </>
                                            )}
                                        </button>
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
                            <h3 className="text-white font-bold text-sm mb-2">Mystic Tarot</h3>
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
                        <p>© 2026 Mystic Tarot. {isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Checkout;
