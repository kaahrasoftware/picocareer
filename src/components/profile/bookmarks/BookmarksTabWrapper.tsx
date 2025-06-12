
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityBookmarks } from "./OpportunityBookmarks";
import { CareerBookmarks } from "./CareerBookmarks";
import { MentorBookmarks } from "./MentorBookmarks";
import { MajorBookmarks } from "./MajorBookmarks";

export function BookmarksTabWrapper() {
  const [activePage, setActivePage] = useState("opportunities");

  return (
    <div className="w-full">
      <Tabs value={activePage} onValueChange={setActivePage} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="majors">Majors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="opportunities" className="mt-6">
          <OpportunityBookmarks activePage={activePage} />
        </TabsContent>
        
        <TabsContent value="careers" className="mt-6">
          <CareerBookmarks activePage={activePage} />
        </TabsContent>
        
        <TabsContent value="mentors" className="mt-6">
          <MentorBookmarks activePage={activePage} />
        </TabsContent>
        
        <TabsContent value="majors" className="mt-6">
          <MajorBookmarks activePage={activePage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
