
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from '@/components/ui/circular-progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, CalendarX, CalendarClock, AlertCircle } from "lucide-react";

interface SessionStatsProps {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  noShow: number;
}

interface SessionMetricCardsProps {
  stats: SessionStatsProps;
  isLoading: boolean;
}

export function SessionMetricCards({ stats, isLoading }: SessionMetricCardsProps) {
  const calculatePercentage = (value: number): number => {
    if (stats.total === 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Total Sessions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Sessions
          </CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <div className="text-2xl font-bold">{stats.total}</div>
          )}
        </CardContent>
      </Card>

      {/* Completed Sessions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? `${calculatePercentage(stats.completed)}% of total` : "No sessions yet"}
                  </p>
                </div>
                <CircularProgress 
                  value={calculatePercentage(stats.completed)} 
                  size={60} 
                  strokeWidth={6} 
                  className="text-green-500" 
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Sessions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold">{stats.scheduled}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? `${calculatePercentage(stats.scheduled)}% of total` : "No sessions yet"}
                  </p>
                </div>
                <CircularProgress 
                  value={calculatePercentage(stats.scheduled)} 
                  size={60} 
                  strokeWidth={6} 
                  className="text-blue-500" 
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancelled and No-Shows Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cancellations & No-shows
          </CardTitle>
          <div className="flex space-x-1">
            <CalendarX className="h-4 w-4 text-red-500" />
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold">{stats.cancelled + stats.noShow}</div>
                  <div className="flex text-xs text-muted-foreground gap-2">
                    <span>{stats.cancelled} cancelled</span>
                    <span>·</span>
                    <span>{stats.noShow} no-shows</span>
                  </div>
                </div>
                <CircularProgress 
                  value={calculatePercentage(stats.cancelled + stats.noShow)} 
                  size={60} 
                  strokeWidth={6} 
                  className="text-red-500" 
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
