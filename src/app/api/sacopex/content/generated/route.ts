import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cascadeId = searchParams.get('cascadeId');
    const limit = searchParams.get('limit') || '100';

    let content;
    if (cascadeId) {
      content = await prisma.analyticsContentGenerated.findMany({
        where: { cascadeId },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      content = await prisma.analyticsContentGenerated.findMany({
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
      });
    }

    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching generated content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generated content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cascadeId, contentType, contentData, llmModel, duration } = body;

    if (!cascadeId) {
      return NextResponse.json(
        { success: false, error: 'cascadeId is required' },
        { status: 400 }
      );
    }

    const content = await prisma.analyticsContentGenerated.create({
      data: {
        cascadeId,
        contentType: contentType || 'post',
        contentData: contentData || '',
        llmModel: llmModel || 'claude-3-sonnet',
        duration: duration || 0,
      },
    });

    return NextResponse.json({ success: true, data: content }, { status: 201 });
  } catch (error) {
    console.error('Error creating generated content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create generated content' },
      { status: 500 }
    );
  }
}
