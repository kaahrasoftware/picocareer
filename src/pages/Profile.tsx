import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { BookmarksTab } from "@/components/profile/BookmarksTab";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const isMentor = profile?.user_type === "mentor";
  const { trackPageView, trackInteraction } = useAnalytics();
  const location = useLocation();
  const [startTime] = useState(Date.now());

  // Track page view on mount
  useEffect(() => {
    trackPageView(location.pathname);
    
    // Track time spent on unmount
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      trackInteraction(
        'profile-page',
        'page',
        'page_view',
        location.pathname,
        { timeSpent }
      );
    };
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    trackInteraction(
      `tab-${value}`,
      'tab',
      'click',
      location.pathname,
      { tabName: value }
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="grid w-full grid-cols-5 mb-6">
        <Tabs 
          defaultValue="profile" 
          className="col-span-5"
          onValueChange={handleTabChange}
        >
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