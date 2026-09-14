import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const platform = searchParams.get('platform');
    const limit = searchParams.get('limit') || '100';

    const where: any = {};
    if (contentId) where.contentId = contentId;
    if (platform) where.platform = platform;

    const content = await prisma.analyticsContentPublished.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { publishedAt: 'desc' },
      take: parseInt(limit),
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching published content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch published content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, platform, publishedUrl } = body;

    if (!contentId || !platform) {
      return NextResponse.json(
        { success: false, error: 'contentId and platform are required' },
        { status: 400 }
      );
    }

    const content = await prisma.analyticsContentPublished.create({
      data: {
        contentId,
        platform,
        publishedUrl,
      },
    });

    return NextResponse.json({ success: true, data: content }, { status: 201 });
  } catch (error) {
    console.error('Error creating published content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create published content' },
      { status: 500 }
    );
  }
}
