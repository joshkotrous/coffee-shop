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

    // Remove use of eval to prevent arbitrary code execution
    // Instead, return an error indicating that this operation is not supported
    return NextResponse.json(
      { error: "Execution of arbitrary commands is disabled for security reasons" },
      { status: 403 }
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
