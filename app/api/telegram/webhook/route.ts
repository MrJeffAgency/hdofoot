import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const DOWNLOAD_URL = process.env.TELEGRAM_DOWNLOAD_URL;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TelegramMessage = {
  message_id: number;
  chat: {
    id: number;
    type: string;
  };
  from?: TelegramUser;
  text?: string;
  reply_to_message?: {
    message_id: number;
    text?: string;
    from?: TelegramUser;
  };
};

type TelegramUpdate = {
  message?: TelegramMessage;
};

/* ---------------------------------------------------------- */
/* TELEGRAM API */
/* ---------------------------------------------------------- */

async function telegram(
  method: string,
  body: Record<string, unknown>
) {
  if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing");
  }

  const response = await fetch(
    `${TELEGRAM_API}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  return response.json();
}

/* ---------------------------------------------------------- */
/* SEND MESSAGE */
/* ---------------------------------------------------------- */

async function sendMessage(
  chatId: number | string,
  text: string,
  replyTo?: number
) {
  return telegram("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyTo
      ? {
          reply_to_message_id: replyTo,
        }
      : {}),
  });
}

/* ---------------------------------------------------------- */
/* AUTOMATIC HELP */
/* ---------------------------------------------------------- */

function getAutomaticReply(text: string) {
  const message = text.toLowerCase().trim();

  /* START / GREETING */

  if (
    message === "/start" ||
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
🔄 HDOFOOT updates
⬇️ Download information
🛠️ Troubleshooting

Type /help to see what I can help you with.`;
  }

  /* HELP */

  if (
    message === "/help" ||
    message.includes("what can you do")
  ) {
    return `⚽ HDOFOOT HELP

🔴 LIVE MATCHES
Ask about matches happening right now.

📅 FIXTURES
Find today's upcoming matches.

📺 WATCHING
Learn how to open and watch a match.

📱 MOBILE
Get help using HDOFOOT on your phone.

📺 ANDROID TV
Get help with TV navigation and D-pad controls.

🔄 UPDATES
Ask about the latest HDOFOOT update.

⬇️ DOWNLOAD
Ask for the latest download information.

🛠️ PROBLEMS
Tell me what is not working and I'll try to help.

If I don't understand your question, I'll send it to HDOFOOT support.`;
  }

  /* LIVE */

  if (
    message.includes("live match") ||
    message.includes("live matches") ||
    message === "live"
  ) {
    return `🔴 LIVE MATCHES

Open HDOFOOT → Live Matches to see football matches currently being played.

If a match is live, you'll see its current score and match status.

If you can't find a match, tell me which match you're looking for.`;
  }

  /* FIXTURES */

  if (
    message.includes("fixture") ||
    message.includes("fixtures") ||
    message.includes("upcoming")
  ) {
    return `📅 FIXTURES

The Fixtures section shows today's football matches and their scheduled times.

Select a match to open its Match Center for more information.`;
  }

  /* ANDROID TV */

  if (
    message.includes("android tv") ||
    message.includes("androidtv") ||
    message.includes("tv navigation")
  ) {
    return `📺 ANDROID TV

HDOFOOT supports Android TV navigation.

Use your remote's D-pad to move between:

🏠 Home
🔴 Live
📅 Fixtures
🏆 Leagues
👥 Teams

Focused buttons are designed to make D-pad navigation easier.`;
  }

  /* UPDATE */

  if (
    message.includes("update") ||
    message.includes("latest version") ||
    message.includes("new version")
  ) {
    if (DOWNLOAD_URL) {
      return `🔄 HDOFOOT UPDATE

The latest HDOFOOT version is available here:

${DOWNLOAD_URL}

Always use the official HDOFOOT download location for updates.`;
    }

    return `🔄 HDOFOOT UPDATE

The latest HDOFOOT update will be available through the official HDOFOOT download location.

Type DOWNLOAD to request the current download information.`;
  }

  /* DOWNLOAD */

  if (
    message === "download" ||
    message === "/download" ||
    message.includes("download app") ||
    message.includes("download hdofoot")
  ) {
    if (DOWNLOAD_URL) {
      return `⬇️ HDOFOOT DOWNLOAD

Get the latest HDOFOOT version here:

${DOWNLOAD_URL}

Please make sure you download HDOFOOT only from the official source.`;
    }

    return `⬇️ HDOFOOT DOWNLOAD

The official HDOFOOT download link has not been configured yet.

Please check the HDOFOOT website or contact support.`;
  }

  /* WATCHING */

  if (
    message.includes("watch") ||
    message.includes("how do i watch") ||
    message.includes("play match")
  ) {
    return `📺 WATCHING A MATCH

1. Open HDOFOOT.
2. Open Live Matches or Fixtures.
3. Select the match.
4. Open the Match Center.
5. Select the available watch/play option.

If the player doesn't work, tell me what happens and I'll help troubleshoot it.`;
  }

  /* WEBSITE */

  if (
    message === "website" ||
    message.includes("website") ||
    message.includes("site")
  ) {
    return `🌐 HDOFOOT

Official HDOFOOT website:

https://hdofoot.vercel.app

You can use HDOFOOT to follow:

⚽ Live matches
📅 Fixtures
🏆 Leagues
👥 Teams
📺 Match information`;
  }

  return null;
}

