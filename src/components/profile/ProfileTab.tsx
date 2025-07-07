
import React from 'react';
import { MenteeProfileTabs } from './mentee/MenteeProfileTabs';
import { MentorProfileTabs } from './mentor/MentorProfileTabs';
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  if (profile.user_type === 'mentor') {
    return <MentorProfileTabs profile={profile} />;
  }

  return <MenteeProfileTabs profile={profile} />;
}
