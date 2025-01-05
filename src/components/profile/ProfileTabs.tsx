import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { CalendarTab } from "./CalendarTab";
import { MentorTab } from "./MentorTab";
import { DashboardTab } from "./DashboardTab";
import { BookmarksTab } from "./BookmarksTab";
import { SettingsTab } from "./SettingsTab";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profile: Profile | null;
  session: Session | null;
}

export function ProfileTabs({ profile, session }: ProfileTabsProps) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!profile) return null;

  return (
    <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        {profile.user_type === 'mentor' && (
          <TabsTrigger value="mentor">Mentor</TabsTrigger>
        )}
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <ProfileTab profile={profile} session={session} />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        <CalendarTab profile={profile} />
      </TabsContent>

      {profile.user_type === 'mentor' && (
        <TabsContent value="mentor" className="space-y-4">
          <MentorTab profile={profile} />
        </TabsContent>
      )}

      <TabsContent value="dashboard" className="space-y-4">
        <DashboardTab profile={profile} />
      </TabsContent>

      <TabsContent value="bookmarks" className="space-y-4">
        <BookmarksTab profile={profile} />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <SettingsTab profile={profile} />
      </TabsContent>
    </Tabs>
  );
}