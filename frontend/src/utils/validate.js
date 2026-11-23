import { isRealISODate, isTooFarInFuture } from './format.js';

export const MAX_AMOUNT = 1_000_000_000;

export const CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Salary', 'Other'];

// Categories offered by the form for each type. Mirrors the backend rules.
export const FORM_CATEGORIES = {
  expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Other'],
  income: ['Salary', 'Other'],
};

// Returns an object of field -> message. Empty object means valid.
export function validateTransactionForm({ type, amount, category, description, date }) {
  const errors = {};

  const n = Number(amount);
  if (amount === '' || !Number.isInteger(n) || n <= 0 || n > MAX_AMOUNT) {
    errors.amount = 'Enter a whole number between 1 and 1,000,000,000.';
  }

  if (!FORM_CATEGORIES[type]?.includes(category)) {
    errors.category = 'Choose a category for this type.';
  }

  const trimmed = description.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    errors.description = 'Description must be 1 to 100 characters.';
  }

  if (!isRealISODate(date)) {
    errors.date = 'Enter a valid date.';
  } else if (isTooFarInFuture(date)) {
    errors.date = 'Date cannot be more than 1 day in the future.';
  }

  return errors;
}
