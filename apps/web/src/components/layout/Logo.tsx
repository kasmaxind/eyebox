import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  href?: string | null;
}

const sizeClasses = {
  sm: { eyebox: 'text-sm', tube: 'text-[10px]' },
  md: { eyebox: 'text-lg', tube: 'text-xs' },
  lg: { eyebox: 'text-2xl', tube: 'text-sm' },
  hero: { eyebox: 'text-5xl sm:text-7xl md:text-8xl', tube: 'text-lg sm:text-2xl md:text-3xl' },
};

export default function Logo({ size = 'md', className, href = '/' as string | null }: LogoProps) {
  const sizes = sizeClasses[size];

  const content = (
    <div className={cn('flex flex-col leading-none', className)}>
      <span className={cn('font-orbitron font-bold tracking-wider text-white', sizes.eyebox)}>
        EYEBOX
      </span>
      <span className={cn('font-orbitron font-medium tracking-[0.3em] text-cyan', sizes.tube)}>
        TUBE.AI
      </span>
    </div>
  );

  if (href !== null) {
    return (
      <Link href={href} className="group">
        {content}
      </Link>
    );
  }

  return content;
}
