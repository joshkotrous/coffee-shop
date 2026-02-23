import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

// Allowlist of safe diagnostic commands
const ALLOWED_COMMANDS = ["health", "version", "status"];

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

    // Input validation: ensure command is a string
    if (typeof command !== "string") {
      return NextResponse.json(
        { error: "Command must be a string" },
        { status: 400 }
      );
    }

    // Whitelist validation: only allow specific commands
    if (!ALLOWED_COMMANDS.includes(command.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid command" },
        { status: 400 }
      );
    }

    let result: string;

    // Command dispatch: handle only safe operations
    switch (command.toLowerCase()) {
      case "health":
        result = "ok";
        break;
      case "version":
        result = "1.0.0";
        break;
      case "status":
        result = "running";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid command" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      command: command,
      result: result,
      timestamp: new Date().toISOString(),
    });
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
