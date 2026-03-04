import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

// Predefined safe diagnostic commands that return system info
// without executing arbitrary code
const diagnosticCommands: Record<string, () => unknown> = {
  health: () => ({
    status: "healthy",
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  }),
  uptime: () => ({
    uptimeSeconds: process.uptime(),
    uptimeFormatted: `${Math.floor(process.uptime() / 3600)}h ${Math.floor(
      (process.uptime() % 3600) / 60
    )}m ${Math.floor(process.uptime() % 60)}s`,
  }),
  memory: () => {
    const mem = process.memoryUsage();
    return {
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
    };
  },
  env: () => ({
    nodeEnv: process.env.NODE_ENV || "not set",
    hasDatabase: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
  }),
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

    const normalizedCommand = String(command).toLowerCase().trim();
    const handler = diagnosticCommands[normalizedCommand];

    if (!handler) {
      return NextResponse.json(
        {
          error: `Unknown diagnostic command: "${normalizedCommand}"`,
          availableCommands: Object.keys(diagnosticCommands),
        },
        { status: 400 }
      );
    }

    const result = handler();

    return NextResponse.json({
      command: normalizedCommand,
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
