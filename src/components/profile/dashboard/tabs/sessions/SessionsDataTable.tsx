
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { MentorSession } from "@/types/database/session";
import { AdminSessionActions } from "./AdminSessionActions";

interface SessionsDataTableProps {
  sessions: MentorSession[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  onViewFeedback: (sessionId: string) => void;
  onSort?: (columnName: string) => void;
  currentSortColumn?: string;
  currentSortDirection?: 'asc' | 'desc';
  onRefresh: () => void;
}

export function SessionsDataTable({
  sessions,
  isLoading,
  isError,
  error,
  page,
  setPage,
  totalPages,
  pageSize,
  setPageSize,
  onViewFeedback,
  onSort,
  currentSortColumn,
  currentSortDirection,
  onRefresh
}: SessionsDataTableProps) {
  // Status badge color mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">No-show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 font-medium">Error loading sessions</p>
        <p className="text-sm text-muted-foreground mt-1">{error?.message || "Please try again later"}</p>
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No sessions found</p>
      </div>
    );
  }

  // Sort indicator component
  const SortIndicator = ({ column }: { column: string }) => {
    if (column !== currentSortColumn) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return (
      <span className="ml-2">
        {currentSortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Render data table
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort && onSort("scheduled_at")}
              >
                Date 
                <SortIndicator column="scheduled_at" />
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Mentee</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSort && onSort("status")}
              >
                Status
                <SortIndicator column="status" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  {format(parseISO(session.scheduled_at), 'MMM d, yyyy')}
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(session.scheduled_at), 'h:mm a')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{session.session_type.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {session.session_type.duration} min
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.mentor.avatar_url || undefined} />
                      <AvatarFallback>
                        {session.mentor.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {session.mentor.full_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.mentee.avatar_url || undefined} />
                      <AvatarFallback>
                        {session.mentee.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {session.mentee.full_name}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <AdminSessionActions 
                      session={session} 
                      onRefresh={onRefresh}
                      onViewFeedback={onViewFeedback}
                    />
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
