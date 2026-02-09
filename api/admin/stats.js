/**
 * API de Estatísticas Admin
 *
 * SEGURANÇA:
 * - Requer autenticação via token JWT
 * - Verifica se o usuário é admin no banco
 * - Retorna apenas contagens agregadas (sem dados pessoais)
 * - Rate limiting implícito via Vercel
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Apenas GET permitido
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    // Verificar Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação necessário' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Configuração Supabase
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('❌ Supabase não configurado');
        return res.status(500).json({ error: 'Serviço não configurado' });
    }

    try {
        // Cliente com token do usuário para verificar autenticação
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: { Authorization: `Bearer ${token}` }
            }
        });

        // Verificar se o token é válido e obter usuário
        const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

        if (authError || !user) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        // Cliente com service role para consultas admin
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Verificar se o usuário é admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.is_admin) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }

        // Buscar estatísticas agregadas (sem dados pessoais)
        const stats = {};

        // Total de usuários cadastrados
        const { count: totalUsers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        stats.totalUsers = totalUsers || 0;

        // Usuários premium ativos
        const { count: premiumUsers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('subscription_tier', 'premium');
        stats.premiumUsers = premiumUsers || 0;

        // Assinaturas WhatsApp ativas
        const { count: whatsappActive } = await supabaseAdmin
            .from('whatsapp_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        stats.whatsappSubscriptions = whatsappActive || 0;

        // Total de leituras salvas
        const { count: totalReadings } = await supabaseAdmin
            .from('readings')
            .select('*', { count: 'exact', head: true });
        stats.totalReadings = totalReadings || 0;

        // Usuários cadastrados nos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: newUsersWeek } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());
        stats.newUsersWeek = newUsersWeek || 0;

        // Usuários cadastrados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: newUsersMonth } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo.toISOString());
        stats.newUsersMonth = newUsersMonth || 0;

        // Assinaturas ativas (subscriptions table)
        const { count: activeSubscriptions } = await supabaseAdmin
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        stats.activeSubscriptions = activeSubscriptions || 0;

        // Leituras nos últimos 7 dias
        const { count: readingsWeek } = await supabaseAdmin
            .from('readings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());
        stats.readingsWeek = readingsWeek || 0;

        // Taxa de conversão (premium / total)
        stats.conversionRate = stats.totalUsers > 0
            ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
            : '0.0';

        // Timestamp da consulta
        stats.generatedAt = new Date().toISOString();

        return res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
