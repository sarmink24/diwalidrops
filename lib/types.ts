// Shared types for DiwaliDrops. This is the single source of truth for the
// card shape — both the data logic (lib/cards.ts) and the UI import from here.

export type CardType = "wish" | "task" | "riddle" | "dare";

export interface Card {
  /** 1..300, matches the id in data/cards.json */
  id: number;
  type: CardType;
  /** The card's main content (wish / task / riddle question / dare). */
  text: string;
  /** Riddle solution. null for every non-riddle type. */
  answer: string | null;
}
