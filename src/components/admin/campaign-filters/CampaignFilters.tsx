
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { StatusFilter } from './StatusFilter';
import { ContentTypeFilter } from './ContentTypeFilter';
import { FrequencyFilter } from './FrequencyFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { SearchFilter } from './SearchFilter';

export interface FilterState {
  status: string | null;
  contentType: string | null;
  frequency: string | null;
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

interface CampaignFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalCount: number;
  filteredCount: number;
}

export function CampaignFilters({
  filters,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse,
  totalCount,
  filteredCount
}: CampaignFiltersProps) {
  const activeFiltersCount = [
    filters.status,
    filters.contentType,
    filters.frequency,
    filters.search,
    filters.dateRange.from || filters.dateRange.to
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onFiltersChange({
      status: null,
      contentType: null,
      frequency: null,
      search: '',
      dateRange: { from: null, to: null }
    });
  };

  const clearFilter = (filterType: keyof FilterState) => {
    if (filterType === 'dateRange') {
      onFiltersChange({
        ...filters,
        dateRange: { from: null, to: null }
      });
    } else if (filterType === 'search') {
      onFiltersChange({
        ...filters,
        search: ''
      });
    } else {
      onFiltersChange({
        ...filters,
        [filterType]: null
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalCount} campaigns
            </div>
          </div>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filter Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.status && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('status')}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.contentType && (
              <Badge variant="outline" className="flex items-center gap-1">
                Type: {filters.contentType}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('contentType')}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.frequency && (
              <Badge variant="outline" className="flex items-center gap-1">
                Frequency: {filters.frequency}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('frequency')}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.search && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('search')}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="outline" className="flex items-center gap-1">
                Date Range
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('dateRange')}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Filter Controls */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <SearchFilter
              value={filters.search}
              onChange={(search) => onFiltersChange({ ...filters, search })}
            />
            
            <StatusFilter
              value={filters.status}
              onChange={(status) => onFiltersChange({ ...filters, status })}
            />
            
            <ContentTypeFilter
              value={filters.contentType}
              onChange={(contentType) => onFiltersChange({ ...filters, contentType })}
            />
            
            <FrequencyFilter
              value={filters.frequency}
              onChange={(frequency) => onFiltersChange({ ...filters, frequency })}
            />
            
            <DateRangeFilter
              value={filters.dateRange}
              onChange={(dateRange) => onFiltersChange({ ...filters, dateRange })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
