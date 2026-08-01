'use client';

import Tabs from '@/components/ui/Tabs';

const channelTabs = [
  { id: 'videos', label: 'Videos' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'community', label: 'Community' },
  { id: 'about', label: 'About' },
];

interface ChannelTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function ChannelTabs({ activeTab, onChange }: ChannelTabsProps) {
  return <Tabs tabs={channelTabs} activeTab={activeTab} onChange={onChange} />;
}
