type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: Date;
};

const buckets = new Map<string, RateLimitBucket>();

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = buckets.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(identifier, { count: 1, resetAt });

    return {
      success: true,
      remaining: Math.max(maxRequests - 1, 0),
      resetAt: new Date(resetAt),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(existing.resetAt),
    };
  }

  existing.count += 1;
  buckets.set(identifier, existing);

  return {
    success: true,
    remaining: Math.max(maxRequests - existing.count, 0),
    resetAt: new Date(existing.resetAt),
  };
}
