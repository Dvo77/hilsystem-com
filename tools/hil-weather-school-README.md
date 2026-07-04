## Weather School

**File:** hil-weather-school.html
**URL:** hilsystem.com/tools/hil-weather-school.html
**Status:** Beta

**Purpose:** A per-member weather observation journal and prediction game —
kids log what they actually observe outside, compare it against the day's
forecast, and work through a few short lessons on basic meteorology.

**Core Features:**
- Live forecast card (current conditions + today's high/low) pulled through
  a Cloudflare Worker proxy so the OpenWeatherMap API key stays server-side
- Daily observation log: condition, high/low temp, free-text notes — each
  entry snapshots the forecast at the moment it's logged, so grading
  accuracy doesn't drift if the forecast changes later in the day
- Prediction accuracy stat: percentage of logged observations whose
  condition matched the forecast snapshot
- Three short lessons with multiple-choice quizzes: Cloud Types, The Water
  Cycle, Reading a Forecast
- Two badges tied to this module: Weather Watcher (5 observations logged),
  Junior Meteorologist (all lessons complete)
- Weather Journal project record: auto-updates as observations are logged,
  intended as a portfolio/documentation artifact for later homeschool
  reporting use

**How it connects:**
- Reads from: `users/{uid}.weather_location` (lat/lon set via browser
  geolocation), `team_members/{memberId}/weather_logs`, `/weather_quiz_results`
- Writes to: `weather_logs`, `weather_quiz_results`, `badges` (frontend-writable,
  same doctrine as the rest of Guild), and upserts a single
  `learning_projects/weather-journal` doc per member
- External dependency: `hil-weather-proxy` Cloudflare Worker, which holds the
  OpenWeatherMap key and must be deployed and reachable for the forecast card
  to load at all — without it, logging still works, but with no forecast
  snapshot to grade against
- Entry points: reachable only through Guild's Weather School module card,
  not in the main platform nav

**Known limitations / not yet live:**
- "Today's forecast" is derived by filtering the free-tier 5-day/3-hour
  OpenWeatherMap endpoint for today's local-date slices, not a true daily
  forecast (that's behind OpenWeatherMap's paid One Call API) — fine for a
  kids' prediction game, not precise enough to rely on for anything else
- Only 3 lessons exist right now — this is an MVP set, not a full curriculum
- Location is set manually via a browser geolocation prompt; there's no tie
  into a property/address record elsewhere in HIL yet
- Badge catalog is duplicated here, in Guild, and in Family Ledger — no
  shared source of truth

**Common questions this tool answers:**
- "How do I log today's weather?" → Fill out the observation form (condition,
  high, low, notes) and hit Log Observation — it also grades your prediction
  against the actual forecast automatically.
- "Why doesn't the forecast show up?" → Needs a location set first (Set
  Location button, uses your browser's location) — and needs the weather
  proxy Worker to be deployed and reachable.
- "What do I need to do to get the Weather Watcher badge?" → Log 5
  observations for that member.
- "Is this connected to my homeschool records?" → It writes to a Weather
  Journal project record meant for that purpose eventually, but there's no
  export or report generator built yet — the data exists, the reporting
  layer doesn't.
