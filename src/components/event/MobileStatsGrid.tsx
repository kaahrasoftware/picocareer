
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  Download, 
  Users,
  Archive,
  TrendingUp
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';

interface MobileStatsGridProps {
  resources: (EventResource & { events?: any })[];
  filteredCount: number;
}

export function MobileStatsGrid({ resources, filteredCount }: MobileStatsGridProps) {
  const downloadableCount = resources.filter(r => r.is_downloadable).length;
  const totalViews = resources.reduce((sum, r) => sum + (r.view_count || 0), 0);
  const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count || 0), 0);

  const stats = [
    {
      label: 'Total Resources',
      value: resources.length,
      icon: <Archive className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      badge: filteredCount !== resources.length ? `${filteredCount} shown` : null
    },
    {
      label: 'Downloadable',
      value: downloadableCount,
      icon: <Download className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      badge: resources.length > 0 ? `${Math.round((downloadableCount / resources.length) * 100)}%` : null
    },
    {
      label: 'Total Views',
      value: totalViews,
      icon: <Eye className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      badge: null
    },
    {
      label: 'Downloads',
      value: totalDownloads,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      badge: null
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </p>
                {stat.badge && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {stat.badge}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
