import React from "react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { MapPin, Calendar, Share2 } from "lucide-react";
import { useProfileManager } from "@/hooks/useProfileManager";
import type { Profile } from "@/types/database/profiles";
import type { Session } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  profile: Profile;
  session: Session | null;
  onShare?: () => void;
}

export function ProfileHeader({ profile, session, onShare }: ProfileHeaderProps) {
  const { updateAvatar } = useProfileManager(profile);

  // Show loading state if profile data is not available
  if (!profile) {
    return (
      <div className="w-full py-8 flex justify-center">
        <PageLoader isLoading={true} variant="default" />
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === profile.id;
  const isMentor = profile.user_type === 'mentor';

  const handleAvatarUpdate = async (url: string) => {
    await updateAvatar(url);
  };

  const getMemberSince = (): string | null => {
    if (!profile.created_at) return null;
    try {
      const date = new Date(profile.created_at);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
          <div className="relative">
            <ProfileAvatar 
              avatarUrl={profile.avatar_url} 
              imageAlt={profile.full_name || profile.email} 
              size="lg" 
              userId={profile.id} 
              editable={isOwnProfile} 
              onAvatarUpdate={handleAvatarUpdate} 
            />
            {isMentor && (
              <Badge 
                variant="secondary" 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground"
              >
                Mentor
              </Badge>
            )}
          </div>
          
          <div className="flex-1 text-center lg:text-left space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email}
              </h1>
              {profile.position && (
                <p className="text-lg text-muted-foreground font-medium">
                  {profile.position}
                </p>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {getMemberSince() && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {getMemberSince()}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-background/50 rounded-lg p-3 mt-4">
                <p className="text-sm text-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {profile.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}