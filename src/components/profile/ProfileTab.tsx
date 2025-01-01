import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { EditableField } from "@/components/profile/EditableField";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { Card } from "@/components/ui/card";
import { ProfessionalSection } from "./sections/ProfessionalSection";
import { EducationSection } from "./sections/EducationSection";
import { SocialSection } from "./sections/SocialSection";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  if (!profile) return null;

  const isMentor = profile.user_type === 'mentor';

  const renderTags = (items: string[] | null, bgColor: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge 
            key={`${item}-${index}`}
            className={`${bgColor} text-gray-700 hover:${bgColor}`}
          >
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <EditableField
              label="First Name"
              value={profile.first_name}
              fieldName="first_name"
              profileId={profile.id}
              placeholder="Add your first name"
            />
            <EditableField
              label="Last Name"
              value={profile.last_name}
              fieldName="last_name"
              profileId={profile.id}
              placeholder="Add your last name"
            />
          </div>
        </div>
      </div>

      <ProfileBio 
        bio={profile.bio} 
        profileId={profile.id}
      />

      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <EditableField
            label="Location"
            value={profile.location}
            fieldName="location"
            profileId={profile.id}
            placeholder="Add your location"
          />
          <EditableField
            label="Languages"
            value={profile.languages?.join(", ")}
            fieldName="languages"
            profileId={profile.id}
            placeholder="Add languages (comma-separated)"
          />
        </div>
      </div>

      {/* Skills and Expertise Section */}
      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Skills & Expertise</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Skills</label>
            {renderTags(profile.skills, "bg-[#F2FCE2]")}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tools Used</label>
            {renderTags(profile.tools_used, "bg-[#D3E4FD]")}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Keywords</label>
            {renderTags(profile.keywords, "bg-[#FFDEE2]")}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Fields of Interest</label>
            {renderTags(profile.fields_of_interest, "bg-[#E5DEFF]")}
          </div>
        </div>
      </div>

      {isMentor && (
        <>
          <ProfessionalSection 
            position={profile.position}
            companyId={profile.company_id}
            yearsOfExperience={profile.years_of_experience}
            skills={profile.skills}
            toolsUsed={profile.tools_used}
            keywords={profile.keywords}
            fieldsOfInterest={profile.fields_of_interest}
            profileId={profile.id}
          />

          <EducationSection 
            academicMajorId={profile.academic_major_id}
            highestDegree={profile.highest_degree}
            schoolId={profile.school_id}
            profileId={profile.id}
          />

          <SocialSection 
            linkedinUrl={profile.linkedin_url}
            githubUrl={profile.github_url}
            websiteUrl={profile.website_url}
            xUrl={profile.X_url}
            facebookUrl={profile.facebook_url}
            tiktokUrl={profile.tiktok_url}
            youtubeUrl={profile.youtube_url}
            instagramUrl={profile.instagram_url}
            profileId={profile.id}
          />
        </>
      )}
    </div>
  );
}