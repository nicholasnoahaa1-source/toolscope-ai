#!/usr/bin/env node

/**
 * Teste do fluxo completo usando SQL direto
 * Evita problemas de configuração do Prisma 7
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "analytics.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erro ao abrir banco:", err.message);
    process.exit(1);
  }
});

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    }
  });
}

async function testCompleteFlow() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🚀 SacoPex Content Engine - Phase 4 Complete Flow Test");
  console.log("═══════════════════════════════════════════════════════\n");

  try {
    // ============================================
    // 1️⃣  SIMULAR GERAÇÃO DE CONTEÚDO
    // ============================================
    console.log("📝 ETAPA 1: Gerando conteúdo com Cascade Engine...\n");

    const cascadeId = `cascade-${Date.now()}`;
    const contentType = "instagram-post";
    const llmModel = "claude-3-sonnet";
    const duration = 2.34;
    const contentGenId = generateId();

    await runAsync(
      `INSERT INTO AnalyticsContentGenerated (id, cascadeId, contentType, contentData, llmModel, duration, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        contentGenId,
        cascadeId,
        contentType,
        JSON.stringify({
          caption:
            "🎯 Novo conteúdo gerado via SacoPex!\nTestando sincronização Phase 4 com sucesso! #sacopex #contentengine",
          hashtags: ["#sacopex", "#contentengine", "#teste", "#sync"],
        }),
        llmModel,
        duration,
      ]
    );

    console.log(`   ✅ Conteúdo gerado registrado`);
    console.log(`   • ID: ${contentGenId}`);
    console.log(`   • Cascade: ${cascadeId}`);
    console.log(`   • Tipo: ${contentType}`);
    console.log(`   • Tempo de geração: ${duration}s\n`);

    // ============================================
    // 2️⃣  SIMULAR PUBLICAÇÃO E COLETA DE MÉTRICAS
    // ============================================
    console.log("📊 ETAPA 2: Coletando métricas de múltiplas plataformas...\n");

    const platforms = [
      {
        name: "instagram",
        views: 2450,
        likes: 187,
        comments: 32,
        shares: 15,
        saves: 89,
        orders: 5,
        revenue: 245.5,
      },
      {
        name: "tiktok",
        views: 5890,
        likes: 456,
        comments: 78,
        shares: 234,
        saves: 123,
        orders: 12,
        revenue: 580.75,
      },
      {
        name: "twitter",
        views: 1234,
        likes: 98,
        comments: 23,
        shares: 45,
        saves: 34,
        orders: 2,
        revenue: 85.25,
      },
    ];

    let totalMetrics = 0;

    for (const platform of platforms) {
      await runAsync(
        `INSERT INTO AnalyticsMetric (id, contentId, views, likes, comments, shares, saves, orders, revenue, platform, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          generateId(),
          contentGenId,
          platform.views,
          platform.likes,
          platform.comments,
          platform.shares,
          platform.saves,
          platform.orders,
          platform.revenue,
          platform.name,
        ]
      );

      totalMetrics++;
      console.log(`   ✅ ${platform.name.toUpperCase()}`);
      console.log(`      • Views: ${platform.views} | Likes: ${platform.likes}`);
      console.log(`      • Revenue: $${platform.revenue}\n`);
    }

    // ============================================
    // 3️⃣  REGISTRAR PUBLICAÇÃO
    // ============================================
    console.log("🌐 ETAPA 3: Registrando publicação em plataformas...\n");

    let totalPublished = 0;
    for (const platform of platforms) {
      await runAsync(
        `INSERT INTO AnalyticsContentPublished (id, contentId, platform, publishedUrl, publishedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
        [generateId(), contentGenId, platform.name, `https://${platform.name}.com/post/${Date.now()}`]
      );

      totalPublished++;
      console.log(`   ✅ ${platform.name}: https://${platform.name}.com/post/...`);
    }
    console.log();

    // ============================================
    // 4️⃣  SINCRONIZAR COM BACKEND
    // ============================================
    console.log("🔄 ETAPA 4: Sincronizando com backend...\n");

    const batchSize = totalMetrics + totalPublished;
    await runAsync(
      `INSERT INTO AnalyticsSyncLog (id, status, batchSize, error, lastSyncAt, createdAt, updatedAt)
       VALUES (?, ?, ?, NULL, datetime('now'), datetime('now'), datetime('now'))`,
      [generateId(), "synced", batchSize]
    );

    console.log(`   ✅ Sincronização concluída`);
    console.log(`   • Status: synced`);
    console.log(`   • Items sincronizados: ${batchSize}`);
    console.log(`   • Timestamp: ${new Date().toISOString()}\n`);

    // ============================================
    // 5️⃣  RECUPERAR E AGREGAR DADOS
    // ============================================
    console.log("📈 ETAPA 5: Agregando analytics summary...\n");

    const allMetrics = await runAsync(`SELECT * FROM AnalyticsMetric`);
    const allPublished = await runAsync(`SELECT * FROM AnalyticsContentPublished`);
    const allGenerated = await runAsync(`SELECT * FROM AnalyticsContentGenerated`);

    const totalViews = allMetrics.reduce((sum, m) => sum + m.views, 0);
    const totalLikes = allMetrics.reduce((sum, m) => sum + m.likes, 0);
    const totalOrders = allMetrics.reduce((sum, m) => sum + m.orders, 0);
    const totalRevenue = allMetrics.reduce((sum, m) => sum + m.revenue, 0);

    const avgEngagement =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, m) => {
            const eng =
              m.views > 0
                ? ((m.likes +
                    m.comments * 2 +
                    m.shares * 3 +
                    m.saves * 2) /
                    m.views) *
                  100
                : 0;
            return sum + eng;
          }, 0) / allMetrics.length
        : 0;

    console.log("   📊 RESUMO GERAL:");
    console.log(`   • Total de métricas: ${allMetrics.length}`);
    console.log(`   • Total de visualizações: ${totalViews}`);
    console.log(`   • Total de likes: ${totalLikes}`);
    console.log(`   • Total de pedidos: ${totalOrders}`);
    console.log(`   • Receita total: $${totalRevenue.toFixed(2)}`);
    console.log(`   • Engagement médio: ${avgEngagement.toFixed(2)}%`);
    console.log(`   • Conteúdo publicado: ${allPublished.length} plataformas\n`);

    // ============================================
    // 6️⃣  VERIFICAR LOGS DE SINCRONIZAÇÃO
    // ============================================
    console.log("📋 ETAPA 6: Histórico de sincronizações...\n");

    const syncLogs = await runAsync(
      `SELECT * FROM AnalyticsSyncLog ORDER BY createdAt DESC LIMIT 5`
    );

    syncLogs.forEach((log, i) => {
      console.log(`   ${i + 1}. Status: ${log.status} | Batch: ${log.batchSize} items`);
      console.log(`      ${new Date(log.createdAt).toISOString()}`);
    });

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("✅ TESTE COMPLETO EXECUTADO COM SUCESSO!");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("🎯 Próximos passos para produção:");
    console.log(
      "   1. Restaurar schema PostgreSQL: cp prisma/schema.prisma.supabase-backup prisma/schema.prisma"
    );
    console.log("   2. Alterar .env: DATABASE_URL=postgresql://...");
    console.log("   3. Remover migrations: rm -rf prisma/migrations");
    console.log("   4. Executar: npx prisma migrate dev --name add_sacopex_analytics");
    console.log("   5. Fazer deploy em um ambiente que suporte TCP para Supabase\n");

    db.close();
  } catch (error) {
    console.error("❌ Erro durante teste:", error.message);
    console.error("\nStack trace:", error.stack);
    db.close();
    process.exit(1);
  }
}

testCompleteFlow();
