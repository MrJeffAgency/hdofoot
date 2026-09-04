import { kv } from "@vercel/kv";

const USERS_KEY = "hdofoot_users"; // Redis set of user ID strings
const USER_PREFIX = "hdofoot_user:"; // JSON per user-id

export const KV_CONFIGURED = Boolean(
  process.env.KV_URL || process.env.KV_REST_API_URL
);

// In-memory fallback so the bot still works locally / if KV isn't set up.
const memoryUsers = new Map<string, BotUser>();
let memoryWarned = false;

export interface BotUser {
  id: string;
  name: string;
  username: string;
  firstSeen: number;
  lastSeen: number;
}

function stamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Record that a user interacted with the bot.
 * Durably stores the user id (set) + profile info (hash) when KV is available.
 */
export async function recordUser(user: {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
}): Promise<void> {
  if (!user?.id) return;

  const id = String(user.id);
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unknown";
  const entry: BotUser = {
    id,
    name,
    username: user.username ? `@${user.username}` : "",
    firstSeen: 0,
    lastSeen: stamp(),
  };

  if (KV_CONFIGURED) {
    try {
      await kv.sadd(USERS_KEY, id);
      const existing = (await kv.get<BotUser>(USER_PREFIX + id)) ?? entry;
      entry.firstSeen = existing.firstSeen || stamp();
      await kv.set(USER_PREFIX + id, entry as unknown as Record<string, unknown>);
      return;
    } catch (e) {
      if (!memoryWarned) {
        console.error("KV write failed, using memory fallback:", e);
        memoryWarned = true;
      }
    }
  } else if (!memoryWarned) {
    memoryWarned = true;
    console.warn("Vercel KV not configured — using in-memory fallback (not durable).");
  }

  if (!memoryUsers.has(id)) entry.firstSeen = stamp();
  memoryUsers.set(id, entry);
  return;
}

/** List all known users. */
export async function listUsers(): Promise<BotUser[]> {
  if (KV_CONFIGURED) {
    try {
      const ids = (await kv.smembers(USERS_KEY)) as string[];
      const entries = await Promise.all(
        ids.map((id) => kv.get<BotUser>(USER_PREFIX + id))
      );
      return entries
        .filter((x): x is BotUser => Boolean(x))
        .sort((a, b) => b.lastSeen - a.lastSeen);
    } catch (e) {
      console.error("KV read failed:", e);
    }
  }
  return Array.from(memoryUsers.values()).sort(
    (a, b) => b.lastSeen - a.lastSeen
  );
}
