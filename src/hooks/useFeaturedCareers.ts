import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeaturedCareers = () => {
  return useQuery({
    queryKey: ['featuredCareers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('featured', true)
        .limit(4);

      if (error) throw error;
      
      // Transform the data to match the expected Career type
      return data.map(career => ({
        title: career.title,
        description: career.description,
        users: `${Math.floor(Math.random() * 900 + 100)}K`, // Placeholder
        salary: career.salary_range || "Competitive",
        imageUrl: career.image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        relatedMajors: career.required_education || [],
        relatedCareers: [], // This could be populated from career_major_relations if needed
        skills: career.required_skills || []
      }));
    }
  });
};