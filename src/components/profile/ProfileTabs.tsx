
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenteeProfileTabs } from './mentee/MenteeProfileTabs';
import { MentorProfileTabs } from './mentor/MentorProfileTabs';
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profile: Profile | null;
  isEditing?: boolean;
  onTabChange?: (value: string) => void;
  context?: 'student' | 'default';
}

export function ProfileTabs({ profile, isEditing = false, onTabChange, context = 'default' }: ProfileTabsProps) {
  // Add defensive check to prevent rendering if profile is null/undefined
  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Profile data not available</p>
      </div>
    );
  }

  // If context is 'student', always show MenteeProfileTabs regardless of user_type
  if (context === 'student') {
    return <MenteeProfileTabs profile={profile} isEditing={isEditing} onTabChange={onTabChange} />;
  }

  // Mentors should always get MentorProfileTabs (when not in student context)
  if (profile.user_type === 'mentor') {
    return <MentorProfileTabs profile={profile} isEditing={isEditing} onTabChange={onTabChange} />;
  }

  // Students and mentees get MenteeProfileTabs
  const showMenteeTabs = profile.user_type === 'mentee' || 
                        profile.student_nonstudent === 'Student';

  if (showMenteeTabs) {
    return <MenteeProfileTabs profile={profile} isEditing={isEditing} onTabChange={onTabChange} />;
  }

  // Default fallback for other user types - show basic profile info
  return (
    <div className="p-6 bg-muted rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Profile</h3>
      <p className="text-muted-foreground">
        Basic profile information for {profile.first_name} {profile.last_name}
      </p>
    </div>
  );
}
