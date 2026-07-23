// _quizGame.js — a factory that turns a QUESTION BANK into a solo review-quiz
// adapter GameManager can drive. It powers "knowledge-march" games like
// "Remember the Alamo!", where answering questions right advances an army along
// a road map on the way to a historic battle.
//
// Unlike _stepGame (fixed narrative phases), a quiz game ships a large BANK and
// serves a fresh, category-balanced subset each match — so a class can replay it
// as a review game and see a different mix every run (spec §2).
//
// THE ANSWER KEY LIVES HERE, ON THE SERVER. currentPrompt() ships shuffled
// labels only; the client submits { kind: 'decision', choiceIndex } and the
// server grades it. Each question has exactly one right answer (no partials).
//
// The "march" is cosmetic and rides inside state.map (just as _stepGame rides
// placements inside state.map.positions), so it threads through every socket
// push and reconnect snapshot for free. The GRADE is simply correct ÷ served,
// computed by scoring.js — the march and the army-strength meter never touch it.
//
// The adapter interface GameManager expects (all implemented below):
//   id, title, modes, sides, totalActions, chapterCount, meta,
//   initMatch, chapterEvent, eventSnapshot, currentPrompt, resolve, aiMove,
//   isComplete, report   (owners is optional and omitted — this game has no rival)

import { accuracyPercent } from '../scoring.js';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Right = 1 point, wrong = 0. No partials in a quiz (spec §2).
const pointsFor = (verdict) => (verdict === 'right' ? 1 : 0);

// Pick `serve` questions from `bank`, balanced across categories and shuffled so
// the categories interleave. If a category is short, the shortfall is refilled
// from the remaining pool, so we always serve exactly `serve` questions (as long
// as the bank holds at least that many).
export function selectQuestions(bank, serve, categoryKeys) {
  const byCat = new Map(categoryKeys.map((k) => [k, []]));
  for (const q of bank) if (byCat.has(q.category)) byCat.get(q.category).push(q);
  for (const list of byCat.values()) shuffle(list);

  const nCats = categoryKeys.length;
  const base = Math.floor(serve / nCats);
  const extra = serve % nCats; // spread the remainder across the first few categories

  const picked = [];
  const leftovers = [];
  categoryKeys.forEach((k, i) => {
    const quota = base + (i < extra ? 1 : 0);
    const list = byCat.get(k) || [];
    picked.push(...list.slice(0, quota));
    leftovers.push(...list.slice(quota));
  });

  // Refill if any category came up short of its quota.
  if (picked.length < serve) {
    shuffle(leftovers);
    picked.push(...leftovers.slice(0, serve - picked.length));
  }

  return shuffle(picked).slice(0, serve);
}

