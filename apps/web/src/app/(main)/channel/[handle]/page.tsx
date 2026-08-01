'use client';

import { use, useState } from 'react';
import ChannelHeader from '@/components/channel/ChannelHeader';
import ChannelTabs from '@/components/channel/ChannelTabs';
import VideoGrid from '@/components/video/VideoGrid';
import { useChannel, useChannelVideos } from '@/lib/hooks/useVideo';
import { formatViews } from '@/lib/utils';

export default function ChannelPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const { data: channel, isLoading: channelLoading } = useChannel(handle);
  const { data: videos, isLoading: videosLoading } = useChannelVideos(handle);
  const [activeTab, setActiveTab] = useState('videos');

  if (channelLoading || !channel) {
    return <div className="h-64 rounded-2xl bg-glass animate-pulse" />;
  }

  return (
    <div>
      <ChannelHeader channel={channel} />
      <div className="mt-6">
        <ChannelTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-6">
        {activeTab === 'videos' && (
          <VideoGrid videos={videos ?? []} isLoading={videosLoading} />
        )}
        {activeTab === 'shorts' && (
          <VideoGrid videos={(videos ?? []).filter((v) => v.isShort)} isLoading={videosLoading} />
        )}
        {activeTab === 'playlists' && (
          <div className="text-center py-16 text-white/40">No playlists yet</div>
        )}
        {activeTab === 'community' && (
          <div className="text-center py-16 text-white/40">Community posts coming soon</div>
        )}
        {activeTab === 'about' && (
          <div className="max-w-2xl p-6 rounded-2xl glass-panel">
            <h3 className="text-lg font-semibold text-white mb-4">About {channel.name}</h3>
            <p className="text-white/70 leading-relaxed mb-4">{channel.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/40">Joined</span>
                <p className="text-white font-medium">January 2024</p>
              </div>
              <div>
                <span className="text-white/40">Total views</span>
                <p className="text-white font-medium">{formatViews(channel.subscriberCount * 50)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
