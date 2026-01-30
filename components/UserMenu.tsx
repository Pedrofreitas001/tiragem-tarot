import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface UserMenuProps {
  onLoginClick: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLoginClick }) => {
  const { user, profile, tier, signOut, readingsToday, limits, isConfigured } = useAuth();
  const { isPortuguese } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const t = {
    signIn: isPortuguese ? 'Entrar' : 'Sign In',
    signOut: isPortuguese ? 'Sair' : 'Sign Out',
    profile: isPortuguese ? 'Perfil' : 'Profile',
    subscription: isPortuguese ? 'Assinatura' : 'Subscription',
    free: isPortuguese ? 'Gratuito' : 'Free',
    premium: isPortuguese ? 'Premium' : 'Premium',
    readingsToday: isPortuguese ? 'Tiragens hoje' : 'Readings today',
    upgrade: isPortuguese ? 'Fazer Upgrade' : 'Upgrade',
    unlimited: isPortuguese ? 'Ilimitado' : 'Unlimited',
  };

  // Se não está configurado ou não tem usuário, mostrar botão de login
  if (!isConfigured || !user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#875faf] hover:bg-[#a77fd4] rounded-md text-white text-xs font-medium transition-colors"
      >
        <span className="material-symbols-outlined text-base">account_circle</span>
        {t.signIn}
      </button>
    );
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();
  const readingsText = tier === 'premium'
    ? t.unlimited
    : `${readingsToday}/${limits.readingsPerDay}`;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-[#875faf]/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#875faf]/20 border border-[#875faf]/30 flex items-center justify-center text-[#a77fd4] text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="material-symbols-outlined text-gray-400 text-sm">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1628] border border-[#875faf]/30 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border border-[#875faf]/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#875faf]/20 border border-[#875faf]/30 flex items-center justify-center text-[#a77fd4] text-sm font-bold">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{displayName}</div>
                  <div className="text-gray-500 text-xs truncate">{user.email}</div>
                </div>
              </div>

              {/* Tier Badge */}
              <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${tier === 'premium'
                  ? 'bg-gradient-to-r from-[#875faf] to-[#a77fd4] text-white'
                  : 'bg-white/10 text-gray-400'
                  }`}>
                  {tier === 'premium' ? t.premium : t.free}
                </span>
                <span className="text-gray-500 text-xs">
                  {t.readingsToday}: {readingsText}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {tier !== 'premium' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // TODO: Abrir modal de upgrade
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#a77fd4] hover:bg-[#875faf]/10 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-lg">star</span>
                  {t.upgrade}
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/history');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-lg">history</span>
                {isPortuguese ? 'Meu Histórico' : 'My History'}
              </button>

              <div className="my-2 border-t border-white/10" />

              <button
                onClick={async () => {
                  setIsOpen(false);
                  console.log('Logout clicked');
                  await signOut();
                  // Forçar reload para limpar todo o estado
                  window.location.href = '/';
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                {t.signOut}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
