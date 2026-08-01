'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import type { Comment } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  videoId: string;
  isReply?: boolean;
}

export default function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className={isReply ? 'ml-12' : ''}>
      <div className="flex gap-3">
        <Avatar src={comment.author.avatar} name={comment.author.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{comment.author.name}</span>
            <span className="text-xs text-white/40">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-white/80 mt-1">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 text-xs ${liked ? 'text-cyan' : 'text-white/40 hover:text-white/70'}`}
            >
              <ThumbsUp size={14} />
              {comment.likes + (liked ? 1 : 0)}
            </button>
            <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70">
              <ThumbsDown size={14} />
            </button>
            <button className="text-xs text-white/40 hover:text-white/70 font-medium">Reply</button>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 mt-3 text-sm text-cyan hover:text-cyan-dim font-medium"
            >
              <MessageCircle size={14} />
              {showReplies ? 'Hide' : `${comment.replies.length} replies`}
            </button>
          )}

          {showReplies && comment.replies?.map((reply) => (
            <div key={reply.id} className="mt-4">
              <CommentItem comment={reply} videoId="" isReply />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
