
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Paginated fetch utility function
export async function fetchAllFromTable(tableName: string, orderField: string) {
  try {
    const allItems = [];
    let page = 0;
    const pageSize = 1000; // Large page size to reduce number of requests
    let hasMore = true;
    
    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('status', 'Approved')
        .range(start, end)
        .order(orderField);
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }
      
      if (data && data.length > 0) {
        allItems.push(...data);
        page++;
      } else {
        hasMore = false;
      }
      
      // Safety limit to prevent infinite loops
      if (page > 10) break;
    }
    
    return allItems;
  } catch (error) {
    console.error(`Error in fetchAllFromTable for ${tableName}:`, error);
    return [];
  }
}

export function useAllSchools() {
  return useQuery({
    queryKey: ['schools-all'],
    queryFn: () => fetchAllFromTable('schools', 'name'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAllCompanies() {
  return useQuery({
    queryKey: ['companies-all'],
    queryFn: () => fetchAllFromTable('companies', 'name'),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllMajors() {
  return useQuery({
    queryKey: ['majors-all'],
    queryFn: () => fetchAllFromTable('majors', 'title'),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllCareers() {
  return useQuery({
    queryKey: ['careers-all'],
    queryFn: () => fetchAllFromTable('careers', 'title'),
    staleTime: 10 * 60 * 1000,
  });
}
