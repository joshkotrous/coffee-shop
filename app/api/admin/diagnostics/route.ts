import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware";

export async function POST(request: NextRequest) {
  try {
    // Require admin access
    requireAdmin(request);

    // The diagnostics endpoint has been disabled for security reasons.
    // The use of eval() to execute arbitrary JavaScript code presents a
    // critical Remote Code Execution (RCE) vulnerability that cannot be safely mitigated.
    // Even when restricted to admin users only, allowing code execution through eval()
    // exposes the application to catastrophic security risks including:
    // - Server compromise and takeover
    // - Data theft and exfiltration
    // - Application shutdown and denial of service
    // - Privilege escalation attacks
    //
    // This endpoint has been completely disabled. For legitimate diagnostics needs,
    // please implement a safe alternative that does not use eval() and only exposes
    // pre-defined, safe diagnostic operations.
    return NextResponse.json(
      { error: "Diagnostics endpoint has been disabled for security reasons" },
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
