import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'transactions.json');

export class StoreError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'StoreError';
    this.cause = cause;
  }
}

// Creates data/transactions.json with [] when it is missing.
async function ensureFile() {
  try {
    await readFile(DATA_FILE, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw new StoreError(`Cannot access ${DATA_FILE}`, err);
    }
    try {
      await mkdir(path.dirname(DATA_FILE), { recursive: true });
      await writeFile(DATA_FILE, '[]\n', 'utf8');
    } catch (writeErr) {
      throw new StoreError(`Cannot create ${DATA_FILE}`, writeErr);
    }
  }
}

export async function readTransactions() {
  await ensureFile();
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) {
      throw new Error('transactions.json does not contain an array');
    }
    return parsed;
  } catch (err) {
    throw new StoreError(`Cannot read ${DATA_FILE}`, err);
  }
}

export async function writeTransactions(list) {
  try {
    await writeFile(DATA_FILE, JSON.stringify(list, null, 2) + '\n', 'utf8');
  } catch (err) {
    throw new StoreError(`Cannot write ${DATA_FILE}`, err);
  }
}
