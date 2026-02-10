import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const CheckoutSuccess: React.FC = () => {
    const { isPortuguese } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);

    // Auto-redirect after countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1628] via-[#0d0512] to-[#000000] text-white flex flex-col">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-green-500/15 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div className="max-w-lg w-full text-center space-y-8">
                    {/* Success Icon */}
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                        <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full border-2 border-green-500/50">
                            <span className="material-symbols-outlined text-green-400 text-5xl">check_circle</span>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-light" style={{
                            fontFamily: "'Crimson Text', serif",
                            background: 'linear-gradient(180deg, #ffffff 0%, #e8d4f0 50%, #c9a8d4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            {isPortuguese ? 'Pagamento Confirmado!' : 'Payment Confirmed!'}
                        </h1>

                        <p className="text-gray-400 text-lg" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {isPortuguese
                                ? 'Bem-vindo ao Zaya Tarot Premium! Sua jornada espiritual completa começa agora.'
                                : 'Welcome to Zaya Tarot Premium! Your complete spiritual journey begins now.'}
                        </p>
                    </div>

                    {/* Premium Features Unlocked */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">workspace_premium</span>
                            {isPortuguese ? 'Recursos Desbloqueados' : 'Features Unlocked'}
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-400 text-base">check</span>
                                <span className="text-gray-300">{isPortuguese ? 'Tiragens ilimitadas' : 'Unlimited readings'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-400 text-base">check</span>
                                <span className="text-gray-300">{isPortuguese ? '78 cartas' : '78 cards'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-400 text-base">check</span>
                                <span className="text-gray-300">{isPortuguese ? 'Síntese IA' : 'AI Synthesis'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-400 text-base">check</span>
                                <span className="text-gray-300">{isPortuguese ? 'Histórico completo' : 'Full history'}</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">auto_awesome</span>
                            {isPortuguese ? 'Começar a Explorar' : 'Start Exploring'}
                        </button>

                        <p className="text-gray-500 text-sm">
                            {isPortuguese
                                ? `Redirecionando em ${countdown} segundos...`
                                : `Redirecting in ${countdown} seconds...`}
                        </p>
                    </div>

                    {/* Email Confirmation Note */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                        <span className="material-symbols-outlined text-xs">mail</span>
                        <span>
                            {isPortuguese
                                ? 'Um email de confirmação foi enviado para você'
                                : 'A confirmation email has been sent to you'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;
