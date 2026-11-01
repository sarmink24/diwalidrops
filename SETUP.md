# DiwaliDrops — Setup & Go-Live Guide

This guide walks you through running DiwaliDrops on your computer and getting it
live for an event. No deep technical background is required — just follow the
steps in order.

**What it is:** a QR code you put in your office Diwali decor. Each scan shows
one unique festive card (a wish, fun task, riddle, or playful dare) from a pool
of 300. No card repeats until all 300 have been shown — then it reshuffles and
loops. Built for AICoE (AI Centre of Excellence) at i-Source Infosystems.

---

## 1. Prerequisites

Before you start, make sure you have:

- **Node.js 18 or newer** — download from <https://nodejs.org> (the "LTS" build
  is perfect). To check what you have, run `node --version` in a terminal.
- **A GitHub account** — <https://github.com> (free). Used to host the code.
- **A Vercel account** — <https://vercel.com> (free). Used to put the app
  online. Signing in with GitHub is the easiest option.

---

## 2. Run it locally (preview on your own computer)

You can preview the whole experience on your machine **without any database**.
With no Redis configured, the app uses an in-memory counter so you can click
through cards right away.

1. Open a terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open <http://localhost:3000> in your browser.

Refresh the page to draw the next card. (See
[Section 8 — Troubleshooting](#8-troubleshooting) for why you may see repeats
locally.)

---

## 3. Create the Upstash Redis store

For a real event you need a shared counter so the "no repeat" rule holds across
**every** phone that scans the QR. We use Upstash Redis for this.

### Option A — through Vercel (recommended)

1. Go to the **Vercel Dashboard** → open **your Project**.
2. Click the **Storage** tab → **Create Database**.
3. Choose **Upstash Redis** (listed under the Marketplace).
4. For the region, pick **AP-SOUTH (Mumbai)** — lowest latency for users in
   India.
5. **Connect** the database to your project.

Vercel automatically injects the connection environment variables into your
project, so you do not have to copy anything by hand.

### Option B — through the Upstash console (manual)

1. Go to <https://console.upstash.com> and create a new **Redis** database.
2. Choose the **Mumbai** region.
3. Open the database and copy its **REST URL** and **REST TOKEN**.
4. Add them to your Vercel project (Settings → Environment Variables) as
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. For local use, put
   the same values in a `.env.local` file (see `.env.example` for the format).

---

## 4. Deploy to the internet

1. Push this repository to **GitHub** (create a new repo and push the code).
2. In **Vercel**, click **New Project** → **import** your GitHub repo.
3. Click **Deploy**. Vercel builds and hosts the app for you.
4. If you added Upstash **after** the first deploy, trigger a **redeploy** so
   the new environment variables take effect.

When it finishes, Vercel gives you a public URL like
`https://your-app.vercel.app`.

---

## 5. Make the QR code

1. Take your deployed URL (for example `https://your-app.vercel.app`).
2. Paste it into any free QR code generator (search "QR code generator" — any of
   them works).
3. Download the QR image, print it, and stick it in your Diwali decoration.

Every scan opens the app and shows the next unique card.

---

## 6. How the "no repeat" magic works

- There is **one shared counter** stored in Upstash Redis under the key
  `diwali:counter`.
- Each scan/refresh **increases the counter by one** (an atomic operation, so
  two phones scanning at the same instant still get different numbers).
- The code uses that number together with a **deterministic per-cycle shuffle**
  of the 300 cards to pick exactly which card to show.
- Because the shuffle order is fixed for a cycle and the counter only ever moves
  forward, **no card repeats** within a cycle of 300.
- After all 300 have been shown, the next cycle **reshuffles** into a new order
  and the loop continues.

---

## 7. Operations (day-to-day management)

Run these commands from the **Upstash console** (open your database → the CLI /
Data Browser).

- **Reset the cycle (start fresh from card 1):**
  ```
  DEL diwali:counter
  ```
  (Setting it to zero works too: `SET diwali:counter 0`.) The next scan starts a
  brand-new shuffled cycle.

- **Check how many scans have happened so far:**
  ```
  GET diwali:counter
  ```

- **Edit the cards:** open `data/cards.json`, change the text (keep the same
  JSON shape — do not change the field names), save, commit, and redeploy.

---

## 8. Troubleshooting

- **First scan is slow (~1 second).** On Vercel's free tier the server may need
  a moment to "wake up" (cold start). Later scans are fast.
- **I see the same cards repeat when testing locally.** That is expected. Local
  development uses the in-memory counter, which resets every time you restart
  `npm run dev`. The true no-repeat guarantee only applies once Upstash Redis is
  connected (production).
- **Env vars don't seem to work after connecting Upstash.** Redeploy the project
  so Vercel picks up the newly injected variables.

---

For a quick technical overview of the project, see [README.md](./README.md).
