import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { getClientIP, checkIPRateLimit, checkEmailRateLimit, recordEmailRegistration } from "@/lib/rateLimit";

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

    // Get client IP for rate limiting
    const clientIP = getClientIP(request.headers);

    // Check IP-based rate limit
    const ipRateLimit = checkIPRateLimit(clientIP);
    if (!ipRateLimit.allowed) {
      const response = NextResponse.json(
        { 
          error: "Too many registration attempts from this IP. Please try again later.",
          retryAfter: ipRateLimit.retryAfter
        },
        { status: 429 }
      );
      
      // Add rate limiting headers
      response.headers.set("X-RateLimit-Limit", "5");
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", ipRateLimit.resetTime.toString());
      response.headers.set("Retry-After", ipRateLimit.retryAfter.toString());
      
      return response;
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existingUser.rows.length > 0) {
      // Record this attempt against the email for enumeration prevention
      checkEmailRateLimit(email);
      
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Check email-based rate limit (after checking if user exists)
    const emailRateLimit = checkEmailRateLimit(email);
    if (!emailRateLimit.allowed) {
      const response = NextResponse.json(
        { 
          error: "Too many registration attempts for this email. Please try again later.",
          retryAfter: emailRateLimit.retryAfter
        },
        { status: 429 }
      );
      
      // Add rate limiting headers
      response.headers.set("X-RateLimit-Limit", "1");
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", emailRateLimit.resetTime.toString());
      response.headers.set("Retry-After", emailRateLimit.retryAfter.toString());
      
      return response;
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const result = await query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, "user"]
    );

    const user = result.rows[0];
    
    // Record successful registration for email-based rate limiting
    recordEmailRegistration(email);
    
    const token = generateToken(user);

    const response = NextResponse.json({
      message: "Registration successful",
      user: { id: user.id, email: user.email, role: user.role },
    });

    // Add rate limiting headers to successful response
    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", (5 - ipRateLimit.remaining - 1).toString());
    response.headers.set("X-RateLimit-Reset", ipRateLimit.resetTime.toString());

    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
