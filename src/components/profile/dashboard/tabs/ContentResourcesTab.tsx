
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, Award, Calendar, Bookmark } from "lucide-react";
import { ScholarshipManagementTab } from "./ScholarshipManagementTab";
import { EventManagementTab } from "./EventManagementTab";
import { OpportunitiesManagementTab } from "./opportunities/OpportunitiesManagementTab";

export function ContentResourcesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Content Resources</h2>
      </div>
      
      <Tabs defaultValue="blogs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Scholarships
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Opportunities
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="blogs">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Blogs Management</h3>
            {/* Add blogs management UI */}
            <p className="text-muted-foreground">Manage blog posts, categories, authors, and publication status.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="videos">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Videos Management</h3>
            {/* Add videos management UI */}
            <p className="text-muted-foreground">Manage video content, categories, creators, and engagement metrics.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="scholarships">
          <ScholarshipManagementTab />
        </TabsContent>
        
        <TabsContent value="events">
          <EventManagementTab />
        </TabsContent>
        
        <TabsContent value="opportunities">
          <OpportunitiesManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
