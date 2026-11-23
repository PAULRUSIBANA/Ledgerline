import { formatMonthShort, formatNumber, formatRWF } from '../utils/format.js';

export default function BalanceCard({ summary }) {
  if (!summary) {
    return (
      <section className="card balance-card" aria-busy="true" aria-label="Loading balance">
        <div className="skeleton skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton skeleton-balance" />
        <div className="skeleton skeleton-line" style={{ width: '60%' }} />
      </section>
    );
  }

  const balance = summary.balance;
  const isNegative = balance < 0;
  const current = summary.monthly[summary.monthly.length - 1];
  const monthName = formatMonthShort(current.month);

  return (
    <section className="card balance-card" aria-labelledby="balance-eyebrow">
      <div className="card-top">
        <p className="eyebrow" id="balance-eyebrow">
          Current balance
        </p>
        <span className="live" aria-label="Live">
          <span className="live-dot" aria-hidden="true" />
          <span>Live</span>
        </span>
      </div>

      <p className={`balance-value ${isNegative ? 'is-negative' : ''}`}>
        <span className="balance-unit">RWF</span>{' '}
        <span className="balance-num">
          {isNegative ? '−' : ''}
          {formatNumber(Math.abs(balance))}
        </span>
      </p>

      <dl className="balance-meta">
        <div>
          <dt>Income this month ({monthName})</dt>
          <dd className="mono income">{formatRWF(current.income)}</dd>
        </div>
        <div>
          <dt>Expenses this month ({monthName})</dt>
          <dd className="mono expense">{formatRWF(current.expenses)}</dd>
        </div>
      </dl>
    </section>
  );
}
