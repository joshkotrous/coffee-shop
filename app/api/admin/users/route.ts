import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    // Get all users with order count
    const result = await query(`
      SELECT u.id, u.email, u.role, u.created_at,
             COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json(result?.rows || []);
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
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch user data - select only non-sensitive fields
    const result = await pool.query(
      'SELECT id, email, role, created_at FROM users ORDER BY id'
    );

    const response = NextResponse.json(result.rows);

    // Add security headers to prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Prevent the API response from being embedded in iframes
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent browsers and proxies from caching sensitive user data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');

    // Enforce HTTPS for all future requests
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Restrict script execution to same-origin only
    response.headers.set('Content-Security-Policy', "default-src 'self'");

    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
