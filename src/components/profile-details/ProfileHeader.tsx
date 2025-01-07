import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { BookmarkButton } from "./BookmarkButton";
import { ProfileInfo } from "./ProfileInfo";
import type { Session } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    user_type?: string | null;
    top_mentor?: boolean | null;
    career_title?: string | null;
    school_name?: string | null;
    company_name?: string | null;
    location?: string | null;
    academic_major?: string | null;
  } | null;
  session: Session | null;
}

export function ProfileHeader({ profile, session }: ProfileHeaderProps) {
  if (!profile) return null;

  // Determine badge type and content
  const renderBadge = () => {
    if (profile.user_type !== 'mentor') return null;
    
    if (profile.top_mentor) {
      return (
        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1">
          <Award className="h-3 w-3" />
          Top Mentor
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
        mentor
      </Badge>
    );
  };

  return (
    <div className="flex items-start gap-6 ml-6">
      {/* Profile Avatar Section */}
      <div className="flex-shrink-0">
        <ProfileAvatar 
          avatarUrl={profile.avatar_url}
          fallback={profile.full_name?.[0] || 'U'}
          size="md"
          editable={false}
        />
      </div>

      {/* Profile Information Section */}
      <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex item from overflowing */}
        {/* Name and Badges Row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h2 className="text-2xl font-bold truncate">
            {profile.full_name}
          </h2>
          {renderBadge()}
          <BookmarkButton profileId={profile.id} session={session} />
        </div>

        {/* Professional and Academic Info */}
        <ProfileInfo 
          careerTitle={profile.career_title}
          companyName={profile.company_name}
          schoolName={profile.school_name}
          location={profile.location}
          academicMajor={profile.academic_major}
        />
      </div>
    </div>
  );
}