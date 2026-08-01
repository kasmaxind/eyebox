import { Suspense } from 'react';
import SearchPageContent from './SearchPageContent';
import { VideoGridSkeleton } from '@/components/ui/Skeleton';

export default function SearchPage() {
  return (
    <Suspense fallback={<VideoGridSkeleton count={4} />}>
      <SearchPageContent />
    </Suspense>
  );
}
