
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareerBookmarks } from "./CareerBookmarks";
import { MajorBookmarks } from "./MajorBookmarks";
import { MentorBookmarks } from "./MentorBookmarks";
import { ScholarshipBookmarks } from "./ScholarshipBookmarks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookmarksTabWrapperProps {
  profileId: string;
}

interface Bookmark {
  content_id: string;
  content_type: string;
}

export function BookmarksTabWrapper({ profileId }: BookmarksTabWrapperProps) {
  const [activeTab, setActiveTab] = useState("careers");

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('content_id, content_type')
        .eq('user_id', profileId);
      
      if (error) throw error;
      return data as Bookmark[];
    },
    enabled: !!profileId,
  });

  const careerBookmarks = bookmarks.filter(b => b.content_type === 'career');
  const majorBookmarks = bookmarks.filter(b => b.content_type === 'major');
  const mentorBookmarks = bookmarks.filter(b => b.content_type === 'mentor');
  const scholarshipBookmarks = bookmarks.filter(b => b.content_type === 'scholarship');

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
            Careers ({careerBookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="majors">
            Majors ({majorBookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="mentors">
            Mentors ({mentorBookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="scholarships">
            Scholarships ({scholarshipBookmarks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="careers" className="mt-6">
          <CareerBookmarks 
            bookmarkIds={careerBookmarks.map(b => b.content_id)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="majors" className="mt-6">
          <MajorBookmarks 
            bookmarkIds={majorBookmarks.map(b => b.content_id)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="mentors" className="mt-6">
          <MentorBookmarks 
            bookmarkIds={mentorBookmarks.map(b => b.content_id)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="scholarships" className="mt-6">
          <ScholarshipBookmarks 
            bookmarkIds={scholarshipBookmarks.map(b => b.content_id)}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
