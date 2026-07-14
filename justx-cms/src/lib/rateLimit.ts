/**
 * Lightweight in-memory rate limiter.
 *
 * The spec explicitly excludes Redis, and this app runs as a single Node
 * process under PM2 (no horizontal scaling planned for v1), so an in-memory
 * fixed-window counter is sufficient and keeps memory usage negligible.
 * If the app is later scaled to multiple instances, swap this module for a
 * shared-store implementation without changing call sites.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so this map never grows unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60_000).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, bucket);
    return { allowed: true, remaining: limit - 1, resetAt: bucket.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") || "unknown";
}
