import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult } from "@/types/search";

export type { SearchResult };

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm) return [];

      const [majorsResponse, careersResponse, mentorsResponse] = await Promise.all([
        // Majors search
        supabase
          .from("majors")
          .select(`
            id,
            title,
            description,
            degree_levels,
            career_opportunities,
            common_courses,
            learning_objectives,
            interdisciplinary_connections,
            job_prospects,
            certifications_to_consider,
            affiliated_programs,
            transferable_skills,
            tools_knowledge,
            skill_match,
            professional_associations,
            common_difficulties,
            majors_to_consider_switching_to
          `)
          .or(
            `title.ilike.%${searchTerm}%,` +
            `description.ilike.%${searchTerm}%,` +
            `job_prospects.ilike.%${searchTerm}%`
          )
          // Array field searches
          .or(`degree_levels.cs.{${searchTerm}}`)
          .or(`career_opportunities.cs.{${searchTerm}}`)
          .or(`common_courses.cs.{${searchTerm}}`)
          .or(`learning_objectives.cs.{${searchTerm}}`)
          .or(`interdisciplinary_connections.cs.{${searchTerm}}`)
          .or(`certifications_to_consider.cs.{${searchTerm}}`)
          .or(`affiliated_programs.cs.{${searchTerm}}`)
          .or(`transferable_skills.cs.{${searchTerm}}`)
          .or(`tools_knowledge.cs.{${searchTerm}}`)
          .or(`skill_match.cs.{${searchTerm}}`)
          .or(`professional_associations.cs.{${searchTerm}}`)
          .or(`common_difficulties.cs.{${searchTerm}}`)
          .or(`majors_to_consider_switching_to.cs.{${searchTerm}}`)
          .limit(5),

        // Careers search
        supabase
          .from("careers")
          .select(`
            id,
            title,
            description,
            salary_range
          `)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5),

        // Mentors search with additional fields
        supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            full_name,
            avatar_url,
            position,
            highest_degree,
            bio,
            location,
            skills,
            tools_used,
            keywords,
            fields_of_interest,
            company:companies(name),
            school:schools(name),
            academic_major:majors!profiles_academic_major_id_fkey(title)
          `)
          .eq('user_type', 'mentor')
          .or(
            `first_name.ilike.%${searchTerm}%,` +
            `last_name.ilike.%${searchTerm}%,` +
            `full_name.ilike.%${searchTerm}%,` +
            `position.ilike.%${searchTerm}%,` +
            `highest_degree.ilike.%${searchTerm}%,` +
            `bio.ilike.%${searchTerm}%,` +
            `location.ilike.%${searchTerm}%`
          )
          // Array field searches
          .or(`skills.cs.{${searchTerm}}`)
          .or(`tools_used.cs.{${searchTerm}}`)
          .or(`keywords.cs.{${searchTerm}}`)
          .or(`fields_of_interest.cs.{${searchTerm}}`)
          .limit(5)
      ]);

      // Handle any errors
      if (majorsResponse.error) throw majorsResponse.error;
      if (careersResponse.error) throw careersResponse.error;
      if (mentorsResponse.error) throw mentorsResponse.error;

      // Transform and combine results
      const majorResults: SearchResult[] = (majorsResponse.data || []).map(major => ({
        id: major.id,
        type: "major" as const,
        title: major.title,
        description: major.description,
        degree_levels: major.degree_levels,
        career_opportunities: major.career_opportunities,
        common_courses: major.common_courses
      }));

      const careerResults: SearchResult[] = (careersResponse.data || []).map(career => ({
        id: career.id,
        type: "career" as const,
        title: career.title,
        description: career.description,
        salary_range: career.salary_range
      }));

      const mentorResults: SearchResult[] = (mentorsResponse.data || []).map(mentor => ({
        id: mentor.id,
        type: "mentor" as const,
        title: mentor.full_name || `${mentor.first_name} ${mentor.last_name}`.trim(),
        description: [
          mentor.position,
          mentor.highest_degree,
          mentor.location,
          mentor.company?.name,
          mentor.school?.name,
          mentor.academic_major?.title
        ].filter(Boolean).join(' • '),
        avatar_url: mentor.avatar_url,
        position: mentor.position,
        company_name: mentor.company?.name,
        skills: mentor.skills,
        tools: mentor.tools_used,
        keywords: mentor.keywords,
        fields_of_interest: mentor.fields_of_interest
      }));

      // Combine all results
      return [...majorResults, ...careerResults, ...mentorResults];
    },
    enabled: searchTerm.length > 2, // Only search when there are at least 3 characters
  });
}