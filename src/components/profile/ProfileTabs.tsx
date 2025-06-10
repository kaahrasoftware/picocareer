
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { BookmarksTab } from "@/components/profile/BookmarksTab";
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
import { useMobileMenu } from "@/context/MobileMenuContext";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ProfileTabsProps {
  profile: Profile | null;
  isMentor: boolean;
  onTabChange: (value: string) => void;
}

export function ProfileTabs({ profile, isMentor, onTabChange }: ProfileTabsProps) {
  const { session } = useAuthSession();
  const isAdmin = profile?.user_type === 'admin';
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const defaultTab = tabFromUrl || 'profile';
  const { closeMobileMenu } = useMobileMenu();

  const handleTabChange = (value: string) => {
    onTabChange(value);
    closeMobileMenu();
  };

  // Calculate number of tabs to display for grid - use session data as fallback
  const showMentorTab = isMentor || (session?.user && !profile); // Show if mentor or if profile not loaded yet
  const showWalletTab = isAdmin || (session?.user && !profile); // Show if admin or if profile not loaded yet
  
  const numTabs = [
    true, // Profile tab always shown
    true, // Calendar tab
    showMentorTab, // Mentor tab
    true, // Bookmarks tab
    showWalletTab, // Wallet tab (for admin)
    true, // Settings tab
  ].filter(Boolean).length;

  return (
    <Tabs 
      defaultValue={defaultTab}
      className="col-span-5"
      onValueChange={handleTabChange}
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
        
        {showMentorTab && (
          <TabsTrigger value="mentor" className="flex flex-col sm:flex-row items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Mentor</span>
          </TabsTrigger>
        )}
        
        <TabsTrigger value="bookmarks" className="flex flex-col sm:flex-row items-center gap-1">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">Bookmarks</span>
        </TabsTrigger>

        {showWalletTab && (
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

      {showMentorTab && (
        <TabsContent value="mentor">
          <MentorTab profile={profile} />
        </TabsContent>
      )}

      <TabsContent value="bookmarks">
        <BookmarksTab />
      </TabsContent>

      {showWalletTab && (
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
