import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { BookmarksTab } from "@/components/profile/BookmarksTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  // Set initial tab value based on URL parameter
  const defaultTab = tabFromUrl || 'profile';

  // Ensure profile data is available before rendering tabs
  if (!profile) {
    return null;
  }

  const tabItems = [
    { value: "profile", label: "Profile" },
    ...(isAdmin ? [{ value: "dashboard", label: "Dashboard" }] : []),
    { value: "calendar", label: "Calendar" },
    ...(isMentor ? [{ value: "mentor", label: "Mentor" }] : []),
    { value: "bookmarks", label: "Bookmarks" },
    { value: "settings", label: "Settings" }
  ];

  return (
    <Tabs 
      defaultValue={defaultTab}
      className="w-full"
      onValueChange={onTabChange}
    >
      <TabsList 
        className={`grid w-full ${
          isMobile 
            ? 'grid-cols-2 gap-2 mb-6' 
            : `grid-cols-${isAdmin ? '6' : '5'}`
        }`}
      >
        {tabItems.map(({ value, label }) => (
          <TabsTrigger 
            key={value} 
            value={value}
            className={isMobile ? 'text-sm py-2' : ''}
          >
            {label}
          </TabsTrigger>
        ))}
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