
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface PaginationOptions {
  limit?: number;
  page?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  searchQuery?: string;
  searchColumn?: string;
}

interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  totalPages: number;
}

export function usePaginatedQuery<T>({
  queryKey,
  tableName,
  paginationOptions = {},
  filters = {},
  select,
  queryOptions = {}
}: {
  queryKey: string[];
  tableName: string;
  paginationOptions?: PaginationOptions;
  filters?: Record<string, any>;
  select?: string;
  queryOptions?: Omit<UseQueryOptions<any, Error, any, any>, 'queryKey' | 'queryFn'>;
}): PaginatedResult<T> {
  const {
    limit = 10,
    page = 1,
    orderBy = 'created_at',
    orderDirection = 'desc',
    searchQuery = '',
    searchColumn
  } = paginationOptions;

  const [currentPage, setCurrentPage] = useState<number>(page);
  
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit - 1;

  // Use tanstack/react-query for data fetching with caching
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, currentPage, limit, orderBy, orderDirection, searchQuery, JSON.stringify(filters)],
    queryFn: async () => {
      try {
        // First query for total count
        let countQuery = supabase
          .from(tableName)
          .select('id', { count: 'exact' });
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            countQuery = countQuery.eq(key, value);
          }
        });
        
        // Apply search if provided
        if (searchQuery && searchColumn) {
          countQuery = countQuery.ilike(searchColumn, `%${searchQuery}%`);
        }
        
        const { count: totalCount, error: countError } = await countQuery;
        
        if (countError) throw countError;
        
        // Query for the actual data with pagination
        let dataQuery = supabase
          .from(tableName)
          .select(select || '*')
          .order(orderBy, { ascending: orderDirection === 'asc' })
          .range(startIndex, endIndex);
        
        // Apply the same filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            dataQuery = dataQuery.eq(key, value);
          }
        });
        
        // Apply the same search if provided
        if (searchQuery && searchColumn) {
          dataQuery = dataQuery.ilike(searchColumn, `%${searchQuery}%`);
        }
        
        const { data: items, error: dataError } = await dataQuery;
        
        if (dataError) throw dataError;
        
        return {
          data: items as T[],
          count: totalCount || 0
        };
      } catch (error) {
        console.error(`Error fetching paginated data from ${tableName}:`, error);
        throw error;
      }
    },
    ...queryOptions
  });

  const totalItems = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  
  return {
    data: data?.data || [],
    count: totalItems,
    page: currentPage,
    pageSize: limit,
    isLoading,
    error: error as Error | null,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    setPage: setCurrentPage,
    totalPages
  };
}
