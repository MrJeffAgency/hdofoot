import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || "";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/* ---------------------------------------------------------- */
/* HELP KEYBOARD */
/* ---------------------------------------------------------- */

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

/* ---------------------------------------------------------- */
/* TELEGRAM API */
/* ---------------------------------------------------------- */

async function telegram(method: string, body: Record<string, unknown> = {}) {
  if (!BOT_TOKEN) return null;
  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: any = await response.json().catch(() => ({}));
  if (!data.ok) {
    console.error(`Telegram ${method} failed:`, JSON.stringify(data));
    return null;
  }
  return data.result;
}

/* ---------------------------------------------------------- */
/* SEND MESSAGE */
/* ---------------------------------------------------------- */

async function sendMessage(
  chatId: number | string,
  text: string,
  replyTo: number | null = null,
  showKeyboard = false
) {
  return telegram("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyTo ? { reply_to_message_id: replyTo } : {}),
    ...(showKeyboard ? { reply_markup: HELP_KEYBOARD } : {}),
  });
}

/* ---------------------------------------------------------- */
/* AUTOMATIC HELP */
/* ---------------------------------------------------------- */

function getAutomaticReply(text: string) {
  const message = text.toLowerCase().trim();

  if (
    message === "/start" ||
    message === "/help" ||
    message === "hello" ||
    message === "hi" ||
    message === "hey"
  ) {
    return `⚽ Welcome to HDOFOOT Support!

I'm the official HDOFOOT Help Bot.

I can help you with:

🔴 Live Matches
📅 Fixtures
🏆 Leagues
👥 Teams
📺 Watching matches
📱 Mobile devices
📺 Android TV
📡 IPTV Channels
👻 Horror Movies
🔄 HDOFOOT updates
⬇️ Download information
🛠️ Troubleshooting

Use the buttons below or ask me anything about HDOFOOT.

If I don't understand your question, I'll send it to HDOFOOT support.`;
  }

  if (message.includes("live match") || message.includes("live matches") || message === "live" || message.includes("🔴 live")) {
    return `🔴 LIVE MATCHES

Open HDOFOOT and select Live Matches.

You'll see football matches that are currently being played, including:

⚽ Teams
📊 Current score
⏱️ Match time
🏆 Competition

Select a match to open its Match Center.`;
  }

  if (message.includes("fixture") || message.includes("fixtures") || message.includes("upcoming") || message.includes("📅 fixtures")) {
    return `📅 FIXTURES

The Fixtures section shows today's football matches and their scheduled times.

Select a match to open the Match Center for more information.

You can also use Fixtures to find matches that haven't started yet.`;
  }

  if (message === "league" || message === "leagues" || message.includes("league") || message.includes("competitions") || message.includes("🏆 leagues")) {
    return `🏆 LEAGUES

HDOFOOT lets you browse football competitions from different leagues.

Open the Leagues section to explore available competitions.

You can select a league to find its matches and information.`;
  }

  if (message === "team" || message === "teams" || message.includes("football team") || message.includes("👥 teams")) {
    return `👥 TEAMS

You can browse football teams through the Teams section of HDOFOOT.

Select a team to explore its available information and matches.`;
  }

  if (message.includes("watch") || message.includes("how do i watch") || message.includes("how to watch") || message.includes("play match") || message.includes("watching") || message.includes("📺 watching")) {
    return `📺 WATCHING A MATCH

To watch a match:

1. Open HDOFOOT.
2. Open Live Matches or Fixtures.
3. Select the match.
4. Open the Match Center.
5. Select the available watch/play option.

If the player doesn't work or shows a black screen, tell me what happens and I'll help troubleshoot it.`;
  }

  if (message.includes("android tv") || message.includes("androidtv") || message.includes("d-pad") || message.includes("dpad") || message.includes("android tv navigation") || message.includes("📺 android tv")) {
    return `📺 ANDROID TV

HDOFOOT supports Android TV navigation.

You can use your remote's D-pad to navigate through:

🏠 Home
🔴 Live
📅 Fixtures
🏆 Leagues
👥 Teams

Focused buttons are highlighted so you can navigate without a mouse.

If you have a TV navigation problem, tell me what you're seeing.`;
  }

  if (message.includes("mobile") || message.includes("phone") || message.includes("smartphone") || message.includes("android phone") || message.includes("📱 mobile")) {
    return `📱 MOBILE

HDOFOOT is designed to work on mobile devices.

For the best experience:

• Use a modern browser
• Keep your browser updated
• Use a stable internet connection
• Use landscape mode when appropriate for watching matches
• Keep your device connected to a stable network

If something isn't working on your phone, tell me what happens.`;
  }

  if (message.includes("iptv") || message.includes("iptv channel") || message.includes("iptv channels") || message.includes("📡 iptv")) {
    return `📡 IPTV CHANNELS

HDOFOOT includes an IPTV section for available live TV channels.

To use IPTV:

1. Open HDOFOOT.
2. Open the IPTV section.
3. Browse the available channels.
4. Select a channel to open it.

If an IPTV channel isn't working, tell me the channel name and I'll help troubleshoot it.`;
  }

  if (message.includes("horror") || message.includes("horror movie") || message.includes("horror movies") || message.includes("👻 horror")) {
    return `👻 HORROR MOVIES

Looking for something scary? 👻

Open the HDOFOOT movie section and browse the available movies.

You can also tell me what type of horror movie you're looking for, such as:

🧟 Zombie
👻 Supernatural
🔪 Slasher
😱 Psychological
👹 Monster

I'll try to help you find what you're looking for.`;
  }

  if (message.includes("update") || message.includes("updates") || message.includes("latest version") || message.includes("new version") || message.includes("new update") || message.includes("🔄 hdofoot updates")) {
    return `🔄 HDOFOOT UPDATE

For the latest HDOFOOT update, always use the official HDOFOOT download location.

If you want the download information, press:

⬇️ Download

or type:

DOWNLOAD`;
  }

  if (message === "download" || message === "⬇️ download" || message.includes("download app") || message.includes("download hdofoot") || message.includes("where can i download hdofoot") || message.includes("where can i download") || message.includes("download the app")) {
    return `⬇️ HDOFOOT DOWNLOAD

The latest HDOFOOT update is available through the official HDOFOOT download location.

🌐 HDOFOOT:
https://hdofoot.vercel.app

For a specific Android or Android TV download, tell me which device you're using.

⚠️ Always use the official HDOFOOT download location for updates.`;
  }

  if (message.includes("troubleshoot") || message.includes("problem") || message.includes("not working") || message.includes("doesn't work") || message.includes("doesnt work") || message.includes("error") || message.includes("broken") || message.includes("🛠️ troubleshooting")) {
    return `🛠️ TROUBLESHOOTING

I'm here to help.

Please tell me:

1. What device you're using
2. What you were trying to do
3. What happened
4. Any error message you see

For example:

"My match player is showing a black screen on Android TV."

If I can't solve the problem automatically, I'll send it to HDOFOOT support.`;
  }

  if (message.includes("black screen") || message.includes("blackscreen")) {
    return `🛠️ BLACK SCREEN

If the match player is showing a black screen, try:

1. Close the player.
2. Open the match again.
3. Check your internet connection.
4. Try another available playback option.
5. If you're using Android TV, restart the HDOFOOT app/browser.

If the problem continues, tell me:

📱 Your device
⚽ The match
🌐 Whether other matches work

If I can't resolve it automatically, I'll send the problem to HDOFOOT support.`;
  }

  return null;
}

