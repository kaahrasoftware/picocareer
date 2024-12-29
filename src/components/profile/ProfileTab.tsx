import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { ProfileEducation } from "@/components/profile-details/ProfileEducation";
import { ProfileSkills } from "@/components/profile-details/ProfileSkills";
import { ProfileLinks } from "@/components/profile-details/ProfileLinks";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
}

export function ProfileTab({ profile }: ProfileTabProps) {
  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-left">Profile Details</h2>
      
      <ProfileBio 
        bio={profile.bio} 
        profileId={profile.id}
      />

      <ProfileEducation
        academic_major={profile.academic_major}
        highest_degree={profile.highest_degree}
        school_name={profile.school_name}
        profileId={profile.id}
      />

      <ProfileSkills
        skills={profile.skills}
        tools={profile.tools_used}
        keywords={profile.keywords}
        fieldsOfInterest={profile.fields_of_interest}
        profileId={profile.id}
      />

      <ProfileLinks
        linkedinUrl={profile.linkedin_url}
        githubUrl={profile.github_url}
        websiteUrl={profile.website_url}
        profileId={profile.id}
      />
    </div>
  );
}