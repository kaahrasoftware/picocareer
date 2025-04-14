
import React from 'react';  // Explicitly import React to ensure hooks work correctly
import { Bookmark, GraduationCap, Briefcase, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorBookmarks } from './MentorBookmarks';
import { CareerBookmarks } from './CareerBookmarks';
import { MajorBookmarks } from './MajorBookmarks';
import { ScholarshipBookmarks } from './ScholarshipBookmarks';

export function BookmarksTabWrapper() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">My Bookmarks</h2>
      </div>

      <Tabs defaultValue="mentors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mentors" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Mentors
          </TabsTrigger>
          <TabsTrigger value="careers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Careers
          </TabsTrigger>
          <TabsTrigger value="majors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Majors
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Scholarships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-6">
          <MentorBookmarks />
        </TabsContent>

        <TabsContent value="careers" className="space-y-6">
          <CareerBookmarks />
        </TabsContent>

        <TabsContent value="majors" className="space-y-6">
          <MajorBookmarks />
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-6">
          <ScholarshipBookmarks />
        </TabsContent>
      </Tabs>
    </div>
  );
}
