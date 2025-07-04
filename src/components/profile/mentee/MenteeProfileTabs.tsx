
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenteeBasicInfoTab } from './tabs/MenteeBasicInfoTab';
import { MenteeEducationTab } from './tabs/MenteeEducationTab';
import { MenteeInterestsTabEnhanced } from './tabs/MenteeInterestsTabEnhanced';
import { MenteeAcademicsTab } from './tabs/MenteeAcademicsTab';
import { MenteeCoursesTab } from './tabs/MenteeCoursesTab';
import { MenteeProjectsTab } from './tabs/MenteeProjectsTab';
import { MenteeEssaysTab } from './tabs/MenteeEssaysTab';
import type { Profile } from "@/types/database/profiles";

interface MenteeProfileTabsProps {
  profile: Profile;
  isEditing?: boolean;
}

export function MenteeProfileTabs({ profile, isEditing = false }: MenteeProfileTabsProps) {
  const [editingTab, setEditingTab] = useState<string | null>(null);

  const handleEdit = (tab: string) => {
    setEditingTab(tab);
  };

  const handleSave = () => {
    setEditingTab(null);
  };

  const handleCancel = () => {
    setEditingTab(null);
  };

  return (
    <Tabs defaultValue="basic-info" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="interests">Interests</TabsTrigger>
        <TabsTrigger value="academics">Academics</TabsTrigger>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="essays">Essays</TabsTrigger>
      </TabsList>

      <TabsContent value="basic-info" className="space-y-4">
        <MenteeBasicInfoTab 
          profile={profile} 
          isEditing={editingTab === 'basic-info'} 
          onEdit={() => handleEdit('basic-info')}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </TabsContent>

      <TabsContent value="education" className="space-y-4">
        <MenteeEducationTab profileId={profile.id} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="interests" className="space-y-4">
        <MenteeInterestsTabEnhanced menteeId={profile.id} />
      </TabsContent>

      <TabsContent value="academics" className="space-y-4">
        <MenteeAcademicsTab profile={profile} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="courses" className="space-y-4">
        <MenteeCoursesTab profile={profile} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="projects" className="space-y-4">
        <MenteeProjectsTab profileId={profile.id} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="essays" className="space-y-4">
        <MenteeEssaysTab profileId={profile.id} />
      </TabsContent>
    </Tabs>
  );
}
