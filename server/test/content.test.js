// content.test.js — sanity + historical-balance checks on the Remember the Alamo
// question bank and the march it powers.
import test from 'node:test';
import assert from 'node:assert/strict';
import game, {
  BANK, LEGS, WAYPOINTS, CATEGORIES, endingFor, ENDINGS,
} from '../src/games/rememberTheAlamo.js';

const CATEGORY_KEYS = Object.keys(CATEGORIES); // ['causes','people','battles']

test('the bank has ~30 questions, each with 3 choices and exactly one right answer', () => {
  assert.ok(BANK.length >= 30, `bank size ${BANK.length} (want >= 30)`);
  const ids = new Set();
  for (const q of BANK) {
    assert.ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    assert.ok(CATEGORY_KEYS.includes(q.category), `${q.id} has a known category`);
    assert.ok(q.prompt?.length > 10, `${q.id} prompt`);
    assert.equal(q.choices.length, 3, `${q.id} has 3 choices`);
    assert.equal(q.choices.filter((c) => c.correct).length, 1, `${q.id} has exactly one correct`);
    for (const c of q.choices) {
      assert.ok(c.label?.length > 1, `${q.id} choice label`);
      assert.ok(c.feedback?.length > 10, `${q.id} teaching feedback`);
    }
  }
});

test('every category has enough questions to serve a balanced draw', () => {
  const counts = Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 0]));
  for (const q of BANK) counts[q.category]++;
  const perCat = Math.ceil(game.totalActions / CATEGORY_KEYS.length); // 12 / 3 = 4
  for (const k of CATEGORY_KEYS) {
    assert.ok(counts[k] >= perCat, `${k} has ${counts[k]} (want >= ${perCat})`);
  }
});

test('the march is six legs long and the road has six named waypoints, ending at San Jacinto', () => {
  assert.equal(LEGS.length, 6, 'six legs');
  assert.equal(game.chapterCount, 6, 'chapterCount 6');
  assert.equal(game.totalActions, 12, '12 questions served');
  assert.equal(game.sides.length, 1, 'a single class group');
  assert.equal(game.sides[0], 'army', "everyone marches with Houston's army");
  for (const [i, leg] of LEGS.entries()) {
    assert.ok(leg.title && leg.date && leg.event && leg.image, `leg ${i} metadata`);
  }
  assert.equal(WAYPOINTS.length, 6, 'six waypoints');
  assert.equal(WAYPOINTS[0].frac, 0, 'road starts at Gonzales (0)');
  assert.equal(WAYPOINTS[WAYPOINTS.length - 1].frac, 1, 'road ends at San Jacinto (1)');
  assert.match(WAYPOINTS[WAYPOINTS.length - 1].label, /San Jacinto/);
});

test('each match serves a category-balanced 12, and the mix varies run to run (spec §2)', () => {
  const orders = new Set();
  for (let run = 0; run < 25; run++) {
    const state = game.initMatch();
    const qs = state.sides.army.questions;
    assert.equal(qs.length, 12, 'serves 12');
    const counts = Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 0]));
    for (const q of qs) counts[q.category]++;
    for (const k of CATEGORY_KEYS) assert.equal(counts[k], 4, `balanced: 4 ${k}`);
    // no duplicate questions within a single served set
    assert.equal(new Set(qs.map((q) => q.id)).size, 12, 'no repeats in a served set');
    orders.add(qs.map((q) => q.id).join(','));
  }
  assert.ok(orders.size > 1, 'the served set/order changes between runs');
});

// --- Playthrough helpers (drive the adapter directly, no GameManager) --------

function playRun(pick) {
  const state = game.initMatch();
  for (let step = 0; step < game.totalActions; step++) {
    game.chapterEvent(state);           // idempotent per leg; safe to call each step
    const res = game.resolve(state, 'army', pick(state));
    assert.ok(!res.error, `step ${step} failed: ${res.error}`);
  }
  return { report: game.report(state), map: state.map };
}

const rightMove = (state) => game.aiMove(state);

function wrongMove(state) {
  const ss = state.sides.army;
  const q = ss.questions[ss.cursor];
  const wrongReal = q.choices.findIndex((c) => !c.correct);
  return { kind: 'decision', choiceIndex: ss.shuffles[ss.cursor].indexOf(wrongReal) };
}

test('all-right run: 100% accuracy, army arrives strong, marker reaches San Jacinto', () => {
  const { report, map } = playRun(rightMove);
  const you = report.perSide.army;
  assert.equal(you.accuracy, 100);
  assert.equal(you.correct, 12);
  assert.equal(you.ending.key, 'strong');
  assert.equal(map.march.correct, 12, 'the marker reaches the end of the road');
  assert.ok(you.debrief.includes('San Jacinto'), 'debrief ties to San Jacinto');
  assert.ok(you.debrief.includes('Velasco'), 'debrief names the Treaty of Velasco');
});

test('all-wrong run: 0% accuracy, army arrives late, marker never advances', () => {
  const { report, map } = playRun(wrongMove);
  const you = report.perSide.army;
  assert.equal(you.accuracy, 0);
  assert.equal(you.correct, 0);
  assert.equal(you.ending.key, 'late');
  assert.equal(map.march.correct, 0, 'a wrong answer never moves the army');
});

test('accuracy tiers: strong >= 75, footsore 42-74, late < 42', () => {
  assert.equal(endingFor(100).key, 'strong');
  assert.equal(endingFor(75).key, 'strong');   // 9 of 12
  assert.equal(endingFor(74).key, 'footsore');
  assert.equal(endingFor(42).key, 'footsore');  // 5 of 12
  assert.equal(endingFor(41).key, 'late');
  assert.equal(endingFor(0).key, 'late');
  assert.equal(ENDINGS.strong.key, 'strong');
});

test('the march advances only on a right answer', () => {
  const state = game.initMatch();
  assert.equal(state.map.march.correct, 0, 'starts at 0');
  // First a wrong answer — marker holds.
  game.resolve(state, 'army', wrongMove(state));
  assert.equal(state.map.march.correct, 0, 'wrong answer: no advance');
  assert.equal(state.map.march.answered, 1, 'but the question counts as answered');
  // Then a right answer — marker moves.
  game.resolve(state, 'army', rightMove(state));
  assert.equal(state.map.march.correct, 1, 'right answer: advance by one');
});

test('currentPrompt ships shuffled labels only — never the answer key', () => {
  const state = game.initMatch();
  game.chapterEvent(state);
  const prompt = game.currentPrompt(state);
  assert.equal(prompt.kind, 'decision');
  assert.equal(prompt.choices.length, 3);
  assert.ok(prompt.category, 'category is shown to the client');
  assert.ok(prompt.march && prompt.march.serve === 12, 'march position travels with the prompt');
  // Choices are label-only: no per-choice `correct` flag or `feedback` reaches
  // the client, so the answer key can't be read off the wire. (march.correct is
  // the count of right answers so far — a legitimate part of the march state.)
  for (const c of prompt.choices) {
    assert.equal(typeof c, 'string', 'a choice is just a label string');
  }
  const choicesJson = JSON.stringify(prompt.choices);
  assert.ok(!choicesJson.includes('"correct"'), 'no correct flag on the choices');
  assert.ok(!choicesJson.includes('"feedback"'), 'no feedback on the choices');
});
