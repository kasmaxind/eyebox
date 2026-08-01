import type { Channel, Comment, Notification, StudioStats, AdminStats, Video } from '@/types';

const channels: Channel[] = [
  {
    id: 'ch1',
    handle: 'neuralvision',
    name: 'Neural Vision',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=neuralvision',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=300&fit=crop',
    description: 'Exploring the frontier of AI, machine learning, and the future of technology.',
    subscriberCount: 2_400_000,
    videoCount: 342,
    isVerified: true,
    isSubscribed: true,
  },
  {
    id: 'ch2',
    handle: 'cyberbeats',
    name: 'Cyber Beats',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=cyberbeats',
    subscriberCount: 890_000,
    videoCount: 156,
    isVerified: true,
  },
  {
    id: 'ch3',
    handle: 'quantumplay',
    name: 'Quantum Play',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=quantumplay',
    subscriberCount: 1_200_000,
    videoCount: 89,
    isVerified: true,
  },
  {
    id: 'ch4',
    handle: 'aiedu',
    name: 'AI Education Hub',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=aiedu',
    subscriberCount: 560_000,
    videoCount: 210,
    isVerified: false,
  },
  {
    id: 'ch5',
    handle: 'neonarena',
    name: 'Neon Arena',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=neonarena',
    subscriberCount: 3_100_000,
    videoCount: 478,
    isVerified: true,
  },
  {
    id: 'ch6',
    handle: 'futurefilms',
    name: 'Future Films',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=futurefilms',
    subscriberCount: 720_000,
    videoCount: 67,
    isVerified: true,
  },
];

const thumbnails = [
  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1538481199705-c710c4e213fc?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=360&fit=crop',
];

const titles = [
  'How AI is Reshaping Video Streaming in 2026',
  'Building Neural Networks from Scratch — Full Course',
  'The Future of Gaming: Ray Tracing & AI Upscaling',
  'Live: Cyberpunk City Ambience — 4K HDR',
  'Top 10 AI Tools Every Creator Needs',
  'Quantum Computing Explained in 15 Minutes',
  'Epic Synthwave Mix — Focus & Productivity',
  'Creating Cinematic Visuals with AI',
  'Pro Gaming Tips: Rank Up Fast in 2026',
  'Documentary: The Rise of Machine Learning',
  'React 19 + Next.js 15 — Complete Tutorial',
  'Sports Highlights: Championship Finals 2026',
  'Breaking: Latest Tech News Roundup',
  'Lo-Fi Beats to Code To — 3 Hour Mix',
  'Short: AI Generated Art in 60 Seconds',
  'Deep Dive: Large Language Models',
  'Movie Review: Blade Runner 2099',
  'Fitness & Wellness with Smart AI Coaching',
  'How to Monetize Your Channel in 2026',
  'Behind the Scenes: Studio Setup Tour',
  'Data Science for Beginners — Week 1',
  'Esports Finals — Full Match Highlights',
  'Cooking with AI: Recipe Generator Demo',
  'Space Exploration: Mars Mission Update',
];

const categories = ['tech', 'education', 'gaming', 'entertainment', 'music', 'movies', 'sports', 'news'] as const;

function createVideo(index: number, overrides: Partial<Video> = {}): Video {
  const channel = channels[index % channels.length];
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `vid-${index + 1}`,
    title: titles[index % titles.length],
    description: 'Experience the next generation of video content powered by AI-driven recommendations and cinematic quality streaming.',
    thumbnail: thumbnails[index % thumbnails.length],
    duration: 120 + (index % 20) * 60 + (index % 45),
    views: Math.floor(Math.random() * 5_000_000) + 10_000,
    likes: Math.floor(Math.random() * 200_000) + 1_000,
    dislikes: Math.floor(Math.random() * 5_000),
    publishedAt: date.toISOString(),
    category: categories[index % categories.length],
    channel,
    tags: ['ai', 'tech', 'future', 'streaming'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ...overrides,
  };
}

export const demoVideos: Video[] = Array.from({ length: 24 }, (_, i) => createVideo(i));

export const demoTrendingVideos: Video[] = demoVideos.slice(0, 8).map((v, i) => ({
  ...v,
  views: v.views * (3 - i * 0.2),
}));

export const demoContinueWatching: Video[] = demoVideos.slice(0, 4).map((v, i) => ({
  ...v,
  progress: 0.2 + i * 0.15,
}));

export const demoShorts: Video[] = Array.from({ length: 12 }, (_, i) =>
  createVideo(i + 100, {
    id: `short-${i + 1}`,
    title: `Short #${i + 1}: ${titles[i % 5]}`,
    isShort: true,
    duration: 15 + (i % 45),
    thumbnail: thumbnails[(i + 3) % thumbnails.length],
  })
);

export const demoLiveVideos: Video[] = [
  createVideo(200, { id: 'live-1', title: 'LIVE: AI Summit Keynote 2026', isLive: true, views: 45_000 }),
  createVideo(201, { id: 'live-2', title: 'LIVE: Gaming Marathon — 24 Hours', isLive: true, views: 128_000 }),
  createVideo(202, { id: 'live-3', title: 'LIVE: Music Production Session', isLive: true, views: 8_500 }),
];

export const demoCreators: Channel[] = channels;

export function getDemoVideo(id: string): Video | undefined {
  const all = [...demoVideos, ...demoShorts, ...demoLiveVideos];
  return all.find((v) => v.id === id) ?? demoVideos[0];
}