/* ---------------------------------------------------------- */
/* SUPPORT MESSAGE MAPPING */
/* ---------------------------------------------------------- */

const supportMessages = new Map<number, number>();

/* ---------------------------------------------------------- */
/* FORWARD UNKNOWN MESSAGE TO ADMIN */
/* ---------------------------------------------------------- */

async function forwardToAdmin(message: any) {
  const user = message.from;
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Unknown user";
  const username = user?.username ? `@${user.username}` : "No username";

  const adminText = `🆘 HDOFOOT SUPPORT REQUEST

User: ${name}
Username: ${username}
User ID: ${user?.id ?? "Unknown"}

Message:

${message.text ?? "[non-text message]"}

↩️ Reply directly to THIS message to answer the user.`;

  const adminMessage = await sendMessage(ADMIN_CHAT_ID, adminText);
  if (adminMessage) {
    supportMessages.set(adminMessage.message_id, message.chat.id);
  }
}

/* ---------------------------------------------------------- */
/* ADMIN REPLY */
/* ---------------------------------------------------------- */

async function handleAdminReply(message: any) {
  const reply = message.reply_to_message;
  if (!reply) return false;

  const userChatId = supportMessages.get(reply.message_id);
  if (!userChatId) return false;
  if (!message.text) return true;

  await sendMessage(userChatId, `💬 HDOFOOT Support\n\n${message.text}`, null, true);
  await sendMessage(ADMIN_CHAT_ID, `✅ Reply sent to user ${userChatId}.`);
  return true;
}

/* ---------------------------------------------------------- */
/* HANDLE USER MESSAGE */
/* ---------------------------------------------------------- */

async function handleUserMessage(message: any) {
  if (!message.text) return;

  const reply = getAutomaticReply(message.text);
  if (reply) {
    await sendMessage(message.chat.id, reply, message.message_id, true);
    return;
  }

  await forwardToAdmin(message);
  await sendMessage(
    message.chat.id,
    `🆘 I couldn't fully understand that question.

I've sent your message to HDOFOOT support.

A member of the support team will reply to you as soon as possible.`,
    null,
    true
  );
}

/* ---------------------------------------------------------- */
/* UPDATE HANDLER */
/* ---------------------------------------------------------- */

async function handleUpdate(update: any) {
  const message = update.message;
  if (!message) return;

  /* ADMIN MESSAGE */
  if (String(message.chat.id) === String(ADMIN_CHAT_ID)) {
    await handleAdminReply(message);
    return;
  }

  /* USER MESSAGE */
  await handleUserMessage(message);
}

/* ---------------------------------------------------------- */
/* ROUTE HANDLERS */
/* ---------------------------------------------------------- */

export async function GET() {
  return NextResponse.json({
    ok: true,
    botConfigured: Boolean(BOT_TOKEN),
    message: "HDOFOOT Telegram bot webhook is live",
  });
}

export async function POST(request: Request) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "No bot token" }, { status: 500 });
  }

  // Optional secret check when TELEGRAM_WEBHOOK_SECRET is configured.
  if (WEBHOOK_SECRET) {
    const provided = request.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const update = await request.json();
    await handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed" }, { status: 500 });
  }
}
