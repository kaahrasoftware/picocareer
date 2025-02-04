import { Badge } from "@/components/ui/badge";
import { Award, Share2 } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { BookmarkButton } from "./BookmarkButton";
import { ProfileInfo } from "./ProfileInfo";
import { Button } from "@/components/ui/button";
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
  onShare: () => void;
}

export function ProfileHeader({ profile, session, onShare }: ProfileHeaderProps) {
  if (!profile) return null;

  const isOwnProfile = session?.user?.id === profile.id;

  // Helper function to determine badge content and style
  const getBadgeContent = () => {
    if (profile.user_type !== 'mentor') return null;
    
    if (profile.top_mentor) {
      return {
        content: (
          <>
            <Award className="h-3 w-3" />
            Top Mentor
          </>
        ),
        className: "bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1"
      };
    }
    
    return {
      content: "mentor",
      className: "bg-primary/20 text-primary hover:bg-primary/30"
    };
  };

  const badge = getBadgeContent();

  return (
    <div className="flex items-start gap-6 sm:ml-6">
      {/* Avatar Section */}
      <div className="flex-shrink-0">
        <ProfileAvatar 
          avatarUrl={profile.avatar_url}
          profileId={profile.id}
          size="md"
          editable={isOwnProfile}
        />
      </div>

      {/* Profile Information Section */}
      <div className="flex-1 min-w-0">
        {/* Name and Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <h2 className="text-base sm:text-2xl font-bold leading-tight sm:leading-normal break-words max-w-[200px] sm:max-w-none">
              {profile.full_name}
            </h2>
            
            {/* Render Badge if applicable */}
            {badge && (
              <Badge 
                variant="secondary" 
                className={badge.className}
              >
                {badge.content}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              className="h-9 w-9"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <BookmarkButton 
              profileId={profile.id} 
              session={session} 
            />
          </div>
        </div>

        {/* Professional and Academic Information */}
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