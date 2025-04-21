
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { ScholarshipFilters } from "@/types/scholarship/filters";

export function useScholarshipFilters() {
  const [filters, setFilters] = useState<ScholarshipFilters>({
    status: "Active",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["scholarship-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("category")
        .eq("status", "Active");

      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }

      const allCategories = data
        .flatMap((scholarship) => scholarship.category || [])
        .filter(Boolean);

      return [...new Set(allCategories)];
    },
  });

  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ["scholarships", filters],
    queryFn: async () => {
      let query = supabase.from("scholarships").select("*");

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`
        );
      }

      if (filters.category && filters.category !== "all") {
        query = query.contains("category", [filters.category]);
      }

      if (filters.amount && filters.amount !== "all") {
        switch (filters.amount) {
          case "under5000":
            query = query.lt("amount", 5000);
            break;
          case "5000-10000":
            query = query.gte("amount", 5000).lte("amount", 10000);
            break;
          case "10000-25000":
            query = query.gte("amount", 10000).lte("amount", 25000);
            break;
          case "over25000":
            query = query.gt("amount", 25000);
            break;
          case "fulltuition":
            query = query.contains("tags", ["full tuition"]);
            break;
        }
      }

      if (filters.deadline) {
        query = query.lte("deadline", filters.deadline.toISOString());
      }

      if (filters.citizenship && filters.citizenship.length > 0) {
        query = query.overlaps("citizenship_requirements", filters.citizenship);
      }

      if (filters.demographic && filters.demographic.length > 0) {
        query = query.overlaps("demographic_requirements", filters.demographic);
      }

      if ((filters.academic_year && filters.academic_year.length > 0) || 
          (filters.major && filters.major.length > 0) ||
          filters.gpa_requirement) {
            
        if (filters.academic_year && filters.academic_year.length > 0) {
          query = query.filter('eligibility_criteria->academic_year', 'cs', `{${filters.academic_year.join(',')}}`);
        }
        
        if (filters.major && filters.major.length > 0) {
          query = query.filter('eligibility_criteria->major', 'cs', `{${filters.major.join(',')}}`);
        }
        
        if (filters.gpa_requirement && filters.gpa_requirement !== "none") {
          const minGpa = parseFloat(filters.gpa_requirement);
          query = query.gte('eligibility_criteria->>gpa_requirement', minGpa);
        }
      }

      if (filters.renewable !== undefined) {
        query = query.eq("renewable", filters.renewable);
      }

      if (filters.award_frequency && filters.award_frequency !== "none") {
        query = query.eq("award_frequency", filters.award_frequency);
      }

      query = query.order("featured", { ascending: false }).order("deadline", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching scholarships:", error);
        throw error;
      }

      if (filters.application_process_length && filters.application_process_length !== "none") {
        return data.filter(scholarship => {
          const processLength = scholarship.application_process ? scholarship.application_process.length : 0;
          const requiredDocsCount = scholarship.required_documents ? scholarship.required_documents.length : 0;
          
          const complexity = processLength > 500 || requiredDocsCount > 3 
            ? "Complex (1+ hour)" 
            : processLength > 200 || requiredDocsCount > 1 
              ? "Medium (30-60 min)" 
              : "Simple (less than 30 min)";
              
          return complexity === filters.application_process_length;
        });
      }

      return data;
    },
  });

  const handleFilterChange = (newFilters: ScholarshipFilters) => {
    const cleanedFilters: ScholarshipFilters = {};
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== "" && value !== "none" && value !== undefined) {
        if (Array.isArray(value) && value.length === 0) {
          return;
        }
        cleanedFilters[key as keyof ScholarshipFilters] = value;
      }
    });
    
    setFilters(cleanedFilters);
  };

  const resetFilters = () => {
    setFilters({
      status: "Active",
    });
  };

  return {
    filters,
    categories,
    scholarships,
    isLoading,
    handleFilterChange,
    resetFilters
  };
}
