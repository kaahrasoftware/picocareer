
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ScholarshipBookmarks } from './ScholarshipBookmarks';
import { MentorBookmarks } from './MentorBookmarks';
import { CareerBookmarks } from './CareerBookmarks';
import { MajorBookmarks } from './MajorBookmarks';
import { OpportunityBookmarks } from './OpportunityBookmarks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export function BookmarksTabWrapper() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = useState('scholarships');

  const handleViewMentorProfile = (mentorId: string) => {
    // Navigate to mentor profile or open dialog
    console.log('View mentor profile:', mentorId);
  };

  const handleViewCareerDetails = (careerId: string) => {
    // Navigate to career details or open dialog
    console.log('View career details:', careerId);
  };

  const handleViewMajorDetails = (major: any) => {
    // Navigate to major details or open dialog
    console.log('View major details:', major);
  };

  const handleViewOpportunityDetails = (opportunityId: string) => {
    // Navigate to opportunity details or open dialog
    console.log('View opportunity details:', opportunityId);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Please sign in to view your bookmarks.</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        <TabsTrigger value="mentors">Mentors</TabsTrigger>
        <TabsTrigger value="careers">Careers</TabsTrigger>
        <TabsTrigger value="majors">Majors</TabsTrigger>
        <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
      </TabsList>

      <TabsContent value="scholarships">
        <ScholarshipBookmarks />
      </TabsContent>

      <TabsContent value="mentors">
        <MentorBookmarks 
          activePage={activeTab}
          onViewMentorProfile={handleViewMentorProfile}
        />
      </TabsContent>

      <TabsContent value="careers">
        <CareerBookmarks 
          activePage={activeTab}
          onViewCareerDetails={handleViewCareerDetails}
        />
      </TabsContent>

      <TabsContent value="majors">
        <MajorBookmarks 
          activePage={activeTab}
          onViewMajorDetails={handleViewMajorDetails}
        />
      </TabsContent>

      <TabsContent value="opportunities">
        <OpportunityBookmarks 
          activePage={activeTab}
          onViewOpportunityDetails={handleViewOpportunityDetails}
        />
      </TabsContent>
    </Tabs>
  );
}
