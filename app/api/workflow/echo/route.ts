// Echo Workflow API Route

import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n/client';
import { echoRequestSchema } from '@/lib/validation/schemas';
import type { EchoRequest, EchoResponse } from '@/lib/n8n/types';
import { validateApiKey } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/ratelimit/middleware';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { status: 401 }
      );
    }

    // 2. Rate limiting check
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          },
        }
      );
    }

    // 3. Payload size limit (1MB)
    const MAX_BODY_SIZE = 1024 * 1024;
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Payload too large - Maximum 1MB allowed' },
        { status: 413 }
      );
    }

    // 4. Parse and validate request body
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

    // Other errors - sanitize details in production
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred',
          // Only include error details in development
          ...(isDev && { details: error }),
        },
      },
      { status: 500 }
    );
  }
}
