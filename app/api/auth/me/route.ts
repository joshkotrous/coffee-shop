import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/middleware";
import { checkRateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";

// Rate limiting configuration
// For GET /api/auth/me: 30 requests per 15 minutes per IP
// This is strict to prevent enumeration and brute-force attacks on user info
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per 15 minutes (2 per minute average)

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit
    const { allowed, retryAfter } = checkRateLimit(
      clientIp,
      RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_WINDOW
    );

    if (!allowed) {
      // Return 429 Too Many Requests with Retry-After header
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
