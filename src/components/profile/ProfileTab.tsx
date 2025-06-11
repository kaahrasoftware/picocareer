
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { EditableField } from "@/components/profile/EditableField";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { Card } from "@/components/ui/card";
import { ProfessionalSection } from "./sections/ProfessionalSection";
import { EducationSection } from "./sections/EducationSection";
import { SocialSection } from "./sections/SocialSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";
import { MenteeProfileTabs } from "./mentee/MenteeProfileTabs";

interface ProfileTabProps {
  profile: Profile | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  if (!profile) return null;

  const isMentor = profile.user_type === 'mentor';
  const isStudent = profile.student_nonstudent === 'Student';

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // If user has student status, use the comprehensive student profile system
  if (isStudent) {
    return <MenteeProfileTabs profile={profile} isEditing={isEditing} onEditToggle={handleEditToggle} />;
  }

  // Keep existing mentor/admin profile structure
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
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleEditToggle}
          variant={isEditing ? "destructive" : "default"}
        >
          {isEditing ? "Close Editing" : "Edit Profile"}
        </Button>
      </div>

      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <EditableField
              label="First Name"
              value={profile.first_name}
              fieldName="first_name"
              profileId={profile.id}
              placeholder="Add your first name"
              isEditing={isEditing}
            />
            <EditableField
              label="Last Name"
              value={profile.last_name}
              fieldName="last_name"
              profileId={profile.id}
              placeholder="Add your last name"
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>

      <ProfileBio 
        bio={profile.bio} 
        profileId={profile.id}
        isEditing={isEditing}
      />

      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <EditableField
            label="Location"
            value={profile.location}
            fieldName="location"
            profileId={profile.id}
            placeholder="Add your location"
            isEditing={isEditing}
          />
          <EditableField
            label="Languages"
            value={(profile as any).languages?.join(", ")}
            fieldName="languages"
            profileId={profile.id}
            placeholder="Add languages (comma-separated)"
            isEditing={isEditing}
          />
        </div>
      </div>

      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Skills & Expertise</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Skills</label>
            {isEditing ? (
              <EditableField
                label=""
                value={profile.skills?.join(", ")}
                fieldName="skills"
                profileId={profile.id}
                placeholder="Add skills (comma-separated)"
                isEditing={isEditing}
              />
            ) : (
              renderTags(profile.skills, "bg-[#F2FCE2]")
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tools Used</label>
            {isEditing ? (
              <EditableField
                label=""
                value={profile.tools_used?.join(", ")}
                fieldName="tools_used"
                profileId={profile.id}
                placeholder="Add tools (comma-separated)"
                isEditing={isEditing}
              />
            ) : (
              renderTags(profile.tools_used, "bg-[#D3E4FD]")
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Keywords</label>
            {isEditing ? (
              <EditableField
                label=""
                value={profile.keywords?.join(", ")}
                fieldName="keywords"
                profileId={profile.id}
                placeholder="Add keywords (comma-separated)"
                isEditing={isEditing}
              />
            ) : (
              renderTags(profile.keywords, "bg-[#FFDEE2]")
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Fields of Interest</label>
            {isEditing ? (
              <EditableField
                label=""
                value={profile.fields_of_interest?.join(", ")}
                fieldName="fields_of_interest"
                profileId={profile.id}
                placeholder="Add fields of interest (comma-separated)"
                isEditing={isEditing}
              />
            ) : (
              renderTags(profile.fields_of_interest, "bg-[#E5DEFF]")
            )}
          </div>
        </div>
      </div>

      {isMentor && (
        <>
          <ProfessionalSection 
            position={profile.position}
            companyId={profile.company_id}
            yearsOfExperience={profile.years_of_experience}
            profileId={profile.id}
            isEditing={isEditing}
          />

          <EducationSection 
            academicMajorId={profile.academic_major_id}
            highestDegree={profile.highest_degree}
            schoolId={profile.school_id}
            profileId={profile.id}
            isEditing={isEditing}
          />

          <SocialSection 
            linkedinUrl={profile.linkedin_url}
            githubUrl={profile.github_url}
            websiteUrl={profile.website_url}
            xUrl={(profile as any).X_url}
            facebookUrl={(profile as any).facebook_url}
            tiktokUrl={(profile as any).tiktok_url}
            youtubeUrl={(profile as any).youtube_url}
            instagramUrl={(profile as any).instagram_url}
            profileId={profile.id}
            isEditing={isEditing}
          />
        </>
      )}
    </div>
  );
}
