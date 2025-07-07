
import React from 'react';
import { ProfileView } from '@/components/profile-details/ProfileView';
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  return <ProfileView profile={profile} />;
}
