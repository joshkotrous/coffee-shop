import { NextRequest, NextResponse } from "next/server";
import pool from '@/lib/db';
import * as bcrypt from 'bcrypt';

// Strict email validation regex - RFC 5322 compliant with security restrictions
// Only allows alphanumeric, dots, hyphens, underscores, and @ symbol
// Explicitly rejects HTML special characters
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const INVALID_CHARS_REGEX = /[<>'"`;\/\\]/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Validate email format and reject emails with dangerous characters
    const trimmedEmail = email.trim();
    
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (INVALID_CHARS_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const checkResult = await pool.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [trimmedEmail, passwordHash, 'user']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    const response = NextResponse.json({
      message: "Registration successful",
      user: { id: user.id, email: user.email, role: user.role },
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
