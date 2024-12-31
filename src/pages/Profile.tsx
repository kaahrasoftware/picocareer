import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { BookmarksTab } from "@/components/profile/BookmarksTab";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const isMentor = profile?.user_type === "mentor";

  return (
    <div className="container py-6 space-y-6">
      <div className="grid w-full grid-cols-5 mb-6">
        <Tabs defaultValue="profile" className="col-span-5">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            {isMentor && <TabsTrigger value="mentor">Mentor</TabsTrigger>}
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab profile={profile || null} />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarTab />
          </TabsContent>

          {isMentor && (
            <TabsContent value="mentor" className="space-y-6">
              <MentorTab profile={profile || null} />
            </TabsContent>
          )}

          <TabsContent value="bookmarks" className="space-y-6">
            <BookmarksTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}