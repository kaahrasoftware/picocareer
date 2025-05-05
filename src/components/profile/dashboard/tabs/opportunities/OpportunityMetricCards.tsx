
import React from 'react';
import { StatsCard } from '@/components/profile/dashboard/StatsCard';
import { 
  Award,
  BookOpen, 
  Clock, 
  Eye, 
  FileCheck, 
  FileText,
  Star
} from 'lucide-react';

interface OpportunityMetricCardsProps {
  stats: {
    totalCount: number;
    activeCount: number;
    pendingCount: number;
    featuredCount: number;
    totalViews: number;
    totalApplications: number;
  };
  isLoading: boolean;
}

export function OpportunityMetricCards({ stats, isLoading }: OpportunityMetricCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      <StatsCard
        title="Total Opportunities"
        value={stats.totalCount}
        icon={<FileText className="h-4 w-4" />}
        loading={isLoading}
      />
      
      <StatsCard
        title="Active Opportunities"
        value={stats.activeCount}
        icon={<FileCheck className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-green-600"
      />
      
      <StatsCard
        title="Pending Review"
        value={stats.pendingCount}
        icon={<Clock className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-amber-600"
      />
      
      <StatsCard
        title="Featured"
        value={stats.featuredCount}
        icon={<Star className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-blue-600"
      />
      
      <StatsCard
        title="Total Views"
        value={stats.totalViews}
        icon={<Eye className="h-4 w-4" />}
        loading={isLoading}
      />
      
      <StatsCard
        title="Total Applications"
        value={stats.totalApplications}
        icon={<Award className="h-4 w-4" />}
        loading={isLoading}
        valueClassName="text-purple-600"
      />
    </div>
  );
}
