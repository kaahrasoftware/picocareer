
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Star, Users, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangeFilter } from "@/components/admin/filters/DateRangeFilter";
import { MentorPerformanceData } from "./types";

const STATUS_COLORS = {
  high: "text-green-500",
  medium: "text-yellow-500",
  low: "text-red-500"
};

interface MentorRankingsTabProps {
  mentorData: MentorPerformanceData[];
  isLoading: boolean;
  timeRange: string;
  sortMetric: string;
  onTimeRangeChange: (value: string) => void;
  onSortMetricChange: (value: string) => void;
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
}

export function MentorRankingsTab({
  mentorData,
  isLoading,
  timeRange,
  sortMetric,
  onTimeRangeChange,
  onSortMetricChange,
  onDateRangeChange
}: MentorRankingsTabProps) {
  const columns = [
    {
      accessorKey: "full_name",
      header: "Mentor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <img 
              src={row.original.avatar_url || "https://via.placeholder.com/40"} 
              alt={row.original.full_name || ""}
            />
          </Avatar>
          <div>
            <div className="font-medium">{row.original.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_sessions",
      header: "Sessions",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.total_sessions}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.completed_sessions} completed
          </div>
        </div>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: "Completion Rate",
      cell: ({ row }) => {
        const rate = row.original.completion_rate;
        let statusColor = STATUS_COLORS.medium;
        if (rate >= 85) statusColor = STATUS_COLORS.high;
        if (rate < 70) statusColor = STATUS_COLORS.low;
        
        return (
          <div className={`font-medium ${statusColor}`}>
            {rate}%
          </div>
        );
      },
    },
    {
      accessorKey: "average_rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.original.average_rating;
        let statusColor = STATUS_COLORS.medium;
        if (rating >= 4.5) statusColor = STATUS_COLORS.high;
        if (rating < 3.5) statusColor = STATUS_COLORS.low;
        
        return (
          <div className="flex items-center">
            <Star className={`h-4 w-4 mr-1 ${statusColor}`} />
            <span className={`font-medium ${statusColor}`}>{rating}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_mentees",
      header: "Mentees",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.total_mentees}</div>
      ),
    },
    {
      accessorKey: "total_hours",
      header: "Hours",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.total_hours}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => {
        try {
          return new Date(row.original.created_at).toLocaleDateString();
        } catch (err) {
          return "Invalid date";
        }
      },
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mentor Rankings</h2>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortMetric} onValueChange={onSortMetricChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sessions">Total Sessions</SelectItem>
              <SelectItem value="rating">Average Rating</SelectItem>
              <SelectItem value="hours">Total Hours</SelectItem>
            </SelectContent>
          </Select>

          <DateRangeFilter onDateRangeChange={onDateRangeChange} />
        </div>
      </div>

      <div className="mt-4">
        {mentorData && mentorData.length > 0 ? (
          <DataTable columns={columns} data={mentorData} />
        ) : (
          <div className="text-center p-8 border rounded text-muted-foreground">
            No mentor data available for the selected filters
          </div>
        )}
      </div>
    </Card>
  );
}
