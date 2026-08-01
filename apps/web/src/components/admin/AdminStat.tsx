import { cn, formatNumber } from '@/lib/utils';

interface AdminStatProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  alert?: boolean;
}

export default function AdminStat({ label, value, icon, alert }: AdminStatProps) {
  return (
    <div className={cn(
      'p-5 rounded-2xl bg-glass border backdrop-blur-sm',
      alert ? 'border-red-500/30' : 'border-glass-border'
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/50">{label}</span>
        {icon}
      </div>
      <p className={cn('text-2xl font-bold', alert ? 'text-red-400' : 'text-white')}>
        {formatNumber(value)}
      </p>
    </div>
  );
}
