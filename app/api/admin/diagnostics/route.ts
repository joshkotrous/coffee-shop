import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

// A safe evaluator for simple arithmetic expressions only
function safeEval(expression: string) {
  // Allow only digits, operators, parentheses, spaces
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    throw new Error("Invalid characters in command");
  }

  // Evaluate using Function constructor in a safe way
  // This avoids eval and limits to arithmetic expressions
  try {
    // eslint-disable-next-line no-new-func
    const func = new Function(`return (${expression})`);
    return func();
  } catch {
    throw new Error("Invalid expression");
  }
}

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

    // Use safeEval instead of eval to prevent arbitrary code execution
    const result = safeEval(command);

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
    if (error instanceof Error && (error.message === "Invalid characters in command" || error.message === "Invalid expression")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Diagnostics error:", error);
    return NextResponse.json(
      { error: "Diagnostic command failed" },
      { status: 500 }
    );
  }
}
