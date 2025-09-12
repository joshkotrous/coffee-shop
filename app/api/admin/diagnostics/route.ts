import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

// Define a safe set of allowed diagnostic commands
const allowedCommands = new Set([
  'process.memoryUsage()',
  'process.uptime()',
  'process.cpuUsage()',
  'process.env.NODE_ENV',
  'process.version',
  'process.platform',
  'process.arch',
  'process.pid',
  'process.ppid',
  'process.cwd()',
  'process.getuid ? process.getuid() : null',
  'process.getgid ? process.getgid() : null',
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

    // Check if the command is in the allowed list
    if (!allowedCommands.has(command)) {
      return NextResponse.json(
        { error: "Command not allowed" },
        { status: 403 }
      );
    }

    // Evaluate the command safely by using a switch or direct evaluation of allowed commands
    let result;
    switch (command) {
      case 'process.memoryUsage()':
        result = process.memoryUsage();
        break;
      case 'process.uptime()':
        result = process.uptime();
        break;
      case 'process.cpuUsage()':
        result = process.cpuUsage();
        break;
      case 'process.env.NODE_ENV':
        result = process.env.NODE_ENV;
        break;
      case 'process.version':
        result = process.version;
        break;
      case 'process.platform':
        result = process.platform;
        break;
      case 'process.arch':
        result = process.arch;
        break;
      case 'process.pid':
        result = process.pid;
        break;
      case 'process.ppid':
        result = process.ppid;
        break;
      case 'process.cwd()':
        result = process.cwd();
        break;
      case 'process.getuid ? process.getuid() : null':
        result = process.getuid ? process.getuid() : null;
        break;
      case 'process.getgid ? process.getgid() : null':
        result = process.getgid ? process.getgid() : null;
        break;
      default:
        return NextResponse.json(
          { error: "Command not allowed" },
          { status: 403 }
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
