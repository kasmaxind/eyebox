'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import VoiceSearch from '@/components/search/VoiceSearch';
import SearchFilters from '@/components/search/SearchFilters';
import VideoGrid from '@/components/video/VideoGrid';
import { useSearch } from '@/lib/hooks/useSearch';
import type { SearchFilters as Filters } from '@/types';

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState<Filters>({});
  const { data: results, isLoading } = useSearch(query, filters);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchBar autoFocus />
        </div>
        <VoiceSearch
          onResult={(text) => router.push(`/search?q=${encodeURIComponent(text)}`)}
        />
      </div>

      {query && (
        <>
          <h1 className="text-xl font-semibold text-white mb-2">
            Results for &ldquo;{query}&rdquo;
          </h1>
          <div className="mb-6">
            <SearchFilters filters={filters} onChange={setFilters} />
          </div>
          <VideoGrid videos={results ?? []} isLoading={isLoading} />
        </>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg">Search for videos, channels, and more</p>
          <p className="text-white/25 text-sm mt-2">Try voice search or type your query above</p>
        </div>
      )}
    </div>
  );
}
