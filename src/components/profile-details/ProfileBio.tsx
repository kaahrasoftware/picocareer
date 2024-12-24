import { EditableField } from "@/components/profile/EditableField";

interface ProfileBioProps {
  bio: string | null;
  profileId: string;
}

export function ProfileBio({ bio, profileId }: ProfileBioProps) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">About</h4>
      <EditableField
        label="Bio"
        value={bio}
        fieldName="bio"
        profileId={profileId}
      />
    </div>
  );
}