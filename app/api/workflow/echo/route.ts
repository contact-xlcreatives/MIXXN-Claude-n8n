// Echo Workflow API Route

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n/client';
import { echoRequestSchema } from '@/lib/validation/schemas';
import type { EchoRequest, EchoResponse } from '@/lib/n8n/types';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = echoRequestSchema.parse(body);

    // Execute n8n workflow
    const result = await n8nClient.executeWorkflow<EchoRequest, EchoResponse>(
      'echo-working',
      validatedData
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    // Validation error
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Other errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
