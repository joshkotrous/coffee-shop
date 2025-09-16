import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

// Define a whitelist of allowed commands for diagnostics
const allowedCommands = new Set([
  'Date.now()',
  'new Date().toISOString()',
  'process.env.NODE_ENV',
  'Math.random()',
  // Add other safe commands as needed
]);

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

    // Check if the command is in the whitelist
    if (!allowedCommands.has(command)) {
      return NextResponse.json(
        { error: "Command not allowed" },
        { status: 403 }
      );
    }

    // Instead of eval, safely execute the allowed command
    let result;
    switch (command) {
      case 'Date.now()':
        result = Date.now();
        break;
      case 'new Date().toISOString()':
        result = new Date().toISOString();
        break;
      case 'process.env.NODE_ENV':
        result = process.env.NODE_ENV;
        break;
      case 'Math.random()':
        result = Math.random();
        break;
      default:
        // This should never happen due to whitelist check
        return NextResponse.json(
          { error: "Command execution error" },
          { status: 500 }
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
