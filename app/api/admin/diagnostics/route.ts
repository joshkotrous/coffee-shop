import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

// Allowlist of safe diagnostic commands
const ALLOWED_COMMANDS: Record<string, () => unknown> = {
  'status': () => ({
    status: 'running',
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  }),
  'version': () => ({
    version: process.version,
    platform: process.platform,
  }),
  'timestamp': () => ({
    timestamp: new Date().toISOString(),
  }),
  'health': () => ({
    healthy: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }),
  'memory': () => {
    const used = process.memoryUsage();
    return {
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(used.external / 1024 / 1024)}MB`,
    };
  },
};

export async function POST(request: NextRequest) {
  try {
    const user = requireAdmin(request);

    const { command } = await request.json();

    if (!command) {
      return NextResponse.json(
        { error: "Command parameter required" },
        { status: 400 }
      );
    }

    // Validate command is in allowlist
    if (!ALLOWED_COMMANDS[command]) {
      console.warn(`[SECURITY] Admin user ${user.email} attempted to execute unknown diagnostic command: ${command}`);
      return NextResponse.json(
        { error: "Unknown command. Allowed commands: " + Object.keys(ALLOWED_COMMANDS).join(", ") },
        { status: 400 }
      );
    }

    // Execute the whitelisted command safely
    const result = ALLOWED_COMMANDS[command]();

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
