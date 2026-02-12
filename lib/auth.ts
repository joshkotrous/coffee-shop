import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "./db";

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface DecodedToken extends User {
  iat: number;
  exp: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: "24h" }
  );
}

/**
 * Generate a signature for a token by hashing the token itself
 * This is used to store the token in the blacklist without exposing the full token
 */
function getTokenSignature(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Check if a token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const tokenSignature = getTokenSignature(token);
    const result = await query(
      "SELECT id FROM token_blacklist WHERE token_signature = $1",
      [tokenSignature]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    return false;
  }
}

/**
 * Add a token to the blacklist
 */
export async function blacklistToken(token: string): Promise<void> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as DecodedToken;

    const tokenSignature = getTokenSignature(token);
    const expiresAt = new Date(decoded.exp * 1000); // exp is in seconds

    await query(
      "INSERT INTO token_blacklist (token_signature, expires_at) VALUES ($1, $2) ON CONFLICT (token_signature) DO NOTHING",
      [tokenSignature, expiresAt]
    );
  } catch (error) {
    console.error("Error blacklisting token:", error);
  }
}

/**
 * Clean up expired tokens from the blacklist
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await query("DELETE FROM token_blacklist WHERE expires_at < NOW()");
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as DecodedToken;

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    "SELECT id, email, role FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return { id: user.id, email: user.email, role: user.role };
}
