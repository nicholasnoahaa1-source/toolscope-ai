// ============================================
// ANALYTICS ENGINE - FASE 1B: PATTERN DETECTION
// ============================================

class AnalyticsEngine {
  constructor(db) {
    this.db = db;
  }

  async getAllMetrics() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('metrics-collected', 'readonly');
      const store = tx.objectStore('metrics-collected');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getContentMetadata() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['content-generated', 'content-published'], 'readonly');
      const generated = [];
      const published = [];

      const genRequest = tx.objectStore('content-generated').getAll();
      const pubRequest = tx.objectStore('content-published').getAll();

      let completed = 0;
      genRequest.onsuccess = () => {
        generated.push(...genRequest.result);
        if (++completed === 2) resolve({ generated, published });
      };
      pubRequest.onsuccess = () => {
        published.push(...pubRequest.result);
        if (++completed === 2) resolve({ generated, published });
      };

      tx.onerror = () => reject(tx.error);
    });
  }

  calculateEngagementScore(metrics) {
    const { views, likes, comments, shares, saves } = metrics;
    if (views === 0) return 0;
    return ((likes + comments * 2 + shares * 3 + saves * 2) / views * 100).toFixed(2);
  }

  calculateConversionRate(metrics) {
    const { views, orders } = metrics;
    if (views === 0) return 0;
    return ((orders / views) * 100).toFixed(2);
  }

  detectContentType(contentId) {
    const lower = contentId.toLowerCase();
    if (lower.includes('reel') || lower.includes('video')) return 'reel';
    if (lower.includes('story')) return 'story';
    if (lower.includes('carousel') || lower.includes('album')) return 'carousel';
    if (lower.includes('post')) return 'post';
    if (lower.includes('anuncio') || lower.includes('ad')) return 'ad';
    if (lower.includes('hook')) return 'hook';
    return 'unknown';
  }

  detectHookType(contentId) {
    const lower = contentId.toLowerCase();
    if (lower.includes('curiosidade') || lower.includes('curiosity')) return 'curiosidade';
    if (lower.includes('humor') || lower.includes('funny')) return 'humor';
    if (lower.includes('shock') || lower.includes('choque')) return 'shock';
    if (lower.includes('benefit') || lower.includes('benefício')) return 'benefício';
    if (lower.includes('unboxing')) return 'unboxing';
    if (lower.includes('tutorial')) return 'tutorial';
    if (lower.includes('mistake') || lower.includes('erro')) return 'erro';
    if (lower.includes('trending') || lower.includes('trend')) return 'trending';
    return 'genérico';
  }

  // ============================================
  // PATTERN ANALYSIS METHODS
  // ============================================

  async getHookPerformance() {
    const metrics = await this.getAllMetrics();
    const hookGroups = {};

    metrics.forEach(record => {
      const hookType = this.detectHookType(record.contentId);
      if (!hookGroups[hookType]) {
        hookGroups[hookType] = {
          hookType,
          count: 0,
          totalViews: 0,
          totalLikes: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pieces: []
        };
      }

      hookGroups[hookType].count += 1;
      hookGroups[hookType].totalViews += record.metrics.views;
      hookGroups[hookType].totalLikes += record.metrics.likes;
      hookGroups[hookType].totalOrders += record.metrics.orders;
      hookGroups[hookType].totalRevenue += record.metrics.revenue;
      hookGroups[hookType].pieces.push({
        contentId: record.contentId,
        views: record.metrics.views,
        engagement: this.calculateEngagementScore(record.metrics),
        conversionRate: this.calculateConversionRate(record.metrics)
      });
    });

    // Calculate averages and sort
    const results = Object.values(hookGroups)
      .map(group => ({
        ...group,
        avgViews: (group.totalViews / group.count).toFixed(0),
        avgEngagement: (group.totalLikes / group.count).toFixed(1),
        avgConversion: (group.totalOrders / group.count).toFixed(2),
        avgRevenue: (group.totalRevenue / group.count).toFixed(2)
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders);

    return results;
  }

  async getFormatPerformance() {
    const metrics = await this.getAllMetrics();
    const formatGroups = {};

    metrics.forEach(record => {
      const format = this.detectContentType(record.contentId);
      if (!formatGroups[format]) {
        formatGroups[format] = {
          format,
          count: 0,
          totalViews: 0,
          totalEngagement: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pieces: []
        };
      }

      const engagement = parseFloat(this.calculateEngagementScore(record.metrics));
      formatGroups[format].count += 1;
      formatGroups[format].totalViews += record.metrics.views;
      formatGroups[format].totalEngagement += engagement;
      formatGroups[format].totalOrders += record.metrics.orders;
      formatGroups[format].totalRevenue += record.metrics.revenue;
      formatGroups[format].pieces.push({
        contentId: record.contentId,
        views: record.metrics.views,
        engagement: engagement.toFixed(2),
        orders: record.metrics.orders
      });
    });

    const results = Object.values(formatGroups)
      .map(group => ({
        ...group,
        avgViews: (group.totalViews / group.count).toFixed(0),
        avgEngagement: (group.totalEngagement / group.count).toFixed(2),
        avgOrders: (group.totalOrders / group.count).toFixed(2),
        avgRevenue: (group.totalRevenue / group.count).toFixed(2),
        totalEngagementPct: ((group.totalEngagement / group.count) * 100).toFixed(1)
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    return results;
  }

  async getConversionDrivers() {
    const metrics = await this.getAllMetrics();

    // Separate high-converting vs low-converting
    const sorted = metrics
      .map(r => ({
        ...r,
        conversionRate: parseFloat(this.calculateConversionRate(r.metrics))
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);

    const topQuartile = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 4)));
    const bottomQuartile = sorted.slice(-Math.max(1, Math.ceil(sorted.length / 4)));

    // Analyze characteristics of top performers
    const topHooks = {};
    const topFormats = {};

    topQuartile.forEach(r => {
      const hook = this.detectHookType(r.contentId);
      const format = this.detectContentType(r.contentId);

      topHooks[hook] = (topHooks[hook] || 0) + 1;
      topFormats[format] = (topFormats[format] || 0) + 1;
    });

    return {
      topConverters: topQuartile.slice(0, 3).map(r => ({
        contentId: r.contentId,
        views: r.metrics.views,
        orders: r.metrics.orders,
        conversionRate: r.conversionRate.toFixed(2),
        revenue: r.metrics.revenue.toFixed(2),
        hook: this.detectHookType(r.contentId),
        format: this.detectContentType(r.contentId)
      })),
      lowConverters: bottomQuartile.slice(0, 3).map(r => ({
        contentId: r.contentId,
        views: r.metrics.views,
        orders: r.metrics.orders,
        conversionRate: r.conversionRate.toFixed(2),
        revenue: r.metrics.revenue.toFixed(2),
        hook: this.detectHookType(r.contentId),
        format: this.detectContentType(r.contentId)
      })),
      topHooks,
      topFormats,
      topHookType: Object.entries(topHooks).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
      topFormatType: Object.entries(topFormats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
    };
  }

  async getGenerationRecommendations() {
    const hookPerf = await this.getHookPerformance();
    const formatPerf = await this.getFormatPerformance();
    const drivers = await this.getConversionDrivers();

    const recommendations = [];

    // Hook-based recommendations
    if (hookPerf.length > 0) {
      const topHook = hookPerf[0];
      recommendations.push({
        type: 'hook',
        priority: 'high',
        title: `Priorizar Hook: ${topHook.hookType}`,
        insight: `O tipo de hook "${topHook.hookType}" gerou ${topHook.totalOrders} pedidos com taxa média de ${topHook.avgConversion}%. Replique esse padrão.`,
        metric: `${topHook.totalOrders} pedidos`,
        action: `Próxima cascata deve incluir ${Math.ceil(topHook.count * 1.5)} peças com hook "${topHook.hookType}"`
      });
    }

    // Format-based recommendations
    if (formatPerf.length > 0) {
      const topFormat = formatPerf[0];
      recommendations.push({
        type: 'format',
        priority: 'high',
        title: `Investir em: ${topFormat.format}`,
        insight: `${topFormat.format} tem engagement ${topFormat.avgEngagement}% com ${topFormat.count} peças. Maior potencial de virality.`,
        metric: `${topFormat.avgEngagement}% engagement`,
        action: `Aumentar proporção de "${topFormat.format}" em próximas gerações (alvo: 40% do output)`
      });
    }

    // Conversion optimization
    if (drivers.topConverters.length > 0) {
      const driver = drivers.topConverters[0];
      recommendations.push({
        type: 'conversion',
        priority: 'critical',
        title: `Padrão de Conversão Identificado`,
        insight: `Peça "${driver.contentId}" converteu ${driver.conversionRate}% com ${driver.orders} pedidos. Padrão: ${driver.hook} + ${driver.format}`,
        metric: `${driver.conversionRate}% conversion`,
        action: `Replicar combinação: hook="${driver.hook}" + format="${driver.format}"`
      });
    }

    // Negative patterns to avoid
    if (drivers.lowConverters.length > 0) {
      const antiPattern = drivers.lowConverters[0];
      recommendations.push({
        type: 'avoid',
        priority: 'medium',
        title: `Evitar Padrão Baixo`,
        insight: `Peça "${antiPattern.contentId}" teve ${antiPattern.conversionRate}% de conversão. Padrão: ${antiPattern.hook} + ${antiPattern.format}`,
        metric: `${antiPattern.conversionRate}% conversion (baixo)`,
        action: `Reduzir/eliminar combinação: hook="${antiPattern.hook}" + format="${antiPattern.format}"`
      });
    }

    // Best hook recommendation
    if (drivers.topHookType !== 'unknown') {
      recommendations.push({
        type: 'best-practice',
        priority: 'medium',
        title: `Hook com Melhor Performance: ${drivers.topHookType}`,
        insight: `Entre os top conversores, ${drivers.topHookType} apareceu em ${drivers.topHooks[drivers.topHookType]} peças.`,
        metric: `${drivers.topHooks[drivers.topHookType]} peças`,
        action: `Incluir mínimo 3-4 variações de "${drivers.topHookType}" em próxima cascata`
      });
    }

    return recommendations.sort((a, b) => {
      const priorityMap = { critical: 0, high: 1, medium: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }

  // Summary for integration with Cascade Engine
  async getSummary() {
    const hookPerf = await this.getHookPerformance();
    const formatPerf = await this.getFormatPerformance();
    const drivers = await this.getConversionDrivers();
    const recommendations = await this.getGenerationRecommendations();

    return {
      timestamp: new Date().toISOString(),
      totalPieces: hookPerf.reduce((sum, h) => sum + h.count, 0),
      topHook: hookPerf[0]?.hookType || 'unknown',
      topFormat: formatPerf[0]?.format || 'unknown',
      bestConverter: drivers.topConverters[0]?.contentId || 'unknown',
      recommendations
    };
  }
}
