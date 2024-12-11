import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeaturedMajors = () => {
  return useQuery({
    queryKey: ['featuredMajors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('featured', true)
        .limit(4);

      if (error) throw error;
      
      // Transform the data to match the expected Major type
      return data.map(major => ({
        title: major.title,
        description: major.description,
        users: `${Math.floor(Math.random() * 900 + 100)}K`, // Placeholder
        imageUrl: major.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        relatedCareers: major.career_opportunities || [],
        requiredCourses: major.required_courses || [],
        averageGPA: major.average_gpa?.toString() || "3.0+"
      }));
    }
  });
};