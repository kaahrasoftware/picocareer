
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: number | string;
  valueIsText?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  valueClassName?: string;
}

export function StatsCard({
  title,
  value,
  valueIsText = false,
  subtitle,
  icon,
  loading = false,
  valueClassName = 'text-primary'
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <span className="text-muted-foreground">{icon}</span>
          )}
        </div>
        
        {loading ? (
          <>
            <Skeleton className="h-9 w-20 mb-1" />
            {subtitle && <Skeleton className="h-4 w-24" />}
          </>
        ) : (
          <>
            <div className={`text-2xl font-bold ${valueClassName}`}>
              {valueIsText ? value : typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
