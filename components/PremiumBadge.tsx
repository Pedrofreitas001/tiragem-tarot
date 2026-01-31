import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PremiumBadgeProps {
    variant?: 'button' | 'badge' | 'inline';
    className?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ variant = 'badge', className = '' }) => {
    const { isPortuguese } = useLanguage();

    const text = isPortuguese ? 'Você é Premium' : 'You are Premium';
    const icon = '⭐';

    if (variant === 'button') {
        return (
            <div
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
          bg-gradient-to-r from-[#ffe066]/20 to-[#ffd700]/20 
          border-2 border-[#ffe066]/40
          text-[#ffe066] font-bold uppercase tracking-wider text-sm
          cursor-default ${className}`}
            >
                <span className="text-lg">{icon}</span>
                {text}
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
          bg-[#ffe066]/20 border border-[#ffe066]/30
          text-[#ffe066] font-semibold text-xs uppercase tracking-wide
          ${className}`}
            >
                <span>{icon}</span>
                {isPortuguese ? 'Premium' : 'Premium'}
            </span>
        );
    }

    // badge (default)
    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r from-[#ffe066]/20 to-[#ffd700]/20 
        border border-[#ffe066]/30
        text-[#ffe066] font-bold text-sm uppercase tracking-wider
        ${className}`}
        >
            <span className="text-base">{icon}</span>
            {text}
        </div>
    );
};

export default PremiumBadge;
