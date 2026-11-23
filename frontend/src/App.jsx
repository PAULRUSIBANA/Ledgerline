import { useCallback, useState } from 'react';
import { useTransactions } from './hooks/useTransactions.js';
import Header from './components/Header.jsx';
import BalanceCard from './components/BalanceCard.jsx';
import SummaryTiles from './components/SummaryTiles.jsx';
import TrendChart from './components/TrendChart.jsx';
import CategoryBars from './components/CategoryBars.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import FilterBar from './components/FilterBar.jsx';
import TransactionList from './components/TransactionList.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const {
    transactions,
    summary,
    filters,
    updateFilters,
    loading,
    error,
    refresh,
    addTransaction,
    removeTransaction,
  } = useTransactions();

  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const notify = useCallback((message, kind = 'success') => {
    setToast({ id: Date.now(), message, kind });
  }, []);

  const filtersActive = filters.type !== 'all' || filters.category !== 'all';

  async function handleAdd(body) {
    try {
      await addTransaction(body);
      notify('Transaction added');
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  }

  async function handleDelete(id) {
    try {
      await removeTransaction(id);
      notify('Transaction deleted');
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  return (
    <>
      <Header />

      <main className="container">
        <section className="intro rise">
          <p className="eyebrow">Personal ledger</p>
          <h1 className="page-title">
            Your money, <em className="serif-accent">in order.</em>
          </h1>
        </section>

        <div className="dashboard">
          <div className="slot slot-balance rise">
            <BalanceCard summary={summary} />
          </div>
          <div className="slot slot-tiles rise">
            <SummaryTiles summary={summary} transactionCount={transactions.length} />
          </div>
          <div className="slot slot-form rise">
            <TransactionForm onSubmit={handleAdd} />
          </div>
          <div className="slot slot-chart rise">
            <TrendChart summary={summary} />
          </div>
          <div className="slot slot-categories rise">
            <CategoryBars summary={summary} />
          </div>
          <div className="slot slot-ledger rise">
            <section className="card ledger-card" aria-labelledby="ledger-eyebrow">
              <div className="ledger-head">
                <p className="eyebrow" id="ledger-eyebrow">
                  Transactions
                </p>
                <FilterBar
                  filters={filters}
                  onChange={updateFilters}
                  onClear={() => updateFilters({ type: 'all', category: 'all' })}
                  active={filtersActive}
                />
              </div>
              <TransactionList
                transactions={transactions}
                loading={loading}
                error={error}
                onRetry={refresh}
                onDelete={handleDelete}
                filtersActive={filtersActive}
              />
            </section>
          </div>
        </div>
      </main>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
