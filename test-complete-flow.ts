import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCompleteFlow() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🚀 SacoPex Content Engine - Phase 4 Complete Flow Test");
  console.log("═══════════════════════════════════════════════════════\n");

  try {
    // ============================================
    // 1️⃣  SIMULAR GERAÇÃO DE CONTEÚDO (Cascade Engine)
    // ============================================
    console.log("📝 ETAPA 1: Gerando conteúdo com Cascade Engine...\n");

    const cascadeId = `cascade-${Date.now()}`;
    const generatedContent = {
      cascadeId,
      contentType: "instagram-post",
      contentData: JSON.stringify({
        caption:
          "🎯 Novo conteúdo gerado via SacoPex!\nTestando sincronização Phase 4 com sucesso! #sacopex #contentengine",
        hashtags: ["#sacopex", "#contentengine", "#teste", "#sync"],
        imageUrl: "https://via.placeholder.com/1080x1350",
      }),
      llmModel: "claude-3-sonnet",
      duration: 2.34,
    };

    const contentGen = await prisma.analyticsContentGenerated.create({
      data: generatedContent,
    });

    console.log(`   ✅ Conteúdo gerado registrado`);
    console.log(`   • ID: ${contentGen.id}`);
    console.log(`   • Cascade: ${contentGen.cascadeId}`);
    console.log(`   • Tipo: ${contentGen.contentType}`);
    console.log(`   • Tempo de geração: ${contentGen.duration}s\n`);

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

    const metricsCreated = [];

    for (const platform of platforms) {
      const metric = await prisma.analyticsMetric.create({
        data: {
          contentId: contentGen.id,
          views: platform.views,
          likes: platform.likes,
          comments: platform.comments,
          shares: platform.shares,
          saves: platform.saves,
          orders: platform.orders,
          revenue: platform.revenue,
          platform: platform.name,
        },
      });

      metricsCreated.push(metric);
      console.log(`   ✅ ${platform.name.toUpperCase()}`);
      console.log(`      • Views: ${platform.views} | Likes: ${platform.likes}`);
      console.log(`      • Revenue: $${platform.revenue}\n`);
    }

    // ============================================
    // 3️⃣  REGISTRAR PUBLICAÇÃO
    // ============================================
    console.log("🌐 ETAPA 3: Registrando publicação em plataformas...\n");

    const publications = [];
    for (const platform of platforms) {
      const published = await prisma.analyticsContentPublished.create({
        data: {
          contentId: contentGen.id,
          platform: platform.name,
          publishedUrl: `https://${platform.name}.com/post/${Date.now()}`,
        },
      });

      publications.push(published);
      console.log(`   ✅ ${platform.name}: ${published.publishedUrl}`);
    }
    console.log();

    // ============================================
    // 4️⃣  SINCRONIZAR COM BACKEND
    // ============================================
    console.log("🔄 ETAPA 4: Sincronizando com backend...\n");

    const syncLog = await prisma.analyticsSyncLog.create({
      data: {
        status: "synced",
        batchSize: metricsCreated.length + publications.length,
        error: null,
        lastSyncAt: new Date(),
      },
    });

    console.log(`   ✅ Sincronização concluída`);
    console.log(`   • Status: ${syncLog.status}`);
    console.log(`   • Items sincronizados: ${syncLog.batchSize}`);
    console.log(
      `   • Timestamp: ${syncLog.lastSyncAt?.toISOString()}\n`
    );

    // ============================================
    // 5️⃣  RECUPERAR E AGREGAR DADOS
    // ============================================
    console.log("📈 ETAPA 5: Agregando analytics summary...\n");

    const allMetrics = await prisma.analyticsMetric.findMany();
    const allPublished = await prisma.analyticsContentPublished.findMany();
    const allGenerated = await prisma.analyticsContentGenerated.findMany();

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

    const syncLogs = await prisma.analyticsSyncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    syncLogs.forEach((log, i) => {
      console.log(`   ${i + 1}. Status: ${log.status} | Batch: ${log.batchSize} items`);
      console.log(`      ${log.createdAt.toISOString()}`);
    });

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("✅ TESTE COMPLETO EXECUTADO COM SUCESSO!");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("🎯 Próximos passos para produção:");
    console.log(
      "   1. Atualizar prisma/schema.prisma para PostgreSQL (backup em prisma/schema.prisma.supabase-backup)"
    );
    console.log("   2. Alterar DATABASE_URL em .env para sua URL do Supabase");
    console.log("   3. Executar: npx prisma migrate deploy");
    console.log("   4. Fazer deploy do Next.js em Vercel ou seu servidor\n");
  } catch (error) {
    console.error("❌ Erro durante teste:", (error as Error).message);
    console.error("\nStack trace:", (error as Error).stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFlow();
