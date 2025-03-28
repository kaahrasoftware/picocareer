
import { MapPin } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface PersonalSectionViewProps {
  profile: Profile;
}

export function PersonalSectionView({ profile }: PersonalSectionViewProps) {
  const hasPersonalInfo = profile.bio || profile.location;

  if (!hasPersonalInfo) {
    return null;
  }

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">About</h4>
      
      <div className="space-y-4">
        {profile.bio && (
          <div className="text-muted-foreground">
            <p>{profile.bio}</p>
          </div>
        )}

        {profile.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{profile.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
