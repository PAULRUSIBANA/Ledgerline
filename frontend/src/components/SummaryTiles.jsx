import { useEffect, useRef, useState } from 'react';
import { formatNumber, formatRWF } from '../utils/format.js';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Counts from the last shown value to target over `duration` ms.
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const from = current.current;
    if (prefersReducedMotion() || from === target) {
      current.current = target;
      setValue(target);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
      current.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function Tile({ label, target, format, tone }) {
  const animated = useCountUp(target ?? 0);
  return (
    <div className={`card tile tile-${tone}`}>
      <p className="mono tile-label">{label}</p>
      <p className="tile-value mono">{target == null ? '—' : format(animated)}</p>
    </div>
  );
}

export default function SummaryTiles({ summary, transactionCount }) {
  const loading = !summary;
  return (
    <section className="tiles" aria-label="Totals" aria-busy={loading}>
      <Tile
        label="Total income"
        tone="income"
        target={loading ? null : summary.totalIncome}
        format={formatRWF}
      />
      <Tile
        label="Total expenses"
        tone="expense"
        target={loading ? null : summary.totalExpenses}
        format={formatRWF}
      />
      <Tile
        label="Transactions"
        tone="neutral"
        target={loading ? null : transactionCount}
        format={formatNumber}
      />
    </section>
  );
}
