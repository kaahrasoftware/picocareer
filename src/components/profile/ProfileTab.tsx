import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { EducationSection } from "./sections/EducationSection";
import { SocialSection } from "./sections/SocialSection";
import { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) return null;

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEdit}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Cancel Editing
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit Profile
            </>
          )}
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
              isEditing={isEditing}
            />
            <EditableField
              label="Last Name"
              value={profile.last_name}
              fieldName="last_name"
              profileId={profile.id}
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
            isEditing={isEditing}
          />
        </div>
      </div>

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
        xUrl={profile.X_url}
        facebookUrl={profile.facebook_url}
        tiktokUrl={profile.tiktok_url}
        youtubeUrl={profile.youtube_url}
        instagramUrl={profile.instagram_url}
        profileId={profile.id}
        isEditing={isEditing}
      />
    </div>
  );
}