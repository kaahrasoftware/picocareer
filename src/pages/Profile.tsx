
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { useDefaultAvatar } from "@/hooks/useDefaultAvatar";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";
import { PageLoader } from "@/components/ui/page-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { CalendarTab } from "@/components/profile/CalendarTab";
import { DashboardTab } from "@/components/profile/DashboardTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { MentorTab } from "@/components/profile/MentorTab";
import { WalletTab } from "@/components/profile/WalletTab";
import { BookmarksTab } from "@/components/profile/BookmarksTab";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile, isLoading, error } = useUserProfile(session);
  const { handleTabChange } = useProfileAnalytics();
  const { isAdmin } = useIsAdmin();

  // Ensure user has a default avatar if they don't have one
  useDefaultAvatar(session?.user?.id, profile?.avatar_url);

  // Show loading state while profile data is being fetched
  if (isLoading) {
    return <div className="container py-6">
        <PageLoader isLoading={true} variant="default" />
      </div>;
  }

  // Show error state if profile fetch failed
  if (error) {
    return <div className="container py-6">
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Failed to load profile data</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            Retry
          </button>
        </div>
      </div>;
  }

  // Don't render components if profile is still null/undefined
  if (!profile) {
    return <div className="container py-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No profile data available</p>
        </div>
      </div>;
  }

  const isMentor = profile.user_type === 'mentor';
  const isStudent = profile.student_nonstudent === 'Student' || profile.user_type === 'mentee';
  
  // Calculate grid columns based on available tabs
  const tabCount = [
    true, // profile
    true, // calendar
    isAdmin,
    true, // settings
    isMentor,
    isStudent,
    true, // bookmarks
  ].filter(Boolean).length;
  
  const gridCols = Math.min(tabCount, 7);

  return <div className="container py-6 space-y-6">
      <ProfileHeader profile={profile} session={session} />
      
      <Tabs defaultValue="profile" className="w-full" onValueChange={handleTabChange}>
        <TabsList className={`grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-${gridCols} gap-1`}>
          <TabsTrigger value="profile" className="text-xs lg:text-sm">Profile</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs lg:text-sm">Calendar</TabsTrigger>
          {isAdmin && <TabsTrigger value="dashboard" className="text-xs lg:text-sm">Dashboard</TabsTrigger>}
          <TabsTrigger value="settings" className="text-xs lg:text-sm">Settings</TabsTrigger>
          {isMentor && <TabsTrigger value="mentor" className="text-xs lg:text-sm">Mentor</TabsTrigger>}
          {isStudent && <TabsTrigger value="student" className="text-xs lg:text-sm">Student</TabsTrigger>}
          <TabsTrigger value="bookmarks" className="text-xs lg:text-sm">Bookmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-6">
          <ProfileTab profile={profile} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-6">
          <CalendarTab profile={profile} />
        </TabsContent>

        {isAdmin && <TabsContent value="dashboard" className="space-y-4 mt-6">
            <DashboardTab />
          </TabsContent>}

        <TabsContent value="settings" className="space-y-4 mt-6">
          <SettingsTab profileId={profile.id} />
        </TabsContent>

        {isMentor && <TabsContent value="mentor" className="space-y-4 mt-6">
            <MentorTab profile={profile} />
          </TabsContent>}

        {isStudent && <TabsContent value="student" className="space-y-4 mt-6">
            <ProfileTabs profile={profile} context="student" />
          </TabsContent>}

        <TabsContent value="wallet" className="space-y-4 mt-6">
          <WalletTab />
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4 mt-6">
          <BookmarksTab />
        </TabsContent>
      </Tabs>
    </div>;
}
