require("dotenv").config({
  path: "../.env.local",
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing");
}

if (!ADMIN_CHAT_ID) {
  throw new Error("TELEGRAM_ADMIN_CHAT_ID is missing");
}

const TELEGRAM_API =
  `https://api.telegram.org/bot${BOT_TOKEN}`;

/* ---------------------------------------------------------- */
/* HELP KEYBOARD */
/* ---------------------------------------------------------- */

const HELP_KEYBOARD = {
  keyboard: [
    [
      "🔴 Live Matches",
      "📅 Fixtures",
    ],
    [
      "🏆 Leagues",
      "👥 Teams",
    ],
    [
      "📺 Watching",
      "📱 Mobile devices",
    ],
    [
      "📺 Android TV",
      "📡 IPTV Channels",
    ],
    [
      "👻 Horror Movies",
      "🔄 HDOFOOT Updates",
    ],
    [
      "⬇️ Download",
      "🛠️ Troubleshooting",
    ],
  ],
  resize_keyboard: true,
  is_persistent: true,
  input_field_placeholder: "Ask HDOFOOT Support...",
};

/* ---------------------------------------------------------- */
/* TELEGRAM API */
/* ---------------------------------------------------------- */

async function telegram(method, body = {}) {
  const response = await fetch(
    `${TELEGRAM_API}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!data.ok) {
    throw new Error(
      `Telegram ${method} failed: ${JSON.stringify(data)}`
    );
  }

  return data.result;
}

/* ---------------------------------------------------------- */
/* SEND MESSAGE */
/* ---------------------------------------------------------- */

async function sendMessage(
  chatId,
  text,
  replyTo = null,
  showKeyboard = false
) {
  return telegram("sendMessage", {
    chat_id: chatId,
    text,

    ...(replyTo
      ? {
          reply_to_message_id: replyTo,
        }
      : {}),

    ...(showKeyboard
      ? {
          reply_markup: HELP_KEYBOARD,
        }
      : {}),
  });
}

/* ---------------------------------------------------------- */
/* AUTOMATIC HELP */
/* ---------------------------------------------------------- */

function getAutomaticReply(text) {
  const message = text
    .toLowerCase()
    .trim();

  /* -------------------------------------------------------- */
  /* START / HELP */
  /* -------------------------------------------------------- */

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

  /* -------------------------------------------------------- */
  /* LIVE MATCHES */
  /* -------------------------------------------------------- */

  if (
    message.includes("live match") ||
    message.includes("live matches") ||
    message === "live" ||
    message.includes("🔴 live")
  ) {
    return `🔴 LIVE MATCHES

Open HDOFOOT and select Live Matches.

You'll see football matches that are currently being played, including:

⚽ Teams
📊 Current score
⏱️ Match time
🏆 Competition

Select a match to open its Match Center.`;
  }

  /* -------------------------------------------------------- */
  /* FIXTURES */
  /* -------------------------------------------------------- */

  if (
    message.includes("fixture") ||
    message.includes("fixtures") ||
    message.includes("upcoming") ||
    message.includes("📅 fixtures")
  ) {
    return `📅 FIXTURES

The Fixtures section shows today's football matches and their scheduled times.

Select a match to open the Match Center for more information.

You can also use Fixtures to find matches that haven't started yet.`;
  }

  /* -------------------------------------------------------- */
  /* LEAGUES */
  /* -------------------------------------------------------- */

  if (
    message === "league" ||
    message === "leagues" ||
    message.includes("league") ||
    message.includes("competitions") ||
    message.includes("🏆 leagues")
  ) {
    return `🏆 LEAGUES

HDOFOOT lets you browse football competitions from different leagues.

Open the Leagues section to explore available competitions.

You can select a league to find its matches and information.`;
  }

  /* -------------------------------------------------------- */
  /* TEAMS */
  /* -------------------------------------------------------- */

  if (
    message === "team" ||
    message === "teams" ||
    message.includes("football team") ||
    message.includes("👥 teams")
  ) {
    return `👥 TEAMS

You can browse football teams through the Teams section of HDOFOOT.

Select a team to explore its available information and matches.`;
  }

  /* -------------------------------------------------------- */
  /* WATCHING */
  /* -------------------------------------------------------- */

  if (
    message.includes("watch") ||
    message.includes("how do i watch") ||
    message.includes("how to watch") ||
    message.includes("play match") ||
    message.includes("watching") ||
    message.includes("📺 watching")
  ) {
    return `📺 WATCHING A MATCH

To watch a match:

1. Open HDOFOOT.
2. Open Live Matches or Fixtures.
3. Select the match.
4. Open the Match Center.
5. Select the available watch/play option.

If the player doesn't work or shows a black screen, tell me what happens and I'll help troubleshoot it.`;
  }

  /* -------------------------------------------------------- */
  /* ANDROID TV */
  /* -------------------------------------------------------- */

  if (
    message.includes("android tv") ||
    message.includes("androidtv") ||
    message.includes("d-pad") ||
    message.includes("dpad") ||
    message.includes("android tv navigation") ||
    message.includes("📺 android tv")
  ) {
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

  /* -------------------------------------------------------- */
  /* MOBILE */
  /* -------------------------------------------------------- */

  if (
    message.includes("mobile") ||
    message.includes("phone") ||
    message.includes("smartphone") ||
    message.includes("android phone") ||
    message.includes("📱 mobile")
  ) {
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

  /* -------------------------------------------------------- */
  /* IPTV */
  /* -------------------------------------------------------- */

  if (
    message.includes("iptv") ||
    message.includes("iptv channel") ||
    message.includes("iptv channels") ||
    message.includes("📡 iptv")
  ) {
    return `📡 IPTV CHANNELS

HDOFOOT includes an IPTV section for available live TV channels.

To use IPTV:

1. Open HDOFOOT.
2. Open the IPTV section.
3. Browse the available channels.
4. Select a channel to open it.

If an IPTV channel isn't working, tell me the channel name and I'll help troubleshoot it.`;
  }

  /* -------------------------------------------------------- */
  /* HORROR MOVIES */
  /* -------------------------------------------------------- */

  if (
    message.includes("horror") ||
    message.includes("horror movie") ||
    message.includes("horror movies") ||
    message.includes("👻 horror")
  ) {
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

  /* -------------------------------------------------------- */
  /* UPDATES */
  /* -------------------------------------------------------- */

  if (
    message.includes("update") ||
    message.includes("updates") ||
    message.includes("latest version") ||
    message.includes("new version") ||
    message.includes("new update") ||
    message.includes("🔄 hdofoot updates")
  ) {
    return `🔄 HDOFOOT UPDATE

For the latest HDOFOOT update, always use the official HDOFOOT download location.

If you want the download information, press:

⬇️ Download

or type:

DOWNLOAD`;
  }

  /* -------------------------------------------------------- */
  /* DOWNLOAD */
  /* -------------------------------------------------------- */

  if (
    message === "download" ||
    message === "⬇️ download" ||
    message.includes("download app") ||
    message.includes("download hdofoot") ||
    message.includes("where can i download hdofoot") ||
    message.includes("where can i download") ||
    message.includes("download the app")
  ) {
    return `⬇️ HDOFOOT DOWNLOAD

The latest HDOFOOT update is available through the official HDOFOOT download location.

🌐 HDOFOOT:
https://hdofoot.vercel.app

For a specific Android or Android TV download, tell me which device you're using.

⚠️ Always use the official HDOFOOT download location for updates.`;
  }

  /* -------------------------------------------------------- */
  /* TROUBLESHOOTING */
  /* -------------------------------------------------------- */

  if (
    message.includes("troubleshoot") ||
    message.includes("problem") ||
    message.includes("not working") ||
    message.includes("doesn't work") ||
    message.includes("doesnt work") ||
    message.includes("error") ||
    message.includes("broken") ||
    message.includes("🛠️ troubleshooting")
  ) {
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

  /* -------------------------------------------------------- */
  /* BLACK SCREEN */
  /* -------------------------------------------------------- */

  if (
    message.includes("black screen") ||
    message.includes("blackscreen")
  ) {
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

const supportMessages = new Map();

/* ---------------------------------------------------------- */
/* FORWARD UNKNOWN MESSAGE TO ADMIN */
/* ---------------------------------------------------------- */

async function forwardToAdmin(message) {
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

  const adminText =
`🆘 HDOFOOT SUPPORT REQUEST

User: ${userName}
Username: ${username}
User ID: ${user?.id ?? "Unknown"}

Message:

${message.text ?? "[non-text message]"}

↩️ Reply directly to THIS message to answer the user.`;

  const adminMessage = await sendMessage(
    ADMIN_CHAT_ID,
    adminText
  );

  supportMessages.set(
    adminMessage.message_id,
    message.chat.id
  );

  console.log(
    `Support request ${adminMessage.message_id} -> user ${message.chat.id}`
  );
}

/* ---------------------------------------------------------- */
/* ADMIN REPLY */
/* ---------------------------------------------------------- */

async function handleAdminReply(message) {
  const reply =
    message.reply_to_message;

  if (!reply) {
    return false;
  }

  const userChatId =
    supportMessages.get(
      reply.message_id
    );

  if (!userChatId) {
    return false;
  }

  if (!message.text) {
    return true;
  }

  await sendMessage(
    userChatId,
    `💬 HDOFOOT Support\n\n${message.text}`,
    null,
    true
  );

  await sendMessage(
    ADMIN_CHAT_ID,
    `✅ Reply sent to user ${userChatId}.`
  );

  console.log(
    `Admin reply sent to ${userChatId}`
  );

  return true;
}

/* ---------------------------------------------------------- */
/* HANDLE USER MESSAGE */
/* ---------------------------------------------------------- */

async function handleUserMessage(message) {
  if (!message.text) {
    return;
  }

  const reply =
    getAutomaticReply(message.text);

  if (reply) {
    await sendMessage(
      message.chat.id,
      reply,
      message.message_id,
      true
    );

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

async function handleUpdate(update) {
  const message = update.message;

  if (!message) {
    return;
  }

  /*
   * ADMIN MESSAGE
   */

  if (
    String(message.chat.id) ===
    String(ADMIN_CHAT_ID)
  ) {
    const handled =
      await handleAdminReply(message);

    if (handled) {
      return;
    }

    return;
  }

  /*
   * USER MESSAGE
   */

  await handleUserMessage(message);
}

/* ---------------------------------------------------------- */
/* LONG POLLING */
/* ---------------------------------------------------------- */

async function startBot() {
  console.log(
    "⚽ HDOFOOT Telegram Help Bot"
  );

  console.log(
    "Starting long polling..."
  );

  await telegram("deleteWebhook", {
    drop_pending_updates: false,
  });

  const me =
    await telegram("getMe");

  console.log(
    `Bot: @${me.username}`
  );

  let offset = 0;

  while (true) {
    try {
      const updates =
        await telegram("getUpdates", {
          offset,
          timeout: 30,
          allowed_updates: [
            "message",
          ],
        });

      for (const update of updates) {
        offset =
          update.update_id + 1;

        try {
          await handleUpdate(update);
        } catch (error) {
          console.error(
            "Update handling error:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Polling error:",
        error
      );

      await new Promise(
        resolve =>
          setTimeout(resolve, 5000)
      );
    }
  }
}

/* ---------------------------------------------------------- */
/* START */
/* ---------------------------------------------------------- */

startBot().catch(error => {
  console.error(
    "Fatal bot error:",
    error
  );

  process.exit(1);
});