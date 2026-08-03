export type Category =
  | "All"
  | "Music"
  | "Gaming"
  | "News"
  | "Live"
  | "Learning"
  | "Sports"
  | "Tech"
  | "Comedy"
  | "Podcasts"
  | "Film"
  | "Recently uploaded"
  | "Watched";

export interface Channel {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  banner: string;
  subscribers: number;
  verified: boolean;
  description: string;
  videoCount: number;
}

export interface Chapter {
  title: string;
  start: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  channelId: string;
  views: number;
  likes: number;
  publishedAt: string;
  duration: number;
  category: Exclude<Category, "All" | "Recently uploaded" | "Watched">;
  tags: string[];
  chapters?: Chapter[];
  isLive?: boolean;
  liveViewers?: number;
  isShort?: boolean;
  progress?: number;
}

export interface Comment {
  id: string;
  videoId: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
  updatedAt: string;
  visibility: "public" | "private" | "unlisted";
}

export interface NotificationItem {
  id: string;
  type: "upload" | "live" | "comment" | "mention" | "system";
  title: string;
  body: string;
  avatar: string;
  thumbnail?: string;
  createdAt: string;
  read: boolean;
  href: string;
}
