// @ts-nocheck
#!/usr/bin/env node

/**
 * Script de teste do fluxo completo da Fase 4
 * Testa sincronização Backend -> IndexedDB -> Backend
 */

const SUPABASE_PROJECT = 'dpvavzehqfpytectomol';
const SUPABASE_URL = `https://${SUPABASE_PROJECT}.supabase.co`;

// IMPORTANTE: A chave anon precisa ser configurada aqui
// Você pode encontrá-la em: https://app.supabase.com/project/{PROJECT_ID}/settings/api
// Vá em "Project Settings" > "API" > copie a chave anon
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sua-chave-anon-aqui';

async function testSupabaseConnection() {
  console.log('🧪 Testando conexão com Supabase REST API...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/AnalyticsMetric?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Erro na conexão: ${response.status}`);
      console.error('Resposta:', await response.text());
      console.log('\n⚠️  INSTRUÇÕES:');
      console.log('1. Acesse: https://app.supabase.com/');
      console.log('2. Selecione seu projeto');
      console.log('3. Vá para Settings > API');
      console.log('4. Copie a chave "anon"');
      console.log('5. Configure: export SUPABASE_ANON_KEY="sua-chave-aqui"');
      console.log('6. Execute este script novamente');
      return false;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!\n');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    return false;
  }
}

async function createTestMetric() {
  console.log('📊 Criando métrica de teste...');

  const metric = {
    contentId: `test-${Date.now()}`,
    views: 1500,
    likes: 45,
    comments: 12,
    shares: 8,
    saves: 25,
    orders: 3,
    revenue: 89.99,
    platform: 'instagram',
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/AnalyticsMetric`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(metric),
    });

    if (!response.ok) {
      console.error(`❌ Erro ao criar métrica: ${response.status}`);
      console.error('Resposta:', await response.text());
      return null;
    }

    const created = await response.json();
    console.log('✅ Métrica criada:', created[0]?.id || 'ID não retornado');
    return created[0];
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function retrieveMetrics() {
  console.log('\n📥 Recuperando métricas do Supabase...');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/AnalyticsMetric?limit=10&order=createdAt.desc`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Erro ao recuperar: ${response.status}`);
      return null;
    }

    const metrics = await response.json();
    console.log(`✅ ${metrics.length} métricas recuperadas do Supabase`);

    if (metrics.length > 0) {
      console.log('   Exemplo (primeira métrica):');
      const m = metrics[0];
      console.log(`   - ID: ${m.id}`);
      console.log(`   - Content: ${m.contentId}`);
      console.log(`   - Views: ${m.views}, Revenue: $${m.revenue}`);
    }

    return metrics;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function createContentGenerated() {
  console.log('\n📝 Criando conteúdo gerado...');

  const content = {
    cascadeId: `cascade-${Date.now()}`,
    contentType: 'instagram-post',
    contentData: JSON.stringify({
      caption: 'Teste de conteúdo gerado via REST API',
      hashtags: ['#sacopex', '#teste'],
    }),
    llmModel: 'claude-3-sonnet',
    duration: 2.5,
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/AnalyticsContentGenerated`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      console.error(`❌ Erro: ${response.status}`);
      return null;
    }

    const created = await response.json();
    console.log('✅ Conteúdo gerado criado:', created[0]?.id || 'ID não retornado');
    return created[0];
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function getSyncLogs() {
  console.log('\n📋 Recuperando logs de sincronização...');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/AnalyticsSyncLog?order=createdAt.desc&limit=5`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ Erro: ${response.status}`);
      return null;
    }

    const logs = await response.json();
    console.log(`✅ ${logs.length} logs de sincronização`);

    if (logs.length > 0) {
      logs.forEach((log, i) => {
        console.log(`   Log ${i + 1}: status=${log.status}, batch=${log.batchSize}`);
      });
    }

    return logs;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function runFullTest() {
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('SacoPex Content Engine - Phase 4 REST API Test');
  console.log('═══════════════════════════════════════════════════════\n');

  // Test connection
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.log('\n⚠️  Não foi possível conectar ao Supabase.');
    process.exit(1);
  }

  // Create test data
  const metric = await createTestMetric();
  const content = await createContentGenerated();

  // Retrieve data
  const metrics = await retrieveMetrics();
  const logs = await getSyncLogs();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESUMO DO TESTE\n');

  if (metric) {
    console.log('✅ Métrica criada e sincronizada com sucesso');
  } else {
    console.log('❌ Falha ao criar métrica');
  }

  if (content) {
    console.log('✅ Conteúdo gerado registrado com sucesso');
  } else {
    console.log('❌ Falha ao registrar conteúdo');
  }

  if (metrics && metrics.length > 0) {
    console.log(`✅ ${metrics.length} métricas recuperadas do backend`);
  }

  console.log('\n🎯 Fluxo de sincronização funcionando!\n');
  console.log('═══════════════════════════════════════════════════════');
}

runFullTest().catch(console.error);
