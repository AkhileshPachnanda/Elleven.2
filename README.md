# Eleven.2 — ISRO Mission Control

A real-time 3D orbital tracking dashboard for ISRO assets and notable international satellites (including the ISS), combining live orbital mechanics with AI-generated mission intelligence in an interactive WebGL "command center" interface.

**Live demo:** [eleventwo.vercel.app](https://eleventwo.vercel.app)


<img width="1892" height="1046" alt="image" src="https://github.com/user-attachments/assets/a4d83a3d-142f-464c-9cb5-9941df7dc4ac" />

---

## Overview

Eleven.2 renders a live, navigable 3D globe with satellites propagated using real orbital mechanics. Selecting a satellite triggers an AI-generated operational summary, and a time scrubber lets you move the simulation forward or backward while positions recompute in real time.

## Architecture

The application uses a decoupled client-server architecture with a **Backend-For-Frontend (BFF)** pattern — the backend exists specifically to keep third-party API keys off the client and to cache expensive upstream calls.


<img width="800" height="450" alt="Recording2026-07-10234735-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/5ab57941-3419-4dda-ada6-e4b93ac6f3a8" />

```
┌─────────────────────────────┐        ┌───────────────────────────┐
│   Frontend (React 19 + Vite) │        │   Backend (Node + Express) │
│                              │        │                            │
│  three.js / R3F / drei      │◄──────►│  /api/celestrak            │
│  satellite.js (SGP4, Wasm)  │  HTTP  │  /api/groq                  │
│  framer-motion UI           │        │  node-cache (TLE: 6h,       │
│                              │        │              AI summary: 1h)│
└─────────────────────────────┘        └────────────┬──────────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          ▼                       ▼
                                    CelesTrak API           Groq LLM API
                                  (orbital TLE data)   (llama-3.3-70b-versatile)
```

### Frontend
- **React 19** on **Vite**, with Rollup/Rolldown production builds
- **three.js**, wrapped via **@react-three/fiber** and **@react-three/drei** for declarative WebGL
- **framer-motion** for layout transitions, including a responsive sidebar-to-bottom-sheet transform on mobile
- **satellite.js (v7)** runs client-side using WebAssembly + pthreads to compute orbital mechanics without blocking the main thread

### Backend
- **Node.js + Express**, with `cors` and `express-rate-limit`
- **node-cache** as an in-memory cache layer for TLE data and AI-generated summaries, reducing both latency and upstream API cost

## Core Physics

### Two-Line Elements (TLE)
The backend fetches the latest TLE for each tracked object from **CelesTrak** and refreshes them every 6 hours to account for orbital drift from atmospheric drag.

### SGP4 Propagation
`satellite.js` implements the SGP4 (Simplified General Perturbations) model in `src/lib/propogator.js`, taking a TLE and a timestamp (real-time or simulated) and returning geodetic position — latitude, longitude, and altitude in kilometers.

### Coordinate Conversion
Geodetic coordinates are converted to Cartesian (X, Y, Z) space for the 3D globe via `latLngToVector3`, computing radius as Earth radius + satellite altitude and applying standard spherical-to-Cartesian trigonometry.

## AI Mission Intelligence

When a satellite is selected, the backend builds a prompt from its metadata (orbit type, launch date, mission) and sends it to **Groq's `llama-3.3-70b-versatile`**, returning a concise three-sentence operational summary. Responses are cached per-satellite for one hour to avoid redundant generation for frequently viewed objects.

<img width="1872" height="1043" alt="image" src="https://github.com/user-attachments/assets/cb304e90-9590-464c-ac5f-dfb8d5bf23ff" />


## Engineering Highlights

A few non-trivial problems solved during development:

- **Top-level await in Wasm workers:** `satellite.js`'s WebAssembly pthreads rely on ES Module top-level await, which broke Vite's default IIFE worker bundling. Fixed by setting `target: 'esnext'` and `worker: { format: 'es' }` in `vite.config.js`.
- **Mobile layout paradigm shift:** fixed sidebars were covering the globe on small screens. Replaced with a custom `useMediaQuery` hook that morphs sidebars into layered, `framer-motion`-animated bottom sheets below 768px, keeping the top 55% of the viewport clear for the 3D camera.
- **Time scrubber performance:** dragging the timeline was firing hundreds of position recomputations per second, causing frame drops. Quantized scrubber input to 5-minute intervals, cutting recomputation load by ~99% with no visible loss of smoothness.
- **Selective high-fidelity assets:** the ISS uses a dedicated, heavier GLTF model (scaled from a 44MB source) loaded only when `noradId === 25544`, with background prefetching to avoid pop-in.
- **Production hardening pass** (documented in `PRODUCTION_REFACTOR_REPORT_2026-05-27.md`): converted satellite propagation to chunked async batches, added mount/run-guards (`isMountedRef`, `computeRunIdRef`) to prevent stale state commits after unmount, introduced `AbortController` on data-fetch effects to cancel in-flight requests on selection change, and memoized derived state/handlers (`useMemo`/`useCallback`) across the command center and time scrubber components to cut unnecessary re-renders.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19, Vite |
| 3D rendering | three.js, @react-three/fiber, @react-three/drei |
| Orbital mechanics | satellite.js (SGP4, WebAssembly) |
| Animation/UI | framer-motion |
| Backend | Node.js, Express, express-rate-limit, cors |
| Caching | node-cache |
| Data sources | CelesTrak (TLE), Groq API (AI summaries) |
| Deployment | Docker, Vercel (frontend) |

## Getting Started

### Prerequisites
- Node.js 20+
- A Groq API key

### Setup

```bash
git clone https://github.com/AkhileshPachnanda/Eleven.2_ISRO-Fleet-Tracking-Orbital-Analytics.git
cd Eleven.2_ISRO-Fleet-Tracking-Orbital-Analytics

# Backend
cd backend
npm install
cp .env.example .env   # add your GROQ_API_KEY
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## Roadmap

- Historical orbit playback beyond the current time scrubber range
- Additional satellite constellations (GPS, GLONASS) beyond current ISRO/ISS coverage
- WebSocket push for live TLE updates instead of polling on refresh

## License

MIT
