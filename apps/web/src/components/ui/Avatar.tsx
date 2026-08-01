import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

const imageSize = { sm: 32, md: 40, lg: 48, xl: 80 };

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-void-200 flex items-center justify-center shrink-0',
        'ring-2 ring-glass-border',
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={imageSize[size]}
          height={imageSize[size]}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="font-semibold text-cyan">{getInitials(name)}</span>
      )}
    </div>
  );
}
