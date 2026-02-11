import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth, FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from '../contexts/AuthContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'readings' | 'synthesis' | 'history' | 'export' | 'patterns' | 'archive' | 'ranking' | 'whatsapp' | 'physicalReading' | 'aiSynthesis';
  onLogin?: () => void;
  onRegister?: () => void;
  onCheckout?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  feature = 'readings',
  onLogin,
  onRegister,
  onCheckout
}) => {
  const { isPortuguese } = useLanguage();
  const { user, tier, readingsToday, isGuest } = useAuth();

  if (!isOpen) return null;

  const t = {
    guestReadingsTitle: isPortuguese ? 'Crie sua Conta Gratuita' : 'Create Your Free Account',
    guestReadingsDesc: isPortuguese
      ? 'Você usou sua tirada gratuita de demonstração. Crie uma conta grátis para ter 1 tirada por dia!'
      : 'You used your free demo reading. Create a free account to get 1 reading per day!',
    guestHistoryTitle: isPortuguese ? 'Histórico Requer Conta' : 'History Requires Account',
    guestHistoryDesc: isPortuguese
      ? 'Crie uma conta gratuita para salvar e acessar seu histórico de tiragens.'
      : 'Create a free account to save and access your reading history.',
    guestArchiveTitle: isPortuguese ? 'Arquivo Arcano Requer Conta' : 'Arcane Archive Requires Account',
    guestArchiveDesc: isPortuguese
      ? 'Crie uma conta gratuita para explorar o significado das cartas.'
      : 'Create a free account to explore card meanings.',
    guestRankingTitle: isPortuguese ? 'Ranking Premium' : 'Premium Ranking',
    guestRankingDesc: isPortuguese
      ? 'Crie uma conta gratuita para ver seu ranking pessoal de energias.'
      : 'Create a free account to see your personal energy ranking.',
    guestWhatsappTitle: isPortuguese ? 'Carta do Dia Premium' : 'Daily Card Premium',
    guestWhatsappDesc: isPortuguese
      ? 'Crie uma conta gratuita para receber a carta do dia pelo WhatsApp.'
      : 'Create a free account to receive your daily card on WhatsApp.',
    guestPhysicalTitle: isPortuguese ? 'Interpretação Física Premium' : 'Physical Reading Premium',
    guestPhysicalDesc: isPortuguese
      ? 'A interpretação de tiragens físicas com IA é exclusiva para assinantes Premium.'
      : 'Physical reading interpretation with AI is exclusive to Premium subscribers.',
    guestSynthesisTitle: isPortuguese ? 'Síntese com IA Requer Conta' : 'AI Synthesis Requires Account',
    guestSynthesisDesc: isPortuguese
      ? 'Crie uma conta gratuita para ter acesso à síntese personalizada com IA em suas tiragens.'
      : 'Create a free account to access personalized AI synthesis in your readings.',

    title: isPortuguese ? 'Limite Atingido' : 'Limit Reached',
    readingsTitle: isPortuguese ? 'Tiragens Diárias Esgotadas' : 'Daily Readings Exhausted',
    synthesisTitle: isPortuguese ? 'Síntese com IA é Premium' : 'AI Synthesis is Premium',
    historyTitle: isPortuguese ? 'Histórico Completo é Premium' : 'Full History is Premium',
    exportTitle: isPortuguese ? 'Exportar PDF é Premium' : 'PDF Export is Premium',
    patternsTitle: isPortuguese ? 'Análise de Padrões é Premium' : 'Pattern Analysis is Premium',
    whatsappTitle: isPortuguese ? 'Carta do Dia é Premium' : 'Daily Card is Premium',
    archiveTitle: isPortuguese ? 'Arquivo Completo é Premium' : 'Full Archive is Premium',
    rankingTitle: isPortuguese ? 'Top 3 Energias é Premium' : 'Top 3 Energies is Premium',
    physicalTitle: isPortuguese ? 'Interpretação Física é Premium' : 'Physical Reading is Premium',

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
    archiveDesc: isPortuguese
      ? `No plano gratuito, você tem acesso a ${FREE_TIER_LIMITS.maxArchiveCards} cartas. Faça upgrade para acesso completo às 78 cartas.`
      : `On the free plan, you have access to ${FREE_TIER_LIMITS.maxArchiveCards} cards. Upgrade for full access to all 78 cards.`,
    rankingDesc: isPortuguese
      ? 'Veja seu Top 3 de energias que guiam sua jornada espiritual. Recurso exclusivo Premium.'
      : 'See your Top 3 energies that guide your spiritual journey. Exclusive Premium feature.',
    whatsappDesc: isPortuguese
      ? 'Para receber a carta do dia pelo WhatsApp é necessário assinar o Premium.'
      : 'To receive the daily card on WhatsApp you need to subscribe to Premium.',
    physicalDesc: isPortuguese
      ? 'A interpretação de tiragens físicas com IA é exclusiva para assinantes Premium.'
      : 'Physical reading interpretation with AI is exclusive to Premium subscribers.',

    upgrade: isPortuguese ? 'Assinar Premium' : 'Go Premium',
    createAccount: isPortuguese ? 'Criar Conta Grátis' : 'Create Free Account',
    login: isPortuguese ? 'Já tenho conta' : 'I have an account',
    maybeLater: isPortuguese ? 'Talvez Depois' : 'Maybe Later',

    freeBenefits: isPortuguese ? 'Com conta gratuita você tem' : 'With a free account you get',
    threeReadings: isPortuguese ? '1 tirada por dia com síntese IA' : '1 reading per day with AI synthesis',
    historyAccess: isPortuguese ? 'Histórico das últimas 3 tiragens' : 'History of last 3 readings',
    sevenCards: isPortuguese ? 'Acesso a 7 cartas do arquivo' : 'Access to 7 archive cards',

    premiumBenefits: isPortuguese ? 'Tudo incluso no Premium' : 'Everything in Premium',
    unlimitedReadings: isPortuguese ? 'Tiragens ilimitadas' : 'Unlimited readings',
    aiSynthesis: isPortuguese ? 'Síntese com IA personalizada' : 'Personalized AI synthesis',
    fullHistory: isPortuguese ? 'Histórico completo' : 'Full history',
    fullArchive: isPortuguese ? 'Todas as 78 cartas' : 'All 78 cards',
    pdfExport: isPortuguese ? 'Exportar em PDF' : 'PDF export',
    patternAnalysis: isPortuguese ? 'Análise de padrões' : 'Pattern analysis',
    noAds: isPortuguese ? 'Sem anúncios' : 'No ads',
    tarotBySign: isPortuguese ? 'Tarot por Signo diário' : 'Daily Tarot by Sign',
    whatsappCard: isPortuguese ? 'Carta do dia no WhatsApp' : 'Daily card on WhatsApp',

    price: isPortuguese ? 'R$ 19,90' : '$3.99',
    pricePerMonth: isPortuguese ? '/mês' : '/month',
    priceNote: isPortuguese ? 'Cancele quando quiser' : 'Cancel anytime',
  };

  const getTitle = () => {
    if (isGuest) {
      switch (feature) {
        case 'readings': return t.guestReadingsTitle;
        case 'history': return t.guestHistoryTitle;
        case 'archive': return t.guestArchiveTitle;
        case 'ranking': return t.guestRankingTitle;
        case 'whatsapp': return t.guestWhatsappTitle;
        case 'physicalReading': return t.guestPhysicalTitle;
        case 'synthesis':
        case 'aiSynthesis': return t.guestSynthesisTitle;
        default: return t.guestReadingsTitle;
      }
    }
    switch (feature) {
      case 'readings': return t.readingsTitle;
      case 'synthesis':
      case 'aiSynthesis': return t.synthesisTitle;
      case 'history': return t.historyTitle;
      case 'export': return t.exportTitle;
      case 'patterns': return t.patternsTitle;
      case 'archive': return t.archiveTitle;
      case 'ranking': return t.rankingTitle;
      case 'whatsapp': return t.whatsappTitle;
      case 'physicalReading': return t.physicalTitle;
      default: return t.title;
    }
  };

  const getDescription = () => {
    if (isGuest) {
      switch (feature) {
        case 'readings': return t.guestReadingsDesc;
        case 'history': return t.guestHistoryDesc;
        case 'archive': return t.guestArchiveDesc;
        case 'ranking': return t.guestRankingDesc;
        case 'whatsapp': return t.guestWhatsappDesc;
        case 'physicalReading': return t.guestPhysicalDesc;
        case 'synthesis':
        case 'aiSynthesis': return t.guestSynthesisDesc;
        default: return t.guestReadingsDesc;
      }
    }
    switch (feature) {
      case 'readings': return t.readingsDesc;
      case 'synthesis':
      case 'aiSynthesis': return t.synthesisDesc;
      case 'history': return t.historyDesc;
      case 'export': return t.exportDesc;
      case 'patterns': return t.patternsDesc;
      case 'archive': return t.archiveDesc;
      case 'ranking': return t.rankingDesc;
      case 'whatsapp': return t.whatsappDesc;
      case 'physicalReading': return t.physicalDesc;
      default: return '';
    }
  };

  const premiumFeatures = [
    { icon: 'all_inclusive', text: t.unlimitedReadings },
    { icon: 'auto_awesome', text: t.aiSynthesis },
    { icon: 'stars', text: t.tarotBySign },
    { icon: 'chat', text: t.whatsappCard },
    { icon: 'history', text: t.fullHistory },
    { icon: 'collections_bookmark', text: t.fullArchive },
    { icon: 'picture_as_pdf', text: t.pdfExport },
    { icon: 'block', text: t.noAds },
  ];

  const freeFeatures = [
    { icon: 'style', text: t.threeReadings },
    { icon: 'history', text: t.historyAccess },
    { icon: 'collections_bookmark', text: t.sevenCards },
  ];

  return (
    <>
      <style>{`
        .paywall-gradient-gold {
          background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes paywall-fade-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .paywall-animate-in {
          animation: paywall-fade-in 0.2s ease-out;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="paywall-animate-in fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-50 max-h-[90vh] overflow-y-auto">
        <div className="relative bg-[#13101d] border border-white/[0.08] rounded-2xl overflow-hidden">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 text-xl">close</span>
          </button>

          {/* Header */}
          <div className="relative px-6 pt-8 pb-6 text-center">
            {/* Subtle ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold paywall-gradient-gold mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                {getTitle()}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {getDescription()}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* Content */}
          <div className="px-6 py-5">
            {isGuest ? (
              /* Guest: show free account benefits */
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-3">
                  {t.freeBenefits}
                </p>
                <div className="space-y-2.5">
                  {freeFeatures.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-green-400 text-[16px]">check</span>
                      </div>
                      <span className="text-gray-300 text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Free tier: show premium benefits with price */
              <div>
                {/* Price highlight */}
                <div className="flex items-center justify-center gap-1 mb-5">
                  <span className="text-3xl font-bold text-white tracking-tight">{t.price}</span>
                  <span className="text-gray-500 text-sm">{t.pricePerMonth}</span>
                </div>

                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-3">
                  {t.premiumBenefits}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {premiumFeatures.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-purple-400 text-[16px]">{item.icon}</span>
                      </div>
                      <span className="text-gray-300 text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 pt-2 space-y-2.5">
            {isGuest ? (
              <>
                <button
                  onClick={() => {
                    if (onRegister) {
                      onRegister();
                    } else if (onLogin) {
                      onLogin();
                    }
                    onClose();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#7c5aaf] to-[#9b6fd4] hover:from-[#8a68bd] hover:to-[#a97fe2] rounded-xl text-white text-sm font-bold tracking-wide transition-all"
                >
                  {t.createAccount}
                </button>
                <button
                  onClick={() => {
                    onLogin?.();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  {t.login}
                </button>
              </>
            ) : tier === 'free' ? (
              <>
                <button
                  onClick={() => {
                    onCheckout?.();
                    onClose();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#7c5aaf] to-[#9b6fd4] hover:from-[#8a68bd] hover:to-[#a97fe2] rounded-xl text-white text-sm font-bold tracking-wide transition-all"
                >
                  {t.upgrade}
                </button>
                <div className="text-center">
                  <span className="text-[11px] text-gray-600">{t.priceNote}</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
                >
                  {t.maybeLater}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

// Hook para verificar acesso a features
export const usePaywall = () => {
  const { user, tier, canDoReading, limits, readingsToday, isGuest } = useAuth();

  const checkAccess = (feature: 'readings' | 'synthesis' | 'aiSynthesis' | 'history' | 'export' | 'patterns' | 'archive' | 'physicalReading'): boolean => {
    if (tier === 'premium') return true;

    switch (feature) {
      case 'readings':
        return canDoReading;
      case 'synthesis':
      case 'aiSynthesis':
        return limits.hasAISynthesis;
      case 'history':
        if (isGuest) return false;
        return true;
      case 'archive':
        if (isGuest) return false;
        return true;
      case 'export':
        return limits.hasPDFExport;
      case 'patterns':
        return limits.hasPatternAnalysis;
      case 'physicalReading':
        return limits.hasPhysicalReading;
      default:
        return false;
    }
  };

  const getHistoryLimit = (): number => {
    return limits.maxHistoryItems;
  };

  const getArchiveLimit = (): number => {
    return limits.maxArchiveCards;
  };

  return {
    checkAccess,
    getHistoryLimit,
    getArchiveLimit,
    isPremium: tier === 'premium',
    isGuest,
    isFree: tier === 'free',
    readingsRemaining: Math.max(0, limits.readingsPerDay - readingsToday),
    tier,
  };
};

export default PaywallModal;
