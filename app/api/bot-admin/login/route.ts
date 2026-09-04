import { NextResponse } from "next/server";
import {
  verifyPassword,
  loginToken,
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const { password } = body || {};

  if (!verifyPassword(String(password || ""))) {
    return NextResponse.json(
      { ok: false, error: "Invalid password" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, loginToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}
