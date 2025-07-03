
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PaginatedQueryParams {
  table: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
  searchField?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  select?: string;
}

export function usePaginatedQuery<T = any>({
  table,
  page = 1,
  limit = 10,
  searchQuery = '',
  searchField = 'title',
  orderBy = 'created_at',
  orderDirection = 'desc',
  filters = {},
  select = '*'
}: PaginatedQueryParams) {
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchData = async (): Promise<T[]> => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // Use any to bypass strict typing for dynamic table queries
    let query = (supabase as any)
      .from(table)
      .select(select, { count: 'exact' });

    // Apply search filter if provided
    if (searchQuery && searchField) {
      query = query.ilike(searchField, `%${searchQuery}%`);
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    // Get total count first
    const { count, error: countError } = await query;
    
    if (countError) {
      throw countError;
    }

    if (count !== null) {
      setTotalCount(count);
    }

    // Execute query with pagination and ordering
    const { data, error } = await query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(startIndex, endIndex);

    if (error) {
      throw error;
    }

    return data as T[];
  };

  const {
    data = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [table, currentPage, limit, searchQuery, searchField, orderBy, orderDirection, filters],
    queryFn: fetchData
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    isLoading,
    error,
    page: currentPage,
    limit,
    totalPages,
    totalCount,
    count: totalCount, // Add alias for compatibility
    setPage: setCurrentPage,
    refetch
  };
}
