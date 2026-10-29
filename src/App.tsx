import { useEffect, useMemo, useState } from "react";
import type { AppState, Item, Member, Move } from "./types";
import { localStorageAdapter as storage } from "./storage";
import { findItem, lastMove, timeAgo, usualPlace } from "./search";
import { parsePlace } from "./spots";
import PlaceMode from "./PlaceMode";
import Stickers from "./Stickers";
import BottomNav, { type View } from "./BottomNav";

const EMOJIS = ["🔑", "👛", "🔌", "📱", "🎧", "🕶️", "💳", "🎒", "☂️", "💊"];
const STALE_MS = 48 * 3600_000;

const uid = () => Math.random().toString(36).slice(2, 10);

function Avatar({ member }: { member: Member }) {
  return (
    <span className="avatar" style={{ background: member.color }} title={member.name}>
      {member.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Ring({ at }: { at: number }) {
  const frac = Math.min(1, Math.max(0, (Date.now() - at) / STALE_MS));
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" width="38" height="38" viewBox="0 0 38 38" aria-label="Freshness">
      <circle cx="19" cy="19" r={r} className="ring-bg" />
      <circle
        cx="19"
        cy="19"
        r={r}
        className="ring-fg"
        stroke={`hsl(${Math.round(265 + 85 * frac)} 85% 70%)`}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.max(frac, 0.06))}
        transform="rotate(-90 19 19)"
      />
    </svg>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(() => storage.load());
  const [query, setQuery] = useState("");
  const [placing, setPlacing] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [, tick] = useState(0);
  const [place, setPlace] = useState<string | null>(() => parsePlace(window.location.search));
  const [view, setView] = useState<View>("home");
  const [spotFilter, setSpotFilter] = useState<string | null>(null);

  useEffect(() => storage.save(state), [state]);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const member = (id: string): Member => state.members.find((m) => m.id === id) ?? { id, name: "?", color: "#94a3b8" };
  const me = member(state.currentMemberId);

  const placeItem = (itemId: string, location: string) => {
    const move: Move = { id: uid(), itemId, memberId: state.currentMemberId, location, at: Date.now() };
    setState((s) => ({ ...s, moves: [...s.moves, move] }));
    setPlacing(null);
  };

  const addItem = (name: string, emoji: string) => {
    const item: Item = { id: uid(), name, emoji };
    setState((s) => ({ ...s, items: [...s.items, item] }));
  };

  const removeItem = (id: string) =>
    setState((s) => ({
      ...s,
      items: s.items.filter((i) => i.id !== id),
      moves: s.moves.filter((m) => m.itemId !== id),
    }));

  const answer = useMemo(() => {
    if (!query.trim()) return null;
    const item = findItem(query, state.items);
    if (!item) return { kind: "none" as const };
    return {
      kind: "found" as const,
      item,
      last: lastMove(item.id, state.moves),
      usual: usualPlace(item.id, state.moves),
    };
  }, [query, state]);

  const feed = [...state.moves].sort((a, b) => b.at - a.at).slice(0, 12);

  const visibleItems = useMemo(() => {
    const list = state.items.filter((i) => !spotFilter || lastMove(i.id, state.moves)?.location === spotFilter);
    return list.sort((a, b) => (lastMove(b.id, state.moves)?.at ?? 0) - (lastMove(a.id, state.moves)?.at ?? 0));
  }, [state, spotFilter]);

  if (place) {
    return (
      <PlaceMode
        spot={place}
        state={state}
        onPlace={placeItem}
        onDone={() => {
          window.history.replaceState(null, "", window.location.pathname);
          setPlace(null);
        }}
      />
    );
  }

  const searchBox = (
    <div className="search-wrap">
      <span aria-hidden>🔍</span>
      <input
        className="search"
        placeholder="Where are my keys?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span className="mic" title="Voice logging coming later" aria-hidden>
        🎙️
      </span>
    </div>
  );

  const answerBox = (
    <>
      {answer?.kind === "none" && <div className="glass answer">No item matches that. Add it on Home.</div>}
      {answer?.kind === "found" && (
        <div className="glass answer">
          <strong>
            {answer.item.emoji} {answer.item.name}
          </strong>
          {answer.last ? (
            <>
              : last put in <b>{answer.last.location}</b> by{" "}
              <span style={{ color: member(answer.last.memberId).color }}>{member(answer.last.memberId).name}</span>,{" "}
              {timeAgo(answer.last.at)}.
              {answer.usual && answer.usual.location !== answer.last.location && answer.usual.count > 1 && (
                <div className="hint">
                  Not its usual spot. Try <b>{answer.usual.location}</b> (put there {answer.usual.count} times).
                </div>
              )}
            </>
          ) : (
            <> has no recorded location yet.</>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="shell">
      <main className="page">
        {view === "home" && (
          <>
            <header className="greet">
              <div>
                <h1>Hi {me.name}</h1>
                <p className="muted">Where is everything?</p>
              </div>
              <label className="who">
                <Avatar member={me} />
                <select
                  value={state.currentMemberId}
                  onChange={(e) => setState((s) => ({ ...s, currentMemberId: e.target.value }))}
                  aria-label="Switch member"
                >
                  {state.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            </header>

            <div className="pills">
              <button className={"pill" + (spotFilter === null ? " on" : "")} onClick={() => setSpotFilter(null)}>
                All
              </button>
              {state.spots.map((s) => (
                <button key={s} className={"pill" + (spotFilter === s ? " on" : "")} onClick={() => setSpotFilter(s)}>
                  {s}
                </button>
              ))}
            </div>

            <section className="bento">
              {visibleItems.map((item, idx) => {
                const last = lastMove(item.id, state.moves);
                const mover = last && member(last.memberId);
                return (
                  <article key={item.id} className={"glass card" + (idx === 0 && !spotFilter ? " wide" : "")}>
                    <div className="row">
                      <span className="emoji">{item.emoji}</span>
                      <h2>{item.name}</h2>
                      {last && <Ring at={last.at} />}
                      <button className="icon" title="Remove" onClick={() => removeItem(item.id)}>
                        ✕
                      </button>
                    </div>
                    {last && mover ? (
                      <p className="where">
                        <b>📍 {last.location}</b>
                        <span className="by">
                          <Avatar member={mover} /> {mover.name} · {timeAgo(last.at)}
                        </span>
                      </p>
                    ) : (
                      <p className="where muted">Not placed yet</p>
                    )}

                    {placing === item.id ? (
                      <PlaceForm
                        suggestions={[
                          ...new Set([
                            ...state.moves.filter((m) => m.itemId === item.id).map((m) => m.location),
                            ...state.spots,
                          ]),
                        ].slice(0, 8)}
                        onPlace={(loc) => placeItem(item.id, loc)}
                        onCancel={() => setPlacing(null)}
                      />
                    ) : (
                      <div className="row">
                        <button className="primary" onClick={() => setPlacing(item.id)}>
                          Place it
                        </button>
                        <button
                          className="ghost"
                          onClick={() => setHistoryFor(historyFor === item.id ? null : item.id)}
                        >
                          History
                        </button>
                      </div>
                    )}

                    {historyFor === item.id && (
                      <ul className="history">
                        {state.moves
                          .filter((m) => m.itemId === item.id)
                          .sort((a, b) => b.at - a.at)
                          .map((m) => (
                            <li key={m.id}>
                              {m.location} ·{" "}
                              <span style={{ color: member(m.memberId).color }}>{member(m.memberId).name}</span> ·{" "}
                              {timeAgo(m.at)}
                            </li>
                          ))}
                      </ul>
                    )}
                  </article>
                );
              })}
              <AddItem onAdd={addItem} />
            </section>
          </>
        )}

        {view === "search" && (
          <>
            <h1>Search</h1>
            {searchBox}
            {answerBox}
          </>
        )}

        {view === "stickers" && (
          <Stickers
            spots={state.spots}
            onAdd={(s) => setState((st) => ({ ...st, spots: [...st.spots, s] }))}
            onRemove={(s) => setState((st) => ({ ...st, spots: st.spots.filter((x) => x !== s) }))}
            onClose={() => setView("home")}
          />
        )}

        {view === "activity" && (
          <>
            <h1>Household activity</h1>
            <ul className="glass feed">
              {feed.map((m) => {
                const item = state.items.find((i) => i.id === m.itemId);
                if (!item) return null;
                return (
                  <li key={m.id}>
                    <Avatar member={member(m.memberId)} />
                    <span>
                      <b>{member(m.memberId).name}</b> put {item.emoji} {item.name} in <b>{m.location}</b>
                      <small> · {timeAgo(m.at)}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
      <BottomNav view={view} onChange={setView} />
    </div>
  );
}

function PlaceForm({
  suggestions,
  onPlace,
  onCancel,
}: {
  suggestions: string[];
  onPlace: (l: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="place"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onPlace(text.trim());
      }}
    >
      <div className="chips">
        {suggestions.map((s) => (
          <button type="button" key={s} className="chip" onClick={() => onPlace(s)}>
            {s}
          </button>
        ))}
      </div>
      <input autoFocus placeholder="Or type a location" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row">
        <button type="submit" className="primary" disabled={!text.trim()}>
          Save
        </button>
        <button type="button" className="ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddItem({ onAdd }: { onAdd: (name: string, emoji: string) => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  return (
    <form
      className="glass card add"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) {
          onAdd(name.trim(), emoji);
          setName("");
        }
      }}
    >
      <h2>＋ New item</h2>
      <div className="chips">
        {EMOJIS.map((em) => (
          <button type="button" key={em} className={"chip" + (em === emoji ? " on" : "")} onClick={() => setEmoji(em)}>
            {em}
          </button>
        ))}
      </div>
      <input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit" className="primary" disabled={!name.trim()}>
        Add
      </button>
    </form>
  );
}
