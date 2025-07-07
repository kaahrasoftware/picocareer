
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Profile } from "@/types/database/profiles";

interface MentorProfileTabsProps {
  profile: Profile;
  isEditing?: boolean;
  onTabChange?: (value: string) => void;
}

export function MentorProfileTabs({ profile, isEditing = false, onTabChange }: MentorProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="sessions">Sessions</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4 mt-6">
        <div className="p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Mentor Overview</h3>
          <p className="text-muted-foreground">
            Welcome to your mentor dashboard. Here you can view your mentoring statistics, 
            upcoming sessions, and recent activity.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="sessions" className="space-y-4 mt-6">
        <div className="p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Sessions</h3>
          <p className="text-muted-foreground">
            Manage your mentoring sessions, view upcoming appointments, and track your session history.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="availability" className="space-y-4 mt-6">
        <div className="p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Availability</h3>
          <p className="text-muted-foreground">
            Set your available time slots for mentoring sessions and manage your calendar preferences.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4 mt-6">
        <div className="p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <p className="text-muted-foreground">
            Configure your mentor profile settings, notification preferences, and account details.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
