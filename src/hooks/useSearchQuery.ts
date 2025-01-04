import { supabase } from "@/integrations/supabase/client";

export const useSearchQuery = () => {
  const searchMentors = async (value: string) => {
    return supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        position,
        location,
        bio,
        skills,
        tools_used,
        keywords,
        fields_of_interest,
        highest_degree,
        company:companies(name),
        school:schools(name),
        academic_major:majors!profiles_academic_major_id_fkey(title),
        career:careers!profiles_position_fkey(title)
      `)
      .eq('user_type', 'mentor')
      .or(`first_name.ilike.%${value}%,last_name.ilike.%${value}%,full_name.ilike.%${value}%,bio.ilike.%${value}%,location.ilike.%${value}%`)
      .or(`skills.cs.{${value.toLowerCase()}},tools_used.cs.{${value.toLowerCase()}},keywords.cs.{${value.toLowerCase()}},fields_of_interest.cs.{${value.toLowerCase()}}`)
      .limit(5);
  };

  const searchCareers = async (value: string) => {
    return supabase
      .from('careers')
      .select('*')
      .eq('complete_career', true)
      .or(`title.ilike.%${value}%,description.ilike.%${value}%`)
      .or(`keywords.cs.{${value.toLowerCase()}}`)
      .or(`required_skills.cs.{${value.toLowerCase()}}`)
      .or(`required_tools.cs.{${value.toLowerCase()}}`)
      .limit(5);
  };

  const searchMajors = async (value: string) => {
    return supabase
      .from('majors')
      .select('*')
      .or(`title.ilike.%${value}%,description.ilike.%${value}%`)
      .or(`learning_objectives.cs.{${value.toLowerCase()}}`)
      .or(`common_courses.cs.{${value.toLowerCase()}}`)
      .or(`skill_match.cs.{${value.toLowerCase()}}`)
      .or(`tools_knowledge.cs.{${value.toLowerCase()}}`)
      .limit(5);
  };

  return {
    searchMentors,
    searchCareers,
    searchMajors
  };
};