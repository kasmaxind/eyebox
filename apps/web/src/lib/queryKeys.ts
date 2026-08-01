export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  feed: {
    home: ['feed', 'home'] as const,
    trending: ['feed', 'trending'] as const,
    recommended: (page: number) => ['feed', 'recommended', page] as const,
    category: (category: string) => ['feed', 'category', category] as const,
    continueWatching: ['feed', 'continue-watching'] as const,
    shorts: ['feed', 'shorts'] as const,
    live: ['feed', 'live'] as const,
    creators: ['feed', 'creators'] as const,
  },
  video: {
    detail: (id: string) => ['video', id] as const,
    comments: (id: string) => ['video', id, 'comments'] as const,
    related: (id: string) => ['video', id, 'related'] as const,
  },
  search: {
    results: (query: string, filters: string) => ['search', query, filters] as const,
    suggestions: (query: string) => ['search', 'suggestions', query] as const,
  },
  channel: {
    detail: (handle: string) => ['channel', handle] as const,
    videos: (handle: string) => ['channel', handle, 'videos'] as const,
  },
  library: {
    history: ['library', 'history'] as const,
    watchLater: ['library', 'watch-later'] as const,
    liked: ['library', 'liked'] as const,
    downloads: ['library', 'downloads'] as const,
    subscriptions: ['library', 'subscriptions'] as const,
  },
  notifications: ['notifications'] as const,
  studio: {
    stats: ['studio', 'stats'] as const,
    content: ['studio', 'content'] as const,
    comments: ['studio', 'comments'] as const,
    analytics: ['studio', 'analytics'] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    users: ['admin', 'users'] as const,
    videos: ['admin', 'videos'] as const,
    channels: ['admin', 'channels'] as const,
    reports: ['admin', 'reports'] as const,
  },
} as const;
