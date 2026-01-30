import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { WhatsappSubscription } from '../types/database';

interface WhatsAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
    const { isPortuguese } = useLanguage();
    const { user, tier } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [subscription, setSubscription] = useState<WhatsappSubscription | null>(null);

    const [formData, setFormData] = useState({
        countryCode: '+55',
        phoneNumber: '',
    });

    // Carregar assinatura existente
    useEffect(() => {
        if (isOpen && user) {
            loadSubscription();
        }
    }, [isOpen, user]);

    const loadSubscription = async () => {
        if (!user || !supabase) return;

        try {
            const { data, error } = await (supabase as any)
                .from('whatsapp_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading subscription:', error);
                return;
            }

            if (data) {
                setSubscription(data);
                setFormData({
                    countryCode: data.country_code,
                    phoneNumber: data.phone_number,
                });
            }
        } catch (err) {
            console.error('Error loading subscription:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!user || !supabase) {
            setError(isPortuguese ? 'Você precisa estar logado' : 'You need to be logged in');
            return;
        }

        if (tier !== 'premium') {
            setError(isPortuguese ? 'Apenas usuários Premium podem receber a carta do dia no WhatsApp' : 'Only Premium users can receive the daily card on WhatsApp');
            return;
        }

        if (!formData.phoneNumber || formData.phoneNumber.length < 8) {
            setError(isPortuguese ? 'Por favor, insira um número de telefone válido' : 'Please enter a valid phone number');
            return;
        }

        setLoading(true);

        try {
            if (subscription) {
                // Atualizar assinatura existente
                const { error: updateError } = await (supabase as any)
                    .from('whatsapp_subscriptions')
                    .update({
                        phone_number: formData.phoneNumber,
                        country_code: formData.countryCode,
                        is_active: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id);

                if (updateError) throw updateError;
            } else {
                // Criar nova assinatura
                const { error: insertError } = await (supabase as any)
                    .from('whatsapp_subscriptions')
                    .insert({
                        user_id: user.id,
                        phone_number: formData.phoneNumber,
                        country_code: formData.countryCode,
                        is_active: true,
                    });

                if (insertError) throw insertError;
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Error saving subscription:', err);
            setError(err.message || (isPortuguese ? 'Erro ao salvar assinatura' : 'Error saving subscription'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!user || !supabase || !subscription) return;

        const confirmed = window.confirm(
            isPortuguese
                ? 'Tem certeza que deseja cancelar o recebimento da carta do dia no WhatsApp?'
                : 'Are you sure you want to cancel receiving the daily card on WhatsApp?'
        );

        if (!confirmed) return;

        setLoading(true);

        try {
            const { error } = await (supabase as any)
                .from('whatsapp_subscriptions')
                .update({ is_active: false })
                .eq('user_id', user.id);

            if (error) throw error;

            setSubscription(null);
            setFormData({ countryCode: '+55', phoneNumber: '' });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Error canceling subscription:', err);
            setError(err.message || (isPortuguese ? 'Erro ao cancelar assinatura' : 'Error canceling subscription'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const t = {
        title: isPortuguese ? 'Carta do Dia no WhatsApp' : 'Daily Card on WhatsApp',
        description: isPortuguese
            ? 'Receba a carta do dia diretamente no WhatsApp'
            : 'Receive the daily card directly on WhatsApp',
        countryCode: isPortuguese ? 'Código do país' : 'Country code',
        phoneNumber: isPortuguese ? 'Número de telefone' : 'Phone number',
        phonePlaceholder: isPortuguese ? '(11) 99999-9999' : '(11) 99999-9999',
        save: isPortuguese ? 'Salvar' : 'Save',
        cancel: isPortuguese ? 'Cancelar Assinatura' : 'Cancel Subscription',
        close: isPortuguese ? 'Fechar' : 'Close',
        saving: isPortuguese ? 'Salvando...' : 'Saving...',
        successMessage: isPortuguese ? 'Assinatura salva com sucesso!' : 'Subscription saved successfully!',
        cancelSuccess: isPortuguese ? 'Assinatura cancelada com sucesso!' : 'Subscription canceled successfully!',
    };

    const countries = [
        { code: '+55', name: isPortuguese ? 'Brasil' : 'Brazil', flag: '🇧🇷' },
        { code: '+1', name: isPortuguese ? 'EUA/Canadá' : 'USA/Canada', flag: '🇺🇸' },
        { code: '+44', name: isPortuguese ? 'Reino Unido' : 'UK', flag: '🇬🇧' },
        { code: '+351', name: 'Portugal', flag: '🇵🇹' },
        { code: '+34', name: isPortuguese ? 'Espanha' : 'Spain', flag: '🇪🇸' },
        { code: '+39', name: isPortuguese ? 'Itália' : 'Italy', flag: '🇮🇹' },
        { code: '+33', name: isPortuguese ? 'França' : 'France', flag: '🇫🇷' },
        { code: '+49', name: isPortuguese ? 'Alemanha' : 'Germany', flag: '🇩🇪' },
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1628] border border-[#875faf]/30 rounded-xl overflow-hidden z-50">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#875faf]/20 to-[#1a1628] p-6 border-b border-[#875faf]/20">
                    <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Crimson Text', serif" }}>
                        {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {t.description}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                            {subscription ? t.successMessage : t.cancelSuccess}
                        </div>
                    )}

                    <div>
                        <label className="text-sm text-gray-300 block mb-2">{t.countryCode}</label>
                        <select
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                            disabled={loading || !!subscription}
                        >
                            {countries.map(country => (
                                <option key={country.code} value={country.code} className="bg-[#1a1628]">
                                    {country.flag} {country.name} ({country.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-300 block mb-2">{t.phoneNumber}</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.countryCode}
                                disabled
                                className="w-20 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center"
                            />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder={t.phonePlaceholder}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] outline-none transition-colors"
                                disabled={loading || !!subscription}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        {subscription && subscription.is_active ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-medium transition-all disabled:opacity-50"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white font-medium transition-all"
                                >
                                    {t.close}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white font-medium transition-all disabled:opacity-50"
                                >
                                    {t.close}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || tier !== 'premium'}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-lg text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t.saving : t.save}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default WhatsAppModal;
