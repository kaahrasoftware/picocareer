import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { BookmarksTab } from "@/components/profile/BookmarksTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { User, LayoutDashboard, Calendar, GraduationCap, Bookmark, Settings } from "lucide-react";
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
        <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        
        {isAdmin && (
          <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
        )}
        
        <TabsTrigger value="calendar" className="flex flex-col sm:flex-row items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Calendar</span>
        </TabsTrigger>
        
        {isMentor && (
          <TabsTrigger value="mentor" className="flex flex-col sm:flex-row items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Mentor</span>
          </TabsTrigger>
        )}
        
        <TabsTrigger value="bookmarks" className="flex flex-col sm:flex-row items-center gap-1">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">Bookmarks</span>
        </TabsTrigger>
        
        <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
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