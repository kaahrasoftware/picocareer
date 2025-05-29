
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { CalendarTab } from "./CalendarTab";
import { MentorTab } from "./MentorTab";
import { BookmarksTabWrapper } from "./bookmarks/BookmarksTabWrapper";
import { DashboardTab } from "./DashboardTab";
import { SettingsTab } from "./SettingsTab";
import { WalletTab } from "./WalletTab";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSearchParams } from "react-router-dom";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profileId?: string;
}

export function ProfileTabs({ profileId }: ProfileTabsProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  // Determine if this is the current user's profile
  const isOwnProfile = !profileId || profileId === session?.user?.id;
  const isMentor = profile?.user_type === 'mentor';
  const isAdmin = profile?.user_type === 'admin';

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        )}
        {isOwnProfile && isMentor && (
          <TabsTrigger value="mentor">Mentor</TabsTrigger>
        )}
        {isOwnProfile && (
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        )}
        {isOwnProfile && isAdmin && (
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        )}
        {isOwnProfile && isAdmin && (
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        )}
        {isOwnProfile && (
          <TabsTrigger value="settings">Settings</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileTab profile={profile} />
      </TabsContent>

      {isOwnProfile && (
        <TabsContent value="calendar" className="mt-6">
          <CalendarTab profile={profile} />
        </TabsContent>
      )}

      {isOwnProfile && isMentor && (
        <TabsContent value="mentor" className="mt-6">
          <MentorTab />
        </TabsContent>
      )}

      {isOwnProfile && (
        <TabsContent value="bookmarks" className="mt-6">
          <BookmarksTabWrapper profileId={session?.user?.id || ''} />
        </TabsContent>
      )}

      {isOwnProfile && isAdmin && (
        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab />
        </TabsContent>
      )}

      {isOwnProfile && isAdmin && (
        <TabsContent value="wallet" className="mt-6">
          <WalletTab profile={profile} />
        </TabsContent>
      )}

      {isOwnProfile && (
        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
      )}
    </Tabs>
  );
}
