import { useState } from 'react';
import { formatDate, formatRWF } from '../utils/format.js';
import { TrashIcon } from './icons.jsx';

const EXIT_MS = 240;

function SkeletonRows() {
  return (
    <ul className="tx-list" aria-busy="true" aria-label="Loading transactions">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="tx-row tx-row-skeleton">
          <div className="skeleton skeleton-line" style={{ width: 80 }} />
          <div className="skeleton skeleton-line" style={{ width: '50%' }} />
          <div className="skeleton skeleton-line" style={{ width: 90 }} />
        </li>
      ))}
    </ul>
  );
}

export default function TransactionList({ transactions, loading, error, onRetry, onDelete, filtersActive }) {
  const [pendingId, setPendingId] = useState(null);
  const [exitingId, setExitingId] = useState(null);

  if (loading && transactions.length === 0) return <SkeletonRows />;

  if (error) {
    return (
      <div className="list-state" role="alert">
        <p>Could not load transactions. {error}</p>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="list-state">
        <p>{filtersActive ? 'Nothing matches these filters.' : 'No transactions yet. Add your first one above.'}</p>
      </div>
    );
  }

  function confirmDelete(id) {
    setPendingId(null);
    setExitingId(id);
    // Let the row animate out, then remove it and refresh the summary.
    window.setTimeout(() => onDelete(id), EXIT_MS);
  }

  return (
    <ul className="tx-list" aria-label="Transactions">
      {transactions.map((t) => {
        const isIncome = t.type === 'income';
        const isPending = pendingId === t.id;
        const isExiting = exitingId === t.id;
        return (
          <li key={t.id} className={`tx-row ${isExiting ? 'is-exiting' : ''}`}>
            <time className="mono tx-date" dateTime={t.date}>
              {formatDate(t.date)}
            </time>

            <div className="tx-main">
              <p className="tx-desc">{t.description}</p>
              <span className="pill">{t.category}</span>
            </div>

            <p className={`mono tx-amount ${isIncome ? 'income' : 'expense'}`}>
              {isIncome ? '+' : '−'}
              {formatRWF(t.amount)}
            </p>

            {isPending ? (
              <div className="confirm" role="group" aria-label={`Confirm delete ${t.description}`}>
                <span>Delete?</span>
                <button type="button" className="btn-chip btn-chip-danger" onClick={() => confirmDelete(t.id)}>
                  Yes
                </button>
                <button type="button" className="btn-chip" onClick={() => setPendingId(null)}>
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="icon-btn"
                aria-label={`Delete ${t.description}`}
                onClick={() => setPendingId(t.id)}
                disabled={isExiting}
              >
                <TrashIcon />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
