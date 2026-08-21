export interface MatchStream {
  url: string;
  type: "hls" | "dash" | "iframe";
  title?: string;
}

/**
 * Return a stream supplied by a legitimate/licensed provider.
 *
 * Do NOT put scraped, pirated, or third-party unauthorized
 * streaming URLs here.
 */
export async function getMatchStream(
  fixtureId: string
): Promise<MatchStream | null> {
  // TODO:
  // Connect this to your licensed streaming provider.
  //
  // Example:
  // const response = await fetch(
  //   `${process.env.STREAM_PROVIDER_URL}/matches/${fixtureId}`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${process.env.STREAM_PROVIDER_API_KEY}`,
  //     },
  //     cache: "no-store",
  //   }
  // );
  //
  // if (!response.ok) return null;
  //
  // const data = await response.json();
  //
  // return data.stream ?? null;

  return null;
}