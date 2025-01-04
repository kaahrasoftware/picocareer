import { supabase } from "@/integrations/supabase/client";

export const searchMentors = async (value: string) => {
  const searchValue = value.toLowerCase();
  
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
      languages,
      company:companies(name),
      school:schools(name),
      academic_major:majors!profiles_academic_major_id_fkey(title),
      career:careers!profiles_position_fkey(title)
    `)
    .eq('user_type', 'mentor')
    .or(
      `first_name.ilike.%${searchValue}%,` +
      `last_name.ilike.%${searchValue}%,` +
      `full_name.ilike.%${searchValue}%,` +
      `bio.ilike.%${searchValue}%,` +
      `location.ilike.%${searchValue}%`
    )
    // Search in array fields using containment
    .or(`skills.cs.{${searchValue}}`)
    .or(`tools_used.cs.{${searchValue}}`)
    .or(`keywords.cs.{${searchValue}}`)
    .or(`fields_of_interest.cs.{${searchValue}}`)
    // Join related tables and search in their text fields using proper aliases
    .or(`companies.name.ilike.%${searchValue}%`)
    .or(`schools.name.ilike.%${searchValue}%`)
    .or(`majors.title.ilike.%${searchValue}%`)
    .or(`careers.title.ilike.%${searchValue}%`)
    .limit(5);
};

export const searchCareers = async (value: string) => {
  const searchValue = value.toLowerCase();
  
  return supabase
    .from('careers')
    .select('*')
    .eq('complete_career', true)
    .or(
      `title.ilike.%${searchValue}%,` +
      `description.ilike.%${searchValue}%`
    )
    .or(`keywords.cs.{${searchValue}}`)
    .or(`required_skills.cs.{${searchValue}}`)
    .or(`required_tools.cs.{${searchValue}}`)
    .limit(5);
};

export const searchMajors = async (value: string) => {
  const searchValue = value.toLowerCase();
  
  return supabase
    .from('majors')
    .select('*')
    .or(
      `title.ilike.%${searchValue}%,` +
      `description.ilike.%${searchValue}%`
    )
    .or(`learning_objectives.cs.{${searchValue}}`)
    .or(`common_courses.cs.{${searchValue}}`)
    .or(`skill_match.cs.{${searchValue}}`)
    .or(`tools_knowledge.cs.{${searchValue}}`)
    .limit(5);
};