export function getDemoChannel(handle: string): Channel | undefined {
  return channels.find((c) => c.handle === handle) ?? channels[0];
}

export function getDemoChannelVideos(handle: string): Video[] {
  const channel = getDemoChannel(handle);
  return demoVideos.filter((v) => v.channel.handle === handle).length > 0
    ? demoVideos.filter((v) => v.channel.handle === handle)
    : demoVideos.slice(0, 8).map((v) => ({ ...v, channel: channel! }));
}

export const demoComments: Comment[] = [
  {
    id: 'c1',
    content: 'This is absolutely mind-blowing! The AI recommendations on this platform are next level.',
    author: { id: 'u1', name: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
    likes: 234,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    replies: [
      {
        id: 'c1-r1',
        content: 'Totally agree! Been using EYEBOX for a month now.',
        author: { id: 'u2', name: 'Sarah Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
        likes: 45,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: 'c2',
    content: 'Great explanation! Could you do a follow-up on transformer architectures?',
    author: { id: 'u3', name: 'Marcus Wright', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus' },
    likes: 89,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'c3',
    content: 'The production quality on this channel keeps getting better. Subscribed!',
    author: { id: 'u4', name: 'Elena Voss', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena' },
    likes: 156,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    replies: [
      {
        id: 'c3-r1',
        content: 'Same here! Premium is worth every penny.',
        author: { id: 'u5', name: 'James Park', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james' },
        likes: 23,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'c3-r2',
        content: 'The 4K HDR support is incredible on my TV.',
        author: { id: 'u6', name: 'Nina Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina' },
        likes: 12,
        createdAt: new Date(Date.now() - 21600000).toISOString(),
      },
    ],
  },
  {
    id: 'c4',
    content: 'Timestamp 12:34 — that demo was insane 🔥',
    author: { id: 'u7', name: 'Tyler Brooks', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tyler' },
    likes: 67,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const demoNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'upload',
    title: 'New video from Neural Vision',
    message: 'How AI is Reshaping Video Streaming in 2026',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: '/watch/vid-1',
  },
  {
    id: 'n2',
    type: 'live',
    title: 'Cyber Beats is live now',
    message: 'Epic Synthwave Mix — Live Session',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    link: '/live',
  },
  {
    id: 'n3',
    type: 'comment',
    title: 'New reply to your comment',
    message: 'Sarah Kim replied to your comment',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n4',
    type: 'subscribe',
    title: 'New subscriber',
    message: 'You gained 12 new subscribers today',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    link: '/studio',
  },
];

export const demoStudioStats: StudioStats = {
  views: 1_245_000,
  viewsChange: 12.5,
  subscribers: 24_500,
  subscribersChange: 3.2,
  watchTime: 89_400,
  watchTimeChange: 8.7,
  revenue: 4_280,
  revenueChange: 15.3,
};

export const demoAdminStats: AdminStats = {
  totalUsers: 1_250_000,
  totalVideos: 4_800_000,
  totalChannels: 320_000,
  pendingReports: 47,
  activeUsers: 89_000,
  revenue: 2_450_000,
};

export const demoSearchSuggestions = [
  'AI video streaming',
  'machine learning tutorial',
  'gaming highlights 2026',
  'synthwave mix',
  'react 19 tutorial',
  'quantum computing',
  'cyberpunk ambience',
  'neural networks',
];

export const demoUser = {
  id: 'demo-user',
  email: 'demo@eyebox.ai',
  name: 'Demo User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  role: 'creator' as const,
  isPremium: true,
  isVerified: true,
  createdAt: new Date().toISOString(),
};

export const demoAnalyticsData = [
  { label: 'Mon', views: 4200 },
  { label: 'Tue', views: 5800 },
  { label: 'Wed', views: 3900 },
  { label: 'Thu', views: 7200 },
  { label: 'Fri', views: 6100 },
  { label: 'Sat', views: 8900 },
  { label: 'Sun', views: 7600 },
];

export const demoStudioContent = demoVideos.slice(0, 8).map((v, i) => ({
  ...v,
  status: i < 6 ? 'published' : i < 7 ? 'processing' : 'draft',
}));

export const demoAdminUsers = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@example.com', role: 'user', status: 'active', joined: '2025-06-15' },
  { id: 'u2', name: 'Sarah Kim', email: 'sarah@example.com', role: 'creator', status: 'active', joined: '2025-03-22' },
  { id: 'u3', name: 'Marcus Wright', email: 'marcus@example.com', role: 'user', status: 'suspended', joined: '2025-01-10' },
  { id: 'u4', name: 'Elena Voss', email: 'elena@example.com', role: 'creator', status: 'active', joined: '2024-11-05' },
  { id: 'u5', name: 'James Park', email: 'james@example.com', role: 'admin', status: 'active', joined: '2024-08-01' },
];

export const demoReports = [
  { id: 'r1', type: 'spam', target: 'vid-15', reporter: 'user123', status: 'pending', createdAt: '2026-07-28' },
  { id: 'r2', type: 'copyright', target: 'vid-8', reporter: 'creator456', status: 'pending', createdAt: '2026-07-29' },
  { id: 'r3', type: 'harassment', target: 'comment-c4', reporter: 'user789', status: 'reviewed', createdAt: '2026-07-27' },
];
