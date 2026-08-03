export interface User {
  id: string;
  email?: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string | null;
  banner?: string | null;
  role: string;
  e2ePublicKey?: string | null;
  hasE2E?: boolean;
  createdAt?: string;
}

export interface ChannelInfo {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  subscribers?: number;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  duration: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
  mimeType?: string;
  visibility: 'public' | 'unlisted' | 'private';
  isEncrypted: boolean;
  category: string;
  tags: string[];
  views: number;
  likesCount: number;
  commentsCount: number;
  status: string;
  createdAt: string;
  streamUrl?: string;
  channel?: ChannelInfo;
  liked?: boolean;
  subscribed?: boolean;
  encryptedContentKey?: string | null;
  encryptionIv?: string | null;
  wrappedKey?: string | null;
  related?: Video[];
}

export interface Comment {
  id: string;
  videoId: string;
  parentId?: string | null;
  body: string;
  likesCount: number;
  createdAt: string;
  author: ChannelInfo;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  visibility: string;
  videoCount?: number;
  videos?: Video[];
  owner?: ChannelInfo;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
  error?: string;
}
