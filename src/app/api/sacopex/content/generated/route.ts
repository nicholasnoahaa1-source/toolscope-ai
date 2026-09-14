import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cascadeId = searchParams.get('cascadeId');
    const limit = searchParams.get('limit') || '100';

    let content;
    if (cascadeId) {
      content = await prisma.analyticsContentGenerated.findMany({
        where: { cascadeId },
        orderBy: { generatedAt: 'desc' },
      });
    } else {
      content = await prisma.analyticsContentGenerated.findMany({
        orderBy: { generatedAt: 'desc' },
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
    const { contentId, contentType, cascadeId, hookType, metadata } = body;

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: 'contentId is required' },
        { status: 400 }
      );
    }

    const content = await prisma.analyticsContentGenerated.create({
      data: {
        contentId,
        contentType,
        cascadeId,
        hookType,
        metadata,
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
