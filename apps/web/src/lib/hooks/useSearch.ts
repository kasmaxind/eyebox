'use client';

import { useQuery } from '@tanstack/react-query';
import api, { safeApiCall } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { demoVideos, demoSearchSuggestions } from '@/lib/demoData';
import type { Video, SearchFilters } from '@/types';

export function useSearch(query: string, filters: SearchFilters = {}) {
  const filterKey = JSON.stringify(filters);

  return useQuery({
    queryKey: queryKeys.search.results(query, filterKey),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>('/search', {
          params: { q: query, ...filters },
        });
        return data;
      }, demoVideos.filter((v) =>
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.channel.name.toLowerCase().includes(query.toLowerCase())
      ).length > 0
        ? demoVideos.filter((v) =>
            v.title.toLowerCase().includes(query.toLowerCase()) ||
            v.channel.name.toLowerCase().includes(query.toLowerCase())
          )
        : demoVideos.slice(0, 8)),
    enabled: query.length > 0,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: queryKeys.search.suggestions(query),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<string[]>('/search/suggestions', {
          params: { q: query },
        });
        return data;
      }, demoSearchSuggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )),
    enabled: query.length > 1,
  });
}
