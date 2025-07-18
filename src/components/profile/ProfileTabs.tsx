
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenteeProfileTabs } from './mentee/MenteeProfileTabs';
import { MentorProfileTabs } from './mentor/MentorProfileTabs';
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profile: Profile | null;
  isEditing?: boolean;
  onTabChange?: (value: string) => void;
}

export function ProfileTabs({ profile, isEditing = false, onTabChange }: ProfileTabsProps) {
  // Add defensive check to prevent rendering if profile is null/undefined
  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Profile data not available</p>
      </div>
    );
  }

  // Show mentee tabs for mentors, mentees, or students
  const showMenteeTabs = profile.user_type === 'mentee' || 
                        profile.user_type === 'mentor' || 
                        profile.student_nonstudent === 'Student';

  if (profile.user_type === 'mentor' && !showMenteeTabs) {
    return <MentorProfileTabs profile={profile} isEditing={isEditing} onTabChange={onTabChange} />;
  }

  return <MenteeProfileTabs profile={profile} isEditing={isEditing} onTabChange={onTabChange} />;
}
