
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const fetchAllFromTable = async (tableName: string) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const useAllSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAllMajors = () => {
  return useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAllCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAllCareers = () => {
  return useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAllReferenceData = () => {
  const schools = useAllSchools();
  const majors = useAllMajors();
  const companies = useAllCompanies();
  const careers = useAllCareers();

  return {
    schools: schools.data || [],
    majors: majors.data || [],
    companies: companies.data || [],
    careers: careers.data || [],
    isLoading: schools.isLoading || majors.isLoading || companies.isLoading || careers.isLoading,
    error: schools.error || majors.error || companies.error || careers.error
  };
};
