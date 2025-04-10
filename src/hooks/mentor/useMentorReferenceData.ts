
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMentorReferenceData() {
  // Fetch all careers with pagination
  const fetchAllCareers = async () => {
    const allCareers = [];
    let page = 0;
    const pageSize = 1000; // Large page size to fetch more at once
    let hasMore = true;
    
    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .range(start, end);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        allCareers.push(...data);
        page++;
      } else {
        hasMore = false;
      }
      
      // Safety limit to prevent infinite loops
      if (page > 10) break;
    }
    
    return allCareers;
  };
  
  // Fetch all companies with pagination
  const fetchAllCompanies = async () => {
    const allCompanies = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved')
        .range(start, end);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        allCompanies.push(...data);
        page++;
      } else {
        hasMore = false;
      }
      
      if (page > 10) break;
    }
    
    return allCompanies;
  };
  
  // Fetch all schools with pagination
  const fetchAllSchools = async () => {
    const allSchools = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .range(start, end)
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        allSchools.push(...data);
        page++;
      } else {
        hasMore = false;
      }
      
      if (page > 10) break;
    }
    
    return allSchools;
  };
  
  // Fetch all majors with pagination
  const fetchAllMajors = async () => {
    const allMajors = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .range(start, end)
        .order('title');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        allMajors.push(...data);
        page++;
      } else {
        hasMore = false;
      }
      
      if (page > 10) break;
    }
    
    return allMajors;
  };

  const { data: careers } = useQuery({
    queryKey: ['careers-all'],
    queryFn: fetchAllCareers,
    staleTime: 30 * 60 * 1000, // 30 minutes cache
  });

  const { data: companies } = useQuery({
    queryKey: ['companies-all'],
    queryFn: fetchAllCompanies,
    staleTime: 30 * 60 * 1000,
  });

  const { data: schools } = useQuery({
    queryKey: ['schools-all'],
    queryFn: fetchAllSchools,
    staleTime: 30 * 60 * 1000,
  });

  const { data: majors } = useQuery({
    queryKey: ['majors-all'],
    queryFn: fetchAllMajors,
    staleTime: 30 * 60 * 1000,
  });

  return {
    careers,
    companies,
    schools,
    majors
  };
}
