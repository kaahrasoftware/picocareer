
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Major } from "@/types/database/majors";

interface MajorQueryParams {
  page: number;
  limit: number;
  searchQuery?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  status?: string;
}

export function usePaginatedMajors({
  page = 1,
  limit = 10,
  searchQuery = '',
  orderBy = 'created_at',
  orderDirection = 'desc',
  status
}: MajorQueryParams) {
  const [totalCount, setTotalCount] = useState(0);

  const fetchMajors = async () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = supabase
      .from('majors')
      .select('*, career_major_relations(career:career_id(id, title, salary_range))', { count: 'exact' });

    // Apply search filter if provided
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    // Apply status filter if provided - ensure proper type casting
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Get total count
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

    return data as Major[];
  };

  const {
    data = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['majors', page, limit, searchQuery, orderBy, orderDirection, status],
    queryFn: fetchMajors
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    isLoading,
    error,
    page,
    limit,
    totalPages,
    totalCount,
    refetch
  };
}
