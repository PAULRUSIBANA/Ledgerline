import { Router } from 'express';
import { readTransactions, writeTransactions } from '../lib/store.js';
import { CATEGORIES, TYPES, cleanInput, validateTransaction } from '../lib/validate.js';

const router = Router();

const sortNewestFirst = (a, b) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

// Builds the last N calendar months (YYYY-MM), oldest first, ending with the current month (UTC).
function lastMonths(count) {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

// GET /api/transactions?type=&category=  (invalid filter values are ignored)
router.get('/transactions', async (req, res, next) => {
  try {
    const { type, category } = req.query;
    let list = await readTransactions();

    if (typeof type === 'string' && TYPES.includes(type)) {
      list = list.filter((t) => t.type === type);
    }
    if (typeof category === 'string' && CATEGORIES.includes(category)) {
      list = list.filter((t) => t.category === category);
    }

    res.json([...list].sort(sortNewestFirst));
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions
router.post('/transactions', async (req, res, next) => {
  try {
    const input = cleanInput(req.body);
    const errors = validateTransaction(input);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const transaction = {
      id: Date.now().toString(),
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: input.date,
      createdAt: new Date().toISOString(),
    };

    const list = await readTransactions();
    list.push(transaction);
    await writeTransactions(list);

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/transactions/:id
router.delete('/transactions/:id', async (req, res, next) => {
  try {
    const list = await readTransactions();
    const index = list.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    list.splice(index, 1);
    await writeTransactions(list);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/summary
router.get('/summary', async (req, res, next) => {
  try {
    const list = await readTransactions();

    let totalIncome = 0;
    let totalExpenses = 0;
    const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));

    const months = lastMonths(6);
    const monthly = Object.fromEntries(
      months.map((m) => [m, { month: m, income: 0, expenses: 0 }])
    );

    for (const t of list) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        if (t.category in byCategory) byCategory[t.category] += t.amount;
      }

      const bucket = monthly[t.date.slice(0, 7)];
      if (bucket) {
        if (t.type === 'income') bucket.income += t.amount;
        else bucket.expenses += t.amount;
      }
    }

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      byCategory,
      monthly: months.map((m) => monthly[m]),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
