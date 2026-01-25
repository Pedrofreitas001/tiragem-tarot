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
            const { error: signUpError } = await signUp(
                formData.email,
                formData.password,
                formData.fullName
            );

            if (signUpError) {
                setError(signUpError.message);
            } else {
                if (selectedPlan === 'premium') {
                    setPhase('payment');
                } else {
                    navigate('/');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert(isPortuguese ? 'Pagamento realizado!' : 'Payment completed!');
            navigate('/');
        } catch (err: any) {
            setError(isPortuguese ? 'Erro no pagamento' : 'Payment error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0512] text-white flex flex-col">
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

            <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen p-4 py-12">
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
                            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#875faf]/10 border border-[#a77fd4]/30">
                                <span className="text-[#a77fd4] text-xs uppercase tracking-widest font-semibold">
                                    {isPortuguese ? 'Planos de Acesso' : 'Access Plans'}
                                </span>
                            </div>

                            <h1
                                className="text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.0] tracking-tight text-gradient-gold mb-4"
                                style={{ fontFamily: "'Crimson Text', serif" }}
                            >
                                {isPortuguese ? 'Escolha o plano ideal' : 'Choose the ideal plan'}
                            </h1>
                            <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-8" style={{ fontFamily: "'Crimson Text', serif" }}>
                                {isPortuguese ? 'Para sua jornada de descobertas e evolução espiritual' : 'For your discovery journey and spiritual evolution'}
                            </p>
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

                        {/* Cancel Button */}
                        <div className="flex justify-center pt-4">
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
                                <form onSubmit={handleCreateAccount} className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">{isPortuguese ? 'Criar conta' : 'Create account'}</h2>
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
                                <form onSubmit={handlePayment} className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">{isPortuguese ? 'Pagamento' : 'Payment'}</h2>
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

                                    <div>
                                        <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Número do cartão' : 'Card number'}</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                            maxLength={19}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-300 block mb-2">{isPortuguese ? 'Vencimento' : 'Expiry'}</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                                maxLength={5}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-300 block mb-2">CVV</label>
                                            <input
                                                type="text"
                                                placeholder="000"
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setPhase('account')}
                                            className="flex-1 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                                        >
                                            {isPortuguese ? 'Voltar' : 'Back'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-2 bg-[#ffe066] text-black rounded-lg font-bold hover:shadow-lg hover:shadow-[#ffe066]/20 transition-all disabled:opacity-50"
                                        >
                                            {loading ? '...' : (isPortuguese ? 'Pagar' : 'Pay')}
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
        </div>
    );
};

export default Checkout;
