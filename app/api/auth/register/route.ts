import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
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

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    
    // Prevent account enumeration by returning the same response regardless of account existence
    const genericMessage = "If this email is not already registered, you will receive a confirmation email";
    
    if (existingUser.rows.length > 0) {
      // Account already exists - return generic success message without creating duplicate
      return NextResponse.json({
        message: genericMessage,
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const result = await query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, "user"]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    const response = NextResponse.json({
      message: genericMessage,
    });

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