/* ---------------------------------------------------------- */
/* FORWARD UNKNOWN MESSAGE TO ADMIN */
/* ---------------------------------------------------------- */

async function forwardToAdmin(
  message: TelegramMessage
) {
  if (!ADMIN_CHAT_ID) {
    throw new Error(
      "TELEGRAM_ADMIN_CHAT_ID is missing"
    );
  }

  const user = message.from;

  const userName =
    [
      user?.first_name,
      user?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Unknown user";

  const username = user?.username
    ? `@${user.username}`
    : "No username";

  const adminText = `🆘 HDOFOOT SUPPORT REQUEST

User: ${userName}
Username: ${username}
User ID: ${user?.id ?? "Unknown"}

Message:

${message.text ?? "[non-text message]"}

━━━━━━━━━━━━━━━━━━━━

↩️ REPLY TO THIS MESSAGE TO ANSWER THE USER.

The bot will automatically send your reply back to this user.`;

  return telegram("sendMessage", {
    chat_id: ADMIN_CHAT_ID,
    text: adminText,
  });
}

/* ---------------------------------------------------------- */
/* GET USER ID FROM ADMIN REPLY */
/* ---------------------------------------------------------- */

function getUserIdFromAdminReply(
  message: TelegramMessage
): number | null {
  const repliedText =
    message.reply_to_message?.text;

  if (!repliedText) {
    return null;
  }

  const match = repliedText.match(
    /User ID:\s*(\d+)/
  );

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

/* ---------------------------------------------------------- */
/* HANDLE ADMIN REPLY */
/* ---------------------------------------------------------- */

async function handleAdminReply(
  message: TelegramMessage
) {
  if (!ADMIN_CHAT_ID) {
    return false;
  }

  if (String(message.chat.id) !== String(ADMIN_CHAT_ID)) {
    return false;
  }

  if (!message.text) {
    return true;
  }

  const userId =
    getUserIdFromAdminReply(message);

  if (!userId) {
    return false;
  }

  await sendMessage(
    userId,
    `💬 HDOFOOT SUPPORT

${message.text}`
  );

  await sendMessage(
    ADMIN_CHAT_ID,
    `✅ Reply sent to user ${userId}.`
  );

  return true;
}

/* ---------------------------------------------------------- */
/* WEBHOOK */
/* ---------------------------------------------------------- */

export async function POST(
  request: NextRequest
) {
  try {
    /* SECURITY */

    if (WEBHOOK_SECRET) {
      const secret =
        request.headers.get(
          "x-telegram-bot-api-secret-token"
        );

      if (secret !== WEBHOOK_SECRET) {
        return NextResponse.json(
          { ok: false },
          { status: 401 }
        );
      }
    }

    const update =
      (await request.json()) as TelegramUpdate;

    const message = update.message;

    if (!message) {
      return NextResponse.json({
        ok: true,
      });
    }

    /* ------------------------------------------------------ */
    /* ADMIN REPLY */
    /* ------------------------------------------------------ */

    const adminHandled =
      await handleAdminReply(message);

    if (adminHandled) {
      return NextResponse.json({
        ok: true,
      });
    }

    /* ------------------------------------------------------ */
    /* IGNORE ADMIN CHAT */
    /* ------------------------------------------------------ */

    if (
      ADMIN_CHAT_ID &&
      String(message.chat.id) ===
        String(ADMIN_CHAT_ID)
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    /* ------------------------------------------------------ */
    /* IGNORE NON-TEXT */
    /* ------------------------------------------------------ */

    if (!message.text) {
      return NextResponse.json({
        ok: true,
      });
    }

    /* ------------------------------------------------------ */
    /* AUTOMATIC RESPONSE */
    /* ------------------------------------------------------ */

    const reply =
      getAutomaticReply(message.text);

    if (reply) {
      await sendMessage(
        message.chat.id,
        reply,
        message.message_id
      );

      return NextResponse.json({
        ok: true,
      });
    }

    /* ------------------------------------------------------ */
    /* UNKNOWN → ADMIN */
    /* ------------------------------------------------------ */

    await forwardToAdmin(message);

    await sendMessage(
      message.chat.id,
      `🆘 I couldn't fully understand that question.

I've sent your message to HDOFOOT support.

A member of the support team will reply to you as soon as possible.`
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Telegram webhook error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 500,
      }
    );
  }
}