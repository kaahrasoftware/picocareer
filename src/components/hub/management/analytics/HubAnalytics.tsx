
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { EngagementMetrics } from './EngagementMetrics';
import { HubRecommendations } from './HubRecommendations';
import { MemberGrowthChart, TimePeriod as ChartTimePeriod } from './MemberGrowthChart';
import { useHubAnalytics } from '@/hooks/useHubAnalytics';

interface HubAnalyticsProps {
  hubId: string;
}

export function HubAnalytics({ hubId }: HubAnalyticsProps) {
  const { 
    memberGrowth, 
    isRefreshing, 
    storageMetrics, 
    summary, 
    timePeriod,
    setTimePeriod,
    refreshMetrics,
    formatDate
  } = useHubAnalytics(hubId);

  // Convert between the two TimePeriod types
  const convertTimePeriod = (period: typeof timePeriod): ChartTimePeriod => {
    switch (period) {
      case 'week': return 'last_7_days';
      case 'month': return 'last_30_days';
      case 'quarter': return 'last_90_days';
      case 'year': return 'last_year';
      default: return 'month';
    }
  };

  const handleTimePeriodChange = (period: ChartTimePeriod) => {
    switch (period) {
      case 'last_7_days': setTimePeriod('week'); break;
      case 'last_30_days': setTimePeriod('month'); break;
      case 'last_90_days': setTimePeriod('quarter'); break;
      case 'last_year': setTimePeriod('year'); break;
      case 'month': setTimePeriod('month'); break;
      default: setTimePeriod('month');
    }
  };

  const handleFormatDate = (dateStr: string, period: ChartTimePeriod) => {
    // Convert chart period back to hook period for formatting
    let hookPeriod: typeof timePeriod;
    switch (period) {
      case 'last_7_days': hookPeriod = 'week'; break;
      case 'last_30_days': hookPeriod = 'month'; break;
      case 'last_90_days': hookPeriod = 'quarter'; break;
      case 'last_year': hookPeriod = 'year'; break;
      case 'month': hookPeriod = 'month'; break;
      default: hookPeriod = 'month';
    }
    return formatDate(dateStr, hookPeriod);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Hub Analytics</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>

      <AnalyticsSummaryCards summary={summary} />
      
      <Tabs defaultValue="growth" className="w-full">
        <TabsList>
          <TabsTrigger value="growth">Member Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <MemberGrowthChart 
            data={memberGrowth}
            timePeriod={convertTimePeriod(timePeriod)}
            onTimePeriodChange={handleTimePeriodChange}
            formatDate={handleFormatDate}
          />
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementMetrics hubId={hubId} />
        </TabsContent>

        <TabsContent value="recommendations">
          <HubRecommendations hubId={hubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
