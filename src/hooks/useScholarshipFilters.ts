
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ScholarshipFilters } from "@/types/scholarship/filters";

export function useScholarshipFilters(refreshKey: number = 0) {
  const [filters, setFilters] = useState<ScholarshipFilters>({});

  // Fetch scholarships with filters
  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ['scholarships', filters, refreshKey],
    queryFn: async () => {
      let query = supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters only if they have valid values
      if (filters.search && filters.search.trim()) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`);
      }

      if (filters.category && filters.category !== 'all' && filters.category.trim()) {
        query = query.contains('category', [filters.category]);
      }

      if (filters.amount && filters.amount !== 'all' && filters.amount.trim()) {
        const amountParts = filters.amount.split('-');
        const min = parseInt(amountParts[0]);
        const max = amountParts[1] ? parseInt(amountParts[1]) : null;
        
        // Only apply filter if we have valid numbers
        if (!isNaN(min)) {
          query = query.gte('amount', min);
          if (max && !isNaN(max)) {
            query = query.lte('amount', max);
          }
        }
      }

      if (filters.deadline && filters.deadline instanceof Date) {
        const deadlineStr = filters.deadline.toISOString().split('T')[0];
        query = query.gte('application_deadline', deadlineStr);
      }

      // Add other filters as needed
      if (filters.citizenship && filters.citizenship.length > 0) {
        // Filter by citizenship requirements (assuming it's stored in eligibility_criteria)
        const citizenshipFilter = filters.citizenship
          .filter(c => c && c.trim()) // Remove empty values
          .map(c => `eligibility_criteria.cs.{${c}}`)
          .join(',');
        
        if (citizenshipFilter) {
          query = query.or(citizenshipFilter);
        }
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching scholarships:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract unique categories from scholarships
  const categories = useMemo(() => {
    const allCategories = scholarships.flatMap(s => s.category || []);
    return [...new Set(allCategories)].sort();
  }, [scholarships]);

  const handleFilterChange = (newFilters: Partial<ScholarshipFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    scholarships,
    isLoading,
    categories,
    filters,
    handleFilterChange,
    resetFilters
  };
}
