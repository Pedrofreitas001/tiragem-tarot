import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const COOKIE_CONSENT_KEY = 'zaya_cookie_consent';

interface CookiePreferences {
    essential: boolean; // Sempre true
    functional: boolean;
    analytics: boolean;
    acceptedAt: string;
}

export const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const { isPortuguese } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar se já existe consentimento
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Pequeno delay para não aparecer instantaneamente
            const timer = setTimeout(() => setShowBanner(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (preferences: CookiePreferences) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
        setShowBanner(false);
    };

    const acceptAll = () => {
        saveConsent({
            essential: true,
            functional: true,
            analytics: true,
            acceptedAt: new Date().toISOString()
        });
    };

    const acceptEssential = () => {
        saveConsent({
            essential: true,
            functional: false,
            analytics: false,
            acceptedAt: new Date().toISOString()
        });
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-[#1e1a2e] border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                {/* Barra superior decorativa */}
                <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

                <div className="p-4 md:p-6">
                    {/* Conteúdo principal */}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Ícone */}
                        <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-purple-500/20 items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400 text-2xl">cookie</span>
                        </div>

                        {/* Texto */}
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
                                <span className="md:hidden material-symbols-outlined text-purple-400">cookie</span>
                                {isPortuguese ? 'Utilizamos Cookies' : 'We Use Cookies'}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {isPortuguese
                                    ? 'Usamos cookies para melhorar sua experiência, manter você conectado e entender como você usa nossa plataforma. Ao continuar navegando, você concorda com nossa '
                                    : 'We use cookies to improve your experience, keep you logged in, and understand how you use our platform. By continuing to browse, you agree to our '}
                                <button
                                    onClick={() => navigate(isPortuguese ? '/privacidade' : '/privacy')}
                                    className="text-purple-400 hover:text-purple-300 underline"
                                >
                                    {isPortuguese ? 'Política de Privacidade' : 'Privacy Policy'}
                                </button>
                                .
                            </p>

                            {/* Detalhes expandíveis */}
                            {showDetails && (
                                <div className="mt-4 space-y-3 animate-fade-in">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {isPortuguese ? 'Cookies Essenciais' : 'Essential Cookies'}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {isPortuguese
                                                    ? 'Necessários para o funcionamento do site'
                                                    : 'Required for the site to function'}
                                            </p>
                                        </div>
                                        <span className="text-green-400 text-xs font-medium px-2 py-1 bg-green-500/20 rounded">
                                            {isPortuguese ? 'Sempre ativo' : 'Always active'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {isPortuguese ? 'Cookies de Funcionalidade' : 'Functional Cookies'}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {isPortuguese
                                                    ? 'Lembram suas preferências e configurações'
                                                    : 'Remember your preferences and settings'}
                                            </p>
                                        </div>
                                        <span className="text-purple-400 text-xs">
                                            {isPortuguese ? 'Opcional' : 'Optional'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {isPortuguese ? 'Cookies de Análise' : 'Analytics Cookies'}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {isPortuguese
                                                    ? 'Nos ajudam a melhorar a plataforma'
                                                    : 'Help us improve the platform'}
                                            </p>
                                        </div>
                                        <span className="text-purple-400 text-xs">
                                            {isPortuguese ? 'Opcional' : 'Optional'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="order-3 sm:order-1 px-4 py-2.5 text-gray-400 text-sm hover:text-white transition-colors"
                        >
                            {showDetails
                                ? (isPortuguese ? 'Menos detalhes' : 'Less details')
                                : (isPortuguese ? 'Mais detalhes' : 'More details')}
                        </button>

                        <div className="flex gap-3 sm:ml-auto order-1 sm:order-2">
                            <button
                                onClick={acceptEssential}
                                className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-600 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
                            >
                                {isPortuguese ? 'Apenas essenciais' : 'Essential only'}
                            </button>
                            <button
                                onClick={acceptAll}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                {isPortuguese ? 'Aceitar todos' : 'Accept all'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

// Hook para verificar preferências de cookies
export const useCookieConsent = () => {
    const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (consent) {
            try {
                setPreferences(JSON.parse(consent));
            } catch {
                setPreferences(null);
            }
        }
    }, []);

    return {
        hasConsent: !!preferences,
        preferences,
        canUseAnalytics: preferences?.analytics ?? false,
        canUseFunctional: preferences?.functional ?? false,
        resetConsent: () => {
            localStorage.removeItem(COOKIE_CONSENT_KEY);
            window.location.reload();
        }
    };
};

export default CookieConsent;
