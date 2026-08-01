export type UserRole = 'guest' | 'user' | 'creator' | 'moderator' | 'admin';

export type VideoVisibility = 'public' | 'unlisted' | 'private' | 'scheduled';
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'live';

export type LikeTargetType = 'video' | 'comment';
export type LikeValue = 'like' | 'dislike';

export type ReportTargetType = 'video' | 'comment' | 'channel' | 'user';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export type NotificationType =
  | 'new_video'
  | 'comment'
  | 'like'
  | 'subscription'
  | 'live'
  | 'system'
  | 'premium'
  | 'moderation';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  nextCursor?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  error?: string;
}

export interface CursorQuery {
  cursor?: string;
  limit?: number;
}

export interface VideoFileQuality {
  quality: number;
  url: string;
  bitrate?: number;
  width?: number;
  height?: number;
  codec?: string;
}

export interface ThumbnailItem {
  url: string;
  isAuto: boolean;
  isSelected: boolean;
}

export interface AiChapter {
  title: string;
  start: number;
  end: number;
}

export interface CaptionItem {
  lang: string;
  url: string;
  isAuto: boolean;
}

export interface UploadSession {
  sessionId: string;
  userId: string;
  channelId: string;
  filename: string;
  totalChunks: number;
  receivedChunks: number;
  totalSize: number;
  status: 'pending' | 'uploading' | 'complete' | 'processing' | 'failed';
  videoId?: string;
  createdAt: string;
}
