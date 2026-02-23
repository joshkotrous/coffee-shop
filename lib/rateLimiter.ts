diff --git a/lib/rateLimiter.ts b/lib/rateLimiter.ts
new file mode 100644
index 0000000..07ca2c0

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits
// Maps "user-id" to request count and reset time
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export interface RateLimitOptions {
  limit: number; // Max requests
  windowMs: number; // Time window in milliseconds
  keyGenerator?: (request: NextRequest) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request is within rate limits
 * Returns result object and headers to add to response
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  const keyGenerator =
    options.keyGenerator ||
    ((req: NextRequest) => {
      // Default: use IP address
      const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("cf-connecting-ip") ||
        "unknown";
      return ip;
    });

  const key = keyGenerator(request);
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + options.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  entry.count++;

  const allowed = entry.count <= options.limit;
  const remaining = Math.max(0, options.limit - entry.count);
  const resetTime = entry.resetTime;

  return {
    allowed,
    limit: options.limit,
    remaining,
    resetTime,
  };
}

/**
 * Middleware to enforce rate limiting
 * Returns a response with 429 status if limit exceeded
 */
export async function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = checkRateLimit(request, options);

    // Check if limit exceeded
    if (!result.allowed) {
      const response = NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", result.limit.toString());
      response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
      response.headers.set(
        "X-RateLimit-Reset",
        Math.ceil(result.resetTime / 1000).toString()
      );
      response.headers.set(
        "Retry-After",
        Math.ceil((result.resetTime - Date.now()) / 1000).toString()
      );

      return response;
    }

    // Process the request
    const response = await handler(request);

    // Add rate limit headers to successful response
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      Math.ceil(result.resetTime / 1000).toString()
    );

    return response;
  };
}

/**
 * Create a rate limiter with user-based key generation
 * Useful for authenticated endpoints
 */
export function createUserRateLimiter(userId: string) {
  return (request: NextRequest): string => {
    return `user-${userId}`;
  };
}