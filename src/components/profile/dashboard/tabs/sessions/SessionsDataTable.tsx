
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Download
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSessionDetailsDialog } from "./AdminSessionDetailsDialog";
import { StandardPagination } from "@/components/common/StandardPagination";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { MentorSession } from "@/types/database/session";

interface SessionsDataTableProps {
  sessions: MentorSession[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  onExport?: () => void;
  dateRange?: DateRange;
  searchQuery: string;
  sortBy: string; 
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function SessionsDataTable({ 
  sessions,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  onSearchChange,
  onDateRangeChange,
  onRefresh,
  onExport,
  dateRange,
  searchQuery,
  sortBy,
  sortDirection,
  onSort
}: SessionsDataTableProps) {
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "completed":
        return <Badge variant="success" className="flex gap-1 items-center">
          <CheckCircle className="h-3 w-3" /> Completed
        </Badge>;
      case "scheduled":
        return <Badge variant="outline" className="flex gap-1 items-center">
          Scheduled
        </Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="flex gap-1 items-center">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>;
      case "no-show":
        return <Badge variant="warning" className="flex gap-1 items-center">
          <AlertTriangle className="h-3 w-3" /> No-show
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSort = (column: string) => {
    onSort(column);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Calendar className="h-4 w-4 mr-2" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={onDateRangeChange}
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh}
            className="h-9 w-9"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {onExport && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onExport}
              className="h-9 w-9"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("scheduled_at")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Date/Time
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("mentor")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Mentor
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("mentee")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Mentee
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("type")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Session Type
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Duration</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {format(new Date(session.scheduled_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    {session.mentor.full_name}
                  </TableCell>
                  <TableCell>
                    {session.mentee.full_name}
                  </TableCell>
                  <TableCell>
                    {session.session_type.type}
                  </TableCell>
                  <TableCell>
                    {session.session_type.duration} min
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(session.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedSession(session)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <StandardPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
      
      {selectedSession && (
        <AdminSessionDetailsDialog 
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
