export type UserRole = 'user' | 'creator' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isPremium: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface Channel {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  banner?: string;
  description?: string;
  subscriberCount: number;
  videoCount: number;
  isVerified: boolean;
  isSubscribed?: boolean;
}

export type VideoCategory =
  | 'music'
  | 'gaming'
  | 'movies'
  | 'education'
  | 'sports'
  | 'news'
  | 'entertainment'
  | 'tech'
  | 'lifestyle';

export type VideoVisibility = 'public' | 'unlisted' | 'private';

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  publishedAt: string;
  category: VideoCategory;
  channel: Channel;
  tags?: string[];
  isLive?: boolean;
  isShort?: boolean;
  progress?: number;
  videoUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Playlist {
  id: string;
  title: string;
  thumbnail: string;
  videoCount: number;
  channel: Channel;
}

export interface Notification {
  id: string;
  type: 'upload' | 'comment' | 'like' | 'subscribe' | 'live' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface StudioStats {
  views: number;
  viewsChange: number;
  subscribers: number;
  subscribersChange: number;
  watchTime: number;
  watchTimeChange: number;
  revenue: number;
  revenueChange: number;
}

export interface AdminStats {
  totalUsers: number;
  totalVideos: number;
  totalChannels: number;
  pendingReports: number;
  activeUsers: number;
  revenue: number;
}

export interface UploadMetadata {
  title: string;
  description: string;
  tags: string[];
  category: VideoCategory;
  visibility: VideoVisibility;
  scheduledAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchFilters {
  category?: VideoCategory;
  duration?: 'short' | 'medium' | 'long';
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
  sortBy?: 'relevance' | 'date' | 'views' | 'rating';
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
