
import type { Database } from "@/integrations/supabase/types";

type UserType = Database["public"]["Enums"]["user_type"];

export function useMentorDataFormatter() {
  const formatMentorData = (data: any, userId: string) => {
    return {
      id: userId,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      avatar_url: data.avatar_url,
      bio: data.bio.trim(),
      years_of_experience: Number(data.years_of_experience),
      linkedin_url: data.linkedin_url.trim(),
      github_url: data.github_url?.trim() || null,
      website_url: data.website_url?.trim() || null,
      skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
      tools_used: data.tools_used.split(',').map((s: string) => s.trim()).filter(Boolean),
      keywords: data.keywords.split(',').map((s: string) => s.trim()).filter(Boolean),
      fields_of_interest: data.fields_of_interest.split(',').map((s: string) => s.trim()).filter(Boolean),
      highest_degree: data.highest_degree,
      position: data.position,
      company_id: data.company_id,
      school_id: data.school_id,
      academic_major_id: data.academic_major_id,
      location: data.location.trim(),
      user_type: 'mentor' as UserType,
      X_url: data.X_url?.trim() || null,
      facebook_url: data.facebook_url?.trim() || null,
      instagram_url: data.instagram_url?.trim() || null,
      tiktok_url: data.tiktok_url?.trim() || null,
      youtube_url: data.youtube_url?.trim() || null,
      languages: data.languages ? 
        data.languages.split(',')
          .map((lang: string) => lang.trim())
          .filter(Boolean)
        : null,
      onboarding_status: 'Pending' as const,
      background_check_consent: data.background_check_consent
    };
  };

  return { formatMentorData };
}
