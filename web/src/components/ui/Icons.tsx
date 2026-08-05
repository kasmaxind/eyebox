import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 22, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconMenu(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

export function IconShorts(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSubs(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16v11H4z" />
      <path d="M8 4h8M10 12h4" />
    </svg>
  );
}

export function IconLibrary(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 5h3v14H4zM9 5h3v14H9zM14 6l6 3.5L14 13V6Z" />
    </svg>
  );
}

export function IconHistory(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 12a8 8 0 1 0 2.3-5.7" />
      <path d="M4 5v4h4M12 8v5l3 2" />
    </svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

export function IconLike(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 11v9H4v-9h3Zm3 9h7.2a2 2 0 0 0 1.95-1.55l1.3-5.2A1.8 1.8 0 0 0 18.7 11H13V6.5A2.5 2.5 0 0 0 10.5 4L7 11v9Z" />
    </svg>
  );
}

export function IconDislike(p: IconProps) {
  return (
    <svg {...base(p)} className={`${p.className ?? ""} rotate-180`.trim()}>
      <path d="M7 11v9H4v-9h3Zm3 9h7.2a2 2 0 0 0 1.95-1.55l1.3-5.2A1.8 1.8 0 0 0 18.7 11H13V6.5A2.5 2.5 0 0 0 10.5 4L7 11v9Z" />
    </svg>
  );
}

export function IconShare(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 13.2 7.5 4.1M15.7 6.7l-7.5 4.1" />
    </svg>
  );
}

export function IconMore(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBell(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2H4.5L6 16Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconUpload(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 16V5M8 8l4-4 4 4" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function IconLive(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9" />
    </svg>
  );
}

export function IconTrending(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 17 10 11l4 4 6-8" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

export function IconPlay(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m8 6 12 6-12 6V6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPause(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconExpand(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
    </svg>
  );
}

export function IconVolume(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 10v4h3l4 4V6L7 10H4Z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconVerified(p: IconProps) {
  return (
    <svg {...base({ ...p, size: p.size ?? 14 })}>
      <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" />
      <path d="m8 12 2.5 2.5L16 9" stroke="#0c0d10" strokeWidth="2" />
    </svg>
  );
}

export function IconPlaylist(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h11M4 12h11M4 17h7" />
      <path d="M16 14.5 20 17l-4 2.5v-5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconStudio(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

export function IconMic(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
    </svg>
  );
}

export function IconSparkles(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconSettings(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.9 6.3l1.4 1.4M17.7 16.3l1.4 1.4M3 12h2M19 12h2M4.9 17.7l1.4-1.4M17.7 7.7l1.4-1.4" />
    </svg>
  );
}

export function IconTheater(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="7" width="18" height="10" rx="1.5" />
    </svg>
  );
}

export function IconPip(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMute(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 10v4h3l4 4V6L7 10H4Z" />
      <path d="m16 9 5 5M21 9l-5 5" />
    </svg>
  );
}

export function IconCaptions(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 12h3M12 12h5M7 15h5M14 15h3" />
    </svg>
  );
}

export function IconDownload(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4v10M8 10l4 4 4-4" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function IconClip(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 5h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M10 9h4M10 12h4M10 15h2" />
    </svg>
  );
}

export function IconSun(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M5 19l1.5-1.5" />
    </svg>
  );
}

export function IconMoon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20 14.5A7.5 7.5 0 1 1 9.5 4 6 6 0 0 0 20 14.5Z" />
    </svg>
  );
}

export function IconCommunity(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 7h14v9H9l-4 3V7Z" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconLogout(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M10 5H5v14h5M14 16l4-4-4-4M8 12h10" />
    </svg>
  );
}
