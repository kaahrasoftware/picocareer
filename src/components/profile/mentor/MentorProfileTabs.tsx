
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Profile } from "@/types/database/profiles";

interface MentorProfileTabsProps {
  profile: Profile;
  isEditing?: boolean;
}

export function MentorProfileTabs({ profile, isEditing = false }: MentorProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="sessions">Sessions</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="p-4">
          <h3 className="text-lg font-semibold">Mentor Overview</h3>
          <p className="text-muted-foreground">Mentor profile overview content</p>
        </div>
      </TabsContent>
      
      <TabsContent value="sessions" className="space-y-4">
        <div className="p-4">
          <h3 className="text-lg font-semibold">Sessions</h3>
          <p className="text-muted-foreground">Session management content</p>
        </div>
      </TabsContent>
      
      <TabsContent value="availability" className="space-y-4">
        <div className="p-4">
          <h3 className="text-lg font-semibold">Availability</h3>
          <p className="text-muted-foreground">Availability management content</p>
        </div>
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <div className="p-4">
          <h3 className="text-lg font-semibold">Settings</h3>
          <p className="text-muted-foreground">Mentor settings content</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
