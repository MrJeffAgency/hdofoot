import { NextResponse, NextRequest } from "next/server";
import { isValidAdminCookie, ADMIN_COOKIE } from "@/lib/admin-auth";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const API = `https://api.telegram.org/bot${TOKEN}`;

const HELP_KEYBOARD = {
  keyboard: [
    ["🔴 Live Matches", "📅 Fixtures"],
    ["🏆 Leagues", "👥 Teams"],
    ["📺 Watching", "📱 Mobile devices"],
    ["📺 Android TV", "📡 IPTV Channels"],
    ["👻 Horror Movies", "🔄 HDOFOOT Updates"],
    ["⬇️ Download", "🛠️ Troubleshooting"],
  ],
  resize_keyboard: true,
  is_persistent: true,
  input_field_placeholder: "Ask HDOFOOT Support...",
};

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!isValidAdminCookie(token)) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 401 });
  }
  if (!TOKEN) {
    return NextResponse.json({ ok: false, error: "No bot token" }, { status: 500 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const chatId = String(body.userId || body.chatId || "").trim();
  const text = String(body.text || "").trim();

  if (!chatId) {
    return NextResponse.json({ ok: false, error: "User ID is required" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ ok: false, error: "Message text is required" }, { status: 400 });
  }
  if (text.length > 4096) {
    return NextResponse.json({ ok: false, error: "Message too long (max 4096)" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `💬 HDOFOOT Support\n\n${text}`,
        reply_markup: HELP_KEYBOARD,
      }),
    });
    const data: any = await res.json().catch(() => ({}));

    if (!data.ok) {
      return NextResponse.json(
        { ok: false, error: data.description || "Telegram rejected the message" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, result: data.result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed" }, { status: 500 });
  }
}
