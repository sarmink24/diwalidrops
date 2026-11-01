// Shared types for DiwaliDrops. This is the single source of truth for the
// card shape — both the data logic (lib/cards.ts) and the UI import from here.

export type CardType =
  | "promise"
  | "riddle"
  | "fortune"
  | "task"
  | "dare"
  | "appreciation"
  | "excuse"
  | "this-or-that";

export interface Card {
  /** 1..300, matches the id in data/cards.json */
  id: number;
  type: CardType;
  /** The card's main prompt (riddle question, promise, task, etc.). */
  text: string;
  /**
   * Second-line content revealed on tap: the riddle answer, the promise cheer,
   * or the fortune. null for action-only cards (task/dare/appreciation/excuse/
   * this-or-that), which have no reveal button.
   */
  reveal: string | null;
}
