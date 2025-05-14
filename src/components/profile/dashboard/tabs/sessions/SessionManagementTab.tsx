
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  RefreshCcw, 
  Download, 
  Filter, 
  Search as SearchIcon,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SessionsDataTable } from './SessionsDataTable';
import { useAdminSessionsQuery } from '@/hooks/useAdminSessionsQuery';
import { SessionMetricCards } from './SessionMetricCards';
import { SessionFeedbackDisplay } from './SessionFeedbackDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/integrations/supabase/client';

export function SessionManagementTab() {
  // State for filters and pagination
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("scheduled_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for session details dialog
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // State for the sync operation
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Get session for authentication
  const { session } = useAuthSession();

  // Toast notification
  const { toast } = useToast();
  
  // Fetch sessions data
  const { 
    data: sessionsData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching
  } = useAdminSessionsQuery({
    statusFilter,
    page,
    pageSize,
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    searchTerm: debouncedSearchTerm,
    sortBy,
    sortDirection
  });

  // Get session statistics from the API response
  const sessionStats = React.useMemo(() => {
    if (!sessionsData?.statusCounts) {
      return {
        total: 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
        noShow: 0
      };
    }

    // Use the status counts directly from the API
    const { total, completed, scheduled, cancelled, no_show } = sessionsData.statusCounts;

    return {
      total,
      completed,
      scheduled,
      cancelled,
      noShow: no_show
    };
  }, [sessionsData]);

  // Handlers
  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: "Data refreshed",
      description: "Session data has been refreshed.",
    });
  }, [refetch, toast]);

  const handleViewFeedback = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
  }, []);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your session data is being prepared for download.",
    });
    // Implement export functionality here
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filter changes
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1); // Reset to first page when date range changes
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search term changes
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for a new column
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // New function to run the one-time no-show sync
  const handleRunNoShowSync = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication required",
        description: "You must be logged in as an admin to perform this action.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('one-time-no-show-sync', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error syncing no-show sessions:", error);
        toast({
          title: "Sync failed",
          description: error.message || "An error occurred while syncing no-show sessions.",
          variant: "destructive",
        });
        return;
      }

      console.log("Sync result:", data);
      toast({
        title: "Sync completed",
        description: `Updated ${data.message}`,
      });

      // Refresh the data to show updated statuses
      refetch();

    } catch (err: any) {
      console.error("Error in sync function:", err);
      toast({
        title: "Sync error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Session Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(dateRange || statusFilter !== "all") && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          {/* New sync button for admin users */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunNoShowSync}
            disabled={isSyncing}
          >
            <UserCheck className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Syncing..." : "Sync No-Shows"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-2">
        <div className="flex items-center gap-2 p-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by mentor or mentee name..."
            className="h-9 w-[250px] lg:w-[300px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <SessionMetricCards stats={sessionStats} isLoading={isLoading} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Sessions List</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={handleFilterChange}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="no_show">No-shows</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-0">
              <SessionsDataTable 
                sessions={sessionsData?.sessions || []} 
                isLoading={isLoading}
                isError={isError}
                error={error as Error}
                page={page}
                setPage={setPage}
                totalPages={sessionsData?.totalPages || 1}
                pageSize={pageSize}
                setPageSize={setPageSize}
                onViewFeedback={handleViewFeedback}
                onSort={handleSort}
                currentSortColumn={sortBy}
                currentSortDirection={sortDirection}
                onRefresh={handleRefresh}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Session Feedback Dialog */}
      <Dialog open={!!selectedSessionId} onOpenChange={(open) => !open && setSelectedSessionId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
          </DialogHeader>
          {selectedSessionId && (
            <SessionFeedbackDisplay sessionId={selectedSessionId} />
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Sessions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Date Range</h3>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={handleDateRangeChange}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
