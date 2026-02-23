import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { command } = await request.json();

    if (!command) {
      return NextResponse.json(
        { error: "Command parameter required" },
        { status: 400 }
      );
    }

    // SECURITY FIX: Removed dangerous eval() function
    // eval() allows arbitrary code execution which is a critical security vulnerability
    // Instead, return a safe diagnostic response that doesn't expose sensitive information
    // or allow arbitrary code execution
    
    return NextResponse.json(
      { 
        error: "Arbitrary command execution is not supported. Use specific diagnostic endpoints instead.",
        availableCommands: [
          "GET /api/admin/health - Server health status",
          "GET /api/admin/version - Application version",
          "GET /api/admin/system - Safe system diagnostics"
        ]
      },
      { status: 400 }
    );
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
