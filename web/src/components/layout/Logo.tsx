import Link from "next/link";
import { cn } from "@/lib/format";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 group", className)} aria-label="EyeBox home">
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_24px_rgba(225,29,72,0.35)] transition-transform duration-200 group-hover:scale-105">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 7.5v9l8.5-4.5L8 7.5Z"
            fill="currentColor"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-[#0c0d10]" />
      </span>
      {!compact && (
        <span className="font-[family-name:var(--font-outfit)] text-[1.35rem] font-semibold tracking-tight leading-none">
          Eye<span className="text-accent">Box</span>
        </span>
      )}
    </Link>
  );
}
