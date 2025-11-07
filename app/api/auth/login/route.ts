import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "@/lib/auth";
import {
  checkLoginRateLimit,
  handleFailedLogin,
  handleSuccessfulLogin,
  getProgressiveDelay,
} from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Get client IP address
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "unknown";

    // Check rate limiting
    const rateLimitCheck = await checkLoginRateLimit(ip, email);
    if (!rateLimitCheck.allowed) {
      const retryAfterSeconds = Math.ceil(
        (rateLimitCheck.retryAfterMs || 0) / 1000
      );
      return NextResponse.json(
        { error: rateLimitCheck.reason || "Too many login attempts" },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
          },
        }
      );
    }

    // Authenticate user
    const user = await authenticateUser(email, password);

    if (!user) {
      // Handle failed login
      const emailAttempts = await getProgressiveDelay(0);
      await handleFailedLogin(ip, email);

      // Get progressive delay based on attempts
      const retries = await checkLoginRateLimit(ip, email);
      if (retries.allowed) {
        // Still have attempts left, calculate progressive delay
        // For now, respond immediately but track the attempt
      }

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Handle successful login
    await handleSuccessfulLogin(ip, email);

    const token = generateToken(user);

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
