/**
 * API de Estatísticas Admin
 *
 * SEGURANÇA:
 * - Requer autenticação via token JWT
 * - Verifica se o usuário é admin no banco
 * - Retorna apenas contagens agregadas (sem dados pessoais)
 * - Rate limiting implícito via Vercel
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS (configurar no Vercel):
 * - SUPABASE_URL ou VITE_SUPABASE_URL
 * - SUPABASE_ANON_KEY ou VITE_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS headers - sempre enviar
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Apenas GET permitido
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Verificar Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação necessário' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Configuração Supabase - verificar todas as possíveis variáveis
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Log para debug (remover em produção)
    console.log('🔍 Verificando variáveis de ambiente...');
    console.log('SUPABASE_URL:', SUPABASE_URL ? '✓ configurado' : '✗ não encontrado');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓ configurado' : '✗ não encontrado');
    console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓ configurado' : '✗ não encontrado');

    // Verificar configuração
    const missingVars = [];
    if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
    if (!SUPABASE_ANON_KEY) missingVars.push('SUPABASE_ANON_KEY');
    if (!SUPABASE_SERVICE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

    if (missingVars.length > 0) {
        console.error('❌ Variáveis faltando:', missingVars.join(', '));
        return res.status(500).json({
            error: 'Serviço não configurado',
            details: `Variáveis de ambiente faltando: ${missingVars.join(', ')}`,
            help: 'Configure estas variáveis no painel do Vercel em Settings > Environment Variables'
        });
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
            console.error('❌ Erro de autenticação:', authError?.message);
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        console.log('✓ Usuário autenticado:', user.id);

        // Cliente com service role para consultas admin
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Verificar se o usuário é admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Erro ao buscar perfil:', profileError.message);
            return res.status(403).json({ error: 'Erro ao verificar permissões' });
        }

        if (!profile?.is_admin) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }

        console.log('✓ Admin verificado');

        // Buscar estatísticas agregadas (sem dados pessoais)
        const stats = {
            totalUsers: 0,
            premiumUsers: 0,
            whatsappSubscriptions: 0,
            totalReadings: 0,
            newUsersWeek: 0,
            newUsersMonth: 0,
            activeSubscriptions: 0,
            readingsWeek: 0,
            conversionRate: '0.0',
            generatedAt: new Date().toISOString()
        };

        // Total de usuários cadastrados
        try {
            const { count } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            stats.totalUsers = count || 0;
        } catch (e) {
            console.warn('⚠️ Erro ao contar profiles:', e.message);
        }

        // Usuários premium ativos
        try {
            const { count } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('subscription_tier', 'premium');
            stats.premiumUsers = count || 0;
        } catch (e) {
            console.warn('⚠️ Erro ao contar premium:', e.message);
        }

        // Assinaturas WhatsApp ativas
        try {
            const { count } = await supabaseAdmin
                .from('whatsapp_subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            stats.whatsappSubscriptions = count || 0;
        } catch (e) {
            console.warn('⚠️ Tabela whatsapp_subscriptions não existe ou erro:', e.message);
        }

        // Total de leituras salvas
        try {
            const { count } = await supabaseAdmin
                .from('readings')
                .select('*', { count: 'exact', head: true });
            stats.totalReadings = count || 0;
        } catch (e) {
            console.warn('⚠️ Tabela readings não existe ou erro:', e.message);
        }

        // Usuários cadastrados nos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        try {
            const { count } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString());
            stats.newUsersWeek = count || 0;
        } catch (e) {
            console.warn('⚠️ Erro ao contar novos usuários (7d):', e.message);
        }

        // Usuários cadastrados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        try {
            const { count } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo.toISOString());
            stats.newUsersMonth = count || 0;
        } catch (e) {
            console.warn('⚠️ Erro ao contar novos usuários (30d):', e.message);
        }

        // Assinaturas ativas (subscriptions table)
        try {
            const { count } = await supabaseAdmin
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');
            stats.activeSubscriptions = count || 0;
        } catch (e) {
            console.warn('⚠️ Tabela subscriptions não existe ou erro:', e.message);
        }

        // Leituras nos últimos 7 dias
        try {
            const { count } = await supabaseAdmin
                .from('readings')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString());
            stats.readingsWeek = count || 0;
        } catch (e) {
            console.warn('⚠️ Erro ao contar leituras (7d):', e.message);
        }

        // Taxa de conversão (premium / total)
        stats.conversionRate = stats.totalUsers > 0
            ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
            : '0.0';

        console.log('✓ Estatísticas geradas com sucesso');

        return res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error.message);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
}
