'use client';

import type { SearchFilters as Filters } from '@/types';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const durationOptions = [
  { value: undefined, label: 'Any duration' },
  { value: 'short' as const, label: 'Under 4 min' },
  { value: 'medium' as const, label: '4–20 min' },
  { value: 'long' as const, label: 'Over 20 min' },
];

const dateOptions = [
  { value: undefined, label: 'Any time' },
  { value: 'hour' as const, label: 'Last hour' },
  { value: 'today' as const, label: 'Today' },
  { value: 'week' as const, label: 'This week' },
  { value: 'month' as const, label: 'This month' },
  { value: 'year' as const, label: 'This year' },
];

const sortOptions = [
  { value: 'relevance' as const, label: 'Relevance' },
  { value: 'date' as const, label: 'Upload date' },
  { value: 'views' as const, label: 'View count' },
  { value: 'rating' as const, label: 'Rating' },
];

export default function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterSelect
        label="Duration"
        value={filters.duration}
        options={durationOptions}
        onChange={(v) => onChange({ ...filters, duration: v })}
      />
      <FilterSelect
        label="Upload date"
        value={filters.uploadDate}
        options={dateOptions}
        onChange={(v) => onChange({ ...filters, uploadDate: v })}
      />
      <FilterSelect
        label="Sort by"
        value={filters.sortBy}
        options={sortOptions}
        onChange={(v) => onChange({ ...filters, sortBy: v })}
      />
    </div>
  );
}

function FilterSelect<T extends string | undefined>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange((e.target.value || undefined) as T)}
      aria-label={label}
      className={cn(
        'px-3 py-2 rounded-xl text-sm bg-glass border border-glass-border',
        'text-white/70 backdrop-blur-sm cursor-pointer',
        'focus:outline-none focus:border-cyan/40'
      )}
    >
      {options.map((opt) => (
        <option key={opt.label} value={opt.value ?? ''} className="bg-void-100">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