export function createQuizGame({
  id,
  title,
  side = 'player',        // the single side key (e.g. 'army'); groups class accuracy
  bank,                   // [{ id, category, prompt, hint?, choices: [{ label, correct, feedback }] }]
  serve = 12,             // how many questions each match serves
  legs,                   // [{ title, date, image, event, waypoint? }] — narrative chapters (2 questions each)
  meta,                   // { meters, waypoints, serve, categories } — display info shipped to clients
  startStrength = 40,     // cosmetic army-strength meter starts here
  rightDelta = 7,         // cosmetic strength change on a right answer
  wrongDelta = -5,        // cosmetic strength change on a wrong answer
  strengthKey = 'army',   // the meter key the strength lives under
  endingFor,              // (accuracyPercent) => { key, title, text }
  debrief,                // string shown on every ending
}) {
  const CHAPTER_COUNT = legs.length;
  const categoryKeys = Object.keys(meta.categories || {});

  const chapterOf = (cursor) => Math.min(Math.floor(cursor / 2), CHAPTER_COUNT - 1);

  const chapterMeta = (idx) => {
    const leg = legs[idx];
    return { index: idx, count: CHAPTER_COUNT, title: leg.title, date: leg.date, image: leg.image, waypoint: leg.waypoint || null };
  };

  const marchState = (ss) => ({ correct: ss.correct, answered: ss.cursor, serve });

  function makeSideState(isAI = false) {
    // Per-match: a fresh category-balanced draw of `serve` questions, plus a
    // per-question shuffle of its choices so "the first answer" is never a tell.
    const questions = selectQuestions(bank, serve, categoryKeys);
    return {
      key: side,
      isAI,
      cursor: 0,                 // 0..serve-1
      correct: 0,
      meters: { [strengthKey]: startStrength },
      actions: [],               // [{ stepIndex, verdict, points }]
      eventApplied: -1,          // last leg whose event card was shown
      questions,
      shuffles: questions.map((q) => shuffle([...q.choices.keys()])),
    };
  }

  return {
    id,
    title,
    modes: ['solo'],
    sides: [side],
    totalActions: serve,
    chapterCount: CHAPTER_COUNT,
    meta: {
      ...meta,
      // Leg labels + the questions-per-leg rule, so the client can derive "which
      // leg does this feedback belong to" from the resolution's own stepIndex
      // (race-proof) instead of eventCard/turn, which the server pushes ahead to
      // the NEXT leg in the same batch as a leg-ending resolution (see MatchView).
      stepsPerChapter: 2, // mirrors chapterOf's fixed 2-questions-per-leg rule
      chapters: legs.map((l) => ({ title: l.title, date: l.date })),
    },

    // Only ever solo here; one human side, no AI rival.
    initMatch() {
      const ss = makeSideState();
      return {
        mode: 'solo',
        map: { march: marchState(ss) },
        sides: { [side]: ss },
        whoseTurn: side,
        chapterIndex: 0,
        status: 'active',
        winner: null,
      };
    },

    // The leg's narrative event card (once per leg). Legs carry no meter toll —
    // they set the scene between questions.
    chapterEvent(state) {
      const ss = state.sides[side];
      const idx = chapterOf(ss.cursor);
      if (ss.cursor >= serve || ss.eventApplied >= idx) return null;
      ss.eventApplied = idx;
      const leg = legs[idx];
      return {
        chapter: chapterMeta(idx),
        text: leg.event,
        eventEffects: null,
        meters: { ...ss.meters },
        march: marchState(ss),
      };
    },

    // Non-mutating version, for re-pushing state after a reconnect.
    eventSnapshot(state) {
      const ss = state.sides[side];
      const idx = chapterOf(ss.cursor);
      const leg = legs[idx];
      return {
        chapter: chapterMeta(idx),
        text: leg.event,
        eventEffects: null,
        meters: { ...ss.meters },
        march: marchState(ss),
      };
    },

    // What the player sees now. NO correct/feedback leaks out — just shuffled
    // labels, the category, and the current march position.
    currentPrompt(state) {
      const ss = state.sides[side];
      if (ss.cursor >= serve) return null;
      const idx = chapterOf(ss.cursor);
      const q = ss.questions[ss.cursor];
      const order = ss.shuffles[ss.cursor];
      return {
        stepIndex: ss.cursor,
        kind: 'decision',
        chapter: chapterMeta(idx),
        category: q.category,
        meters: { ...ss.meters },
        march: marchState(ss),
        prompt: q.prompt,
        hint: q.hint || null,
        choices: order.map((i) => q.choices[i].label),
      };
    },

    // Apply a submitted move. move = { kind: 'decision', choiceIndex } where
    // choiceIndex is the presented (shuffled) index — mapped back here.
    resolve(state, _side, move) {
      const ss = state.sides[side];
      if (ss.cursor >= serve) return { error: 'side_done' };
      if (!move || move.kind !== 'decision') return { error: 'wrong_step_kind' };
      const q = ss.questions[ss.cursor];
      const order = ss.shuffles[ss.cursor];
      const realIndex = order[move.choiceIndex];
      const choice = q.choices[realIndex];
      if (!choice) return { error: 'bad_choice' };

      const verdict = choice.correct ? 'right' : 'wrong';
      const delta = choice.correct ? rightDelta : wrongDelta;
      ss.meters[strengthKey] = clamp((ss.meters[strengthKey] ?? 0) + delta, 0, 100);
      if (choice.correct) ss.correct += 1; // the march advances only on a right answer
      ss.actions.push({ stepIndex: ss.cursor, verdict, points: pointsFor(verdict) });
      ss.cursor += 1;

      const march = marchState(ss);
      state.map.march = march; // keep the shared map in sync for every push/snapshot

      return {
        side,
        kind: 'decision',
        verdict,
        correct: choice.correct,
        feedback: choice.feedback,
        effects: { [strengthKey]: delta },
        march,
        stepIndex: ss.cursor - 1,
        meters: { ...ss.meters },
        chapterDone: ss.cursor % 2 === 0,
        sideDone: ss.cursor >= serve,
      };
    },

    // The right answer to the current question (used by content/balance tests;
    // not an in-game opponent — this game is single-role solo).
    aiMove(state) {
      const ss = state.sides[side];
      const q = ss.questions[ss.cursor];
      const rightIdx = q.choices.findIndex((c) => c.correct);
      const shuffledIdx = ss.shuffles[ss.cursor].indexOf(rightIdx);
      return { kind: 'decision', choiceIndex: shuffledIdx };
    },

    isComplete(state) {
      return Object.values(state.sides).every((ss) => ss.cursor >= serve);
    },

    // Final report. No winner/rival — the value is accuracy + how far the army marched.
    report(state) {
      const ss = state.sides[side];
      const accuracy = accuracyPercent(ss.actions, serve);
      return {
        winner: null,
        owners: null,
        perSide: {
          [side]: {
            isAI: !!ss.isAI,
            accuracy,
            correct: ss.correct,
            total: serve,
            strength: ss.meters[strengthKey],
            meters: { ...ss.meters },
            march: marchState(ss),
            ending: endingFor(accuracy),
            debrief,
          },
        },
      };
    },
  };
}
