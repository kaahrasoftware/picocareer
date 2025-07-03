
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  RefreshCcw, 
  Download, 
  Filter,
  Search as SearchIcon,
  PlusCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CareersDataTable } from './CareersDataTable';
import { useAdminCareersQuery } from '@/hooks/useAdminCareersQuery';
import { CareerMetricCards } from './CareerMetricCards';
import { CareerDetailsDialog } from './CareerDetailsDialog';
import { CareerFormDialog } from './CareerFormDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { Status } from '@/types/database/enums';

export function CareersManagementTab() {
  // State for filters and pagination
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  
  // State for career details dialog
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [isCareerLoading, setIsCareerLoading] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isAddCareerOpen, setIsAddCareerOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<any>(null);

  // Toast notification
  const { toast } = useToast();
  
  // Fetch careers data
  const { 
    data: careersData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching
  } = useAdminCareersQuery({
    statusFilter,
    industryFilter,
    page,
    pageSize,
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    searchTerm: debouncedSearchTerm,
    sortBy,
    sortDirection
  });

  // Handlers
  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: "Data refreshed",
      description: "Career data has been refreshed.",
    });
  }, [refetch, toast]);

  const handleViewDetails = useCallback((careerId: string) => {
    setSelectedCareerId(careerId);
  }, []);

  const handleCloseDetailsDialog = useCallback(() => {
    setSelectedCareerId(null);
  }, []);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your career data is being prepared for download.",
    });
  };

  const handleFilterChange = (status: Status | 'all') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleIndustryFilterChange = (industry: string) => {
    setIndustryFilter(industry);
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // CRUD Operations
  const handleApproveCareer = async (careerId: string) => {
    try {
      const { error } = await supabase
        .from('careers')
        .update({ status: 'Approved' })
        .eq('id', careerId);

      if (error) throw error;

      toast({
        title: 'Career Approved',
        description: 'The career has been approved successfully.',
      });
      
      handleCloseDetailsDialog();
      refetch();
    } catch (err) {
      console.error('Error approving career:', err);
      toast({
        title: 'Error',
        description: 'Failed to approve career',
        variant: 'destructive',
      });
    }
  };

  const handleRejectCareer = async (careerId: string) => {
    try {
      const { error } = await supabase
        .from('careers')
        .update({ status: 'Rejected' })
        .eq('id', careerId);

      if (error) throw error;

      toast({
        title: 'Career Rejected',
        description: 'The career has been rejected.',
      });
      
      handleCloseDetailsDialog();
      refetch();
    } catch (err) {
      console.error('Error rejecting career:', err);
      toast({
        title: 'Error',
        description: 'Failed to reject career',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeature = async (careerId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('careers')
        .update({ featured: !currentFeatured })
        .eq('id', careerId);

      if (error) throw error;

      toast({
        title: currentFeatured ? 'Career Unfeatured' : 'Career Featured',
        description: currentFeatured 
          ? 'The career has been removed from featured list.' 
          : 'The career has been added to featured list.',
      });
      
      refetch();
      
      if (selectedCareerId === careerId) {
        setSelectedCareer(prev => prev ? {
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

  const handleEditCareer = (career: any) => {
    setEditingCareer(career);
    setIsAddCareerOpen(true);
  };

  const handleDeleteCareer = async (careerId: string) => {
    if (!confirm('Are you sure you want to delete this career? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('careers')
        .delete()
        .eq('id', careerId);

      if (error) throw error;

      toast({
        title: 'Career Deleted',
        description: 'The career has been permanently deleted.',
      });
      
      handleCloseDetailsDialog();
      refetch();
    } catch (err) {
      console.error('Error deleting career:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete career',
        variant: 'destructive',
      });
    }
  };

  const handleAddNewCareer = () => {
    setEditingCareer(null);
    setIsAddCareerOpen(true);
  };

  const handleCareerFormSuccess = () => {
    setIsAddCareerOpen(false);
    setEditingCareer(null);
    refetch();
  };

  // Calculate stats for metric cards
  const careerStats = {
    totalCount: careersData?.totalCount || 0,
    approvedCount: careersData?.approvedCount || 0,
    pendingCount: careersData?.pendingCount || 0,
    featuredCount: careersData?.featuredCount || 0,
    completedCount: careersData?.completedCount || 0,
    industryBreakdown: careersData?.industryBreakdown || []
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Careers Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(dateRange || statusFilter !== "all" || industryFilter !== 'all') && (
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
            onClick={handleAddNewCareer}
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
            placeholder="Search careers..."
            className="h-9 w-[250px] lg:w-[300px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <CareerMetricCards stats={careerStats} isLoading={isLoading} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Careers List</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(value) => handleFilterChange(value as Status | 'all')}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Approved">Approved</TabsTrigger>
              <TabsTrigger value="Rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-0">
              <CareersDataTable 
                careers={careersData?.careers || []} 
                isLoading={isLoading}
                isError={isError}
                error={error as Error}
                page={page}
                setPage={setPage}
                totalPages={careersData?.totalPages || 1}
                onViewDetails={handleViewDetails}
                onApprove={(id) => handleApproveCareer(id)}
                onReject={(id) => handleRejectCareer(id)}
                onToggleFeature={handleToggleFeature}
                onEdit={handleEditCareer}
                onDelete={handleDeleteCareer}
                onSort={handleSort}
                currentSortColumn={sortBy}
                currentSortDirection={sortDirection}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Career Details Dialog */}
      <CareerDetailsDialog 
        career={selectedCareer}
        careerId={selectedCareerId}
        isOpen={!!selectedCareerId}
        isLoading={isCareerLoading}
        onClose={handleCloseDetailsDialog}
        onEdit={() => selectedCareer && handleEditCareer(selectedCareer)}
        onApprove={() => selectedCareer && handleApproveCareer(selectedCareer.id)}
        onReject={() => selectedCareer && handleRejectCareer(selectedCareer.id)}
        onDelete={() => selectedCareer && handleDeleteCareer(selectedCareer.id)}
        onToggleFeature={() => selectedCareer && handleToggleFeature(
          selectedCareer.id, 
          !!selectedCareer.featured
        )}
      />

      {/* Career Form Dialog */}
      <CareerFormDialog
        open={isAddCareerOpen}
        onClose={() => {
          setIsAddCareerOpen(false);
          setEditingCareer(null);
        }}
        onSuccess={handleCareerFormSuccess}
        career={editingCareer}
      />

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Careers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Industry</h3>
              <Tabs value={industryFilter} onValueChange={handleIndustryFilterChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="technology">Technology</TabsTrigger>
                  <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
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
