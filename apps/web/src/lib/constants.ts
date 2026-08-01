export const APP_NAME = 'EYEBOX TUBE.AI';
export const APP_TAGLINE = 'Stream the Future.';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const CATEGORIES = [
  { id: 'music', label: 'Music', icon: 'Music' },
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2' },
  { id: 'movies', label: 'Movies', icon: 'Film' },
  { id: 'education', label: 'Education', icon: 'GraduationCap' },
  { id: 'sports', label: 'Sports', icon: 'Trophy' },
  { id: 'news', label: 'News', icon: 'Newspaper' },
] as const;

export const SIDEBAR_NAV = [
  { href: '/home', label: 'Home', icon: 'Home' },
  { href: '/shorts', label: 'Shorts', icon: 'Zap' },
  { href: '/subscriptions', label: 'Subscriptions', icon: 'Users' },
  { href: '/trending', label: 'Trending', icon: 'TrendingUp' },
  { href: '/live', label: 'Live', icon: 'Radio' },
] as const;

export const LIBRARY_NAV = [
  { href: '/history', label: 'History', icon: 'History' },
  { href: '/watch-later', label: 'Watch Later', icon: 'Clock' },
  { href: '/liked', label: 'Liked Videos', icon: 'ThumbsUp' },
  { href: '/downloads', label: 'Downloads', icon: 'Download' },
  { href: '/library', label: 'Library', icon: 'Library' },
] as const;

export const STUDIO_NAV = [
  { href: '/studio', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/studio/content', label: 'Content', icon: 'Video' },
  { href: '/studio/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/studio/comments', label: 'Comments', icon: 'MessageSquare' },
  { href: '/studio/monetization', label: 'Monetization', icon: 'DollarSign' },
  { href: '/studio/customization', label: 'Customization', icon: 'Palette' },
  { href: '/studio/live', label: 'Go Live', icon: 'Radio' },
] as const;

export const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: 'Shield' },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/videos', label: 'Videos', icon: 'Video' },
  { href: '/admin/channels', label: 'Channels', icon: 'Tv' },
  { href: '/admin/reports', label: 'Reports', icon: 'Flag' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/admin/ads', label: 'Ads', icon: 'Megaphone' },
  { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const PREMIUM_FEATURES = [
  'Ad-free streaming across all devices',
  'AI-powered recommendations tuned to your taste',
  'Background play & offline downloads',
  '4K HDR quality with spatial audio',
  'Early access to creator premieres',
  'Priority live chat & exclusive badges',
] as const;

export const KEYBOARD_SHORTCUTS = [
  { key: 'K / Space', action: 'Play / Pause' },
  { key: 'J / L', action: 'Seek -10s / +10s' },
  { key: 'M', action: 'Mute / Unmute' },
  { key: 'F', action: 'Fullscreen' },
  { key: 'C', action: 'Captions' },
  { key: '< / >', action: 'Playback speed' },
] as const;
