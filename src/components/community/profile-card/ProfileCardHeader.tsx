
import { Badge } from "@/components/ui/badge";
import { Award, Building2, GraduationCap, MapPin } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import type { Profile } from "@/types/database/profiles";

interface ProfileCardHeaderProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
}

export function ProfileCardHeader({ profile }: ProfileCardHeaderProps) {
  const displayTitle = profile.career_title || profile.academic_major || "No position/major set";
  const displaySubtitle = profile.career_title 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  return (
    <div className="flex items-start gap-4 mb-4">
      <ProfileAvatar
        avatarUrl={profile.avatar_url}
        imageAlt={profile.full_name || 'User'}
        size="md"
        editable={false}
        fallback={profile.full_name ? profile.full_name[0] : 'U'}
        profileId={profile.id}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {profile.top_mentor && (
            <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Top Mentor
            </Badge>
          )}
        </div>
        <h3 className="font-semibold truncate mb-2">{profile.full_name}</h3>
        <p className="text-sm font-medium mb-1 truncate text-foreground/90">{displayTitle}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {profile.career_title ? (
              <Building2 className="h-3 w-3 flex-shrink-0" />
            ) : (
              <GraduationCap className="h-3 w-3 flex-shrink-0" />
            )}
            <span className="truncate">{displaySubtitle}</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
