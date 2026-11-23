import { CATEGORIES } from '../utils/validate.js';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
];

const CATEGORY_OPTIONS = [{ value: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))];

function Segments({ label, options, value, onChange, className = '' }) {
  return (
    <div className={`segmented ${className}`} role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="segment"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function FilterBar({ filters, onChange, onClear, active }) {
  return (
    <div className="filter-bar">
      <div className="filter-row">
        <span className="filter-label mono">Type</span>
        <Segments
          label="Filter by type"
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(type) => onChange({ type })}
        />
      </div>
      <div className="filter-row">
        <span className="filter-label mono">Category</span>
        <Segments
          label="Filter by category"
          options={CATEGORY_OPTIONS}
          value={filters.category}
          onChange={(category) => onChange({ category })}
          className="segmented-scroll"
        />
      </div>
      {active && (
        <button type="button" className="btn-text" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
