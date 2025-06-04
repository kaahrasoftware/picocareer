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
  PlusCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { OpportunitiesDataTable } from './OpportunitiesDataTable';
import { useAdminOpportunitiesQuery } from '@/hooks/useAdminOpportunitiesQuery';
import { OpportunityMetricCards } from './OpportunityMetricCards';
import { OpportunityDetailsDialog } from './OpportunityDetailsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { OpportunityStatus } from '@/types/database/enums';
import { OpportunityWithAuthor } from '@/types/opportunity/types';

export function OpportunitiesManagementTab() {
  // State for filters and pagination
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | 'all'>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // State for opportunity details dialog
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithAuthor | null>(null);
  const [isOpportunityLoading, setIsOpportunityLoading] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Navigation
  const navigate = useNavigate();

  // Get session for authentication
  const { session } = useAuthSession();

  // Toast notification
  const { toast } = useToast();
  
  // Fetch opportunities data
  const { 
    data: opportunitiesData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching
  } = useAdminOpportunitiesQuery({
    statusFilter,
    typeFilter,
    page,
    pageSize,
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    searchTerm: debouncedSearchTerm,
    sortBy,
    sortDirection
  });

  // Load selected opportunity details when ID changes
  useEffect(() => {
    const loadOpportunityDetails = async () => {
      if (!selectedOpportunityId) {
        setSelectedOpportunity(null);
        return;
      }

      setIsOpportunityLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select(`
            *,
            profiles (
              id, 
              full_name, 
              avatar_url,
              email
            )
          `)
          .eq('id', selectedOpportunityId)
          .single();

        if (error) throw error;

        // Get analytics data
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('opportunity_analytics')
          .select('*')
          .eq('opportunity_id', selectedOpportunityId)
          .single();

        if (analyticsError && analyticsError.code !== 'PGRST116') {
          console.error('Error fetching analytics:', analyticsError);
        }

        // Combine opportunity with analytics data
        const opportunityWithAnalytics = {
          ...data,
          analytics: analyticsData || { 
            views_count: 0, 
            applications_count: 0, 
            bookmarks_count: 0 
          }
        };

        setSelectedOpportunity(opportunityWithAnalytics);
      } catch (err) {
        console.error('Error loading opportunity details:', err);
        toast({
          title: 'Error',
          description: 'Failed to load opportunity details',
          variant: 'destructive',
        });
      } finally {
        setIsOpportunityLoading(false);
      }
    };

    loadOpportunityDetails();
  }, [selectedOpportunityId, toast]);

  // Handlers
  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: "Data refreshed",
      description: "Opportunity data has been refreshed.",
    });
  }, [refetch, toast]);

  const handleViewDetails = useCallback((opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
  }, []);

  const handleCloseDetailsDialog = useCallback(() => {
    setSelectedOpportunityId(null);
  }, []);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your opportunity data is being prepared for download.",
    });
    // Implement export functionality here
  };

  const handleFilterChange = (status: OpportunityStatus | 'all') => {
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

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setPage(1); // Reset to first page when type filter changes
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

  // CRUD Operations
  const handleApproveOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: 'Active' })
        .eq('id', opportunityId);

      if (error) throw error;

      toast({
        title: 'Opportunity Approved',
        description: 'The opportunity has been approved successfully.',
      });
      
      // Close dialog and refresh data
      handleCloseDetailsDialog();
      refetch();
    } catch (err) {
      console.error('Error approving opportunity:', err);
      toast({
        title: 'Error',
        description: 'Failed to approve opportunity',
        variant: 'destructive',
      });
    }
  };

  const handleRejectOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: 'Rejected' })
        .eq('id', opportunityId);

      if (error) throw error;

      toast({
        title: 'Opportunity Rejected',
        description: 'The opportunity has been rejected.',
      });
      
      // Close dialog and refresh data
      handleCloseDetailsDialog();
      refetch();
    } catch (err) {
      console.error('Error rejecting opportunity:', err);
      toast({
        title: 'Error',
        description: 'Failed to reject opportunity',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeature = async (opportunityId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ featured: !currentFeatured })
        .eq('id', opportunityId);

      if (error) throw error;

      toast({
        title: currentFeatured ? 'Opportunity Unfeatured' : 'Opportunity Featured',
        description: currentFeatured 
          ? 'The opportunity has been removed from featured list.' 
          : 'The opportunity has been added to featured list.',
      });
      
      // Refresh data
      refetch();
      
      // If in details dialog, update the selected opportunity
      if (selectedOpportunityId === opportunityId) {
        setSelectedOpportunity(prev => prev ? {
          ...prev,
          featured: !currentFeatured
        } : null);
      }
    } catch (err) {
      console.error('Error toggling feature status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update feature status',
        variant: 'destructive',
      });
    }
  };

  const handleEditOpportunity = (opportunityId: string) => {
    // Navigate to edit page or open edit dialog
    navigate(`/opportunities/${opportunityId}?edit=true`);
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;

      toast({
        title: 'Opportunity Deleted',
        description: 'The opportunity has been permanently deleted.',
      });
      
      // Close dialog and refresh data
      handleCloseDetailsDialog();
      refetch();
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete opportunity',
        variant: 'destructive',
      });
    }
  };

  const handleAddNewOpportunity = () => {
    navigate('/opportunities/create');
  };

  // Calculate stats for metric cards
  const opportunityStats = {
    totalCount: opportunitiesData?.totalCount || 0,
    activeCount: opportunitiesData?.activeCount || 0,
    pendingCount: opportunitiesData?.pendingCount || 0,
    featuredCount: opportunitiesData?.featuredCount || 0,
    totalViews: opportunitiesData?.totalViews || 0,
    totalApplications: opportunitiesData?.totalApplications || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Opportunities Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(dateRange || statusFilter !== "all" || typeFilter !== 'all') && (
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
          
          <Button
            variant="default"
            size="sm"
            onClick={handleAddNewOpportunity}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-2">
        <div className="flex items-center gap-2 p-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            className="h-9 w-[250px] lg:w-[300px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <OpportunityMetricCards stats={opportunityStats} isLoading={isLoading} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Opportunities List</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(value) => handleFilterChange(value as OpportunityStatus | 'all')}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Active">Active</TabsTrigger>
              <TabsTrigger value="Rejected">Rejected</TabsTrigger>
              <TabsTrigger value="Closed">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-0">
              <OpportunitiesDataTable 
                opportunities={opportunitiesData?.opportunities || []} 
                isLoading={isLoading}
                isError={isError}
                error={error as Error}
                page={page}
                setPage={setPage}
                totalPages={opportunitiesData?.totalPages || 1}
                onViewDetails={handleViewDetails}
                onApprove={(id) => handleApproveOpportunity(id)}
                onReject={(id) => handleRejectOpportunity(id)}
                onToggleFeature={handleToggleFeature}
                onEdit={handleEditOpportunity}
                onDelete={handleDeleteOpportunity}
                onSort={handleSort}
                currentSortColumn={sortBy}
                currentSortDirection={sortDirection}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Opportunity Details Dialog */}
      <OpportunityDetailsDialog 
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunityId}
        isLoading={isOpportunityLoading}
        onClose={handleCloseDetailsDialog}
        onEdit={() => selectedOpportunity && handleEditOpportunity(selectedOpportunity.id)}
        onApprove={() => selectedOpportunity && handleApproveOpportunity(selectedOpportunity.id)}
        onReject={() => selectedOpportunity && handleRejectOpportunity(selectedOpportunity.id)}
        onDelete={() => selectedOpportunity && handleDeleteOpportunity(selectedOpportunity.id)}
        onToggleFeature={() => selectedOpportunity && handleToggleFeature(
          selectedOpportunity.id, 
          !!selectedOpportunity.featured
        )}
      />

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Opportunities</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Type</h3>
              <Tabs value={typeFilter} onValueChange={handleTypeFilterChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="job">Jobs</TabsTrigger>
                  <TabsTrigger value="internship">Internships</TabsTrigger>
                  <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
                  <TabsTrigger value="fellowship">Fellowships</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
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
