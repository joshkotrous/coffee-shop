import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import * as os from "os";

const ALLOWED_DIAGNOSTICS: Record<string, () => unknown> = {
  "server-health": () => ({
    status: "healthy",
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  }),
  "memory-usage": () => {
    const mem = process.memoryUsage();
    return {
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
    };
  },
  "system-info": () => ({
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    loadAverage: os.loadavg(),
  }),
  "env-check": () => ({
    nodeEnv: process.env.NODE_ENV || "not set",
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  }),
};

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { command } = await request.json();

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        { error: "Command parameter required" },
        { status: 400 }
      );
    }

    const diagnosticFn = ALLOWED_DIAGNOSTICS[command];

    if (!diagnosticFn) {
      return NextResponse.json(
        {
          error: "Unknown diagnostic command",
          allowedCommands: Object.keys(ALLOWED_DIAGNOSTICS),
        },
        { status: 400 }
      );
    }

    const result = diagnosticFn();

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
