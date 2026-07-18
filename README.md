# Remember the Alamo!

**Unit 3 · 7th Grade Texas History · Mexican National & Texas Revolution**
TEKS **7.3A, 7.3B, 7.3C, 7.1B** (causes, people, battles of the whole
Revolution, and 1836). Built to follow **Hold the Line: The Alamo** as the
unit's review game.

A solo knowledge-march quiz: every question you answer right moves **Sam
Houston's army** one step down the road from **Gonzales to San Jacinto**. The
frame is respectful — the quiz *powers a march*, it is not a re-fight of the
Alamo. The title phrase appears as what it was: the battle cry born from
sacrifice. The finale always plays the historical eighteen-minute charge at
San Jacinto — that part of history never changes — and honors the fallen with
a closing memorial card: *"Eighteen minutes, because thirteen days bought
them."*

It runs on the same shared **Socket.IO game engine** as Hold the Line, Chronos
Protocol, Survive the Season, and Claim the Land: a server-authoritative Node +
Express + Socket.IO backend and a thin React + Vite client, deployed as one
Render web service. **All session state lives in server memory — no
database.** Ending a session (or the idle sweep, or a Render spin-down) erases
it. The teacher's PDF is the only lasting record.

## How it plays

- **A ~30-question bank** across three TEKS categories — Causes (7.3A), People
  (7.3B), Battles & Events (7.3C). Each match draws a fresh, **category-balanced
  12** (4 from each), so replays mix up every run.
- Each question: 3 choices, one right, one-sentence feedback that teaches.
  **12 questions total**, grouped into **6 narrative legs** (Gonzales → the
  Runaway Scrape → Groce's Crossing → the Fork in the Road → the race to
  Harrisburg → San Jacinto).
- **Army Strength** (starts 40, one meter, 0–100): +7 on a right answer, −5 on
  a wrong one. Cosmetic — it never touches the grade.
- **The march always reaches San Jacinto.** A right answer advances the army
  token along the road; a wrong one holds it in place. The grade is simply
  **correct ÷ 12 = accuracy** — the score the teacher sees, computed
  **server-side**. The client never holds the answer key.
- **Endings** by accuracy: *The Army Arrived Strong* (≥75%), *Footsore, but in
  Time* (42–74%), *Late — but History Still Turned* (<42%). Every ending plays
  the same historical charge, then shows the tiered debrief.

## Project layout

```
server/          Shared Socket.IO engine + games/rememberTheAlamo.js (+ _quizGame.js factory)
client/          React 18 + Vite (Datapad game view + RoadMap + CommandCenter)
assets/images/   place Higgsfield art here (also copy into client/public/assets/images)
render.yaml      Render web-service template
package.json     root: postinstall installs server/ + client/; build compiles client
```

The engine is single-role solo for this game (`sides: ['army']`): everyone
marches with Houston, so the class is one group.
`server/src/games/_quizGame.js` is a reusable factory that turns a question
bank + narrative legs into the adapter the `GameManager` drives — it serves a
fresh, balanced subset of the bank each match and tracks the march inside
`state.map.march`.

## Run locally

```bash
npm install          # cascades installs into server/ and client/
npm test             # server tests (scoring, content/balance, GameManager)
npm run build        # build the client into client/dist
npm start            # serve the whole app at http://localhost:4701
```

For hot-reload dev, run `npm run dev:server` and `npm run dev:client` in two
terminals (Vite proxies `/socket.io` to the server on :4701).

- **Students:** open the base URL. Enter the class code + a first name.
- **Teacher Command Center:** open the base URL with `#teacher`
  (e.g. `http://localhost:4701/#teacher`). Create a session (4-digit PIN),
  approve names, watch live status + class accuracy, download the PDF, End Session.

## Deploy (Render) & embed (Wix)

1. Push to GitHub. On **Render**, create a **Web Service** from the repo
   (`buildCommand: npm install && npm run build`, `startCommand: node server/src/index.js`,
   free plan). Live at e.g. `https://remember-the-alamo.onrender.com`.
2. In **Wix**: embed the Render **student URL** on a public page; embed the
   **`#teacher`** URL on a **password-protected** page (the in-app PIN is a second
   layer). Use the `https://` URL; push to GitHub to redeploy.

## Art

Images resolve through `client/public/assets/images/`. Missing files degrade to a
styled placeholder, so the game is playable art-or-no-art. Per spec §4, the art
budget is deliberately light — four images total: `title_hero.jpg` (dawn light
over a coastal prairie, campfires by a bayou), `road_map.jpg` (a blank aged
parchment texture — the live road map draws its route in ink-style SVG on top,
and every leg's event card reuses it as a backdrop), `charge_sanjacinto.jpg`
(the San Jacinto charge, seen from a distance — banners and motion, no combat
close-ups), and `ending.jpg` (the "Remember" memorial card: the Alamo façade
at dusk). The road map itself is inline SVG — no per-waypoint art needed.
