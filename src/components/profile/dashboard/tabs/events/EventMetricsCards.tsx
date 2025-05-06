
import { StatsCard } from '@/components/profile/dashboard/StatsCard';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

export interface EventSummaryStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  rankedEvents: { id: string; title: string; registrationCount: number }[];
}

interface EventMetricsCardsProps {
  stats: EventSummaryStats | null;
  isLoading: boolean;
}

export function EventMetricsCards({ stats, isLoading }: EventMetricsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      <StatsCard
        title="Total Events"
        value={stats?.totalEvents || 0}
        icon={<Calendar className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-blue-600"
      />
      
      <StatsCard
        title="Upcoming Events"
        value={stats?.upcomingEvents || 0}
        subtitle="Events in the future"
        icon={<Clock className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-emerald-600"
      />
      
      <StatsCard
        title="Past Events"
        value={stats?.pastEvents || 0}
        subtitle="Completed events"
        icon={<CheckCircle className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-purple-600"
      />
      
      <StatsCard
        title="Total Registrations"
        value={stats?.totalRegistrations || 0}
        subtitle="All event registrations"
        icon={<Users className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-amber-600"
      />
    </div>
  );
}
