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

  return (
    <Tabs 
      defaultValue="profile" 
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

      <TabsContent value="profile" className="space-y-6">
        <ProfileTab profile={profile} />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab />
        </TabsContent>
      )}

      <TabsContent value="calendar" className="space-y-6">
        <CalendarTab />
      </TabsContent>

      {isMentor && profile && (
        <TabsContent value="mentor" className="space-y-6">
          <MentorTab profile={profile} />
        </TabsContent>
      )}

      <TabsContent value="bookmarks" className="space-y-6">
        <BookmarksTab />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}