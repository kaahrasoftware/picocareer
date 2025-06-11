
import React from "react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SkillsList } from "@/components/profile/SkillsList";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Globe, MessageCircle, UserPlus, Share2, Edit3, CheckCircle, Clock } from "lucide-react";
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
  const {
    session
  } = useAuthSession();
  if (!profile) {
    return <div className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container py-6 mt-20">
          <div className="animate-pulse">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-muted rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-muted rounded w-1/2" />
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  const isOwnProfile = session?.user?.id === profile.id;
  const isMentor = profile.user_type === 'mentor';

  // Determine primary and secondary display text
  const primaryText = profile.position || profile.academic_major || "No position/major set";
  const secondaryText = profile.position ? profile.company_name || "No company set" : profile.school_name || "No school set";
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
  return <div className="bg-gradient-to-br from-background via-background/95 to-muted/30 backdrop-blur-sm border-b border-border">
      <div className="container py-8 mt-20">
        {/* Cover/Banner Area */}
        
        
        {/* Main Profile Content */}
        <div className="relative -mt-16 bg-background/80 backdrop-blur-md rounded-xl border shadow-lg p-6 py-[20px] my-[10px]">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            
            {/* Left Section - Avatar & Basic Info */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative mb-4">
                <ProfileAvatar avatarUrl={profile.avatar_url} imageAlt={profile.full_name || profile.email} size="lg" userId={profile.id} editable={isOwnProfile} onAvatarUpdate={handleAvatarUpdate} />
                {isMentor && <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>}
              </div>
              
              {/* Status & Availability */}
              
            </div>

            {/* Center Section - Main Info */}
            <div className="flex-1 space-y-4">
              {/* Name & Title */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.full_name}
                  </h1>
                  {isMentor && <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Mentor
                    </Badge>}
                </div>
                
                
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.location && <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>}
                
                {profile.years_of_experience && <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{profile.years_of_experience} years experience</span>
                  </div>}
                
                {getMemberSince() && <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {getMemberSince()}</span>
                  </div>}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {profile.website_url && <Button variant="ghost" size="sm" asChild>
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                    </a>
                  </Button>}
                {profile.linkedin_url && <Button variant="ghost" size="sm" asChild>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>}
                {profile.github_url && <Button variant="ghost" size="sm" asChild>
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  </Button>}
              </div>

              {/* Skills */}
              <SkillsList />
            </div>

            {/* Right Section - Actions */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              {!isOwnProfile && <>
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  {isMentor && <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>}
                  <Button variant="outline" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </>}
              
              {isOwnProfile}
              
              <Button variant="ghost" className="w-full" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          
        </div>
      </div>
    </div>;
}
