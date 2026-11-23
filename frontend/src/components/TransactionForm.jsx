import { useId, useState } from 'react';
import { FORM_CATEGORIES, validateTransactionForm } from '../utils/validate.js';
import { todayISO } from '../utils/format.js';

const defaultCategory = (type) => FORM_CATEGORIES[type][0];

const initialValues = (type = 'expense', date = todayISO()) => ({
  type,
  amount: '',
  category: defaultCategory(type),
  description: '',
  date,
});

// onSubmit(body) returns true on success (form resets) or false on failure (values kept).
export default function TransactionForm({ onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uid = useId();
  const ids = {
    amount: `${uid}-amount`,
    category: `${uid}-category`,
    description: `${uid}-description`,
    date: `${uid}-date`,
  };

  const errors = validateTransactionForm(values);
  const showError = (field) => (attempted && errors[field] ? errors[field] : null);

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }));

  const setType = (type) => {
    // Keep the chosen date, reset the category to a valid one for the new type.
    update({ type, category: defaultCategory(type) });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length > 0 || submitting) return;

    const body = {
      type: values.type,
      amount: Number(values.amount),
      category: values.category,
      description: values.description.trim(),
      date: values.date,
    };

    setSubmitting(true);
    const ok = await onSubmit(body);
    setSubmitting(false);

    if (ok) {
      setValues((prev) => ({ ...initialValues(prev.type, prev.date) }));
      setAttempted(false);
    }
  }

  const categories = FORM_CATEGORIES[values.type];

  return (
    <section className="card form-card" aria-labelledby={`${uid}-eyebrow`}>
      <p className="eyebrow" id={`${uid}-eyebrow`}>
        New transaction
      </p>

      <div className="segmented segmented-full" role="group" aria-label="Transaction type">
        {[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="segment"
            aria-pressed={values.type === opt.value}
            onClick={() => setType(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <form className="tx-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={ids.amount}>Amount (RWF)</label>
          <input
            id={ids.amount}
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            placeholder="e.g. 5000"
            value={values.amount}
            onChange={(e) => update({ amount: e.target.value })}
            aria-invalid={Boolean(showError('amount'))}
            aria-describedby={showError('amount') ? `${ids.amount}-error` : undefined}
          />
          {showError('amount') && (
            <p className="field-error" id={`${ids.amount}-error`}>
              {showError('amount')}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={ids.category}>Category</label>
          <select
            id={ids.category}
            value={values.category}
            onChange={(e) => update({ category: e.target.value })}
            aria-invalid={Boolean(showError('category'))}
            aria-describedby={showError('category') ? `${ids.category}-error` : undefined}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {showError('category') && (
            <p className="field-error" id={`${ids.category}-error`}>
              {showError('category')}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={ids.description}>Description</label>
          <input
            id={ids.description}
            type="text"
            maxLength={150}
            placeholder="What was it for?"
            value={values.description}
            onChange={(e) => update({ description: e.target.value })}
            aria-invalid={Boolean(showError('description'))}
            aria-describedby={showError('description') ? `${ids.description}-error` : undefined}
          />
          {showError('description') && (
            <p className="field-error" id={`${ids.description}-error`}>
              {showError('description')}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={ids.date}>Date</label>
          <input
            id={ids.date}
            type="date"
            value={values.date}
            onChange={(e) => update({ date: e.target.value })}
            aria-invalid={Boolean(showError('date'))}
            aria-describedby={showError('date') ? `${ids.date}-error` : undefined}
          />
          {showError('date') && (
            <p className="field-error" id={`${ids.date}-error`}>
              {showError('date')}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              <span>Saving…</span>
            </>
          ) : (
            'Add transaction'
          )}
        </button>
      </form>
    </section>
  );
}
