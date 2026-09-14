import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  try {
    const metrics = await prisma.analyticsMetric.findMany();
    const generated = await prisma.analyticsContentGenerated.findMany();
    const published = await prisma.analyticsContentPublished.findMany();

    // Calculate basic stats
    const totalViews = metrics.reduce((sum: number, m: any) => sum + (m.views || 0), 0);
    const totalOrders = metrics.reduce((sum: number, m: any) => sum + (m.orders || 0), 0);
    const totalRevenue = metrics.reduce((sum: number, m: any) => sum + (m.revenue || 0), 0);
    const avgEngagement =
      metrics.length > 0
        ? (
            metrics.reduce((sum: number, m: any) => {
              const eng =
                m.views > 0
                  ? (((m.likes || 0) + (m.comments || 0) * 2 + (m.shares || 0) * 3 + (m.saves || 0) * 2) /
                      m.views) *
                    100
                  : 0;
              return sum + eng;
            }, 0) / metrics.length
          ).toFixed(2)
        : '0';

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalMetrics: metrics.length,
          totalViews,
          totalOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          avgEngagement: parseFloat(avgEngagement as string),
          totalContentGenerated: generated.length,
          totalContentPublished: published.length,
          timestamp: new Date().toISOString(),
        },
        metrics,
        generated,
        published,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
