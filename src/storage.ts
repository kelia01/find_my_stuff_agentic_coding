import type { AppState } from "./types";

// Swap this interface's implementation for an API client to make the household truly shared.
export interface Storage {
  load(): AppState;
  save(state: AppState): void;
}

const KEY = "find-my-stuff:v1";
const H = 3600_000;

function seed(): AppState {
  const now = Date.now();
  return {
    currentMemberId: "m1",
    spots: ["Hallway table", "Kitchen shelf", "Bag", "Jacket pocket", "Bedroom", "Car"],
    members: [
      { id: "m1", name: "Me", color: "#38bdf8" },
      { id: "m2", name: "Sam", color: "#f472b6" },
      { id: "m3", name: "Alex", color: "#a3e635" },
    ],
    items: [
      { id: "i1", name: "Keys", emoji: "🔑" },
      { id: "i2", name: "Wallet", emoji: "👛" },
      { id: "i3", name: "Charger", emoji: "🔌" },
    ],
    moves: [
      { id: "v1", itemId: "i1", memberId: "m1", location: "Hallway table", at: now - 30 * H },
      { id: "v2", itemId: "i1", memberId: "m2", location: "Kitchen shelf", at: now - 26 * H },
      { id: "v3", itemId: "i1", memberId: "m1", location: "Hallway table", at: now - 5 * H },
      { id: "v4", itemId: "i2", memberId: "m3", location: "Jacket pocket", at: now - 3 * H },
      { id: "v5", itemId: "i3", memberId: "m2", location: "Living room sofa", at: now - 1 * H },
    ],
  };
}

export const localStorageAdapter: Storage = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AppState;
        return { ...saved, spots: saved.spots ?? seed().spots };
      }
    } catch {
      // fall through to seed data
    }
    return seed();
  },
  save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  },
};
