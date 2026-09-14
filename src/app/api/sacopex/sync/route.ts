import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const syncLogs = await prisma.analyticsSyncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ success: true, data: syncLogs });
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sync logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, batchSize, error } = body;

    const syncLog = await prisma.analyticsSyncLog.create({
      data: {
        status: status || 'pending',
        batchSize: batchSize || 0,
        error,
        lastSyncAt: status === 'synced' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: syncLog }, { status: 201 });
  } catch (error) {
    console.error('Error creating sync log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sync log' },
      { status: 500 }
    );
  }
}
