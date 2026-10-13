/**
 * Lightweight, high-throughput in-memory sliding window rate limiter
 * and transactional idempotency store for Next.js App Router API handlers.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired keys every 60 seconds to avoid memory leak
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      if (record.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    });
  }, 60000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Check and record a rate limit hit.
 * @param identifier e.g. IP address or userId
 * @param limit max allowed hits per window
 * @param windowMs window duration in milliseconds (default: 60,000ms = 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);

  if (!existing || existing.resetAt <= now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(existing.resetAt / 1000),
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    reset: Math.ceil(existing.resetAt / 1000),
  };
}

/**
 * In-memory idempotency cache for sensitive financial operations
 * (e.g. M-Pesa STK push & order generation)
 */
interface IdempotencyRecord<T = any> {
  response: T;
  timestamp: number;
}

const idempotencyCache = new Map<string, IdempotencyRecord>();

export function getIdempotencyResult<T>(key: string, maxAgeMs: number = 60000): T | null {
  const record = idempotencyCache.get(key);
  if (!record) return null;
  if (Date.now() - record.timestamp > maxAgeMs) {
    idempotencyCache.delete(key);
    return null;
  }
  return record.response as T;
}

export function setIdempotencyResult<T>(key: string, response: T): void {
  idempotencyCache.set(key, {
    response,
    timestamp: Date.now(),
  });
}
