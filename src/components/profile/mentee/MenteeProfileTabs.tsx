
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BookOpen, GraduationCap, FileText, Target, BarChart3 } from "lucide-react";
import type { Profile } from "@/types/database/profiles";
import { MenteeBasicInfoTab } from "./tabs/MenteeBasicInfoTab";
import { MenteeCoursesTab } from "./tabs/MenteeCoursesTab";
import { MenteeProjectsTab } from "./tabs/MenteeProjectsTab";
import { MenteeEssaysTab } from "./tabs/MenteeEssaysTab";
import { MenteeInterestsTab } from "./tabs/MenteeInterestsTab";
import { MenteeAcademicsTab } from "./tabs/MenteeAcademicsTab";

interface MenteeProfileTabsProps {
  profile: Profile;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function MenteeProfileTabs({ profile, isEditing, onEditToggle }: MenteeProfileTabsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onEditToggle}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="academics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Academics</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="essays" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Essays</span>
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Interests</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="basic">
            <MenteeBasicInfoTab profile={profile} isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="academics">
            <MenteeAcademicsTab profile={profile} isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="courses">
            <MenteeCoursesTab profile={profile} isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="projects">
            <MenteeProjectsTab profileId={profile.id} />
          </TabsContent>

          <TabsContent value="essays">
            <MenteeEssaysTab profileId={profile.id} />
          </TabsContent>

          <TabsContent value="interests">
            <MenteeInterestsTab profile={profile} isEditing={isEditing} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
