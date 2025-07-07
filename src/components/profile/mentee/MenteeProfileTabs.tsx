
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
  onTabChange?: (value: string) => void;
}

export function MenteeProfileTabs({ profile, isEditing = false, onTabChange }: MenteeProfileTabsProps) {
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
    <Tabs defaultValue="basic-info" className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
        <TabsTrigger value="basic-info" className="text-xs lg:text-sm">Basic Info</TabsTrigger>
        <TabsTrigger value="education" className="text-xs lg:text-sm">Education</TabsTrigger>
        <TabsTrigger value="interests" className="text-xs lg:text-sm">Interests</TabsTrigger>
        <TabsTrigger value="academics" className="text-xs lg:text-sm">Academics</TabsTrigger>
        <TabsTrigger value="courses" className="text-xs lg:text-sm">Courses</TabsTrigger>
        <TabsTrigger value="projects" className="text-xs lg:text-sm">Projects</TabsTrigger>
        <TabsTrigger value="essays" className="text-xs lg:text-sm">Essays</TabsTrigger>
      </TabsList>

      <TabsContent value="basic-info" className="space-y-4 mt-6">
        <MenteeBasicInfoTab 
          profile={profile} 
          isEditing={editingTab === 'basic-info'} 
          onEdit={() => handleEdit('basic-info')}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </TabsContent>

      <TabsContent value="education" className="space-y-4 mt-6">
        <MenteeEducationTab profileId={profile.id} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="interests" className="space-y-4 mt-6">
        <MenteeInterestsTabEnhanced menteeId={profile.id} />
      </TabsContent>

      <TabsContent value="academics" className="space-y-4 mt-6">
        <MenteeAcademicsTab profile={profile} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="courses" className="space-y-4 mt-6">
        <MenteeCoursesTab profile={profile} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="projects" className="space-y-4 mt-6">
        <MenteeProjectsTab profileId={profile.id} isEditing={isEditing} />
      </TabsContent>

      <TabsContent value="essays" className="space-y-4 mt-6">
        <MenteeEssaysTab profileId={profile.id} />
      </TabsContent>
    </Tabs>
  );
}
