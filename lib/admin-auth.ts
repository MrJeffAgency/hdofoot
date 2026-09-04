import { createHmac, timingSafeEqual } from "crypto";

const PASSWORD = process.env.ADMIN_PASSWORD || "";
const COOKIE = "hdofoot_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SECRET = process.env.ADMIN_PASSWORD || "hdofoot-secret";

function sign(value: string): string {
  return createHmac("sha256", SECRET || "hdofoot-secret")
    .update(value)
    .digest("hex");
}

export function loginToken(): string {
  return sign("admin");
}

export function verifyPassword(password: string): boolean {
  if (!PASSWORD) return false;
  const a = Buffer.from(String(password || ""));
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isValidAdminCookie(value: string | undefined): boolean {
  if (!value || !PASSWORD) return false;
  const expected = sign("admin");
  if (value.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_MAX_AGE = MAX_AGE;
