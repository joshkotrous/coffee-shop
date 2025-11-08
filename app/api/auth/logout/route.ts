import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP, createRateLimitedResponse, addRateLimitHeaders } from "@/lib/rate-limiter";

// Create rate limiter: 10 requests per minute per IP
const rateLimitChecker = rateLimit({ windowMs: 60000, maxRequests: 10 });

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimitChecker(request);
  
  if (!rateLimitResult?.allowed) {
    return createRateLimitedResponse(
      "Too many logout requests. Please try again later.",
      rateLimitResult?.resetTime || Date.now() + 60000
    );
  }

  const response = NextResponse.json({ message: "Logout successful" });

  // Set rate limit headers
  addRateLimitHeaders(
    response,
    10, // limit
    rateLimitResult.remaining,
    rateLimitResult.resetTime
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
