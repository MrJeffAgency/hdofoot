"use client";

import { useEffect, useState, useCallback } from "react";

interface BotUser {
  id: string;
  name: string;
  username: string;
  firstSeen: number;
  lastSeen: number;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loginError, setLoginError] = useState("");
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState<BotUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [targetId, setTargetId] = useState("");
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/bot-admin/users");
      const data = await res.json();
      if (!data.ok) {
        if (res.status === 401) {
          setAuthed(false);
          return;
        }
        setLoadingUsers(false);
        return;
      }
      setUsers(data.users ?? []);
      setAuthed(true);
    } catch {
      /* ignore */
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (authed === null) loadUsers();
  }, [authed, loadUsers]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/bot-admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error || "Login failed");
        return;
      }
      setPassword("");
      loadUsers();
    } catch {
      setLoginError("Something went wrong.");
    }
  }

  function pickUser(id: string) {
    setTargetId(id);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSendMsg(null);
    if (!targetId.trim() || !sendText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/bot-admin/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: targetId, text: sendText }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSendMsg({ ok: false, text: data.error || "Failed to send" });
      } else {
        setSendMsg({ ok: true, text: "Message sent." });
        setSendText("");
      }
    } catch {
      setSendMsg({ ok: false, text: "Something went wrong." });
    } finally {
      setSending(false);
    }
  }

  if (authed === null) {
    return <Shell loading />;
  }

  if (!authed) {
    return (
      <Shell>
        <h1 className="text-2xl font-black text-white mb-6">HDOFOOT Admin</h1>
        <form
          onSubmit={handleLogin}
          className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#0d1118] p-6"
        >
          <label className="block text-sm text-gray-300 mb-2">Admin password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#07090d] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50"
            placeholder="••••••••"
          />
          {loginError && (
            <p className="mt-3 text-sm text-red-400">{loginError}</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-green-500 py-2.5 font-semibold text-black hover:bg-green-400"
          >
            Sign in
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">HDOFOOT Bot Admin</h1>
        <button
          onClick={loadUsers}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User list */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1118] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Bot Users ({users.length})
          </h2>
          {loadingUsers ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">
              No users yet. Ask someone to message the bot.
            </p>
          ) : (
            <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => pickUser(u.id)}
                    className="w-full rounded-xl border border-white/10 bg-[#07090d] px-3 py-2 text-left text-sm hover:border-green-500/40"
                  >
                    <span className="block font-semibold text-white">
                      {u.name} {u.username && <span className="text-green-400">{u.username}</span>}
                    </span>
                    <span className="block text-xs text-gray-400">
                      User ID: {u.id}
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      Last seen: {new Date(u.lastSeen * 1000).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Send message */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Send message to user
            </h2>
            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-gray-400">
                  User / Chat ID
                </label>
                <input
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="e.g. 123456789 — or tap a user on the left"
                  className="w-full rounded-lg border border-white/10 bg-[#07090d] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-gray-400">
                  Message
                </label>
                <textarea
                  value={sendText}
                  onChange={(e) => setSendText(e.target.value)}
                  rows={5}
                  maxLength={4096}
                  placeholder="Type your message…"
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#07090d] px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/50"
                />
              </div>
              {sendMsg && (
                <p className={`text-sm ${sendMsg.ok ? "text-green-400" : "text-red-400"}`}>
                  {sendMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={sending || !targetId.trim() || !sendText.trim()}
                className="w-full rounded-lg bg-green-500 py-2.5 font-semibold text-black hover:bg-green-400 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children, loading }: { children?: React.ReactNode; loading?: boolean }) {
  return (
    <main className="min-h-screen bg-[#07090d] px-4 py-10 lg:px-6">
      <div className="mx-auto max-w-5xl">
        {children}
        {loading && <p className="text-sm text-gray-500">Checking…</p>}
      </div>
    </main>
  );
}
