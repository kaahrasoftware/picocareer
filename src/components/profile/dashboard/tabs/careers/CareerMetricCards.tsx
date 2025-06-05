
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, Star, Building, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CareerStats {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  featuredCount: number;
  completedCount: number;
  industryBreakdown: Array<{ name: string; count: number }>;
}

interface CareerMetricCardsProps {
  stats: CareerStats;
  isLoading: boolean;
}

export function CareerMetricCards({ stats, isLoading }: CareerMetricCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-3 w-[80px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Careers",
      value: stats.totalCount,
      icon: Users,
      description: "All careers in system",
      color: "text-blue-600"
    },
    {
      title: "Approved",
      value: stats.approvedCount,
      icon: CheckCircle,
      description: "Active careers",
      color: "text-green-600"
    },
    {
      title: "Pending Review",
      value: stats.pendingCount,
      icon: Clock,
      description: "Awaiting approval",
      color: "text-yellow-600"
    },
    {
      title: "Featured",
      value: stats.featuredCount,
      icon: Star,
      description: "Featured careers",
      color: "text-purple-600"
    },
    {
      title: "Complete Profiles",
      value: stats.completedCount,
      icon: TrendingUp,
      description: "Fully populated",
      color: "text-indigo-600"
    },
    {
      title: "Industries",
      value: stats.industryBreakdown.length,
      icon: Building,
      description: "Different sectors",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
