
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, CalendarX, AlertTriangle } from "lucide-react";

interface SessionMetricCardsProps {
  stats: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
    noShow: number;
  };
}

export function SessionMetricCards({ stats }: SessionMetricCardsProps) {
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  
  const cancellationRate = stats.total > 0 
    ? Math.round((stats.cancelled / stats.total) * 100)
    : 0;

  const noShowRate = stats.total > 0
    ? Math.round((stats.noShow / stats.total) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Sessions
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All scheduled sessions
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-green-100 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-blue-100 bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Scheduled
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.scheduled}</div>
          <p className="text-xs text-muted-foreground">
            Upcoming sessions
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-red-100 bg-red-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cancelled
          </CardTitle>
          <CalendarX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.cancelled}</div>
          <p className="text-xs text-muted-foreground">
            {cancellationRate}% cancellation rate
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-amber-100 bg-amber-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            No-shows
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.noShow}</div>
          <p className="text-xs text-muted-foreground">
            {noShowRate}% no-show rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
