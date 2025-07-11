
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
import { SchoolCard } from "@/components/SchoolCard";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import type { School } from "@/types/database/schools";

export default function School() {
  const { isMobile } = useBreakpoints();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [schoolType, setSchoolType] = useState<string | undefined>(undefined);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Mobile-responsive pagination - fewer items per page on mobile
  const itemsPerPage = isMobile ? 8 : 20;
  
  // Setup pagination with responsive items per page
  const {
    data: schools,
    isLoading,
    page,
    totalPages,
    setPage,
    count: totalSchools
  } = usePaginatedQuery<School>({
    table: 'schools',
    limit: itemsPerPage,
    page: 1,
    orderBy: sortField,
    orderDirection: sortDirection,
    searchQuery: debouncedSearch,
    filters: schoolType ? { type: schoolType } : {}
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
    <div className={`container mx-auto ${isMobile ? 'py-4 px-4' : 'py-8'}`}>
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Schools Directory</h1>
        <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Showing {schools.length} of {totalSchools} schools
        </div>
      </div>

      {/* Filters and Search - Mobile-first responsive layout */}
      <div className={`${isMobile ? 'flex flex-col space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'} mb-6`}>
        <div>
          <Input
            placeholder="Search schools..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={`w-full ${isMobile ? 'h-12' : ''}`}
          />
        </div>
        <div>
          <Select onValueChange={handleTypeChange} defaultValue="all">
            <SelectTrigger className={isMobile ? 'h-12' : ''}>
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
            <SelectTrigger className={isMobile ? 'h-12' : ''}>
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
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
          {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
            <Skeleton key={i} className={isMobile ? 'h-40' : 'h-48'} />
          ))}
        </div>
      ) : (
        <>
          {/* School Cards */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {schools.length > 0 ? (
              schools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
                  No schools found matching your criteria.
                </p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className={isMobile ? 'mt-6' : 'mt-8'}>
              <StandardPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  // Smooth scroll to top on page change
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                maxPageButtons={isMobile ? 3 : 5}
              />
            </div>
          )}
        </>
      )}
      
      <GoToTopButton />
    </div>
  );
}
