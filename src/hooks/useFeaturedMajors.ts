import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeaturedMajors = () => {
  return useQuery({
    queryKey: ['featuredMajors'],
    queryFn: async () => {
      console.log('Fetching featured majors...');
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('featured', true)
        .limit(6);

      if (error) {
        console.error('Error fetching majors:', error);
        throw error;
      }
      
      console.log('Fetched majors:', data);
      
      // Transform the data to match the expected Major type
      return data.map(major => ({
        title: major.title,
        description: major.description,
        users: `${Math.floor(Math.random() * 900 + 100)}K`, // Placeholder for now
        imageUrl: major.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        relatedCareers: major.career_opportunities || [],
        requiredCourses: major.required_courses || [],
        averageGPA: major.average_gpa?.toString() || "3.0+",
        fieldOfStudy: major.field_of_study,
        degreeLevel: major.degree_level
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};