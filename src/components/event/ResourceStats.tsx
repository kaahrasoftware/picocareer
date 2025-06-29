
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Users, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';

interface ResourceStatsProps {
  resources: EventResource[];
}

export function ResourceStats({ resources }: ResourceStatsProps) {
  const totalResources = resources.length;
  const totalViews = resources.reduce((sum, r) => sum + (r.view_count || 0), 0);
  const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count || 0), 0);
  const downloadableCount = resources.filter(r => r.is_downloadable).length;
  
  const typeDistribution = resources.reduce((acc, resource) => {
    acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopularType = Object.entries(typeDistribution)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  const recentResources = resources.filter(r => {
    const createdDate = new Date(r.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  }).length;

  const stats = [
    {
      title: 'Total Resources',
      value: totalResources,
      icon: FileText,
      description: `${recentResources} added this week`
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      description: 'Across all resources'
    },
    {
      title: 'Total Downloads',
      value: totalDownloads.toLocaleString(),
      icon: Download,
      description: `${downloadableCount} downloadable`
    },
    {
      title: 'Popular Type',
      value: mostPopularType.charAt(0).toUpperCase() + mostPopularType.slice(1),
      icon: TrendingUp,
      description: `${typeDistribution[mostPopularType] || 0} resources`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
