
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

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.contains('category', [filters.category]);
      }

      if (filters.amount) {
        const [min, max] = filters.amount.split('-').map(Number);
        if (max) {
          query = query.gte('amount', min).lte('amount', max);
        } else {
          query = query.gte('amount', min);
        }
      }

      if (filters.deadline) {
        const deadlineStr = filters.deadline.toISOString().split('T')[0];
        query = query.gte('application_deadline', deadlineStr);
      }

      // Add other filters as needed
      if (filters.citizenship && filters.citizenship.length > 0) {
        // Filter by citizenship requirements (assuming it's stored in eligibility_criteria)
        const citizenshipFilter = filters.citizenship.map(c => `eligibility_criteria.cs.{${c}}`).join(',');
        query = query.or(citizenshipFilter);
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
