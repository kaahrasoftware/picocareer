
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenteeProfileTab } from './tabs/MenteeProfileTab';
import { MenteeEducationTab } from './tabs/MenteeEducationTab';
import { MenteeProjectsTab } from './tabs/MenteeProjectsTab';
import { MenteeEssaysTab } from './tabs/MenteeEssaysTab';
import { MenteeInterestsTabEnhanced } from './tabs/MenteeInterestsTabEnhanced';
import type { Profile } from "@/types/database/profiles";

interface MenteeProfileTabsProps {
  profile: Profile;
  isEditing: boolean;
}

export function MenteeProfileTabs({ profile, isEditing }: MenteeProfileTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="essays">Essays</TabsTrigger>
        <TabsTrigger value="interests">Interests</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <MenteeProfileTab profile={profile} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="education" className="space-y-4">
        <MenteeEducationTab profileId={profile.id} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="projects" className="space-y-4">
        <MenteeProjectsTab profileId={profile.id} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="essays" className="space-y-4">
        <MenteeEssaysTab profileId={profile.id} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="interests" className="space-y-4">
        <MenteeInterestsTabEnhanced profileId={profile.id} isEditing={isEditing} />
      </TabsContent>
    </Tabs>
  );
}
