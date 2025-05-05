
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { EventMetricsCards } from './EventMetricsCards';
import { EventTypeDistributionChart } from './EventTypeDistributionChart';
import { RegistrationTimelineChart } from './RegistrationTimelineChart';
import { EventRankingTable } from './EventRankingTable';
import { AttendeeDemographicsCharts } from './AttendeeDemographicsCharts';
import { TimePeriodSelect } from './TimePeriodSelect';
import { useEventSummaryStats } from './useEventSummaryStats';

export function EventSummaryTab() {
  const {
    stats,
    isLoading,
    error,
    timePeriod,
    setTimePeriod,
    refreshStats
  } = useEventSummaryStats();

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Event Summary</h2>
        <div className="flex items-center gap-3">
          <TimePeriodSelect value={timePeriod} onChange={setTimePeriod} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStats} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Stats'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <EventMetricsCards 
        stats={stats} 
        isLoading={isLoading} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Event Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <EventTypeDistributionChart 
              data={stats?.eventTypeDistribution || []} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Registration Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <RegistrationTimelineChart 
              data={stats?.registrationTimeline || []} 
              isLoading={isLoading}
              timePeriod={timePeriod}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Top Events</CardTitle>
          </CardHeader>
          <CardContent>
            <EventRankingTable 
              events={stats?.popularEvents || []} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Attendee Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendeeDemographicsCharts 
              geographicData={stats?.geographicDistribution || []}
              academicData={stats?.academicFieldDistribution || []}
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
