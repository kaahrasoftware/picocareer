
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { BookmarksTabWrapper } from "@/components/profile/BookmarksTabWrapper";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { WalletTab } from "@/components/profile/WalletTab";
import { 
  User, 
  Calendar, 
  GraduationCap, 
  Bookmark, 
  Settings,
  Wallet 
} from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabsProps {
  profile: Profile | null;
  isMentor: boolean;
  isAdmin: boolean;
  onTabChange: (value: string) => void;
}

export function ProfileTabs({ profile, isMentor, isAdmin, onTabChange }: ProfileTabsProps) {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const defaultTab = tabFromUrl || 'profile';

  if (!profile) {
    return null;
  }

  // Calculate number of tabs to display for grid
  const numTabs = [
    true, // Profile tab always shown
    true, // Calendar tab
    isMentor, // Mentor tab
    true, // Bookmarks tab
    isAdmin, // Wallet tab (only for admin)
    true, // Settings tab
  ].filter(Boolean).length;

  return (
    <Tabs 
      defaultValue={defaultTab}
      className="col-span-5"
      onValueChange={onTabChange}
    >
      <TabsList className="grid w-full" style={{ 
        gridTemplateColumns: `repeat(${numTabs}, minmax(0, 1fr))`
      }}>
        <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        
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

        {isAdmin && (
          <TabsTrigger value="wallet" className="flex flex-col sm:flex-row items-center gap-1">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Wallet</span>
          </TabsTrigger>
        )}
        
        <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab profile={profile} />
      </TabsContent>

      <TabsContent value="calendar">
        <CalendarTab profile={profile} />
      </TabsContent>

      {isMentor && profile && (
        <TabsContent value="mentor">
          <MentorTab profile={profile} />
        </TabsContent>
      )}

      <TabsContent value="bookmarks">
        <BookmarksTabWrapper />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="wallet">
          <WalletTab profile={profile} />
        </TabsContent>
      )}

      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}
