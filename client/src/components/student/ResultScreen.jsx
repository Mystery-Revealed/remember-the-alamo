// ResultScreen.jsx — every run ends at San Jacinto in two beats: (1) the
// historical charge — "Remember the Alamo! Remember Goliad!" — which always
// happens the same way, because it's history, not a scored event; then (2)
// how your march went: your ending tier, Army Strength, accuracy (the score
// your teacher sees), and the debrief tying it all together.

import { useState } from 'react';
import { Art } from '../../services/assets.jsx';

const TIER_CLASS = { strong: 'win', footsore: 'mid', late: 'low' };

export default function ResultScreen({ state, dispatch }) {
  const [showFinale, setShowFinale] = useState(true);
  const end = state.matchEnd;
  const you = end.you;
  const ending = you.ending;
  const tier = TIER_CLASS[ending.key] || 'mid';

  if (showFinale) {
    return (
      <div className="card finale-card">
        <div className="event-kicker">April 21, 1836 · San Jacinto</div>
        <Art
          name="charge_sanjacinto.jpg"
          alt="Texan soldiers charging across an open field toward the enemy camp at San Jacinto, banners flying, seen from a distance"
          className="finale-art"
        />
        <h2 className="finale-cry">“Remember the Alamo! Remember Goliad!”</h2>
        <p className="finale-text">
          In the quiet of the afternoon, Sam Houston's army struck. In about
          eighteen minutes, the Texas Revolution was won.
        </p>
        <button className="btn big" onClick={() => setShowFinale(false)}>See how your march went</button>
      </div>
    );
  }

  return (
    <div className="card result-screen">
      <div className="event-kicker">San Jacinto · April 21, 1836</div>
      <h1 className={`result-headline ${tier}`}>{ending.title}</h1>

      <Art name="ending.jpg" alt="The Alamo mission façade at dusk, a quiet memorial" className="result-art" />

      <blockquote className="memorial-line">“Eighteen minutes, because thirteen days bought them.”</blockquote>

      <div className="ending-block army">
        <p>{ending.text}</p>
      </div>

      <div className="score-block" aria-label="Army Strength">
        <div className="score-head">
          <span className="score-title">🎖️ Army Strength at San Jacinto</span>
          <span className="score-num">{you.strength}<span className="muted"> / 100</span></span>
        </div>
        <span className="score-bar-track">
          <span className={`score-bar ${tier}`} style={{ width: `${Math.min(100, you.strength)}%` }} />
        </span>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{you.accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>{you.correct} of {you.total} questions right. An army that knows its history arrives strongest.</p>
        </div>
      </div>

      <div className="debrief">
        <h3>What really happened</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={() => dispatch({ type: 'play-again' })}>
          Play again
        </button>
      </div>
    </div>
  );
}
