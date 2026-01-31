// API Authentication Middleware
import { NextRequest } from 'next/server';

/**
 * Validates API key from request headers
 * @param request - Next.js request object
 * @returns boolean - true if valid, false otherwise
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validKey = process.env.INTERNAL_API_KEY;

  if (!validKey) {
    throw new Error('INTERNAL_API_KEY not configured in environment variables');
  }

  return apiKey === validKey;
}

/**
 * Extracts client IP address from request
 * Handles various proxy headers
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return request.ip || '127.0.0.1';
}
