import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const limit = searchParams.get('limit') || '100';

    let metrics;
    if (contentId) {
      metrics = await prisma.analyticsMetric.findMany({
        where: { contentId },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      metrics = await prisma.analyticsMetric.findMany({
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
      });
    }

    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contentId,
      views = 0,
      likes = 0,
      comments = 0,
      shares = 0,
      saves = 0,
      orders = 0,
      revenue = 0,
      platform,
    } = body;

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: 'contentId is required' },
        { status: 400 }
      );
    }

    const metric = await prisma.analyticsMetric.create({
      data: {
        contentId,
        views,
        likes,
        comments,
        shares,
        saves,
        orders,
        revenue,
        platform,
      },
    });

    return NextResponse.json({ success: true, data: metric }, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}
