
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentList } from '../../content/ContentList';
import { ContentStatusFilter } from '../../content/ContentStatusFilter';
import { StandardPagination } from '@/components/common/StandardPagination';
import { Search, Plus, BarChart3, TrendingUp, Award, Building, CheckCircle } from 'lucide-react';
import type { ContentStatus } from '../../types';
import type { AdminCareersFilters, CareerStats } from './types';

const ITEMS_PER_PAGE = 10;

export function CareersManagementTab() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AdminCareersFilters>({
    searchQuery: '',
    statusFilter: 'all',
    industryFilter: 'all',
    featuredFilter: 'all',
    completeFilter: 'all'
  });

  const { data: careersData, isLoading } = useQuery({
    queryKey: ['admin-careers', currentPage, filters],
    queryFn: async () => {
      let query = supabase
        .from('careers')
        .select(`
          *,
          profiles!careers_author_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      if (filters.statusFilter !== 'all') {
        query = query.eq('status', filters.statusFilter);
      }

      if (filters.industryFilter !== 'all') {
        query = query.eq('industry', filters.industryFilter);
      }

      if (filters.featuredFilter !== 'all') {
        const isFeatured = filters.featuredFilter === 'featured';
        query = query.eq('featured', isFeatured);
      }

      if (filters.completeFilter !== 'all') {
        const isComplete = filters.completeFilter === 'complete';
        query = query.eq('complete_career', isComplete);
      }

      // Get count for pagination
      const { count } = await supabase
        .from('careers')
        .select('*', { count: 'exact', head: true });

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      return {
        careers: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
      };
    }
  });

  const { data: statsData } = useQuery({
    queryKey: ['careers-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('status, industry, featured, complete_career');
      
      if (error) throw error;

      const stats: CareerStats = {
        totalCount: data.length,
        approvedCount: data.filter(c => c.status === 'Approved').length,
        pendingCount: data.filter(c => c.status === 'Pending').length,
        featuredCount: data.filter(c => c.featured).length,
        completedCount: data.filter(c => c.complete_career).length,
        industryBreakdown: {}
      };

      // Calculate industry breakdown
      data.forEach(career => {
        if (career.industry) {
          stats.industryBreakdown[career.industry] = (stats.industryBreakdown[career.industry] || 0) + 1;
        }
      });

      return stats;
    }
  });

  const updateCareerStatus = useMutation({
    mutationFn: async ({ careerId, newStatus }: { careerId: string; newStatus: ContentStatus }) => {
      const { error } = await supabase
        .from('careers')
        .update({ status: newStatus })
        .eq('id', careerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
      queryClient.invalidateQueries({ queryKey: ['careers-stats'] });
    },
  });

  const handleStatusChange = async (itemId: string, newStatus: ContentStatus) => {
    await updateCareerStatus.mutateAsync({ careerId: itemId, newStatus });
  };

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'Approved':
        return 'border-green-200 bg-green-50';
      case 'Pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'Rejected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: ContentStatus | "all") => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof AdminCareersFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Calculate stats with fallback values
  const stats = statsData || {
    totalCount: 0,
    approvedCount: 0,
    pendingCount: 0,
    featuredCount: 0,
    completedCount: 0,
    industryBreakdown: {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Career Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Career
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Careers</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.featuredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search careers..."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <ContentStatusFilter
              statusFilter={filters.statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.industryFilter}
              onChange={(e) => handleFilterChange('industryFilter', e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All Industries</option>
              {Object.keys(stats.industryBreakdown).map(industry => (
                <option key={industry} value={industry}>
                  {industry} ({stats.industryBreakdown[industry]})
                </option>
              ))}
            </select>

            <select
              value={filters.featuredFilter}
              onChange={(e) => handleFilterChange('featuredFilter', e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All Featured Status</option>
              <option value="featured">Featured Only</option>
              <option value="not_featured">Not Featured</option>
            </select>

            <select
              value={filters.completeFilter}
              onChange={(e) => handleFilterChange('completeFilter', e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All Completion Status</option>
              <option value="complete">Complete Only</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Careers List */}
      <Card>
        <CardHeader>
          <CardTitle>Careers ({careersData?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentList
            items={careersData?.careers || []}
            isLoading={isLoading}
            contentType="careers"
            statusFilter={filters.statusFilter}
            handleStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
          />
          
          {careersData && careersData.totalPages > 1 && (
            <div className="mt-6">
              <StandardPagination
                currentPage={currentPage}
                totalPages={careersData.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
