// Rate Limiting Middleware (In-Memory Implementation)
import { NextRequest } from 'next/server';
import { getClientIp } from '../auth/middleware';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for incoming request
 * @param request - Next.js request object
 * @param limit - Maximum requests allowed in window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 10 seconds)
 * @returns RateLimitResult
 */
export function checkRateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 10000
): RateLimitResult {
  const ip = getClientIp(request);
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // No record or window expired - create new
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  // Limit exceeded
  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  // Increment count
  record.count++;

  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetTime,
  };
}
