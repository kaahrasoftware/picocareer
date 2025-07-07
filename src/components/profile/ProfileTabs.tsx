
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenteeProfileTabs } from './mentee/MenteeProfileTabs';
import { MentorProfileTabs } from './mentor/MentorProfileTabs';
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profile: Profile;
  isEditing?: boolean;
  onTabChange?: (value: string) => void;
}

export function ProfileTabs({ profile, isEditing = false, onTabChange }: ProfileTabsProps) {
  if (profile?.user_type === 'mentor') {
    return <MentorProfileTabs profile={profile} isEditing={isEditing} onTabChange={onTabChange} />;
  }

  return <MenteeProfileTabs profile={profile} isEditing={isEditing} onTabChange={onTabChange} />;
}
