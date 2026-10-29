import assert from "node:assert/strict";
import { findItem, lastMove, timeAgo, usualPlace } from "./search";
import { parsePlace, spotUrl } from "./spots";
import type { Item, Move } from "./types";

const items: Item[] = [
  { id: "i1", name: "Keys", emoji: "🔑" },
  { id: "i2", name: "Wallet", emoji: "👛" },
];
const moves: Move[] = [
  { id: "a", itemId: "i1", memberId: "m1", location: "Hall", at: 1 },
  { id: "b", itemId: "i1", memberId: "m1", location: "Hall", at: 2 },
  { id: "c", itemId: "i1", memberId: "m2", location: "Kitchen", at: 3 },
];

assert.equal(findItem("Where are my keys?", items)?.id, "i1");
assert.equal(findItem("wallet", items)?.id, "i2");
assert.equal(findItem("where is my passport", items), undefined);
assert.equal(lastMove("i1", moves)?.location, "Kitchen");
assert.deepEqual(usualPlace("i1", moves), { location: "Hall", count: 2 });
assert.equal(timeAgo(0, 5 * 60_000), "5 min ago");
assert.equal(timeAgo(0, 3 * 3600_000), "3 h ago");

assert.equal(parsePlace("?place=Hallway%20table"), "Hallway table");
assert.equal(parsePlace("?place=%20"), null);
assert.equal(parsePlace(""), null);
const spot = "Bag & coat / 1";
assert.equal(parsePlace(new URL(spotUrl("http://x", spot)).search), spot);

console.log("tests passed");
