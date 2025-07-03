import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface School {
  id: string;
  name: string;
  country: string;
  status: string;
  featured: boolean;
  featured_priority?: number;
  website?: string;
  description?: string;
  image_url?: string;
  acceptance_rate?: number;
  admissions_page_url?: string;
  author_id?: string;
  // ... other fields as needed
}

export function useFeaturedSchools(limit: number = 6) {
  return useQuery({
    queryKey: ['featuredSchools', limit],
    queryFn: async (): Promise<School[]> => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('status', 'Approved')
        .eq('featured', true)
        .order('featured_priority', { ascending: true, nullsFirst: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching featured schools:', error);
        throw error;
      }
      
      return (data || []).map(school => ({
        ...school,
        author_id: school.author_id || ''
      })) as School[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
