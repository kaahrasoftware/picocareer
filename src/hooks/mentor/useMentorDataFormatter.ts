
import { useCallback } from "react";

export function useMentorDataFormatter() {
  const formatMentorData = useCallback((data: any, userId: string) => {
    return {
      id: userId,
      first_name: data.first_name?.trim() || "",
      last_name: data.last_name?.trim() || "",
      email: data.email?.trim() || "",
      avatar_url: data.avatar_url || "",
      bio: data.bio?.trim() || "",
      years_of_experience: Number(data.years_of_experience) || 0,
      linkedin_url: data.linkedin_url?.trim() || null,
      github_url: data.github_url?.trim() || null,
      website_url: data.website_url?.trim() || null,
      skills: data.skills ? 
        data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      tools_used: data.tools_used ? 
        data.tools_used.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      keywords: data.keywords ? 
        data.keywords.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      fields_of_interest: data.fields_of_interest ? 
        data.fields_of_interest.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      highest_degree: null, // Set to null since we removed this field
      position: data.position || "",
      company_id: data.company_id || "",
      school_id: data.school_id || "",
      academic_major_id: data.academic_major_id || "",
      location: data.location?.trim() || "",
      user_type: 'mentor' as const,
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
      onboarding_status: 'Pending' as const
    };
  }, []);

  return { formatMentorData };
}
