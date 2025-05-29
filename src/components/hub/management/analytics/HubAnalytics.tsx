
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { EngagementMetrics } from './EngagementMetrics';
import { HubRecommendations } from './HubRecommendations';
import { MemberGrowthChart } from './MemberGrowthChart';
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
            memberGrowth={memberGrowth}
            timePeriod={timePeriod}
            onTimePeriodChange={setTimePeriod}
            formatDate={formatDate}
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
