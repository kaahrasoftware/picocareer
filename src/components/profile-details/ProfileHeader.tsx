import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Award, MapPin } from "lucide-react";

interface ProfileHeaderProps {
  profile: {
    avatar_url: string | null;
    full_name: string | null;
    position: string | null;
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    location?: string | null;
    top_mentor?: boolean | null;
  } | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  if (!profile) return null;

  const displayTitle = profile.position || profile.academic_major || "No position/major set";
  const displaySubtitle = profile.position 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  return (
    <div className="flex items-center gap-6 ml-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
        <div className="absolute inset-[4px] rounded-full bg-background" />
        <Avatar className="h-24 w-24 relative">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
          <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">{profile.full_name}</h2>
          {profile.top_mentor ? (
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Top Mentor
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
              mentor
            </Badge>
          )}
        </div>
        <p className="text-lg font-medium text-foreground/90">{displayTitle}</p>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            {profile.position ? (
              <Building2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{displaySubtitle}</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}