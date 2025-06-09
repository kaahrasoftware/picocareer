
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorBookmarks } from "./MentorBookmarks";
import { CareerBookmarks } from "./CareerBookmarks";
import { MajorBookmarks } from "./MajorBookmarks";
import { ScholarshipBookmarks } from "./ScholarshipBookmarks";
import { OpportunityBookmarks } from "./OpportunityBookmarks";
import { Button } from "@/components/ui/button";
import { useUserBookmarks } from "@/hooks/useUserBookmarks";
import { toast } from "sonner";

interface BookmarksTabWrapperProps {
  profileId: string;
}

export function BookmarksTabWrapper({ profileId }: BookmarksTabWrapperProps) {
  const { data: bookmarks, isLoading, error, refetch } = useUserBookmarks(profileId);
  const [activeTab, setActiveTab] = useState<string>("mentors");

  useEffect(() => {
    if (error) {
      toast.error("Failed to load bookmarks");
      console.error("Bookmarks error:", error);
    }
  }, [error]);

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      // Delete logic will go here
      await refetch();
      toast.success("Bookmark removed");
    } catch (error) {
      toast.error("Failed to remove bookmark");
      console.error("Delete bookmark error:", error);
    }
  };

  const getFilteredBookmarks = (contentType: string) => {
    if (!bookmarks) return [];
    
    // Filter and ensure content_type exists before comparing
    return bookmarks.filter(bookmark => {
      if (!bookmark) return false;
      if (typeof bookmark !== 'object') return false;
      
      // Safely check properties
      const bookmarkContentType = bookmark.content_type !== undefined ? bookmark.content_type : null;
      const bookmarkContentId = bookmark.content_id !== undefined ? bookmark.content_id : null;
      
      return bookmarkContentType === contentType && bookmarkContentId !== null;
    });
  };

  return (
    <Tabs
      defaultValue="mentors"
      className="w-full"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <div className="flex justify-between items-center mb-4">
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="majors">Majors</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <TabsContent value="mentors">
        <MentorBookmarks 
          bookmarks={getFilteredBookmarks("mentors")} 
          onDelete={handleDeleteBookmark}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="careers">
        <CareerBookmarks 
          bookmarks={getFilteredBookmarks("careers")} 
          onDelete={handleDeleteBookmark}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="majors">
        <MajorBookmarks 
          bookmarks={getFilteredBookmarks("majors")} 
          onDelete={handleDeleteBookmark}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="scholarships">
        <ScholarshipBookmarks 
          bookmarks={getFilteredBookmarks("scholarships")} 
          onDelete={handleDeleteBookmark}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="opportunities">
        <OpportunityBookmarks 
          bookmarks={getFilteredBookmarks("opportunities")} 
          onDelete={handleDeleteBookmark}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
