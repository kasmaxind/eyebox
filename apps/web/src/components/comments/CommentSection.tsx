'use client';

import { useState } from 'react';
import type { Comment } from '@/types';
import CommentItem from './CommentItem';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

interface CommentSectionProps {
  comments: Comment[];
  videoId: string;
}

export default function CommentSection({ comments, videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const sorted = [...comments].sort((a, b) =>
    sortBy === 'top' ? b.likes - a.likes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-white">{comments.length} Comments</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'top' | 'newest')}
          className="text-sm bg-transparent text-white/50 border-none outline-none cursor-pointer"
        >
          <option value="top" className="bg-void-100">Top comments</option>
          <option value="newest" className="bg-void-100">Newest first</option>
        </select>
      </div>

      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.name || 'You'} size="sm" />
        <div className="flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-transparent border-b border-glass-border pb-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan/50 transition-colors"
          />
          {newComment && (
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setNewComment('')}>Cancel</Button>
              <Button size="sm" onClick={() => setNewComment('')}>Comment</Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {sorted.map((comment) => (
          <CommentItem key={comment.id} comment={comment} videoId={videoId} />
        ))}
      </div>
    </div>
  );
}
