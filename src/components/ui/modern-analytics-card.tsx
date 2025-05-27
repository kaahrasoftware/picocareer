
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, HelpCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ModernAnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    period: string;
    isPositive?: boolean;
  };
  variant: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'pink' | 'indigo' | 'emerald';
  explanation: {
    description: string;
    importance: string;
    actionable?: string;
    benchmark?: {
      good: string;
      average: string;
      poor: string;
    };
  };
  loading?: boolean;
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
}

const variantStyles = {
  blue: {
    gradient: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trendPositive: 'text-blue-600',
    trendNegative: 'text-blue-500',
    progressBg: 'bg-blue-600'
  },
  green: {
    gradient: 'from-green-50 to-green-100',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-green-500',
    progressBg: 'bg-green-600'
  },
  purple: {
    gradient: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    trendPositive: 'text-purple-600',
    trendNegative: 'text-purple-500',
    progressBg: 'bg-purple-600'
  },
  orange: {
    gradient: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    trendPositive: 'text-orange-600',
    trendNegative: 'text-orange-500',
    progressBg: 'bg-orange-600'
  },
  cyan: {
    gradient: 'from-cyan-50 to-cyan-100',
    border: 'border-cyan-200',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    trendPositive: 'text-cyan-600',
    trendNegative: 'text-cyan-500',
    progressBg: 'bg-cyan-600'
  },
  pink: {
    gradient: 'from-pink-50 to-pink-100',
    border: 'border-pink-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    trendPositive: 'text-pink-600',
    trendNegative: 'text-pink-500',
    progressBg: 'bg-pink-600'
  },
  indigo: {
    gradient: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    trendPositive: 'text-indigo-600',
    trendNegative: 'text-indigo-500',
    progressBg: 'bg-indigo-600'
  },
  emerald: {
    gradient: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    trendPositive: 'text-emerald-600',
    trendNegative: 'text-emerald-500',
    progressBg: 'bg-emerald-600'
  }
};

export function ModernAnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant,
  explanation,
  loading = false,
  progress
}: ModernAnalyticsCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const styles = variantStyles[variant];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <ArrowUp className="h-3 w-3" />;
    if (trend.value < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.isPositive === undefined) {
      return trend.value > 0 ? styles.trendPositive : styles.trendNegative;
    }
    return trend.isPositive ? styles.trendPositive : styles.trendNegative;
  };

  if (loading) {
    return (
      <Card className={cn("hover:shadow-lg transition-all duration-300 animate-pulse", styles.border)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={cn(
        "hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden",
        `bg-gradient-to-br ${styles.gradient}`,
        styles.border
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              {title}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-white/50"
                    onClick={() => setShowExplanation(!showExplanation)}
                  >
                    <HelpCircle className="h-3 w-3 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium mb-1">{explanation.description}</p>
                  <p className="text-xs text-gray-300 mb-2">{explanation.importance}</p>
                  {explanation.actionable && (
                    <p className="text-xs text-blue-200">💡 {explanation.actionable}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            
            <div className={cn("p-2 rounded-full transition-transform group-hover:scale-110", styles.iconBg)}>
              <div className={styles.iconColor}>
                {icon}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {trend && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
                {getTrendIcon()}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs text-gray-600 mb-2">{subtitle}</p>
          )}
          
          {trend && (
            <p className="text-xs text-gray-500">
              vs. {trend.period}
            </p>
          )}

          {progress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{progress.label || 'Progress'}</span>
                <span>{progress.value}/{progress.max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn("h-2 rounded-full transition-all duration-500", styles.progressBg)}
                  style={{ width: `${Math.min((progress.value / progress.max) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {explanation.benchmark && (
            <div className="mt-3 grid grid-cols-3 gap-1 text-xs">
              <Badge variant="outline" className="text-center bg-red-50 text-red-700 border-red-200">
                Poor: {explanation.benchmark.poor}
              </Badge>
              <Badge variant="outline" className="text-center bg-yellow-50 text-yellow-700 border-yellow-200">
                Avg: {explanation.benchmark.average}
              </Badge>
              <Badge variant="outline" className="text-center bg-green-50 text-green-700 border-green-200">
                Good: {explanation.benchmark.good}
              </Badge>
            </div>
          )}
        </CardContent>

        {showExplanation && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-4 flex flex-col justify-center">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-700">{explanation.description}</p>
              <p className="text-xs text-gray-600">
                <strong>Why it matters:</strong> {explanation.importance}
              </p>
              {explanation.actionable && (
                <p className="text-xs text-blue-600">
                  <strong>Action:</strong> {explanation.actionable}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanation(false)}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}
