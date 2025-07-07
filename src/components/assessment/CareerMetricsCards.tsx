
import React from 'react';
import { ColorfulStatCard } from '@/components/ui/colorful-stat-card';
import { DollarSign, Clock, TrendingUp } from 'lucide-react';
import type { CareerRecommendation } from '@/types/assessment';

interface CareerMetricsCardsProps {
  recommendation: CareerRecommendation;
}

export const CareerMetricsCards = ({ recommendation }: CareerMetricsCardsProps) => {
  const metrics = [];

  if (recommendation.salaryRange) {
    metrics.push({
      title: "Salary Range",
      value: recommendation.salaryRange,
      icon: <DollarSign className="h-5 w-5" />,
      variant: "green" as const,
      footer: "Expected compensation"
    });
  }

  if (recommendation.timeToEntry) {
    metrics.push({
      title: "Time to Entry",
      value: recommendation.timeToEntry,
      icon: <Clock className="h-5 w-5" />,
      variant: "blue" as const,
      footer: "Getting started timeline"
    });
  }

  if (recommendation.growthOutlook) {
    metrics.push({
      title: "Growth Outlook",
      value: "Positive",
      icon: <TrendingUp className="h-5 w-5" />,
      variant: "purple" as const,
      footer: recommendation.growthOutlook.slice(0, 50) + (recommendation.growthOutlook.length > 50 ? "..." : "")
    });
  }

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <ColorfulStatCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          variant={metric.variant}
          footer={metric.footer}
        />
      ))}
    </div>
  );
};
