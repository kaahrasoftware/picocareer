
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernContentCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'highlighted';
  className?: string;
}

export const ModernContentCard = ({ 
  title, 
  icon, 
  children, 
  variant = 'default',
  className 
}: ModernContentCardProps) => {
  const gradientClasses = {
    default: "bg-white border-gray-200",
    gradient: "bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50",
    highlighted: "bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/50"
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 group",
      gradientClasses[variant],
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
          {icon && (
            <div className="p-2 bg-white/80 rounded-lg shadow-sm">
              {icon}
            </div>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};
