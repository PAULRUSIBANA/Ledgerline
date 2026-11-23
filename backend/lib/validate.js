export const TYPES = ['income', 'expense'];
export const CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Salary', 'Other'];

const MAX_AMOUNT = 1_000_000_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Returns true when YYYY-MM-DD is a real calendar date (rejects 2026-02-30).
function isRealDate(value) {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// Trims strings in place-safe way and returns a cleaned copy of the input.
export function cleanInput(body = {}) {
  const trim = (v) => (typeof v === 'string' ? v.trim() : v);
  return {
    type: trim(body.type),
    amount: typeof body.amount === 'string' && body.amount.trim() !== '' ? Number(body.amount) : body.amount,
    category: trim(body.category),
    description: trim(body.description),
    date: trim(body.date),
  };
}

// Returns an array of error messages. Empty array means valid.
export function validateTransaction(input) {
  const errors = [];
  const { type, amount, category, description, date } = input;

  if (!TYPES.includes(type)) {
    errors.push('type must be "income" or "expense"');
  }

  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    errors.push('amount must be a whole number greater than 0 and no more than 1,000,000,000');
  }

  if (!CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  if (typeof description !== 'string' || description.length < 1 || description.length > 100) {
    errors.push('description is required and must be 1 to 100 characters');
  }

  if (typeof date !== 'string' || !isRealDate(date)) {
    errors.push('date is required and must be a real date in YYYY-MM-DD format');
  } else {
    const maxAllowed = Date.now() + 24 * 60 * 60 * 1000;
    const [y, m, d] = date.split('-').map(Number);
    if (Date.UTC(y, m - 1, d) > maxAllowed) {
      errors.push('date cannot be more than 1 day in the future');
    }
  }

  return errors;
}
