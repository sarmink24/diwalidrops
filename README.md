# DiwaliDrops

A QR code tucked into the office Diwali decor. Each scan shows **one unique
festive card** — a wish, a fun task, a riddle, or a playful dare — drawn from a
pool of **300**. No card repeats until all 300 have been shown; then the pool
reshuffles and the loop continues.

Built for **AICoE (AI Centre of Excellence)** at **i-Source Infosystems**.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Upstash Redis** for the shared, atomic scan counter
- Deployed on **Vercel**

## How global no-repeat works

- A single atomic counter lives in Upstash Redis under the key
  `diwali:counter`.
- Every scan/refresh increments that counter by one. Because the increment is
  atomic, simultaneous scans still receive distinct numbers.
- The counter value, combined with a **deterministic per-cycle seeded shuffle**
  of the 300 cards, selects exactly one card.
- Since the shuffle order is fixed within a cycle and the counter only moves
  forward, no card repeats inside a cycle of 300. After 300 scans the next cycle
  reshuffles and the sequence loops.

If no Redis environment variables are set, the app falls back to an **in-memory
counter** — convenient for local development, but it resets on restart and is
**not** safe for production (see [SETUP.md](./SETUP.md)).

## Project structure

| Path                  | Purpose                                                      |
| --------------------- | ----------------------------------------------------------- |
| `app/page.tsx`        | Main page — draws and renders the next card on each visit.   |
| `app/layout.tsx`      | Root layout and global shell.                                |
| `components/Card.tsx` | Presentational component for a single festive card.          |
| `lib/redis.ts`        | Upstash Redis client + atomic counter (with in-memory fallback). |
| `lib/cards.ts`        | Card selection: per-cycle seeded shuffle + counter mapping.  |
| `lib/types.ts`        | Shared TypeScript types.                                     |
| `data/cards.json`     | The 300 cards (read-only data).                              |

## Local development quickstart

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. It runs without Redis locally using the
in-memory counter, so you can preview immediately. Refresh to draw the next
card.

## Deployment

For the full, step-by-step guide to creating the Upstash store, deploying to
Vercel, generating the QR code, and running the event (resetting the cycle,
checking scan counts, editing cards), see **[SETUP.md](./SETUP.md)**.
