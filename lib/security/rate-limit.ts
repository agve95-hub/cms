import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const cache = new LRUCache<string, RateLimitEntry>({ max: 10000, ttl: 15 * 60 * 1000 });

export const rateLimit = (limit: number, windowMs: number) => {
  return (req: NextRequest): NextResponse | null => {
    if (process.env.RATE_LIMIT_ENABLED === "false") return null;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();
    const entry = cache.get(key);

    if (!entry || now > entry.resetAt) {
      cache.set(key, { count: 1, resetAt: now + windowMs });
      return null;
    }

    if (entry.count >= limit) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
        { status: 429 }
      );
    }

    entry.count++;
    cache.set(key, entry);
    return null;
  };
};

export const authRateLimit = rateLimit(5, 15 * 60 * 1000);
export const apiRateLimit = rateLimit(200, 60 * 1000);
export const uploadRateLimit = rateLimit(20, 5 * 60 * 1000);
export const formRateLimit = rateLimit(10, 60 * 1000);
