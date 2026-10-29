import type { Item, Move } from "./types";

const FILLER = new Set([
  "where",
  "is",
  "are",
  "my",
  "the",
  "our",
  "a",
  "an",
  "did",
  "i",
  "put",
  "find",
  "whats",
  "what",
  "s",
  "?",
]);

function stem(w: string): string {
  return w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w;
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !FILLER.has(w))
    .map(stem);
}

export function findItem(query: string, items: Item[]): Item | undefined {
  const q = tokens(query);
  if (q.length === 0) return undefined;
  return items.find((item) => {
    const name = tokens(item.name);
    return q.some((w) => name.some((n) => n === w || n.startsWith(w) || w.startsWith(n)));
  });
}

export function lastMove(itemId: string, moves: Move[]): Move | undefined {
  return moves.filter((m) => m.itemId === itemId).sort((a, b) => b.at - a.at)[0];
}

export function usualPlace(itemId: string, moves: Move[]): { location: string; count: number } | undefined {
  const counts = new Map<string, number>();
  for (const m of moves) {
    if (m.itemId === itemId) counts.set(m.location, (counts.get(m.location) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? { location: best[0], count: best[1] } : undefined;
}

export function timeAgo(at: number, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - at) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}
