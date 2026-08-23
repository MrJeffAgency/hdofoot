HDOFOOT ⚽

HDOFOOT is a responsive football streaming and match-information web app built with Next.js, React, TypeScript, and Tailwind CSS.

It combines football fixtures, live match information, leagues, teams, Match Center pages, live streaming, IPTV channels, entertainment content, and Android TV-friendly navigation into one responsive experience.

---

⚽ Features

Football

- ⚽ Football home page
- 🔴 Live match information
- 📅 Upcoming fixtures
- 🏆 Leagues and competitions
- 👥 Teams
- 📊 Match Center
- 🏟️ Match details
- ⏱️ Live match status and elapsed time
- 🏆 League information
- ⚽ Team names, logos, and scores
- 🌍 Multiple football competitions

📡 Live Match Data

HDOFOOT retrieves football scoreboard information and normalizes it through "lib/football.ts".

Features include:

- ESPN soccer scoreboard integration
- TheSportsDB fallback
- Real football fixtures
- Live match detection
- Upcoming match detection
- Match status mapping
- League information
- Team names and logos
- Live scores
- Match Center links
- Automatic data refresh

Supported Competitions

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

---

📺 Live Streaming & IPTV

HDOFOOT includes a separate live-streaming system for available IPTV channels.

Features include:

- 📺 Live TV channels
- 📡 IPTV channel section
- HLS ".m3u8" playback
- Channel logos
- Channel categories
- LivePlayer component
- Watch Live controls
- M3U/M3U8-based streaming support

Live channels are stored in:

data/live.json

Important

Football match information and live video streams are separate systems.

Football data

ESPN
  ↓
Fixtures
Scores
Match status
League data
Team data
Match Center

Live streaming

data/live.json
  ↓
Live channels
  ↓
HLS .m3u8 streams
  ↓
LivePlayer

This separation allows football information to continue working independently from the IPTV/live-streaming system.

---

🎬 Entertainment

HDOFOOT also includes entertainment sections such as:

- 🎬 Movies
- 📺 TV Shows
- ▶️ Local Videos
- WWE

The local video library allows supported video files stored on the user's device to be accessed through the HDOFOOT interface without uploading those files to the application server.

---

📱 Responsive Interface

HDOFOOT is designed for multiple screen types.

Mobile

The mobile interface includes a touch-friendly bottom navigation bar with:

- 🏠 Home
- 🔴 Live
- 📅 Fixtures
- 🏆 Leagues
- 👥 Teams

Desktop

The desktop interface uses a sidebar navigation system for quick access to the main sections.

Android TV

HDOFOOT includes TV-friendly navigation designed for remote controls and D-pad input.

Features include:

- D-pad navigation
- Keyboard navigation
- ".tv-focus"
- ".tv-nav-item"
- Clear focus states
- Large navigation targets
- TV-friendly navigation paths
- Touch-friendly controls

---

🧭 Navigation

Mobile

Home
Live
Fixtures
Leagues
Teams

Desktop

Sidebar
├── Home
├── Live Matches
├── Fixtures
├── Leagues
└── Teams

Android TV

The interface uses the same core navigation while adding D-pad-friendly focus states and larger interactive targets.

---

🛠️ Technology

HDOFOOT is built with:

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- ESPN Soccer API
- TheSportsDB
- HLS playback
- Supabase
- Emby
- IPTV / M3U8 streams

---

📁 Project Structure

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
├── videos/
└── ...

components/
├── LiveMatches.tsx
├── LivePlayer.tsx
├── LocalVideoPlayer.tsx
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

---

⚽ Football Data Architecture

Football data is normalized through:

lib/football.ts

The application retrieves scoreboard data, normalizes the responses, and converts them into the fixture structure used throughout HDOFOOT.

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
│   ├── id
│   ├── name
│   ├── logo
│   └── winner
└── away
    ├── id
    ├── name
    ├── logo
    └── winner

goals
├── home
└── away

---

📡 Live Stream Data

Live channels are stored separately in:

data/live.json

A channel can contain information such as:

{
  "id": "channel-id",
  "name": "Channel Name",
  "logo": "https://example.com/logo.png",
  "group": "Sports",
  "stream": "https://example.com/live/stream.m3u8"
}

The live-streaming interface uses "LivePlayer" to handle supported HLS streams.

---

🏟️ Match Center

Football matches use the route:

/match/[fixtureId]

For example:

/match/401879322

The Match Center provides information for the selected football fixture, including available match information, teams, scores, competition details, and live status.

---

🎥 Local Video Library

HDOFOOT can access supported video files stored locally on the user's device.

The video library uses the browser's local file/folder access capabilities rather than uploading the user's personal videos to the HDOFOOT server.

Supported formats depend on the browser and device. MP4 using H.264/AAC is recommended for the widest compatibility.

The local video system includes:

app/videos/
    ↓
Local video library
    ↓
LocalVideoPlayer
    ↓
Browser / Android video playback

---

🔐 Authentication

HDOFOOT can use Supabase authentication for protected application areas and server-side authentication checks.

Private configuration should be stored in environment variables and should never be committed to Git.

---

🚀 Development

1. Clone the repository

git clone <your-repository-url>
cd hdofoot

2. Install dependencies

npm install

3. Configure environment variables

Create:

.env.local

Example:

API_FOOTBALL_KEY=your_api_key
TMDB_API_KEY=your_tmdb_key

Add any additional configuration required by the project, including Supabase, Emby, authentication, or streaming services.

4. Start the development server

npm run dev

Open:

http://localhost:3000

---

🏗️ Production Build

Create a production build:

npm run build

Start the production server:

npm start

---

🧩 Architecture

HDOFOOT separates football information from video streaming.

                         HDOFOOT
                            │
             ┌──────────────┴──────────────┐
             │                             │
      Football Data                 Live Streaming
             │                             │
      ┌──────┴──────┐                 data/live.json
      │             │                       │
    ESPN       TheSportsDB                   │
      │             │                       ▼
      └──────┬──────┘                Live Channels
             │                        HLS Streams
             ▼                        LivePlayer
        lib/football.ts
             │
     ┌───────┼────────┐
     │       │        │
 Fixtures  Scores  Match Center
     │       │        │
     └───────┴────────┘

This architecture keeps football data and video streaming independent, making the application easier to maintain and expand.

---

📱 Platform Support

HDOFOOT is designed to work across:

- 📱 Android phones
- 📱 Mobile browsers
- 💻 Desktop browsers
- 📺 Android TV
- 🖥️ Large-screen displays

The interface adapts navigation and controls depending on the device and input method.

---

🔒 Privacy & Security

HDOFOOT should not store private API keys, authentication secrets, or other sensitive configuration in the Git repository.

Use environment variables for private configuration.

Local videos accessed through the browser's file/folder APIs remain on the user's device unless the application explicitly implements a separate upload feature.

---

📌 Project Status

HDOFOOT is an actively developed project.

Features and supported data sources may change as the application evolves.

---

📄 License

This project is intended for personal development and testing purposes.

Use third-party APIs, media, logos, streams, and other content according to their respective terms, licenses, and applicable laws.
