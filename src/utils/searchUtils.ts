import { supabase } from "@/integrations/supabase/client";

export const searchMentors = async (value: string) => {
  const searchValue = encodeURIComponent(value.toLowerCase());
  
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
    .or(`first_name.ilike.%${searchValue}%,last_name.ilike.%${searchValue}%,full_name.ilike.%${searchValue}%,bio.ilike.%${searchValue}%,location.ilike.%${searchValue}%`)
    .limit(5);
};

export const searchCareers = async (value: string) => {
  const searchValue = encodeURIComponent(value.toLowerCase());
  
  return supabase
    .from('careers')
    .select('*')
    .eq('complete_career', true)
    .or(`title.ilike.%${searchValue}%,description.ilike.%${searchValue}%`)
    .limit(5);
};

export const searchMajors = async (value: string) => {
  const searchValue = encodeURIComponent(value.toLowerCase());
  
  return supabase
    .from('majors')
    .select('*')
    .or(`title.ilike.%${searchValue}%,description.ilike.%${searchValue}%`)
    .limit(5);
};