import type { Channel } from "@/lib/types";

export const channels: Channel[] = [
  {
    id: "ch-nebula",
    handle: "nebulalabs",
    name: "Nebula Labs",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=400&fit=crop",
    subscribers: 2_480_000,
    verified: true,
    description: "Deep dives into AI, space systems, and the tools shaping tomorrow.",
    videoCount: 312,
  },
  {
    id: "ch-pulse",
    handle: "pulsebeats",
    name: "Pulse Beats",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&h=400&fit=crop",
    subscribers: 5_120_000,
    verified: true,
    description: "Weekly mixes, live sessions, and behind-the-scenes studio nights.",
    videoCount: 890,
  },
  {
    id: "ch-arena",
    handle: "arenahq",
    name: "Arena HQ",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=400&fit=crop",
    subscribers: 8_900_000,
    verified: true,
    description: "Pro gaming highlights, tournament coverage, and strategy breakdowns.",
    videoCount: 1402,
  },
  {
    id: "ch-lens",
    handle: "lenscraft",
    name: "Lens Craft",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84781?w=1600&h=400&fit=crop",
    subscribers: 1_050_000,
    verified: true,
    description: "Cinematic storytelling, camera craft, and color grading tutorials.",
    videoCount: 218,
  },
  {
    id: "ch-daily",
    handle: "dailysignal",
    name: "Daily Signal",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&h=400&fit=crop",
    subscribers: 3_340_000,
    verified: true,
    description: "Independent news briefings with context, not noise.",
    videoCount: 2104,
  },
  {
    id: "ch-orbit",
    handle: "orbitcook",
    name: "Orbit Cook",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&h=400&fit=crop",
    subscribers: 760_000,
    verified: false,
    description: "Fast recipes for busy creatives. 15 minutes or less.",
    videoCount: 156,
  },
  {
    id: "ch-circuit",
    handle: "circuitrun",
    name: "Circuit Run",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1517649763962-0c623066027c?w=1600&h=400&fit=crop",
    subscribers: 420_000,
    verified: true,
    description: "Endurance training, race recaps, and gear that actually lasts.",
    videoCount: 98,
  },
  {
    id: "ch-byte",
    handle: "byteside",
    name: "Byte Side",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=160&h=160&fit=crop",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=400&fit=crop",
    subscribers: 1_880_000,
    verified: true,
    description: "Hardware teardowns, shipping builds, and developer workflows.",
    videoCount: 445,
  },
];

export function getChannel(id: string): Channel | undefined {
  return channels.find((c) => c.id === id);
}

export function getChannelByHandle(handle: string): Channel | undefined {
  return channels.find((c) => c.handle === handle);
}
