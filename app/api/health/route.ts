// Health Check API Route

import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n/client';
import { validateApiKey } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { status: 401 }
      );
    }

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
