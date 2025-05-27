
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CareerBookmarks } from './CareerBookmarks';
import { MajorBookmarks } from './MajorBookmarks';
import { MentorBookmarks } from './MentorBookmarks';
import { ScholarshipBookmarks } from './ScholarshipBookmarks';

interface BookmarksTabWrapperProps {
  profileId: string;
}

interface Bookmark {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
}

export function BookmarksTabWrapper({ profileId }: BookmarksTabWrapperProps) {
  const [activeTab, setActiveTab] = useState('careers');

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['user-bookmarks', profileId],
    queryFn: async (): Promise<Bookmark[]> => {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id, content_type, content_id, created_at')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    const contentType = bookmark.content_type || 'unknown';
    if (!acc[contentType]) {
      acc[contentType] = [];
    }
    acc[contentType].push({
      content_id: bookmark.content_id || '',
      content_type: contentType
    });
    return acc;
  }, {} as Record<string, Array<{ content_id: string; content_type: string }>>);

  const careerBookmarks = groupedBookmarks.careers || [];
  const majorBookmarks = groupedBookmarks.majors || [];
  const mentorBookmarks = groupedBookmarks.mentors || [];
  const scholarshipBookmarks = groupedBookmarks.scholarships || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Bookmarks</h3>
        <p className="text-sm text-gray-600">
          Manage your saved content across different categories
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            bookmarks={careerBookmarks}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="majors" className="mt-6">
          <MajorBookmarks 
            bookmarks={majorBookmarks}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="mentors" className="mt-6">
          <MentorBookmarks 
            bookmarks={mentorBookmarks}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="scholarships" className="mt-6">
          <ScholarshipBookmarks 
            bookmarks={scholarshipBookmarks}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
