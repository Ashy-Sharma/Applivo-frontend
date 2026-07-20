# Applivo — Frontend

React client for Applivo — browse Android apps, upload APKs, and interact with live emulator sessions in the browser.

**Backend repo (primary — full architecture, feature list, and setup):** [Applivo-Backend](https://github.com/Ashy-Sharma/Applivo-Backend)

> This repo is the client half of a two-repo project. It has no backend logic of its own and won't do anything useful without the [Applivo-Backend](https://github.com/Ashy-Sharma/Applivo-Backend) API running alongside it.

---

## Screenshots

*(hosted in the backend repo — see it for the full set and context)*

| Discover | Live Demo Session |
|---|---|
| ![Discover page](https://raw.githubusercontent.com/Ashy-Sharma/Applivo-Backend/main/docs/screenshots/discover.png) | ![Live demo](https://raw.githubusercontent.com/Ashy-Sharma/Applivo-Backend/main/docs/screenshots/session.png) |

## Tech stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4, custom design tokens (Material-adjacent surface/color system) |
| HTTP | Axios, with an interceptor that transparently refreshes an expired access token (single in-flight refresh, deduplicated across concurrent requests) and force-logs-out on refresh failure |
| Real-time | STOMP over SockJS (`@stomp/stompjs`, `sockjs-client`) |
| Icons | lucide-react |

## What's actually implemented

The original design doc scoped 8 pages including a separate registration page and a developer analytics dashboard. What's actually built:

- **Login / Register** — single page, tabbed (not separate routes)
- **Discover** — paginated public app browsing with debounced search (400ms), search state synced to the URL
- **App detail** — version list, "Try demo" (redirects to login first if not authenticated, then back to the intended app)
- **Developer dashboard** — app list with expandable version history, publish/unpublish, delete, version activation
- **Upload flow** — two-step (create app metadata, then upload an APK version) with a progress bar, and displays the backend's ABI compatibility warning if the uploaded APK may not run on the emulator
- **Live demo viewer** — polls session status until the emulator is `ACTIVE`, then opens a WebSocket connection; renders streamed screenshots, maps clicks/swipes to emulator coordinates (accounting for letterboxing from `object-contain` image scaling), supports on-screen text input and hardware buttons (back/home/recent)

**Not implemented:** analytics dashboard, admin panel, icon/avatar upload. These match the same gaps documented in the backend README — cut from scope to prioritize the core upload → live-session pipeline within the build timeline.

## Project structure

```
src/
├── pages/           # Login, Discover, AppDetails, Dashboard, Upload, Emulator, NotFound
├── components/       # Header, Footer, AppCard, Spinner, ErrorBanner
├── auth/             # AuthContext, ProtectedRoute
├── api/               # Axios client + per-resource request functions
├── hooks/            # useDemoSocket (WebSocket connection + message handling)
├── utils/            # Token storage, coordinate mapping for tap/swipe accuracy
├── types.ts
└── config.ts
```

## Running it locally

Requires the [backend](https://github.com/Ashy-Sharma/Applivo-Backend) running first (via its own `docker compose up`).

```bash
git clone https://github.com/Ashy-Sharma/Applivo-frontend.git
cd Applivo-frontend

cp .env.example .env   # defaults point at http://localhost:8080, adjust if needed

npm install
npm run dev
```

Runs at `http://localhost:5173`.

### Available scripts

| Command | Does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`tsc --noEmit`) then production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Type-check only (`tsc --noEmit`) |

## Notes on a couple of tradeoffs

- **JWT stored in `localStorage`, not an httpOnly cookie.** This is a known, documented tradeoff (see backend README) — simpler for WebSocket auth (the token needs to be readable by JS to attach to the STOMP CONNECT frame), at the cost of XSS exposure that a cookie-based approach would avoid. Worth knowing the tradeoff exists, not something that was missed.
- **Coordinate mapping accounts for `object-contain` letterboxing** — tap/swipe accuracy depends on computing the actual rendered image rect inside its container, not just the container's bounding box. See `src/utils/coordinateMapper.ts` if the "why" isn't obvious from the code alone.

## License

MIT — see [LICENSE](LICENSE).
