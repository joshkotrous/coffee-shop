import { NextRequest, NextResponse } from "next/server";
import { blacklistToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the token from the cookie
    const token = request.cookies.get("token")?.value;

    // If a token exists, blacklist it
    if (token) {
      await blacklistToken(token);
    }

    const response = NextResponse.json({ message: "Logout successful" });

    response.cookies.set("token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
