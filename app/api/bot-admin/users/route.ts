import { NextResponse, NextRequest } from "next/server";
import { isValidAdminCookie, ADMIN_COOKIE } from "@/lib/admin-auth";
import { listUsers } from "@/lib/bot-store";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!isValidAdminCookie(token)) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 401 });
  }

  try {
    const users = await listUsers();
    return NextResponse.json({ ok: true, users });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed" }, { status: 500 });
  }
}
