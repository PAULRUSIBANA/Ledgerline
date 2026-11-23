const numberFormatter = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// RWF with no decimals, for example "RWF 1,200,000".
// Uses the ISO code rather than the en-RW currency symbol, which renders as "RF".
export function formatRWF(amount) {
  return `RWF ${numberFormatter.format(amount)}`;
}

// Plain number with grouping, used next to a separate "RWF" unit label.
export function formatNumber(amount) {
  return numberFormatter.format(amount);
}

// "2026-11-23" -> "23 Nov 2026". Parses the parts directly to avoid timezone shifts.
export function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}

// "2026-11" -> "Nov"
export function formatMonthShort(yearMonth) {
  const m = Number(yearMonth.split('-')[1]);
  return MONTHS[m - 1];
}

// Today's date in the user's local timezone as YYYY-MM-DD.
export function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Header label, for example "SUN 23 NOV 2026".
export function formatHeaderDate(date = new Date()) {
  const day = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()].toUpperCase();
  return `${day} ${String(date.getDate()).padStart(2, '0')} ${month} ${date.getFullYear()}`;
}

// True when the string is a real calendar date in YYYY-MM-DD form.
export function isRealISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// True when the date is more than 1 day after today.
export function isTooFarInFuture(value) {
  const [y, m, d] = value.split('-').map(Number);
  const [ty, tm, td] = todayISO().split('-').map(Number);
  const diffDays = (Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000;
  return diffDays > 1;
}
