HDOFOOT ⚽

HDOFOOT is a responsive football streaming and match-information web app built with Next.js, React, TypeScript, and Tailwind CSS.

It combines real football match data, live match information, fixtures, match centers, IPTV/live streams, and TV-friendly navigation into one responsive experience.

Features

⚽ Football

- ⚽ Football home page
- 🔴 Live match information
- 📅 Upcoming fixtures
- 🏆 Leagues
- 👥 Teams
- 📊 Match Center
- 🏟️ Match details and live scores
- ⏱️ Live match status and elapsed time
- 🌍 Multiple football competitions

📡 Live Match Data

- ESPN soccer scoreboard integration
- Real football fixtures
- Live match detection
- Upcoming match detection
- Match status mapping
- League information
- Team names and logos
- Live scores
- Match Center links
- Automatic data refresh

Supported competitions include:

- Premier League
- La Liga
- Serie A
- Bundesliga
- Ligue 1
- Eredivisie
- Primeira Liga
- Belgian Pro League
- Scottish Premiership
- Turkish Super Lig
- UEFA Champions League
- UEFA Europa League
- UEFA Conference League

📺 Live Streaming

- IPTV/live channel section
- "data/live.json" channel database
- HLS ".m3u8" playback
- Live channel logos
- Channel categories
- LivePlayer component
- Watch Live controls

Important: ESPN match data and IPTV/live streams are separate systems.

ESPN is used for football match information, scores, fixtures, and Match Center data.

"data/live.json" is used for available live video streams.

🎬 Entertainment

- 🎬 Movies
- 📺 TV Shows
- ▶️ Videos
- WWE section

📱 Responsive Interface

- Mobile-friendly layout
- Desktop interface
- Android TV support
- D-pad navigation
- Keyboard-friendly navigation
- TV focus states
- Touch-friendly controls
- Mobile bottom navigation
- Desktop sidebar navigation

Navigation

Mobile

The mobile interface uses a bottom navigation bar for quick access to:

- Home
- Live
- Fixtures
- Leagues
- Teams

Desktop

The desktop interface uses a sidebar navigation system.

Android TV

HDOFOOT includes TV-friendly navigation with:

- D-pad focus support
- ".tv-focus"
- ".tv-nav-item"
- Clear keyboard/focus states
- Large touch/D-pad targets
- TV-friendly navigation paths

Technology

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- ESPN Soccer API
- HLS playback
- Supabase authentication
- Emby integration
- IPTV/M3U8 streams

Project Structure

app/
├── page.tsx
├── live/
├── live-matches/
├── fixtures/
├── leagues/
├── teams/
├── match/
│   └── [fixtureId]/
├── wwe/
├── movie/
├── tv/
└── ...

components/
├── LiveMatches.tsx
├── LivePlayer.tsx
├── Icons.tsx
├── MobileNav.tsx
├── Sidebar.tsx
└── ...

data/
└── live.json

lib/
└── football.ts

public/
└── football-hero.jpg

Football Data

Football match data is normalized through:

lib/football.ts

The application retrieves scoreboard data, normalizes the ESPN response, and converts it into the fixture structure used throughout HDOFOOT.

The normalized fixture structure contains:

fixture
├── id
├── date
└── status

league
├── id
├── name
└── logo

teams
├── home
└── away

goals
├── home
└── away

Live Streams

Live video channels are stored separately in:

data/live.json

Each channel can contain:

{
  "id": "channel-id",
  "name": "Channel Name",
  "logo": "https://example.com/logo.png",
  "group": "Sports",
  "stream": "https://example.com/live/stream.m3u8"
}

The "LiveMatches" component handles the live-stream interface and uses "LivePlayer" for HLS playback.

Match Center

Football matches use the route:

/match/[fixtureId]

Example:

/match/401879322

The Match Center displays information for the selected ESPN fixture.

Development

Install dependencies:

npm install

Start the development server:

npm run dev

Open:

http://localhost:3000

Build

Create a production build:

npm run build

Start the production server:

npm start

Environment Variables

Create a ".env.local" file for required private configuration.

Example:

API_FOOTBALL_KEY=your_api_key
TMDB_API_KEY=your_tmdb_key

Add any additional authentication, Supabase, Emby, or streaming configuration required by the project.

Architecture

HDOFOOT separates football information from video streaming.

                    HDOFOOT
                       │
        ┌──────────────┴──────────────┐
        │                             │
 Football Match Data             Live Streaming
        │                             │
       ESPN                     data/live.json
        │                             │
        ▼                             ▼
 Fixtures / Scores              Live Channels
 Match Center                   HLS Streams
 League Data                    LivePlayer
 Team Data

This allows football match information to continue working independently from the IPTV/live-stream system.

License

This project is for personal development and testing purposes.