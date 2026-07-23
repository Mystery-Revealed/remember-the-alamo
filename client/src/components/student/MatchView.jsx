// MatchView.jsx — one leg beat at a time: event card → question → feedback.
// Single-role solo, so it's always your turn. The road map is always on
// screen; the action panel swaps.

import { useState } from 'react';
import { emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import RoadMap from '../shared/RoadMap.jsx';
import MetersBar from '../shared/MetersBar.jsx';

export default function MatchView({ state, dispatch }) {
  const { match } = state;
  const { begin, eventCard, turn, feedback } = match;
  const meta = begin.meta;
  const march = match.map?.march || { correct: 0, serve: meta?.serve || 12 };

  // The server pushes the NEXT leg's chapter:event AND its first turn:begin
  // synchronously with the CURRENT leg's LAST turn:resolution — it doesn't wait
  // for the student to dismiss anything. So while a leg-ending verdict is on
  // screen, eventCard AND turn have BOTH already raced ahead, and preferring
  // either would make the chip read one leg ahead. Only feedback.stepIndex is
  // baked into the feedback payload itself and can't race — derive the leg from
  // it (same questions-per-leg rule the server's chapterOf uses). Once feedback
  // is dismissed, eventCard/turn are exactly what's on screen next, so THEIR
  // chapter is what should show.
  const chapters = meta.chapters || [];
  const stepsPerChapter = meta.stepsPerChapter || 2;
  const legIndexFor = (stepIndex) =>
    Math.min(Math.floor(stepIndex / stepsPerChapter), chapters.length - 1);
  const liveLegIndex = feedback ? legIndexFor(feedback.stepIndex)
    : turn?.yourTurn ? legIndexFor(turn.stepIndex)
    : eventCard ? eventCard.chapter.index
    : null;
  const leg = liveLegIndex != null && chapters[liveLegIndex]
    ? { index: liveLegIndex, count: chapters.length, ...chapters[liveLegIndex] }
    : (eventCard?.chapter || turn?.chapter); // fallback if meta.chapters is ever absent
  const lowMeter = Object.entries(match.meters || {}).find(([, v]) => v <= 15);

  return (
    <div className="match">
      <header className="match-header">
        <div className="side-chip">Marching with <b>Sam Houston</b></div>
        <div className="progress-chip" title="Questions answered right so far">
          Correct <b>{march.correct}</b><span className="muted"> / {march.serve}</span>
        </div>
        {leg && (
          <div className="chapter-chip">
            Leg {leg.index + 1} of {leg.count} · {leg.date}
          </div>
        )}
      </header>

      <div className="meters-row solo">
        <MetersBar meters={match.meters} meta={meta} title="Houston's Army" />
      </div>

      {lowMeter && !feedback && (
        <div className="banner danger" role="alert">
          ⚠️ Your army's strength is running low. A right answer builds it back up.
        </div>
      )}

      <div className="match-body">
        <section className="action-panel" aria-live="polite">
          {feedback ? (
            <FeedbackPanel
              feedback={feedback}
              meta={meta}
              matchEnded={!!state.matchEnd}
              onContinue={() => dispatch({ type: 'dismiss-feedback' })}
            />
          ) : eventCard ? (
            <EventCard eventCard={eventCard} onContinue={() => dispatch({ type: 'dismiss-event' })} />
          ) : turn?.yourTurn ? (
            <DecisionPanel turn={turn} meta={meta} />
          ) : (
            <div className="waiting-panel"><div className="pulse-dot" aria-hidden="true" /><p>Marching…</p></div>
          )}
        </section>

        <section className="map-panel">
          <div className="road-map-frame">
            <Art name="road_map.jpg" alt="Aged parchment map of the road from Gonzales to San Jacinto" className="road-map-bg" />
            <RoadMap meta={meta} march={march} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------- panels -------- */

function EventCard({ eventCard, onContinue }) {
  const ch = eventCard.chapter;
  return (
    <div className="event-card">
      <div className="event-kicker">Leg {ch.index + 1} of {ch.count} · {ch.date}</div>
      <h2>{ch.title}</h2>
      <Art name={ch.image} alt={ch.title} className="event-art" />
      <p className="event-text">{eventCard.text}</p>
      <button className="btn big" onClick={onContinue}>Onward!</button>
    </div>
  );
}

function DecisionPanel({ turn, meta }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const cat = meta?.categories?.[turn.category];

  async function choose(choiceIndex) {
    if (busy) return;
    setBusy(true);
    const res = await emitAck('student:submit_move', { move: { kind: 'decision', choiceIndex } });
    if (!res.ok) { setErr(errorText(res.error)); setBusy(false); }
    // On success the server pushes turn:resolution and this panel unmounts.
  }

  return (
    <div className="move-panel">
      {cat && <div className="category-chip">{cat.name} · TEKS {cat.teks}</div>}
      <p className="prompt">{turn.prompt}</p>
      {turn.hint && <p className="hint">💡 {turn.hint}</p>}
      <div className="choice-list">
        {(turn.choices || []).map((label, i) => (
          <button key={i} className="choice-btn" disabled={busy} onClick={() => choose(i)}>
            {label}
          </button>
        ))}
      </div>
      <p className="err" role="alert">{err}</p>
    </div>
  );
}

const VERDICT_UI = {
  right: { label: 'Right! The army marches on', className: 'right', icon: '✓' },
  wrong: { label: 'Not quite', className: 'wrong', icon: '✗' },
};

function FeedbackPanel({ feedback, meta, matchEnded, onContinue }) {
  const v = VERDICT_UI[feedback.verdict] || VERDICT_UI.wrong;
  return (
    <div className="feedback-panel">
      <div className={`verdict-badge ${v.className}`}>
        <span aria-hidden="true">{v.icon}</span> {v.label}
      </div>
      <p className="feedback-text">{feedback.feedback}</p>
      <div className="effects-row">
        {Object.entries(feedback.effects || {}).map(([k, val]) => (
          <span key={k} className={`effect-chip ${val > 0 ? 'up' : 'down'}`}>
            {meta.meters[k]?.name || k} {val > 0 ? `+${val}` : val}
          </span>
        ))}
      </div>
      <button className="btn big" onClick={onContinue}>
        {matchEnded ? 'See how the march ends' : 'Next question'}
      </button>
    </div>
  );
}
