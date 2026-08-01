'use client';

import CategoryChips from '@/components/feed/CategoryChips';
import ContinueWatching from '@/components/feed/ContinueWatching';
import TrendingRow from '@/components/feed/TrendingRow';
import CreatorRow from '@/components/feed/CreatorRow';
import InfiniteFeed from '@/components/feed/InfiniteFeed';
import VideoCard from '@/components/video/VideoCard';
import { useHomeFeed, useRecommendedFeed } from '@/lib/hooks/useFeed';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { data: homeData, isLoading: homeLoading } = useHomeFeed();
  const {
    data: recommendedData,
    isLoading: recLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRecommendedFeed();

  const allRecommended = recommendedData?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <CategoryChips />

      {!homeLoading && homeData && (
        <>
          <ContinueWatching videos={homeData.continueWatching} />
          <TrendingRow videos={homeData.trending} />
        </>
      )}

      {/* Shorts row */}
      {!homeLoading && homeData?.shorts && homeData.shorts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Shorts</h2>
            <Link href="/shorts" className="text-sm text-cyan hover:text-cyan-dim flex items-center gap-1">
              See all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {homeData.shorts.map((video, i) => (
              <div key={video.id} className="w-36 shrink-0">
                <VideoCard video={video} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Live row */}
      {!homeLoading && homeData?.live && homeData.live.length > 0 && (
        <TrendingRow videos={homeData.live} title="Live Now" />
      )}

      {!homeLoading && homeData?.creators && (
        <CreatorRow creators={homeData.creators} />
      )}

      <InfiniteFeed
        videos={allRecommended}
        hasMore={!!hasNextPage}
        isLoading={recLoading}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        title="AI Recommended"
      />
    </div>
  );
}
