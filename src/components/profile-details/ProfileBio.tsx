import { EditableField } from "@/components/profile/EditableField";

interface ProfileBioProps {
  bio: string | null;
  profileId: string;
}

export function ProfileBio({ bio, profileId }: ProfileBioProps) {
  return (
    <div className="bg-muted rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">About</h4>
        <EditableField
          label="Bio"
          value={bio}
          fieldName="bio"
          profileId={profileId}
          className="text-muted-foreground"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );
}