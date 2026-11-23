import { formatMonthShort, formatRWF } from '../utils/format.js';

const VB_W = 600;
const VB_H = 220;
const PAD_Y = 22;

// Monotone cubic (Fritsch-Carlson) path: a smooth curve that never overshoots the data.
function monotonePath(pts) {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;

  const dx = [];
  const slope = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x;
    slope[i] = (pts[i + 1].y - pts[i].y) / dx[i];
  }

  const m = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }

  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }

  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    const c1x = pts[i].x + h;
    const c1y = pts[i].y + m[i] * h;
    const c2x = pts[i + 1].x - h;
    const c2y = pts[i + 1].y - m[i + 1] * h;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${pts[i + 1].x.toFixed(2)},${pts[i + 1].y.toFixed(2)}`;
  }
  return d;
}

export default function TrendChart({ summary }) {
  if (!summary) {
    return (
      <section className="card chart-card" aria-busy="true">
        <p className="eyebrow">Last 6 months</p>
        <div className="chart-box skeleton" />
      </section>
    );
  }

  // Cumulative net (income minus expenses) per month, oldest first.
  let running = 0;
  const series = summary.monthly.map((m) => {
    running += m.income - m.expenses;
    return { month: m.month, value: running };
  });

  const hasActivity = summary.monthly.some((m) => m.income > 0 || m.expenses > 0);

  if (!hasActivity) {
    return (
      <section className="card chart-card">
        <p className="eyebrow">Last 6 months</p>
        <div className="chart-empty">
          <p>No activity yet. Add your first transaction.</p>
        </div>
      </section>
    );
  }

  const values = series.map((s) => s.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;
  const n = series.length;

  const pts = series.map((s, i) => ({
    x: ((i + 0.5) / n) * VB_W,
    y: PAD_Y + ((max - s.value) / range) * (VB_H - PAD_Y * 2),
  }));

  const linePath = monotonePath(pts);
  const areaPath = `${linePath} L${pts[n - 1].x.toFixed(2)},${VB_H} L${pts[0].x.toFixed(2)},${VB_H} Z`;
  const last = pts[n - 1];

  const first = series[0].value;
  const latest = series[n - 1].value;
  const trendWord = latest > first ? 'rose' : latest < first ? 'fell' : 'stayed flat';
  const ariaLabel = `Cumulative net balance over the last six months ${trendWord}, from ${formatRWF(
    first
  )} in ${formatMonthShort(series[0].month)} to ${formatRWF(latest)} in ${formatMonthShort(
    series[n - 1].month
  )}.`;

  return (
    <section className="card chart-card">
      <div className="card-top">
        <p className="eyebrow">Last 6 months</p>
        <p className="chart-caption mono">Net, cumulative</p>
      </div>

      <div className="chart-box">
        <svg
          className="chart-svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={ariaLabel}
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(47,107,255,0.35)" />
              <stop offset="100%" stopColor="rgba(47,107,255,0)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#trend-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--blue-500)"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span
          className="chart-dot"
          aria-hidden="true"
          style={{ left: `${(last.x / VB_W) * 100}%`, top: `${(last.y / VB_H) * 100}%` }}
        />
      </div>

      <ul className="chart-axis mono" aria-hidden="true">
        {series.map((s) => (
          <li key={s.month}>{formatMonthShort(s.month)}</li>
        ))}
      </ul>
    </section>
  );
}
