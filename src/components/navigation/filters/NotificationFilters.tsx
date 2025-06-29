
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const unreadCount = status === 'unread' ? filteredCount : totalCount - filteredCount;

  return (
    <div className="border-b px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        {/* Compact Filter Controls */}
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="session">Session</SelectItem>
              <SelectItem value="mentorship">Mentor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Simple Count Display */}
        <div className="text-xs text-muted-foreground">
          {status === 'unread' ? `${filteredCount} unread` : 
           status === 'read' ? `${filteredCount} read` :
           unreadCount > 0 ? `${unreadCount} unread` : `${filteredCount} total`}
        </div>
      </div>
    </div>
  );
}
