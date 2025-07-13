
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityBookmarks } from "./OpportunityBookmarks";
import { CareerBookmarks } from "./CareerBookmarks";
import { MentorBookmarks } from "./MentorBookmarks";
import { MajorBookmarks } from "./MajorBookmarks";
import { ScholarshipBookmarks } from "./ScholarshipBookmarks";

export function BookmarksTabWrapper() {
  const [activePage, setActivePage] = useState("opportunities");

  const handleViewCareerDetails = (career: any) => {
    // Handle career details view
    console.log('View career details:', career);
  };

  const handleViewMentorProfile = (mentor: any) => {
    // Handle mentor profile view
    console.log('View mentor profile:', mentor);
  };

  const handleViewMajorDetails = (major: any) => {
    // Handle major details view
    console.log('View major details:', major);
  };

  return (
    <div className="w-full">
      <Tabs value={activePage} onValueChange={setActivePage} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="majors">Majors</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        </TabsList>
        
        <TabsContent value="opportunities" className="mt-6">
          <OpportunityBookmarks activePage={activePage} />
        </TabsContent>
        
        <TabsContent value="careers" className="mt-6">
          <CareerBookmarks 
            activePage={activePage} 
            onViewCareerDetails={handleViewCareerDetails}
          />
        </TabsContent>
        
        <TabsContent value="mentors" className="mt-6">
          <MentorBookmarks 
            activePage={activePage}
            onViewMentorProfile={handleViewMentorProfile}
          />
        </TabsContent>
        
        <TabsContent value="majors" className="mt-6">
          <MajorBookmarks 
            activePage={activePage}
            onViewMajorDetails={handleViewMajorDetails}
          />
        </TabsContent>
        
        <TabsContent value="scholarships" className="mt-6">
          <ScholarshipBookmarks activePage={activePage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
