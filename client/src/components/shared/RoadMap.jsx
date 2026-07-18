// RoadMap.jsx — the road from Gonzales to San Jacinto, a schematic trail map.
// Pure SVG (crisp at any size); no interaction required, so it's a pure read
// of server truth. The army token's position is always map.march.correct /
// map.march.serve — it only moves forward on a right answer. The six waypoint
// pins come from server meta, so wording never needs a client deploy.
//
// The component holds no state; `meta` and `march` are controlled by the
// parent (MatchView).

// Local road geometry (viewBox 0 0 900 260). Authored to roughly track each
// waypoint's `frac` (0–1, from server meta) so the token's motion along the
// curve reads naturally — this is a trail map, not a survey.
const ROAD_XY = {
  gonzales:   { x: 55,  y: 202 },
  colorado:   { x: 235, y: 92 },
  groce:      { x: 400, y: 198 },
  fork:       { x: 545, y: 70 },
  bayou:      { x: 700, y: 184 },
  sanjacinto: { x: 840, y: 78 },
};
const ORDER = ['gonzales', 'colorado', 'groce', 'fork', 'bayou', 'sanjacinto'];

// One cubic-bezier segment per pair of waypoints; control points offset only
// in x, so the curve bows gently between each pair's y values.
function segment(p0, p1) {
  return {
    p0,
    c1: { x: p0.x + (p1.x - p0.x) / 3, y: p0.y },
    c2: { x: p0.x + (2 * (p1.x - p0.x)) / 3, y: p1.y },
    p1,
  };
}

const SEGMENTS = ORDER.slice(1).map((key, i) => segment(ROAD_XY[ORDER[i]], ROAD_XY[key]));

const ROAD_D = `M ${ROAD_XY.gonzales.x} ${ROAD_XY.gonzales.y} ` +
  SEGMENTS.map((s) => `C ${s.c1.x} ${s.c1.y}, ${s.c2.x} ${s.c2.y}, ${s.p1.x} ${s.p1.y}`).join(' ');

function cubicPoint(s, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * s.p0.x + 3 * mt * mt * t * s.c1.x + 3 * mt * t * t * s.c2.x + t * t * t * s.p1.x,
    y: mt * mt * mt * s.p0.y + 3 * mt * mt * t * s.c1.y + 3 * mt * t * t * s.c2.y + t * t * t * s.p1.y,
  };
}

// Where the army token sits for a given overall frac (0–1): find which road
// segment it's on using the waypoints' own frac values, then walk that
// segment's curve to the matching point.
function tokenPosition(frac, waypoints) {
  const wps = waypoints?.length ? waypoints : ORDER.map((key, i) => ({ key, frac: i / (ORDER.length - 1) }));
  for (let i = 0; i < wps.length - 1; i++) {
    const lo = wps[i], hi = wps[i + 1];
    if (frac <= hi.frac || i === wps.length - 2) {
      const span = hi.frac - lo.frac || 1;
      const t = Math.max(0, Math.min(1, (frac - lo.frac) / span));
      return cubicPoint(SEGMENTS[i], t);
    }
  }
  return ROAD_XY[ORDER[0]];
}

// The army's marker: a small Lone Star on a halo, echoing the Republic's flag.
function ArmyToken({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`} className="army-token" aria-hidden="true">
      <circle r="15" className="token-halo" />
      <path
        d="M0,-8 L2.2,-2.5 L8,-2.5 L3.2,1 L5,7 L0,3.3 L-5,7 L-3.2,1 L-8,-2.5 L-2.2,-2.5 Z"
        className="token-star"
      />
    </g>
  );
}

export default function RoadMap({ meta, march }) {
  const waypoints = meta?.waypoints || [];
  const correct = march?.correct ?? 0;
  const serve = march?.serve || 12;
  const frac = serve ? Math.min(1, correct / serve) : 0;
  const token = tokenPosition(frac, waypoints);

  const reached = [...waypoints].reverse().find((w) => frac >= w.frac);
  const summary = reached
    ? `The army has marched to ${reached.label}. ${correct} of ${serve} questions answered right.`
    : `${correct} of ${serve} questions answered right.`;

  return (
    <svg
      className="road-map"
      viewBox="0 0 900 260"
      role="img"
      aria-label={`Road from Gonzales to San Jacinto. ${summary}`}
    >
      <rect x="4" y="4" width="892" height="252" rx="14" className="road-scrim" />
      <path d={ROAD_D} className="road-track" pathLength="1" />
      <path d={ROAD_D} className="road-traveled" pathLength="1" style={{ strokeDashoffset: 1 - frac }} />

      {ORDER.map((key) => {
        const xy = ROAD_XY[key];
        const info = waypoints.find((w) => w.key === key) || { label: key };
        const isReached = frac >= (info.frac ?? 0);
        return (
          <g key={key} className={`waypoint ${isReached ? 'reached' : ''}`}>
            <circle cx={xy.x} cy={xy.y} r="9" className="waypoint-dot" />
            <text x={xy.x} y={xy.y - 16} textAnchor="middle" className="waypoint-label">{info.label}</text>
            {info.sub && (
              <text x={xy.x} y={xy.y + 26} textAnchor="middle" className="waypoint-sub">{info.sub}</text>
            )}
          </g>
        );
      })}

      <ArmyToken x={token.x} y={token.y} />
    </svg>
  );
}
