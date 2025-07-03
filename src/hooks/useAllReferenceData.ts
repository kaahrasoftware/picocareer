
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface School {
  id: string;
  name: string;
  location?: string;
  website?: string;
  logo_url?: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
}

export interface Major {
  id: string;
  title: string;
  description?: string;
  degree_level?: string;
}

function createReferenceDataQuery<T>(tableName: string, select = '*') {
  return async (): Promise<T[]> => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select);
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
    
    return (data as T[]) || [];
  };
}

export function useAllReferenceData() {
  const schoolsQuery = useQuery({
    queryKey: ['all-schools'],
    queryFn: createReferenceDataQuery<School>('schools', 'id, name, location, website, logo_url'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  const companiesQuery = useQuery({
    queryKey: ['all-companies'],
    queryFn: createReferenceDataQuery<Company>('companies', 'id, name, industry, website'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const majorsQuery = useQuery({
    queryKey: ['all-majors'],
    queryFn: createReferenceDataQuery<Major>('majors', 'id, title, description'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    schools: schoolsQuery.data || [],
    companies: companiesQuery.data || [],
    majors: majorsQuery.data || [],
    isLoading: schoolsQuery.isLoading || companiesQuery.isLoading || majorsQuery.isLoading,
    error: schoolsQuery.error || companiesQuery.error || majorsQuery.error,
  };
}
