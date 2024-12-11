import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'career' | 'major' | 'mentor' | 'blog';
  avatar_url?: string;
  salary_range?: string;
  average_salary?: number;
  field_of_study?: string;
  degree_level?: string;
  image_url?: string;
  required_courses?: string[];
  average_gpa?: number;
  career_opportunities?: string[];
  duration?: string;
}

export const useSearchData = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length <= 2) return [];

      console.log('Searching with query:', query);

      // Search mentors with expanded criteria
      const { data: mentors, error: mentorError } = await supabase
        .from('profiles')
        .select('id, full_name, position, company_name, avatar_url, bio')
        .eq('user_type', 'mentor')
        .or(`full_name.ilike.%${query}%,` +
            `position.ilike.%${query}%,` +
            `company_name.ilike.%${query}%,` +
            `bio.ilike.%${query}%,` +
            `location.ilike.%${query}%,` +
            `skills.cs.{${query}},` +
            `tools_used.cs.{${query}},` +
            `keywords.cs.{${query}},` +
            `fields_of_interest.cs.{${query}}`)
        .limit(5);

      if (mentorError) {
        console.error('Error fetching mentors:', mentorError);
        throw mentorError;
      }

      // Search careers
      const { data: careers, error: careerError } = await supabase
        .from('careers')
        .select('id, title, description, salary_range, average_salary, industry')
        .or(`title.ilike.%${query}%,` +
            `description.ilike.%${query}%,` +
            `industry.ilike.%${query}%,` +
            `required_skills.cs.{${query}},` +
            `required_tools.cs.{${query}},` +
            `keywords.cs.{${query}}`)
        .limit(3);

      if (careerError) {
        console.error('Error fetching careers:', careerError);
        throw careerError;
      }

      // Search majors
      const { data: majors, error: majorError } = await supabase
        .from('majors')
        .select('*')
        .or(`title.ilike.%${query}%,` +
            `description.ilike.%${query}%,` +
            `field_of_study.ilike.%${query}%,` +
            `required_courses.cs.{${query}},` +
            `required_courses.cs.{%${query}%},` + 
            `keywords.cs.{${query}}`)
        .limit(3);

      if (majorError) {
        console.error('Error fetching majors:', majorError);
        throw majorError;
      }

      // Transform mentor results
      const mentorResults = (mentors || []).map(mentor => ({
        id: mentor.id,
        title: mentor.full_name || 'Unknown',
        description: `${mentor.position || 'Mentor'} at ${mentor.company_name || 'Company'}`,
        type: 'mentor' as const,
        avatar_url: mentor.avatar_url
      }));

      // Transform career results
      const careerResults = (careers || []).map(career => ({
        id: career.id,
        title: career.title,
        description: career.description,
        type: 'career' as const,
        salary_range: career.salary_range,
        average_salary: career.average_salary
      }));

      // Transform major results with all fields
      const majorResults = (majors || []).map(major => ({
        id: major.id,
        title: major.title,
        description: major.description,
        type: 'major' as const,
        field_of_study: major.field_of_study,
        degree_level: major.degree_level,
        image_url: major.image_url,
        required_courses: major.required_courses,
        average_gpa: major.average_gpa,
        career_opportunities: major.career_opportunities,
        duration: major.duration
      }));

      return [...mentorResults, ...careerResults, ...majorResults];
    },
    enabled: query.length > 2,
    staleTime: 1000 * 60 // Cache for 1 minute
  });
};