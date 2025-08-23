import { NextRequest } from "next/server";
import { verifyToken, User } from "./auth";

export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  return token || null;
}

export function getUserFromRequest(request: NextRequest): User | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  return verifyToken(token);
}

export function requireAuth(request: NextRequest): User {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireAdmin(request: NextRequest): User {
  const user = requireAuth(request);
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}
