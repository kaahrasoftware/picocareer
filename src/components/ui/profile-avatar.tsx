
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ProfileAvatar({ 
  avatarUrl, 
  size = 'md', 
  editable = false, 
  className,
  children 
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn('relative', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={avatarUrl} alt="Profile" />
        <AvatarFallback>
          {children || 'U'}
        </AvatarFallback>
      </Avatar>
      {editable && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <span className="text-white text-xs">Edit</span>
        </div>
      )}
    </div>
  );
}
