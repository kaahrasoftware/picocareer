
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function EventDashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">0</div>
          <div className="text-muted-foreground text-sm">Upcoming Events</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">0</div>
          <div className="text-muted-foreground text-sm">Past Events</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">0</div>
          <div className="text-muted-foreground text-sm">Total Registrations</div>
        </CardContent>
      </Card>
    </div>
  );
}
