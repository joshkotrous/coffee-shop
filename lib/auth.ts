import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "./db";

export interface User {
  id: number;
  email: string;
  role: string;
}

// Common weak passwords to check against
const WEAK_PASSWORDS = [
  "password",
  "123456",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "sunshine",
];

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates password against security requirements
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character from !@#$%^&*
 * - Not a common weak password
 */
export function validatePassword(password: string): PasswordValidationResult {
  // Check minimum length
  if (password.length < 12) {
    return {
      valid: false,
      error: "Password must be at least 12 characters long",
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one number",
    };
  }

  // Check for special character
  if (!/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one special character (!@#$%^&*)",
    };
  }

  // Check against common weak passwords
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return {
      valid: false,
      error: "Password is too common. Please choose a more unique password",
    };
  }

  return { valid: true };
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

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as User;
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
