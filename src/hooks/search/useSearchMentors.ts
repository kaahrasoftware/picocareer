import { supabase } from "@/integrations/supabase/client";
import type { MentorSearchResult } from "@/types/search/types";

export const searchMentors = async (searchTerm: string): Promise<MentorSearchResult[]> => {
  const searchTermLower = searchTerm.toLowerCase();
  
  const { data: mentors, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      full_name,
      avatar_url,
      position,
      highest_degree,
      skills,
      tools_used,
      keywords,
      bio,
      location,
      fields_of_interest,
      company:companies(name),
      school:schools(name),
      academic_major:majors!profiles_academic_major_id_fkey(title)
    `)
    .eq('user_type', 'mentor')
    .or(`lower(first_name).ilike.%${searchTermLower}%,lower(last_name).ilike.%${searchTermLower}%,lower(full_name).ilike.%${searchTermLower}%,lower(position).ilike.%${searchTermLower}%,lower(bio).ilike.%${searchTermLower}%,lower(location).ilike.%${searchTermLower}%`)
    .limit(5);

  if (error) throw error;

  return (mentors || []).map(mentor => ({
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
};