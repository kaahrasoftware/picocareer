
import React from "react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { SkillsList } from "@/components/profile/SkillsList";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Globe, Share2, CheckCircle, Clock } from "lucide-react";
import { StudentStatusBadge } from "./StudentStatusBadge";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  academic_major: string | null;
  school_name: string | null;
  position: string | null;
  company_name: string | null;
  skills: string[] | null;
  bio?: string;
  location?: string;
  user_type?: string;
  years_of_experience?: number;
  created_at?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  student_nonstudent?: string | null;
}

interface ProfileHeaderProps {
  profile: Profile | null;
  session?: any;
  onShare?: () => void;
}

export function ProfileHeader({
  profile,
  onShare
}: ProfileHeaderProps) {
  const { session } = useAuthSession();

  if (!profile) {
    return (
      <div className="animate-pulse">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === profile.id;
  const isMentor = profile.user_type === 'mentor';

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      profile.avatar_url = url;
    }
  };

  const getMemberSince = () => {
    if (!profile.created_at) return null;
    const date = new Date(profile.created_at);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-4">
      <div className="flex items-start gap-4">
        {/* Left Section - Avatar */}
        <div className="flex-shrink-0">
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
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                <CheckCircle className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Main Info */}
        <div className="flex-1 min-w-0">
          {/* Name & Title */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-foreground truncate">
                {profile.full_name}
              </h1>
              <div className="flex items-center gap-1 flex-wrap">
                {isMentor && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    Mentor
                  </Badge>
                )}
                <StudentStatusBadge 
                  status={profile.student_nonstudent} 
                  profileId={profile.id} 
                  isOwnProfile={isOwnProfile} 
                />
              </div>
            </div>
            
            {(profile.position || profile.academic_major) && (
              <p className="text-sm text-muted-foreground">
                {profile.position || profile.academic_major}
                {(profile.company_name || profile.school_name) && (
                  <span> at {profile.company_name || profile.school_name}</span>
                )}
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.years_of_experience && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{profile.years_of_experience} years experience</span>
              </div>
            )}
            
            {getMemberSince() && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Member since {getMemberSince()}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {profile.website_url && (
              <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3 w-3" />
                </a>
              </Button>
            )}
            {profile.linkedin_url && (
              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </Button>
            )}
            {profile.github_url && (
              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Right Section - Share Button Only */}
        <div className="flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onShare} className="h-8">
            <Share2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-3 pt-3 border-t">
        <SkillsList />
      </div>
    </div>
  );
}
