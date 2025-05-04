
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EventSummaryTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Event Summary</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Event Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Event analytics and summary statistics will be displayed here.</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              Chart: Event types distribution
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Registrations Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              Chart: Registration timeline
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            No event data available
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
