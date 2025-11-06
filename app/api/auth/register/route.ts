import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existingUser.rows.length > 0) {
      // Return the same generic response to prevent user enumeration
      return NextResponse.json(
        {
          message:
            "If this email is registered, you will receive a confirmation link. Please check your inbox.",
        },
        { status: 200 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    await query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)",
      [email, hashedPassword, "user"]
    );

    // Return generic success message without user details
    return NextResponse.json(
      {
        message:
          "If this email is registered, you will receive a confirmation link. Please check your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    // Return generic error message to avoid leaking information
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again later." },
      { status: 400 }
    );
  }
}
