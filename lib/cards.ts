// Card selection logic. Turns the monotonic scan counter from lib/redis.ts into
// a specific card, with a guarantee that no card repeats until the whole pool
// has been shown.
//
// No-repeat guarantee, in short:
//   - position = (counter - 1) % TOTAL_CARDS  →  0..TOTAL_CARDS-1 within a cycle
//   - cycle    = floor((counter - 1) / TOTAL_CARDS)  →  bumps every TOTAL_CARDS scans
//   - For a given cycle we build ONE permutation of all card indices, seeded by
//     the cycle number. Since the shuffle is a true permutation, positions
//     0..TOTAL_CARDS-1 map to all TOTAL_CARDS distinct cards exactly once.
//   - The counter is atomic (Redis INCR), so positions within a cycle are never
//     handed out twice. Together: every card shown once per cycle, then the next
//     cycle reshuffles (different seed → different order) and the loop repeats
//     forever.

import cardsData from "../data/cards.json";
import type { Card } from "./types";

const cards = cardsData as Card[];

export const TOTAL_CARDS = cards.length;

// mulberry32: a tiny, fast, deterministic PRNG. Same seed → same sequence,
// with no dependency on Date/Math.random, so shuffles are pure and reproducible.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded Fisher-Yates. Returns a permutation of [0..TOTAL_CARDS-1]. Because
// Fisher-Yates only swaps existing elements, the output is always a true
// permutation — every index appears exactly once.
function shuffledIndices(seed: number): number[] {
  const rand = mulberry32(seed);
  const indices = Array.from({ length: TOTAL_CARDS }, (_, i) => i);
  for (let i = TOTAL_CARDS - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Map a 1-based scan counter to the card that should be shown.
 *
 * @param counter The value returned by nextCounter() (>= 1).
 * @returns The chosen card plus its serial (= counter), cycle, and position.
 */
export function getCardByCounter(counter: number): {
  card: Card;
  serial: number;
  cycle: number;
  position: number;
} {
  const position = (counter - 1) % TOTAL_CARDS;
  const cycle = Math.floor((counter - 1) / TOTAL_CARDS);

  // One deterministic permutation per cycle, seeded by the cycle number.
  const order = shuffledIndices(cycle);
  const card = cards[order[position]];

  return { card, serial: counter, cycle, position };
}
