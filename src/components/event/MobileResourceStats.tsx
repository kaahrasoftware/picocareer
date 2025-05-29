
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Eye, 
  Download, 
  Users 
} from 'lucide-react';

interface MobileResourceStatsProps {
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  uniqueViewers: number;
}

export function MobileResourceStats({ 
  totalResources, 
  totalViews, 
  totalDownloads, 
  uniqueViewers 
}: MobileResourceStatsProps) {
  const stats = [
    {
      label: 'Resources',
      value: totalResources,
      icon: <FileText className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      label: 'Views',
      value: totalViews,
      icon: <Eye className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      label: 'Downloads',
      value: totalDownloads,
      icon: <Download className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      label: 'Viewers',
      value: uniqueViewers,
      icon: <Users className="h-5 w-5" />,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} flex-shrink-0`}>
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
