
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  CalendarIcon,
  CheckCircle,
  Clock,
  XCircle,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { AdminSessionActions } from "./AdminSessionActions";
import { MentorSession } from "@/types/database/session";

interface SessionsDataTableProps {
  sessions: MentorSession[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  onViewFeedback: (sessionId: string) => void;
  onSort?: (column: string) => void;
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
  // Helper function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Completed
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Scheduled
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-300">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Cancelled
          </Badge>
        );
      case "no_show":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300">
            <UserX className="h-3.5 w-3.5 mr-1" />
            No-show
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Function to render sort icon
  const renderSortIcon = (column: string) => {
    if (!onSort) return null;
    
    if (column === currentSortColumn) {
      return currentSortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      );
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const renderSortableHeader = (label: string, column: string) => {
    if (!onSort) {
      return <span>{label}</span>;
    }

    return (
      <div className="flex items-center gap-1 cursor-pointer" onClick={() => onSort(column)}>
        {label}
        {renderSortIcon(column)}
      </div>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Mentee</TableHead>
              <TableHead>Session Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-md border p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
        <h3 className="font-semibold text-lg">Error Loading Sessions</h3>
        <p className="text-muted-foreground mb-4">{error?.message || "An error occurred while loading sessions."}</p>
        <Button onClick={onRefresh}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (!sessions.length) {
    return (
      <div className="rounded-md border p-6 flex flex-col items-center justify-center text-center">
        <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No Sessions Found</h3>
        <p className="text-muted-foreground">No mentoring sessions match your current filters.</p>
      </div>
    );
  }

  // Render data table
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{renderSortableHeader("Scheduled Time", "scheduled_at")}</TableHead>
            <TableHead>{renderSortableHeader("Mentor", "mentor.full_name")}</TableHead>
            <TableHead>{renderSortableHeader("Mentee", "mentee.full_name")}</TableHead>
            <TableHead>{renderSortableHeader("Session Type", "session_type.type")}</TableHead>
            <TableHead>{renderSortableHeader("Status", "status")}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{formatDate(session.scheduled_at)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Duration: {session.session_type?.duration || "60"} minutes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>{session.mentor?.full_name || "Unknown Mentor"}</TableCell>
              <TableCell>{session.mentee?.full_name || "Unknown Mentee"}</TableCell>
              <TableCell>{session.session_type?.type || "Standard"}</TableCell>
              <TableCell>{renderStatusBadge(session.status)}</TableCell>
              <TableCell className="text-right">
                <AdminSessionActions 
                  session={session} 
                  onRefresh={onRefresh}
                  onViewFeedback={onViewFeedback}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing <strong>{Math.min((page - 1) * pageSize + 1, sessions.length)}-{Math.min(page * pageSize, sessions.length)}</strong> of <strong>{sessions.length}</strong> sessions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
