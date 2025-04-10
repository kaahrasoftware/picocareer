
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Enhanced fetch utility function with better type safety
export async function fetchAllFromTable<T extends { id: string }>(
  tableName: string, 
  orderField: string
): Promise<T[]> {
  try {
    const allItems: T[] = [];
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
        allItems.push(...data as T[]);
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

interface School {
  id: string;
  name: string;
  location?: string;
}

interface Company {
  id: string;
  name: string;
}

interface Major {
  id: string;
  title: string;
}

interface Career {
  id: string;
  title: string;
}

export function useAllSchools() {
  return useQuery<School[]>({
    queryKey: ['schools-all'],
    queryFn: () => fetchAllFromTable<School>('schools', 'name'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useAllCompanies() {
  return useQuery<Company[]>({
    queryKey: ['companies-all'],
    queryFn: () => fetchAllFromTable<Company>('companies', 'name'),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    cacheTime: 30 * 60 * 1000,
  });
}

export function useAllMajors() {
  return useQuery<Major[]>({
    queryKey: ['majors-all'],
    queryFn: () => fetchAllFromTable<Major>('majors', 'title'),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    cacheTime: 30 * 60 * 1000,
  });
}

export function useAllCareers() {
  return useQuery<Career[]>({
    queryKey: ['careers-all'],
    queryFn: () => fetchAllFromTable<Career>('careers', 'title'),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    cacheTime: 30 * 60 * 1000,
  });
}
