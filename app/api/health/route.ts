// Health Check API Route

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n/client';

export async function GET() {
  try {
    const n8nHealthy = await n8nClient.healthCheck();

    return NextResponse.json({
      status: 'ok',
      n8nConnection: n8nHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        n8nConnection: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
