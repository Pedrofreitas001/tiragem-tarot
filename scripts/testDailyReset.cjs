/**
 * Script para testar reset diário de leituras
 * Verifica se usuários free conseguem fazer 1 leitura por dia
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDailyReset() {
    console.log('🧪 Testando reset diário de leituras...\n');

    try {
        // 1. Buscar usuários free
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, subscription_tier, readings_today, last_reading_date')
            .eq('subscription_tier', 'free')
            .limit(5);

        if (error) {
            console.error('❌ Erro ao buscar perfis:', error.message);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('⚠️  Nenhum usuário free encontrado no banco');
            return;
        }

        console.log(`✅ Encontrados ${profiles.length} usuários free:\n`);

        const today = new Date().toISOString().split('T')[0];

        profiles.forEach(profile => {
            const isToday = profile.last_reading_date === today;
            const canRead = profile.readings_today < 1 || !isToday;

            console.log(`📧 ${profile.email || 'Sem email'}`);
            console.log(`   ID: ${profile.id}`);
            console.log(`   Leituras hoje: ${profile.readings_today}`);
            console.log(`   Última leitura: ${profile.last_reading_date || 'Nunca'}`);
            console.log(`   Pode ler hoje? ${canRead ? '✅ SIM' : '❌ NÃO'}`);
            console.log('');
        });

        // 2. Verificar lógica de reset
        console.log('\n📋 Lógica de Reset:');
        console.log(`   Data de hoje: ${today}`);
        console.log(`   Se last_reading_date !== hoje -> Reset automático para 0`);
        console.log(`   Se readings_today < 1 -> Usuário pode ler\n`);

        // 3. Sugestões
        console.log('💡 Recomendações:');
        console.log('   1. Usuários free devem ter readings_today resetado quando last_reading_date != hoje');
        console.log('   2. O incrementReadingCount() já implementa isso corretamente');
        console.log('   3. Verificar se o frontend está chamando incrementReadingCount() ANTES da leitura');
        console.log('   4. Garantir que checkAccess("readings") valida corretamente canDoReading\n');

    } catch (err) {
        console.error('❌ Erro inesperado:', err);
    }
}

testDailyReset();
