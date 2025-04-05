
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  textPosition?: 'left' | 'right' | 'bottom' | 'none';
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  textPosition = 'none',
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  if (textPosition === 'none') {
    return (
      <Loader2 
        className={cn('animate-spin text-primary', 
        sizeClasses[size], 
        className)} 
      />
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2',
      textPosition === 'bottom' && 'flex-col',
      textPosition === 'right' && 'flex-row',
      textPosition === 'left' && 'flex-row-reverse',
    )}>
      <Loader2 
        className={cn('animate-spin text-primary', 
        sizeClasses[size], 
        className)} 
      />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}
