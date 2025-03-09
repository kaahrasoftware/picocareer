
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileView } from "../ProfileView";
import type { Profile } from "@/types/database/profiles";

interface ProfileOverviewTabProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
  };
}

export function ProfileOverviewTab({ profile }: ProfileOverviewTabProps) {
  return (
    <ScrollArea className="h-full">
      <div className="px-1 sm:px-2">
        <ProfileView profile={profile} />
      </div>
    </ScrollArea>
  );
}
