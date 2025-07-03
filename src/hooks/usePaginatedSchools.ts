
import { useState } from 'react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import type { School } from '@/types/database/schools';

export type SortField = keyof School;
export type SortDirection = 'asc' | 'desc';
export type SchoolFilter = {
  type?: string;
  status?: string;
};

export interface SchoolsQueryOptions {
  pageSize?: number;
  page?: number;
  sortField?: SortField;
  sortDirection?: SortDirection;
  searchQuery?: string;
  filters?: SchoolFilter;
}

export function usePaginatedSchools(options: SchoolsQueryOptions = {}) {
  const {
    pageSize = 50,
    page = 1,
    sortField = 'name',
    sortDirection = 'asc',
    searchQuery = '',
    filters = {}
  } = options;

  // URL-safe version of the school's name column for search
  const searchColumn = 'name';

  // Construct filter object for the query
  const queryFilters: Record<string, any> = {};
  if (filters.type) queryFilters.type = filters.type;
  if (filters.status) queryFilters.status = filters.status;

  return usePaginatedQuery<School>({
    table: 'schools',
    page,
    limit: pageSize,
    orderBy: sortField,
    orderDirection: sortDirection,
    searchQuery,
    searchField: searchColumn,
    filters: queryFilters
  });
}
