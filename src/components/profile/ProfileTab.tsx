import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";
import { ProfileLinks } from "@/components/profile-details/ProfileLinks";
import { ProfileSkills } from "@/components/profile-details/ProfileSkills";
import { ProfileEducation } from "@/components/profile-details/ProfileEducation";
import { ProfessionalInfoSection } from "@/components/profile/sections/ProfessionalInfoSection";
import { PersonalInfoSection } from "@/components/profile/sections/PersonalInfoSection";

export function ProfileTab() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const isMentee = profile.user_type === "mentee";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ProfileHeader profile={profile} session={session} />
      
      <PersonalInfoSection profile={profile} />
      
      <ProfileBio 
        bio={profile.bio} 
        profileId={profile.id} 
      />
      
      <ProfessionalInfoSection 
        profile={profile}
        isMentee={isMentee}
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