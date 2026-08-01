import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'amber' | 'red' | 'green' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    cyan: 'bg-cyan/15 text-cyan border-cyan/30',
    amber: 'bg-amber/15 text-amber border-amber/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    green: 'bg-green-500/15 text-green-400 border-green-500/30',
    default: 'bg-glass text-white/70 border-glass-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
