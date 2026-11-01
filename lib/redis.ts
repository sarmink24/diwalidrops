// Atomic counter backed by Upstash Redis, with an in-memory fallback.
//
// Every scan calls nextCounter() to get a strictly increasing, globally unique
// number. That number is what guarantees no card repeats within a cycle (see
// lib/cards.ts) — as long as the counter is atomic, two concurrent scans can
// never receive the same value.

import { Redis } from "@upstash/redis";

const COUNTER_KEY = "diwali:counter";

// Module-level fallback counter. Used when Redis is not configured (local
// `next dev`) or when a Redis call fails. It is NOT shared across serverless
// instances, so it is a best-effort safety net — never a production source of
// truth — but it ensures nextCounter() never throws and the page never errors.
let localCounter = 0;

// Lazily-created singleton client so we don't rebuild it on every call.
let client: Redis | null = null;
let clientResolved = false;

function getClient(): Redis | null {
  if (clientResolved) return client;
  clientResolved = true;

  // Support both the native Upstash names and Vercel's KV integration names.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) {
    client = new Redis({ url, token });
  } else {
    client = null;
  }

  return client;
}

/**
 * Atomically increment and return the global scan counter (>= 1).
 *
 * Falls back to an in-memory counter if Redis is unconfigured or the call
 * fails. Never throws.
 */
export async function nextCounter(): Promise<number> {
  const redis = getClient();

  if (!redis) {
    console.warn("[redis] No Upstash env vars set — using in-memory counter.");
    return ++localCounter;
  }

  try {
    const value = await redis.incr(COUNTER_KEY);
    return value;
  } catch (err) {
    console.warn(
      `[redis] INCR failed, falling back to in-memory counter: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return ++localCounter;
  }
}
