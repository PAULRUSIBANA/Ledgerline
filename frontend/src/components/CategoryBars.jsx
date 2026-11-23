import { formatRWF } from '../utils/format.js';

// Income-only categories are excluded from spending.
const SPENDING_CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Other'];

export default function CategoryBars({ summary }) {
  if (!summary) {
    return (
      <section className="card category-card" aria-busy="true">
        <p className="eyebrow">Spending by category</p>
        <div className="skeleton skeleton-rows" />
      </section>
    );
  }

  const rows = SPENDING_CATEGORIES.map((name) => ({ name, total: summary.byCategory[name] ?? 0 }));
  const largest = Math.max(0, ...rows.map((r) => r.total));

  return (
    <section className="card category-card" aria-labelledby="category-eyebrow">
      <p className="eyebrow" id="category-eyebrow">
        Spending by category
      </p>
      <ul className="category-list">
        {rows.map((row) => {
          const width = largest > 0 ? (row.total / largest) * 100 : 0;
          return (
            <li key={row.name} className="category-row">
              <div className="category-head">
                <span className="category-name">{row.name}</span>
                <span className="mono category-amount">{formatRWF(row.total)}</span>
              </div>
              <div
                className="category-track"
                role="meter"
                aria-label={`${row.name} spending`}
                aria-valuemin={0}
                aria-valuemax={largest}
                aria-valuenow={row.total}
                aria-valuetext={formatRWF(row.total)}
              >
                <div className="category-fill" style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
