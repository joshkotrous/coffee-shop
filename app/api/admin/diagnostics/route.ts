import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

// Whitelist of allowed diagnostic commands
const ALLOWED_COMMANDS = ["health-check", "version", "memory-stats"];

// Safe diagnostic command handlers
const diagnosticHandlers: Record<string, () => any> = {
  "health-check": () => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  },
  "version": () => {
    return {
      nodeVersion: process.version,
      platform: process.platform,
    };
  },
  "memory-stats": () => {
    const mem = process.memoryUsage();
    return {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + " MB",
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + " MB",
      rss: Math.round(mem.rss / 1024 / 1024) + " MB",
    };
  },
};

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

    // Validate that the command is in the whitelist
    if (!ALLOWED_COMMANDS.includes(command)) {
      return NextResponse.json(
        {
          error: "Unknown command",
          allowedCommands: ALLOWED_COMMANDS,
        },
        { status: 400 }
      );
    }

    // Execute the whitelisted command safely
    const handler = diagnosticHandlers[command];
    const result = handler();

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
