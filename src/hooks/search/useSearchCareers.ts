import { supabase } from "@/integrations/supabase/client";
import type { CareerSearchResult } from "@/types/search/types";

export const searchCareers = async (searchTerm: string): Promise<CareerSearchResult[]> => {
  const searchTermLower = searchTerm.toLowerCase();
  
  const { data: careers, error } = await supabase
    .from("careers")
    .select(`
      id,
      title,
      description,
      salary_range
    `)
    .or(`lower(title).ilike.%${searchTermLower}%,lower(description).ilike.%${searchTermLower}%`)
    .limit(5);

  if (error) throw error;

  return (careers || []).map(career => ({
    id: career.id,
    type: "career" as const,
    title: career.title,
    description: career.description,
    salary_range: career.salary_range
  }));
};