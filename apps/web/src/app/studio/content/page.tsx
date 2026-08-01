'use client';

import ContentTable from '@/components/studio/ContentTable';
import { demoStudioContent } from '@/lib/demoData';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function StudioContentPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-orbitron font-bold text-white">Content</h1>
        <Link href="/upload"><Button size="sm">Upload New</Button></Link>
      </div>
      <ContentTable items={demoStudioContent as Parameters<typeof ContentTable>[0]['items']} />
    </div>
  );
}
