# Deploy to Vercel

Vercel runs a fresh production build on every deploy — no corrupted `.next` cache or stuck local dev servers.

## 1. Push to GitHub

```bash
cd travel-planner
git init   # if not already
git add .
git commit -m "Prepare for Vercel deploy"
git remote add origin https://github.com/YOUR_USER/travel-planner.git
git push -u origin main
```

## 2. Create a free database (Neon)

SQLite does not work on Vercel (serverless, no persistent disk). Use [Neon](https://neon.tech) (free):

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. Copy the **pooled** connection string (`…-pooler.…`)
3. It looks like: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## 3. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. **Root Directory:** `apps/web` (important for this monorepo)
4. Framework should auto-detect **Next.js**

### Environment variables

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon pooled connection string |
| `OPENAI_API_KEY` | Optional — your OpenAI key |
| `NEXT_PUBLIC_BASE_URL` | `https://YOUR_APP.vercel.app` (after first deploy) |

5. Click **Deploy**

Vercel runs `prisma migrate deploy` during build to create tables automatically.

## 4. Redeploy after setting `NEXT_PUBLIC_BASE_URL`

Share links use this URL. Set it to your production domain, then redeploy once.

## Local dev with Postgres

Update your local `.env` to use the same Neon database (or a separate Neon branch):

```env
DATABASE_URL="postgresql://..."
```

Then:

```bash
npm run setup
npm run dev
```

## CLI deploy (optional)

```bash
npm i -g vercel
cd apps/web
vercel
```

Follow prompts; set Root Directory is already configured via `vercel.json`.
