import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth, FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from '../contexts/AuthContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'readings' | 'synthesis' | 'history' | 'export' | 'patterns';
  onLogin?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  feature = 'readings',
  onLogin
}) => {
  const { isPortuguese } = useLanguage();
  const { user, tier, readingsToday } = useAuth();

  if (!isOpen) return null;

  const t = {
    title: isPortuguese ? 'Limite Atingido' : 'Limit Reached',
    readingsTitle: isPortuguese ? 'Tiragens Diárias Esgotadas' : 'Daily Readings Exhausted',
    synthesisTitle: isPortuguese ? 'Síntese com IA é Premium' : 'AI Synthesis is Premium',
    historyTitle: isPortuguese ? 'Histórico Completo é Premium' : 'Full History is Premium',
    exportTitle: isPortuguese ? 'Exportar PDF é Premium' : 'PDF Export is Premium',
    patternsTitle: isPortuguese ? 'Análise de Padrões é Premium' : 'Pattern Analysis is Premium',

    readingsDesc: isPortuguese
      ? `Você já fez ${readingsToday} de ${FREE_TIER_LIMITS.readingsPerDay} tiragens gratuitas hoje. Volte amanhã ou faça upgrade para tiragens ilimitadas.`
      : `You've done ${readingsToday} of ${FREE_TIER_LIMITS.readingsPerDay} free readings today. Come back tomorrow or upgrade for unlimited readings.`,
    synthesisDesc: isPortuguese
      ? 'A síntese personalizada com inteligência artificial está disponível apenas para assinantes Premium.'
      : 'Personalized AI synthesis is only available for Premium subscribers.',
    historyDesc: isPortuguese
      ? `No plano gratuito, você tem acesso às últimas ${FREE_TIER_LIMITS.maxHistoryItems} tiragens. Faça upgrade para histórico completo.`
      : `On the free plan, you have access to the last ${FREE_TIER_LIMITS.maxHistoryItems} readings. Upgrade for full history.`,
    exportDesc: isPortuguese
      ? 'Exporte suas tiragens em PDF para guardar ou compartilhar. Disponível apenas para Premium.'
      : 'Export your readings as PDF to save or share. Available only for Premium.',
    patternsDesc: isPortuguese
      ? 'Descubra padrões nas cartas que aparecem com frequência em suas tiragens. Recurso exclusivo Premium.'
      : 'Discover patterns in cards that frequently appear in your readings. Exclusive Premium feature.',

    upgrade: isPortuguese ? 'Fazer Upgrade' : 'Upgrade Now',
    login: isPortuguese ? 'Entrar para Continuar' : 'Sign In to Continue',
    maybeLater: isPortuguese ? 'Talvez Depois' : 'Maybe Later',

    premiumBenefits: isPortuguese ? 'Benefícios Premium' : 'Premium Benefits',
    unlimitedReadings: isPortuguese ? 'Tiragens ilimitadas' : 'Unlimited readings',
    aiSynthesis: isPortuguese ? 'Síntese com IA personalizada' : 'Personalized AI synthesis',
    fullHistory: isPortuguese ? 'Histórico completo' : 'Full history',
    pdfExport: isPortuguese ? 'Exportar em PDF' : 'PDF export',
    patternAnalysis: isPortuguese ? 'Análise de padrões' : 'Pattern analysis',
    noAds: isPortuguese ? 'Sem anúncios' : 'No ads',

    price: isPortuguese ? 'R$ 19,90/mês' : '$3.99/month',
    priceNote: isPortuguese ? 'Cancele quando quiser' : 'Cancel anytime',
  };

  const getTitle = () => {
    switch (feature) {
      case 'readings': return t.readingsTitle;
      case 'synthesis': return t.synthesisTitle;
      case 'history': return t.historyTitle;
      case 'export': return t.exportTitle;
      case 'patterns': return t.patternsTitle;
      default: return t.title;
    }
  };

  const getDescription = () => {
    switch (feature) {
      case 'readings': return t.readingsDesc;
      case 'synthesis': return t.synthesisDesc;
      case 'history': return t.historyDesc;
      case 'export': return t.exportDesc;
      case 'patterns': return t.patternsDesc;
      default: return '';
    }
  };

  const getIcon = () => {
    switch (feature) {
      case 'readings': return 'style';
      case 'synthesis': return 'auto_awesome';
      case 'history': return 'history';
      case 'export': return 'picture_as_pdf';
      case 'patterns': return 'insights';
      default: return 'lock';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1a1628] border border-[#875faf]/30 rounded-2xl overflow-hidden z-50">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[#875faf]/20 to-[#1a1628] p-8 text-center border-b border-[#875faf]/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#875faf]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[#a77fd4]">{getIcon()}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
            {getTitle()}
          </h2>
          <p className="text-gray-400 text-sm">
            {getDescription()}
          </p>
        </div>

        {/* Benefits */}
        <div className="p-6">
          <h3 className="text-[#a77fd4] text-sm font-bold uppercase tracking-wider mb-4">
            {t.premiumBenefits}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'all_inclusive', text: t.unlimitedReadings },
              { icon: 'auto_awesome', text: t.aiSynthesis },
              { icon: 'history', text: t.fullHistory },
              { icon: 'picture_as_pdf', text: t.pdfExport },
              { icon: 'insights', text: t.patternAnalysis },
              { icon: 'block', text: t.noAds },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                <span className="material-symbols-outlined text-[#875faf] text-lg">{benefit.icon}</span>
                {benefit.text}
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="px-6 pb-2 text-center">
          <div className="text-3xl font-bold text-white">{t.price}</div>
          <div className="text-gray-500 text-sm">{t.priceNote}</div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          {!user ? (
            <button
              onClick={onLogin}
              className="w-full py-4 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-xl text-white font-bold transition-all shadow-lg shadow-[#875faf]/30"
            >
              {t.login}
            </button>
          ) : (
            <button
              onClick={() => {
                // TODO: Implementar checkout
                alert(isPortuguese ? 'Checkout em breve!' : 'Checkout coming soon!');
              }}
              className="w-full py-4 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#9670bf] hover:to-[#b790e4] rounded-xl text-white font-bold transition-all shadow-lg shadow-[#875faf]/30"
            >
              {t.upgrade}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white font-medium transition-all"
          >
            {t.maybeLater}
          </button>
        </div>
      </div>
    </>
  );
};

// Hook para verificar acesso a features
export const usePaywall = () => {
  const { user, tier, canDoReading, limits, readingsToday } = useAuth();

  const checkAccess = (feature: 'readings' | 'synthesis' | 'history' | 'export' | 'patterns'): boolean => {
    if (tier === 'premium') return true;

    switch (feature) {
      case 'readings':
        return canDoReading;
      case 'synthesis':
        return limits.hasAISynthesis;
      case 'history':
        return true; // Acesso limitado, não bloqueado
      case 'export':
        return limits.hasPDFExport;
      case 'patterns':
        return limits.hasPatternAnalysis;
      default:
        return false;
    }
  };

  const getHistoryLimit = (): number => {
    return limits.maxHistoryItems;
  };

  return {
    checkAccess,
    getHistoryLimit,
    isPremium: tier === 'premium',
    readingsRemaining: Math.max(0, limits.readingsPerDay - readingsToday),
  };
};

export default PaywallModal;
