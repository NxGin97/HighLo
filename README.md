# HighLo Dashboard

A UI-first React app for the HighLo blackjack table-assist system. All
computer-vision data is currently **mocked** with realistic, non-empty
defaults (see `src/state/mockData.js`) so every screen looks like a hand is
already in progress. Swap the mock for a live feed via `src/config.js` —
nothing else needs to change.

## Run it

```bash
npm install
npm run dev
```

## Where the Raspberry Pi plugs in (`src/config.js`)

- `CAMERA_STREAM_URL` — point this at your MJPEG/HLS stream and
  `CameraFeed.jsx` will swap the grey placeholder box for a real `<img>`.
- `DETECTION_SOCKET_URL` — a WebSocket URL. `AppStateContext.jsx` already
  opens the socket and expects JSON frames shaped like
  `{ occupancy, players, dealer, recommendation, countHistory, shoeStats }`
  (see `mockData.js` for the exact shape of each). Any field you omit just
  keeps its last-known value.
- `API_BASE_URL` — REST base for real auth/history once you have a backend;
  `Login.jsx` currently simulates a successful login for any non-empty
  username.

## Structure

- `src/components/Card.jsx` — the standalone card component + deck/value
  helpers, as requested, in its own file.
- `src/components/` — CameraFeed, ActivePlayers (incl. per-seat panel +
  correction modal), RecommendationPanel, CountHistory, Nav, MobileTabBar.
- `src/pages/` — Login, SeatSelection, MasterView (desktop dashboard),
  TableView, AnalysisView, RunningCountView.
- `src/pages/mobile/` — MobileCurrentHand, MobileAnalysis,
  MobileRunningCount (the three mobile-only screens called for in the spec).
- `src/state/AppStateContext.jsx` — session, seat, and live-table state.

## Things I couldn't fully resolve from the spec (flagged rather than guessed silently)

1. **Real auth/backend** — there's no login/register API in the brief, so
   `Login.jsx` simulates success for any username. You'll want to swap this
   for real calls to `API_BASE_URL` once that exists.
2. **Gesture recognition output** — the spec says the CV system should
   *detect* Hit/Stand/Double/Leaver gestures, but doesn't say how that should
   surface in the UI beyond the `lastAction` I show on each seat. I didn't
   build a distinct "gesture detected" animation/toast since it wasn't
   specified — easy to add once you know what the Pi will emit.
3. **"Multiple users may select the same seat"** — implemented (seat
   selection isn't exclusive), but there's no shared indicator showing *who
   else* picked the same seat, since the spec doesn't say whether that
   should be visible to others.
4. **Split-hand layout** — I render extra hand panels stacked vertically
   inside the same seat card when `hand.isSplit` is true; the spec doesn't
   specify exact placement, so this is a reasonable default.
5. **Card correction persistence** — corrections are per-browser-session
   (React state), not written to `localStorage`/a backend, since the spec
   only says corrections shouldn't affect other users, not whether they
   should survive a refresh.
6. **Dealer display** — the spec's "Active Players" component is about
   player seats; I added a minimal `dealer` object in state (up card +
   hole-card-known flag) for future use, but there's no dedicated dealer UI
   yet since the spec didn't describe one explicitly.
7. **Analysis "improvement trends" chart** — built as a simple bar chart
   over a handful of sessions; the spec doesn't specify exact metrics or
   chart type beyond "improvement trends."
8. **Occupancy → seat-vacancy prompt** — I trigger it whenever
   `occupancy[selectedSeat]` flips to `false`, and it offers "switch seats"
   or "end session" as specified. What counts as a brief camera glitch vs. a
   real leave (debouncing) is a backend/CV concern I left open.
