export async function getFixtures(date: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY is not configured");
  }

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?date=${date}`,
    {
      headers: {
        "x-apisports-key": apiKey,
      },
      next: {
        revalidate: 30,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch fixtures");
  }

  const data = await response.json();

  return data.response ?? [];
}