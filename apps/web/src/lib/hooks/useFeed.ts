'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api, { safeApiCall } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import {
  demoVideos,
  demoTrendingVideos,
  demoContinueWatching,
  demoShorts,
  demoLiveVideos,
  demoCreators,
} from '@/lib/demoData';
import type { Video, Channel, PaginatedResponse } from '@/types';

interface HomeFeedData {
  continueWatching: Video[];
  trending: Video[];
  shorts: Video[];
  live: Video[];
  creators: Channel[];
}

export function useHomeFeed() {
  return useQuery({
    queryKey: queryKeys.feed.home,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<HomeFeedData>('/feed/home');
        return data;
      }, {
        continueWatching: demoContinueWatching,
        trending: demoTrendingVideos,
        shorts: demoShorts.slice(0, 6),
        live: demoLiveVideos,
        creators: demoCreators,
      }),
    staleTime: 60 * 1000,
  });
}

export function useTrendingFeed() {
  return useQuery({
    queryKey: queryKeys.feed.trending,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>('/feed/trending');
        return data;
      }, demoTrendingVideos),
  });
}

export function useRecommendedFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'recommended'],
    queryFn: ({ pageParam = 1 }) =>
      safeApiCall(async () => {
        const { data } = await api.get<PaginatedResponse<Video>>('/feed/recommended', {
          params: { page: pageParam, limit: 12 },
        });
        return data;
      }, {
        data: demoVideos.slice((pageParam - 1) * 12, pageParam * 12),
        total: demoVideos.length,
        page: pageParam,
        limit: 12,
        hasMore: pageParam * 12 < demoVideos.length,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export function useCategoryFeed(category: string) {
  return useQuery({
    queryKey: queryKeys.feed.category(category),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>(`/feed/category/${category}`);
        return data;
      }, demoVideos.filter((v) => v.category === category).length > 0
        ? demoVideos.filter((v) => v.category === category)
        : demoVideos.slice(0, 8)),
  });
}

export function useShortsFeed() {
  return useQuery({
    queryKey: queryKeys.feed.shorts,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>('/feed/shorts');
        return data;
      }, demoShorts),
  });
}

export function useLiveFeed() {
  return useQuery({
    queryKey: queryKeys.feed.live,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>('/feed/live');
        return data;
      }, demoLiveVideos),
  });
}

export function useCreators() {
  return useQuery({
    queryKey: queryKeys.feed.creators,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Channel[]>('/feed/creators');
        return data;
      }, demoCreators),
  });
}

export function useLibrary(type: 'history' | 'watch-later' | 'liked' | 'downloads' | 'subscriptions') {
  const keyMap = {
    history: queryKeys.library.history,
    'watch-later': queryKeys.library.watchLater,
    liked: queryKeys.library.liked,
    downloads: queryKeys.library.downloads,
    subscriptions: queryKeys.library.subscriptions,
  };

  return useQuery({
    queryKey: keyMap[type],
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>(`/library/${type}`);
        return data;
      }, type === 'subscriptions' ? [] : demoVideos.slice(0, type === 'history' ? 10 : 6)),
  });
}
