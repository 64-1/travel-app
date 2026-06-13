# Travel Planner

Turn your saved posts and reviews into a flexible day-by-day plan.

## Features

- **English & 中文** language switcher (auto-detects Chinese browser locale)
- Wishlist-first: paste Xiaohongshu, Google Maps links, or place names
- AI-curated suggestions with 2–3 alternatives per block
- Flexible daily timeline (not minute-by-minute)
- Neighborhood clustering and day map
- Regenerate with reason, drag-reorder blocks
- Export markdown, share read-only link
- PWA for offline day view

## Setup

```bash
cd travel-planner
cp .env.example .env
# Set DATABASE_URL to a PostgreSQL URL (free tier: https://neon.tech)
# Optional: set OPENAI_API_KEY for live AI (works with mock data without it)

npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

See [DEPLOY.md](DEPLOY.md) for step-by-step instructions. Vercel + Neon Postgres avoids local dev cache issues and gives you a stable public URL.

## Monorepo

- `apps/web` — Next.js 15 web app
- `packages/core` — shared types, Zod schemas, validation
- `prisma` — SQLite database schema

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL ([Neon](https://neon.tech) free tier) |
| `OPENAI_API_KEY` | No | Enables live AI; mock data used if unset |
| `SERPER_API_KEY` | No | Web search grounding (future) |
| `GOOGLE_PLACES_API_KEY` | No | Hours/coordinates lookup (future) |

## License

MIT — see [LICENSE](LICENSE). You may use, modify, and share the code with attribution.
