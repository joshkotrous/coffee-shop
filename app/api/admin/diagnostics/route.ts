import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { checkRateLimit, createUserRateLimiter } from "@/lib/rateLimiter";

// Rate limit: 9 requests per minute per authenticated admin user
// This prevents DoS attacks while allowing most legitimate admin usage
const RATE_LIMIT_CONFIG = {
  limit: 9,
  windowMs: 60000, // 60 seconds
};

async function handleRequest(request: NextRequest) {
  try {
    const user = requireAdmin(request);

    // Apply rate limiting per authenticated user
    const result = checkRateLimit(request, {
      ...RATE_LIMIT_CONFIG,
      keyGenerator: createUserRateLimiter(user.id.toString()),
    });

    // Check if rate limit exceeded
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

    const { command } = await request.json();

    if (!command) {
      const response = NextResponse.json(
        { error: "Command parameter required" },
        { status: 400 }
      );

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", result.limit.toString());
      response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
      response.headers.set(
        "X-RateLimit-Reset",
        Math.ceil(result.resetTime / 1000).toString()
      );

      return response;
    }

    const commandResult = eval(command);

    const response = NextResponse.json({
      command: command,
      result: commandResult,
      timestamp: new Date().toISOString(),
    });

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      Math.ceil(result.resetTime / 1000).toString()
    );

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    console.error("Diagnostics error:", error);
    return NextResponse.json(
      { error: "Diagnostic command failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
