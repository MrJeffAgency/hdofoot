import fs from "fs";
import path from "path";

export interface IPTVChannel {
  id: string;
  tvgId: string;
  name: string;
  logo: string;
  groups: string[];
  url: string;
  userAgent?: string;
}

function getAttribute(
  line: string,
  attribute: string
): string {
  const regex = new RegExp(
    `${attribute}="([^"]*)"`
  );

  return line.match(regex)?.[1] ?? "";
}

function createChannelId(
  index: number,
  tvgId: string,
  name: string
): string {
  const base =
    tvgId ||
    name ||
    "channel";

  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${clean || "channel"}-${index}`;
}

export function getIPTVChannels(): IPTVChannel[] {
  const filePath = path.join(
    process.cwd(),
    "data",
    "playlist.m3u"
  );

  if (!fs.existsSync(filePath)) {
    console.error(
      "IPTV playlist not found:",
      filePath
    );

    return [];
  }

  const content = fs.readFileSync(
    filePath,
    "utf8"
  );

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim());

  const channels: IPTVChannel[] = [];

  let current: Partial<IPTVChannel> | null =
    null;

  let pendingUserAgent:
    | string
    | undefined;

  for (const line of lines) {
    if (!line) {
      continue;
    }

    /*
     * Channel metadata
     */
    if (line.startsWith("#EXTINF:")) {
      const commaIndex =
        line.indexOf(",");

      const channelName =
        commaIndex >= 0
          ? line
              .slice(commaIndex + 1)
              .trim()
          : "Unknown Channel";

      const tvgId =
        getAttribute(
          line,
          "tvg-id"
        );

      const groupTitle =
        getAttribute(
          line,
          "group-title"
        );

      const groups =
        groupTitle
          .split(";")
          .map((group) =>
            group.trim()
          )
          .filter(Boolean);

      current = {
        tvgId,

        name: channelName,

        logo:
          getAttribute(
            line,
            "tvg-logo"
          ),

        groups:
          groups.length > 0
            ? groups
            : ["Other"],

        userAgent:
          getAttribute(
            line,
            "user-agent"
          ) || undefined,
      };

      continue;
    }

    /*
     * VLC user-agent directive
     */
    if (
      line.startsWith(
        "#EXTVLCOPT:http-user-agent="
      )
    ) {
      pendingUserAgent =
        line
          .replace(
            "#EXTVLCOPT:http-user-agent=",
            ""
          )
          .trim();

      continue;
    }

    /*
     * Ignore other M3U directives.
     */
    if (line.startsWith("#")) {
      continue;
    }

    /*
     * Stream URL
     */
    if (
      current &&
      (line.startsWith("http://") ||
        line.startsWith("https://"))
    ) {
      const tvgId =
        current.tvgId || "";

      const name =
        current.name ||
        "Unknown Channel";

      const channelIndex =
        channels.length;

      channels.push({
        id: createChannelId(
          channelIndex,
          tvgId,
          name
        ),

        tvgId,

        name,

        logo:
          current.logo || "",

        groups:
          current.groups?.length
            ? current.groups
            : ["Other"],

        url: line,

        userAgent:
          current.userAgent ||
          pendingUserAgent,
      });

      current = null;
      pendingUserAgent =
        undefined;
    }
  }

  return channels;
}