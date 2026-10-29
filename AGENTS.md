# Find My Stuff

- React + Vite + TypeScript.
- Data goes through the `Storage` interface in `src/storage.ts`.
- Run: `npm run dev`. Test: `npm test`. Build: `npm run build`.
- Lint: `npm run lint`. Typecheck: `npm run typecheck`. Format: `npm run format`.
- Pre-commit (husky): lint-staged, typecheck, tests.

## Overview

- Logs where shared items were last put: `Move` = item, member, location, time.
- Search answers "where are my keys?"; QR spot stickers log a move in one scan + one tap.
- Model: `Member`, `Item`, `Move`, `AppState` in `src/types.ts`; latest move = current location.
- Files: `App.tsx` (views), `PlaceMode.tsx`, `Stickers.tsx`, `BottomNav.tsx`, `search.ts`, `spots.ts`, `storage.ts`.
- Tests: plain `node:assert` in `src/search.test.ts`.
- Gaps: localStorage only, no auth, no CI.

## Direction: Smart Lockers (enterprise)

- Pivot from manual tracking to IoT cabinet lockers.
- Scan QR in app -> log entry -> solenoid lock opens instantly.
- Backend authenticates user, logs who/what/when.
- Backend talks to Raspberry Pi/Arduino over WebSockets or MQTT.
- Target: large companies (multi-tenant, roles, audit logs, SSO, scalable).

### Roadmap
1. [done] Tooling: git, ESLint, Prettier, `tsc`, husky + lint-staged, tests in pre-commit.
2. [done] Agents: `AGENTS.md` is canonical, `CLAUDE.md` points to it.
3. [done] Skills: skill-creator installed via `npx skills add https://github.com/anthropics/skills.git --skill skill-creator`.
4. [done] `commit` skill at `.claude/skills/commit/SKILL.md`; eval not yet run.
5. Server `Storage` + auth + orgs/roles.
6. Locker model: locker, cabinet, door, access rules.
7. Unlock API + MQTT/WebSocket bridge + device firmware.
8. Audit log, admin dashboard, offline/failure handling.

## Plan: UI restyle (glassmorphism, ref: `find_items_ui.png`)

### Look
- Medium violet palette (`#8b5cf6` accent) on a solid deep violet background. No gradients anywhere.
- Frosted glass cards: `backdrop-filter: blur`, translucent fill, thin light border, large radius.
- White pill for the active tab, dark translucent pills for inactive.
- Orange toggles/accents for active state.

### Layout
- Greeting header: "Hi <member>", subtitle "Where is everything?", avatar and search icon.
- Room pills row (Hallway, Kitchen, Bag...) filters items by spot, from `state.spots`.
- Bento grid of item cards: big emoji, name, spot, who and when. Last-moved item gets a larger card.
- Bottom floating glass nav: Home, Search, Spots (stickers), Activity.
- Place mode: large glass tiles, check state turns amber with a soft glow.

### Our own touches
- "Freshness" ring on each card: fills as the last log gets older, so stale locations stand out.
- Member avatars as colored initials in glass chips.
- Subtle press and fade animations; respects `prefers-reduced-motion`.
- Search bar as a glass pill with a mic icon placeholder for later voice logging.

### Steps
1. Add CSS variables: palette, blur, radius, glow.
2. Restyle `styles.css`: background, glass card, pills, toggles, nav.
3. Add `BottomNav` component and a view state (home, search, stickers, activity).
4. Add greeting header and room pill filter in `App.tsx`.
5. Convert item grid to a bento layout with freshness ring.
6. Restyle `PlaceMode` and `Stickers` to match. Stickers stay white for printing.
7. Check mobile width (375px) and print output.

### Constraints
- Keep data and `Storage` untouched; UI only.
- Fallback solid background if `backdrop-filter` is unsupported.
- Keep text contrast readable on glass (WCAG AA).
- No new dependencies; pure CSS and React.

## Plan: QR "tap to place"

Goal: log an item's location in one scan + one tap.

### Flow
- Print one QR sticker per spot (hook, shelf, bag).
- Scan with the phone's normal camera.
- URL opens the app: `/?place=Hallway%20table`.
- App shows "Placing at Hallway table" with every item as a big button.
- One tap per item logs the move. Tapping several is allowed.
- Confirmation toast, then a "Done" button that clears the URL param.

### Steps
1. Read `place` from `URLSearchParams` on load.
2. Add a `PlaceMode` screen: spot name + item buttons, one tap = `placeItem`.
3. Add a "Spots" page: list of spots, add/remove, each with a QR.
4. Generate QR in-browser with the `qrcode` package, encoding `origin + /?place=<spot>`.
5. Add a "Print stickers" view: grid of QR codes with spot names, print CSS.
6. Remember last used items per spot and show them first.
7. Add tests for URL parsing and spot-name encoding.

### Decisions
- Spot QR, not item QR: stickers go on places, items stay free of stickers.
- No in-app camera: the phone's camera app opens the link.
- Spot names are the shared key, so reuse the existing `location` string.

### Risks
- localStorage is per-origin: phones need the same deployed URL (or `npm run dev -- --host` on the same Wi-Fi).
- Still single-device data until a real `Storage` backend exists.
- Spot names with special characters must be URL-encoded.

### Later
- NFC tags writing the same URL.
- Server `Storage` so scans from different phones share data.
- "Leaving home" checklist.
