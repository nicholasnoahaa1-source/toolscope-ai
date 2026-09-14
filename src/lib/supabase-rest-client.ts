// Supabase REST API Client (PostgREST)
// Funciona através de proxy que não suporta TCP direto

const SUPABASE_PROJECT = 'dpvavzehqfpytectomol';
const SUPABASE_URL = `https://${SUPABASE_PROJECT}.supabase.co`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdmF2emVocWZweXRlY3RvbW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDA5OTAsImV4cCI6MjA1NTExNjk5MH0.vOZWqI8d_ZCJZ8v8QQR_KqF4QXwJLvM8yJ5K8xY_L0U';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

async function callSupabaseAPI<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export const supabaseRestClient = {
  // Metrics
  getMetrics: async (contentId?: string, limit = 100) => {
    let query = `?limit=${limit}`;
    if (contentId) {
      query += `&contentId=eq.${contentId}`;
    }
    return callSupabaseAPI(`/AnalyticsMetric${query}`, { method: 'GET' });
  },

  postMetric: async (metric: any) => {
    return callSupabaseAPI('/AnalyticsMetric', {
      method: 'POST',
      body: metric,
    });
  },

  // Content Generated
  getContentGenerated: async (cascadeId?: string) => {
    let query = '';
    if (cascadeId) {
      query = `?cascadeId=eq.${cascadeId}`;
    }
    return callSupabaseAPI(`/AnalyticsContentGenerated${query}`, { method: 'GET' });
  },

  postContentGenerated: async (content: any) => {
    return callSupabaseAPI('/AnalyticsContentGenerated', {
      method: 'POST',
      body: content,
    });
  },

  // Content Published
  getContentPublished: async (contentId?: string, platform?: string) => {
    let query = '';
    const params = [];
    if (contentId) params.push(`contentId=eq.${contentId}`);
    if (platform) params.push(`platform=eq.${platform}`);
    if (params.length > 0) {
      query = `?${params.join('&')}`;
    }
    return callSupabaseAPI(`/AnalyticsContentPublished${query}`, { method: 'GET' });
  },

  postContentPublished: async (content: any) => {
    return callSupabaseAPI('/AnalyticsContentPublished', {
      method: 'POST',
      body: content,
    });
  },

  // Sync Logs
  getSyncLogs: async (limit = 10) => {
    return callSupabaseAPI(`/AnalyticsSyncLog?order=createdAt.desc&limit=${limit}`, {
      method: 'GET',
    });
  },

  postSyncLog: async (status: string, batchSize: number, error?: string) => {
    return callSupabaseAPI('/AnalyticsSyncLog', {
      method: 'POST',
      body: {
        status,
        batchSize,
        error,
        lastSyncAt: status === 'synced' ? new Date().toISOString() : null,
      },
    });
  },

  // Analytics Summary (agregação client-side das métricas)
  getAnalyticsSummary: async () => {
    const metrics = await callSupabaseAPI<any[]>('/AnalyticsMetric', { method: 'GET' });
    const generated = await callSupabaseAPI<any[]>('/AnalyticsContentGenerated', { method: 'GET' });
    const published = await callSupabaseAPI<any[]>('/AnalyticsContentPublished', { method: 'GET' });

    const totalViews = metrics.reduce((sum, m) => sum + (m.views || 0), 0);
    const totalOrders = metrics.reduce((sum, m) => sum + (m.orders || 0), 0);
    const totalRevenue = metrics.reduce((sum, m) => sum + (m.revenue || 0), 0);

    const avgEngagement =
      metrics.length > 0
        ? metrics.reduce((sum, m) => {
            const eng =
              m.views > 0
                ? ((m.likes + m.comments * 2 + m.shares * 3 + m.saves * 2) / m.views) * 100
                : 0;
            return sum + eng;
          }, 0) / metrics.length
        : 0;

    return {
      summary: {
        totalMetrics: metrics.length,
        totalViews,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        avgEngagement: parseFloat(avgEngagement.toFixed(2)),
        totalContentGenerated: generated.length,
        totalContentPublished: published.length,
        timestamp: new Date().toISOString(),
      },
      metrics,
      generated,
      published,
    };
  },
};
