'use client';

import { demoComments } from '@/lib/demoData';
import CommentItem from '@/components/comments/CommentItem';
import Badge from '@/components/ui/Badge';

export default function StudioCommentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Comments</h1>
      <div className="flex gap-2 mb-6">
        <Badge variant="cyan">All</Badge>
        <Badge>Published</Badge>
        <Badge>Held for review</Badge>
        <Badge>Spam</Badge>
      </div>
      <div className="space-y-4">
        {demoComments.map((comment) => (
          <div key={comment.id} className="p-4 rounded-xl glass-panel">
            <CommentItem comment={comment} videoId="" />
            <div className="flex gap-2 mt-3 ml-12">
              <button className="text-xs text-green-400 hover:underline">Approve</button>
              <button className="text-xs text-red-400 hover:underline">Remove</button>
              <button className="text-xs text-white/40 hover:underline">Mark as spam</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
