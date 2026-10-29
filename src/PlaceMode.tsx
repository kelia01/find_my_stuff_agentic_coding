import { useState } from "react";
import type { AppState } from "./types";

export default function PlaceMode({
  spot,
  state,
  onPlace,
  onDone,
}: {
  spot: string;
  state: AppState;
  onPlace: (itemId: string, spot: string) => void;
  onDone: () => void;
}) {
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const count = (id: string) => state.moves.filter((m) => m.itemId === id && m.location === spot).length;
  const items = [...state.items].sort((a, b) => count(b.id) - count(a.id));

  return (
    <div className="shell">
      <main className="page">
        <h1>📍 {spot}</h1>
        <p className="muted">Tap what you are leaving here.</p>
        <div className="big-grid">
          {items.map((item) => {
            const done = placed.has(item.id);
            return (
              <button
                key={item.id}
                className={"glass big" + (done ? " done" : "")}
                disabled={done}
                onClick={() => {
                  onPlace(item.id, spot);
                  setPlaced(new Set(placed).add(item.id));
                }}
              >
                <span className="emoji">{done ? "✅" : item.emoji}</span>
                {item.name}
              </button>
            );
          })}
        </div>
        <button className="primary done-btn" onClick={onDone}>
          Done
        </button>
      </main>
    </div>
  );
}
