# User Analytics Dashboard

A lightweight, full-stack session tracking and analytics platform — built to understand how people actually use a webpage, one click and one page view at a time.

Most analytics tools bury you in features you'll never touch. This one does three things and does them well: it tracks what users do, it stores it cleanly, and it shows it back to you in a dashboard that doesn't get in your way.

## What it does

Drop a single script tag into any webpage and it starts silently recording two things — page views and clicks, each tied to a session that persists across the visit. Every click captures exactly where on the screen it happened and what element it landed on. That data flows into MongoDB, gets served through a small set of REST APIs, and shows up live in a React dashboard with two views: a session-by-session journey of every visitor, and a heatmap of where clicks actually concentrate on a given page.

No accounts, no SDKs, no bloat. Just the data you need to see how a page is actually being used.

## Tech stack

**Frontend**
- React (Vite)
- React Router for navigation
- Recharts for the dashboard charts
- Axios for API calls

**Backend**
- Node.js + Express
- MongoDB with Mongoose

**Tracking**
- A dependency-free vanilla JavaScript snippet, framework-agnostic, works on any webpage

## Project structure

```
user_analytics_dashboard/
├── Backend/
│   ├── public/
│   │   ├── index.html        ← compiled dashboard (production build)
│   │   ├── assets/
│   │   ├── tracker.js        ← client-side tracking script
│   │   └── demo.html         ← sample page wired up with the tracker
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── config/
│   ├── server.js
│   └── package.json
├── Frontend/
│   ├── src/
│   └── package.json
└── Tracker/
    ├── tracker.js
    └── demo.html
```

## How tracking works

The script generates a session ID on first load and stores it in `localStorage`, so every page view and click within that browser session gets grouped together automatically. Two events are tracked:

- **`page_view`** — fired once when the script loads on a page
- **`click`** — fired on every click anywhere on the page, capturing the exact `x`/`y` coordinates and basic info about the element clicked (tag, text, id, class)

Every event is sent to the backend as it happens, with no batching or delay — what you see in the dashboard reflects what's happening in near real time.

## Setup

### 1. Backend

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:
```
MONGO_URI=your_mongodb_connection_string
```

Run it:
```bash
npm run dev
```
The API will be live at `http://localhost:5000`.

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```
The dashboard will be live at `http://localhost:5173`.

### 3. Try the tracker

Open `Backend/public/demo.html` in your browser (or visit it through the running backend) and click around. Then open the dashboard — your session, events, and clicks should appear within seconds.

### Single-deployment setup (optional)

For production, the frontend is built and served directly from the backend, so the whole app runs on one URL:

```bash
cd Frontend
npm run build
cp -r dist ../Backend/public
```

Then start the backend with `NODE_ENV=production`, and it'll serve both the dashboard and the API from the same port.

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/analytics/events` | Record a new event |
| `GET` | `/api/analytics/sessions` | List sessions with event counts (paginated) |
| `GET` | `/api/analytics/sessions/:sessionId/events` | Full ordered event journey for one session |
| `GET` | `/api/analytics/heatmap?page_url=/path` | Click distribution data for a given page |
| `GET` | `/api/analytics/stats` | Aggregate platform stats |

## Assumptions and trade-offs

- **Session identity** is purely client-side (`localStorage`), with no server-side auth or fingerprinting — good enough for behavioral tracking, not for uniquely identifying real-world users across devices.
- **Heatmap density** is computed by bucketing clicks into 50px grid cells rather than rendering every raw point — this keeps the visualization readable on pages with thousands of clicks, at the cost of pixel-level precision.
- **No real-time sockets.** The dashboard polls for fresh stats every 30 seconds instead of using WebSockets, which keeps the backend simpler at the cost of slight latency on live updates.
- **No authentication layer** was built for the dashboard itself, since the assignment scope was focused on the tracking and analytics pipeline rather than access control.
- **Events are sent immediately, not batched** — simpler to reason about and debug, though it does mean more individual network requests on click-heavy pages.

## Live demo

- Dashboard: `[add your deployed URL here]`
- Demo tracking page: `[add your deployed URL here]/demo.html`
