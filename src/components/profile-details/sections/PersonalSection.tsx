import { User2 } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface PersonalSectionProps {
  profile: Profile;
}

export function PersonalSection({ profile }: PersonalSectionProps) {
  return (
    <>
      <div className="bg-muted rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 w-full">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <User2 className="h-4 w-4" />
          <h4 className="font-semibold text-sm sm:text-base">Personal Information</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">First Name</p>
            <p className="text-sm sm:text-base">{profile.first_name || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Last Name</p>
            <p className="text-sm sm:text-base">{profile.last_name || "Not set"}</p>
          </div>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-3 sm:p-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <User2 className="h-4 w-4" />
          <h4 className="font-semibold text-sm sm:text-base">About</h4>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">{profile.bio || "No bio provided"}</p>
      </div>
    </>
  );
}