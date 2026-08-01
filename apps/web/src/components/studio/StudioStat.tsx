import { cn, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StudioStatProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export default function StudioStat({ label, value, change, icon }: StudioStatProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="p-5 rounded-2xl bg-glass border border-glass-border backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/50">{label}</span>
        {icon && <span className="text-cyan/60">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', isPositive ? 'text-green-400' : 'text-red-400')}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change)}% vs last 28 days
        </div>
      )}
    </div>
  );
}
