# 📚 Brainfeed — Books, Podcasts & Media Tracker

A beautiful personal tracker for everything you read, listen to, and watch.

## Features
- **Books** — log with status (reading/finished), mood, reflection, cover art (auto-fetched from Open Library), star rating, yearly goal with ring visualisation
- **Podcasts** — log episodes, duration, tags, key takeaways, cover art (auto-fetched from iTunes)
- **Movies & Series** — log with type (movie/series/documentary/anime), review, favourite scene, cover art (auto-fetched from OMDb), rewatch flag
- **Dashboard** — unified stats, bar/pie charts, genre breakdown, recent activity feed
- **Cover auto-fetch** — one click fetches cover images from free APIs by title

## Stack
| | |
|---|---|
| Frontend | React 18 + Vite + React Router v6 + Recharts |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) — zero config |

## Quick Start

```bash
# 1. Install everything
npm run install:all

# 2. Copy env file
cp server/.env.example server/.env   # Mac/Linux
copy server\.env.example server\.env  # Windows

# 3. Run (starts both servers)
npm run dev
```

Open **http://localhost:5173**

## Deploy on Railway
1. Push to GitHub
2. Railway → New Project → from GitHub
3. Add Volume at `/var/data`
4. Set env vars: `NODE_ENV=production`, `DB_PATH=/var/data/shelf.db`
