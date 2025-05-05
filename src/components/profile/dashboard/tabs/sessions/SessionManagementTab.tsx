
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionsDataTable } from "./SessionsDataTable";
import { SessionMetricCards } from "./SessionMetricCards";
import { useAdminSessionsQuery } from "@/hooks/useAdminSessionsQuery";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle, CalendarX, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export function SessionManagementTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("scheduled_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const pageSize = 10;
  
  // Convert date range to ISO strings for the query
  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useAdminSessionsQuery({
    statusFilter,
    page: currentPage,
    pageSize,
    startDate,
    endDate,
    searchTerm: searchQuery,
    sortBy,
    sortDirection
  });
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, dateRange, sortBy, sortDirection]);
  
  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  }, [sortBy]);
  
  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Session data has been refreshed",
    });
  }, [refetch, toast]);
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);
  
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);
  
  const handleExport = useCallback(() => {
    // This would be implemented to export data to CSV
    toast({
      title: "Export Started",
      description: "Your data export is being prepared",
    });
  }, [toast]);
  
  // Calculate session stats with error handling
  const sessionStats = {
    total: data?.totalCount || 0,
    completed: data?.sessions?.filter(s => s.status === "completed")?.length || 0, 
    scheduled: data?.sessions?.filter(s => s.status === "scheduled")?.length || 0,
    cancelled: data?.sessions?.filter(s => s.status === "cancelled")?.length || 0,
    noShow: data?.sessions?.filter(s => s.status === "no-show")?.length || 0
  };
  
  // Handle error states
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load session data. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Session Management</h2>
        <Badge variant="outline" className="text-sm">
          {sessionStats.total} Total Sessions
        </Badge>
      </div>
      
      <SessionMetricCards stats={sessionStats} isLoading={isLoading} />
      
      <Tabs 
        defaultValue="all" 
        className="w-full"
        onValueChange={setStatusFilter}
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="flex gap-2 items-center">
            <Calendar className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4" />
            <span>Completed</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex gap-2 items-center">
            <CalendarX className="h-4 w-4" />
            <span>Cancelled</span>
          </TabsTrigger>
          <TabsTrigger value="no-show" className="flex gap-2 items-center">
            <AlertCircle className="h-4 w-4" />
            <span>No-shows</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <SessionsDataTable 
            sessions={data?.sessions || []} 
            isLoading={isLoading}
            totalPages={data?.totalPages || 1}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            dateRange={dateRange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </TabsContent>
        <TabsContent value="scheduled">
          <SessionsDataTable 
            sessions={data?.sessions?.filter(s => s.status === "scheduled") || []} 
            isLoading={isLoading}
            totalPages={data?.totalPages || 1}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            dateRange={dateRange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </TabsContent>
        <TabsContent value="completed">
          <SessionsDataTable 
            sessions={data?.sessions?.filter(s => s.status === "completed") || []} 
            isLoading={isLoading}
            totalPages={data?.totalPages || 1}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            dateRange={dateRange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </TabsContent>
        <TabsContent value="cancelled">
          <SessionsDataTable 
            sessions={data?.sessions?.filter(s => s.status === "cancelled") || []} 
            isLoading={isLoading}
            totalPages={data?.totalPages || 1}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            dateRange={dateRange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </TabsContent>
        <TabsContent value="no-show">
          <SessionsDataTable 
            sessions={data?.sessions?.filter(s => s.status === "no-show") || []} 
            isLoading={isLoading}
            totalPages={data?.totalPages || 1}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            dateRange={dateRange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
