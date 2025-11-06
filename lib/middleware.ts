import { NextRequest } from "next/server";
import { verifyToken, User } from "./auth";

// Custom error classes for proper error differentiation
export class AuthenticationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = statusCode;
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class MalformedAuthHeaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedAuthHeaderError";
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // First, try to get token from Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    // Validate Authorization header format
    if (authHeader.toLowerCase() === "null" || authHeader === "") {
      throw new MalformedAuthHeaderError("Invalid Authorization header: empty or null");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      throw new MalformedAuthHeaderError(
        `Invalid Authorization header format: expected "Bearer <token>", got "${authHeader}"`
      );
    }

    const [scheme, credentials] = parts;
    if (scheme.toLowerCase() !== "bearer") {
      throw new MalformedAuthHeaderError(
        `Unsupported authentication scheme: ${scheme}. Only Bearer tokens are supported.`
      );
    }

    if (!credentials || credentials.trim() === "") {
      throw new MalformedAuthHeaderError("Bearer token is empty");
    }

    return credentials;
  }

  // Fall back to cookie-based token
  const token = request.cookies.get("token")?.value;
  return token || null;
}

export function getUserFromRequest(request: NextRequest): User | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  return verifyToken(token);
}

export function requireAuth(request: NextRequest): User {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    throw new AuthenticationError("Missing authentication credentials", 401);
  }

  const user = verifyToken(token);
  if (!user) {
    throw new AuthenticationError("Invalid or expired authentication token", 401);
  }

  return user;
}

export function requireAdmin(request: NextRequest): User {
  const user = requireAuth(request);
  if (user.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }
  return user;
}
