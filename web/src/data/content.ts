import type { CaptionCue, Comment, CommunityPost, NotificationItem, Playlist } from "@/lib/types";

export const comments: Comment[] = [
  {
    id: "c1",
    videoId: "v1",
    author: "Maya Chen",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
    text: "The eval harness section alone is worth the watch. Finally a practical take.",
    likes: 2400,
    createdAt: "2026-07-28T16:00:00Z",
    replies: [
      {
        id: "c1r1",
        videoId: "v1",
        author: "Nebula Labs",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
        text: "Glad it landed — we open-sourced the harness in the description.",
        likes: 890,
        createdAt: "2026-07-28T17:10:00Z",
      },
    ],
  },
  {
    id: "c2",
    videoId: "v1",
    author: "Jordan Lee",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
    text: "Chapters make this so easy to revisit. Bookmarked the deploy checklist.",
    likes: 612,
    createdAt: "2026-07-29T09:20:00Z",
  },
  {
    id: "c3",
    videoId: "v1",
    author: "Priya Nair",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    text: "Would love a follow-up on multi-agent routing vs a single planner.",
    likes: 311,
    createdAt: "2026-07-30T11:05:00Z",
  },
  {
    id: "c4",
    videoId: "v2",
    author: "Sam Ortiz",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    text: "This mix is my default focus soundtrack now.",
    likes: 5200,
    createdAt: "2026-06-13T01:00:00Z",
  },
  {
    id: "c5",
    videoId: "v8",
    author: "Alex Kim",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop",
    text: "Firmware part saved me hours. Also love the sound test.",
    likes: 1800,
    createdAt: "2026-04-03T18:40:00Z",
  },
];

export const playlists: Playlist[] = [
  {
    id: "pl-focus",
    title: "Deep work focus",
    description: "Long mixes and calm explainers for concentrated sessions.",
    videoIds: ["v2", "v1", "v9", "v13"],
    updatedAt: "2026-08-01T10:00:00Z",
    visibility: "private",
  },
  {
    id: "pl-weekend",
    title: "Weekend watchlist",
    description: "Creators to catch up on this weekend.",
    videoIds: ["v4", "v8", "v10", "v11", "v14"],
    updatedAt: "2026-08-02T18:00:00Z",
    visibility: "public",
  },
  {
    id: "pl-learn",
    title: "Learn something",
    description: "Systems, craft, and training.",
    videoIds: ["v9", "v12", "v15", "v16"],
    updatedAt: "2026-07-28T12:00:00Z",
    visibility: "unlisted",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    type: "live",
    title: "Arena HQ is live",
    body: "World Finals Day 2 — Arena HQ LIVE",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop",
    createdAt: "2026-08-03T03:05:00Z",
    read: false,
    href: "/watch/v3",
  },
  {
    id: "n2",
    type: "upload",
    title: "Nebula Labs uploaded",
    body: "Building agents that actually ship — a practical walkthrough",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=320&h=180&fit=crop",
    createdAt: "2026-07-28T14:05:00Z",
    read: false,
    href: "/watch/v1",
  },
  {
    id: "n3",
    type: "comment",
    title: "New reply on your comment",
    body: "Nebula Labs replied to your comment",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
    createdAt: "2026-07-28T17:12:00Z",
    read: true,
    href: "/watch/v1",
  },
  {
    id: "n4",
    type: "upload",
    title: "Byte Side uploaded",
    body: "Framework showdown: what I'd pick in 2026",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=320&h=180&fit=crop",
    createdAt: "2026-01-20T12:10:00Z",
    read: true,
    href: "/watch/v16",
  },
  {
    id: "n5",
    type: "system",
    title: "EyeBox Studio tip",
    body: "Turn on chapters to boost watch time on long videos.",
    avatar: "/favicon.ico",
    createdAt: "2026-07-20T09:00:00Z",
    read: true,
    href: "/studio",
  },
];

export function getCommentsForVideo(videoId: string): Comment[] {
  return comments.filter((c) => c.videoId === videoId);
}

export function getPlaylist(id: string): Playlist | undefined {
  return playlists.find((p) => p.id === id);
}

export const communityPosts: CommunityPost[] = [
  {
    id: "cp1",
    channelId: "ch-nebula",
    text: "Shipping a new agent eval series next week. Drop questions you want covered 👇",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    likes: 4200,
    comments: 318,
    createdAt: "2026-08-01T14:00:00Z",
  },
  {
    id: "cp2",
    channelId: "ch-pulse",
    text: "New mix drops Friday. Tell us: deep focus or late-night drive?",
    likes: 8900,
    comments: 512,
    createdAt: "2026-07-30T18:20:00Z",
  },
  {
    id: "cp3",
    channelId: "ch-arena",
    text: "Finals day 2 starts in 2 hours. Predictions in the comments.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    likes: 15200,
    comments: 2100,
    createdAt: "2026-08-03T01:00:00Z",
  },
];

export function getCommunityPosts(channelId: string): CommunityPost[] {
  return communityPosts.filter((p) => p.channelId === channelId);
}

const captionBank: Record<string, CaptionCue[]> = {
  v1: [
    { start: 0, end: 4, text: "Welcome back — today we ship agents that actually work in production." },
    { start: 4, end: 9, text: "We'll cover planning, tools, evaluation, and a deploy checklist." },
    { start: 9, end: 15, text: "First: define success metrics before you write a single prompt." },
    { start: 15, end: 22, text: "Then wire an eval harness so every change is measurable." },
    { start: 22, end: 30, text: "Finally, ship behind a feature flag and watch latency and cost." },
  ],
  v2: [
    { start: 0, end: 5, text: "This mix is built for deep work — soft pads, steady pulse." },
    { start: 5, end: 12, text: "No sudden drops. Just a calm runway for focus." },
  ],
  default: [
    { start: 0, end: 4, text: "Thanks for watching EyeBox." },
    { start: 4, end: 10, text: "Chapters and captions help you jump to what matters." },
    { start: 10, end: 16, text: "Like, subscribe, and save to a playlist if this helped." },
  ],
};

export function getCaptionsForVideo(videoId: string): CaptionCue[] {
  return captionBank[videoId] ?? captionBank.default;
}
