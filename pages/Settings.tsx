import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { WhatsappSubscription, Subscription } from '../types/database';
import WhatsAppModal from '../components/WhatsAppModal';
import { MinimalStarsBackground } from '../components/MinimalStarsBackground';

type TabType = 'account' | 'subscription' | 'whatsapp';

export const Settings: React.FC = () => {
    const { isPortuguese } = useLanguage();
    const { user, profile, tier, signOut } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>('account');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [whatsappSub, setWhatsappSub] = useState<WhatsappSubscription | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

    const [formData, setFormData] = useState({
        fullName: profile?.full_name || '',
        email: profile?.email || '',
    });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        loadData();
    }, [user, navigate]);

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.full_name || '',
                email: profile.email || '',
            });
        }
    }, [profile]);

    const loadData = async () => {
        if (!user || !supabase) return;

        try {
            // Carregar assinatura do WhatsApp
            const { data: whatsappData } = await supabase
                .from('whatsapp_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (whatsappData) setWhatsappSub(whatsappData);

            // Carregar assinatura de pagamento
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();

            if (subData) setSubscription(subData);
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!user || !supabase) return;

        setLoading(true);

        try {
            const { error: updateError } = await (supabase as any)
                .from('profiles')
                .update({
                    full_name: formData.fullName,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || (isPortuguese ? 'Erro ao atualizar perfil' : 'Error updating profile'));
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const t = {
        title: isPortuguese ? 'Configurações' : 'Settings',
        subtitle: isPortuguese ? 'Gerencie sua conta e preferências' : 'Manage your account and preferences',

        // Menu
        account: isPortuguese ? 'Conta' : 'Account',
        subscription: isPortuguese ? 'Assinatura' : 'Subscription',
        whatsapp: isPortuguese ? 'WhatsApp' : 'WhatsApp',

        // Account
        personalInfo: isPortuguese ? 'Informações Pessoais' : 'Personal Information',
        fullName: isPortuguese ? 'Nome Completo' : 'Full Name',
        email: isPortuguese ? 'Email' : 'Email',
        save: isPortuguese ? 'Salvar Alterações' : 'Save Changes',
        saving: isPortuguese ? 'Salvando...' : 'Saving...',

        // Subscription
        freePlan: isPortuguese ? 'Gratuito' : 'Free',
        premiumPlan: isPortuguese ? 'Premium' : 'Premium',
        upgradeNow: isPortuguese ? 'Fazer Upgrade' : 'Upgrade Now',
        since: isPortuguese ? 'Membro desde' : 'Member since',
        expiresAt: isPortuguese ? 'Renova em' : 'Renews on',

        // WhatsApp
        whatsappTitle: isPortuguese ? 'Carta do Dia no WhatsApp' : 'Daily Card on WhatsApp',
        whatsappDesc: isPortuguese ? 'Receba sua carta diária diretamente no WhatsApp' : 'Receive your daily card directly on WhatsApp',
        status: isPortuguese ? 'Status' : 'Status',
        whatsappActive: isPortuguese ? 'Ativa' : 'Active',
        whatsappInactive: isPortuguese ? 'Inativa' : 'Inactive',
        whatsappNumber: isPortuguese ? 'Número cadastrado' : 'Registered number',
        configureWhatsapp: isPortuguese ? 'Configurar' : 'Configure',
        manage: isPortuguese ? 'Gerenciar' : 'Manage',
        activateNow: isPortuguese ? 'Ativar Agora' : 'Activate Now',
        premiumRequired: isPortuguese ? 'Recurso Premium' : 'Premium Feature',

        // Actions
        signOut: isPortuguese ? 'Sair da Conta' : 'Sign Out',
        backHome: isPortuguese ? 'Voltar' : 'Back',

        // Messages
        successMessage: isPortuguese ? 'Alterações salvas com sucesso!' : 'Changes saved successfully!',
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isPortuguese ? 'pt-BR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-[#0d0512] text-white">
            <MinimalStarsBackground />

            <style>{`
        .text-gradient-gold {
          background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0d0512]/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 lg:py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white text-lg font-bold leading-tight tracking-tight hover:text-[#a77fd4] transition-colors"
                    >
                        Zaya Tarot
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        {t.backHome}
                    </button>
                </div>
            </header>

            <div className="relative z-10 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Title */}
                    <div className="mb-8">
                        <h1
                            className="text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-gradient-gold mb-2"
                            style={{ fontFamily: "'Crimson Text', serif" }}
                        >
                            {t.title}
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base font-light" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {t.subtitle}
                        </p>
                    </div>

                    {/* Layout with sidebar */}
                    <div className="flex gap-6 items-start">
                        {/* Sidebar */}
                        <div className="w-64 flex-shrink-0 sticky top-24">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                                <button
                                    onClick={() => setActiveTab('account')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === 'account'
                                        ? 'bg-gradient-to-r from-[#875faf]/20 to-[#a77fd4]/10 border border-[#875faf]/30 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">person</span>
                                    <span className="font-medium">{t.account}</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('subscription')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === 'subscription'
                                        ? 'bg-gradient-to-r from-[#875faf]/20 to-[#a77fd4]/10 border border-[#875faf]/30 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                                    <span className="font-medium">{t.subscription}</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('whatsapp')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === 'whatsapp'
                                        ? 'bg-gradient-to-r from-[#875faf]/20 to-[#a77fd4]/10 border border-[#875faf]/30 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">chat</span>
                                    <span className="font-medium">{t.whatsapp}</span>
                                    {tier !== 'premium' && (
                                        <span className="ml-auto text-xs px-2 py-0.5 bg-[#ffe066]/20 border border-[#ffe066]/30 text-[#ffe066] rounded-full">
                                            Premium
                                        </span>
                                    )}
                                </button>

                                <div className="pt-4 mt-4 border-t border-white/10">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-xl">logout</span>
                                        <span className="font-medium">{t.signOut}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8">
                                {/* Account Tab */}
                                {activeTab === 'account' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">{t.personalInfo}</h2>

                                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                                            {error && (
                                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            {success && (
                                                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                                                    {t.successMessage}
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-sm text-gray-300 block mb-2">{t.fullName}</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm text-gray-300 block mb-2">{t.email}</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-500 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {isPortuguese ? 'O email não pode ser alterado' : 'Email cannot be changed'}
                                                </p>
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-6 py-3 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-xl text-white font-bold transition-all shadow-lg shadow-[#875faf]/30 disabled:opacity-50"
                                                >
                                                    {loading ? t.saving : t.save}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Subscription Tab */}
                                {activeTab === 'subscription' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">{t.subscription}</h2>

                                        <div className="space-y-5">
                                            <div className="p-6 bg-gradient-to-r from-[#875faf]/10 to-transparent border border-[#875faf]/20 rounded-xl">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-400 mb-1">{isPortuguese ? 'Plano Atual' : 'Current Plan'}</p>
                                                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                                                            {tier === 'premium' ? (
                                                                <>
                                                                    <span className="text-[#ffe066]">⭐</span>
                                                                    {t.premiumPlan}
                                                                </>
                                                            ) : (
                                                                t.freePlan
                                                            )}
                                                        </p>
                                                    </div>
                                                    {tier !== 'premium' && (
                                                        <button
                                                            onClick={() => navigate('/checkout')}
                                                            className="px-5 py-2.5 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-lg text-sm text-white font-bold transition-all shadow-lg shadow-[#875faf]/30"
                                                        >
                                                            {t.upgradeNow}
                                                        </button>
                                                    )}
                                                </div>

                                                {profile?.created_at && (
                                                    <p className="text-xs text-gray-500">
                                                        {t.since}: {formatDate(profile.created_at)}
                                                    </p>
                                                )}

                                                {tier === 'premium' && profile?.subscription_expires_at && (
                                                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                        <p className="text-sm text-green-400">
                                                            {t.expiresAt}: {formatDate(profile.subscription_expires_at)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {tier === 'premium' && (
                                                <div className="flex flex-col gap-3">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { openCustomerPortal } = await import('../services/stripeService');
                                                                if (user) await openCustomerPortal(user.id);
                                                            } catch (err) {
                                                                console.error('Error opening portal:', err);
                                                            }
                                                        }}
                                                        className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 hover:border-[#875faf]/30 rounded-lg transition-all cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[#a77fd4]">manage_accounts</span>
                                                        <div className="text-left">
                                                            <p className="text-sm text-white font-medium">
                                                                {isPortuguese ? 'Gerenciar Assinatura' : 'Manage Subscription'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {isPortuguese ? 'Alterar forma de pagamento, cancelar ou ver faturas' : 'Change payment method, cancel or view invoices'}
                                                            </p>
                                                        </div>
                                                        <span className="material-symbols-outlined text-gray-500 ml-auto text-sm">open_in_new</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* WhatsApp Tab */}
                                {activeTab === 'whatsapp' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">{t.whatsapp}</h2>

                                        {tier !== 'premium' ? (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-[#875faf]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-3xl text-[#a77fd4]">lock</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{t.premiumRequired}</h3>
                                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                                    {t.whatsappDesc}
                                                </p>
                                                <button
                                                    onClick={() => navigate('/checkout')}
                                                    className="px-6 py-3 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-xl text-white font-bold transition-all shadow-lg shadow-[#875faf]/30"
                                                >
                                                    {t.activateNow}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-5">
                                                <div className="p-6 bg-gradient-to-r from-[#875faf]/10 to-transparent border border-[#875faf]/20 rounded-xl">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-white mb-1">{t.whatsappTitle}</h3>
                                                            <p className="text-sm text-gray-400">{t.whatsappDesc}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowWhatsAppModal(true)}
                                                            className="px-4 py-2 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-lg text-sm text-white font-bold transition-all shadow-lg shadow-[#875faf]/30"
                                                        >
                                                            {whatsappSub?.is_active ? t.manage : t.configureWhatsapp}
                                                        </button>
                                                    </div>

                                                    {whatsappSub && whatsappSub.is_active ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                                                    <span className="text-sm font-medium text-green-400">{t.status}: {t.whatsappActive}</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                                                <p className="text-sm text-gray-400">
                                                                    {t.whatsappNumber}: <span className="text-white font-medium">{whatsappSub.country_code} {whatsappSub.phone_number}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                            <div className="flex items-start gap-3">
                                                                <span className="material-symbols-outlined text-yellow-400 text-xl">info</span>
                                                                <div>
                                                                    <p className="text-sm font-medium text-yellow-400 mb-1">
                                                                        {t.status}: {t.whatsappInactive}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {isPortuguese
                                                                            ? 'Configure seu número para receber cartas diárias no WhatsApp'
                                                                            : 'Set up your number to receive daily cards on WhatsApp'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Modal */}
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => {
                    setShowWhatsAppModal(false);
                    loadData();
                }}
            />
        </div>
    );
};

export default Settings;
