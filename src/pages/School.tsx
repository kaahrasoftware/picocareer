
import { useState } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StandardPagination } from "@/components/common/StandardPagination";
import type { School } from "@/types/database/schools";

export default function School() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [schoolType, setSchoolType] = useState<string | undefined>(undefined);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Setup pagination with 20 items per page
  const {
    data: schools,
    isLoading,
    page,
    totalPages,
    setPage,
    count: totalSchools
  } = usePaginatedQuery<School>({
    queryKey: ['schools', schoolType, debouncedSearch],
    tableName: 'schools',
    paginationOptions: {
      limit: 20,
      page: 1,
      orderBy: sortField,
      orderDirection: sortDirection,
      searchQuery: debouncedSearch,
      searchColumn: 'name'
    },
    filters: schoolType ? { type: schoolType } : {},
    queryOptions: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  });

  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      // Reset to first page when search changes
      setPage(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleTypeChange = (value: string) => {
    setSchoolType(value === 'all' ? undefined : value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-');
    setSortField(field);
    setSortDirection(direction as 'asc' | 'desc');
    setPage(1); // Reset to first page when sort changes
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Schools Directory</h1>
        <div className="text-sm text-muted-foreground">
          Showing {schools.length} of {totalSchools} schools
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            placeholder="Search schools..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div>
          <Select onValueChange={handleTypeChange} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Community College">Community College</SelectItem>
              <SelectItem value="University">University</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select onValueChange={handleSortChange} defaultValue="name-asc">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="acceptance_rate-asc">Acceptance Rate (Low to High)</SelectItem>
              <SelectItem value="acceptance_rate-desc">Acceptance Rate (High to Low)</SelectItem>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          {/* School Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.length > 0 ? (
              schools.map((school) => (
                <Card key={school.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{school.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Type:</span> {school.type || 'Not specified'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Location:</span> {school.location || 'Not specified'}
                      </p>
                      {school.acceptance_rate && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Acceptance Rate:</span> {(school.acceptance_rate * 100).toFixed(1)}%
                        </p>
                      )}
                      {school.country && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Country:</span> {school.country}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">No schools found matching your criteria.</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          <StandardPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
