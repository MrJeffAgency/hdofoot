const EMBY_SERVER_URL = process.env.EMBY_SERVER_URL;
const EMBY_API_KEY = process.env.EMBY_API_KEY;
const EMBY_USER_ID = process.env.EMBY_USER_ID;

if (!EMBY_SERVER_URL) {
  throw new Error("Missing EMBY_SERVER_URL");
}

if (!EMBY_API_KEY) {
  throw new Error("Missing EMBY_API_KEY");
}

if (!EMBY_USER_ID) {
  throw new Error("Missing EMBY_USER_ID");
}

// After the checks above, TypeScript knows these are strings.
const serverUrl: string = EMBY_SERVER_URL;
const apiKey: string = EMBY_API_KEY;
const userId: string = EMBY_USER_ID;

export async function getEmbyItem(itemId: string) {
  const url =
    `${serverUrl}/Users/${userId}/Items/${itemId}` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Emby item request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function getEmbyPlaybackInfo(itemId: string) {
  const url =
    `${serverUrl}/Items/${itemId}/PlaybackInfo` +
    `?UserId=${encodeURIComponent(userId)}` +
    `&api_key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Emby playback request failed: ${response.status}`
    );
  }

  return response.json();
}