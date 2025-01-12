import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { CalendarTab } from "./CalendarTab";
import { BookmarksTab } from "./BookmarksTab";
import { SettingsTab } from "./SettingsTab";
import { MentorTab } from "./MentorTab";
import { WalletTab } from "./WalletTab";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profile: Profile | null;
  isMentor: boolean;
  onTabChange?: (value: string) => void;
}

export function ProfileTabs({ profile, isMentor, onTabChange }: ProfileTabsProps) {
  if (!profile) return null;

  return (
    <Tabs
      defaultValue="profile"
      className="w-full"
      onValueChange={onTabChange}
    >
      <TabsList className="grid w-full grid-cols-6 mb-8">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="wallet">Wallet</TabsTrigger>
        <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        {isMentor && <TabsTrigger value="mentor">Mentor</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <ProfileTab profile={profile} />
      </TabsContent>

      <TabsContent value="calendar" className="mt-0">
        <CalendarTab />
      </TabsContent>

      <TabsContent value="wallet" className="mt-0">
        <WalletTab userId={profile.id} />
      </TabsContent>

      <TabsContent value="bookmarks" className="mt-0">
        <BookmarksTab />
      </TabsContent>

      <TabsContent value="settings" className="mt-0">
        <SettingsTab />
      </TabsContent>

      {isMentor && (
        <TabsContent value="mentor" className="mt-0">
          <MentorTab profile={profile} />
        </TabsContent>
      )}
    </Tabs>
  );
}