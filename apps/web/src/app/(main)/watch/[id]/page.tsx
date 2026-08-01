'use client';

import { use, useState } from 'react';
import {
  ThumbsUp, ThumbsDown, Share2, Bookmark, MoreHorizontal, Keyboard,
} from 'lucide-react';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoCard from '@/components/video/VideoCard';
import CommentSection from '@/components/comments/CommentSection';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useVideo, useVideoComments, useRelatedVideos } from '@/lib/hooks/useVideo';
import { formatViews, formatRelativeTime } from '@/lib/utils';
import { KEYBOARD_SHORTCUTS } from '@/lib/constants';
import Link from 'next/link';

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: video, isLoading } = useVideo(id);
  const { data: comments } = useVideoComments(id);
  const { data: related } = useRelatedVideos(id);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  if (isLoading || !video) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="aspect-video rounded-xl bg-glass animate-pulse mb-4" />
        <div className="h-8 w-2/3 bg-glass animate-pulse rounded mb-4" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer
            src={video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            poster={video.thumbnail}
          />

          <div className="mt-4">
            <h1 className="text-xl font-semibold text-white mb-2">{video.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href={`/channel/${video.channel.handle}`}>
                  <Avatar src={video.channel.avatar} name={video.channel.name} size="md" />
                </Link>
                <div>
                  <Link href={`/channel/${video.channel.handle}`} className="font-semibold text-white hover:text-cyan transition-colors">
                    {video.channel.name}
                  </Link>
                  <p className="text-xs text-white/40">{formatViews(video.channel.subscriberCount)} subscribers</p>
                </div>
                <Button size="sm">Subscribe</Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center rounded-xl bg-glass border border-glass-border overflow-hidden">
                  <button
                    onClick={() => { setLiked(!liked); setDisliked(false); }}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm ${liked ? 'text-cyan' : 'text-white/70 hover:text-white'}`}
                  >
                    <ThumbsUp size={16} />
                    {formatViews(video.likes + (liked ? 1 : 0))}
                  </button>
                  <div className="w-px h-6 bg-glass-border" />
                  <button
                    onClick={() => { setDisliked(!disliked); setLiked(false); }}
                    className={`px-4 py-2 ${disliked ? 'text-red-400' : 'text-white/70 hover:text-white'}`}
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-glass border border-glass-border text-sm text-white/70 hover:text-white">
                  <Share2 size={16} /> Share
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-glass border border-glass-border text-sm ${saved ? 'text-cyan' : 'text-white/70 hover:text-white'}`}
                >
                  <Bookmark size={16} /> {saved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-2 rounded-xl bg-glass border border-glass-border text-white/70 hover:text-white"
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard size={16} />
                </button>
                <button className="p-2 rounded-xl bg-glass border border-glass-border text-white/70 hover:text-white">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-glass border border-glass-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-white">{formatViews(video.views)} views</span>
                <span className="text-white/30">·</span>
                <span className="text-sm text-white/50">{formatRelativeTime(video.publishedAt)}</span>
                <Badge variant="cyan" className="ml-2">{video.category}</Badge>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{video.description}</p>
            </div>

            <div className="mt-6">
              <CommentSection comments={comments ?? []} videoId={id} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/70">Up Next</h3>
          {related?.map((v, i) => (
            <VideoCard key={v.id} video={v} index={i} layout="horizontal" />
          ))}
        </div>
      </div>

      <Modal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} title="Keyboard Shortcuts">
        <div className="space-y-3">
          {KEYBOARD_SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-white/70">{s.action}</span>
              <kbd className="px-2 py-1 rounded bg-void-200 text-xs text-cyan font-mono">{s.key}</kbd>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
