
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export type NotificationFilterCategory = 'all' | 'general' | 'session' | 'mentorship';
export type NotificationFilterStatus = 'all' | 'unread' | 'read';
export type NotificationFilterTime = 'all' | 'today' | 'week' | 'month';

interface NotificationFiltersProps {
  category: NotificationFilterCategory;
  status: NotificationFilterStatus;
  timeRange: NotificationFilterTime;
  onCategoryChange: (category: NotificationFilterCategory) => void;
  onStatusChange: (status: NotificationFilterStatus) => void;
  onTimeRangeChange: (timeRange: NotificationFilterTime) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export function NotificationFilters({
  category,
  status,
  timeRange,
  onCategoryChange,
  onStatusChange,
  onTimeRangeChange,
  onResetFilters,
  totalCount,
  filteredCount
}: NotificationFiltersProps) {
  const hasActiveFilters = category !== 'all' || status !== 'all' || timeRange !== 'all';

  return (
    <div className="border-b p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="session">Session</SelectItem>
            <SelectItem value="mentorship">Mentorship</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="px-3"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Showing {filteredCount} of {totalCount} notifications
          </span>
          {hasActiveFilters && (
            <div className="flex gap-1">
              {category !== 'all' && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {category}
                </Badge>
              )}
              {status !== 'all' && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {status}
                </Badge>
              )}
              {timeRange !== 'all' && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : timeRange}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
