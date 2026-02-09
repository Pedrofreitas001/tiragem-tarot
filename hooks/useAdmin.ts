import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para verificar se o usuário atual é admin
 * Retorna isAdmin, isLoading e o profile completo
 */
export const useAdmin = () => {
    const { profile, loading, user } = useAuth();

    // Usuário é admin se tiver o campo is_admin = true no profile
    const isAdmin = Boolean(profile?.is_admin);

    return {
        isAdmin,
        isLoading: loading,
        user,
        profile,
    };
};
