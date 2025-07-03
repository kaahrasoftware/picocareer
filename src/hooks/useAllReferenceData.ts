
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const fetchAllFromTable = async (tableName: string) => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('title');
  
  if (error) throw error;
  return data || [];
};

export const useAllSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: () => fetchAllFromTable('schools'),
  });
};

export const useAllMajors = () => {
  return useQuery({
    queryKey: ['majors'],
    queryFn: () => fetchAllFromTable('majors'),
  });
};

export const useAllCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => fetchAllFromTable('companies'),
  });
};

export const useAllCareers = () => {
  return useQuery({
    queryKey: ['careers'],
    queryFn: () => fetchAllFromTable('careers'),
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
