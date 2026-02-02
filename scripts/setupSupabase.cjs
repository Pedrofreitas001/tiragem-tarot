#!/usr/bin/env node
/**
 * Script para configurar as tabelas do Supabase
 * Execute: node scripts/setupSupabase.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jhqcvkukzzztlubqdlrl.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_5oU2lTxQCNiUUMOhK6ZAeg_ZJl5oH4o';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkConnection() {
  console.log('🔌 Testando conexão com Supabase...\n');

  try {
    // Tentar uma query simples
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error && error.code === '42P01') {
      console.log('⚠️  Tabela "profiles" não existe ainda.');
      console.log('📋 Você precisa executar o SQL manualmente no Supabase Dashboard.\n');
      return false;
    } else if (error) {
      console.log('❌ Erro:', error.message);
      return false;
    }

    console.log('✅ Conexão OK! Tabelas já existem.\n');
    return true;
  } catch (err) {
    console.log('❌ Erro de conexão:', err.message);
    return false;
  }
}

async function testAuth() {
  console.log('🔐 Testando sistema de autenticação...\n');

  // Verificar se auth está funcionando
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.log('❌ Erro no auth:', error.message);
    return false;
  }

  console.log('✅ Sistema de auth funcionando!\n');
  return true;
}

async function main() {
  console.log('========================================');
  console.log('  ZAYA TAROT - Setup Supabase');
  console.log('========================================\n');

  console.log(`📍 Projeto: jhqcvkukzzztlubqdlrl`);
  console.log(`🌐 URL: ${SUPABASE_URL}\n`);

  await testAuth();
  const tablesExist = await checkConnection();

  if (!tablesExist) {
    console.log('========================================');
    console.log('  INSTRUÇÕES PARA CRIAR AS TABELAS');
    console.log('========================================\n');
    console.log('1. Acesse: https://supabase.com/dashboard/project/jhqcvkukzzztlubqdlrl/sql');
    console.log('2. Copie o conteúdo de: supabase/schema.sql');
    console.log('3. Cole no SQL Editor e clique em "Run"\n');
    console.log('Depois de criar as tabelas, rode este script novamente para verificar.\n');
  } else {
    console.log('🎉 Tudo configurado! O app está pronto para usar.\n');
  }
}

main().catch(console.error);
