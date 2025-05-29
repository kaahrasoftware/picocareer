
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareerBookmarks } from "./CareerBookmarks";
import { MajorBookmarks } from "./MajorBookmarks";
import { MentorBookmarks } from "./MentorBookmarks";
import { ScholarshipBookmarks } from "./ScholarshipBookmarks";

export interface BookmarksTabWrapperProps {
  profileId: string;
}

export function BookmarksTabWrapper({ profileId }: BookmarksTabWrapperProps) {
  const [activeTab, setActiveTab] = useState("careers");

  // Since we don't have a bookmarks table, we'll show empty state for now
  const bookmarkIds: string[] = [];
  const isLoading = false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookmarks</h2>
        <p className="text-muted-foreground">
          Your saved content across PicoCareer
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="careers">
            Careers (0)
          </TabsTrigger>
          <TabsTrigger value="majors">
            Majors (0)
          </TabsTrigger>
          <TabsTrigger value="mentors">
            Mentors (0)
          </TabsTrigger>
          <TabsTrigger value="scholarships">
            Scholarships (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="careers" className="mt-6">
          <CareerBookmarks 
            bookmarkIds={bookmarkIds}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="majors" className="mt-6">
          <MajorBookmarks 
            bookmarkIds={bookmarkIds}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="mentors" className="mt-6">
          <MentorBookmarks 
            bookmarkIds={bookmarkIds}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="scholarships" className="mt-6">
          <ScholarshipBookmarks 
            bookmarkIds={bookmarkIds}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
