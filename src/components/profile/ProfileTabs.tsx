import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { BookmarksTab } from "@/components/profile/BookmarksTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profile: Profile | null;
  isMentor: boolean;
  onTabChange: (value: string) => void;
}

export function ProfileTabs({ profile, isMentor, onTabChange }: ProfileTabsProps) {
  const isAdmin = profile?.user_type === 'admin';
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Set initial tab value based on URL parameter
  const defaultTab = tabFromUrl || 'profile';

  // Ensure profile data is available before rendering tabs
  if (!profile) {
    return null;
  }

  return (
    <Tabs 
      defaultValue={defaultTab}
      className="col-span-5"
      onValueChange={onTabChange}
    >
      <TabsList className="grid w-full" style={{ 
        gridTemplateColumns: `repeat(${isAdmin ? 6 : 5}, minmax(0, 1fr))`
      }}>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        {isAdmin && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        {isMentor && <TabsTrigger value="mentor">Mentor</TabsTrigger>}
        <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab profile={profile} />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
      )}

      <TabsContent value="calendar">
        <CalendarTab profile={profile} />
      </TabsContent>

      {isMentor && profile && (
        <TabsContent value="mentor">
          <MentorTab profile={profile} />
        </TabsContent>
      )}

      <TabsContent value="bookmarks">
        <BookmarksTab />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}