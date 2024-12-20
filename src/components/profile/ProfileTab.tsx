import React from "react";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { ProfileEducation } from "@/components/profile-details/ProfileEducation";
import { ProfileLinks } from "@/components/profile-details/ProfileLinks";
import { ProfileSkills } from "@/components/profile-details/ProfileSkills";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  if (!profile) return null;
  
  const isMentee = profile.user_type === 'mentee';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column - Bio and Links */}
      <div className="space-y-6">
        <ProfileBio bio={profile.bio} />
        <ProfileLinks
          linkedin_url={profile.linkedin_url}
          github_url={profile.github_url}
          website_url={profile.website_url}
        />
      </div>

      {/* Middle Column - Education and Location */}
      <div className="space-y-6">
        <ProfileEducation
          academic_major={profile.academic_major}
          highest_degree={isMentee ? null : profile.highest_degree}
        />
        {profile.location && (
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-2">Location</h4>
            <p className="text-muted-foreground">{profile.location}</p>
          </div>
        )}
      </div>

      {/* Right Column - Skills and Professional Info (for mentors) */}
      <div className="space-y-6">
        {!isMentee && profile.skills && profile.skills.length > 0 && (
          <ProfileSkills
            skills={profile.skills}
            tools={profile.tools_used}
            keywords={profile.keywords}
          />
        )}
        {!isMentee && (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Professional Experience</h4>
            {profile.position && (
              <div className="text-muted-foreground">
                <span className="font-medium">Position:</span> {profile.position}
              </div>
            )}
            {profile.company_name && (
              <div className="text-muted-foreground">
                <span className="font-medium">Company:</span> {profile.company_name}
              </div>
            )}
            {profile.years_of_experience !== null && (
              <div className="text-muted-foreground">
                <span className="font-medium">Years of Experience:</span> {profile.years_of_experience}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}