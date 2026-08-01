'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useSearchSuggestions } from '@/lib/hooks/useSearch';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ className, autoFocus }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: suggestions = [] } = useSearchSuggestions(query);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setIsFocused(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200',
          'bg-glass border backdrop-blur-xl',
          isFocused ? 'border-cyan/40 ring-1 ring-cyan/20' : 'border-glass-border'
        )}
      >
        <Search size={18} className="text-white/40 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Search videos, channels, topics..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl bg-void-100 border border-glass-border backdrop-blur-xl shadow-2xl z-50">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:text-white hover:bg-glass-hover flex items-center gap-3"
            >
              <Search size={14} className="text-white/30" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
