import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // This endpoint has been disabled due to security vulnerability (CVE-2024-XXXXX)
  // The endpoint previously used eval() to execute arbitrary JavaScript code,
  // which poses a critical Remote Code Execution risk.
  //
  // Diagnostic functionality should be implemented through:
  // 1. Separate, hardened monitoring service
  // 2. Distributed tracing platforms (DataDog, New Relic, etc.)
  // 3. Infrastructure-level monitoring (Prometheus, CloudWatch, etc.)
  //
  // This endpoint will no longer accept requests.
  
  return NextResponse.json(
    { 
      error: "This endpoint has been disabled for security reasons",
      message: "Please use production monitoring solutions instead"
    },
    { status: 404 }
  );
}
